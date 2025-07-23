import React from 'react';

import { Loader } from 'components/atoms/Loader';
import { JSONReader } from 'components/molecules/JSONReader';
import { HB_ENDPOINTS } from 'helpers/config';
import { hbFetch } from 'helpers/utils';

import * as S from './styles';

export default function Ledger() {
	const [ledger, setLedger] = React.useState<any>(null);

	React.useEffect(() => {
		(async function () {
			try {
				const ledgerResponse = await hbFetch(HB_ENDPOINTS.ledger);
				if (ledgerResponse.device) delete ledgerResponse.device;
				setLedger(ledgerResponse);
			} catch (e: any) {
				console.error(e);
				setLedger('Error');
			}
		})();
	}, []);

	return ledger ? (
		<S.Wrapper>
			<>
				{ledger === 'Error' ? (
					<S.ErrorWrapper className={'border-wrapper-alt3'}>
						<p>No ledger found on this node</p>
					</S.ErrorWrapper>
				) : (
					<JSONReader data={ledger} header={'Balances'} />
				)}
			</>
		</S.Wrapper>
	) : (
		<Loader sm relative />
	);
}
