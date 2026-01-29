import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const Label = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;
		line-height: 1;
	}
`;

export const Options = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	gap: 1.5px;
	padding: 1px;
	background: ${(props) => props.theme.colors.container.alt2.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};

	button {
		flex: 1;
		border: none !important;
		transition: all 100ms;

		span {
			font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		}

		svg {
			margin: 1.5px 6.5px 0 0 !important;
		}

		&:disabled {
			background: transparent !important;
		}
	}
`;
