import React from 'react';

import { URLTabs } from 'components/atoms/URLTabs';
import { ASSETS, URLS } from 'helpers/config';
import { ExplorerTabObjectType } from 'helpers/types';
import { UseHyperBeamRequestReturn } from 'hooks/useHyperBeamRequest';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { ExplorerTabProcessMessages } from './ExplorerTabProcessMessages';
import { ExplorerTabProcessOverview } from './ExplorerTabProcessOverview';
import * as S from './styles';

export default function ExplorerTabProcess(props: {
	tab: ExplorerTabObjectType;
	hyperBeamRequest: UseHyperBeamRequestReturn;
	refreshKey?: number;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const currentHash = window.location.hash.replace('#', '');

	const tabs = React.useMemo(() => {
		return [
			{
				label: language.overview,
				icon: ASSETS.overview,
				disabled: false,
				url: URLS.explorerInfo(props.tab.id),
				view: () => (
					<ExplorerTabProcessOverview
						tab={props.tab}
						headers={props.hyperBeamRequest?.headers}
						refreshKey={props.refreshKey}
					/>
				),
			},
			{
				label: language.messages,
				icon: ASSETS.message,
				disabled: false,
				url: URLS.explorerMessages(props.tab.id),
				view: () => (
					<ExplorerTabProcessMessages
						tab={props.tab}
						hyperBeamRequest={props.hyperBeamRequest}
						refreshKey={props.refreshKey}
					/>
				),
			},
			{
				label: language.read,
				icon: ASSETS.read,
				disabled: false,
				url: URLS.explorerRead(props.tab.id),
				// view: () => <ProcessEditor processId={inputTxId} type={'read'} />,
				view: () => <p></p>,
			},
			{
				label: language.write,
				icon: ASSETS.write,
				disabled: false,
				url: URLS.explorerWrite(props.tab.id),
				// view: () => <ProcessEditor processId={inputTxId} type={'write'} />,
				view: () => <p></p>,
			},
			{
				label: language.source,
				icon: ASSETS.code,
				disabled: false,
				url: URLS.explorerSource(props.tab.id),
				// view: () => (
				// 	<ProcessSource processId={inputTxId} onBoot={getTagValue(txResponse?.node?.tags, TAGS.keys.onBoot)} />
				// ),
				view: () => <p></p>,
			},
		];
	}, [props.tab.id, props.refreshKey, props.hyperBeamRequest?.headers]);

	const processTabs = React.useMemo(() => {
		const matchingTab = tabs.find((tab) => tab.url === currentHash);
		const activeUrl = matchingTab ? matchingTab.url : tabs[0].url;
		return <URLTabs tabs={tabs} activeUrl={activeUrl} disableAutoNavigation={true} useHashNavigation={true} />;
	}, [tabs]);

	return <S.Wrapper>{processTabs}</S.Wrapper>;
}
