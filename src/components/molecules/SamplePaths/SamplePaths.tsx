import { ReactSVG } from 'react-svg';

import { ASSETS } from 'helpers/config';

import * as S from './styles';

const SAMPLE_PATHS = [
	{
		path: '~meta@1.0/info',
		label: 'Node Information',
		description: 'Get metadata and info about this HyperBEAM node',
		icon: ASSETS.info,
	},
	{
		path: '~cacheviz@1.0/json',
		label: 'Cache Visualization',
		description: 'View the current cache state as JSON',
		icon: ASSETS.process,
	},
	{
		path: '~meta@1.0/info/preloaded_devices/serialize~json@1.0',
		label: 'Preloaded Devices',
		description: 'List computational devices available on this node',
		icon: ASSETS.tools,
	},
	{
		path: '~hyperbuddy@1.0/metrics',
		label: 'Node Metrics',
		description: 'View performance metrics and statistics',
		icon: ASSETS.graphic,
	},
	{
		path: '~meta@1.0/info/address',
		label: 'Operator Address',
		description: 'Get the wallet address of the node operator',
		icon: ASSETS.wallet,
	},
	{
		path: 'ledger~node-process@1.0/now/balance/serialize~json@1.0',
		label: 'Ledger Balance',
		description: 'View current ledger balance information',
		icon: ASSETS.wallet,
	},
	{
		path: 'ao.TN.1/Info',
		label: 'AO Network Information',
		description: 'Get network status and info for the AO computer',
		icon: ASSETS.info,
	},
	{
		path: 'process_id/State',
		label: 'Process State',
		description: 'View the current state of any AO process',
		icon: ASSETS.process,
	},
];

interface SamplePathsProps {
	onPathSelect: (path: string) => void;
}

export default function SamplePaths({ onPathSelect }: SamplePathsProps) {
	return (
		<S.Wrapper>
			<S.Header>
				<S.HeaderTitle>
					<ReactSVG src={ASSETS.help} />
					<h3>Sample Paths</h3>
				</S.HeaderTitle>
				<S.HeaderDescription>
					Click any path below to explore the HyperBEAM network and AO ecosystem
				</S.HeaderDescription>
			</S.Header>
			<S.PathGrid>
				{SAMPLE_PATHS.map((sample, index) => (
					<S.PathCard key={index} onClick={() => onPathSelect(sample.path)}>
						<S.PathIcon>
							<ReactSVG src={sample.icon} />
						</S.PathIcon>
						<S.PathContent>
							<S.PathLabel>{sample.label}</S.PathLabel>
							<S.PathDescription>{sample.description}</S.PathDescription>
							<S.PathValue>
								<code>{sample.path}</code>
							</S.PathValue>
						</S.PathContent>
						<S.PathAction>
							<ReactSVG src={ASSETS.arrowRight} />
						</S.PathAction>
					</S.PathCard>
				))}
			</S.PathGrid>
		</S.Wrapper>
	);
}