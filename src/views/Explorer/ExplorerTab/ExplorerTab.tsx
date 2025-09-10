import React from 'react';
import { ReactSVG } from 'react-svg';

import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { AutocompleteDropdown } from 'components/molecules/AutocompleteDropdown';
import { SamplePaths } from 'components/molecules/SamplePaths';
import { ASSETS, DEFAULT_TABS } from 'helpers/config';
import { ExplorerTabObjectType } from 'helpers/types';
import { checkValidAddress, stripUrlProtocol } from 'helpers/utils';
import { useDeviceAutocomplete } from 'hooks/useDeviceAutocomplete';
import { useHyperBeamRequest } from 'hooks/useHyperBeamRequest';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { ExplorerTabPath } from './ExplorerTabPath';
import { ExplorerTabProcess } from './ExplorerTabProcess';
import * as S from './styles';

// TODO: Auto submit
export default function ExplorerTab(props: {
	tab: ExplorerTabObjectType;
	active: boolean;
	onPathChange: (args: ExplorerTabObjectType) => void;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const inputRef = React.useRef<HTMLInputElement>(null);

	const [cursorPosition, setCursorPosition] = React.useState<number>(0);
	const [inputPath, setInputPath] = React.useState<string>(props.tab?.basePath ?? '');
	const [autoSubmitTimerId, setAutoSubmitTimerId] = React.useState<NodeJS.Timeout | null>(null);
	const [copied, setCopied] = React.useState<boolean>(false);
	const [refreshKey, setRefreshKey] = React.useState<number>(0);
	const [shouldAutoSubmit, setShouldAutoSubmit] = React.useState<boolean>(false);
	const [lastSubmittedPath, setLastSubmittedPath] = React.useState<string>('');
	const [isFromUrlNavigation, setIsFromUrlNavigation] = React.useState<boolean>(false);

	const hyperBeamRequest = useHyperBeamRequest();

	const { showAutocomplete, handleKeyDown, autocompleteOptions, selectedOptionIndex, acceptAutocomplete } =
		useDeviceAutocomplete({
			inputValue: inputPath,
			cursorPosition,
			inputRef,
			onValueChange: (value, newCursorPosition) => {
				setInputPath(value);
				setCursorPosition(newCursorPosition);
				setIsFromUrlNavigation(false); // Mark as user input, not URL navigation
				setShouldAutoSubmit(true);
			},
			onAutoSubmit: (completedPath) => handleSubmit(completedPath),
		});

	const handleSubmit = React.useCallback(
		async (pathToSubmit?: string) => {
			const pathValue = pathToSubmit || inputPath;

			if (pathValue && !hyperBeamRequest.loading) {
				await hyperBeamRequest.submitRequest(pathValue);
			}
		},
		[inputPath, hyperBeamRequest.loading, hyperBeamRequest.submitRequest]
	);

	// // Track when input is set from props (URL navigation) vs user input
	// React.useEffect(() => {
	// 	const basePath = props.tab?.basePath ?? '';
	// 	setInputPath(basePath);
	// 	setIsFromUrlNavigation(true);

	// 	// For URL navigation to existing paths, submit request if tab is active and has no data yet
	// 	if (props.active && basePath && !props.tab?.id) {
	// 		handleSubmit(basePath);
	// 	}
	// }, [props.tab?.basePath]);

	// // Only auto-submit when tab becomes active AND it's not from URL navigation
	// React.useEffect(() => {
	// 	if (props.active) {
	// 		if (inputPath && !isFromUrlNavigation) {
	// 			handleSubmit();
	// 		}
	// 		// Reset the URL navigation flag after checking
	// 		setIsFromUrlNavigation(false);
	// 	}
	// }, [props.active]);

	React.useEffect(() => {
		if (!hyperBeamRequest.loading) {
			if (!hyperBeamRequest.error && hyperBeamRequest.id) {
				const currentSubPath = props.tab?.path?.replace(props.tab?.basePath || '', '') || DEFAULT_TABS.process;
				const newTabData = {
					id: hyperBeamRequest.id,
					type: hyperBeamRequest.type,
					variant: hyperBeamRequest.variant,
					basePath: inputPath,
					path: hyperBeamRequest.type === 'process' ? `${inputPath}${currentSubPath}` : inputPath,
					label: hyperBeamRequest.headers?.name?.data ?? inputPath,
				};

				// Only call onPathChange if the tab data has actually changed
				const hasChanged =
					props.tab?.id !== newTabData.id ||
					props.tab?.type !== newTabData.type ||
					props.tab?.variant !== newTabData.variant ||
					props.tab?.basePath !== newTabData.basePath ||
					props.tab?.path !== newTabData.path ||
					props.tab?.label !== newTabData.label;

				if (hasChanged) {
					props.onPathChange(newTabData);
				}
			}
		}
	}, [
		hyperBeamRequest.loading,
		hyperBeamRequest.error,
		hyperBeamRequest.id,
		hyperBeamRequest.type,
		hyperBeamRequest.variant,
		hyperBeamRequest.headers?.name?.data,
		inputPath,
		props.tab?.id,
		props.tab?.type,
		props.tab?.variant,
		props.tab?.basePath,
		props.tab?.path,
		props.tab?.label,
		props.onPathChange,
	]);

	const copyInput = React.useCallback(async (value: string) => {
		if (value?.length > 0) {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		const newCursorPosition = e.target.selectionStart || 0;

		setInputPath(newValue);
		setCursorPosition(newCursorPosition);
		setIsFromUrlNavigation(false); // Mark as user input, not URL navigation

		// if (checkValidAddress(newValue)) {
		// 	setShouldAutoSubmit(true);
		// }

		if (autoSubmitTimerId) {
			clearTimeout(autoSubmitTimerId);
			setAutoSubmitTimerId(null);
		}

		if (newValue === '') {
			hyperBeamRequest.reset();
			setShouldAutoSubmit(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			if (autoSubmitTimerId) {
				clearTimeout(autoSubmitTimerId);
				setAutoSubmitTimerId(null);
			}
			handleSubmit();
		}
	};

	const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
		const target = e.target as HTMLInputElement;
		setCursorPosition(target.selectionStart || 0);
	};

	function getTab() {
		if (!props.tab?.type)
			return (
				<SamplePaths
					onPathSelect={(path) => {
						setInputPath(path);
						setIsFromUrlNavigation(false); // Mark as user input
						handleSubmit(path);
					}}
				/>
			);

		switch (props.tab.type) {
			case 'process':
				return <ExplorerTabProcess tab={props.tab} hyperBeamRequest={hyperBeamRequest} refreshKey={refreshKey} />;
			case 'path':
				return <ExplorerTabPath tab={props.tab} hyperBeamRequest={hyperBeamRequest} refreshKey={refreshKey} />;
		}
	}

	return (
		<S.Wrapper>
			<S.HeaderWrapper>
				<S.SearchWrapper>
					<S.SearchInputWrapper cacheStatus={'default'}>
						<ReactSVG src={ASSETS.search} />
						<FormField
							ref={inputRef}
							value={inputPath}
							onChange={handleInputChange}
							onKeyPress={handleKeyPress}
							onKeyDown={handleKeyDown}
							onClick={handleInputClick}
							placeholder={language.pathOrId}
							invalid={{ status: false, message: null }}
							disabled={hyperBeamRequest.loading}
							autoFocus
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
					<IconButton
						type={'alt1'}
						src={ASSETS.refresh}
						handlePress={() => {
							if (autoSubmitTimerId) {
								clearTimeout(autoSubmitTimerId);
								setAutoSubmitTimerId(null);
							}
							setRefreshKey((prev) => prev + 1);
							handleSubmit();
						}}
						disabled={hyperBeamRequest.loading || !inputPath}
						dimensions={{
							wrapper: 32.5,
							icon: 17.5,
						}}
						tooltip={hyperBeamRequest.loading ? `${language.loading}...` : language.refresh}
					/>

					<IconButton
						type={'alt1'}
						src={ASSETS.copy}
						handlePress={() => copyInput(inputPath)}
						disabled={!inputPath}
						dimensions={{
							wrapper: 32.5,
							icon: 17.5,
						}}
						tooltip={copied ? `${language.copied}!` : language.copyPath}
					/>
				</S.SearchWrapper>
				<S.HeaderActionsWrapper>
					<S.PathInfoWrapper>
						<S.UpdateWrapper>
							<span>{stripUrlProtocol(window.hyperbeamUrl)}</span>
							<S.Indicator />
						</S.UpdateWrapper>
						{props.tab?.type && (
							<S.UpdateWrapper>
								<span>{props.tab.type}</span>
							</S.UpdateWrapper>
						)}
						{props.tab?.variant && (
							<S.UpdateWrapper>
								<span>{props.tab.variant}</span>
							</S.UpdateWrapper>
						)}
					</S.PathInfoWrapper>
				</S.HeaderActionsWrapper>
			</S.HeaderWrapper>
			<S.BodyWrapper>{props.active ? getTab() : null}</S.BodyWrapper>
		</S.Wrapper>
	);
}
