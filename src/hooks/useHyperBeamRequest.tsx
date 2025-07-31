import React from 'react';

import { base64UrlToUint8Array, parseSignatureInput, verifySignature } from 'helpers/signatures';

export interface HyperBeamRequestState {
	loading: boolean;
	response: Response | null;
	headers: any;
	links: any;
	signature: string | null;
	signer: string | null;
	signatureValid: boolean | null;
	signatureAlg: string | null;
	signatureKeyId: string | null;
	id: string | null;
	error: boolean;
	hasContent: boolean;
	lastSuccessfulResponse: Response | null;
	submittedPath: string;
}

export interface UseHyperBeamRequestReturn extends HyperBeamRequestState {
	submitRequest: (path: string) => Promise<void>;
	reset: () => void;
	setState: (newState: Partial<HyperBeamRequestState>) => void;
}

// Helper functions (extracted from HyperPath)
function joinHeaders(headers: Headers): string {
	const result: string[] = [];
	headers.forEach((value, key) => {
		result.push(`${key}: ${value}`);
	});
	return result.join('\n');
}

function parseHeaders(raw: string): Record<string, any> {
	const lines = raw.split('\n');
	const parsed: Record<string, any> = {};

	for (const line of lines) {
		const colonIndex = line.indexOf(':');
		if (colonIndex > 0) {
			const key = line.substring(0, colonIndex).trim().toLowerCase();
			const value = line.substring(colonIndex + 1).trim();
			parsed[key] = { data: value };
		}
	}

	return parsed;
}

function filterSignedHeaders(parsed: Record<string, any>, sigInputRaw: string): Record<string, any> {
	const entries = parseSignatureInput(sigInputRaw);
	if (!entries.length) return parsed;

	const signedHeaders = entries[0]?.fields || [];
	const filtered: Record<string, any> = {};

	for (const header of signedHeaders) {
		if (parsed[header]) {
			filtered[header] = parsed[header];
		}
	}

	return filtered;
}

async function getSignerAddress(sigInputRaw: string): Promise<string> {
	const entries = parseSignatureInput(sigInputRaw);
	if (!entries.length) return 'Unknown';

	const keyId = entries[0]?.keyid;
	if (!keyId) return 'Unknown';

	try {
		const keyIdBuffer = base64UrlToUint8Array(keyId);
		const keyIdArray = Array.from(keyIdBuffer);

		// Convert to base64url without padding
		let base64 = btoa(String.fromCharCode.apply(null, keyIdArray));
		base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

		return base64.length > 43 ? base64.substring(0, 43) : base64;
	} catch (e) {
		console.error('Error processing signer address:', e);
		return 'Unknown';
	}
}

function getSignatureAlg(header: string): string | null {
	const matches = Array.from(header.matchAll(/;alg="([^"]+)"/g));
	if (matches.length === 0) return null;
	return matches[matches.length - 1][1];
}

function getSignatureKeyId(header: string): string | null {
	const matches = Array.from(header.matchAll(/;keyid="([^"]+)"/g));
	if (matches.length === 0) return null;
	return matches[matches.length - 1][1];
}

async function getMessageIdFromSig(fullSig: string): Promise<string> {
	let [sigPart] = fullSig.split(':');
	if (!sigPart.startsWith('sig-')) {
		throw new Error('Expected signature to start with "sig-"');
	}
	sigPart = sigPart.slice(4);

	// Base64url → Base64
	const b64 = sigPart.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (sigPart.length % 4)) % 4);

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

export function useHyperBeamRequest(): UseHyperBeamRequestReturn {
	const [state, setState] = React.useState<HyperBeamRequestState>({
		loading: false,
		response: null,
		headers: null,
		links: null,
		signature: null,
		signer: null,
		signatureValid: null,
		signatureAlg: null,
		signatureKeyId: null,
		id: null,
		error: false,
		hasContent: false,
		lastSuccessfulResponse: null,
		submittedPath: '',
	});

	const submitRequest = async (path: string) => {
		if (!path) return;

		setState((prev) => ({ ...prev, loading: true, error: false }));

		try {
			const response = await fetch(`${window.hyperbeamUrl}/${path}`);

			if (!response.ok) {
				setState((prev) => ({
					...prev,
					loading: false,
					error: true,
					hasContent: false,
				}));
				return;
			}

			// Parse headers
			const raw = joinHeaders(response.headers).trim();
			const parsed = parseHeaders(raw);

			// Handle signature verification
			const signature = response.headers.get('signature');
			let signer: string | null = null;
			let signatureValid: boolean | null = null;
			let signatureAlg: string | null = null;
			let signatureKeyId: string | null = null;
			let id: string | null = null;

			if (signature) {
				const signatureInput = parsed['signature-input']?.data ?? '';
				signer = signatureInput ? await getSignerAddress(signatureInput) : 'Unknown';
				signatureValid = signatureInput ? await verifySignature(signature, signatureInput, response) : false;
				signatureAlg = signatureInput ? getSignatureAlg(signatureInput) : null;
				signatureKeyId = signatureInput ? getSignatureKeyId(signatureInput) : null;

				try {
					id = await getMessageIdFromSig(signature);
				} catch (e) {
					console.error('Error getting message ID:', e);
					id = null;
				}
			}

			// Filter headers for signed content
			const sigInputRaw = parsed['signature-input']?.data;
			const filteredHeaders = sigInputRaw ? filterSignedHeaders(parsed, sigInputRaw) : parsed;

			// Extract link headers
			const linkHeaders: Record<string, any> = {};
			for (const key of Object.keys(parsed)) {
				if (key.includes('+link')) {
					linkHeaders[key] = parsed[key];
				}
			}

			setState((prev) => ({
				...prev,
				loading: false,
				response,
				lastSuccessfulResponse: response,
				headers: filteredHeaders,
				links: linkHeaders,
				signature,
				signer,
				signatureValid,
				signatureAlg,
				signatureKeyId,
				id,
				error: false,
				hasContent: true,
				submittedPath: path,
			}));
		} catch (e: any) {
			console.error('HyperBEAM request failed:', e);
			setState((prev) => ({
				...prev,
				loading: false,
				error: true,
				hasContent: false,
			}));
		}
	};

	const reset = () => {
		setState({
			loading: false,
			response: null,
			headers: null,
			links: null,
			signature: null,
			signer: null,
			signatureValid: null,
			signatureAlg: null,
			signatureKeyId: null,
			id: null,
			error: false,
			hasContent: false,
			lastSuccessfulResponse: null,
			submittedPath: '',
		});
	};

	const setStateExposed = (newState: Partial<HyperBeamRequestState>) => {
		setState(prev => ({ ...prev, ...newState }));
	};

	return {
		...state,
		submitRequest,
		reset,
		setState: setStateExposed,
	};
}
