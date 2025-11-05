import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Container = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	height: calc(100vh - ${STYLING.dimensions.nav.height} - ${STYLING.dimensions.landingTab.height} - ${STYLING.dimensions.footer.height} - ${STYLING.dimensions.landingHeader.padding});
`;

export const Header = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 16px;
	flex-wrap: wrap;
	padding: ${STYLING.dimensions.landingHeader.padding} 0px ${STYLING.dimensions.landingHeader.padding} 0px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
		align-items: flex-start;
	}
`;

export const HeaderContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 6px;
`;

export const Title = styled.h2`
	font-size: ${(props) => props.theme.typography.size.xLg};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.primary};
`;

export const Subtitle = styled.span`
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.light};
	color: ${(props) => props.theme.colors.font.alt1};
`;

export const Wrapper = styled.div`
	width: 100%;
`;

export const ErrorWrapper = styled.div`
	padding: 15px;

	p {
		font-size: ${(props) => props.theme.typography.size.small};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
	}
`;
