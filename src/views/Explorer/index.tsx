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
		return stored && JSON.parse(stored).length > 0 ? JSON.parse(stored) : [{ id: '', label: '', type: null }];
	});
	const [activeTabIndex, setActiveTabIndex] = React.useState<number>(getInitialIndex());

	const [showClearConfirmation, setShowClearConfirmation] = React.useState<boolean>(false);
	const [isClearing, setIsClearing] = React.useState<boolean>(false);

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
		const { path, subPath } = extractDetailsFromPath(location.pathname);

		if (path) {
			const existingTabIndex = tabs.findIndex((tab) => tab.id === path);

			if (existingTabIndex !== -1) {
				// Tab exists, update its path if hash changed and set it as active
				// if (hashPath) {
				// 	setTabs((prev) => {
				// 		const updated = [...prev];
				// 		updated[existingTabIndex] = { ...updated[existingTabIndex], path: `${path}${hashPath}` };
				// 		return updated;
				// 	});
				// }
				setActiveTabIndex(existingTabIndex);
			} else {
				// Tab doesn't exist, create a new one
				if (tabs.length === 1 && tabs[0].id === '') {
					setTabs((prev) => {
						const updated = [...prev];
						updated[0] = {
							id: path,
							type: 'path',
							variant: VariantEnum.Mainnet,
							path: `${path}${subPath}`,
							label: path,
						};
						return updated;
					});
					setActiveTabIndex(0);
				} else {
					const newIndex = tabs.length;
					setTabs((prev) => [
						...prev,
						{ id: path, type: 'path', variant: VariantEnum.Mainnet, path: `${path}${subPath}`, label: path },
					]);
					setActiveTabIndex(newIndex);
				}

				navigate(`${baseUrl}${path}${subPath}`);
			}
		}
	}, [location.pathname, location.hash]);

	function getInitialIndex() {
		if (tabs.length <= 0) return 0;

		let currentId = location.pathname.replace(`${baseUrl}/`, '');
		const parts = location.pathname.split('/');

		for (const part of parts) {
			if (checkValidAddress(part)) {
				currentId = part;
				break;
			}
		}

		for (let i = 0; i < tabs.length; i++) {
			if (tabs[i].id === currentId) return i;
		}

		return 0;
	}

	const handlePathChange = (tabIndex: number, args: ExplorerTabObjectType) => {
		if (isClearing) return;

		setTabs((prev) => {
			const updated = [...prev];
			if (updated[tabIndex]) {
				updated[tabIndex] = {
					...updated[tabIndex],
					id: args.id,
					type: args.type,
					variant: args.variant,
					path: args.path,
					label: args.label,
				};
			} else {
				updated.push({
					id: args.id,
					type: args.type,
					variant: args.variant,
					path: args.path,
					label: args.label,
				});
			}
			return updated;
		});

		navigate(`${baseUrl}${args.id}${args.type === 'process' ? '/messages' : ''}`);
	};

	const handleTabRedirect = (index: number) => {
		setActiveTabIndex(index);
		const tab = tabs[index];
		const basePath = `${baseUrl}${tab.id}`;

		// If tab has a stored path different from just the id, extract and set the hash part
		if (tab.path && tab.path !== tab.id) {
			navigate(`${baseUrl}${tab.path}`);
		} else {
			navigate(basePath);
		}
	};

	const handleAddTab = (id?: string) => {
		const newTab = { id: id ?? '', label: id ?? '', type: null } as ExplorerTabObjectType;

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

		navigate(id ? `${baseUrl}${id}` : baseUrl);
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
					: [{ id: '', type: null, variant: null, path: '', label: '' }]
			);
			setActiveTabIndex(newActiveIndex);
		});

		setTimeout(() => setIsClearing(false), 50);

		if (updatedTransactions.length > 0) {
			const newId = updatedTransactions[newActiveIndex]?.id ?? '';
			navigate(`${baseUrl}${newId}`);
		} else {
			handleClearTabs();
		}
	};

	const handleClearTabs = () => {
		flushSync(() => {
			setIsClearing(true);
			setTabs([{ id: '', type: null, variant: null, path: '', label: '' }]);
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
							return (
								<S.TabWrapper key={index} active={index === activeTabIndex}>
									<ExplorerTab
										tab={tab}
										onPathChange={(args: ExplorerTabObjectType) => handlePathChange(index, args)}
										// onSubPathChange={(subPath: string) => handleSubPathChange(index, subPath)}
									/>
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
