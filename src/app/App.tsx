import React, { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

const views = (import.meta as any).glob('../views/**/index.tsx');

const Landing = getLazyImport('Landing');
const Explorer = getLazyImport('Explorer');
const NotFound = getLazyImport('NotFound');

import { DOM, LINKS, URLS } from 'helpers/config';
import { getDeviceNames } from 'helpers/deviceNames';
import { arweaveEndpoint } from 'helpers/endpoints';
import { Navigation } from 'navigation/Navigation';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useSettingsProvider } from 'providers/SettingsProvider';

import * as S from './styles';

function getLazyImport(view: string) {
	const key = `../views/${view}/index.tsx`;
	const loader = views[key];
	if (!loader) {
		throw new Error(`View not found: ${view}`);
	}

	return lazy(async () => {
		const module = await loader();
		return { default: module.default };
	});
}

export default function App() {
	const location = useLocation();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const { settings, updateSettings } = useSettingsProvider();

	React.useEffect(() => {
		const setFavicon = () => {
			const baseUrl = window.hyperbeamUrl || arweaveEndpoint;
			const lightFaviconId = 'yEzIy4fUp2LvpPWkZNDwZ9T8SUFG9QS0-76iKz8KwPo';
			const darkFaviconId = 'dXdeYzWRmWNq-yCyyRZTDeY6GPYkZXi9ILwGcHXtVis';

			const existingIcons = document.querySelectorAll('link[rel="icon"]');
			existingIcons.forEach((icon) => icon.remove());

			const defaultIcon = document.createElement('link');
			defaultIcon.rel = 'icon';
			defaultIcon.href = `${baseUrl}/${lightFaviconId}`;
			document.head.appendChild(defaultIcon);

			const lightIcon = document.createElement('link');
			lightIcon.rel = 'icon';
			lightIcon.href = `${baseUrl}/${lightFaviconId}`;
			lightIcon.media = '(prefers-color-scheme: light)';
			document.head.appendChild(lightIcon);

			const darkIcon = document.createElement('link');
			darkIcon.rel = 'icon';
			darkIcon.href = `${baseUrl}/${darkFaviconId}`;
			darkIcon.media = '(prefers-color-scheme: dark)';
			document.head.appendChild(darkIcon);
		};

		setFavicon();
	}, []);

	// Initialize device names cache on app startup
	React.useEffect(() => {
		getDeviceNames().catch((error) => {
			console.warn('Failed to preload device names:', error);
		});
	}, []);

	React.useEffect(() => {
		const { pathname, search, hash } = window.location;
		if (hash.startsWith('#/explorer')) return;
		if (pathname === '/' || pathname.includes('~hyperbuddy@1.0/index') || pathname === '') return;
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
		const baseRoutes = [URLS.docs, `URLS.docs/*`, `${URLS.docs}:active/*`, URLS.notFound, '*'];

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
			<div id={DOM.notification} />
			<div id={DOM.overlay} />
			<Suspense fallback={null}>
				<S.App>
					<Routes>
						{getRoute(URLS.base, <Landing />)}
						{getRoute(URLS.explorer, <Explorer />)}
						{getRoute(`${URLS.explorer}:rest/*`, <Explorer />)}
						{getRoute(URLS.notFound, <NotFound />)}
						{getRoute(`*`, <NotFound />)}
					</Routes>
				</S.App>
			</Suspense>
		</>
	);
}
