import { getTxEndpoint } from './endpoints';

function getAssetEndpoint(filename: string) {
	// @ts-ignore
	const base = import.meta.env.DEV ? '/assets' : '/~hyperbuddy@1.0/assets';
	return `${base}/${filename}`;
}

export const ASSETS = {
	add: getAssetEndpoint('add.svg'),
	aoEvents: getAssetEndpoint('aoEvents.svg'),
	arrow: getAssetEndpoint('arrow.svg'),
	arrowRight: getAssetEndpoint('arrowRight.svg'),
	arrows: getAssetEndpoint('arrows.svg'),
	close: getAssetEndpoint('close.svg'),
	code: getAssetEndpoint('code.svg'),
	copy: getAssetEndpoint('copy.svg'),
	dark: getAssetEndpoint('dark.svg'),
	delete: getAssetEndpoint('delete.svg'),
	design: getAssetEndpoint('design.svg'),
	disconnect: getAssetEndpoint('disconnect.svg'),
	execute: getAssetEndpoint('execute.svg'),
	filter: getAssetEndpoint('filter.svg'),
	fullscreen: getAssetEndpoint('fullscreen.svg'),
	go: getAssetEndpoint('go.svg'),
	graph: getAssetEndpoint('layout.svg'),
	graphic: getTxEndpoint('tJd9JJa8ap5dHHvRAAPOE4Gh6VAY4h8KpBY1gzrtVWo'),
	http: getAssetEndpoint('http.svg'),
	content: getTxEndpoint('oBB9uPPEHK5yjfmn4rz7F53lDb__z6ilVQIazImT9Z0'),
	graphMinimal: getTxEndpoint('26IIkg_WNypc3_5PtYIi4Ok8PGpKJtxrMG3Pc8k3mEU'),
	hyperbuddy: getTxEndpoint('eH269APQRzeT3At3TW3YjTGQ27ehcjb02kt8UvQWCio'),
	info: getAssetEndpoint('info.svg'),
	label: getAssetEndpoint('paragraph.svg'),
	light: getAssetEndpoint('light.svg'),
	logo: getTxEndpoint('S3qpd4CF_VSPD9DfVaWD4McFQy6XAUto2FLidcjofpM'),
	memory: getAssetEndpoint('memory.svg'),
	menu: getAssetEndpoint('menu.svg'),
	message: getAssetEndpoint('message.svg'),
	networkStats: getAssetEndpoint('networkStats.svg'),
	newTab: getAssetEndpoint('newTab.svg'),
	plusMinus: getAssetEndpoint('plusMinus.svg'),
	process: getAssetEndpoint('process.svg'),
	overview: getAssetEndpoint('overview.svg'),
	read: getAssetEndpoint('read.svg'),
	refresh: getAssetEndpoint('refresh.svg'),
	save: getAssetEndpoint('save.svg'),
	search: getAssetEndpoint('search.svg'),
	send: getAssetEndpoint('send.svg'),
	system: getAssetEndpoint('settings.svg'),
	systemStats: getAssetEndpoint('systemStats.svg'),
	table: getAssetEndpoint('listOrdered.svg'),
	telemetry: getAssetEndpoint('telemetry.svg'),
	tools: getAssetEndpoint('tools.svg'),
	transaction: getAssetEndpoint('transaction.svg'),
	user: getAssetEndpoint('user.svg'),
	vmStats: getAssetEndpoint('vmStats.svg'),
	wallet: getAssetEndpoint('wallet.svg'),
	warning: getAssetEndpoint('warning.svg'),
	write: getAssetEndpoint('write.svg'),
};

export const FAVICONS = {
	light: getTxEndpoint('yEzIy4fUp2LvpPWkZNDwZ9T8SUFG9QS0-76iKz8KwPo'),
	dark: getTxEndpoint('dXdeYzWRmWNq-yCyyRZTDeY6GPYkZXi9ILwGcHXtVis'),
};

export const TAGS = {
	keys: {
		onBoot: 'On-Boot',
		type: 'Type',
		variant: 'Variant',
	},
	values: {
		eval: 'Eval',
		info: 'Info',
		balance: 'Balance',
		transfer: 'Transfer',
		debitNotice: 'Debit-Notice',
		creditNotice: 'Credit-Notice',
		process: 'Process',
	},
};

export const DEFAULT_ACTIONS = {
	eval: { name: TAGS.values.eval },
	info: { name: TAGS.values.info },
	balance: { name: TAGS.values.balance },
	transfer: { name: TAGS.values.transfer },
	debitNotice: { name: TAGS.values.debitNotice },
	creditNotice: { name: TAGS.values.creditNotice },
};

export const DEFAULT_AO_TAGS = [{ name: 'Data-Protocol', values: ['ao'] }];

export const DEFAULT_MESSAGE_TAGS = [{ name: 'Type', values: ['Message'] }, ...DEFAULT_AO_TAGS];

export const DOM = {
	loader: 'loader',
	overlay: 'overlay',
};

export const STORAGE = {
	walletType: `wallet-type`,
	profile: (id: string) => `profile-${id}`,
	profileByWallet: (id: string) => `profile-by-wallet-${id}`,
};

export const STYLING = {
	cutoffs: {
		desktop: '1250px',
		initial: '1024px',
		max: '1600px',
		tablet: '840px',
		tabletSecondary: '768px',
		secondary: '540px',
	},
	dimensions: {
		button: {
			height: '32.5px',
			width: 'fit-content',
		},
		action: {
			height: '32.5px',
		},
		form: {
			small: '37.5px',
			max: '45px',
		},
		indicator: {
			height: '10px',
			width: '10px',
		},
		nav: {
			height: '68px',
			width: '260px',
		},
		landingTabNav: {
			height: '52px',
		},
		landingTab: {
			height: '52px',
		},
		landingHeader: {
			padding: '24px',
		},
		footer: {
			height: '60px',
		},
		radius: {
			primary: '0',
			alt1: '15px',
			alt2: '5px',
			alt3: '2.5px',
			circle: '50%',
		},
	},
};

function createURLs() {
	const base = `/`;

	const explorerBase = `${base}explorer`;
	const explorer = `${explorerBase}/`;
	const graphql = `${base}graphql/`;

	return {
		base: base,
		explorerBase: explorerBase,
		explorer: explorer,
		explorerInfo: (id: string) => `${explorer}${id}/info`,
		explorerMessages: (id: string) => `${explorer}${id}/messages`,
		explorerRead: (id: string) => `${explorer}${id}/read`,
		explorerWrite: (id: string) => `${explorer}${id}/write`,
		explorerSource: (id: string) => `${explorer}${id}/source`,
		graphql: graphql,
		notFound: `${base}404`,
	};
}

export const URLS = createURLs();

export const DEFAULT_TABS = {
	process: '/info',
};

export const LINKS = {
	arweave: `https://arweave.org`,
	ao: `https://ao.arweave.net`,
	wander: `https://wander.app`,
	hbDocs: `https://hyperbeam.arweave.net`,
	github: `https://github.com/permaweb/hb-explorer`,
};

export const HB_ENDPOINTS = {
	info: `/~meta@1.0/info`,
	cache: `/~cacheviz@1.0/json`,
	devices: `/~meta@1.0/info/preloaded-devices`,
	metrics: `/~hyperbuddy@1.0/metrics`,
	operator: `/~meta@1.0/info/address`,
	ledger: `/ledger~node-process@1.0/now/balance`,
	schedule: (id: string) => `/${id}/schedule`,
	currentSlot: (id: string) => `/${id}/slot/current`,
	processNow: (id: string) => `/${id}~process@1.0/now`,
};

export const HB_METRIC_CATEGORIES = {
	'AO Events': ['event'],
	'System Stats': ['process_uptime_seconds', 'system_load', 'outbound_connections'],
	'HTTP & Requests': [
		'cowboy_requests_total',
		'cowboy_protocol_upgrades_total',
		'cowboy_spawned_processes_total',
		'cowboy_errors_total',
		'cowboy_early_errors_total',
		'cowboy_request_duration_seconds',
		'http_request_duration_seconds',
		'cowboy_receive_body_duration_seconds',
	],
	Memory: [
		'erlang_vm_memory_atom_bytes_total',
		'erlang_vm_memory_bytes_total',
		'erlang_vm_memory_dets_tables',
		'erlang_vm_memory_ets_tables',
		'erlang_vm_memory_processes_bytes_total',
		'erlang_vm_memory_system_bytes_total',
	],
	'Network Stats': ['http_client_uploaded_bytes_total', 'http_client_downloaded_bytes_total', 'gun_requests_total'],
	Telemetry: [
		'telemetry_scrape_size_bytes',
		'telemetry_scrape_duration_seconds',
		'telemetry_scrape_encoded_size_bytes',
	],
	'VM Stats': [
		'erlang_vm_msacc_aux_seconds_total',
		'erlang_vm_msacc_check_io_seconds_total',
		'erlang_vm_msacc_emulator_seconds_total',
		'erlang_vm_msacc_gc_seconds_total',
		'erlang_vm_msacc_other_seconds_total',
	],
};
