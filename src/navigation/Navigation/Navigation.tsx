import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { debounce } from 'lodash';

import { Copyable } from 'components/atoms/Copyable';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Toggle } from 'components/atoms/Toggle';
import { ASSETS, HB_ENDPOINTS, STYLING, URLS } from 'helpers/config';
import { checkValidAddress, hbFetch } from 'helpers/utils';
import { checkWindowCutoff } from 'helpers/window';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useSettingsProvider } from 'providers/SettingsProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function Navigation(props: { open: boolean; toggle: () => void }) {
	const navigate = useNavigate();
	const location = useLocation();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { settings, updateSettings } = useSettingsProvider();

	const [_desktop, setDesktop] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.desktop)));

	const [operatorAddress, setOperatorAddress] = React.useState<string | null>(null);
	const [searchOpen, setSearchOpen] = React.useState<boolean>(false);
	const [inputPath, setInputPath] = React.useState<string>('');
	const [txOutputOpen, setTxOutputOpen] = React.useState<boolean>(false);
	const [loadingPath, setLoadingTx] = React.useState<boolean>(false);
	const [panelOpen, setPanelOpen] = React.useState<boolean>(false);

	const paths = React.useMemo(() => {
		return [
			{
				path: URLS.base,
				label: language.dashboard,
			},
			{
				path: URLS.explorer,
				label: language.explorer,
			},
			{
				path: URLS.nodes,
				label: language.nodes,
			},
		];
	}, []);

	function handleWindowResize() {
		if (checkWindowCutoff(parseInt(STYLING.cutoffs.desktop))) {
			setDesktop(true);
		} else {
			setDesktop(false);
		}
	}

	const debouncedResize = React.useCallback(debounce(handleWindowResize, 0), []);

	React.useEffect(() => {
		window.addEventListener('resize', debouncedResize);

		return () => {
			window.removeEventListener('resize', debouncedResize);
		};
	}, [debouncedResize]);

	React.useEffect(() => {
		(async function () {
			try {
				const address = await hbFetch(HB_ENDPOINTS.operator);
				setOperatorAddress(address);
			} catch (e: any) {
				console.error(e);
				setOperatorAddress('Error');
			}
		})();
	}, []);

	function getSearch() {
		return (
			<S.SearchWrapper>
				<S.SearchInputWrapper>
					<ReactSVG src={ASSETS.search} />
					<FormField
						value={inputPath}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputPath(e.target.value)}
						onFocus={() => setTxOutputOpen(true)}
						placeholder={language.pathOrId}
						invalid={{ status: false, message: null }}
						disabled={loadingPath}
						hideErrorMessage
						sm
					/>
				</S.SearchInputWrapper>
				<S.SubmitWrapper>
					<IconButton
						type={'primary'}
						src={ASSETS.go}
						handlePress={() => {
							navigate(`${URLS.explorer}${inputPath}`);
							setInputPath('');
						}}
						disabled={loadingPath || !inputPath}
						dimensions={{
							wrapper: 32.5,
							icon: 17.5,
						}}
						tooltip={loadingPath ? `${language.loading}...` : language.run}
					/>
				</S.SubmitWrapper>
			</S.SearchWrapper>
		);
	}

	return (
		<>
			<S.Header id={'navigation-header'} navigationOpen={props.open} className={'fade-in'}>
				<S.Content>
					<S.C1Wrapper>
						<S.LogoWrapper>
							<Link to={URLS.base}>
								<img src={ASSETS.logo} />
							</Link>
						</S.LogoWrapper>
						<S.DNavWrapper>
							{paths.map((element: { path: string; label: string; target?: '_blank' }, index: number) => {
								const active =
									element.path === URLS.base
										? location.pathname === URLS.base
										: location.pathname.startsWith(element.path);
								return (
									<S.DNavLink key={index} active={active}>
										<Link to={element.path} target={element.target || ''}>
											{element.label}
										</Link>
									</S.DNavLink>
								);
							})}
						</S.DNavWrapper>
					</S.C1Wrapper>
					<S.DSearchWrapper>
						<CloseHandler
							callback={() => {
								setTxOutputOpen(false);
							}}
							active={txOutputOpen}
							disabled={!txOutputOpen}
						>
							{getSearch()}
						</CloseHandler>
					</S.DSearchWrapper>
					<S.ActionsWrapper>
						<S.DOperator>
							{operatorAddress ? (
								<>
									{checkValidAddress(operatorAddress) ? (
										<Copyable value={operatorAddress} helpText={'Operator'} />
									) : (
										<span>{operatorAddress}</span>
									)}
								</>
							) : (
								<span>Loading...</span>
							)}
						</S.DOperator>
						<S.MSearchWrapper>
							<CloseHandler active={searchOpen} disabled={!searchOpen} callback={() => setSearchOpen(false)}>
								<IconButton
									type={'alt1'}
									src={ASSETS.search}
									handlePress={() => setSearchOpen((prev) => !prev)}
									dimensions={{
										wrapper: 36.5,
										icon: 15.5,
									}}
								/>
								{searchOpen && (
									<S.MSearchContainer className={'border-wrapper-alt1'}>
										<S.MSearchHeader>
											<p>{language.search}</p>
										</S.MSearchHeader>
										{getSearch()}
									</S.MSearchContainer>
								)}
							</CloseHandler>
						</S.MSearchWrapper>
						<S.MMenuWrapper>
							<IconButton
								type={'alt1'}
								src={ASSETS.menu}
								handlePress={() => setPanelOpen(true)}
								dimensions={{
									wrapper: 36.5,
									icon: 18.5,
								}}
							/>
						</S.MMenuWrapper>
						<Toggle
							options={[
								{ label: 'light-primary', icon: ASSETS.light },
								{ label: 'dark-primary', icon: ASSETS.dark },
							]}
							activeOption={settings.theme}
							handleToggle={(option: string) => updateSettings('theme', option as any)}
							disabled={false}
						/>
					</S.ActionsWrapper>
				</S.Content>
			</S.Header>
			{panelOpen && (
				<div className={'overlay'}>
					<S.PWrapper className={'border-wrapper-primary'}>
						<CloseHandler active={panelOpen} disabled={!panelOpen} callback={() => setPanelOpen(false)}>
							<S.PMenu>
								<S.PHeader>
									<h4>{language.goTo}</h4>
									<IconButton
										type={'primary'}
										src={ASSETS.close}
										handlePress={() => setPanelOpen(false)}
										dimensions={{
											wrapper: 35,
											icon: 20,
										}}
										tooltip={language.close}
									/>
								</S.PHeader>
								<S.MNavWrapper>
									{paths.map((element: { path: string; label: string; target?: '_blank' }, index: number) => {
										return (
											<Link
												key={index}
												to={element.path}
												target={element.target || ''}
												onClick={() => setPanelOpen(false)}
											>
												{element.label}
											</Link>
										);
									})}
								</S.MNavWrapper>
							</S.PMenu>
						</CloseHandler>
					</S.PWrapper>
				</div>
			)}
		</>
	);
}
