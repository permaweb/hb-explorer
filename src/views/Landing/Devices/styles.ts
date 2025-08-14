import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	overflow: hidden;

	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		}
	}
`;

export const DeviceRow = styled.div<{ count: number }>`
	display: grid;

	grid-template-columns: repeat(${({ count }) => count}, 1fr);

	> * {
		&:not(:last-child) {
			border-right: 1px solid ${(props) => props.theme.colors.border.primary};
		}
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		grid-template-columns: repeat(1, 1fr);

		> * {
			&:not(:last-child) {
				border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
			}
		}
	}
`;

export const DeviceWrapper = styled.button`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 25px;
	padding: 15px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	cursor: pointer;

	p {
		font-size: ${(props) => props.theme.typography.size.small};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
	}

	span {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt5};
	}

	&:hover {
		background: ${(props) => props.theme.colors.container.primary.active};
	}
`;
