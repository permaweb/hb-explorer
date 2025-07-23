import React from 'react';
import { ReactSVG } from 'react-svg';

import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Notification } from 'components/atoms/Notification';
import { ASSETS } from 'helpers/config';
import { stripUrlProtocol } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function HyperPath(props: {
	path: string;
	active: boolean;
	onPathChange?: (id: string, path: string) => void;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [inputPath, setInputPath] = React.useState<string>(props.path);
	const [pathResponse, setPathResponse] = React.useState<any>(null);
	const [loadingPath, setLoadingPath] = React.useState<boolean>(false);
	const [copied, setCopied] = React.useState<boolean>(false);
	const [error, setError] = React.useState<string | null>(null);
	const [pathNotFound, setPathNotFound] = React.useState<boolean>(false);

	async function handleSubmit() {
		if (inputPath) {
			setLoadingPath(true);
			try {
				const response = await fetch(`${window.hyperbeamUrl}/${inputPath}`);

				if (!response.ok) {
					setPathNotFound(true);
					setLoadingPath(false);
					return;
				}

				const raw = joinHeaders(response.headers).trim();
				const parsed = parseHeaders(raw);

				const signature = response.headers.get('signature');

				if (signature) {
					const signatureInput = parsed['signature-input']?.data ?? '';

					const signer = signatureInput ? await getSignerAddress(signatureInput) : 'Unknown';

					console.log(signature);
					console.log(signer);
				}

				props.onPathChange(signature ?? inputPath, inputPath);
				setPathNotFound(false);
			} catch (e: any) {
				console.error(e);
				setPathNotFound(true);
			}
			setLoadingPath(false);
		}
	}

	/**
	 * Parse a Signature-Input header value into structured entries.
	 * @param {string} inputHeader – the raw Signature-Input header *value* (no “Signature-Input:” prefix)
	 */
	function parseSignatureInput(inputHeader) {
		return inputHeader.split(/\s*,\s*/).map((entry) => {
			// Label is everything before the first '='
			const eq = entry.indexOf('=');
			const label = entry.slice(0, eq).trim();

			// Fields are inside the first "(...)"
			const parenMatch = entry.match(/=\(\s*([^)]+)\s*\)/);
			const fields = parenMatch ? Array.from(parenMatch[1].matchAll(/"([^"]+)"/g), (m) => m[1]) : [];

			// Pull out any ;key="value" pairs
			const paramRegex = /;\s*([^=;\s]+)\s*=\s*"([^"]*)"/g;
			const params: any = {};
			let m;
			while ((m = paramRegex.exec(entry)) !== null) {
				params[m[1]] = m[2];
			}

			return {
				label,
				fields,
				alg: params.alg || '',
				keyid: params.keyid || '',
				...(params.tag ? { tag: params.tag } : {}),
			};
		});
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

	/** Decode base64url string → Uint8Array */
	function base64UrlToUint8Array(b64url) {
		let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
		// Pad to multiple of 4
		while (b64.length % 4) b64 += '=';
		const bin = atob(b64);
		const arr = new Uint8Array(bin.length);
		for (let i = 0; i < bin.length; i++) {
			arr[i] = bin.charCodeAt(i);
		}
		return arr;
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

	function getPath() {
		if (!inputPath || !pathResponse || pathNotFound) {
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

		return <p>HB Tab</p>;
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
				<S.BodyWrapper>{getPath()}</S.BodyWrapper>
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
