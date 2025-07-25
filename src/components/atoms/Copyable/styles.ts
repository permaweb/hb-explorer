import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div<{ disabled: boolean }>`
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 0 7.5px 0 8.5px;
	background: ${(props) =>
		props.disabled
			? props.theme.colors.button.primary.disabled.background
			: props.theme.colors.container.alt8.background};
	border: 1px solid ${(props) => (props.disabled ? props.theme.colors.border.primary : 'transparent')};
	border-radius: ${STYLING.dimensions.radius.alt1};

	p {
		color: ${(props) =>
			props.disabled ? props.theme.colors.button.primary.disabled.color : props.theme.colors.font.light1} !important;
		font-size: ${(props) => props.theme.typography.size.xxxSmall} !important;
		font-family: ${(props) => props.theme.typography.family.alt2} !important;
		font-weight: ${(props) => props.theme.typography.weight.xBold} !important;
		max-width: 100% !important;
		white-space: nowrap;
		letter-spacing: -0.15px;
	}

	span {
		color: ${(props) =>
			props.disabled ? props.theme.colors.button.primary.disabled.color : props.theme.colors.font.light1} !important;
		font-size: ${(props) => props.theme.typography.size.xxxSmall} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		font-weight: ${(props) => props.theme.typography.weight.xBold} !important;
		text-transform: uppercase;
		display: block;
		white-space: nowrap;
		margin: 0.5px 0 0 0;
	}

	svg {
		height: 11.5px !important;
		width: 11.5px !important;
		margin: 2.5px 0 0 2.5px !important;
		color: ${(props) =>
			props.disabled ? props.theme.colors.button.primary.disabled.color : props.theme.colors.font.light1} !important;
		fill: ${(props) =>
			props.disabled ? props.theme.colors.button.primary.disabled.color : props.theme.colors.font.light1} !important;
	}

	&:hover {
		cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
		background: ${(props) =>
			props.disabled
				? props.theme.colors.button.primary.disabled.background
				: props.theme.colors.container.alt4.background};

		p {
			color: ${(props) =>
				props.disabled ? props.theme.colors.button.primary.disabled.color : props.theme.colors.font.light1} !important;
		}
		svg {
			color: ${(props) =>
				props.disabled ? props.theme.colors.button.primary.disabled.color : props.theme.colors.font.light1} !important;
			fill: ${(props) =>
				props.disabled ? props.theme.colors.button.primary.disabled.color : props.theme.colors.font.light1} !important;
		}
	}
`;
