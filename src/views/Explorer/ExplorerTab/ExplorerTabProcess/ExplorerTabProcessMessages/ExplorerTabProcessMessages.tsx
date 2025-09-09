import { MessageList } from 'components/molecules/MessageList';
import { ExplorerTabObjectType } from 'helpers/types';
import { UseHyperBeamRequestReturn } from 'hooks/useHyperBeamRequest';

import * as S from './styles';

export default function ExplorerTabProcessMessages(props: {
	tab: ExplorerTabObjectType;
	hyperBeamRequest: UseHyperBeamRequestReturn;
	refreshKey?: number;
}) {
	return (
		<S.Wrapper>
			<MessageList processId={props.tab.id} refreshKey={props.refreshKey} />
		</S.Wrapper>
	);
}
