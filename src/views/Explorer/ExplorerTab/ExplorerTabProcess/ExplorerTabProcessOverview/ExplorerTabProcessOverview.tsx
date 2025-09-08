import { Copyable } from 'components/atoms/Copyable';
import { ProcessRead } from 'components/molecules/ProcessRead';
import { ExplorerTabObjectType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';
import { UseHyperBeamRequestReturn } from 'hooks/useHyperBeamRequest';

import * as S from './styles';

export default function ExplorerTabProcessOverview(props: {
	tab: ExplorerTabObjectType;
	hyperBeamRequest: UseHyperBeamRequestReturn;
}) {
	if (!props.tab) return null;

	const HeaderLine = ({ label, value, render }: { label: string; value: any; render?: (v: any) => JSX.Element }) => {
		const defaultRender = (v: any) => {
			if (typeof v === 'string' && checkValidAddress(v)) {
				return <Copyable value={v} />;
			}
			return <p>{v}</p>;
		};

		const renderContent = render || defaultRender;

		return (
			<S.HeaderLine>
				<span>{label}</span>
				{value ? renderContent(value) : <p>-</p>}
			</S.HeaderLine>
		);
	};

	return (
		<S.Wrapper>
			<S.HeaderWrapper className={'border-wrapper-alt3 fade-in'}>
				<S.HeaderTitle>
					<h4>Headers</h4>
					<span>{`(${
						props.hyperBeamRequest?.headers ? Object.keys(props.hyperBeamRequest.headers).length : '-'
					})`}</span>
				</S.HeaderTitle>
				<S.HeaderContent>
					{props.hyperBeamRequest?.headers ? (
						<>
							{Object.keys(props.hyperBeamRequest.headers).map((header) => {
								return <HeaderLine key={header} label={header} value={props.hyperBeamRequest.headers[header].data} />;
							})}
						</>
					) : null}
				</S.HeaderContent>
			</S.HeaderWrapper>

			<S.BodyWrapper className={'fade-in'}>
				<ProcessRead processId={props.tab.id} variant={props.tab.variant} autoRun />
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
