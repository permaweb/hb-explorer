import React from 'react';
import { ReactSVG } from 'react-svg';

import { Avatar } from 'components/atoms/Avatar';
import { Panel } from 'components/atoms/Panel';
import { ASSETS } from 'helpers/config';
import { darkTheme, lightTheme } from 'helpers/themes';
import { formatAddress } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { useSettingsProvider } from 'providers/SettingsProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function WalletConnect(_props: { callback?: () => void }) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const { settings, updateSettings } = useSettingsProvider();

	const [showWallet, setShowWallet] = React.useState<boolean>(false);
	const [showWalletDropdown, setShowWalletDropdown] = React.useState<boolean>(false);
	const [showThemeSelector, setShowThemeSelector] = React.useState<boolean>(false);
	const [copied, setCopied] = React.useState<boolean>(false);

	const [label, setLabel] = React.useState<string | null>(null);

	React.useEffect(() => {
		setTimeout(() => {
			setShowWallet(true);
		}, 200);
	}, [arProvider.walletAddress]);

	React.useEffect(() => {
		if (!showWallet) {
			setLabel(`${language.fetching}...`);
		} else {
			if (arProvider.walletAddress) {
				if (permawebProvider.profile && permawebProvider.profile.username) {
					setLabel(permawebProvider.profile.username);
				} else {
					setLabel(formatAddress(arProvider.walletAddress, false));
				}
			} else {
				setLabel(language.connect);
			}
		}
	}, [showWallet, arProvider.walletAddress, permawebProvider.profile]);

	const copyAddress = React.useCallback(async (address: string) => {
		if (address) {
			if (address.length > 0) {
				await navigator.clipboard.writeText(address);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			}
		}
	}, []);

	function handlePress() {
		if (arProvider.walletAddress) {
			setShowWalletDropdown(!showWalletDropdown);
		} else {
			arProvider.setWalletModalVisible(true);
		}
	}

	function handleDisconnect() {
		arProvider.handleDisconnect();
		setShowWalletDropdown(false);
	}

	const THEMES = {
		light: {
			label: 'Light themes',
			icon: ASSETS.light,
			variants: [
				{
					id: 'light-primary',
					name: 'Light Default',
					background: lightTheme.neutral1,
					accent1: lightTheme.primary1,
				},
			],
		},
		dark: {
			label: 'Dark themes',
			icon: ASSETS.dark,
			variants: [
				{
					id: 'dark-primary',
					name: 'Dark Default',
					background: darkTheme.neutral1,
					accent1: darkTheme.primary1,
				},
			],
		},
	};

	return (
		<>
			<CloseHandler
				callback={() => {
					setShowWalletDropdown(false);
				}}
				active={showWalletDropdown}
				disabled={!showWalletDropdown}
			>
				<S.Wrapper>
					<S.PWrapper>
						<Avatar owner={permawebProvider.profile} dimensions={{ wrapper: 35, icon: 21.5 }} callback={handlePress} />
					</S.PWrapper>
					{showWalletDropdown && (
						<S.Dropdown className={'border-wrapper-alt1 fade-in scroll-wrapper'}>
							<S.DHeaderWrapper>
								<S.DHeaderFlex>
									<Avatar owner={permawebProvider.profile} dimensions={{ wrapper: 32.5, icon: 19.5 }} callback={null} />
									<S.DHeader>
										<p>{label}</p>
									</S.DHeader>
								</S.DHeaderFlex>
							</S.DHeaderWrapper>
							<S.DBodyWrapper>
								<li onClick={() => copyAddress(arProvider.walletAddress)}>
									<ReactSVG src={ASSETS.copy} />
									{copied ? `${language.copied}!` : language.walletAddress}
								</li>
								<li onClick={() => permawebProvider.setShowProfileManager(true)}>
									<ReactSVG src={ASSETS.write} />
									{language.profile}
								</li>
								<li onClick={() => setShowThemeSelector(true)}>
									<ReactSVG src={ASSETS.design} />
									{language.appearance}
								</li>
							</S.DBodyWrapper>
							<S.DFooterWrapper>
								<li onClick={handleDisconnect}>
									<ReactSVG src={ASSETS.disconnect} />
									{language.disconnect}
								</li>
							</S.DFooterWrapper>
						</S.Dropdown>
					)}
				</S.Wrapper>
			</CloseHandler>
			<Panel
				open={showThemeSelector}
				width={430}
				header={language.chooseAppAppearance}
				handleClose={() => setShowThemeSelector(false)}
			>
				<S.MWrapper className={'modal-wrapper'}>
					{Object.entries(THEMES).map(([key, theme]) => (
						<S.ThemeSection key={key}>
							<S.ThemeSectionHeader>
								<ReactSVG src={theme.icon} />
								<p>{theme.label}</p>
							</S.ThemeSectionHeader>
							<S.ThemeSectionBody>
								{theme.variants.map((variant) => (
									<S.ThemeSectionBodyElement
										key={variant.id}
										onClick={() => updateSettings('theme', variant.id as any)}
									>
										<S.Preview background={variant.background} accent={variant.accent1}>
											<div id={'preview-accent-1'} />
										</S.Preview>
										<div>
											<S.Indicator active={settings.theme === variant.id} />
											<p>{variant.name}</p>
										</div>
									</S.ThemeSectionBodyElement>
								))}
							</S.ThemeSectionBody>
						</S.ThemeSection>
					))}
				</S.MWrapper>
			</Panel>
		</>
	);
}
