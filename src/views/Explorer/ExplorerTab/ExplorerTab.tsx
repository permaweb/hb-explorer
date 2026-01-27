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

	const hyperBeamRequest = useHyperBeamRequest();

	const { showAutocomplete, handleKeyDown, autocompleteOptions, selectedOptionIndex, acceptAutocomplete } =
		useDeviceAutocomplete({
			inputValue: inputPath,
			cursorPosition,
			inputRef,
			onValueChange: (value, newCursorPosition) => {
				setInputPath(value);
				setCursorPosition(newCursorPosition);
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

	const hasRun = React.useRef<any>(null);

	React.useEffect(() => {
		if (props.active && inputPath && !hasRun.current) {
			handleSubmit();
			hasRun.current = true;
		}
	}, [props.active]);

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

		if (checkValidAddress(newValue)) {
			handleSubmit(newValue);
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

	function getTab() {
		if (hyperBeamRequest?.error) {
			return (
				<S.Placeholder>
					<S.PlaceholderIcon>
						<ReactSVG src={ASSETS.warning} />
					</S.PlaceholderIcon>
					<S.PlaceholderDescription>
						<p>{language.pathNotFound}</p>
					</S.PlaceholderDescription>
				</S.Placeholder>
			);
		}

		if (!props.tab?.type)
			return (
				<SamplePaths
					onPathSelect={(path) => {
						setInputPath(path);
						handleSubmit(path);
					}}
				/>
			);

		return <ExplorerTabPath tab={props.tab} hyperBeamRequest={hyperBeamRequest} refreshKey={refreshKey} />;

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
							icon: 14.5,
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
							icon: 14.5,
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
