import React from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { useTheme } from 'styled-components';

import { Types } from '@permaweb/libs';

import { ViewWrapper } from 'app/styles';
import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Modal } from 'components/atoms/Modal';
import { ViewHeader } from 'components/atoms/ViewHeader';
import { Transaction } from 'components/organisms/Transaction';
import { ASSETS, URLS } from 'helpers/config';
import { TransactionTabType } from 'helpers/types';
import { checkValidAddress, formatAddress, getTagValue } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { ConsoleInstance } from '../ConsoleInstance';
import { HyperPath } from '../HyperPath';

import * as S from './styles';

export default function TransactionTabs(props: { type: 'hb-explorer' | 'legacy-explorer' | 'aos' }) {
	const location = useLocation();
	const navigate = useNavigate();
	const theme = useTheme();

	const tabsRef = React.useRef<HTMLDivElement>(null);

	const storageKey = `${props.type}-transactions`;

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [baseUrl, _setBaseUrl] = React.useState<string>(props.type === 'aos' ? URLS.aos : URLS.explorer);
	const [transactions, setTransactions] = React.useState<TransactionTabType[]>(() => {
		const stored = localStorage.getItem(storageKey);
		return stored && JSON.parse(stored).length > 0 ? JSON.parse(stored) : [{ id: '', label: '', type: null }];
	});
	const [activeTabIndex, setActiveTabIndex] = React.useState<number>(getInitialIndex());
	const [isClearing, setIsClearing] = React.useState<boolean>(false);
	const [showClearConfirmation, setShowClearConfirmation] = React.useState<boolean>(false);

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
		const { txId, subPath } = extractTxDetailsFromPath(location.pathname);

		if (txId) {
			const existingTabIndex = transactions.findIndex((tab) => tab.id === txId);

			if (existingTabIndex !== -1) {
				// Tab exists, just set it as active
				setActiveTabIndex(existingTabIndex);
			} else {
				// Tab doesn't exist, create new one
				if (transactions.length === 1 && transactions[0].id === '') {
					setTransactions((prev) => {
						const updated = [...prev];
						updated[0] = { id: txId, label: txId, type: 'message' };
						return updated;
					});
					setActiveTabIndex(0);
				} else {
					const newIndex = transactions.length;
					setTransactions((prev) => [...prev, { id: txId, label: txId, type: 'message' }]);
					setActiveTabIndex(newIndex);
				}

				navigate(`${baseUrl}${txId}${subPath}`);
			}
		}
	}, [location.pathname]);

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
		localStorage.setItem(storageKey, JSON.stringify(transactions));
	}, [transactions]);

	function extractTxDetailsFromPath(pathname: string) {
		const parts = pathname.replace(/#.*/, '').split('/').filter(Boolean);

		if (props.type === 'hb-explorer') {
			const txId = parts.slice(1).join('/') || '';
			return { txId, subPath: '' };
		} else {
			const txId = parts[1] || '';
			const subPath = parts.slice(2).join('/') || '';
			return { txId, subPath: subPath ? `/${subPath}` : '' };
		}
	}

	function getInitialIndex() {
		if (transactions.length <= 0) return 0;

		let currentTxId;
		if (props.type === 'hb-explorer') {
			currentTxId = location.pathname.replace(`${baseUrl}/`, '');
		} else {
			currentTxId = location.pathname.replace(`${baseUrl}/`, '');
			const parts = location.pathname.split('/');
			for (const part of parts) {
				if (checkValidAddress(part)) {
					currentTxId = part;
					break;
				}
			}
		}

		for (let i = 0; i < transactions.length; i++) {
			if (transactions[i].id === currentTxId) return i;
		}

		return 0;
	}

	const handleTxChange = (tabIndex: number, newTx: Types.GQLNodeResponseType) => {
		if (isClearing) return;

		const name = getTagValue(newTx.node.tags, 'Name');
		const type = getTagValue(newTx.node.tags, 'Type');

		setTransactions((prev) => {
			const updated = [...prev];
			if (updated[tabIndex]) {
				updated[tabIndex] = {
					...updated[tabIndex],
					id: newTx.node.id,
					label: name ?? newTx.node.id,
					type: type ? (type.toLowerCase() as any) : 'message',
				};
			} else {
				updated.push({
					id: newTx.node.id,
					label: name ?? newTx.node.id,
					type: type ? (type.toLowerCase() as any) : 'message',
				});
			}
			return updated;
		});

		const currentParts = window.location.hash.replace('#', '').split('/');
		const currentRoute = currentParts[currentParts.length - 1];

		let toRoute = `${baseUrl}${newTx.node.id}`;

		if (props.type === 'legacy-explorer') {
			switch (currentRoute) {
				case 'info':
					toRoute = URLS.explorerInfo(newTx.node.id);
					break;
				case 'messages':
					toRoute = URLS.explorerMessages(newTx.node.id);
					break;
				case 'read':
					toRoute = URLS.explorerRead(newTx.node.id);
					break;
				case 'write':
					toRoute = URLS.explorerWrite(newTx.node.id);
					break;
				case 'aos':
					toRoute = URLS.explorerAOS(newTx.node.id);
					break;
				case 'source':
					toRoute = URLS.explorerSource(newTx.node.id);
					break;
				default:
					break;
			}
		}

		navigate(toRoute);
	};

	const handlePathChange = (tabIndex: number, id: string, path: string) => {
		if (isClearing) return;

		setTransactions((prev) => {
			const updated = [...prev];
			if (updated[tabIndex]) {
				updated[tabIndex] = {
					...updated[tabIndex],
					id: id,
					label: path,
					type: 'message',
				};
			} else {
				updated.push({
					id: id,
					label: path,
					type: 'message',
				});
			}
			return updated;
		});
	};

	const handleTabRedirect = (index: number) => {
		setActiveTabIndex(index);
		navigate(`${baseUrl}${transactions[index].id}`);
	};

	const handleAddTab = (id?: string) => {
		const newTab = { id: id ?? '', label: id ?? '', type: null } as TransactionTabType;

		flushSync(() => {
			setIsClearing(true);

			setTransactions((prev) => {
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
		const updatedTransactions = transactions.filter((_, i) => i !== deletedIndex);

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
			setTransactions(updatedTransactions.length > 0 ? updatedTransactions : [{ id: '', label: '', type: null }]);
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
			setTransactions([{ id: '', label: '', type: null }]);
			setActiveTabIndex(0);
		});

		navigate(baseUrl, { replace: true });

		setTimeout(() => setIsClearing(false), 50);
		setShowClearConfirmation(false);
	};

	const tabs = React.useMemo(() => {
		return (
			<S.TabsContent ref={tabsRef} className={'scroll-wrapper-hidden'}>
				{transactions.map((tx, index) => {
					let label = language.untitled;
					if (tx.label) {
						label = checkValidAddress(tx.label) ? formatAddress(tx.label, false) : tx.label;
					}
					return (
						<React.Fragment key={index}>
							<S.TabAction active={index === activeTabIndex} onClick={() => handleTabRedirect(index)}>
								<div className={'icon-wrapper'}>
									<div className={'normal-icon'}>
										<ReactSVG src={ASSETS[tx.type] ?? ASSETS.transaction} />
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
								<span>{label}</span>
							</S.TabAction>
						</React.Fragment>
					);
				})}
				<S.NewTab active={false} onClick={() => handleAddTab()}>
					<span>{language.newTab}</span>
				</S.NewTab>
				<S.Placeholder />
			</S.TabsContent>
		);
	}, [transactions, activeTabIndex, language]);

	function getTab(tx: TransactionTabType, index: number) {
		switch (props.type) {
			case 'hb-explorer':
				return (
					<HyperPath
						path={tx.label}
						onPathChange={(id: string, path: string) => handlePathChange(index, id, path)}
						active={index === activeTabIndex}
					/>
				);
			case 'legacy-explorer':
				return (
					<Transaction
						txId={tx.id}
						type={tx.type}
						active={index === activeTabIndex}
						onTxChange={(newTx: Types.GQLNodeResponseType) => handleTxChange(index, newTx)}
						handleMessageOpen={(id: string) => handleAddTab(id)}
					/>
				);
			case 'aos':
				return (
					<ConsoleInstance
						processId={tx.id}
						active={index === activeTabIndex}
						onTxChange={(newTx: Types.GQLNodeResponseType) => handleTxChange(index, newTx)}
					/>
				);
		}
	}

	return (
		<>
			<S.Wrapper>
				<S.HeaderWrapper>
					<ViewHeader
						header={props.type === 'aos' ? 'AOS' : language.explorer}
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
						<ViewWrapper>{tabs}</ViewWrapper>
						<S.PlaceholderFull id={'placeholder-end'} />
					</S.TabsWrapper>
				</S.HeaderWrapper>
				<ViewWrapper>
					{!isClearing ? (
						<>
							{transactions.map((tx: TransactionTabType, index) => {
								return (
									<S.TransactionWrapper key={index} active={index === activeTabIndex}>
										{getTab(tx, index)}
									</S.TransactionWrapper>
								);
							})}
						</>
					) : null}
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
