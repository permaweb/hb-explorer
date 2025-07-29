import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
`;

export const Container = styled.div`
	width: 100%;
	position: relative;
	background: ${(props) => props.theme.colors.view.background};
`;

export const Header = styled.div`
	width: 100%;
	display: flex;
	position: relative;
`;

export const Placeholder = styled.div`
	height: 1px;
	flex: 1;
	margin: auto 0 -1.5px 0;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const PlaceholderFull = styled(Placeholder)`
	margin: auto -26.5px -1.5px -26.5px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		margin: auto -14.5px -1.5px -14.5px;

		&[id='placeholder-start'] {
			margin: auto -15.5px -1.5px 0;
		}

		&[id='placeholder-end'] {
			margin: auto 0 -1.5px -15.5px;
		}
	}
`;

export const List = styled.div<{ useGap: boolean }>`
	width: 100%;
	display: flex;
	gap: ${(props) => (props.useGap ? '20px' : '0')};
`;

export const Content = styled.div<{ top?: number }>`
	width: 100%;
	display: flex;
	align-items: center;
	position: relative;
	margin: ${(props) => (props.top ? `${props.top.toString()}px 0 0 0` : '40px 0 0 0')};
`;

export const Tab = styled.div``;

export const AltTab = styled.div`
	position: relative;
	display: flex;
	justify-content: center;
	flex: 1;
`;

export const AltTabAction = styled.div<{ active: boolean; icon: boolean }>`
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.primary};
	color: ${(props) => (props.active ? props.theme.colors.font.primary : props.theme.colors.font.alt3)};
	cursor: pointer;
	position: relative;
	z-index: 1;
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 12.5px;
	padding: 17.5px 25.5px 12.5px 21.5px;
	margin: 0 0 -1.5px 0;
	background: ${(props) => (props.active ? props.theme.colors.view.background : 'transparent')};
	border-bottom: 1px solid ${(props) => (props.active ? 'transparent' : props.theme.colors.border.primary)};
	border-top: 2px solid ${(props) => (props.active ? props.theme.colors.border.alt5 : 'transparent')};

	white-space: nowrap;
	transition: all 100ms;

	svg {
		height: 12.5px;
		width: 12.5px;
		color: ${(props) => (props.active ? props.theme.colors.font.primary : props.theme.colors.font.alt3)};
		fill: ${(props) => (props.active ? props.theme.colors.font.primary : props.theme.colors.font.alt3)};
	}

	&:hover {
		color: ${(props) => props.theme.colors.font.primary};

		svg {
			color: ${(props) => props.theme.colors.font.primary};
			fill: ${(props) => props.theme.colors.font.primary};
		}
	}

	&:before {
		display: block;
		content: '';
		position: absolute;
		z-index: 1;
		left: 0;
		transform: translate(-50%, 0);
		top: 0;
		background: ${(props) => (props.active ? props.theme.colors.border.primary : 'transparent')};
		height: 100%;
		width: 1px;
		pointer-events: none;
	}

	&:after {
		display: block;
		content: '';
		position: absolute;
		z-index: 1;
		right: -1px;
		transform: translate(-50%, 0);
		top: 0;
		background: ${(props) => (props.active ? props.theme.colors.border.primary : 'transparent')};
		height: 100%;
		width: 1px;
		pointer-events: none;
	}
`;

export const Icon = styled.div<{ active: boolean }>`
	svg {
		height: 12.5px;
		width: 12.5px;
		margin: 0 0 2.5px 0;
		color: ${(props) => (props.active ? props.theme.colors.font.primary : props.theme.colors.font.alt3)};
		fill: ${(props) => (props.active ? props.theme.colors.font.primary : props.theme.colors.font.alt3)};
	}
`;
