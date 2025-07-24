import React from 'react';
import { ReactSVG } from 'react-svg';

import { Types } from '@permaweb/libs';

import { Copyable } from 'components/atoms/Copyable';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Notification } from 'components/atoms/Notification';
import { URLTabs } from 'components/atoms/URLTabs';
import { MessageList } from 'components/molecules/MessageList';
import { MessageResult } from 'components/molecules/MessageResult';
import { ProcessRead } from 'components/molecules/ProcessRead';
import { ASSETS, DEFAULT_AO_TAGS, TAGS, URLS } from 'helpers/config';
import { TransactionType } from 'helpers/types';
import { checkValidAddress, formatCount, formatDate, getByteSizeDisplay, getTagValue } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import { ConsoleInstance } from '../ConsoleInstance';
import { ProcessEditor } from '../ProcessEditor';
import { ProcessSource } from '../ProcessSource';

import * as S from './styles';

export default function Transaction(props: {
	txId: string;
	type: TransactionType;
	active: boolean;
	onTxChange?: (newTx: Types.GQLNodeResponseType) => void;
	handleMessageOpen: (id: string) => void;
}) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const currentHash = window.location.hash.replace('#', '');

	const [inputTxId, setInputTxId] = React.useState<string>(props.txId);
	const [loadingTx, setLoadingTx] = React.useState<boolean>(false);
	const [txResponse, setTxResponse] = React.useState<Types.GQLNodeResponseType | null>(null);
	const [hasFetched, setHasFetched] = React.useState<boolean>(false);
	const [error, setError] = React.useState<string | null>(null);

	const [idCopied, setIdCopied] = React.useState<boolean>(false);

	const excludedTagNames = ['Type', 'Authority', 'Module', 'Scheduler'];
	const filteredTags =
		txResponse?.node?.tags?.filter((tag: { name: string }) => !excludedTagNames.includes(tag.name)) || [];

	React.useEffect(() => {
		setInputTxId(props.txId);
	}, [props.txId]);

	React.useEffect(() => {
		setHasFetched(false);
		setTxResponse(null);
	}, [inputTxId]);

	React.useEffect(() => {
		if (props.active && !hasFetched && inputTxId && checkValidAddress(inputTxId)) {
			(async () => {
				await handleSubmit();
				setHasFetched(true);
			})();
		}
	}, [props.active, hasFetched, inputTxId]);

	async function handleSubmit() {
		if (inputTxId && checkValidAddress(inputTxId)) {
			setLoadingTx(true);
			try {
				const response = await permawebProvider.libs.getGQLData({
					ids: [inputTxId],
					tags: [...DEFAULT_AO_TAGS],
				});
				const responseData = response?.data?.[0];
				setTxResponse(responseData ?? null);
				if (responseData) {
					if (props.onTxChange) props.onTxChange(responseData);
				} else {
					setError(language.txNotFound);
				}
			} catch (e: any) {
				setError(e.message ?? language.errorFetchingTx);
			}
			setLoadingTx(false);
		}
	}

	const copyAddress = React.useCallback(async (address: string) => {
		if (address?.length > 0) {
			await navigator.clipboard.writeText(address);
			setIdCopied(true);
			setTimeout(() => setIdCopied(false), 2000);
		}
	}, []);

	const OverviewLine = ({ label, value, render }: { label: string; value: any; render?: (v: any) => JSX.Element }) => {
		const defaultRender = (v: any) => {
			if (typeof v === 'string' && checkValidAddress(v)) {
				return <Copyable value={v} />;
			}
			return <p>{v}</p>;
		};

		const renderContent = render || defaultRender;

		return (
			<S.OverviewLine>
				<span>{label}</span>
				{value ? renderContent(value) : <p>-</p>}
			</S.OverviewLine>
		);
	};

	const TABS = React.useMemo(() => {
		const tabs = [
			{
				label: language.overview,
				icon: ASSETS.overview,
				disabled: false,
				url: URLS.explorerInfo(inputTxId),
				view: () => (
					<S.InfoWrapper>
						<S.TagsWrapper>
							<S.TagsSection className={'border-wrapper-primary'}>
								<S.SectionHeader>
									<p>{language.tags}</p>
								</S.SectionHeader>
								<S.OverviewWrapper>
									<OverviewLine
										label={language.type}
										value={txResponse?.node?.tags && getTagValue(txResponse.node.tags, 'Type')}
									/>
									<OverviewLine
										label={language.dateCreated}
										value={
											txResponse?.node?.block?.timestamp &&
											formatDate(txResponse.node.block.timestamp * 1000, 'timestamp')
										}
									/>
									<S.OverviewDivider />
									{props.type === 'process' && (
										<>
											<OverviewLine label={language.owner} value={txResponse?.node?.owner?.address} />
											<OverviewLine
												label={'Authority'}
												value={txResponse?.node?.tags && getTagValue(txResponse.node.tags, 'Authority')}
											/>
											<OverviewLine
												label={'Module'}
												value={txResponse?.node?.tags && getTagValue(txResponse.node.tags, 'Module')}
											/>
											<OverviewLine
												label={'Scheduler'}
												value={txResponse?.node?.tags && getTagValue(txResponse.node.tags, 'Scheduler')}
											/>
										</>
									)}
									{txResponse ? (
										<>
											{filteredTags.map((tag: { name: string; value: string }, index: number) => (
												<OverviewLine key={index} label={tag.name} value={tag.value} />
											))}
										</>
									) : (
										<S.OverviewLine>
											<span>{language.processOrMessageTagsInfo}</span>
										</S.OverviewLine>
									)}
								</S.OverviewWrapper>
							</S.TagsSection>
						</S.TagsWrapper>
						<S.ReadWrapper>
							{props.type === 'process' && <ProcessRead processId={inputTxId} autoRun={true} />}
							{props.type === 'message' && (
								<>
									<S.MessageInfo className={'border-wrapper-primary'}>
										<S.MessageInfoHeader>
											<p>{language.messageInfo}</p>
											<S.MessageInfoLine>
												<span>{`${language.id}: `}</span>
												<Copyable value={txResponse?.node?.id} />
											</S.MessageInfoLine>
										</S.MessageInfoHeader>
										<S.MessageInfoBody>
											<S.MessageInfoLine>
												<span>{`${language.from}: `}</span>
												<Copyable
													value={getTagValue(txResponse.node.tags, 'From-Process') ?? txResponse.node.owner.address}
												/>
											</S.MessageInfoLine>
											<S.MessageInfoLine>
												<span>{`${language.to}: `}</span>
												<Copyable value={txResponse?.node?.recipient} />
											</S.MessageInfoLine>
											<S.MessageInfoLine>
												<span>{`${language.owner}: `}</span>
												<Copyable value={txResponse?.node?.owner?.address} />
											</S.MessageInfoLine>
											<S.MessageInfoLine>
												<span>{`${language.blockHeight}: `}</span>
												<p>
													{txResponse?.node?.block?.height
														? formatCount(txResponse?.node?.block?.height.toString())
														: '-'}
												</p>
											</S.MessageInfoLine>
											<S.MessageInfoLine>
												<span>{`${language.timestamp}: `}</span>
												<p>{txResponse?.node?.block?.timestamp ?? '-'}</p>
											</S.MessageInfoLine>
											<S.MessageInfoLine>
												<span>{`${language.size}: `}</span>
												<p>{getByteSizeDisplay(Number(txResponse?.node?.data?.size) ?? 0)}</p>
											</S.MessageInfoLine>
										</S.MessageInfoBody>
									</S.MessageInfo>
									<MessageResult
										processId={txResponse?.node?.recipient}
										messageId={inputTxId}
										variant={getTagValue(txResponse.node.tags, TAGS.keys.variant)}
									/>
								</>
							)}
						</S.ReadWrapper>
					</S.InfoWrapper>
				),
			},
			{
				label: language.messages,
				icon: ASSETS.message,
				disabled: false,
				url: URLS.explorerMessages(inputTxId),
				view: () => (
					<S.MessagesWrapper>
						<S.MessagesSection>
							{inputTxId && checkValidAddress(inputTxId) && (
								<MessageList
									txId={inputTxId}
									type={props.type}
									recipient={props.type === 'message' ? txResponse?.node?.recipient : null}
									parentId={inputTxId}
									handleMessageOpen={(id: string) => props.handleMessageOpen(id)}
								/>
							)}
						</S.MessagesSection>
					</S.MessagesWrapper>
				),
			},
		];

		if (props.type === 'process') {
			tabs.push(
				{
					label: language.read,
					icon: ASSETS.read,
					disabled: false,
					url: URLS.explorerRead(inputTxId),
					view: () => <ProcessEditor processId={inputTxId} type={'read'} />,
				},
				{
					label: language.write,
					icon: ASSETS.write,
					disabled: false,
					url: URLS.explorerWrite(inputTxId),
					view: () => <ProcessEditor processId={inputTxId} type={'write'} />,
				},
				{
					label: language.source,
					icon: ASSETS.code,
					disabled: false,
					url: URLS.explorerSource(inputTxId),
					view: () => (
						<ProcessSource processId={inputTxId} onBoot={getTagValue(txResponse?.node?.tags, TAGS.keys.onBoot)} />
					),
				}
			);

			if (arProvider.walletAddress && txResponse?.node?.owner?.address === arProvider.walletAddress) {
				tabs.push({
					label: language.aos,
					icon: ASSETS.console,
					disabled: false,
					url: URLS.explorerAOS(inputTxId),
					view: () => <ConsoleInstance processId={inputTxId} active={true} />,
				});
			}
		}

		return tabs;
	}, [props.type, inputTxId, txResponse, arProvider.walletAddress, language]);

	const transactionTabs = React.useMemo(() => {
		const matchingTab = TABS.find((tab) => tab.url === currentHash);
		const activeUrl = matchingTab ? matchingTab.url : TABS[0].url;
		return <URLTabs tabs={TABS} activeUrl={activeUrl} />;
	}, [TABS]);

	function getTransaction() {
		if (!inputTxId || !txResponse) {
			return (
				<S.Placeholder>
					<S.PlaceholderIcon>
						<ReactSVG src={ASSETS.process} />
					</S.PlaceholderIcon>
					<S.PlaceholderDescription>
						<p>{loadingTx ? `${language.loading}...` : language.processOrMessageId}</p>
					</S.PlaceholderDescription>
				</S.Placeholder>
			);
		}

		return transactionTabs;
	}

	return props.active ? (
		<>
			<S.Wrapper>
				<S.HeaderWrapper>
					<S.SearchWrapper>
						<S.SearchInputWrapper>
							<ReactSVG src={ASSETS.search} />
							<FormField
								value={inputTxId}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputTxId(e.target.value)}
								placeholder={language.processOrMessageId}
								invalid={{ status: inputTxId ? !checkValidAddress(inputTxId) : false, message: null }}
								disabled={loadingTx}
								autoFocus
								hideErrorMessage
								sm
							/>
						</S.SearchInputWrapper>
						<IconButton
							type={'alt1'}
							src={ASSETS.copy}
							handlePress={() => copyAddress(inputTxId)}
							disabled={!checkValidAddress(inputTxId)}
							dimensions={{
								wrapper: 32.5,
								icon: 17.5,
							}}
							tooltip={idCopied ? `${language.copied}!` : language.copyId}
						/>
						<IconButton
							type={'alt1'}
							src={ASSETS.refresh}
							handlePress={() => handleSubmit()}
							disabled={loadingTx || !checkValidAddress(inputTxId)}
							dimensions={{
								wrapper: 32.5,
								icon: 17.5,
							}}
							tooltip={loadingTx ? `${language.loading}...` : language.refresh}
						/>
					</S.SearchWrapper>
					<S.HeaderActionsWrapper>
						<S.TxInfoWrapper>
							{props.type && (
								<S.UpdateWrapper>
									<span>{props.type}</span>
								</S.UpdateWrapper>
							)}
							{txResponse?.node?.tags && (
								<S.UpdateWrapper>
									<span>{getTagValue(txResponse.node.tags, 'Variant')}</span>
								</S.UpdateWrapper>
							)}
							{txResponse?.node?.block?.timestamp && (
								<S.UpdateWrapper>
									<span>{formatDate(txResponse?.node?.block?.timestamp * 1000, 'timestamp')}</span>
								</S.UpdateWrapper>
							)}
						</S.TxInfoWrapper>
					</S.HeaderActionsWrapper>
				</S.HeaderWrapper>
				<S.BodyWrapper>{getTransaction()}</S.BodyWrapper>
			</S.Wrapper>
			{error && (
				<Notification
					type={'warning'}
					message={error}
					callback={() => {
						setError(null);
					}}
				/>
			)}
		</>
	) : null;
}
