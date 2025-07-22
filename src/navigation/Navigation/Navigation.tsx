import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { debounce } from 'lodash';

import { Types } from '@permaweb/libs';

import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Toggle } from 'components/atoms/Toggle';
import { TxAddress } from 'components/atoms/TxAddress';
import { ASSETS, STYLING, URLS } from 'helpers/config';
import { checkValidAddress, formatAddress, getTagValue } from 'helpers/utils';
import { checkWindowCutoff } from 'helpers/window';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { useSettingsProvider } from 'providers/SettingsProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function Navigation(props: { open: boolean; toggle: () => void }) {
	const location = useLocation();

	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { settings, updateSettings } = useSettingsProvider();

	const [_desktop, setDesktop] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.desktop)));

	const [searchOpen, setSearchOpen] = React.useState<boolean>(false);
	const [inputTxId, setInputTxId] = React.useState<string>('');
	const [txOutputOpen, setTxOutputOpen] = React.useState<boolean>(false);
	const [loadingTx, setLoadingTx] = React.useState<boolean>(false);
	const [txResponse, setTxResponse] = React.useState<Types.GQLNodeResponseType | null>(null);
	const [panelOpen, setPanelOpen] = React.useState<boolean>(false);

	const paths = React.useMemo(() => {
		return [
			{
				path: URLS.base,
				icon: ASSETS.app,
				label: language.dashboard,
			},
			{
				path: URLS.explorer,
				icon: ASSETS.explorer,
				label: language.explorer,
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
			if (inputTxId && checkValidAddress(inputTxId)) {
				setTxOutputOpen(true);
				setLoadingTx(true);
				try {
					const response = await permawebProvider.libs.getGQLData({
						ids: [inputTxId],
						tags: [
							{ name: 'Data-Protocol', values: ['ao'] },
							{ name: 'Variant', values: ['ao.TN.1'] },
						],
					});
					const responseData = response?.data?.[0];
					setTxResponse(responseData ?? null);
				} catch (e: any) {
					console.error(e);
				}
				setLoadingTx(false);
			} else {
				setTxResponse(null);
				setTxOutputOpen(false);
			}
		})();
	}, [inputTxId]);

	const searchOutput = React.useMemo(() => {
		if (loadingTx) {
			return (
				<S.SearchOutputPlaceholder>
					<p>{`${language.loading}...`}</p>
				</S.SearchOutputPlaceholder>
			);
		}

		if (txResponse) {
			const name = getTagValue(txResponse.node.tags, 'Name');
			return (
				<S.SearchResult>
					<Link
						to={`${URLS.explorer}${txResponse.node.id}`}
						onClick={() => {
							setTxResponse(null);
							setInputTxId('');
							setTxOutputOpen(false);
							setSearchOpen(false);
						}}
					>
						{name ?? formatAddress(txResponse.node.id, false)}
						<ReactSVG src={ASSETS.go} />
					</Link>
				</S.SearchResult>
			);
		}

		if (checkValidAddress(inputTxId)) {
			return (
				<S.SearchOutputPlaceholder>
					<p>{language.txNotFound}</p>
				</S.SearchOutputPlaceholder>
			);
		}

		return null;
	}, [loadingTx, txResponse]);

	function getSearch() {
		return (
			<S.SearchWrapper>
				<S.SearchInputWrapper>
					<ReactSVG src={ASSETS.search} />
					<FormField
						value={inputTxId}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputTxId(e.target.value)}
						onFocus={() => setTxOutputOpen(true)}
						placeholder={language.processOrMessageId}
						invalid={{ status: inputTxId ? !checkValidAddress(inputTxId) : false, message: null }}
						disabled={loadingTx}
						hideErrorMessage
						sm
					/>
				</S.SearchInputWrapper>
				{txOutputOpen && checkValidAddress(inputTxId) && <S.SearchOutputWrapper>{searchOutput}</S.SearchOutputWrapper>}
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
						<S.DOperator className={'border-wrapper-alt3'}>
							<span>Operator: </span>
							<TxAddress address={'uf_FqRvLqjnFMc8ZzGkF4qWKuNmUIQcYP0tPlCGORQk'} />
						</S.DOperator>
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
