import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';
import NotFound from 'views/NotFound';

import { Button } from '../Button';

import * as S from './styles';
import { ICProps, ITProps, IUProps } from './types';

function Tab(props: ITProps) {
	function handlePress(e: any) {
		e.preventDefault();
		props.handlePress(props.url);
	}

	return (
		<S.Tab active={props.active}>
			<Button
				type={'primary'}
				label={props.label}
				handlePress={handlePress}
				active={props.active}
				icon={props.icon}
				iconLeftAlign
				height={32}
			/>
		</S.Tab>
	);
}

function TabContent(props: ICProps) {
	const { id, active } = useParams() as { id: string; active: string };

	let TabView: React.ComponentType<any> | null = null;
	for (let i = 0; i < props.tabs.length; i++) {
		const url = typeof props.tabs[i].url === 'function' ? props.tabs[i].url(id) : props.tabs[i].url;
		if (url.includes(active)) {
			TabView = props.tabs[i].view;
			break;
		}
	}

	if (!TabView) {
		TabView = NotFound;
	}

	return <S.View>{TabView && <TabView />}</S.View>;
}

export default function URLTabs(props: IUProps) {
	const navigate = useNavigate();
	const { id, active } = useParams() as { id: string; active: string };

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [urlCopied, setUrlCopied] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (!active && !props.disableAutoNavigation) {
			if (props.useHashNavigation) {
				window.location.hash = props.activeUrl;
			} else {
				navigate(props.activeUrl);
			}
		}
	}, [active, navigate, props.activeUrl, props.tabs, props.disableAutoNavigation, props.useHashNavigation]);

	const handleRedirect = (url: string) => {
		if (active !== url) {
			if (props.useHashNavigation) {
				window.location.hash = url;
			} else {
				navigate(url);
			}
		}
	};

	const copyUrl = React.useCallback(async () => {
		await navigator.clipboard.writeText(window.location.href);
		setUrlCopied(true);
		setTimeout(() => setUrlCopied(false), 2000);
	}, []);

	return (
		<S.Wrapper>
			<S.TabsHeader useFixed={props.useFixed ? props.useFixed : false} className={'scroll-wrapper'}>
				<S.Tabs>
					{props.tabs.map((elem, index) => {
						const url = typeof elem.url === 'function' ? elem.url(id) : elem.url;
						return (
							<Tab
								key={index}
								url={url}
								label={elem.label}
								icon={elem.icon}
								disabled={elem.disabled}
								active={url.includes(active)}
								handlePress={() => handleRedirect(url)}
							/>
						);
					})}
					<S.EndWrapper>
						{!props.noUrlCopy && (
							<Button
								type={'primary'}
								label={urlCopied ? `${language.copied}!` : language.copyFullUrl}
								handlePress={() => copyUrl()}
								icon={ASSETS.copy}
								iconLeftAlign
							/>
						)}
						{props.endComponent && props.endComponent}
					</S.EndWrapper>
				</S.Tabs>
			</S.TabsHeader>
			<S.Content>
				<TabContent tabs={props.tabs} />
			</S.Content>
		</S.Wrapper>
	);
}
