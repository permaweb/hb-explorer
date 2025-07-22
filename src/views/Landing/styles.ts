import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 25px;
`;

export const NetworkWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
`;

export const NodesWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
`;

export const MessagesWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	margin: 15px 0 0 0;
`;

export const HeaderWrapper = styled.div``;

export const Subheader = styled.div`
	width: fit-content;
	padding: 4.5px 15px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${(props) => props.theme.colors.container.alt8.background};
	border: 1px solid ${(props) => props.theme.colors.border.alt2};
	border-radius: ${STYLING.dimensions.radius.alt2};
	span {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.alt1};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.light1};
		text-align: center;
		text-transform: uppercase;
	}
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 40px;
`;

export const SectionMain = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

export const SectionHeader = styled.div`
	p {
		font-size: ${(props) => props.theme.typography.size.xLg};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
	}
`;

export const ProcessReadWrapper = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 25px;
`;
