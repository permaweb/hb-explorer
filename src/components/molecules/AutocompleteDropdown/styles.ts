import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Dropdown = styled.div`
	/* max-height: 200px;
	overflow-y: auto; */
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.form.default.outline};
	outline: 0.5px solid ${(props) => props.theme.colors.form.default.outline};
	border-radius: 0 0 ${STYLING.dimensions.radius.primary} ${STYLING.dimensions.radius.primary};
	z-index: 999999;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const Option = styled.div<{ isSelected: boolean }>`
	padding: 10px 12.5px;
	cursor: pointer;
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-family: ${(props) => props.theme.typography.family.alt1};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.primary};
	display: flex;
	justify-content: space-between;
	align-items: center;

	background: ${(props) => (props.isSelected ? props.theme.colors.container.alt2.background : 'transparent')};

	&:hover {
		background: ${(props) => props.theme.colors.container.alt2.background};
	}

	&:last-child {
		border-radius: 0 0 5px 5px;
	}
`;

export const TabHint = styled.span`
	background: ${(props) => props.theme.colors.container.alt1.background};
	color: ${(props) => props.theme.colors.font.alt1};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	padding: 2px 6px;
	border-radius: 4px;
	font-size: 10px;
	font-weight: bold;
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;
