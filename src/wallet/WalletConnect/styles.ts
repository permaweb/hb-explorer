import styled from 'styled-components';

import { open, transition3 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	height: 100%;
	display: flex;
	position: relative;
	animation: ${open} ${transition3};
`;

export const PWrapper = styled.div`
	display: flex;
	align-items: center;

	svg {
		padding: 2.5px 0 0 0;
		margin: 2.5px 0 0 0;
	}
`;

export const CAction = styled.div`
	margin: 0 15px 0 0;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		display: none;
	}
`;

export const LAction = styled.button`
	height: 35px;
	padding: 0 17.5px;
	margin: 0 15px 0 0;
	display: none;
	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		display: block;
	}
	&:hover {
		background: ${(props) => props.theme.colors.container.primary.active};
	}
	@media (max-width: ${STYLING.cutoffs.initial}) {
		display: none;
	}
`;

export const FlexAction = styled.div`
	display: flex;
	align-items: center;
	svg {
		height: 25px;
		width: 20px;
		margin: 0 -2.5px 0 11.5px;
	}
`;

export const Dropdown = styled.div`
	max-height: 65vh;
	width: 325px;
	max-width: 75vw;
	padding: 11.5px 10px;
	position: absolute;
	z-index: 1;
	top: 47.5px;
	right: -1.5px;
`;

export const DHeaderWrapper = styled.div`
	width: 100%;
`;

export const PDropdownHeader = styled.div`
	padding: 0 7.5px;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.medium} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const DHeaderFlex = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	gap: 12.5px;
	padding: 5px 5px 15px 5px;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};

	svg {
		padding: 2.5px 0 0 0;
		margin: 2.5px 0 0 0;
	}
`;

export const DHeader = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;

export const DBodyWrapper = styled.ul`
	width: 100%;
	padding: 10px 0;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	li {
		text-align: center;
		height: 40px;
		display: flex;
		align-items: center;
		cursor: pointer;
		color: ${(props) => props.theme.colors.font.primary} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		border: 1px solid transparent;
		border-radius: ${STYLING.dimensions.radius.alt2};
		transition: all 100ms;
		padding: 0 7.5px;

		svg {
			height: 16.5px;
			width: 16.5px;
			margin: 5.5px 9.5px 0 0;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}

		&:hover {
			color: ${(props) => props.theme.colors.font.primary};
			background: ${(props) => props.theme.colors.container.primary.active};
		}

		a {
			height: 100%;
			width: 100%;
			display: flex;
			align-items: center;
			border-radius: ${STYLING.dimensions.radius.primary};
			&:hover {
				color: ${(props) => props.theme.colors.font.primary};
				background: ${(props) => props.theme.colors.container.primary.active};
			}
		}
	}
`;

export const DFooterWrapper = styled(DBodyWrapper)`
	border-bottom: none;
	padding: 10px 0 0 0;
`;

export const ThemeToggleHeader = styled.div`
	display: flex;
	justify-content: flex-start;
	padding: 5px 7.5px;

	p {
		color: ${(props) => props.theme.colors.font.primary} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		border: 1px solid transparent;
		border-radius: ${STYLING.dimensions.radius.alt2};
		transition: all 100ms;
	}

	svg {
		height: 16.5px;
		width: 16.5px;
		margin: 5.5px 9.5px 0 0;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const ThemeToggleBody = styled.div`
	display: flex;
	justify-content: center;
	padding: 5px 7.5px;
	margin: 2.5px 0;
`;

export const MWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 30px;
`;
