import React from 'react';

import Arweave from 'arweave';
import { connect, createSigner } from '@permaweb/aoconnect';
import Permaweb, { Types } from '@permaweb/libs';

import { Panel } from 'components/atoms/Panel';
import { ProfileManager } from 'components/organisms/ProfileManager';
import { HB_ENDPOINTS } from 'helpers/config';
import { hbFetch } from 'helpers/utils';

import { useArweaveProvider } from './ArweaveProvider';
import { useLanguageProvider } from './LanguageProvider';

interface PermawebContextState {
	deps: { ao: any; arweave: any; signer: any };
	libs: any;
	profile: Types.ProfileType;
	showProfileManager: boolean;
	setShowProfileManager: (toggle: boolean) => void;
	refreshProfile: () => void;
	nodeOperator: string | null;
}

const DEFAULT_CONTEXT = {
	deps: null,
	libs: null,
	profile: null,
	showProfileManager: false,
	setShowProfileManager(_toggle: boolean) {},
	refreshProfile() {},
	nodeOperator: null,
};

const PermawebContext = React.createContext<PermawebContextState>(DEFAULT_CONTEXT);

export function usePermawebProvider(): PermawebContextState {
	return React.useContext(PermawebContext);
}

export function PermawebProvider(props: { children: React.ReactNode }) {
	const arProvider = useArweaveProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [libs, setLibs] = React.useState<any>(null);
	const [deps, setDeps] = React.useState<any>(null);

	const [profile, _setProfile] = React.useState<Types.ProfileType | null>(null);
	const [showProfileManager, setShowProfileManager] = React.useState<boolean>(false);
	const [_refreshProfileTrigger, setRefreshProfileTrigger] = React.useState<boolean>(false);
	const [nodeOperator, setNodeOperator] = React.useState<string | null>(null);

	React.useEffect(() => {
		(async function () {
			try {
				const signer = createSigner(arProvider.wallet);

				let ao: any;

				ao = connect({
					MODE: 'mainnet',
					URL: window.hyperbeamUrl,
					signer,
				});

				const operator = await hbFetch(HB_ENDPOINTS.operator);
				setNodeOperator(operator);

				const dependencies = {
					ao: ao,
					arweave: Arweave.init({}),
					signer: signer,
					node: {
						url: window.hyperbeamUrl,
						scheduler: operator,
					},
				};

				setDeps(dependencies);

				const initializedLibs = Permaweb.init(dependencies);
				setLibs(initializedLibs);
			} catch (error) {
				console.error('Error in PermawebProvider initialization:', error);
			}
		})();
	}, [arProvider.wallet]);

	// React.useEffect(() => {
	// 	(async function () {
	// 		if (libs?.getProfileByWalletAddress) {
	// 			if (!arProvider.walletAddress) {
	// 				// Clear profile when wallet disconnects
	// 				setProfile(null);
	// 				return;
	// 			}

	// 			const cachedProfile = getCachedProfile(arProvider.walletAddress);

	// 			if (cachedProfile) {
	// 				setProfile(cachedProfile);
	// 			}

	// 			try {
	// 				const freshProfile = await resolveProfile(arProvider.walletAddress);
	// 				if (freshProfile) {
	// 					setProfile(freshProfile);
	// 				}
	// 			} catch (e: any) {
	// 				console.error('Failed to fetch fresh profile:', e);
	// 			}
	// 		}
	// 	})();
	// }, [arProvider.walletAddress, libs?.getProfileByWalletAddress]);

	// React.useEffect(() => {
	// 	(async function () {
	// 		if (arProvider.wallet && arProvider.walletAddress) {
	// 			const fetchProfileUntilChange = async () => {
	// 				let changeDetected = false;
	// 				let tries = 0;
	// 				const maxTries = 10;

	// 				while (!changeDetected && tries < maxTries) {
	// 					try {
	// 						const existingProfile = profile;
	// 						const newProfile = await resolveProfile(arProvider.walletAddress);

	// 						if (newProfile && JSON.stringify(existingProfile) !== JSON.stringify(newProfile)) {
	// 							setProfile(newProfile);
	// 							cacheProfile(arProvider.walletAddress, newProfile);
	// 							changeDetected = true;
	// 						} else {
	// 							await new Promise((resolve) => setTimeout(resolve, 1000));
	// 							tries++;
	// 						}
	// 					} catch (error) {
	// 						console.error(error);
	// 						break;
	// 					}
	// 				}

	// 				if (!changeDetected) {
	// 					console.warn(`No changes detected after ${maxTries} attempts`);
	// 				}
	// 			};

	// 			await fetchProfileUntilChange();
	// 		}
	// 	})();
	// }, [refreshProfileTrigger]);

	// async function resolveProfile(address: string) {
	// 	if (libs) {
	// 		try {
	// 			let fetchedProfile: any;
	// 			const cachedProfile = getCachedProfile(address);
	// 			if (cachedProfile?.id) fetchedProfile = await libs.getProfileById(cachedProfile.id);
	// 			else fetchedProfile = await libs.getProfileByWalletAddress(address);
	// 			let profileToUse = { ...fetchedProfile };

	// 			if (!fetchedProfile?.id && cachedProfile) profileToUse = cachedProfile;
	// 			cacheProfile(address, profileToUse);

	// 			return profileToUse;
	// 		} catch (e: any) {
	// 			console.error(e);
	// 		}
	// 	}
	// }

	// function getCachedProfile(address: string) {
	// 	const cached = localStorage.getItem(STORAGE.profileByWallet(address));
	// 	return cached ? JSON.parse(cached) : null;
	// }

	// function cacheProfile(address: string, profileData: any) {
	// 	if (profileData) localStorage.setItem(STORAGE.profileByWallet(address), JSON.stringify(profileData));
	// }

	return (
		<PermawebContext.Provider
			value={{
				deps: deps,
				libs: libs,
				profile: profile,
				showProfileManager,
				setShowProfileManager,
				refreshProfile: () => setRefreshProfileTrigger((prev) => !prev),
				nodeOperator: nodeOperator,
			}}
		>
			{props.children}
			<Panel
				open={showProfileManager}
				header={profile && profile.id ? language.editProfile : `${language.createProfile}!`}
				handleClose={() => setShowProfileManager(false)}
				width={575}
				closeHandlerDisabled
			>
				<ProfileManager
					profile={profile && profile.id ? profile : null}
					handleClose={() => setShowProfileManager(false)}
					handleUpdate={null}
				/>
			</Panel>
		</PermawebContext.Provider>
	);
}
