export interface DeviceInfo {
	module: string;
	name: string;
}

export const DEVICE_NAMES: Record<string, DeviceInfo> = {
	'1': {
		module: 'dev_apply',
		name: '~apply@1.0',
	},
	'2': {
		module: 'dev_codec_ans104',
		name: '~ans104@1.0',
	},
	'3': {
		module: 'dev_cu',
		name: '~compute@1.0',
	},
	'4': {
		module: 'dev_cache',
		name: '~cache@1.0',
	},
	'5': {
		module: 'dev_cacheviz',
		name: '~cacheviz@1.0',
	},
	'6': {
		module: 'dev_cron',
		name: '~cron@1.0',
	},
	'7': {
		module: 'dev_dedup',
		name: '~dedup@1.0',
	},
	'8': {
		module: 'dev_delegated_compute',
		name: '~delegated-compute@1.0',
	},
	'9': {
		module: 'dev_faff',
		name: '~faff@1.0',
	},
	'10': {
		module: 'dev_codec_flat',
		name: '~flat@1.0',
	},
	'11': {
		module: 'dev_genesis_wasm',
		name: '~genesis-wasm@1.0',
	},
	'12': {
		module: 'dev_green_zone',
		name: '~greenzone@1.0',
	},
	'13': {
		module: 'dev_codec_httpsig',
		name: '~httpsig@1.0',
	},
	'14': {
		module: 'dev_hyperbuddy',
		name: '~hyperbuddy@1.0',
	},
	'15': {
		module: 'dev_codec_json',
		name: '~json@1.0',
	},
	'16': {
		module: 'dev_json_iface',
		name: '~json-iface@1.0',
	},
	'17': {
		module: 'dev_local_name',
		name: '~local-name@1.0',
	},
	'18': {
		module: 'dev_lookup',
		name: '~lookup@1.0',
	},
	'19': {
		module: 'dev_lua',
		name: '~lua@5.3a',
	},
	'20': {
		module: 'dev_manifest',
		name: '~manifest@1.0',
	},
	'21': {
		module: 'dev_message',
		name: '~message@1.0',
	},
	'22': {
		module: 'dev_meta',
		name: '~meta@1.0',
	},
	'23': {
		module: 'dev_monitor',
		name: '~monitor@1.0',
	},
	'24': {
		module: 'dev_multipass',
		name: '~multipass@1.0',
	},
	'25': {
		module: 'dev_name',
		name: '~name@1.0',
	},
	'26': {
		module: 'dev_node_process',
		name: '~node-process@1.0',
	},
	'27': {
		module: 'dev_p4',
		name: '~p4@1.0',
	},
	'28': {
		module: 'dev_patch',
		name: '~patch@1.0',
	},
	'29': {
		module: 'dev_poda',
		name: '~poda@1.0',
	},
	'30': {
		module: 'dev_process',
		name: '~process@1.0',
	},
	'31': {
		module: 'dev_profile',
		name: '~profile@1.0',
	},
	'32': {
		module: 'dev_push',
		name: '~push@1.0',
	},
	'33': {
		module: 'dev_relay',
		name: '~relay@1.0',
	},
	'34': {
		module: 'dev_router',
		name: '~router@1.0',
	},
	'35': {
		module: 'dev_scheduler',
		name: '~scheduler@1.0',
	},
	'36': {
		module: 'dev_simple_pay',
		name: '~simple-pay@1.0',
	},
	'37': {
		module: 'dev_snp',
		name: '~snp@1.0',
	},
	'38': {
		module: 'dev_stack',
		name: '~stack@1.0',
	},
	'39': {
		module: 'dev_codec_structured',
		name: '~structured@1.0',
	},
	'40': {
		module: 'dev_test',
		name: '~test-device@1.0',
	},
	'41': {
		module: 'dev_volume',
		name: '~volume@1.0',
	},
	'42': {
		module: 'dev_codec_tx',
		name: '~tx@1.0',
	},
	'43': {
		module: 'dev_wasi',
		name: '~wasi@1.0',
	},
	'44': {
		module: 'dev_wasm',
		name: '~wasm64@1.0',
	},
	'45': {
		module: 'dev_whois',
		name: '~whois@1.0',
	},
};

// Create array of device names for autocomplete
export const DEVICE_NAME_LIST = Object.values(DEVICE_NAMES)
	.map((device) => device.name)
	.sort();

// Helper function to get device info by name
export function getDeviceInfo(name: string): DeviceInfo | undefined {
	return Object.values(DEVICE_NAMES).find((device) => device.name === name);
}

// Helper function to search device names
export function searchDeviceNames(query: string): string[] {
	if (!query) return [];

	const lowerQuery = query.toLowerCase();

	// Don't show suggestions if there's an exact match
	const exactMatch = DEVICE_NAME_LIST.find((name) => name.toLowerCase() === lowerQuery);
	if (exactMatch) return [];

	return DEVICE_NAME_LIST.filter((name) => name.toLowerCase().includes(lowerQuery)).slice(0, 10); // Limit to 10 suggestions
}
