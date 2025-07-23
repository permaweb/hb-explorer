import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	gap: 25px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const Navigation = styled.div`
	width: 250px;
	display: flex;
	flex-direction: column;
	gap: 15px;

	button {
		border-radius: ${STYLING.dimensions.radius.primary} !important;
		justify-content: flex-start !important;
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
	}
`;

export const Body = styled.div`
	height: fit-content;
	max-height: 77.5vh;
	width: calc(100% - 275px);

	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		}
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
		max-height: none;
	}
`;

export const Group = styled.div`
	width: 100%;
	overflow: hidden;
`;

export const GroupHeader = styled.div`
	background: ${(props) => props.theme.colors.container.alt2.background};
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	padding: 10px;

	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
		text-transform: uppercase;
	}
`;

export const GroupBody = styled.div`
	width: 100%;

	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		}
	}
`;

export const GroupLine = styled.div`
	background: ${(props) => props.theme.colors.container.primary.background};
	padding: 10px;
	display: flex;
	align-items: center;
	justify-content: space-between;

	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
	}

	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.xBold};
		color: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const SubGroup = styled(Group)``;

export const SubGroupHeader = styled(GroupHeader)`
	background: ${(props) => props.theme.colors.container.alt1.background};

	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt2};
		text-transform: uppercase;
	}
`;

export const SubGroupBody = styled(GroupBody)``;

export const SubGroupLine = styled(GroupLine)``;
