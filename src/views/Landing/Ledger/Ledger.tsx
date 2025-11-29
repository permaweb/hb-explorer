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
				const ledgerResponse = await hbFetch(HB_ENDPOINTS.ledger, { json: true, rawBodyOnly: true });
				if (ledgerResponse.device) delete ledgerResponse.device;
				setLedger(ledgerResponse);
			} catch (e: any) {
				console.error(e);
				setLedger('Error');
			}
		})();
	}, []);

	return ledger ? (
		<S.Container>
			<S.Header>
				<S.HeaderContent>
					<S.Title>Ledger</S.Title>
					<S.Subtitle>Account balances and token information for this node</S.Subtitle>
				</S.HeaderContent>
			</S.Header>
			<S.Wrapper>
				{ledger === 'Error' ? (
					<S.ErrorWrapper className={'border-wrapper-alt3'}>
						<p>No ledger found on this node</p>
					</S.ErrorWrapper>
				) : (
					<JSONReader data={ledger} header={'Balances'} />
				)}
			</S.Wrapper>
		</S.Container>
	) : (
		<Loader sm relative />
	);
}
