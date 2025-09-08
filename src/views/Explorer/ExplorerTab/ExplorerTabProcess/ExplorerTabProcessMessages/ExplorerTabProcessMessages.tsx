import React from 'react';

import { MessageList } from 'components/molecules/MessageList';
import { HB_ENDPOINTS } from 'helpers/config';
import { ExplorerTabObjectType } from 'helpers/types';
import { hbFetch } from 'helpers/utils';

import * as S from './styles';

export default function ExplorerTabProcessMessages(props: { tab: ExplorerTabObjectType }) {
	const [currentSchedule, setCurrentSchedule] = React.useState<any[] | null>(null);

	React.useEffect(() => {
		(async function () {
			if (props.tab?.id) {
				try {
					const response = await hbFetch(HB_ENDPOINTS.schedule(props.tab.id), { json: true });
					if (response?.assignments) {
						setCurrentSchedule(
							Object.keys(response.assignments).map((assignment: any) => {
								return { ...response.assignments[assignment] };
							})
						);
					}
				} catch (e: any) {
					console.error(e);
				}
			}
		})();
	}, [props.tab]);

	return (
		<S.Wrapper>
			<MessageList txId={props.tab.id} type={'process'} messages={currentSchedule} />
		</S.Wrapper>
	);
}
