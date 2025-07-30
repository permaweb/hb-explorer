import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { Copyable } from 'components/atoms/Copyable';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Notification } from 'components/atoms/Notification';
import { Editor } from 'components/molecules/Editor';
import { JSONReader } from 'components/molecules/JSONReader';
import { ASSETS, URLS, HB_ENDPOINTS } from 'helpers/config';
import { base64UrlToUint8Array, parseSignatureInput, verifySignature } from 'helpers/signatures';
import { checkValidAddress, stripUrlProtocol } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { HyperLinks } from '../HyperLinks';
import SamplePaths from '../../molecules/SamplePaths';

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

	const [fullResponse, setFullResponse] = React.useState<any>(null);

	const [responseBody, setResponseBody] = React.useState<any>(null);
	const [bodyType, setBodyType] = React.useState<'json' | 'raw'>('raw');

	const [headers, setHeaders] = React.useState<any>(null);
	const [links, setLinks] = React.useState<any>(null);
	const [signature, setSignature] = React.useState<string | null>(null);
	const [signer, setSigner] = React.useState<string | null>(null);
	const [signatureValid, setSignatureValid] = React.useState<boolean | null>(null);

	const [loadingPath, setLoadingPath] = React.useState<boolean>(false);
	const [copied, setCopied] = React.useState<boolean>(false);
	const [error, setError] = React.useState<string | null>(null);
	const [pathNotFound, setPathNotFound] = React.useState<boolean>(false);
	const [hasContent, setHasContent] = React.useState<boolean>(false);
	const [lastSuccessfulResponse, setLastSuccessfulResponse] = React.useState<any>(null);
	const [submittedPath, setSubmittedPath] = React.useState<string>('');
	const [cacheStatus, setCacheStatus] = React.useState<'default' | 'success' | 'error'>('default');

	React.useEffect(() => {
		setInputPath(props.path);
	}, [props.path]);

	// Check cache validity in real-time as user types
	React.useEffect(() => {
		if (!inputPath) {
			setCacheStatus('default');
			return;
		}

		const checkPath = async () => {
			try {
				const validationPath = `${inputPath}/~cacheviz@1.0/index`;
				const mainRes = await fetch(`${window.hyperbeamUrl}/${validationPath}`);
				
				if (mainRes.status === 200) {
					setCacheStatus('success'); // Green: valid path
				} else {
					setCacheStatus('error'); // Red: invalid path
				}
			} catch (e: any) {
				setCacheStatus('error'); // Red: network error
			}
		};

		const timeoutId = setTimeout(checkPath, 300); // Debounce for 300ms
		return () => clearTimeout(timeoutId);
	}, [inputPath]);


	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSubmit();
		}
	};

	async function handleSubmit(pathToSubmit?: string) {
		const pathValue = pathToSubmit || inputPath;
		if (pathValue) {
			setLoadingPath(true);
			try {
				const response = await fetch(`${window.hyperbeamUrl}/${pathValue}`);

				if (!response.ok) {
					setPathNotFound(true);
					setLoadingPath(false);
					return;
				}

				setFullResponse(response);
				setLastSuccessfulResponse(response);
				setSubmittedPath(pathValue);

				const raw = joinHeaders(response.headers).trim();
				const parsed = parseHeaders(raw);

				const signature = response.headers.get('signature');

				if (signature) {
					const signatureInput = parsed['signature-input']?.data ?? '';

					const signer = signatureInput ? await getSignerAddress(signatureInput) : 'Unknown';
					const isValid = signatureInput ? await verifySignature(signature, signatureInput, response) : false;

					setSignature(signature);
					setSigner(signer);
					setSignatureValid(isValid);
				}

				const sigInputRaw = parsed['signature-input']?.data;
				setHeaders(sigInputRaw ? filterSignedHeaders(parsed, sigInputRaw) : parsed);

				let linkHeaders = {};
				for (const key of Object.keys(parsed)) {
					if (key.includes('+link')) {
						linkHeaders[key] = parsed[key];
					}
				}

				setLinks(linkHeaders);

				props.onPathChange(pathValue, pathValue);
				setPathNotFound(false);
				setHasContent(true);
			} catch (e: any) {
				console.error(e);

				setPathNotFound(true);
			}
			setLoadingPath(false);
		}
	}

	React.useEffect(() => {
		(async function () {
			if (fullResponse) {
				if (props.path?.includes('serialize~json@1.0')) {
					setBodyType('json');
					try {
						const body = await fullResponse.json();
						setResponseBody(body);
					} catch (e: any) {
						console.error(e);
					}
				} else {
					setBodyType('raw');
					try {
						const body = await fullResponse.text();
						setResponseBody(body);
					} catch (e: any) {
						console.error(e);
					}
				}
			}
		})();
	}, [fullResponse, props.path]);

	/**
	 * Given your parsed headers object (from parseHeaders) and the raw
	 * Signature-Input header value, return a new object containing
	 * only those headers which were covered by the signature-input.
	 */
	function filterSignedHeaders(parsedHeaders, signatureInputValue) {
		const sigInputs = parseSignatureInput(signatureInputValue);

		// Collect all the field names covered
		const covered = new Set(sigInputs.flatMap((si) => si.fields.map((f) => f.toLowerCase())));

		// Filter parsedHeaders keys by membership in covered
		return Object.fromEntries(
			Object.entries(parsedHeaders).filter(([headerName]) => covered.has(headerName.toLowerCase()))
		);
	}

	/**
	 * @param {string} sigInputRaw
	 * @returns {Promise<string>} the derived “address” of the first non-HMAC signer
	 */
	async function getSignerAddress(sigInputRaw) {
		const entries = parseSignatureInput(sigInputRaw);
		if (!entries.length) return 'Unknown';

		// Pick the first entry whose alg isn’t hmac-sha256 (i.e. the real pubkey)
		const realEntry = entries.find((e) => e.alg.toLowerCase() !== 'hmac-sha256') || entries[0];
		const rawKeyId = realEntry.keyid;

		// Now decode it to bytes (base64url → Uint8Array)
		const pubKeyBytes = base64UrlToUint8Array(rawKeyId);

		// sha-256 the public key bytes
		const hash = await crypto.subtle.digest('SHA-256', pubKeyBytes);
		const hashArr = new Uint8Array(hash);

		// base64url-encode the hash to get your “address”
		const address = btoa(String.fromCharCode(...hashArr))
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');

		return address;
	}

	function parseHeaders(input) {
		const out = {};
		input
			.split('\n')
			.map((l) => l.trim())
			.filter((l) => l && l.includes(':'))
			.forEach((line) => {
				const idx = line.indexOf(':');
				const key = line.slice(0, idx).trim();
				const val = line.slice(idx + 1).trim();
				out[key] = { data: val };
				if (key.includes('+link')) out[key].isLink = true;
			});
		return out;
	}

	function joinHeaders(headers) {
		return Array.from(headers.entries())
			.map(([name, value]) => `${name}: ${value}`)
			.join('\n');
	}

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
				<S.InfoSection className={'border-wrapper-primary'}>
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
		// Only show placeholder when actually loading or when we have an error/no results
		if ((loadingPath && !hasContent) || (pathNotFound && !hasContent) || (!fullResponse && !hasContent)) {
			return (
				<S.Placeholder>
					<S.PlaceholderIcon>
						<ReactSVG src={pathNotFound ? ASSETS.warning : ASSETS.process} />
					</S.PlaceholderIcon>
					<S.PlaceholderDescription>
						<p>{loadingPath ? `${language.loading}...` : pathNotFound ? language.pathNotFound : language.pathOrId}</p>
					</S.PlaceholderDescription>
				</S.Placeholder>
			);
		}
		
		// If we don't have a current response but we have previous content, use the last successful response
		const responseToUse = fullResponse || lastSuccessfulResponse;
		if (!responseToUse) {
			return null;
		}

		return (
			<>
				<S.InfoWrapper>
					<S.InfoSection className={'border-wrapper-alt3'}>
						<S.SignatureHeader>
							<p>Signature</p>
							{signature ? <Copyable value={signature} format={'truncate'} /> : <p>-</p>}
						</S.SignatureHeader>
						<S.SignatureBody>
							<S.SignatureStatus valid={signatureValid}>
								<span>Status</span>
								<p>{signatureValid === true ? 'Verified' : signatureValid === false ? 'Invalid' : 'Pending'}</p>
							</S.SignatureStatus>
							<S.SignatureLine>
								<span>Signer</span>
								{signer ? <Copyable value={signer} format={'address'} /> : <p>-</p>}
							</S.SignatureLine>
						</S.SignatureBody>
					</S.InfoSection>
					{buildInfoSection('Signed Headers', ASSETS.headers, headers)}
					{buildInfoSection('Links', ASSETS.link, links)}
				</S.InfoWrapper>
				{responseToUse && (
					<S.BodyWrapper>
						<HyperLinks path={submittedPath} />
						{responseBody && (
							<>
								{bodyType === 'json' ? (
									<JSONReader data={responseBody} header={'Body'} maxHeight={700} />
								) : (
									<Editor initialData={responseBody} header={'Body'} language={'html'} loading={false} readOnly />
								)}
							</>
						)}
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
						<S.SearchInputWrapper cacheStatus={cacheStatus}>
							<ReactSVG src={ASSETS.search} />
							<FormField
								value={inputPath}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									const newValue = e.target.value;
									setInputPath(newValue);
									
									// Reset state when input is cleared
									if (newValue === '') {
										setHasContent(false);
										setFullResponse(null);
										setLastSuccessfulResponse(null);
										setSubmittedPath('');
										setResponseBody(null);
										setHeaders(null);
										setLinks(null);
										setSignature(null);
										setSigner(null);
										setSignatureValid(null);
										setPathNotFound(false);
										setCacheStatus('default');
									}
								}}
								onKeyPress={handleKeyPress}
								placeholder={language.pathOrId}
								invalid={{ status: false, message: null }}
								disabled={loadingPath}
								autoFocus
								hideErrorMessage
								sm
							/>
						</S.SearchInputWrapper>
						<IconButton
							type={'alt1'}
							src={ASSETS.go}
							handlePress={() => handleSubmit()}
							disabled={loadingPath || !inputPath}
							dimensions={{
								wrapper: 32.5,
								icon: 17.5,
							}}
							tooltip={loadingPath ? `${language.loading}...` : language.run}
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
						</S.PathInfoWrapper>
					</S.HeaderActionsWrapper>
				</S.HeaderWrapper>
				<S.ContentWrapper>
					{inputPath === '' && !hasContent ? (
						<SamplePaths onPathSelect={(path) => {
							setInputPath(path);
							handleSubmit(path);
						}} />
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
