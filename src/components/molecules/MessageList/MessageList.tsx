import React from 'react';
import { ReactSVG } from 'react-svg';
import { useTheme } from 'styled-components';

import { Button } from 'components/atoms/Button';
import { Copyable } from 'components/atoms/Copyable';
import { FormField } from 'components/atoms/FormField';
import { Loader } from 'components/atoms/Loader';
import { Panel } from 'components/atoms/Panel';
import { JSONReader } from 'components/molecules/JSONReader';
import { ASSETS, DEFAULT_ACTIONS, HB_ENDPOINTS } from 'helpers/config';
import { MessageFilterType, RawMessageType } from 'helpers/types';
import { checkValidAddress, formatCount, getRelativeDate, hbFetch } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { Editor } from '../Editor';

import * as S from './styles';

// Normalize child messages from compute results to RawMessageType format
function normalizeChildMessages(parsedMessages: any): RawMessageType[] {
	if (!parsedMessages?.Messages) return [];

	return parsedMessages.Messages.map((msg: any, index: number) => ({
		slot: index + 1, // Use index as slot for child messages
		timestamp: Date.now(), // Use current time since we don't have timestamp
		process: msg.Target || 'unknown',
		type: 'Message',
		'hash-chain': msg.Anchor || `anchor-${index}`,
		'data-protocol': 'ao',
		variant: 'ao.TN.1',
		Tags: msg.Tags,
		Data: msg.Data,
		Target: msg.Target,
		Anchor: msg.Anchor,
		body: {
			data: msg.Data,
			target: msg.Target,
			action: msg.Tags?.find((tag: any) => tag.name === 'Action')?.value,
		},
	}));
}

function Message(props: {
	element: RawMessageType;
	currentFilter: MessageFilterType;
	parentId: string;
	handleOpen: (id: string) => void;
	lastChild?: boolean;
	isOverallLast?: boolean;
}) {
	const currentTheme: any = useTheme();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [open, setOpen] = React.useState<boolean>(false);
	const [messages, setMessages] = React.useState<RawMessageType[] | null>(null);

	const [showViewData, setShowViewData] = React.useState<boolean>(false);

	const [result, setResult] = React.useState<any>(null);
	const [showViewResult, setShowViewResult] = React.useState<boolean>(false);

	React.useEffect(() => {
		(async function () {
			if ((open || showViewResult) && !result) {
				if (props.element.process && props.element.slot) {
					try {
						const response = await hbFetch(`/${props.element.process}/compute=${props.element.slot}`, { json: true });
						if (response?.results?.json?.body) {
							const parsedResult = JSON.parse(response.results.json.body);
							setResult(parsedResult);

							const normalizedMessages = normalizeChildMessages(parsedResult);
							setMessages(normalizedMessages);
						}
					} catch (e: any) {
						console.error(e);
					}
				} else {
					setMessages([]);
				}
			}
		})();
	}, [open, showViewResult, result]);

	const excludedTagNames = ['Type', 'Authority', 'Module', 'Scheduler'];
	const bodyEntries = props.element.body ? Object.entries(props.element.body) : [];
	const filteredTags = bodyEntries
		.filter(([key]) => !excludedTagNames.includes(key))
		.map(([name, value]) => ({ name, value: typeof value === 'string' ? value : JSON.stringify(value) }));

	function handleShowViewData(e: any) {
		e.preventDefault();
		e.stopPropagation();
		setShowViewData((prev) => !prev);
	}

	function handleShowViewResult(e: any) {
		e.preventDefault();
		e.stopPropagation();
		setShowViewResult((prev) => !prev);
	}

	function getActionLabel() {
		// Handle both formats
		let label = props.element.body?.action || props.element.type;

		// If it's a child message format, get action from Tags
		if (props.element.Tags) {
			label = props.element.Tags.find((tag: any) => tag.name === 'Action')?.value || language.none;
		}

		return label.charAt(0).toUpperCase() + label.slice(1);
	}

	function getFrom() {
		let from = props.element.body?.scheduler || props.element.body?.authority || '-';

		if (props.element.body?.commitments) {
			const entries = Object.values(props.element.body.commitments) as any[];
			const withCommitter = entries.find((c) => c?.committer);

			if (withCommitter) {
				from = withCommitter.committer;
			}
		}

		return (
			<S.From>
				<Copyable value={from} />
			</S.From>
		);
	}

	function getTo() {
		// Handle both formats
		const to = props.element.body?.target || props.element.Target || props.element.process;

		return (
			<S.To>
				<Copyable value={to || 'unknown'} />
			</S.To>
		);
	}

	function getActionBackground() {
		const action = getActionLabel();

		if (action.toLowerCase().includes('error')) {
			return currentTheme.colors.warning.alt1;
		}

		switch (action) {
			case DEFAULT_ACTIONS.eval.name:
				return currentTheme.colors.actions.eval;
			case DEFAULT_ACTIONS.info.name:
				return currentTheme.colors.actions.info;
			case DEFAULT_ACTIONS.balance.name:
				return currentTheme.colors.actions.balance;
			case DEFAULT_ACTIONS.transfer.name:
				return currentTheme.colors.actions.transfer;
			case DEFAULT_ACTIONS.debitNotice.name:
				return currentTheme.colors.actions.debitNotice;
			case DEFAULT_ACTIONS.creditNotice.name:
				return currentTheme.colors.actions.creditNotice;
			case 'None':
				return currentTheme.colors.actions.none;
			default:
				return currentTheme.colors.actions.other;
		}
	}

	function getAction(useMaxWidth: boolean, noMinWidth: boolean) {
		return (
			<S.ActionValue background={getActionBackground()} useMaxWidth={useMaxWidth} noMinWidth={noMinWidth}>
				<div className={'action-indicator'}>
					<p>{getActionLabel()}</p>
					<S.ActionTooltip className={'info'}>
						<span>{getActionLabel()}</span>
					</S.ActionTooltip>
				</div>
			</S.ActionValue>
		);
	}

	function getData() {
		if (!props.element?.body?.data) return null;

		const data = props.element?.body?.data;

		if (typeof data === 'object') {
			return <JSONReader data={data} header={language.data} maxHeight={600} />;
		}

		return <Editor initialData={data} header={language.data} language={'lua'} readOnly loading={false} />;
	}

	const OverlayLine = ({ label, value, render }: { label: string; value: any; render?: (v: any) => JSX.Element }) => {
		const defaultRender = (v: any) => {
			if (typeof v === 'string' && checkValidAddress(v)) {
				return <Copyable value={v} />;
			}
			return <p>{v}</p>;
		};

		const renderContent = render || defaultRender;

		return (
			<S.OverlayLine>
				<span>{label}</span>
				{value ? renderContent(value) : <p>-</p>}
			</S.OverlayLine>
		);
	};

	function getMessageOverlay() {
		let open = false;
		let header = null;
		let handleClose = () => {};
		let content = null;
		let loading = true;

		if (showViewData) {
			open = true;
			header = language.input;
			handleClose = () => setShowViewData(false);
			content = getData();
			if (props.element?.body?.data) loading = false;
		} else if (showViewResult) {
			open = true;
			header = language.result;
			handleClose = () => setShowViewResult(false);
			content = <JSONReader data={result} header={language.output} noWrapper />;
			if (result) loading = false;
		}

		return (
			<Panel open={open} width={650} header={header} handleClose={handleClose}>
				<S.OverlayWrapper>
					<S.OverlayInfo>
						<S.OverlayInfoHeader>
							<S.OverlayInfoLine>
								<S.OverlayInfoLineValue>
									<p>{`${language.message}: `}</p>
								</S.OverlayInfoLineValue>
								<Copyable value={props.element['hash-chain']} />
							</S.OverlayInfoLine>
							<S.OverlayInfoLine>{getAction(false, true)}</S.OverlayInfoLine>
						</S.OverlayInfoHeader>
						<S.OverlayOutput>{loading ? <p>{`${language.loading}...`}</p> : <>{content}</>}</S.OverlayOutput>
						{showViewData && (
							<S.OverlayTagsWrapper className={'border-wrapper-alt3'}>
								<S.OverlayTagsHeader>
									<p>{language.headers}</p>
									<span>{`(${filteredTags.length})`}</span>
								</S.OverlayTagsHeader>
								{filteredTags.map((tag: { name: string; value: string }, index: number) => (
									<OverlayLine key={index} label={tag.name} value={tag.value} />
								))}
							</S.OverlayTagsWrapper>
						)}
					</S.OverlayInfo>
					<S.OverlayActions>
						<Button type={'primary'} label={language.close} handlePress={handleClose} />
					</S.OverlayActions>
				</S.OverlayWrapper>
			</Panel>
		);
	}

	return (
		<>
			<S.ElementWrapper
				key={props.element.slot}
				className={'message-list-element'}
				onClick={() => setOpen((prev) => !prev)}
				open={open}
				lastChild={props.lastChild}
			>
				{/* <S.ID>
					<IconButton
						type={'alt1'}
						src={ASSETS.newTab}
						handlePress={() =>
							props.handleOpen
								? props.handleOpen(props.element['hash-chain'])
								: navigate(`${URLS.explorer}${props.element['hash-chain']}`)
						}
						dimensions={{
							wrapper: 20,
							icon: 11.5,
						}}
						tooltip={language.openInNewTab}
						tooltipPosition={'right'}
					/>

					<Copyable value={props.element['hash-chain']} />
				</S.ID> */}
				<S.Slot>
					<Copyable value={(props.element.slot ?? props.element.Anchor ?? '-').toString()} />
				</S.Slot>
				{getAction(true, false)}
				{getFrom()}
				{getTo()}
				<S.Input>
					<Button type={'alt3'} label={language.view} handlePress={(e) => handleShowViewData(e)} />
				</S.Input>
				<S.Output>
					<Button type={'alt3'} label={language.view} handlePress={(e) => handleShowViewResult(e)} />
				</S.Output>
				<S.Time>
					<p>{props.element.timestamp ? getRelativeDate(props.element.timestamp) : '-'}</p>
				</S.Time>
				<S.Results open={open}>
					<ReactSVG src={ASSETS.arrow} />
				</S.Results>
			</S.ElementWrapper>
			{open && (
				<MessageList
					currentFilter={props.currentFilter}
					recipient={props.element.body?.target || props.element.Target || props.element.process}
					parentId={props.parentId}
					handleMessageOpen={props.handleOpen ? (id: string) => props.handleOpen(id) : null}
					childList
					isOverallLast={props.isOverallLast && props.lastChild}
					messages={messages}
				/>
			)}
			{getMessageOverlay()}
		</>
	);
}

export default function MessageList(props: {
	processId?: string;
	messages?: RawMessageType[];
	currentFilter?: MessageFilterType;
	recipient?: string | null;
	parentId?: string;
	handleMessageOpen?: (id: string) => void;
	childList?: boolean;
	isOverallLast?: boolean;
	refreshKey?: number;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const tableContainerRef = React.useRef(null);

	const [totalMessages, setTotalMessages] = React.useState<number | null>(null);

	const [showFilters, setShowFilters] = React.useState<boolean>(false);
	const [currentFilter, _setCurrentFilter] = React.useState<MessageFilterType>(props.currentFilter ?? 'incoming');
	const [currentAction, setCurrentAction] = React.useState<string | null>(null);
	const [actionOptions, setActionOptions] = React.useState<string[]>(
		Object.keys(DEFAULT_ACTIONS).map((action) => DEFAULT_ACTIONS[action].name)
	);
	const [customAction, setCustomAction] = React.useState<string>('');

	const [currentData, setCurrentData] = React.useState<RawMessageType[] | null>(null);
	const [filteredData, setFilteredData] = React.useState<RawMessageType[] | null>(null);
	const [loadingMessages, setLoadingMessages] = React.useState<boolean>(false);

	const [pageNumber, setPageNumber] = React.useState(1);
	const [perPage, setPerPage] = React.useState(25);
	const [recipient, setRecipient] = React.useState<string>('');
	const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest');

	React.useEffect(() => {
		(async function () {
			if (props.processId && !props.childList && !totalMessages) {
				setLoadingMessages(true);
				try {
					const totalSlots = await hbFetch(HB_ENDPOINTS.currentSlot(props.processId));
					setTotalMessages(parseInt(totalSlots));
				} catch (e: any) {
					console.error(e);
				}
				setLoadingMessages(false);
			}
		})();
	}, [props.processId, props.childList, totalMessages]);

	React.useEffect(() => {
		(async function () {
			if (props.processId && !props.childList && totalMessages) {
				setLoadingMessages(true);
				try {
					// Calculate from/to based on sort order
					let fromSlot: number;
					let toSlot: number;

					if (sortOrder === 'newest') {
						// For newest first: start from highest slots
						// Page 1: (totalMessages - perPage) to (totalMessages - 1)
						// Page 2: (totalMessages - 2*perPage) to (totalMessages - perPage - 1)
						toSlot = totalMessages - (pageNumber - 1) * perPage - 1;
						fromSlot = Math.max(0, toSlot - perPage + 1);
					} else {
						// For oldest first: start from lowest slots (original logic)
						// Page 1: 0 to (perPage - 1)
						// Page 2: perPage to (2*perPage - 1)
						fromSlot = perPage * pageNumber - perPage;
						toSlot = Math.min(totalMessages - 1, perPage * pageNumber - 1);
					}

					const response = await hbFetch(HB_ENDPOINTS.schedule(props.processId), {
						headers: {
							from: fromSlot.toString(),
							to: toSlot.toString(),
						},
						json: true,
					});

					if (response?.assignments) {
						const assignments = Object.keys(response.assignments).map((assignment: any) => {
							return { ...response.assignments[assignment] };
						});

						// Sort by slot number according to sort order
						const sortedAssignments = assignments.sort((a: any, b: any) => {
							const aSlot = a.slot || 0;
							const bSlot = b.slot || 0;

							if (sortOrder === 'newest') {
								return bSlot - aSlot; // Highest slot first
							} else {
								return aSlot - bSlot; // Lowest slot first
							}
						});

						setCurrentData(sortedAssignments);
					} else {
						setCurrentData([]);
					}
				} catch (e: any) {
					console.error(e);
				}
				setLoadingMessages(false);
			}
		})();
	}, [props.processId, props.childList, totalMessages, perPage, pageNumber, sortOrder]);

	// Set messages directly when provided
	React.useEffect(() => {
		if (props.messages) {
			setCurrentData(props.messages);
			setLoadingMessages(false);
		} else {
			setLoadingMessages(true);
		}
	}, [props.messages]);

	// Apply filters to current data
	// Reset page number when perPage or sortOrder changes
	React.useEffect(() => {
		setPageNumber(1);
	}, [perPage, sortOrder]);

	// Handle refresh trigger - reset data and trigger refetch
	React.useEffect(() => {
		if (props.refreshKey !== undefined && props.refreshKey > 0 && !props.childList) {
			setTotalMessages(null);
			setCurrentData(null);
			setFilteredData(null);
		}
	}, [props.refreshKey, props.childList]);

	React.useEffect(() => {
		if (!currentData) {
			setFilteredData(null);
			return;
		}

		let filtered = [...currentData];

		// Filter by action
		if (currentAction) {
			filtered = filtered.filter((msg) => {
				let action = msg.body?.action || msg.type || 'Message';

				// Handle child message format
				if (msg.Tags && !action) {
					action = msg.Tags.find((tag: any) => tag.name === 'Action')?.value || 'Message';
				}

				return action === currentAction;
			});
		}

		// Filter by recipient (for outgoing messages)
		if (recipient && checkValidAddress(recipient)) {
			filtered = filtered.filter((msg) => {
				const target = msg.body?.target || msg.Target || msg.process;
				return target === recipient;
			});
		}

		// Filter by direction (incoming/outgoing) - for now just show all
		// This could be enhanced based on the process/scheduler relationship

		setFilteredData(filtered);
	}, [currentData, currentAction, recipient]);

	// function handleFilterChange(filter: MessageFilterType) {
	// 	if (filter === 'incoming') setRecipient('');
	// 	setCurrentFilter(filter);
	// }

	function handleActionChange(action: string) {
		setCurrentAction(currentAction === action ? null : action);
	}

	function handleFilterUpdate() {
		setShowFilters(false);
	}

	function handleActionAdd() {
		setActionOptions((prev) => [...prev, customAction]);
		handleActionChange(customAction);
		setCustomAction('');
	}

	const scrollToTop = () => {
		if (tableContainerRef.current) {
			setTimeout(() => {
				tableContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 10);
		}
	};

	function handleNext() {
		if (!totalMessages) return;
		const totalPages = Math.ceil(totalMessages / perPage);
		if (pageNumber < totalPages) {
			setPageNumber(pageNumber + 1);
			scrollToTop();
		}
	}

	function handlePrevious() {
		if (pageNumber > 1) {
			setPageNumber(pageNumber - 1);
			scrollToTop();
		}
	}

	function getPages() {
		if (!totalMessages) return null;

		const count = totalMessages || 0;
		const totalPages = Math.ceil(count / perPage);
		return (
			<>
				<p>{`Page (${pageNumber} of ${totalPages})`}</p>
				<S.Divider />
				<p>{`${perPage} per page`}</p>
			</>
		);
	}

	function getPaginator(showPages: boolean) {
		const totalPages = totalMessages ? Math.ceil(totalMessages / perPage) : 0;
		const isPreviousDisabled = pageNumber <= 1 || loadingMessages;
		const isNextDisabled = pageNumber >= totalPages || loadingMessages || !totalMessages;

		return (
			<>
				<Button type={'alt3'} label={language.previous} handlePress={handlePrevious} disabled={isPreviousDisabled} />
				{showPages && <S.DPageCounter>{getPages()}</S.DPageCounter>}
				<Button type={'alt3'} label={language.next} handlePress={handleNext} disabled={isNextDisabled} />
				{showPages && <S.MPageCounter>{getPages()}</S.MPageCounter>}
			</>
		);
	}

	function getMessage() {
		let message: string = language.associatedMessagesInfo;
		if (loadingMessages) message = `${language.associatedMessagesLoading}...`;
		if (filteredData?.length <= 0) message = language.associatedMessagesNotFound;
		return (
			<S.UpdateWrapper childList={props.childList}>
				<p>{message}</p>
			</S.UpdateWrapper>
		);
	}

	const invalidPerPage = perPage <= 0 || perPage > 100;

	return (
		<>
			<S.Container ref={tableContainerRef}>
				{!props.childList && (
					<S.Header>
						<S.HeaderMain>
							<p>
								{language.messages}
								{totalMessages ? <span>({formatCount(totalMessages.toString())})</span> : null}
							</p>
							{loadingMessages && (
								<div className={'loader'}>
									<Loader xSm relative />
								</div>
							)}
						</S.HeaderMain>
						<S.HeaderActions>
							{/* {props.type === 'process' && (
								<>
									<Button
										type={'alt3'}
										label={`${language.incoming} (${currentData?.length || 0})`}
										handlePress={() => handleFilterChange('incoming')}
										active={currentFilter === 'incoming'}
										disabled={loadingMessages}
									/>
									<Button
										type={'alt3'}
										label={`${language.outgoing} (${currentData?.length || 0})`}
										handlePress={() => handleFilterChange('outgoing')}
										active={currentFilter === 'outgoing'}
										disabled={loadingMessages}
									/>
									<S.Divider />
								</>
							)} */}
							{currentAction && !showFilters && (
								<Button
									type={'alt3'}
									label={currentAction}
									handlePress={() => {
										handleActionChange(currentAction);
										handleFilterUpdate();
									}}
									active={true}
									disabled={loadingMessages}
									icon={ASSETS.close}
								/>
							)}
							{recipient && checkValidAddress(recipient) && !showFilters && (
								<Button
									type={'alt3'}
									label={recipient.slice(0, 8) + '...'}
									handlePress={() => {
										setRecipient('');
										handleFilterUpdate();
									}}
									active={true}
									disabled={loadingMessages}
									icon={ASSETS.close}
								/>
							)}
							<Button
								type={'alt3'}
								label={sortOrder === 'newest' ? 'Toggle: Old to New' : 'Toggle: New to Old'}
								handlePress={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
								active={false}
								disabled={loadingMessages}
								icon={ASSETS.arrows}
								iconLeftAlign
							/>
							<S.Divider />
							{getPaginator(false)}
						</S.HeaderActions>
					</S.Header>
				)}
				{filteredData?.length > 0 ? (
					<S.Wrapper childList={props.childList}>
						{!props.childList && (
							<S.HeaderWrapper>
								<S.Slot>
									<p>{language.slot}</p>
								</S.Slot>
								<S.Action>
									<p>{language.action}</p>
								</S.Action>
								<S.From>
									<p>{language.from}</p>
								</S.From>
								<S.To>
									<p>{language.to}</p>
								</S.To>
								<S.Input>
									<p>{language.input}</p>
								</S.Input>
								<S.Output>
									<p>{language.output}</p>
								</S.Output>
								<S.Time>
									<p>{language.time}</p>
								</S.Time>
								<S.Results>
									<p>{language.results}</p>
								</S.Results>
							</S.HeaderWrapper>
						)}
						<S.BodyWrapper childList={props.childList} isOverallLast={props.isOverallLast}>
							{filteredData.map((element: RawMessageType, index: number) => {
								const isLastChild = index === filteredData.length - 1;
								// Use slot, Anchor, or index as key
								const key = element.slot ?? element.Anchor ?? `msg-${index}`;

								return (
									<Message
										key={key}
										element={element}
										currentFilter={currentFilter}
										parentId={props.parentId}
										handleOpen={props.handleMessageOpen ? (id: string) => props.handleMessageOpen(id) : null}
										lastChild={isLastChild}
										isOverallLast={props.isOverallLast && isLastChild}
									/>
								);
							})}
						</S.BodyWrapper>
					</S.Wrapper>
				) : (
					getMessage()
				)}
				{!props.childList && <S.FooterWrapper>{getPaginator(true)}</S.FooterWrapper>}
			</S.Container>
			{!props.childList && (
				<Panel
					open={showFilters}
					width={475}
					header={language.messageFilters}
					handleClose={() => setShowFilters(false)}
				>
					<S.FilterDropdown>
						<S.FilterDropdownHeader>
							<p>{language.byAction}</p>
						</S.FilterDropdownHeader>
						<S.FilterDropdownActionSelect>
							{actionOptions.map((action) => {
								return (
									<Button
										key={action}
										type={'primary'}
										label={action}
										handlePress={() => handleActionChange(action)}
										disabled={loadingMessages}
										active={currentAction === action}
										icon={currentAction === action ? ASSETS.close : null}
										height={40}
										fullWidth
									/>
								);
							})}
							<FormField
								label={language.customAction}
								value={customAction}
								onChange={(e: any) => setCustomAction(e.target.value)}
								disabled={loadingMessages}
								invalid={{ status: actionOptions.some((action) => action === customAction), message: null }}
								hideErrorMessage
							/>
							<Button
								type={'alt1'}
								label={language.submit}
								handlePress={() => handleActionAdd()}
								disabled={!customAction || actionOptions.some((action) => action === customAction) || loadingMessages}
								active={false}
								height={40}
								fullWidth
							/>
						</S.FilterDropdownActionSelect>
						<S.FilterDivider />
						<FormField
							type={'number'}
							label={language.resultsPerPage}
							value={perPage}
							onChange={(e: any) => setPerPage(e.target.value)}
							disabled={loadingMessages}
							invalid={{ status: invalidPerPage, message: invalidPerPage ? 'Value must be between 0 and 100' : null }}
						/>

						{/* {(currentFilter !== 'incoming' || !props.txId) && (
							<FormField
								label={language.recipient}
								value={recipient}
								onChange={(e: any) => setRecipient(e.target.value)}
								disabled={loadingMessages}
								invalid={{ status: recipient ? !checkValidAddress(recipient) : null, message: null }}
								hideErrorMessage
							/>
						)} */}

						<S.FilterApply>
							<Button
								type={'primary'}
								label={language.applyFilters}
								handlePress={() => handleFilterUpdate()}
								disabled={invalidPerPage}
								active={false}
								height={37.5}
								fullWidth
							/>
						</S.FilterApply>
					</S.FilterDropdown>
				</Panel>
			)}
		</>
	);
}
