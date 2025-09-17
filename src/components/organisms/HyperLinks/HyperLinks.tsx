import React from 'react';
import * as d3 from 'd3';
import { useTheme } from 'styled-components';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import SpriteText from 'three-spritetext';

import { Button } from 'components/atoms/Button';
import { Copyable } from 'components/atoms/Copyable';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Panel } from 'components/atoms/Panel';
import { Editor } from 'components/molecules/Editor';
import { ASSETS, HB_ENDPOINTS } from 'helpers/config';
import { formatAddress, hbFetch } from 'helpers/utils';

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

export default function HyperLinks(props: { id?: string; path: string; onError?: (hasError: boolean) => void }) {
	const [data, setRaw] = React.useState<any>(null);

	const [activeNode, setActiveNode] = React.useState<any | null>(null);
	const [showLinkData, setShowLinkData] = React.useState<boolean>(false);
	const [linkData, setLinkData] = React.useState<any>(null);
	const [isFullScreen, setIsFullScreen] = React.useState<boolean>(false);
	const [showLabels, setShowLabels] = React.useState<boolean>(true);

	const [debugInfo, setDebugInfo] = React.useState({
		fps: 0,
		nodes: { visible: 0, total: 0 },
		links: 0,
		gridCells: 0,
		gridObjects: 0,
		avgPerCell: 0,
		cameraPosition: { x: 0, y: 0, z: 0 },
	});

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
	}, [isFullScreen, showLinkData, linkData]);

	React.useEffect(() => {
		(async function () {
			if (props.path) {
				try {
					const cacheRes = await fetch(`${window.hyperbeamUrl}/${props.path}${HB_ENDPOINTS.cache}`);
					if (cacheRes.status === 404 && props.onError) {
						props.onError(true);
						setRaw({});
					} else {
						if (props.onError) props.onError(false);
						setRaw(await cacheRes.json());
					}
				} catch (e: any) {
					console.error(e);
					if (props.onError) props.onError(true);
					setRaw({});
				}
			}
		})();
	}, [props.path]);

	React.useEffect(() => {
		if (data && data.nodes && data.nodes.length > 0 && !activeNode) {
			setActiveNode(data.nodes[0]);
		}
	}, [data, activeNode]);

	React.useEffect(() => {
		(async function () {
			if (activeNode) {
				const hyperbuddyResponse = await hbFetch(
					`/${activeNode.id.substring(activeNode.type === 'simple' ? 5 : 0)}/format~hyperbuddy@1.0`
				);
				setLinkData(hyperbuddyResponse);
			}
		})();
	}, [activeNode]);

	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const graphControllerRef = React.useRef<any>(null);
	const scriptLoadedRef = React.useRef(false);

	const theme = useTheme() as any;

	const [scriptLoaded, setScriptLoaded] = React.useState(false);

	const transformData = React.useCallback((data: any) => {
		if (!data) {
			return { nodes: [], links: [] };
		}

		// Check if data is already in the correct format (has nodes and links arrays)
		if (data.nodes && data.links && Array.isArray(data.nodes) && Array.isArray(data.links)) {
			const result = {
				nodes: data.nodes.map((node: any) => ({
					id: node.id,
					label: formatAddress(node.label || node.id, false),
					type: node.type || 'simple',
				})),
				links: data.links.map((link: any) => ({
					source: link.source,
					target: link.target,
					label: link.label || '',
				})),
			};
			return result;
		}

		return { nodes: [], links: [] };
	}, []);

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
		if (!containerRef.current || !scriptLoadedRef.current || !window.GraphController) {
			return;
		}

		if (graphControllerRef.current) {
			graphControllerRef.current.destroy?.();
			graphControllerRef.current = null;
		}

		const containerId = `graph-container-${Math.random().toString(36).substring(2, 9)}`;
		containerRef.current.id = containerId;

		const graphData = transformData(data);

		if (graphData.nodes.length === 0) {
			return;
		}

		try {
			const controller = new window.GraphController(containerId, theme);
			graphControllerRef.current = controller;

			if (controller.dataManager) {
				controller.dataManager.graphData = graphData;

				graphData.nodes.forEach((node: any) => {
					if (!controller.dataManager.graphObjects.nodes.has(node.id)) {
						controller.graphObjectManager.createNodeObject(node);
					}
				});

				graphData.links.forEach((link: any) => {
					if (!controller.dataManager.graphObjects.links.has(`${link.source}-${link.target}`)) {
						controller.graphObjectManager.createLinkObject(link);
					}
				});

				// Use compact grid positioning instead of circular
				controller.positionNodesCompact();

				controller.simulationManager.updateSimulation(false);
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
	}, [data, transformData, handleNodeClick, scriptLoaded, theme]);

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

	return data ? (
		<>
			{Object.keys(data).length > 0 ? (
				<S.Wrapper ref={wrapperRef} isFullScreen={isFullScreen}>
					<S.InfoWrapper className={'border-wrapper-alt3 fade-in'}>
						<S.InfoLine>
							<S.InfoBlock>
								<p>Cache:</p>
								<span>{props.path ?? '-'}</span>
							</S.InfoBlock>
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
										src={ASSETS.label}
										handlePress={handleToggleLabels}
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
						<S.InfoLineDivider />
						<S.InfoLine>
							<S.InfoBlock>
								<p>Nodes</p>
							</S.InfoBlock>
							<S.InfoBlockFlex>
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
							</S.InfoBlockFlex>
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
										<S.InfoBlockDivider />
										<S.InfoBlock>
											<p>Type:</p>
											<span>{activeNode.type.toUpperCase()}</span>
										</S.InfoBlock>
										<S.InfoBlockDivider />
										<Button
											type={'alt3'}
											label={showLinkData ? 'Close' : 'View Data'}
											handlePress={() => setShowLinkData(true)}
										/>
									</S.InfoBlockFlex>
								</S.InfoLine>
							</>
						)}
					</S.InfoWrapper>
					<S.GraphWrapper>
						<S.Graph isFullScreen={isFullScreen} hasActiveData={showLinkData && !!linkData}>
							<S.GraphCanvas ref={(el: HTMLDivElement) => (containerRef.current = el)} />
						</S.Graph>
						{/* Show data inline in fullscreen mode instead of modal */}
						{isFullScreen && showLinkData && linkData && (
							<S.FullScreenDataPanel>
								<S.DataPanelContent>
									<Editor initialData={linkData} loading={false} readOnly />
								</S.DataPanelContent>
							</S.FullScreenDataPanel>
						)}
					</S.GraphWrapper>
					{/* Only show modal panel in non-fullscreen mode */}
					{!isFullScreen && (
						<Panel
							header={`Active Node Data (${activeNode?.label ?? '-'})`}
							open={showLinkData}
							handleClose={() => setShowLinkData(false)}
							width={600}
						>
							<div className={'modal-wrapper'}>
								{linkData && <Editor initialData={linkData} loading={false} readOnly noFullScreen />}
							</div>
						</Panel>
					)}
				</S.Wrapper>
			) : null}
		</>
	) : (
		<Loader sm relative />
	);
}
