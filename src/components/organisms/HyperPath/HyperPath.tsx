import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { Copyable } from 'components/atoms/Copyable';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Notification } from 'components/atoms/Notification';
import { Tabs } from 'components/atoms/Tabs';
import { AutocompleteDropdown } from 'components/molecules/AutocompleteDropdown';
import { Editor } from 'components/molecules/Editor';
import { JSONReader } from 'components/molecules/JSONReader';
import { SamplePaths } from 'components/molecules/SamplePaths';
import { ASSETS, URLS } from 'helpers/config';
import { checkValidAddress, stripUrlProtocol } from 'helpers/utils';
import { useDeviceAutocomplete } from 'hooks/useDeviceAutocomplete';
import { useHyperBeamRequest } from 'hooks/useHyperBeamRequest';
import { usePathValidation } from 'hooks/usePathValidation';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { HyperLinks } from '../HyperLinks';

import * as S from './styles';

function InfoLine(props: { headerKey: string; data: string; depth: number }) {
	const navigate = useNavigate();

	const [open, setOpen] = React.useState<boolean>(false);
	const [headers, setHeaders] = React.useState<any>(null);

	React.useEffect(() => {
		(async function () {
			if (open && !headers) {
				try {
					const response = await fetch(`${window.hyperbeamUrl}/${props.data}`);

					if (!response.ok) {
						return;
					}

					const headersObj: any = {};
					response.headers.forEach((value, key) => {
						headersObj[key] = { data: value };
					});

					setHeaders(headersObj);
				} catch (e: any) {
					console.error(e);
				}
			}
		})();
	}, [open, headers, props.data]);

	const isAddress = checkValidAddress(props.data);
	const isLink = isAddress && props.headerKey.includes('link');

	return (
		<S.InfoLineWrapper>
			<S.InfoLine isLink={isLink} onClick={() => (isLink ? setOpen((prev) => !prev) : {})} depth={props.depth}>
				<S.InfoLineHeader open={open}>
					{isLink && <ReactSVG src={ASSETS.arrowRight} />}
					<span>{isLink ? `${props.headerKey.replace('+link', '')}` : props.headerKey}</span>
				</S.InfoLineHeader>
				<S.InfoLineEnd>
					{isAddress ? <Copyable value={props.data} format={'address'} /> : <p>{props.data}</p>}
					{isLink && (
						<IconButton
							type={'alt1'}
							src={ASSETS.newTab}
							handlePress={() => navigate(`${URLS.explorer}${props.data}`)}
							dimensions={{
								icon: 10.5,
								wrapper: 20,
							}}
							tooltip={'Open in new tab'}
							tooltipPosition={'bottom-right'}
						/>
					)}
				</S.InfoLineEnd>
			</S.InfoLine>
			{open && headers && (
				<S.InfoBodyChild>
					{Object.keys(headers).map((key) => {
						return <InfoLine key={key} headerKey={key} data={headers[key].data} depth={props.depth + 1} />;
					})}
				</S.InfoBodyChild>
			)}
		</S.InfoLineWrapper>
	);
}

// Cache to store results by path - shared across all HyperPath instances
const resultsCache = new Map<
	string,
	{
		response: Response;
		responseBody: any;
		hyperbuddyData: any;
		bodyType: 'json' | 'raw';
		headers: any;
		links: any;
		signature: string | null;
		signer: string | null;
		signatureValid: boolean | null;
		signatureAlg: string | null;
		signatureKeyId: string | null;
		id: string | null;
		timestamp: number;
	}
>();

export default function HyperPath(props: {
	path: string;
	active: boolean;
	onPathChange?: (id: string, path: string) => void;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [inputPath, setInputPath] = React.useState<string>(props.path);

	const [responseBody, setResponseBody] = React.useState<any>(null);
	const [hyperbuddyData, setHyperbuddyData] = React.useState<any>(null);
	const [bodyType, setBodyType] = React.useState<'json' | 'raw'>('raw');
	const [copied, setCopied] = React.useState<boolean>(false);
	const [error, setError] = React.useState<string | null>(null);
	const [resultsReady, setResultsReady] = React.useState<boolean>(false);

	// Use shared HyperBEAM request hook
	const hyperBeamRequest = useHyperBeamRequest();
	const [cursorPosition, setCursorPosition] = React.useState<number>(0);
	const inputRef = React.useRef<HTMLInputElement>(null);

	// Use shared validation hook
	const { validationStatus: cacheStatus } = usePathValidation({ path: inputPath });

	// Auto-submit state management
	const [autoSubmitTimerId, setAutoSubmitTimerId] = React.useState<NodeJS.Timeout | null>(null);
	const [showAutoSubmitSpinner, setShowAutoSubmitSpinner] = React.useState<boolean>(false);

	// Custom spinner SVG as data URL - designed for clockwise rotation
	const spinnerSVG = React.useMemo(() => {
		const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 6V2L8 6L12 10V6C15.31 6 18 8.69 18 12S15.31 18 12 18S6 15.31 6 12H4C4 16.42 7.58 20 12 20S20 16.42 20 12S16.42 4 12 4" fill="currentColor"/>
		</svg>`;
		return `data:image/svg+xml;base64,${btoa(svg)}`;
	}, []);

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

		// Load cached results for saved tabs (when returning to a tab with an existing path)
		if (props.path && props.path.trim() !== '' && props.active) {
			const cached = resultsCache.get(props.path);
			if (cached) {
				// Load cached results
				setResponseBody(cached.responseBody);
				setHyperbuddyData(cached.hyperbuddyData);
				setBodyType(cached.bodyType);
				setResultsReady(true);

				// Update hyperBeamRequest state with cached data
				hyperBeamRequest.setState?.({
					loading: false,
					response: cached.response,
					headers: cached.headers,
					links: cached.links,
					signature: cached.signature,
					signer: cached.signer,
					signatureValid: cached.signatureValid,
					signatureAlg: cached.signatureAlg,
					signatureKeyId: cached.signatureKeyId,
					id: cached.id,
					error: false,
					hasContent: true,
					lastSuccessfulResponse: cached.response,
					submittedPath: props.path,
				});
			} else {
				// No cached results - immediately submit the request (bypassing auto-submit delay)
				// This handles the case when navigation component directs here with Enter key
				handleSubmit(props.path);
			}
		}
	}, [props.path, props.active]);

	// Auto-submit effect: triggers when validation succeeds
	React.useEffect(() => {
		// Clear any existing timer when validation status changes
		if (autoSubmitTimerId) {
			clearTimeout(autoSubmitTimerId);
			setAutoSubmitTimerId(null);
			setShowAutoSubmitSpinner(false);
		}

		// Auto-submit criteria:
		// 1. Path validation is successful
		// 2. Path is not empty
		// 3. Path is different from currently submitted path (avoid resubmitting same path)
		// 4. Not currently loading a request
		// 5. Component is active
		// 6. Input path differs from props.path (to avoid auto-submit when path comes from navigation)
		if (
			cacheStatus === 'success' &&
			inputPath.trim() !== '' &&
			inputPath !== hyperBeamRequest.submittedPath &&
			inputPath !== props.path &&
			!hyperBeamRequest.loading &&
			props.active
		) {
			// Show spinner immediately
			setShowAutoSubmitSpinner(true);

			// Set timer for auto-submit (2 seconds)
			const timerId = setTimeout(() => {
				setShowAutoSubmitSpinner(false);
				setAutoSubmitTimerId(null);
				handleSubmit();
			}, 1000);

			setAutoSubmitTimerId(timerId);
		}

		// Cleanup timer on unmount
		return () => {
			if (autoSubmitTimerId) {
				clearTimeout(autoSubmitTimerId);
			}
		};
	}, [cacheStatus, inputPath, hyperBeamRequest.submittedPath, hyperBeamRequest.loading, props.active, props.path]);

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			// Cancel auto-submit if user manually presses Enter
			if (autoSubmitTimerId) {
				clearTimeout(autoSubmitTimerId);
				setAutoSubmitTimerId(null);
				setShowAutoSubmitSpinner(false);
			}
			handleSubmit();
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		const newCursorPosition = e.target.selectionStart || 0;

		setInputPath(newValue);
		setCursorPosition(newCursorPosition);

		// Clear any existing auto-submit timer when user types
		if (autoSubmitTimerId) {
			clearTimeout(autoSubmitTimerId);
			setAutoSubmitTimerId(null);
			setShowAutoSubmitSpinner(false);
		}

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
			if (hyperBeamRequest.response && hyperBeamRequest.submittedPath) {
				setResultsReady(false);
				let body;
				let currentBodyType: 'json' | 'raw' = 'raw';

				if (hyperBeamRequest.submittedPath.includes('serialize~json@1.0')) {
					currentBodyType = 'json';
					try {
						body = await hyperBeamRequest.response.clone().json();
						setBodyType('json');
						setResponseBody(body);
					} catch (e: any) {
						console.error(e);
						body = null;
					}
				} else {
					currentBodyType = 'raw';
					try {
						body = await hyperBeamRequest.response.clone().text();
						setBodyType('raw');
						setResponseBody(body);
					} catch (e: any) {
						console.error(e);
						body = null;
					}
				}

				// Cache the results
				if (hyperBeamRequest.submittedPath && body !== null) {
					resultsCache.set(hyperBeamRequest.submittedPath, {
						response: hyperBeamRequest.response,
						responseBody: body,
						hyperbuddyData,
						bodyType: currentBodyType,
						headers: hyperBeamRequest.headers,
						links: hyperBeamRequest.links,
						signature: hyperBeamRequest.signature,
						signer: hyperBeamRequest.signer,
						signatureValid: hyperBeamRequest.signatureValid,
						signatureAlg: hyperBeamRequest.signatureAlg,
						signatureKeyId: hyperBeamRequest.signatureKeyId,
						id: hyperBeamRequest.id,
						timestamp: Date.now(),
					});
				}

				// Add small timeout to ensure all async operations complete
				setTimeout(() => setResultsReady(true), 50);
			} else {
				setResultsReady(false);
			}
		})();
	}, [hyperBeamRequest.response, hyperBeamRequest.submittedPath]);

	// Fetch hyperbuddy data when path changes
	React.useEffect(() => {
		(async function () {
			if (hyperBeamRequest.submittedPath) {
				// Check if we have cached hyperbuddy data
				const cached = resultsCache.get(hyperBeamRequest.submittedPath);
				if (cached && cached.hyperbuddyData !== undefined) {
					setHyperbuddyData(cached.hyperbuddyData);
					return;
				}

				try {
					const hyperbuddyResponse = await fetch(
						`${window.hyperbeamUrl}/${hyperBeamRequest.submittedPath}/format~hyperbuddy@1.0`
					);
					if (hyperbuddyResponse.ok) {
						const data = await hyperbuddyResponse.text();
						setHyperbuddyData(data);

						// Update cache with hyperbuddy data
						if (cached) {
							cached.hyperbuddyData = data;
						}
					} else {
						setHyperbuddyData(null);
						if (cached) {
							cached.hyperbuddyData = null;
						}
					}
				} catch (e) {
					console.error('Error fetching hyperbuddy data:', e);
					setHyperbuddyData(null);
					if (cached) {
						cached.hyperbuddyData = null;
					}
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
							return <InfoLine key={key} headerKey={key} data={data[key].data} depth={1} />;
						})}
					</S.InfoBody>
				</S.InfoSection>
			);
		}
		return null;
	}

	function getPath() {
		// Show loading placeholder only when actually loading or processing
		if (hyperBeamRequest.loading || (hyperBeamRequest.response && !resultsReady)) {
			return (
				<S.Placeholder>
					<S.PlaceholderIcon>
						<ReactSVG src={ASSETS.process} />
					</S.PlaceholderIcon>
					<S.PlaceholderDescription>
						<p>{`${language.loading}...`}</p>
					</S.PlaceholderDescription>
				</S.Placeholder>
			);
		}

		// Show error state
		if (hyperBeamRequest.error && !hyperBeamRequest.hasContent) {
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
					{buildInfoSection(
						'Signed Headers',
						ASSETS.headers,
						(() => {
							// Combine headers with links and sort so links appear on top
							const allHeaders = { ...hyperBeamRequest.headers };
							if (hyperBeamRequest.links) {
								Object.assign(allHeaders, hyperBeamRequest.links);
							}

							// Sort entries to put links on top
							const sortedEntries = Object.entries(allHeaders).sort(([keyA, valA]: any, [keyB, valB]: any) => {
								const aIsAddr = checkValidAddress(valA.data) && keyA.includes('link');
								const bIsAddr = checkValidAddress(valB.data) && keyB.includes('link');

								if (aIsAddr && !bIsAddr) return -1;
								if (!aIsAddr && bIsAddr) return 1;

								return keyA.localeCompare(keyB);
							});

							// Convert back to object
							return sortedEntries.reduce((acc, [key, val]) => {
								acc[key] = val;
								return acc;
							}, {} as any);
						})()
					)}
				</S.InfoWrapper>
				<S.BodyWrapper>
					<Tabs onTabClick={() => {}} type={'primary'}>
						<S.Tab label={'Hyperbuddy'}>
							{hyperbuddyData ? (
								<Editor initialData={hyperbuddyData} language={'html'} loading={false} readOnly />
							) : (
								<Loader sm relative />
							)}
						</S.Tab>
						<S.Tab label={'Body'}>
							{responseBody ? (
								<>
									{bodyType === 'json' ? (
										<JSONReader data={responseBody} header={'Body'} maxHeight={700} />
									) : (
										<Editor initialData={responseBody} language={'html'} loading={false} readOnly />
									)}
								</>
							) : null}
						</S.Tab>
						<S.Tab label={'Graph'}>
							<HyperLinks path={hyperBeamRequest.submittedPath} id={hyperBeamRequest.id} />
						</S.Tab>
					</Tabs>
				</S.BodyWrapper>
			</>
		);
	}

	return props.active ? (
		<>
			<S.Wrapper>
				<S.HeaderWrapper>
					<S.SearchWrapper>
						<S.SearchInputWrapper
							cacheStatus={showAutocomplete ? 'default' : cacheStatus}
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
								inputRef={inputRef}
							/>
						</S.SearchInputWrapper>
						<S.SpinningWrapper className={showAutoSubmitSpinner ? 'spinning' : ''}>
							<IconButton
								type={'alt1'}
								src={showAutoSubmitSpinner ? spinnerSVG : ASSETS.go}
								handlePress={() => {
									// Cancel auto-submit if user manually clicks
									if (autoSubmitTimerId) {
										clearTimeout(autoSubmitTimerId);
										setAutoSubmitTimerId(null);
										setShowAutoSubmitSpinner(false);
									}
									handleSubmit();
								}}
								disabled={hyperBeamRequest.loading || !inputPath}
								dimensions={{
									wrapper: 32.5,
									icon: 17.5,
								}}
								tooltip={
									showAutoSubmitSpinner
										? 'Auto-submitting... Click to submit immediately'
										: hyperBeamRequest.loading
										? `${language.loading}...`
										: language.run
								}
							/>
						</S.SpinningWrapper>
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
						</S.PathInfoWrapper>
					</S.HeaderActionsWrapper>
				</S.HeaderWrapper>
				<S.ContentWrapper>
					{!hyperBeamRequest.hasContent ? (
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
