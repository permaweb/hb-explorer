import React from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { useTheme } from 'styled-components';

import { ViewWrapper } from 'app/styles';
import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Modal } from 'components/atoms/Modal';
import { ViewHeader } from 'components/atoms/ViewHeader';
import { ASSETS, URLS } from 'helpers/config';
import { ExplorerTabObjectType, VariantEnum } from 'helpers/types';
import { checkValidAddress, extractDetailsFromPath, formatAddress } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { ExplorerTab } from './ExplorerTab';
import * as S from './styles';

// Memoized ExplorerTab to prevent unnecessary rerenders
const MemoizedExplorerTab = React.memo(
	({
		tab,
		active,
		tabIndex,
		onPathChange,
	}: {
		tab: ExplorerTabObjectType;
		active: boolean;
		tabIndex: number;
		onPathChange: (tabIndex: number, args: ExplorerTabObjectType) => void;
	}) => {
		const handlePathChange = React.useCallback(
			(args: ExplorerTabObjectType) => {
				onPathChange(tabIndex, args);
			},
			[tabIndex, onPathChange]
		);

		return <ExplorerTab tab={tab} active={active} onPathChange={handlePathChange} />;
	},
	(prevProps, nextProps) => {
		// Custom comparison to prevent rerenders when only non-relevant props change
		return (
			prevProps.tab.tabId === nextProps.tab.tabId &&
			prevProps.tab.id === nextProps.tab.id &&
			prevProps.tab.type === nextProps.tab.type &&
			prevProps.tab.path === nextProps.tab.path &&
			prevProps.active === nextProps.active &&
			prevProps.tabIndex === nextProps.tabIndex &&
			prevProps.onPathChange === nextProps.onPathChange
		);
	}
);

// TODO: Process Source
export default function Explorer() {
	const navigate = useNavigate();
	const location = useLocation();
	const theme = useTheme();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const baseUrl = URLS.explorer;
	const storageKey = `hb-explorer-tabs`;

	const tabsRef = React.useRef<HTMLDivElement>(null);

	const [tabs, setTabs] = React.useState<ExplorerTabObjectType[]>(() => {
		const stored = localStorage.getItem(storageKey);
		return stored && JSON.parse(stored).length > 0
			? JSON.parse(stored)
			: [
					{
						id: '',
						label: '',
						type: null,
						tabId: `blank-${Date.now()}`,
					},
			  ];
	});
	const [activeTabIndex, setActiveTabIndex] = React.useState<number>(() => {
		const stored = localStorage.getItem(storageKey);
		const storedTabs =
			stored && JSON.parse(stored).length > 0
				? JSON.parse(stored)
				: [
						{
							id: '',
							label: '',
							type: null,
							tabId: `blank-${Date.now()}`,
						},
				  ];

		// Find the tab that matches the current URL
		const { path, subPath } = extractDetailsFromPath(location.pathname);

		if (path && storedTabs.length > 0) {
			const existingTabIndex = storedTabs.findIndex((tab: ExplorerTabObjectType) => {
				return tab.type === 'process' ? tab.id === path : tab.path === `${path}${subPath}`;
			});

			if (existingTabIndex !== -1) {
				return existingTabIndex;
			}
		}

		return 0;
	});

	const [showClearConfirmation, setShowClearConfirmation] = React.useState<boolean>(false);
	const [isClearing, setIsClearing] = React.useState<boolean>(false);
	const [hasInitialized, setHasInitialized] = React.useState<boolean>(false);
	const [isUpdatingFromChild, setIsUpdatingFromChild] = React.useState<boolean>(false);

	React.useEffect(() => {
		const header = document.getElementById('navigation-header');
		if (header) {
			header.style.background = theme.colors.container.alt1.background;
			header.style.position = 'relative';
			header.style.boxShadow = `inset 0px 6px 6px -6px ${theme.colors.shadow.primary}`;
			header.style.borderTop = `0.5px solid ${theme.colors.border.primary}`;
			header.style.borderBottom = 'none';
		}

		return () => {
			if (header) {
				header.style.background = '';
				header.style.position = 'sticky';
				header.style.boxShadow = 'none';
				header.style.borderTop = 'none';
			}
		};
	}, [theme]);

	React.useEffect(() => {
		const el = tabsRef.current;
		if (!el) return;

		const onWheel = (e: WheelEvent) => {
			if (e.deltaY !== 0) {
				e.preventDefault();
				el.scrollLeft += e.deltaY;
			}
		};

		el.addEventListener('wheel', onWheel, { passive: false });

		return () => {
			el.removeEventListener('wheel', onWheel);
		};
	}, []);

	React.useEffect(() => {
		localStorage.setItem(storageKey, JSON.stringify(tabs));
	}, [tabs]);

	React.useEffect(() => {
		setHasInitialized(true);
	}, []);

	// Handle URL changes and tab synchronization
	React.useEffect(() => {
		// Skip if we're in the middle of updating from a child component
		if (isUpdatingFromChild) {
			setIsUpdatingFromChild(false);
			return;
		}

		const { path, subPath } = extractDetailsFromPath(location.pathname);

		if (path) {
			const existingTabIndex = tabs.findIndex((tab) => {
				if (tab.type === 'process') {
					return tab.id === path;
				} else {
					return tab.path === `${path}${subPath}`;
				}
			});

			if (existingTabIndex !== -1) {
				const currentTab = tabs[existingTabIndex];
				const newPath = `${path}${subPath}`;

				// Update tab path if it has changed, but only for meaningful changes
				const shouldUpdatePath = currentTab.path !== newPath || currentTab.basePath !== path;
				const isSignificantChange = newPath !== currentTab.basePath; // Don't update if just switching between same base path

				if (shouldUpdatePath && isSignificantChange) {
					setTabs((prev) => {
						const updated = [...prev];
						updated[existingTabIndex] = {
							...updated[existingTabIndex],
							basePath: path,
							path: newPath,
						};
						return updated;
					});
				}

				// Only switch tabs if this isn't the initial load and we're navigating programmatically
				// Don't switch tabs on refresh/initial load to maintain user's current tab
				if (hasInitialized && activeTabIndex !== existingTabIndex) {
					setActiveTabIndex(existingTabIndex);
				}
			} else {
				// Tab doesn't exist, create a new one only if we're navigating programmatically
				if (hasInitialized) {
					if (tabs.length === 1 && tabs[0].id === '') {
						setTabs((prev) => {
							const updated = [...prev];
							updated[0] = {
								id: path,
								type: 'path',
								variant: VariantEnum.Mainnet,
								basePath: `${path}${subPath}`,
								path: `${path}${subPath}`,
								label: path,
								tabId: `blank-${Date.now()}`,
							};
							return updated;
						});
						setActiveTabIndex(0);
					} else {
						const newIndex = tabs.length;
						setTabs((prev) => [
							...prev,
							{
								id: path,
								type: 'path',
								variant: VariantEnum.Mainnet,
								basePath: `${path}${subPath}`,
								path: `${path}${subPath}`,
								label: path,
								tabId: `blank-${Date.now()}`,
							},
						]);
						setActiveTabIndex(newIndex);
					}

					navigate(`${baseUrl}${path}${subPath}`);
				}
			}
		} else {
			// No path in URL (e.g., just /explorer), redirect to first tab if it exists and has content
			if (hasInitialized && tabs.length > 0 && tabs[0].id && tabs[0].path) {
				navigate(`${baseUrl}${tabs[0].path}`);
			}
		}
	}, [location.pathname, hasInitialized]);

	const handlePathChange = React.useCallback(
		(tabIndex: number, args: ExplorerTabObjectType) => {
			if (isClearing) return;

			// Set flag to prevent URL effect from interfering
			setIsUpdatingFromChild(true);

			setTabs((prev) => {
				const updated = [...prev];
				if (updated[tabIndex]) {
					updated[tabIndex] = {
						...updated[tabIndex],
						id: args.id,
						type: args.type,
						variant: args.variant,
						basePath: args.basePath,
						path: args.path,
						label: args.label,
						// Preserve tabId for blank tabs, or set it if not present
						tabId: updated[tabIndex].tabId || args.tabId,
					};
				} else {
					updated.push({
						id: args.id,
						type: args.type,
						variant: args.variant,
						basePath: args.basePath,
						path: args.path,
						label: args.label,
						tabId: args.tabId,
					});
				}
				return updated;
			});

			navigate(`${baseUrl}${args.path}`);
		},
		[isClearing, baseUrl, navigate]
	);

	const handleTabRedirect = (index: number) => {
		setActiveTabIndex(index);
		const tab = tabs[index];

		// Don't navigate if it's an empty tab - just switch to it
		if (!tab.id) {
			return;
		}

		const basePath = `${baseUrl}${tab.id}`;

		// If tab has a stored path different from just the id, extract and set the hash part
		if (tab.path && tab.path !== tab.id) {
			navigate(`${baseUrl}${tab.path}`);
		} else {
			navigate(basePath);
		}
	};

	const handleAddTab = (id?: string) => {
		const newTab = {
			id: id ?? '',
			label: id ?? '',
			type: null,
			tabId: `blank-${Date.now()}-${Math.random()}`,
		} as ExplorerTabObjectType;

		flushSync(() => {
			setIsClearing(true);

			setTabs((prev) => {
				const updated = [...prev, newTab];
				setActiveTabIndex(updated.length - 1);
				return updated;
			});
		});

		setTimeout(() => setIsClearing(false), 50);

		setTimeout(() => {
			setIsClearing(false);
			if (tabsRef.current) {
				tabsRef.current.scrollTo({ left: tabsRef.current.scrollWidth });
			}
		}, 0);

		// Don't navigate when adding empty tab - let it stay on the new empty tab
		if (id) {
			navigate(`${baseUrl}${id}`);
		}
	};

	const handleDeleteTab = (deletedIndex: number) => {
		const updatedTransactions = tabs.filter((_, i) => i !== deletedIndex);

		let newActiveIndex: number;

		if (deletedIndex < activeTabIndex) {
			newActiveIndex = activeTabIndex - 1;
		} else if (deletedIndex === activeTabIndex) {
			newActiveIndex = updatedTransactions.length > deletedIndex ? deletedIndex : updatedTransactions.length - 1;
		} else {
			newActiveIndex = activeTabIndex;
		}

		newActiveIndex = Math.max(0, newActiveIndex);

		flushSync(() => {
			setIsClearing(true);
			setTabs(
				updatedTransactions.length > 0
					? updatedTransactions
					: [
							{
								id: '',
								type: null,
								variant: null,
								basePath: '',
								path: '',
								label: '',
								tabId: `blank-${Date.now()}`,
							},
					  ]
			);
			setActiveTabIndex(newActiveIndex);
		});

		setTimeout(() => setIsClearing(false), 50);

		if (updatedTransactions.length > 0) {
			const newPath = updatedTransactions[newActiveIndex]?.path ?? '';
			navigate(`${baseUrl}${newPath}`);
		} else {
			handleClearTabs();
		}
	};

	const handleClearTabs = () => {
		flushSync(() => {
			setIsClearing(true);
			setTabs([
				{
					id: '',
					type: null,
					variant: null,
					basePath: '',
					path: '',
					label: '',
					tabId: `blank-${Date.now()}`,
				},
			]);
			setActiveTabIndex(0);
		});

		navigate(baseUrl, { replace: true });

		setTimeout(() => setIsClearing(false), 50);
		setShowClearConfirmation(false);
	};

	return (
		<>
			<S.Wrapper>
				<S.HeaderWrapper>
					<S.HeaderWrapper>
						<ViewHeader
							header={language.explorer}
							actions={[
								<Button
									type={'primary'}
									label={language.newTab}
									handlePress={() => handleAddTab()}
									icon={ASSETS.add}
									iconLeftAlign
								/>,
								<Button
									type={'warning'}
									label={language.clearTabs}
									handlePress={() => setShowClearConfirmation(true)}
									icon={ASSETS.delete}
									iconLeftAlign
								/>,
							]}
						/>
						<S.TabsWrapper>
							<S.PlaceholderFull id={'placeholder-start'} />
							<ViewWrapper>
								<S.TabsContent ref={tabsRef} className={'scroll-wrapper-hidden'}>
									{tabs.map((tab, index) => {
										let label = language.untitled;
										if (tab.label) {
											label = checkValidAddress(tab.label) ? formatAddress(tab.label, false) : tab.label;
										}
										return (
											<React.Fragment key={index}>
												<S.TabAction active={index === activeTabIndex} onClick={() => handleTabRedirect(index)}>
													<span>{label}</span>
													<div className={'right-icons'}>
														<div className={'icon-wrapper'}>
															<div className={'normal-icon'}>
																<ReactSVG src={ASSETS[tab.type] ?? ASSETS.transaction} />
															</div>
															<div className={'delete-icon'}>
																<IconButton
																	type={'primary'}
																	src={ASSETS.close}
																	handlePress={() => {
																		handleDeleteTab(index);
																	}}
																	dimensions={{ wrapper: 10, icon: 10 }}
																/>
															</div>
														</div>
													</div>
												</S.TabAction>
											</React.Fragment>
										);
									})}
									<S.NewTab active={false} onClick={() => handleAddTab()}>
										<span>{language.newTab}</span>
										<ReactSVG className={'add-icon'} src={ASSETS.add} />
									</S.NewTab>
									<S.Placeholder />
								</S.TabsContent>
							</ViewWrapper>
							<S.PlaceholderFull id={'placeholder-end'} />
						</S.TabsWrapper>
					</S.HeaderWrapper>
				</S.HeaderWrapper>
				<ViewWrapper>
					<>
						{tabs.map((tab: ExplorerTabObjectType, index) => {
							const active = index === activeTabIndex;
							// Use tabId for stable keys, fallback to id-index combination
							const key = tab.tabId || (tab.id ? `${tab.id}-${index}` : `empty-${index}`);

							return (
								<S.TabWrapper key={key} active={active}>
									<MemoizedExplorerTab tab={tab} active={active} tabIndex={index} onPathChange={handlePathChange} />
								</S.TabWrapper>
							);
						})}
					</>
				</ViewWrapper>
			</S.Wrapper>
			{showClearConfirmation && (
				<Modal header={language.clearTabs} handleClose={() => setShowClearConfirmation(false)}>
					<S.ModalWrapper>
						<S.ModalBodyWrapper>
							<p>{language.tabsDeleteConfirmationInfo}</p>
						</S.ModalBodyWrapper>
						<S.ModalActionsWrapper>
							<Button
								type={'primary'}
								label={language.cancel}
								handlePress={() => setShowClearConfirmation(false)}
								disabled={isClearing}
							/>
							<Button
								type={'primary'}
								label={language.clearTabs}
								handlePress={() => handleClearTabs()}
								disabled={false}
								loading={isClearing}
								icon={ASSETS.delete}
								iconLeftAlign
								warning
							/>
						</S.ModalActionsWrapper>
					</S.ModalWrapper>
				</Modal>
			)}
		</>
	);
}
