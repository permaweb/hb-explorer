import React from 'react';
import { ReactSVG } from 'react-svg';
import * as d3 from 'd3';
import { ungzip } from 'pako';
import { useTheme } from 'styled-components';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import SpriteText from 'three-spritetext';

import { Button } from 'components/atoms/Button';
import { Copyable } from 'components/atoms/Copyable';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Panel } from 'components/atoms/Panel';
import { Editor } from 'components/molecules/Editor';
import { ASSETS, HB_ENDPOINTS } from 'helpers/config';
import { formatAddress } from 'helpers/utils';

import * as S from './styles';

declare global {
	interface Window {
		THREE: any;
		GraphController: any;
		SpriteText: any;
		d3: any;
		ThemeManager?: any;
		SceneManager?: any;
		DataManager?: any;
	}
}

function extractBytes(erlangBlob: string): Uint8Array {
	// erlangBlob looks like `{ok,<<31,139,8,...>>}` (may have newlines/spaces)
	const m = erlangBlob.match(/<<([\s\S]*?)>>/);
	if (!m) throw new Error('Could not find <<...>> blob');
	const bytes = m[1]
		.split(/[\s,]+/) // split on commas and whitespace
		.filter(Boolean)
		.map((n) => {
			const num = Number(n);
			if (!Number.isFinite(num) || num < 0 || num > 255) {
				throw new Error(`Invalid byte: ${n}`);
			}
			return num;
		});
	return new Uint8Array(bytes);
}

function gunzipToString(arr: Uint8Array): string {
	const inflated = ungzip(arr); // returns Uint8Array
	return new TextDecoder('utf-8').decode(inflated);
}

/**
 * Cleans up Erlang formatting patterns from data strings
 * Removes {ok, ...} wrappers, ok ==> { ... } wrappers, and standalone ok: prefixes
 */
function cleanErlangFormatting(data: any): any {
	if (typeof data !== 'string') return data;

	let cleaned = data;

	// Remove ok ==> \n ... { ... } wrapper (multiline support with newlines and whitespace)
	cleaned = cleaned.replace(/^\s*ok\s*==>\s*[\r\n\s]*/, '');

	// Remove outer { ... } if present
	cleaned = cleaned.replace(/^\s*\{([\s\S]*)\}\s*$/, '$1');

	// Remove {ok, ...} wrapper
	cleaned = cleaned.replace(/^\s*ok\s*,\s*/, '');

	// Remove standalone ok: prefix
	cleaned = cleaned.replace(/^\s*ok\s*:\s*/, '');

	return cleaned.trim();
}

/**
 * Returns true iff `dataStr` contains an Erlang-style numeric binary (<<...>>)
 * whose first three bytes match gzip: 0x1f, 0x8b, 0x08.
 *
 * Accepts inputs like: "{ok,<<31,139,8,0,...>>}" (with spaces/newlines allowed).
 * Rejects string bitstrings like: '{ok,<<"1">>}' or '{ok,<<"http://...">>}'.
 */
export function isBinary(dataStr) {
	if (typeof dataStr !== 'string') return false;

	// Pull out the << ... >> portion
	const m = dataStr.match(/<<([\s\S]*?)>>/);
	if (!m) return false;

	const inner = m[1].trim();

	// If it starts with a quote, it's a string bitstring: <<"abc">>
	if (inner.startsWith('"') || inner.startsWith("'")) return false;

	// Parse decimal byte list: 0..255, allow whitespace and newlines
	const parts = inner.split(/[\s,]+/).filter(Boolean);
	if (parts.length < 3) return false;

	const bytes = [];
	for (const p of parts) {
		// Disallow non-integers / out-of-range / hex etc.
		if (!/^-?\d+$/.test(p)) return false;
		const n = Number(p);
		if (!Number.isInteger(n) || n < 0 || n > 255) return false;
		bytes.push(n);
	}

	// Gzip header check: 0x1f 0x8b 0x08 (deflate)
	return bytes[0] === 0x1f && bytes[1] === 0x8b && bytes[2] === 0x08;
}

export default function HyperLinks(props: { id?: string; path: string; onError?: (hasError: boolean) => void }) {
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const graphControllerRef = React.useRef<any>(null);
	const scriptLoadedRef = React.useRef(false);

	const theme = useTheme() as any;

	const [data, setData] = React.useState<any>(null);
	const [scriptLoaded, setScriptLoaded] = React.useState(false);
	const [graphReady, setGraphReady] = React.useState<number>(0);
	const [viewType, setViewType] = React.useState<'table' | 'graph'>('table');

	const [activeNode, setActiveNode] = React.useState<any | null>(null);
	const [showActiveData, setShowActiveData] = React.useState<boolean>(false);
	const [activeData, setActiveData] = React.useState<any>(null);
	const [isFullScreen, setIsFullScreen] = React.useState<boolean>(false);
	const [showLabels, setShowLabels] = React.useState<boolean>(true);

	const [currentFilter, setCurrentFilter] = React.useState<string>('');
	const [currentFilters, setCurrentFilters] = React.useState<string[]>([]);

	const [debugInfo, setDebugInfo] = React.useState({
		fps: 0,
		nodes: { visible: 0, total: 0 },
		links: 0,
		gridCells: 0,
		gridObjects: 0,
		avgPerCell: 0,
		cameraPosition: { x: 0, y: 0, z: 0 },
	});

	// Listen for fullscreen changes
	React.useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullScreen(
				Boolean(
					document.fullscreenElement ||
						(document as any).webkitFullscreenElement ||
						(document as any).msFullscreenElement
				)
			);
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);
		document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
		document.addEventListener('msfullscreenchange', handleFullscreenChange);

		return () => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
			document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
			document.removeEventListener('msfullscreenchange', handleFullscreenChange);
		};
	}, []);

	// Update renderer size when fullscreen changes or data panel opens/closes
	React.useEffect(() => {
		if (graphControllerRef.current?.sceneManager) {
			// Small delay to allow DOM to update
			setTimeout(() => {
				graphControllerRef.current.sceneManager.onWindowResize();
			}, 100);
		}
	}, [isFullScreen, showActiveData, activeData]);

	React.useEffect(() => {
		(async function () {
			if (props.path) {
				try {
					const cacheRes = await fetch(`${window.hyperbeamUrl}/${props.path}${HB_ENDPOINTS.cache}`);
					if (cacheRes.status === 404 && props.onError) {
						props.onError(true);
						setData({});
					} else {
						if (props.onError) props.onError(false);

						const resData = await cacheRes.json();

						if (resData.nodes && resData.links && Array.isArray(resData.nodes) && Array.isArray(resData.links)) {
							const transformedData = {
								nodes: resData.nodes.map((node: any) => ({
									id: node.id,
									label:
										resData.links.find((link: any) => link.target === node.id)?.label ?? formatAddress(node.id, false),
									type: node.type || 'simple',
									data: node.data,
								})),
								links: resData.links.map((link: any) => ({
									source: link.source,
									target: link.target,
									label: link.label || '',
									data: link.data,
								})),
							};
							setData(transformedData);
						} else setData({});
					}
				} catch (e: any) {
					console.error(e);
					if (props.onError) props.onError(true);
					setData({});
				}
			}
		})();
	}, [props.path, theme]);

	React.useEffect(() => {
		if (!graphControllerRef.current?.dataManager || !data?.nodes) return;

		if (currentFilters.length === 0) {
			// Show all nodes and links when no filters applied
			data.nodes.forEach((node: any) => {
				const nodeObj = graphControllerRef.current.dataManager.graphObjects.nodes.get(node.id);
				if (nodeObj?.object) {
					nodeObj.object.visible = true;
				}
			});
			// Iterate through all link objects directly
			graphControllerRef.current.dataManager.graphObjects.links.forEach((linkObj: any) => {
				if (linkObj?.object) {
					linkObj.object.visible = true;
				}
			});
		} else {
			// Filter nodes based on current filters (partial match support)
			const matchingNodeIds = new Set<string>();

			data.nodes.forEach((node: any) => {
				const nodeObj = graphControllerRef.current.dataManager.graphObjects.nodes.get(node.id);
				if (!nodeObj?.object) return;

				const matchesFilter = currentFilters.some((filter) => {
					const filterLower = filter.toLowerCase();
					const labelMatch = node.label?.toLowerCase().includes(filterLower);
					const dataMatch = typeof node.data === 'string' && node.data.toLowerCase().includes(filterLower);
					const idMatch = node.id?.toLowerCase().includes(filterLower);
					return labelMatch || dataMatch || idMatch;
				});

				nodeObj.object.visible = matchesFilter;
				if (matchesFilter) {
					matchingNodeIds.add(node.id);
				}
			});

			// Hide links that don't connect two visible nodes
			graphControllerRef.current.dataManager.graphObjects.links.forEach((linkObj: any) => {
				if (linkObj?.object) {
					const sourceVisible = matchingNodeIds.has(linkObj.sourceId);
					const targetVisible = matchingNodeIds.has(linkObj.targetId);
					linkObj.object.visible = sourceVisible && targetVisible;
				}
			});
		}
	}, [data, currentFilters, graphReady]);

	React.useEffect(() => {
		if (data && data.nodes && data.nodes.length > 0 && !activeNode) {
			const rootNode = data.nodes.find((node: any) => node.type === 'composite');
			setActiveNode(rootNode || data.nodes[0]);
		}
	}, [data, activeNode]);

	React.useEffect(() => {
		if (isBinary(activeNode?.data)) {
			const bytes = extractBytes(activeNode.data);
			const text = gunzipToString(bytes);
			setActiveData(text);
		} else {
			const data = cleanErlangFormatting(activeNode?.data ?? '-');
			setActiveData(data);
		}
	}, [activeNode]);

	React.useEffect(() => {
		const loadGraphScript = async () => {
			if (scriptLoadedRef.current) {
				return;
			}

			// Make libraries globally available
			// Create an extended THREE object with OrbitControls
			const ExtendedTHREE = { ...THREE, OrbitControls };
			window.THREE = ExtendedTHREE;
			window.SpriteText = SpriteText;
			window.d3 = d3;

			try {
				const { default: initializeHyperBEAMGraph } = await import('./hyperbeam-graph');
				initializeHyperBEAMGraph();

				scriptLoadedRef.current = true;
				setScriptLoaded(true);
			} catch (error) {
				console.error('Graph: Failed to load graph script:', error);
			}
		};

		loadGraphScript();
	}, []);

	React.useEffect(() => {
		if (!containerRef.current || !scriptLoadedRef.current || !window.GraphController || viewType !== 'graph') {
			return;
		}

		if (graphControllerRef.current) {
			graphControllerRef.current.destroy?.();
			graphControllerRef.current = null;
		}

		const containerId = `graph-container-${Math.random().toString(36).substring(2, 9)}`;
		containerRef.current.id = containerId;

		if (data.nodes.length === 0) {
			return;
		}

		try {
			const controller = new window.GraphController(containerId, theme);
			graphControllerRef.current = controller;

			if (controller.dataManager) {
				controller.dataManager.graphData = data;

				data.nodes.forEach((node: any) => {
					if (!controller.dataManager.graphObjects.nodes.has(node.id)) {
						controller.graphObjectManager.createNodeObject(node);
					}
				});

				data.links.forEach((link: any) => {
					if (!controller.dataManager.graphObjects.links.has(`${link.source}-${link.target}`)) {
						controller.graphObjectManager.createLinkObject(link);
					}
				});

				// Use compact grid positioning instead of circular
				controller.positionNodesCompact();

				controller.simulationManager.updateSimulation(false);

				// Signal that graph is ready for filtering
				setGraphReady((prev) => prev + 1);
			}

			const debugInterval = setInterval(() => {
				if (controller) {
					collectDebugStats(controller);
				}
			}, 50); // Update every 50ms for more responsive debug info (20fps)

			controller.debugInterval = debugInterval;

			const handleNodeClickInternal = (nodeId: string) => {
				const nodeData = controller.dataManager?.graphData?.nodes?.find((n: any) => n.id === nodeId);
				if (nodeData) {
					handleNodeClick(nodeData);
				}
			};

			if (controller.eventManager) {
				const originalSelectNode = controller.eventManager.selectNode;
				controller.eventManager.selectNode = function (nodeId: string) {
					originalSelectNode.call(this, nodeId);
					handleNodeClickInternal(nodeId);
				};
			}
		} catch (error) {
			console.error('Failed to initialize graph:', error);
		}

		return () => {
			if (graphControllerRef.current) {
				// Clear debug interval
				if (graphControllerRef.current.debugInterval) {
					clearInterval(graphControllerRef.current.debugInterval);
				}
				graphControllerRef.current.destroy?.();
				graphControllerRef.current = null;
			}
		};
	}, [data, scriptLoaded, theme, viewType]);

	React.useEffect(() => {
		if (!graphControllerRef.current || !activeNode?.id) return;

		try {
			const controller = graphControllerRef.current;
			if (controller.eventManager && controller.eventManager.selectNode) {
				controller.eventManager.selectNode(activeNode?.id);
			}

			// Set the active node color to highlight it differently
			if (controller.graphObjectManager && controller.dataManager) {
				controller.graphObjectManager.setActiveNode(activeNode.id);
			}
		} catch (error) {
			console.error('Failed to select node:', error);
		}
	}, [activeNode?.id]);

	const collectDebugStats = React.useCallback((controller: any) => {
		if (!controller) return;

		const stats = {
			fps: controller.fps || 0,
			nodes: {
				visible: controller.dataManager?.graphObjects?.nodes?.size || 0,
				total: controller.dataManager?.graphData?.nodes?.length || 0,
			},
			links: controller.dataManager?.graphData?.links?.length || 0,
			gridCells: controller.spatialGrid?.grid?.size || 0,
			gridObjects: Array.from(controller.spatialGrid?.grid?.values() || []).reduce(
				(total: number, cellSet: any) => total + cellSet.size,
				0
			),
			avgPerCell: 0,
			cameraPosition: {
				x: Math.round(controller.sceneManager?.camera?.position?.x || 0),
				y: Math.round(controller.sceneManager?.camera?.position?.y || 0),
				z: Math.round(controller.sceneManager?.camera?.position?.z || 0),
			},
		};

		if (stats.gridCells > 0) {
			stats.avgPerCell = Math.round(((stats as any).gridObjects / stats.gridCells) * 10) / 10;
		}

		setDebugInfo(stats as any);
	}, []);

	const handleNodeClick = React.useCallback((nodeData: any) => {
		setActiveNode(nodeData);
	}, []);

	// Fullscreen functionality
	const wrapperRef = React.useRef<HTMLDivElement | null>(null);

	const handleFullscreen = React.useCallback(() => {
		// Target the entire wrapper component, not just the graph
		const targetElement = wrapperRef.current;

		if (!isFullScreen && targetElement) {
			// Enter fullscreen
			if (targetElement.requestFullscreen) {
				targetElement.requestFullscreen();
			} else if ((targetElement as any)?.webkitRequestFullscreen) {
				(targetElement as any).webkitRequestFullscreen();
			} else if ((targetElement as any)?.msRequestFullscreen) {
				(targetElement as any).msRequestFullscreen();
			}
		} else {
			// Exit fullscreen
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if ((document as any).webkitExitFullscreen) {
				(document as any).webkitExitFullscreen();
			} else if ((document as any).msExitFullscreen) {
				(document as any).msExitFullscreen();
			}
		}
	}, [isFullScreen]);

	const handleToggleLabels = React.useCallback(() => {
		const newShowLabels = !showLabels;
		setShowLabels(newShowLabels);

		// Update the graph controller to show/hide labels
		if (graphControllerRef.current?.themeManager) {
			graphControllerRef.current.themeManager.config.showLabels = newShowLabels;

			// Update all existing nodes to show/hide their labels
			if (graphControllerRef.current.graphObjectManager) {
				graphControllerRef.current.graphObjectManager.toggleLabelsVisibility(newShowLabels);
			}
		}
	}, [showLabels]);

	// Build tree structure from nodes and links
	const buildTreeStructure = React.useCallback(() => {
		if (!data?.nodes || !data?.links) return [];

		// Find root nodes (composite type or nodes with no incoming links)
		const targetIds = new Set(data.links.map((link: any) => link.target));
		const roots = data.nodes.filter((node: any) => node.type === 'composite' || !targetIds.has(node.id));

		// Build adjacency map for children
		const childrenMap = new Map<string, any[]>();
		data.links.forEach((link: any) => {
			if (!childrenMap.has(link.source)) {
				childrenMap.set(link.source, []);
			}
			const targetNode = data.nodes.find((n: any) => n.id === link.target);
			if (targetNode) {
				childrenMap.get(link.source)!.push({ ...targetNode, linkLabel: link.label });
			}
		});

		// Recursively build tree with depth info
		const buildNode = (node: any, depth: number, isLast: boolean, ancestorLines: boolean[]): any[] => {
			const children = childrenMap.get(node.id) || [];
			const hasChildren = children.length > 0;
			const result = [{ ...node, depth, isLast, ancestorLines: [...ancestorLines], hasChildren }];

			children.forEach((child: any, index: number) => {
				const isLastChild = index === children.length - 1;
				const newAncestorLines = [...ancestorLines, !isLast];
				result.push(...buildNode(child, depth + 1, isLastChild, newAncestorLines));
			});

			return result;
		};

		// Build tree from all roots
		return roots.flatMap((root: any) => buildNode(root, 0, true, []));
	}, [data]);

	const treeNodes = React.useMemo(() => buildTreeStructure(), [buildTreeStructure]);

	const filteredTreeNodes = React.useMemo(() => {
		if (currentFilters.length === 0) {
			return treeNodes;
		}

		return treeNodes.filter((node: any) => {
			return currentFilters.some((filter) => {
				const filterLower = filter.toLowerCase();
				const labelMatch = node.label?.toLowerCase().includes(filterLower);
				const dataMatch = typeof node.data === 'string' && node.data.toLowerCase().includes(filterLower);
				const idMatch = node.id?.toLowerCase().includes(filterLower);
				return labelMatch || dataMatch || idMatch;
			});
		});
	}, [treeNodes, currentFilters]);

	// Build a map of connected nodes relative to active node
	const connectedNodes = React.useMemo(() => {
		if (!activeNode || !data?.links) return new Set<string>();

		const connected = new Set<string>();
		connected.add(activeNode.id);

		// Find all nodes connected to active node (both directions)
		data.links.forEach((link: any) => {
			if (link.source === activeNode.id) {
				connected.add(link.target);
			}
			if (link.target === activeNode.id) {
				connected.add(link.source);
			}
		});

		return connected;
	}, [activeNode, data?.links]);

	function getView() {
		switch (viewType) {
			case 'table':
				return (
					<S.TableWrapper>
						<S.Table
							className={'border-wrapper-alt3 scroll-wrapper-hidden fade-in'}
							isFullScreen={isFullScreen}
							hasActiveData={showActiveData && !!activeData}
						>
							{filteredTreeNodes.map((node: any, index: number) => {
								const isActive = node?.id === activeNode?.id;
								const isConnected = connectedNodes.has(node.id);

								return (
									<S.TableRow key={`${node.id}-${index}`} depth={node.depth} onClick={() => setActiveNode(node)}>
										<S.ThreadLine>
											{node.ancestorLines.map((_showLine: boolean, i: number) => (
												<S.AncestorLine key={i} show={true} isConnected={isConnected} />
											))}
											{node.depth > 0 && (
												<>
													<S.HorizontalLine depth={node.depth} isConnected={isConnected} />
												</>
											)}
										</S.ThreadLine>
										<S.NodeContent depth={node.depth}>
											<S.NodeContentHeader
												background={isActive ? theme?.colors.editor.alt7 : theme.colors.container.alt8.background}
												hasChildren={node.hasChildren}
											>
												<div className={'indicator'} />
												<p>{node.label}</p>
											</S.NodeContentHeader>
											<S.NodeContentDetail
												background={
													node.type === 'composite' ? theme?.colors.editor.primary : theme?.colors.editor.alt4
												}
												hasChildren={node.hasChildren}
											>
												<div className={'indicator'} />
											</S.NodeContentDetail>
										</S.NodeContent>
									</S.TableRow>
								);
							})}
						</S.Table>
						{isFullScreen && showActiveData && activeData && (
							<S.FullScreenDataPanel>
								<S.DataPanelContent>
									<Editor initialData={activeData} loading={false} readOnly />
								</S.DataPanelContent>
							</S.FullScreenDataPanel>
						)}
					</S.TableWrapper>
				);
			case 'graph':
				return (
					<S.GraphWrapper>
						<S.Graph isFullScreen={isFullScreen} hasActiveData={showActiveData && !!activeData}>
							<S.GraphCanvas ref={(el: HTMLDivElement) => (containerRef.current = el)} />
						</S.Graph>
						{isFullScreen && showActiveData && activeData && (
							<S.FullScreenDataPanel>
								<S.DataPanelContent>
									<Editor initialData={activeData} loading={false} readOnly />
								</S.DataPanelContent>
							</S.FullScreenDataPanel>
						)}
					</S.GraphWrapper>
				);
		}
	}

	return data ? (
		<>
			{Object.keys(data).length > 0 ? (
				<S.Wrapper ref={wrapperRef} isFullScreen={isFullScreen}>
					<S.InfoWrapper className={'border-wrapper-alt3 fade-in'}>
						<S.InfoLine>
							<S.InfoBlockMaxWidth>
								<p>Cache:</p>
								<span>{props.path ?? '-'}</span>
							</S.InfoBlockMaxWidth>
							<S.InfoBlockFlex>
								<S.InfoBlockFlex>
									<S.InfoBlock>
										<p>Nodes:</p>
										<span>{data.nodes?.length ?? '-'}</span>
									</S.InfoBlock>
									<S.InfoBlock>
										<p>Links:</p>
										<span>{data.links?.length ?? '-'}</span>
									</S.InfoBlock>
								</S.InfoBlockFlex>
								<S.InfoBlockDivider />
								<S.InfoBlockFlex>
									<IconButton
										type={'alt1'}
										src={ASSETS.table}
										handlePress={() => setViewType('table')}
										active={viewType === 'table'}
										dimensions={{
											wrapper: 25,
											icon: 12.5,
										}}
										tooltip={'Table View'}
										tooltipPosition={'top-right'}
									/>
									<IconButton
										type={'alt1'}
										src={ASSETS.graph}
										handlePress={() => setViewType('graph')}
										active={viewType === 'graph'}
										dimensions={{
											wrapper: 25,
											icon: 12.5,
										}}
										tooltip={'Graph View'}
										tooltipPosition={'top-right'}
									/>
								</S.InfoBlockFlex>
								<S.InfoBlockDivider />
								<S.InfoBlockFlex>
									<IconButton
										type={'alt1'}
										src={ASSETS.label}
										handlePress={handleToggleLabels}
										disabled={viewType === 'table'}
										dimensions={{
											wrapper: 25,
											icon: 12.5,
										}}
										tooltip={showLabels ? 'Hide Labels' : 'Show Labels'}
										tooltipPosition={'top-right'}
									/>
									<IconButton
										type={'alt1'}
										src={ASSETS.fullscreen}
										handlePress={handleFullscreen}
										dimensions={{
											wrapper: 25,
											icon: 12.5,
										}}
										tooltip={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
										tooltipPosition={'top-right'}
									/>
								</S.InfoBlockFlex>
							</S.InfoBlockFlex>
						</S.InfoLine>
						<S.InfoLine>
							<S.InfoBlock>
								<S.FilterForm
									onSubmit={(e: any) => {
										e.preventDefault();
										if (currentFilter.trim()) {
											setCurrentFilters((prev) => [...(prev ?? []), currentFilter.trim()]);
											setCurrentFilter('');
										}
									}}
								>
									<ReactSVG src={ASSETS.search} />
									<FormField
										placeholder={'Search by Field'}
										value={currentFilter}
										onChange={(e: any) => setCurrentFilter(e.target.value)}
										disabled={false}
										invalid={{ status: false, message: null }}
									/>
								</S.FilterForm>
							</S.InfoBlock>
							<S.InfoBlockFlex>
								{currentFilters?.length > 0 ? (
									<>
										{currentFilters.map((filter: string) => {
											return (
												<Button
													type={'alt3'}
													label={filter}
													handlePress={() => setCurrentFilters((prev) => prev.filter((f) => f !== filter))}
													active={true}
													icon={ASSETS.close}
												/>
											);
										})}
									</>
								) : (
									<S.InfoBlock>
										<span>No Filters Applied</span>
									</S.InfoBlock>
								)}
							</S.InfoBlockFlex>
						</S.InfoLine>
						<S.InfoLineDivider />
						<S.InfoLine>
							<S.InfoBlock>
								<p>Nodes</p>
							</S.InfoBlock>
							<S.InfoBlockKey>
								<S.InfoBlock background={theme?.colors.editor.alt4}>
									<p>Simple:</p>
									<div className={'indicator'} />
								</S.InfoBlock>
								<S.InfoBlock background={theme?.colors.editor.primary}>
									<p>Composite:</p>
									<div className={'indicator'} />
								</S.InfoBlock>
								<S.InfoBlock background={theme?.colors.editor.alt7}>
									<p>Active:</p>
									<div className={'indicator'} />
								</S.InfoBlock>
								<S.InfoBlock background={theme?.colors.editor.alt5}>
									<p>Connection:</p>
									<div className={'indicator'} />
								</S.InfoBlock>
							</S.InfoBlockKey>
						</S.InfoLine>
						<S.InfoLineDivider />
						<S.InfoLine>
							<S.InfoBlock>
								<p>Position</p>
							</S.InfoBlock>
							<S.InfoBlockFlex>
								<S.InfoBlock>
									<p>X:</p>
									<span>{debugInfo?.cameraPosition?.x ?? '-'}</span>
								</S.InfoBlock>
								<S.InfoBlock>
									<p>Y:</p>
									<span>{debugInfo?.cameraPosition?.y ?? '-'}</span>
								</S.InfoBlock>
								<S.InfoBlock>
									<p>Z:</p>
									<span>{debugInfo?.cameraPosition?.z ?? '-'}</span>
								</S.InfoBlock>
							</S.InfoBlockFlex>
						</S.InfoLine>
						<S.InfoLine>
							<S.InfoBlock>
								<p>Grid</p>
							</S.InfoBlock>
							<S.InfoBlockFlex>
								<S.InfoBlock>
									<p>Cells:</p>
									<span>{debugInfo?.gridCells ?? '-'}</span>
								</S.InfoBlock>
								<S.InfoBlock>
									<p>Objects:</p>
									<span>{debugInfo?.gridObjects ?? '-'}</span>
								</S.InfoBlock>
								<S.InfoBlock>
									<p>Avg:</p>
									<span>{debugInfo?.avgPerCell ?? '-'}</span>
								</S.InfoBlock>
							</S.InfoBlockFlex>
						</S.InfoLine>
						<S.InfoLine>
							<S.InfoBlock>
								<p>FPS</p>
							</S.InfoBlock>
							<S.InfoBlockFlex>
								<S.InfoBlock>
									<span>{debugInfo?.fps ?? '-'}</span>
								</S.InfoBlock>
							</S.InfoBlockFlex>
						</S.InfoLine>
						{activeNode && (
							<>
								<S.InfoLineDivider />
								<S.InfoLine>
									<S.InfoBlock>
										<p>Active Node</p>
									</S.InfoBlock>
									<S.InfoBlockFlex>
										<Copyable value={activeNode.id.substring(activeNode.type === 'simple' ? 5 : 0)} />
									</S.InfoBlockFlex>
								</S.InfoLine>
								<S.InfoLine>
									<S.InfoBlock>
										<p>Field:</p>
										<span>{activeNode.label ?? '-'}</span>
									</S.InfoBlock>
									<S.InfoBlockMaxWidth>
										{isBinary(activeNode.data) ? (
											<Button
												type={'alt2'}
												label={showActiveData ? 'Close' : 'View'}
												handlePress={() => setShowActiveData((prev) => !prev)}
											/>
										) : (
											<code onClick={() => setShowActiveData(true)}>
												{cleanErlangFormatting(activeNode.data) ?? '-'}
											</code>
										)}
									</S.InfoBlockMaxWidth>
								</S.InfoLine>
							</>
						)}
					</S.InfoWrapper>
					{getView()}
					{!isFullScreen && (
						<Panel
							header={`Active Node`}
							open={showActiveData}
							handleClose={() => setShowActiveData(false)}
							width={600}
						>
							<S.PanelWrapper className={'modal-wrapper'}>
								<S.PanelHeaderWrapper>
									<S.InfoLine>
										<S.InfoBlockMaxWidth>
											<p>Cache:</p>
											<span>{props.path ?? '-'}</span>
										</S.InfoBlockMaxWidth>
									</S.InfoLine>
									<S.InfoLine>
										<S.InfoBlockMaxWidth>
											<p>Field:</p>
											<span>{activeNode?.label ?? '-'}</span>
										</S.InfoBlockMaxWidth>
									</S.InfoLine>
								</S.PanelHeaderWrapper>
								<S.PanelBodyWrapper>
									{activeData && <Editor initialData={activeData} loading={false} readOnly noFullScreen noWrapper />}
								</S.PanelBodyWrapper>
								<S.PanelActionWrapper>
									<Button
										type={'primary'}
										label={'Close'}
										handlePress={() => setShowActiveData(false)}
										height={45}
										fullWidth
									/>
								</S.PanelActionWrapper>
							</S.PanelWrapper>
						</Panel>
					)}
				</S.Wrapper>
			) : (
				<S.WrapperEmpty className={'border-wrapper-primary'}>
					<span>No Data Found</span>
				</S.WrapperEmpty>
			)}
		</>
	) : (
		<Loader sm relative />
	);
}
