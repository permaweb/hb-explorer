import React, { Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { Loader } from 'components/atoms/Loader';
import { DOM, LINKS, URLS } from 'helpers/config';
import { getDeviceNames } from 'helpers/deviceNames';
import { Navigation } from 'navigation/Navigation';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useSettingsProvider } from 'providers/SettingsProvider';
import Explorer from 'views/Explorer';
import GraphQL from 'views/GraphQL';
import Landing from 'views/Landing';
import NotFound from 'views/NotFound';

import * as S from './styles';

export default function App() {
	const location = useLocation();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const { settings, updateSettings } = useSettingsProvider();

	const hasHiddenLoaderRef = React.useRef(false);

	React.useEffect(() => {
		if (!hasHiddenLoaderRef.current && settings) {
			hasHiddenLoaderRef.current = true;
			document.body.style.background = '';
			const loader = document.getElementById('app-loader');
			if (loader) {
				loader.style.display = 'none';
			}
		}
	}, [settings]);

	// Initialize device names cache on app startup
	React.useEffect(() => {
		getDeviceNames().catch((error) => {
			console.warn('Failed to preload device names:', error);
		});
	}, []);

	React.useEffect(() => {
		const { pathname, search, hash } = window.location;
		if (hash.startsWith('#/explorer')) return;
		if (hash.startsWith('#/graphql')) return;
		if (pathname === '/~query@1.0/graphql' || pathname === '/~query@1.0/graphql/') {
			window.location.replace(`${window.location.origin}${pathname}${search}#${URLS.graphql}`);
			return;
		}
		if (pathname === '/' || pathname.includes('~hyperbuddy@1.0/index') || pathname === '') return;
		if (pathname.startsWith(URLS.graphql)) return;
		window.location.replace(`${window.location.origin}/#${URLS.explorerBase}${pathname}${search}`);
	}, [location.pathname]);

	if (process.env.NODE_ENV === 'development') {
		const suppressed = 'ResizeObserver loop completed with undelivered notifications.';
		const origWarn = console.warn.bind(console);
		console.warn = (msg?: any, ...args: any[]) => {
			if (typeof msg === 'string' && msg.includes(suppressed)) {
				return;
			}
			origWarn(msg, ...args);
		};
		const origError = console.error.bind(console);
		console.error = (msg?: any, ...args: any[]) => {
			if (typeof msg === 'string' && msg.includes(suppressed)) {
				return;
			}
			origError(msg, ...args);
		};
	}

	function getRoute(path: string, element: React.ReactNode) {
		const baseRoutes = [URLS.notFound, '*'];

		if (baseRoutes.includes(path)) {
			return <Route path={path} element={element} />;
		}

		const view = (() => {
			return (
				<>
					<Navigation open={settings.sidebarOpen} toggle={() => updateSettings('sidebarOpen', !settings.sidebarOpen)} />
					<S.View navigationOpen={settings.sidebarOpen}>{element}</S.View>
					<S.ViewWrapper>
						<S.Footer navigationOpen={settings.sidebarOpen}>
							<p>{language.app}</p>
							<p>
								<a href={LINKS.github} target={'_blank'}>
									GitHub
								</a>
							</p>
						</S.Footer>
					</S.ViewWrapper>
				</>
			);
		})();

		return <Route path={path} element={view} />;
	}

	return (
		<>
			<div id={DOM.loader} />
			<div id={DOM.overlay} />
			<Suspense fallback={<Loader />}>
				<S.App>
					<Routes>
						{getRoute(URLS.base, <Landing />)}
						{getRoute(URLS.explorer, <Explorer />)}
						{getRoute(`${URLS.explorer}:id`, <Explorer />)}
						{getRoute(`${URLS.explorer}:id/:active`, <Explorer />)}
						{getRoute(`${URLS.explorer}:id/*`, <Explorer />)}
						{getRoute(URLS.graphql, <GraphQL />)}
						{getRoute(URLS.notFound, <NotFound />)}
						{getRoute(`*`, <NotFound />)}
					</Routes>
				</S.App>
			</Suspense>
		</>
	);
}
