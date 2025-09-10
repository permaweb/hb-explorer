import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { debounce } from 'lodash';

import { Copyable } from 'components/atoms/Copyable';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { AutocompleteDropdown } from 'components/molecules/AutocompleteDropdown';
import { ASSETS, HB_ENDPOINTS, STYLING, URLS } from 'helpers/config';
import { checkValidAddress, hbFetch } from 'helpers/utils';
import { checkWindowCutoff } from 'helpers/window';
import { useDeviceAutocomplete } from 'hooks/useDeviceAutocomplete';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { WalletConnect } from 'wallet/WalletConnect';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function Navigation(props: { open: boolean; toggle: () => void }) {
	const navigate = useNavigate();
	const location = useLocation();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [_desktop, setDesktop] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.desktop)));

	const [operatorAddress, setOperatorAddress] = React.useState<string | null>(null);
	const [searchOpen, setSearchOpen] = React.useState<boolean>(false);
	const [inputPath, setInputPath] = React.useState<string>('');
	const [txOutputOpen, setTxOutputOpen] = React.useState<boolean>(false);
	const [loadingPath, _setLoadingTx] = React.useState<boolean>(false);
	const [panelOpen, setPanelOpen] = React.useState<boolean>(false);
	const [cursorPosition, setCursorPosition] = React.useState<number>(0);
	const inputRef = React.useRef<HTMLInputElement>(null);

	// Use shared autocomplete hook
	const { showAutocomplete, autocompleteOptions, selectedOptionIndex, handleKeyDown, acceptAutocomplete } =
		useDeviceAutocomplete({
			inputValue: inputPath,
			cursorPosition,
			inputRef,
			onValueChange: (value, newCursorPosition) => {
				setInputPath(value);
				setCursorPosition(newCursorPosition);
			},
			onAutoSubmit: (completedPath) => {
				const pathToUse = completedPath || inputPath;
				if (pathToUse) {
					navigate(`${URLS.explorer}${pathToUse}`);
					setInputPath('');
				}
			},
		});

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

	React.useEffect(() => {
		const handleGlobalKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};

		document.addEventListener('keydown', handleGlobalKeyDown);

		return () => {
			document.removeEventListener('keydown', handleGlobalKeyDown);
		};
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		const newCursorPosition = e.target.selectionStart || 0;

		setInputPath(newValue);
		setCursorPosition(newCursorPosition);
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && inputPath) {
			navigate(`${URLS.explorer}${inputPath}`);
			setInputPath('');
		}
	};

	function getSearch() {
		return (
			<S.SearchWrapper>
				<S.SearchInputWrapper cacheStatus={'default'}>
					<ReactSVG src={ASSETS.search} />
					<FormField
						ref={inputRef}
						value={inputPath}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						onKeyPress={handleKeyPress}
						onFocus={() => setTxOutputOpen(true)}
						placeholder={language.pathOrId}
						invalid={{ status: false, message: null }}
						disabled={loadingPath}
						hideErrorMessage
						sm
					/>
					<AutocompleteDropdown
						options={autocompleteOptions}
						selectedIndex={selectedOptionIndex}
						onSelect={acceptAutocomplete}
						visible={showAutocomplete}
						showTabHint={true}
						inputRef={inputRef}
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
						{operatorAddress && checkValidAddress(operatorAddress) && (
							<S.DOperator className={'fade-in'}>
								<Copyable value={operatorAddress} helpText={'Operator'} />
							</S.DOperator>
						)}
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
						<WalletConnect />
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
