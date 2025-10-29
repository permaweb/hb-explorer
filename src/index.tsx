import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import { App } from 'app';
import { GlobalStyle } from 'app/styles';
import { stripUrlProtocol } from 'helpers/utils';
import { ArweaveProvider } from 'providers/ArweaveProvider';
import { LanguageProvider } from 'providers/LanguageProvider';
import { PermawebProvider } from 'providers/PermawebProvider';
import { SettingsProvider } from 'providers/SettingsProvider';
import { persistor, store } from 'store';

const HYPERBEAM_BASE_URL_1 = 'https://dev-compute-1.forward.computer';
const HYPERBEAM_BASE_URL_2 = 'https://hb.portalinto.com';
const HYPERBEAM_RUN_NODE_URL =
	process.env.NODE_ENV === 'development' ? 'http://localhost:8734' : window.location.origin;
window.hyperbeamUrl = HYPERBEAM_BASE_URL_2;
document.title = stripUrlProtocol(window.hyperbeamUrl);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<Provider store={store}>
		<PersistGate loading={null} persistor={persistor}>
			<HashRouter>
				<SettingsProvider>
					<LanguageProvider>
						<ArweaveProvider>
							<PermawebProvider>
								<GlobalStyle />
								<App />
							</PermawebProvider>
						</ArweaveProvider>
					</LanguageProvider>
				</SettingsProvider>
			</HashRouter>
		</PersistGate>
	</Provider>
);
