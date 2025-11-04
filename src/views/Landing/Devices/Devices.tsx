import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Loader } from 'components/atoms/Loader';
import { SearchInput } from 'components/atoms/SearchInput';
import { CubeSpin } from 'components/atoms/CubeSpin';
import { HB_ENDPOINTS, URLS } from 'helpers/config';
import { hbFetch } from 'helpers/utils';

import * as S from './styles';

export default function Devices() {
	const navigate = useNavigate();

	const [allDevices, setAllDevices] = React.useState<any[]>([]);
	const [devices, setDevices] = React.useState<any>(null);
	const [searchTerm, setSearchTerm] = React.useState<string>('');

	React.useEffect(() => {
		(async function () {
			try {
				const deviceInfo = await hbFetch(HB_ENDPOINTS.devices, { json: true, rawBodyOnly: true });

				const deviceList = Object.keys(deviceInfo)
					.map((key) => deviceInfo[key])
					.filter((device) => typeof device !== 'string');
				setAllDevices(deviceList);
				setDevices(makeGroups(deviceList));
			} catch (e: any) {
				console.error(e);
			}
		})();
	}, []);

	React.useEffect(() => {
		if (allDevices.length > 0) {
			const filtered = allDevices.filter((device: any) => {
				if (!searchTerm.trim()) return true;
				const name = device?.name || '';
				return name.toLowerCase().includes(searchTerm.toLowerCase());
			});
			setDevices(makeGroups(filtered));
		}
	}, [searchTerm, allDevices]);

	function makeGroups<T>(arr: T[]): T[][] {
		const groupCount = 3;
		const groups: T[][] = [];
		let i = 0;

		while (i + groupCount <= arr.length) {
			groups.push(arr.slice(i, i + groupCount));
			i += groupCount;
		}

		if (i < arr.length) {
			groups.push(arr.slice(i));
		}

		return groups;
	}

	return devices !== null ? (
		<S.Container>
			<S.Header>
				<S.HeaderContent>
					<S.Title>Devices</S.Title>
					<S.Subtitle>List of modular components that can be used in a node</S.Subtitle>
				</S.HeaderContent>
				<S.SearchWrapper>
					<SearchInput
						placeholder={'Filter devices...'}
						value={searchTerm}
						onChange={(e: any) => setSearchTerm(e.target.value)}
						disabled={false}
						invalid={{ status: false, message: null }}
					/>
				</S.SearchWrapper>
			</S.Header>
			<S.Wrapper className={'border-wrapper-primary'}>
				{devices.length > 0 ? (
					devices.map((deviceRow, rowIndex) => (
						<S.DeviceRow count={deviceRow.length} key={rowIndex}>
							{deviceRow.map((device: any, index: number) => {
								const deviceIndex = rowIndex * 3 + index + 1;
								const [name, variant] = device?.name ? device.name.split('@') : ['-', '-'];

								return (
									<S.DeviceWrapper key={deviceIndex} onClick={() => navigate(`${URLS.explorer}~${name}@1.0`)}>
										<S.DeviceNameWrapper>
											<p>{name}</p>
											<S.CubeSpinWrapper>
												<CubeSpin size={12} relative />
											</S.CubeSpinWrapper>
										</S.DeviceNameWrapper>
										<S.DeviceVersionWrapper>
											<span>{variant}</span>
										</S.DeviceVersionWrapper>
									</S.DeviceWrapper>
								);
							})}
						</S.DeviceRow>
					))
				) : (
					<S.EmptyState>No devices found matching your search.</S.EmptyState>
				)}
			</S.Wrapper>
		</S.Container>
	) : (
		<Loader sm relative />
	);
}
