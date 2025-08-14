import httpSig from 'http-message-signatures';

/**
 * Decode base64url string → Uint8Array
 */
export function base64UrlToUint8Array(b64url: string): Uint8Array {
	try {
		let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
		// Pad to multiple of 4
		while (b64.length % 4) b64 += '=';
		const bin = atob(b64);
		const arr = new Uint8Array(bin.length);
		for (let i = 0; i < bin.length; i++) {
			arr[i] = bin.charCodeAt(i);
		}
		return arr;
	} catch (error) {
		throw new Error(`Invalid base64url string: ${b64url}`);
	}
}

/**
 * Parse a Signature-Input header value into structured entries.
 * @param {string} inputHeader – the raw Signature-Input header *value* (no "Signature-Input:" prefix)
 */
export function parseSignatureInput(inputHeader: string) {
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
 * Encode DER length field
 */
export function encodeDERLength(length: number): Uint8Array {
	if (length < 0x80) {
		return new Uint8Array([length]);
	} else if (length < 0x100) {
		return new Uint8Array([0x81, length]);
	} else if (length < 0x10000) {
		return new Uint8Array([0x82, (length >> 8) & 0xff, length & 0xff]);
	} else {
		// For longer lengths, add more bytes as needed
		return new Uint8Array([0x83, (length >> 16) & 0xff, (length >> 8) & 0xff, length & 0xff]);
	}
}

/**
 * Create DER INTEGER from bytes
 */
export function createDERInteger(bytes: Uint8Array): Uint8Array {
	// Add leading zero if first byte has high bit set (to ensure positive integer)
	const needsLeadingZero = bytes[0] >= 0x80;
	const contentLength = bytes.length + (needsLeadingZero ? 1 : 0);
	const lengthBytes = encodeDERLength(contentLength);

	const result = new Uint8Array(1 + lengthBytes.length + contentLength);
	let offset = 0;

	result[offset++] = 0x02; // INTEGER tag
	result.set(lengthBytes, offset);
	offset += lengthBytes.length;

	if (needsLeadingZero) {
		result[offset++] = 0x00;
	}
	result.set(bytes, offset);

	return result;
}

/**
 * Create DER SEQUENCE from content bytes
 */
export function createDERSequence(content: Uint8Array): Uint8Array {
	const lengthBytes = encodeDERLength(content.length);
	const result = new Uint8Array(1 + lengthBytes.length + content.length);
	let offset = 0;

	result[offset++] = 0x30; // SEQUENCE tag
	result.set(lengthBytes, offset);
	offset += lengthBytes.length;
	result.set(content, offset);

	return result;
}

/**
 * Wrap PKCS#1 RSAPublicKey in SPKI format
 */
export function wrapPKCS1InSPKI(pkcs1Key: Uint8Array): Uint8Array {
	// RSA SPKI header for RSA encryption (OID: 1.2.840.113549.1.1.1)
	const rsaOid = new Uint8Array([
		0x30,
		0x0d, // SEQUENCE (13 bytes)
		0x06,
		0x09, // OID (9 bytes)
		0x2a,
		0x86,
		0x48,
		0x86,
		0xf7,
		0x0d,
		0x01,
		0x01,
		0x01, // RSA OID
		0x05,
		0x00, // NULL parameters
	]);

	// Calculate BIT STRING content length (1 byte for unused bits + PKCS#1 key)
	const bitStringContentLen = 1 + pkcs1Key.length;
	const bitStringLenBytes = encodeDERLength(bitStringContentLen);
	const bitStringTotalLen = 1 + bitStringLenBytes.length + bitStringContentLen;

	// Calculate total content length
	const contentLen = rsaOid.length + bitStringTotalLen;
	const contentLenBytes = encodeDERLength(contentLen);

	// Calculate total SPKI length
	const totalLen = 1 + contentLenBytes.length + contentLen;

	// Build SPKI structure
	const spki = new Uint8Array(totalLen);
	let offset = 0;

	// SEQUENCE tag
	spki[offset++] = 0x30;

	// SEQUENCE length
	spki.set(contentLenBytes, offset);
	offset += contentLenBytes.length;

	// Algorithm identifier (RSA OID)
	spki.set(rsaOid, offset);
	offset += rsaOid.length;

	// Subject public key (BIT STRING)
	spki[offset++] = 0x03; // BIT STRING tag
	spki.set(bitStringLenBytes, offset);
	offset += bitStringLenBytes.length;
	spki[offset++] = 0x00; // No unused bits
	spki.set(pkcs1Key, offset);

	return spki;
}

/**
 * Create proper SPKI structure from raw RSA key bytes
 */
export function createRSASPKIFromRaw(keyBytes: Uint8Array): Uint8Array {
	// For a 512-byte key, assume it's a raw RSA public key that needs to be wrapped
	// First, we need to create the RSA public key structure (modulus + exponent)

	// Common RSA public exponent (65537)
	const publicExponent = new Uint8Array([0x01, 0x00, 0x01]);

	// Assume the key bytes are the modulus (this might need adjustment)
	const modulus = keyBytes;

	// Create RSA public key structure: SEQUENCE { modulus INTEGER, publicExponent INTEGER }
	const modulusWithTag = createDERInteger(modulus);
	const exponentWithTag = createDERInteger(publicExponent);

	const publicKeyData = new Uint8Array(modulusWithTag.length + exponentWithTag.length);
	publicKeyData.set(modulusWithTag, 0);
	publicKeyData.set(exponentWithTag, modulusWithTag.length);

	// Wrap in SEQUENCE
	const publicKeySequence = createDERSequence(publicKeyData);

	// Now wrap in SPKI
	return wrapRSAKeyInSPKI(publicKeySequence);
}

/**
 * Wrap RSA public key in SPKI format
 */
export function wrapRSAKeyInSPKI(keyBytes: Uint8Array): Uint8Array {
	// RSA SPKI header for RSA encryption (OID: 1.2.840.113549.1.1.1)
	const rsaOid = new Uint8Array([
		0x30,
		0x0d, // SEQUENCE (13 bytes)
		0x06,
		0x09, // OID (9 bytes)
		0x2a,
		0x86,
		0x48,
		0x86,
		0xf7,
		0x0d,
		0x01,
		0x01,
		0x01, // RSA OID
		0x05,
		0x00, // NULL parameters
	]);

	// Calculate BIT STRING content length (1 byte for unused bits + key bytes)
	const bitStringContentLen = 1 + keyBytes.length;
	const bitStringLenBytes = encodeDERLength(bitStringContentLen);
	const bitStringTotalLen = 1 + bitStringLenBytes.length + bitStringContentLen; // tag + length + content

	// Calculate algorithm identifier + bit string total length
	const contentLen = rsaOid.length + bitStringTotalLen;
	const contentLenBytes = encodeDERLength(contentLen);

	// Calculate total SPKI length
	const totalLen = 1 + contentLenBytes.length + contentLen; // SEQUENCE tag + length + content

	// Build SPKI structure
	const spki = new Uint8Array(totalLen);
	let offset = 0;

	// SEQUENCE tag
	spki[offset++] = 0x30;

	// SEQUENCE length
	spki.set(contentLenBytes, offset);
	offset += contentLenBytes.length;

	// Algorithm identifier (RSA OID)
	spki.set(rsaOid, offset);
	offset += rsaOid.length;

	// Subject public key (BIT STRING)
	spki[offset++] = 0x03; // BIT STRING tag
	spki.set(bitStringLenBytes, offset);
	offset += bitStringLenBytes.length;
	spki[offset++] = 0x00; // No unused bits

	// Check bounds before copying key bytes
	if (offset + keyBytes.length > spki.length) {
		throw new Error(
			`Buffer overflow: trying to write ${keyBytes.length} bytes at offset ${offset} in buffer of size ${spki.length}`
		);
	}

	spki.set(keyBytes, offset);

	return spki;
}

/**
 * Import RSA public key with multiple format fallbacks
 */
export async function importRSAPublicKey(keyBytes: Uint8Array, algorithm: string): Promise<CryptoKey | null> {
	const alg = algorithm.toLowerCase();

	// Determine hash algorithm
	let hashAlg = 'SHA-256';
	if (alg.includes('sha512')) hashAlg = 'SHA-512';
	else if (alg.includes('sha384')) hashAlg = 'SHA-384';

	const rsaAlg = alg.includes('pss') ? 'RSA-PSS' : 'RSASSA-PKCS1-v1_5';

	try {
		return await crypto.subtle.importKey('spki', keyBytes as any, { name: rsaAlg, hash: hashAlg }, false, ['verify']);
	} catch (e) {
		// Try different approaches for raw RSA keys
		if (keyBytes.length >= 256) {
			// Approach 1: Check if it's already a PKCS#1 RSAPublicKey structure
			if (keyBytes[0] === 0x30) {
				try {
					const spkiWrapped = wrapPKCS1InSPKI(keyBytes);
					const cryptoKey = await crypto.subtle.importKey(
						'spki',
						spkiWrapped as any,
						{ name: rsaAlg, hash: hashAlg },
						false,
						['verify']
					);
					return cryptoKey;
				} catch (e2) {}
			}

			// Approach 2: Try as raw modulus (original approach)
			try {
				const spkiWrapped = createRSASPKIFromRaw(keyBytes);
				const cryptoKey = await crypto.subtle.importKey(
					'spki',
					spkiWrapped as any,
					{ name: rsaAlg, hash: hashAlg },
					false,
					['verify']
				);
				return cryptoKey;
			} catch (e2) {}

			// Last attempt: try the existing wrapper
			try {
				const wrappedKey = wrapRSAKeyInSPKI(keyBytes);
				const cryptoKey = await crypto.subtle.importKey(
					'spki',
					wrappedKey as any,
					{ name: rsaAlg, hash: hashAlg },
					false,
					['verify']
				);
				return cryptoKey;
			} catch (e3) {}
		}

		return null;
	}
}

/**
 * Create key lookup function for http-message-signatures library
 */
export function createKeyLookup(fallbackEntry: any) {
	return async (params: any) => {
		// Skip HMAC signatures - we can't verify them without the secret key
		const alg = params.alg?.toLowerCase();
		if (alg && alg.includes('hmac')) {
			return null; // Return null to skip this signature
		}

		// The keyid might have a "publickey:" or "constant:" prefix that needs to be stripped
		let keyid = params.keyid;
		if (keyid.startsWith('publickey:')) {
			keyid = keyid.slice(10);
		} else if (keyid.startsWith('constant:')) {
			keyid = keyid.slice(9);
		}

		// The keyid should be the base64url encoded public key
		const keyBytes = base64UrlToUint8Array(keyid);

		// Try to import as different key types based on algorithm
		const algorithm = alg || fallbackEntry.alg.toLowerCase();

		let cryptoKey: CryptoKey | null = null;

		if (algorithm.includes('rsa')) {
			cryptoKey = await importRSAPublicKey(keyBytes, algorithm);
		} else if (algorithm.includes('ecdsa')) {
			cryptoKey = await crypto.subtle.importKey(
				'spki',
				keyBytes as any,
				{ name: 'ECDSA', namedCurve: 'P-256' },
				false,
				['verify']
			);
		} else if (algorithm.includes('ed25519')) {
			cryptoKey = await crypto.subtle.importKey(
				'raw',
				keyBytes.length === 32 ? keyBytes : (keyBytes.slice(-32) as any),
				{ name: 'Ed25519' },
				false,
				['verify']
			);
		}

		if (!cryptoKey) {
			throw new Error(`Failed to import key for algorithm: ${algorithm}`);
		}

		// Create key object with verify method as expected by the library
		return {
			id: params.keyid,
			alg: algorithm,
			verify: async (data: ArrayBuffer, signature: ArrayBuffer, _verifyParams: any) => {
				// Get the appropriate algorithm object for Web Crypto API
				let webCryptoAlg: any;
				if (algorithm.includes('rsa-pss')) {
					let saltLength = 32; // Default for SHA-256
					if (algorithm.includes('sha512')) saltLength = 64;
					else if (algorithm.includes('sha384')) saltLength = 48;

					webCryptoAlg = {
						name: 'RSA-PSS',
						saltLength: saltLength,
					};
				} else if (algorithm.includes('rsa')) {
					webCryptoAlg = { name: 'RSASSA-PKCS1-v1_5' };
				} else if (algorithm.includes('ecdsa')) {
					let hashAlg = 'SHA-256';
					if (algorithm.includes('sha512')) hashAlg = 'SHA-512';
					else if (algorithm.includes('sha384')) hashAlg = 'SHA-384';

					webCryptoAlg = { name: 'ECDSA', hash: hashAlg };
				} else if (algorithm.includes('ed25519')) {
					webCryptoAlg = { name: 'Ed25519' };
				}

				try {
					const isValid = await crypto.subtle.verify(webCryptoAlg, cryptoKey, signature, data);
					return isValid;
				} catch (error) {
					return false;
				}
			},
		};
	};
}

/**
 * Verify HTTP Message Signature using http-message-signatures library
 * @param {string} signature - The base64url encoded signature
 * @param {string} signatureInput - The signature-input header value
 * @param {Response} response - The HTTP response object
 * @returns {Promise<boolean>} true if signature is valid
 */
export async function verifySignature(signature: string, signatureInput: string, response: Response): Promise<boolean> {
	try {
		// Convert Response headers to plain object
		const headers: Record<string, string> = {};
		response.headers.forEach((value, key) => {
			headers[key.toLowerCase()] = value;
		});

		// Ensure signature and signature-input headers are included
		headers['signature'] = signature;
		headers['signature-input'] = signatureInput;

		// Extract keyid from signature-input for key resolution
		const sigInputs = parseSignatureInput(signatureInput);
		const entry = sigInputs.find((e) => e.alg.toLowerCase() !== 'hmac-sha256') || sigInputs[0];

		if (!entry || !entry.keyid) {
			return false;
		}

		// Create key lookup function
		const keyLookup = createKeyLookup(entry);

		// Create message object for the library
		const message = {
			method: 'GET', // Assuming GET request
			url: response.url,
			headers: headers,
		};

		// Verify the message signature using the correct API
		const isValid = await httpSig.verifyMessage({ keyLookup } as any, message);

		return isValid;
	} catch (error) {
		console.error('Signature verification with library failed:', error);
		return false;
	}
}

/**
 * Extracts the last `alg` value from a comma-separated signature header.
 * @param header A string like
 *   `sig-…;alg="rsa-pss-sha512";keyid="foo", sig-…;alg="hmac-sha256";keyid="bar"`
 * @returns the last alg (e.g. "hmac-sha256"), or null if none found
 */
export function getSignatureAlg(header: string): string | null {
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
export function getSignatureKeyId(header: string): string | null {
	const matches = Array.from(header.matchAll(/;keyid="([^"]+)"/g));
	if (matches.length === 0) return null;
	return matches[matches.length - 1][1];
}

/**
 * @param {string} fullSig  A string like "comm-<b64urlSig>:…"
 * @returns {Promise<string>}  The Base64URL-encoded SHA-256 hash of the signature
 */
export async function getMessageIdFromSignature(fullSig) {
	// Grab the part after "comm-" and before the first ":"
	let [sigPart] = fullSig.split(':');
	if (!sigPart.startsWith('comm-')) {
		throw new Error('Expected signature to start with "comm-"');
	}
	sigPart = sigPart.slice(5);

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
export function filterSignedHeaders(parsedHeaders, signatureInputValue) {
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
export async function getSignerAddress(sigInputRaw) {
	const entries = parseSignatureInput(sigInputRaw);
	if (!entries.length) return 'Unknown';

	// Pick the first entry whose alg isn't hmac-sha256 (i.e. the real pubkey)
	const realEntry = entries.find((e) => e.alg.toLowerCase() !== 'hmac-sha256') || entries[0];
	let rawKeyId = realEntry.keyid;

	// Strip "publickey:" or "constant:" prefix if present
	if (rawKeyId.startsWith('publickey:')) {
		rawKeyId = rawKeyId.slice(10);
	} else if (rawKeyId.startsWith('constant:')) {
		rawKeyId = rawKeyId.slice(9);
	}

	// Now decode it to bytes (base64url → Uint8Array)
	const pubKeyBytes = base64UrlToUint8Array(rawKeyId);

	// sha-256 the public key bytes
	const hash = await crypto.subtle.digest('SHA-256', pubKeyBytes as any);
	const hashArr = new Uint8Array(hash);

	// base64url-encode the hash to get your “address”
	const address = btoa(String.fromCharCode(...hashArr))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

	return address;
}
