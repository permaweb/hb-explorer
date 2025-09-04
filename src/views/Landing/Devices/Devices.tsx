import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Loader } from 'components/atoms/Loader';
import { HB_ENDPOINTS, URLS } from 'helpers/config';
import { hbFetch } from 'helpers/utils';

import * as S from './styles';

export default function Devices() {
	const navigate = useNavigate();

	const [devices, setDevices] = React.useState<any>(null);

	React.useEffect(() => {
		(async function () {
			try {
				const deviceInfo = await hbFetch(HB_ENDPOINTS.devices, { json: true, rawBodyOnly: true });

				const deviceList = Object.keys(deviceInfo)
					.map((key) => deviceInfo[key])
					.filter((device) => typeof device !== 'string');
				setDevices(makeGroups(deviceList));
			} catch (e: any) {
				console.error(e);
			}
		})();
	}, []);

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

	return devices ? (
		<S.Wrapper className={'border-wrapper-primary'}>
			{devices.map((deviceRow, rowIndex) => (
				<S.DeviceRow count={deviceRow.length} key={rowIndex}>
					{deviceRow.map((device: any, index: number) => {
						const deviceIndex = rowIndex * 3 + index + 1;
						const [name, variant] = device?.name ? device.name.split('@') : ['-', '-'];

						return (
							<S.DeviceWrapper key={deviceIndex} onClick={() => navigate(`${URLS.explorer}~${name}@1.0`)}>
								<p>{name}</p>
								<span>{variant}</span>
							</S.DeviceWrapper>
						);
					})}
				</S.DeviceRow>
			))}
		</S.Wrapper>
	) : (
		<Loader sm relative />
	);
}
