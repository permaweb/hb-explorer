import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { Copyable } from 'components/atoms/Copyable';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Notification } from 'components/atoms/Notification';
import { AutocompleteDropdown } from 'components/molecules/AutocompleteDropdown';
import { Editor } from 'components/molecules/Editor';
import { JSONReader } from 'components/molecules/JSONReader';
import { ASSETS, URLS } from 'helpers/config';
import { base64UrlToUint8Array, parseSignatureInput, verifySignature } from 'helpers/signatures';
import { checkValidAddress, hbFetch, stripUrlProtocol } from 'helpers/utils';
import { useDeviceAutocomplete } from 'hooks/useDeviceAutocomplete';
import { useHyperBeamRequest } from 'hooks/useHyperBeamRequest';
import { usePathValidation } from 'hooks/usePathValidation';
import { useLanguageProvider } from 'providers/LanguageProvider';

import SamplePaths from '../../molecules/SamplePaths';
import { HyperLinks } from '../HyperLinks';

import * as S from './styles';

export default function HyperPath(props: {
	path: string;
	active: boolean;
	onPathChange?: (id: string, path: string) => void;
}) {
	const navigate = useNavigate();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [inputPath, setInputPath] = React.useState<string>(props.path);

	const [responseBody, setResponseBody] = React.useState<any>(null);
	const [hyperbuddyData, setHyperbuddyData] = React.useState<any>(null);
	const [bodyType, setBodyType] = React.useState<'json' | 'raw'>('raw');
	const [copied, setCopied] = React.useState<boolean>(false);
	const [error, setError] = React.useState<string | null>(null);
	const [resultsReady, setResultsReady] = React.useState<boolean>(false);
	const [activeTab, setActiveTab] = React.useState<'hyperbuddy' | 'body' | 'graph'>('hyperbuddy');

	// Use shared HyperBEAM request hook
	const hyperBeamRequest = useHyperBeamRequest();
	const [cursorPosition, setCursorPosition] = React.useState<number>(0);
	const inputRef = React.useRef<HTMLInputElement>(null);

	// Use shared validation hook
	const { validationStatus: cacheStatus } = usePathValidation({ path: inputPath });

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
		});

	React.useEffect(() => {
		setInputPath(props.path);
		// Auto-submit when path is provided via props (e.g., from navigation)
		if (props.path && props.path.trim() !== '') {
			handleSubmit(props.path);
		}
	}, [props.path]);

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSubmit();
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		const newCursorPosition = e.target.selectionStart || 0;

		setInputPath(newValue);
		setCursorPosition(newCursorPosition);

		// Reset state when input is cleared
		if (newValue === '') {
			hyperBeamRequest.reset();
			setResponseBody(null);
			setResultsReady(false);
		}
	};

	const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
		const target = e.target as HTMLInputElement;
		setCursorPosition(target.selectionStart || 0);
	};

	async function handleSubmit(pathToSubmit?: string) {
		const pathValue = pathToSubmit || inputPath;
		if (pathValue) {
			setResultsReady(false);
			await hyperBeamRequest.submitRequest(pathValue);
			if (!hyperBeamRequest.error) {
				props.onPathChange(pathValue, pathValue);
			}
		}
	}

	React.useEffect(() => {
		(async function () {
			if (hyperBeamRequest.response) {
				setResultsReady(false);
				if (props.path?.includes('serialize~json@1.0')) {
					setBodyType('json');
					try {
						const body = await hyperBeamRequest.response.clone().json();
						setResponseBody(body);
						// Add small timeout to ensure all async operations complete
						setTimeout(() => setResultsReady(true), 50);
					} catch (e: any) {
						console.error(e);
						setTimeout(() => setResultsReady(true), 100);
					}
				} else {
					setBodyType('raw');
					try {
						const body = await hyperBeamRequest.response.clone().text();
						setResponseBody(body);
						// Add small timeout to ensure all async operations complete
						setTimeout(() => setResultsReady(true), 50);
					} catch (e: any) {
						console.error(e);
						setTimeout(() => setResultsReady(true), 100);
					}
				}
			} else {
				setResultsReady(false);
			}
		})();
	}, [hyperBeamRequest.response, props.path]);

	// Fetch hyperbuddy data when path changes
	React.useEffect(() => {
		(async function () {
			if (hyperBeamRequest.submittedPath) {
				try {
					const hyperbuddyResponse = await fetch(`${window.hyperbeamUrl}/${hyperBeamRequest.submittedPath}/format~hyperbuddy@1.0`);
					if (hyperbuddyResponse.ok) {
						const data = await hyperbuddyResponse.text();
						setHyperbuddyData(data);
					} else {
						setHyperbuddyData(null);
					}
				} catch (e) {
					console.error('Error fetching hyperbuddy data:', e);
					setHyperbuddyData(null);
				}
			}
		})();
	}, [hyperBeamRequest.submittedPath]);

	const copyInput = React.useCallback(async (value: string) => {
		if (value?.length > 0) {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	}, []);

	const renderTabContent = () => {
		switch (activeTab) {
			case 'hyperbuddy':
				return hyperbuddyData ? (
					<Editor initialData={hyperbuddyData} language={'html'} loading={false} readOnly />
				) : (
					<Loader sm relative />
				);
			case 'body':
				return responseBody ? (
					<>
						{bodyType === 'json' ? (
							<JSONReader data={responseBody} header={'Body'} maxHeight={700} />
						) : (
							<Editor initialData={responseBody} language={'html'} loading={false} readOnly />
						)}
					</>
				) : null;
			case 'graph':
				return <HyperLinks path={hyperBeamRequest.submittedPath} id={hyperBeamRequest.id} />;
			default:
				return null;
		}
	};

	function buildInfoSection(label: string, icon: string, data: any) {
		if (data && Object.keys(data).length > 0) {
			return (
				<S.InfoSection className={'border-wrapper-primary fade-in'}>
					<S.InfoHeader>
						<S.InfoTitle>
							<ReactSVG src={icon} />
							<p>{label}</p>
						</S.InfoTitle>
						<span>{`(${Object.keys(data).length}) `}</span>
					</S.InfoHeader>
					<S.InfoBody className={'scroll-wrapper-hidden'}>
						{Object.keys(data).map((key) => {
							const isAddress = checkValidAddress(data[key].data);

							return (
								<S.InfoLine
									key={key}
									isAddress={isAddress}
									onClick={() => (isAddress ? navigate(`${URLS.explorer}${data[key].data}`) : {})}
								>
									<S.InfoLineHeader>
										{isAddress && <ReactSVG src={ASSETS.newTab} />}
										<span>{`${key}`}</span>
									</S.InfoLineHeader>
									{isAddress ? <Copyable value={data[key].data} format={'address'} /> : <p>{data[key].data}</p>}
								</S.InfoLine>
							);
						})}
					</S.InfoBody>
				</S.InfoSection>
			);
		}
		return null;
	}

	function getPath() {
		// Show loading placeholder when loading or when results are not ready yet
		if (
			hyperBeamRequest.loading ||
			(hyperBeamRequest.response && !resultsReady) ||
			(hyperBeamRequest.error && !hyperBeamRequest.hasContent) ||
			(!hyperBeamRequest.response && !hyperBeamRequest.hasContent)
		) {
			return (
				<S.Placeholder>
					<S.PlaceholderIcon>
						<ReactSVG src={hyperBeamRequest.error ? ASSETS.warning : ASSETS.process} />
					</S.PlaceholderIcon>
					<S.PlaceholderDescription>
						<p>
							{hyperBeamRequest.loading || (hyperBeamRequest.response && !resultsReady)
								? `${language.loading}...`
								: hyperBeamRequest.error
								? language.pathNotFound
								: language.pathOrId}
						</p>
					</S.PlaceholderDescription>
				</S.Placeholder>
			);
		}

		// If we don't have a current response but we have previous content, use the last successful response
		const responseToUse = hyperBeamRequest.response || hyperBeamRequest.lastSuccessfulResponse;
		if (!responseToUse) {
			return null;
		}

		return (
			<>
				<S.InfoWrapper>
					{/* {id && (
						<S.InfoSection className={'border-wrapper-primary fade-in'}>
							<S.IDHeader>
								<p>Message ID</p>
								<Copyable value={id} />
							</S.IDHeader>
						</S.InfoSection>
					)} */}
					<S.InfoSection className={'border-wrapper-alt3 fade-in'}>
						<S.SignatureHeader>
							<p>Signature</p>
							{hyperBeamRequest.signature ? (
								<Copyable value={hyperBeamRequest.signature} format={'truncate'} />
							) : (
								<p>-</p>
							)}
						</S.SignatureHeader>
						<S.SignatureBody>
							<S.SignatureStatus valid={hyperBeamRequest.signatureValid}>
								<span>Status</span>
								<p>
									{hyperBeamRequest.signatureValid === true
										? 'Verified'
										: hyperBeamRequest.signatureValid === false
										? 'Invalid'
										: 'Pending'}
								</p>
							</S.SignatureStatus>
							<S.SignatureLine>
								<span>Signer</span>
								{hyperBeamRequest.signer ? <Copyable value={hyperBeamRequest.signer} format={'address'} /> : <p>-</p>}
							</S.SignatureLine>
							{hyperBeamRequest.signatureAlg && (
								<S.SignatureLine>
									<span>Format</span>
									<p>{hyperBeamRequest.signatureAlg}</p>
								</S.SignatureLine>
							)}
							{hyperBeamRequest.signatureKeyId && (
								<S.SignatureLine>
									<span>Key</span>
									<p>{hyperBeamRequest.signatureKeyId}</p>
								</S.SignatureLine>
							)}
						</S.SignatureBody>
					</S.InfoSection>
					{buildInfoSection('Signed Headers', ASSETS.headers, hyperBeamRequest.headers)}
					{buildInfoSection('Links', ASSETS.link, hyperBeamRequest.links)}
				</S.InfoWrapper>
				{responseToUse && (
					<S.BodyWrapper>
						{renderTabContent()}
					</S.BodyWrapper>
				)}
			</>
		);
	}

	return props.active ? (
		<>
			<S.Wrapper>
				<S.HeaderWrapper>
					<S.SearchWrapper>
						<S.SearchInputWrapper
							cacheStatus={cacheStatus}
							hasDropdown={showAutocomplete && autocompleteOptions.length > 0}
						>
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
							/>
						</S.SearchInputWrapper>
						<IconButton
							type={'alt1'}
							src={ASSETS.go}
							handlePress={() => handleSubmit()}
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
						{(hyperBeamRequest.response || hyperBeamRequest.lastSuccessfulResponse) && (
							<S.TabButtonGroup>
								<S.TabButton 
									active={activeTab === 'hyperbuddy'} 
									onClick={() => setActiveTab('hyperbuddy')}
								>
									Hyperbuddy
								</S.TabButton>
								<S.TabButton 
									active={activeTab === 'body'} 
									onClick={() => setActiveTab('body')}
								>
									Body
								</S.TabButton>
								<S.TabButton 
									active={activeTab === 'graph'} 
									onClick={() => setActiveTab('graph')}
								>
									Graph
								</S.TabButton>
							</S.TabButtonGroup>
						)}
						<S.PathInfoWrapper>
							<S.UpdateWrapper>
								<span>{stripUrlProtocol(window.hyperbeamUrl)}</span>
								<S.Indicator />
							</S.UpdateWrapper>
						</S.PathInfoWrapper>
					</S.HeaderActionsWrapper>
				</S.HeaderWrapper>
				<S.ContentWrapper>
					{inputPath === '' && !hyperBeamRequest.hasContent ? (
						<SamplePaths
							onPathSelect={(path) => {
								setInputPath(path);
								handleSubmit(path);
							}}
						/>
					) : (
						getPath()
					)}
				</S.ContentWrapper>
				<S.Graphic>
					<video src={ASSETS.graphic} autoPlay loop muted playsInline />
				</S.Graphic>
			</S.Wrapper>
			{error && (
				<Notification
					type={'warning'}
					message={error}
					callback={() => {
						setError(null);
					}}
				/>
			)}
		</>
	) : null;
}
