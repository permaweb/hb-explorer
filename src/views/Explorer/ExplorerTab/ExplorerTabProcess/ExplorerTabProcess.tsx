import React from 'react';

import { URLTabs } from 'components/atoms/URLTabs';
import { ConsoleInstance } from 'components/organisms/ConsoleInstance';
import { ProcessEditor } from 'components/organisms/ProcessEditor';
import { ProcessSource } from 'components/organisms/ProcessSource';
import { ASSETS, URLS } from 'helpers/config';
import { ExplorerTabObjectType } from 'helpers/types';
import { stripUrlProtocol } from 'helpers/utils';
import { UseHyperBeamRequestReturn } from 'hooks/useHyperBeamRequest';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import { ExplorerTabProcessMessages } from './ExplorerTabProcessMessages';
import { ExplorerTabProcessOverview } from './ExplorerTabProcessOverview';
import * as S from './styles';

export default function ExplorerTabProcess(props: {
	tab: ExplorerTabObjectType;
	hyperBeamRequest: UseHyperBeamRequestReturn;
	refreshKey?: number;
}) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = React.useMemo(
		() => languageProvider.object[languageProvider.current],
		[languageProvider.object, languageProvider.current]
	);

	const [currentHash, setCurrentHash] = React.useState(() => window.location.hash.replace('#', ''));

	React.useEffect(() => {
		const handleHashChange = () => {
			setCurrentHash(window.location.hash.replace('#', ''));
		};

		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	}, []);

	const [owner, setOwner] = React.useState<string | null>(null);

	React.useEffect(() => {
		(async function () {
			if (arProvider.walletAddress && props.tab?.id && permawebProvider.libs?.getGQLData) {
				try {
					const response = await permawebProvider.libs.getGQLData({ ids: [props.tab.id] });
					const responseData = response?.data?.[0];
					setOwner(responseData?.node?.owner?.address);
				} catch (e: any) {
					console.error(e);
				}
			}
		})();
	}, [arProvider.walletAddress, props.tab?.id, permawebProvider.libs?.getGQLData]);

	// Memoize view components to prevent recreation
	const overviewView = React.useCallback(
		() => (
			<ExplorerTabProcessOverview
				tab={props.tab}
				headers={props.hyperBeamRequest?.headers}
				refreshKey={props.refreshKey}
			/>
		),
		[props.tab, props.hyperBeamRequest?.headers, props.refreshKey]
	);

	const messagesView = React.useCallback(
		() => (
			<ExplorerTabProcessMessages
				tab={props.tab}
				hyperBeamRequest={props.hyperBeamRequest}
				refreshKey={props.refreshKey}
			/>
		),
		[props.tab, props.refreshKey]
	);

	const readView = React.useCallback(() => <ProcessEditor processId={props.tab.id} type={'read'} />, [props.tab.id]);

	const writeView = React.useCallback(() => <ProcessEditor processId={props.tab.id} type={'write'} />, [props.tab.id]);

	const sourceView = React.useCallback(
		() => <ProcessSource processId={props.tab.id} onBoot={props.hyperBeamRequest?.headers?.['on-boot']?.data} />,
		[props.tab.id, props.hyperBeamRequest?.headers]
	);

	const consoleView = React.useCallback(
		() => <ConsoleInstance processId={props.tab.id} owner={owner} active={true} />,
		[props.tab.id, owner]
	);

	const tabs = React.useMemo(() => {
		const dynamicTabs = [
			{
				label: language.overview,
				icon: ASSETS.overview,
				disabled: false,
				url: URLS.explorerInfo(props.tab.id),
				view: overviewView,
			},
			{
				label: language.messages,
				icon: ASSETS.message,
				disabled: false,
				url: URLS.explorerMessages(props.tab.id),
				view: messagesView,
			},
			{
				label: language.read,
				icon: ASSETS.read,
				disabled: false,
				url: URLS.explorerRead(props.tab.id),
				view: readView,
			},
			{
				label: language.write,
				icon: ASSETS.write,
				disabled: false,
				url: URLS.explorerWrite(props.tab.id),
				view: writeView,
			},
			{
				label: language.source,
				icon: ASSETS.code,
				disabled: false,
				url: URLS.explorerSource(props.tab.id),
				view: sourceView,
			},
		];

		// if (arProvider.walletAddress && owner === arProvider.walletAddress) {
		// 	dynamicTabs.push({
		// 		label: language.aos,
		// 		icon: ASSETS.console,
		// 		disabled: false,
		// 		url: URLS.explorerAOS(props.tab.id),
		// 		view: consoleView,
		// 	});
		// }

		return dynamicTabs;
	}, [
		language,
		props.tab.id,
		owner,
		arProvider.walletAddress,
		overviewView,
		messagesView,
		readView,
		writeView,
		sourceView,
		consoleView,
	]);

	const headerActions = React.useMemo(
		() => (
			<S.PathInfoWrapper>
				<S.UpdateWrapper>
					<span>{stripUrlProtocol(window.hyperbeamUrl)}</span>
					<S.Indicator />
				</S.UpdateWrapper>
				{props.tab?.type && (
					<S.UpdateWrapper>
						<span>{props.tab.type}</span>
					</S.UpdateWrapper>
				)}
				{props.tab?.variant && (
					<S.UpdateWrapper>
						<span>{props.tab.variant}</span>
					</S.UpdateWrapper>
				)}
			</S.PathInfoWrapper>
		),
		[props.tab?.type, props.tab?.variant]
	);

	const processTabs = React.useMemo(() => {
		const matchingTab = tabs.find((tab) => tab.url === currentHash);
		const activeUrl = matchingTab ? matchingTab.url : tabs[0].url;
		return (
			<URLTabs
				tabs={tabs}
				activeUrl={activeUrl}
				disableAutoNavigation={true}
				useHashNavigation={true}
				endComponent={headerActions}
			/>
		);
	}, [tabs, currentHash, headerActions]);

	return <S.Wrapper>{processTabs}</S.Wrapper>;
}
