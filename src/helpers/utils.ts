export function checkValidAddress(address: string | null) {
	if (!address) return false;
	return /^[a-z0-9_-]{43}$/i.test(address);
}

export function formatAddress(address: string | null, wrap: boolean) {
	if (!address) return '';
	if (!checkValidAddress(address)) return address;
	const formattedAddress = address.substring(0, 5) + '...' + address.substring(36, address.length);
	return wrap ? `(${formattedAddress})` : formattedAddress;
}

export function getTagValue(list: { [key: string]: any }[], name: string): string {
	for (let i = 0; i < list.length; i++) {
		if (list[i]) {
			if (list[i]!.name === name) {
				return list[i]!.value as string;
			}
		}
	}
	return null;
}

export function formatCount(count: string): string {
	if (count === '0' || !Number(count)) return '0';

	if (count.includes('.')) {
		let parts = count.split('.');
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

		// Find the position of the last non-zero digit within the first 6 decimal places
		let index = 0;
		for (let i = 0; i < Math.min(parts[1].length, 6); i++) {
			if (parts[1][i] !== '0') {
				index = i + 1;
			}
		}

		if (index === 0) {
			// If all decimals are zeros, keep two decimal places
			parts[1] = '00';
		} else {
			// Otherwise, truncate to the last non-zero digit
			parts[1] = parts[1].substring(0, index);

			// If the decimal part is longer than 2 digits, truncate to 2 digits
			if (parts[1].length > 2 && parts[1].substring(0, 2) !== '00') {
				parts[1] = parts[1].substring(0, 2);
			}
		}

		return parts.join('.');
	} else {
		return count.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}
}

export function formatDate(dateArg: string | number | null, dateType: 'dateString' | 'timestamp', fullTime?: boolean) {
	if (!dateArg) {
		return null;
	}

	let date: Date | null = null;

	switch (dateType) {
		case 'dateString':
			date = new Date(dateArg);
			break;
		case 'timestamp':
			date = new Date(Number(dateArg));
			break;
		default:
			date = new Date(dateArg);
			break;
	}

	return fullTime
		? `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getUTCFullYear()} ${
				date.getHours() % 12 || 12
		  }:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')} ${
				date.getHours() >= 12 ? 'PM' : 'AM'
		  }`
		: `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getUTCFullYear()}`;
}

export function formatMs(ms) {
	if (ms == null) return '';
	return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

export function getRelativeDate(timestamp: number) {
	if (!timestamp) return '-';
	const currentDate = new Date();
	const inputDate = new Date(timestamp);

	const timeDifference: number = currentDate.getTime() - inputDate.getTime();
	const secondsDifference = Math.floor(timeDifference / 1000);
	const minutesDifference = Math.floor(secondsDifference / 60);
	const hoursDifference = Math.floor(minutesDifference / 60);
	const daysDifference = Math.floor(hoursDifference / 24);
	const monthsDifference = Math.floor(daysDifference / 30.44); // Average days in a month
	const yearsDifference = Math.floor(monthsDifference / 12);

	if (yearsDifference > 0) {
		return `${yearsDifference} year${yearsDifference > 1 ? 's' : ''} ago`;
	} else if (monthsDifference > 0) {
		return `${monthsDifference} month${monthsDifference > 1 ? 's' : ''} ago`;
	} else if (daysDifference > 0) {
		return `${daysDifference} day${daysDifference > 1 ? 's' : ''} ago`;
	} else if (hoursDifference > 0) {
		return `${hoursDifference} hour${hoursDifference > 1 ? 's' : ''} ago`;
	} else if (minutesDifference > 0) {
		return `${minutesDifference} minute${minutesDifference > 1 ? 's' : ''} ago`;
	} else {
		return `${secondsDifference} second${secondsDifference !== 1 ? 's' : ''} ago`;
	}
}

export function formatPercentage(percentage: any) {
	let multiplied = percentage * 100;
	let decimalPart = multiplied.toString().split('.')[1];

	if (!decimalPart) {
		return `${multiplied.toFixed(0)}%`;
	}

	if (decimalPart.length > 6 && decimalPart.substring(0, 6) === '000000') {
		return `${multiplied.toFixed(0)}%`;
	}

	let nonZeroIndex = decimalPart.length;
	for (let i = 0; i < decimalPart.length; i++) {
		if (decimalPart[i] !== '0') {
			nonZeroIndex = i + 1;
			break;
		}
	}

	return `${multiplied.toFixed(nonZeroIndex)}%`;
}

export function formatRequiredField(field: string) {
	return `${field} *`;
}

export function splitTagValue(tag) {
	let parts = tag.split('-');

	let lastPart = parts[parts.length - 1];
	if (!isNaN(lastPart)) {
		parts = parts.slice(0, -1).join(' ') + ': ' + lastPart;
	} else {
		parts = parts.join(' ');
	}

	return parts;
}

export function getTagDisplay(value: string) {
	let result = value.replace(/([A-Z])/g, ' $1').trim();
	result = result.charAt(0).toUpperCase() + result.slice(1);
	return result;
}

export function getDataURLContentType(dataURL: string) {
	const result = dataURL.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
	return result ? result[1] : null;
}

export function getBase64Data(dataURL: string) {
	return dataURL.split(',')[1];
}

export function getByteSize(input: string | Buffer): number {
	let sizeInBytes: number;
	if (Buffer.isBuffer(input)) {
		sizeInBytes = input.length;
	} else if (typeof input === 'string') {
		sizeInBytes = Buffer.byteLength(input, 'utf-8');
	} else {
		throw new Error('Input must be a string or a Buffer');
	}

	return sizeInBytes;
}

export function getByteSizeDisplay(bytes: number): string {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes === 0) return '0 Bytes';

	const i = Math.floor(Math.log(bytes) / Math.log(1000));
	const value = bytes / Math.pow(1000, i);

	const unit = i === 0 ? (bytes === 1 ? 'Byte' : 'Bytes') : sizes[i];

	return `${value} ${unit}`;
}

export function isMac(): boolean {
	return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

export function validateUrl(url: string) {
	const urlPattern = new RegExp(
		'^(https?:\\/\\/)?' + // Optional protocol
			'((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' + // Domain name
			'localhost|' + // OR localhost
			'\\d{1,3}(\\.\\d{1,3}){3})' + // OR IPv4
			'(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' + // Optional port and path
			'(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // Optional query
			'(\\#[-a-zA-Z\\d_]*)?$', // Optional fragment
		'i'
	);
	return urlPattern.test(url);
}

export function stripAnsiChars(input: string) {
	if (!input) return null;
	const ansiRegex = /\x1B\[[0-9;]*m/g;
	return input.toString().replace(ansiRegex, '');
}

export function ansiToHtml(input: string, theme?: any): string {
	if (!input) return '';

	const getAnsiColorMap = (theme?: any) => {
		if (!theme) {
			// Fallback colors if no theme provided
			return {
				'0': { color: '', background: '', fontWeight: 'normal', textDecoration: 'none' }, // reset
				'1': { fontWeight: 'normal' },
				'4': { textDecoration: 'underline' }, // underline
				'30': { color: '#000000' }, // black
				'31': { color: '#e74c3c' }, // red
				'32': { color: '#2ecc71' }, // green
				'33': { color: '#f39c12' }, // yellow
				'34': { color: '#3498db' }, // blue
				'35': { color: '#9b59b6' }, // magenta
				'36': { color: '#1abc9c' }, // cyan
				'37': { color: '#ecf0f1' }, // white
				'90': { color: '#95a5a6' }, // bright black (gray)
				'91': { color: '#e74c3c' }, // bright red
				'92': { color: '#2ecc71' }, // bright green
				'93': { color: '#f1c40f' }, // bright yellow
				'94': { color: '#74b9ff' }, // bright blue
				'95': { color: '#e84393' }, // bright magenta
				'96': { color: '#00cec9' }, // bright cyan
				'97': { color: '#ffffff' }, // bright white
			};
		}

		return {
			'0': { color: '', background: '', fontWeight: 'normal', textDecoration: 'none' }, // reset
			'1': { fontWeight: 'normal' },
			'4': { textDecoration: 'underline' }, // underline
			'30': { color: theme.colors.editor.alt10 }, // black
			'31': { color: theme.colors.editor.primary }, // red
			'32': { color: theme.colors.editor.alt3 }, // green
			'33': { color: theme.colors.editor.alt6 }, // yellow
			'34': { color: theme.colors.editor.alt4 }, // blue
			'35': { color: theme.colors.editor.alt8 }, // magenta
			'36': { color: theme.colors.editor.alt7 }, // cyan
			'37': { color: '#EEEEEE' }, // white
			'90': { color: theme.colors.editor.alt10 }, // bright black
			'91': { color: theme.colors.warning.primary }, // bright red
			'92': { color: theme.colors.editor.alt3 }, // bright green
			'93': { color: theme.colors.editor.alt6 }, // bright yellow
			'94': { color: theme.colors.editor.alt4 }, // bright blue
			'95': { color: theme.colors.editor.alt8 }, // bright magenta
			'96': { color: theme.colors.editor.alt7 }, // bright cyan
			'97': { color: '#EEEEEE' }, // bright white
		};
	};

	const ansiColorMap = getAnsiColorMap(theme);

	let result = input;
	let currentStyles = { color: '', background: '', fontWeight: 'normal', textDecoration: 'none' };
	let openSpans = 0;

	// First convert octal escape sequences (\27) to standard escape sequences (\x1B)
	result = result.replace(/\\27/g, '\x1B');

	// Convert escaped whitespace characters to actual whitespace
	result = result.replace(/\\n/g, '\n');
	result = result.replace(/\\t/g, '\t');
	result = result.replace(/\\r/g, '\r');

	// Replace ANSI escape sequences with HTML spans
	result = result.replace(/\x1B\[([0-9;]*)m/g, (_, codes) => {
		let html = '';

		// Close current span if we have styles applied
		if (openSpans > 0) {
			html += '</span>';
			openSpans--;
		}

		if (codes === '' || codes === '0') {
			// Reset all styles
			currentStyles = { color: '', background: '', fontWeight: 'normal', textDecoration: 'none' };
		} else {
			// Apply new styles
			const codeArray = codes.split(';');
			for (const code of codeArray) {
				if (ansiColorMap[code]) {
					Object.assign(currentStyles, ansiColorMap[code]);
				}
			}
		}

		// Create new span with current styles if any are applied
		const hasStyles =
			currentStyles.color ||
			currentStyles.background ||
			currentStyles.fontWeight !== 'normal' ||
			currentStyles.textDecoration !== 'none';

		if (hasStyles) {
			const styles = [];
			if (currentStyles.color) styles.push(`color: ${currentStyles.color}`);
			if (currentStyles.background) styles.push(`background-color: ${currentStyles.background}`);
			if (currentStyles.fontWeight !== 'normal') styles.push(`font-weight: ${currentStyles.fontWeight}`);
			if (currentStyles.textDecoration !== 'none') styles.push(`text-decoration: ${currentStyles.textDecoration}`);
			styles.push(`font-family: 'Source Code Pro', serif`);

			html += `<span style="${styles.join('; ')}">`;
			openSpans++;
		}

		return html;
	});

	// Close any remaining open spans
	while (openSpans > 0) {
		result += '</span>';
		openSpans--;
	}

	// Convert newlines to HTML line breaks
	result = result.replace(/\n/g, '<br>');

	return result;
}

export function stripUrlProtocol(url: string) {
	return url.replace(/^https?:\/\//, '');
}

export async function hbFetch(
	endpoint: string,
	opts?: {
		json?: boolean;
		rawBodyOnly?: boolean;
	}
) {
	try {
		let headers: any = {};

		if (opts?.json) headers['require-codec'] = 'application/json';
		if (opts?.json) headers['accept'] = 'application/json';
		if (opts?.json) headers['accept-bundle'] = 'true';

		const response = await fetch(`${window.hyperbeamUrl}${endpoint}`, {
			method: 'GET',
			headers: { ...headers },
		});

		if (opts?.json) {
			const responseBody = await response.json();

			if (responseBody.commitments && opts?.rawBodyOnly) delete responseBody.commitments;
			if (responseBody.status && opts?.rawBodyOnly) delete responseBody.status;

			return responseBody;
		}
		return await response.text();
	} catch (e: any) {
		throw new Error(e);
	}
}

export function parseHeaders(input) {
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

export function joinHeaders(headers) {
	return Array.from(headers.entries())
		.map(([name, value]) => `${name}: ${value}`)
		.join('\n');
}

export function extractDetailsFromPath(pathname: string) {
	const parts = pathname.replace(/#.*/, '').split('/').filter(Boolean);

	const path = parts[1] || '';
	const subPath = parts.slice(2).join('/') || '';
	return { path, subPath: subPath ? `/${subPath}` : '' };
}
