import React from 'react';
import { ReactSVG } from 'react-svg';

import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { ASSETS } from 'helpers/config';
import { ExplorerTabObjectType } from 'helpers/types';
import { extractDetailsFromPath, stripUrlProtocol } from 'helpers/utils';
import { useDeviceAutocomplete } from 'hooks/useDeviceAutocomplete';
import { useHyperBeamRequest } from 'hooks/useHyperBeamRequest';
import { usePathValidation } from 'hooks/usePathValidation';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { ExplorerTabProcess } from './ExplorerTabProcess';
import * as S from './styles';

export default function ExplorerTab(props: {
	tab: ExplorerTabObjectType;
	onPathChange: (args: ExplorerTabObjectType) => void;
	// onSubPathChange?: (subPath: string) => void;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const inputRef = React.useRef<HTMLInputElement>(null);

	const [cursorPosition, setCursorPosition] = React.useState<number>(0);
	const [inputPath, setInputPath] = React.useState<string>(props.tab?.label ?? '');
	const [autoSubmitTimerId, setAutoSubmitTimerId] = React.useState<NodeJS.Timeout | null>(null);
	const [copied, setCopied] = React.useState<boolean>(false);
	const [pendingPathChange, setPendingPathChange] = React.useState<boolean>(false);

	const hyperBeamRequest = useHyperBeamRequest();

	const { showAutocomplete, autocompleteOptions, selectedOptionIndex, handleKeyDown, acceptAutocomplete } =
		useDeviceAutocomplete({
			inputValue: inputPath,
			cursorPosition,
			inputRef,
			onValueChange: (value, newCursorPosition) => {
				setInputPath(value);
				setCursorPosition(newCursorPosition);
			},
		});

	const { validationStatus: cacheStatus } = usePathValidation({ path: inputPath });

	React.useEffect(() => {
		setInputPath(props.tab?.path ?? '');
	}, [props.tab?.path]);

	React.useEffect(() => {
		if (pendingPathChange && !hyperBeamRequest.loading) {
			if (!hyperBeamRequest.error && hyperBeamRequest.id) {
				props.onPathChange({
					id: hyperBeamRequest.id,
					type: hyperBeamRequest.type,
					variant: hyperBeamRequest.variant,
					path: hyperBeamRequest.type === 'process' ? `${inputPath}/messages` : inputPath,
					label: inputPath,
				});
			}
			setPendingPathChange(false);
		}
	}, [
		pendingPathChange,
		hyperBeamRequest.loading,
		hyperBeamRequest.error,
		hyperBeamRequest.id,
		hyperBeamRequest.type,
		hyperBeamRequest.variant,
		inputPath,
		props,
	]);

	async function handleSubmit(pathToSubmit?: string) {
		const pathValue = pathToSubmit || inputPath;
		if (pathValue) {
			setPendingPathChange(true);
			await hyperBeamRequest.submitRequest(pathValue);
		}
	}

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

		if (autoSubmitTimerId) {
			clearTimeout(autoSubmitTimerId);
			setAutoSubmitTimerId(null);
		}

		if (newValue === '') {
			hyperBeamRequest.reset();
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
		if (!props.tab?.type) return null;

		switch (props.tab.type) {
			case 'process':
				return <ExplorerTabProcess tab={props.tab} />;
			case 'message':
				return <p>Message</p>;
			case 'path':
				return <p>Path</p>;
		}
	}

	return (
		<S.Wrapper>
			<S.HeaderWrapper>
				<S.SearchWrapper>
					<S.SearchInputWrapper cacheStatus={showAutocomplete ? 'default' : cacheStatus}>
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
						{/* <AutocompleteDropdown
							options={autocompleteOptions}
							selectedIndex={selectedOptionIndex}
							onSelect={acceptAutocomplete}
							visible={showAutocomplete}
							showTabHint={true}
							inputRef={inputRef}
						/> */}
					</S.SearchInputWrapper>
					<IconButton
						type={'alt1'}
						src={ASSETS.go}
						handlePress={() => {
							if (autoSubmitTimerId) {
								clearTimeout(autoSubmitTimerId);
								setAutoSubmitTimerId(null);
							}
							handleSubmit();
						}}
						disabled={hyperBeamRequest.loading || !inputPath}
						dimensions={{
							wrapper: 32.5,
							icon: 17.5,
						}}
						tooltip={hyperBeamRequest.loading ? `${language.loading}...` : language.run}
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
			<S.BodyWrapper>{getTab()}</S.BodyWrapper>
		</S.Wrapper>
	);
}
