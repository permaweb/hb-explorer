import styled from 'styled-components';

export const Wrapper = styled.div<{ disabled: boolean }>`
	display: flex;
	align-items: center;
	gap: 7.5px;
	p {
		color: ${(props) => (props.disabled ? props.theme.colors.font.alt2 : props.theme.colors.font.primary)} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-decoration: underline;
		text-decoration-thickness: 1.25px;
		max-width: 100% !important;
	}

	svg {
		height: 12.5px;
		width: 12.5px;
		color: ${(props) => (props.disabled ? props.theme.colors.font.alt1 : props.theme.colors.font.primary)} !important;
		fill: ${(props) => (props.disabled ? props.theme.colors.font.alt1 : props.theme.colors.font.primary)} !important;
	}

	&:hover {
		cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
		p {
			color: ${(props) => (props.disabled ? props.theme.colors.font.alt2 : props.theme.colors.link.color)} !important;
		}
		svg {
			color: ${(props) => (props.disabled ? props.theme.colors.font.alt1 : props.theme.colors.link.color)} !important;
			fill: ${(props) => (props.disabled ? props.theme.colors.font.alt1 : props.theme.colors.link.color)} !important;
		}
	}
`;

export const Details = styled.div``;
