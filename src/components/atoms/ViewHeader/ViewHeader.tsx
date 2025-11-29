import React from 'react';
import { useLocation } from 'react-router-dom';

import { ViewWrapper } from 'app/styles';
import { URLS } from 'helpers/config';

import * as S from './styles';
import { IProps } from './types';

export default function ViewHeader(props: IProps) {
	const location = useLocation();
	const isDashboard = location.pathname === URLS.base;

	return (
		<S.HeaderWrapper>
			<ViewWrapper>
				<S.HeaderContent>
					{!isDashboard && <h4>{props.header}</h4>}
					{props.actions && (
						<S.HeaderActions>
							{props.actions.map((action: React.ReactNode, index: number) => (
								<React.Fragment key={index}>{action}</React.Fragment>
							))}
						</S.HeaderActions>
					)}
				</S.HeaderContent>
			</ViewWrapper>
		</S.HeaderWrapper>
	);
}
