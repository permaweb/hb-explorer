import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { Copyable } from 'components/atoms/Copyable';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Notification } from 'components/atoms/Notification';
import { Tabs } from 'components/atoms/Tabs';
import { Editor } from 'components/molecules/Editor';
import { JSONReader } from 'components/molecules/JSONReader';
import { ASSETS, URLS } from 'helpers/config';
import { base64UrlToUint8Array, parseSignatureInput, verifySignature } from 'helpers/signatures';
import { checkValidAddress, hbFetch, stripUrlProtocol } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

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

	const [fullResponse, setFullResponse] = React.useState<any>(null);

	const [responseBody, setResponseBody] = React.useState<any>(null);
	const [hyperbuddyData, setHyperbuddyData] = React.useState<any>(null);
	const [bodyType, setBodyType] = React.useState<'json' | 'raw'>('raw');

	const [id, setId] = React.useState<string | null>(null);
	const [headers, setHeaders] = React.useState<any>(null);
	const [links, setLinks] = React.useState<any>(null);
	const [signature, setSignature] = React.useState<string | null>(null);
	const [signer, setSigner] = React.useState<string | null>(null);
	const [signatureAlg, setSignatureAlg] = React.useState<string | null>(null);
	const [signatureKeyId, setSignatureKeyId] = React.useState<string | null>(null);
	const [signatureValid, setSignatureValid] = React.useState<boolean | null>(null);

	const [loadingPath, setLoadingPath] = React.useState<boolean>(false);
	const [copied, setCopied] = React.useState<boolean>(false);
	const [error, setError] = React.useState<string | null>(null);
	const [pathNotFound, setPathNotFound] = React.useState<boolean>(false);

	React.useEffect(() => {
		setInputPath(props.path);
	}, [props.path]);

	React.useEffect(() => {
		if (!inputPath) {
			return;
		}

		const timeoutId = setTimeout(
			async () => {
				handleSubmit();
			},
			checkValidAddress(inputPath) ? 0 : 1000
		);

		return () => {
			clearTimeout(timeoutId);
			setLoadingPath(false);
		};
	}, [inputPath]);

	async function handleSubmit() {
		if (inputPath) {
			setLoadingPath(true);
			try {
				const response = await fetch(`${window.hyperbeamUrl}/${inputPath}`);

				const hyperbuddyResponse = await hbFetch(`/${inputPath}/format~hyperbuddy@1.0`);
				setHyperbuddyData(hyperbuddyResponse);

				if (!response.ok) {
					setPathNotFound(true);
					setLoadingPath(false);
					return;
				}

				setFullResponse(response);

				const raw = joinHeaders(response.headers).trim();
				const parsed = parseHeaders(raw);
				const signature = response.headers.get('signature');

				const sigInputRaw = parsed['signature-input']?.data;
				setHeaders(sigInputRaw ? filterSignedHeaders(parsed, sigInputRaw) : parsed);

				if (signature) {
					const messageId = await getMessageIdFromSig(signature);
					setId(messageId);

					const signatureInput = parsed['signature-input']?.data ?? '';

					const signer = signatureInput ? await getSignerAddress(signatureInput) : 'Unknown';
					const isValid = signatureInput ? await verifySignature(signature, signatureInput, response) : false;
					const alg = getSignatureAlg(sigInputRaw);
					const keyid = getSignatureKeyId(sigInputRaw);

					setSignature(signature);
					setSigner(signer);
					setSignatureValid(isValid);
					setSignatureAlg(alg);
					setSignatureKeyId(keyid);
				}

				let linkHeaders = {};
				for (const key of Object.keys(parsed)) {
					if (key.includes('+link')) {
						linkHeaders[key] = parsed[key];
					}
				}

				setLinks(linkHeaders);

				props.onPathChange(inputPath, inputPath);
				setPathNotFound(false);
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
	 * Extracts the last `alg` value from a comma-separated signature header.
	 * @param header A string like
	 *   `sig-…;alg="rsa-pss-sha512";keyid="foo", sig-…;alg="hmac-sha256";keyid="bar"`
	 * @returns the last alg (e.g. "hmac-sha256"), or null if none found
	 */
	function getSignatureAlg(header: string): string | null {
		// gather all alg="…" matches
		const matches = Array.from(header.matchAll(/;alg="([^"]+)"/g));
		if (matches.length === 0) return null;
		// return the capture group of the last match
		return matches[matches.length - 1][1];
	}

	/**
	 * Extracts the last `keyid` value from a comma-separated signature header.
	 * @param header A string like
	 *   `sig-…;alg="rsa-pss-sha512";keyid="foo", sig-…;alg="hmac-sha256";keyid="bar"`
	 * @returns the last keyid (e.g. "bar"), or null if none found
	 */
	function getSignatureKeyId(header: string): string | null {
		const matches = Array.from(header.matchAll(/;keyid="([^"]+)"/g));
		if (matches.length === 0) return null;
		return matches[matches.length - 1][1];
	}

	/**
	 * @param {string} fullSig  A string like "sig-<b64urlSig>:…"
	 * @returns {Promise<string>}  The Base64URL-encoded SHA-256 hash of the signature
	 */
	async function getMessageIdFromSig(fullSig) {
		// Grab the part after "sig-" and before the first ":"
		let [sigPart] = fullSig.split(':');
		if (!sigPart.startsWith('sig-')) {
			throw new Error('Expected signature to start with "sig-"');
		}
		sigPart = sigPart.slice(4);

		// Base64url → Base64
		const b64 =
			sigPart.replace(/-/g, '+').replace(/_/g, '/') +
			// Pad to multiple of 4
			'='.repeat((4 - (sigPart.length % 4)) % 4);

		// Decode to bytes
		const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

		// Hash it
		const hashBuf = await crypto.subtle.digest('SHA-256', raw);

		// Hash → Base64URL (no padding)
		const hashBytes = new Uint8Array(hashBuf);
		let hashB64 = btoa(String.fromCharCode(...hashBytes));
		const hashB64url = hashB64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

		return hashB64url;
	}

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
		if (!inputPath || loadingPath || pathNotFound || !fullResponse) {
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
							{signatureAlg && (
								<S.SignatureLine>
									<span>Format</span>
									<p>{signatureAlg}</p>
								</S.SignatureLine>
							)}
							{signatureKeyId && (
								<S.SignatureLine>
									<span>Key</span>
									<p>{signatureKeyId}</p>
								</S.SignatureLine>
							)}
						</S.SignatureBody>
					</S.InfoSection>
					{buildInfoSection('Signed Headers', ASSETS.headers, headers)}
					{buildInfoSection('Links', ASSETS.link, links)}
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
							<>
								{bodyType === 'json' ? (
									<JSONReader data={responseBody} header={'Body'} maxHeight={700} />
								) : (
									<Editor initialData={responseBody} language={'html'} loading={false} readOnly />
								)}
							</>
						</S.Tab>
						<S.Tab label={'Graph'}>
							<HyperLinks path={inputPath} id={id} />
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
						<S.SearchInputWrapper>
							<ReactSVG src={ASSETS.search} />
							<FormField
								value={inputPath}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputPath(e.target.value)}
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
				<S.ContentWrapper>{getPath()}</S.ContentWrapper>
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
