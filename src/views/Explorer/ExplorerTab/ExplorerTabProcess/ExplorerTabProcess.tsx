import React from 'react';

import { URLTabs } from 'components/atoms/URLTabs';
import { ASSETS, URLS } from 'helpers/config';
import { ExplorerTabObjectType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { ExplorerTabProcessMessages } from './ExplorerTabProcessMessages';
import * as S from './styles';

export default function ExplorerTabProcess(props: {
	tab: ExplorerTabObjectType;
	// onSubPathChange?: (subPath: string) => void;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const currentHash = window.location.hash.replace('#', '');

	// React.useEffect(() => {
	// 	const handleHashChange = () => {
	// 		const newHash = window.location.hash.replace('#', '');
	// 		console.log('Hash changed:', newHash);
	// 		if (props.onSubPathChange && newHash && props.tab.id) {
	// 			// Extract only the subpath after the ID (e.g., "/messages" from "/explorer/ID/messages")
	// 			const parts = newHash.split('/');
	// 			const idIndex = parts.findIndex(part => part === props.tab.id);
	// 			console.log('Parts:', parts, 'ID index:', idIndex);
	// 			if (idIndex !== -1 && idIndex < parts.length - 1) {
	// 				const subPath = '/' + parts.slice(idIndex + 1).join('/');
	// 				console.log('Extracted subPath:', subPath);
	// 				props.onSubPathChange(subPath);
	// 			}
	// 		}
	// 	};

	// 	window.addEventListener('hashchange', handleHashChange);
	// 	return () => {
	// 		window.removeEventListener('hashchange', handleHashChange);
	// 	};
	// }, [props.onSubPathChange, props.tab.id]);

	const tabs = React.useMemo(() => {
		return [
			// {
			// 	label: language.overview,
			// 	icon: ASSETS.overview,
			// 	disabled: false,
			// 	url: URLS.explorerInfo(props.tab.id),
			// 	view: () => <p>Overview</p>,
			// },
			{
				label: language.messages,
				icon: ASSETS.message,
				disabled: false,
				url: URLS.explorerMessages(props.tab.id),
				view: () => <ExplorerTabProcessMessages tab={props.tab} />,
			},
		];
	}, [props.tab]);

	const processTabs = React.useMemo(() => {
		const matchingTab = tabs.find((tab) => tab.url === currentHash);
		const activeUrl = matchingTab ? matchingTab.url : tabs[0].url;
		return <URLTabs tabs={tabs} activeUrl={activeUrl} disableAutoNavigation={true} useHashNavigation={true} />;
	}, [tabs]);

	return <S.Wrapper>{processTabs}</S.Wrapper>;
}
