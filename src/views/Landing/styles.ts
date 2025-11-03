import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 25px;
`;

export const MetricsWrapper = styled.div`
	position: relative;
	z-index: 1;
`;

export const MetricsBody = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 25px;
	margin: 32.5px 0 0 0;
`;

export const MetricsRow = styled.div`
	width: 100%;
	display: flex;
	gap: 25px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const MetricsSection = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	gap: 5px;
	padding: 20px;
	background: ${(props) => `${props.theme.colors.container.alt1.background}90`} !important;
	backdrop-filter: blur(7.5px);

	p {
		font-size: ${(props) => props.theme.typography.size.small};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
		text-align: center;
	}

	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};
		text-align: center;
		text-transform: uppercase;
	}

	.metric-value {
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xLg};
		font-weight: ${(props) => props.theme.typography.weight.xBold};
		margin: 17.5px 0 0 0;
	}
`;

export const TabsWrapper = styled.div`
	width: 100%;
	position: relative;
	z-index: 1;
	margin: 25px 0 0 0;
	background: ${(props) => props.theme.colors.container.primary.background};
`;

export const Tab = styled.div<{ label: string }>``;

export const HeaderWrapper = styled.div``;

export const Subheader = styled.div`
	width: fit-content;
	padding: 4.5px 15px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12.5px;
	background: ${(props) => props.theme.colors.container.alt8.background};
	border: 1px solid ${(props) => props.theme.colors.border.alt2};
	border-radius: ${STYLING.dimensions.radius.primary};
	span {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.light1};
		text-align: center;
		text-transform: uppercase;
	}
`;

export const Indicator = styled.div`
	height: 10.5px;
	width: 10.5px;
	border-radius: ${STYLING.dimensions.radius.circle};

	animation: pulse 1.075s infinite;

	@keyframes pulse {
		0%,
		100% {
			background: ${(props) => props.theme.colors.indicator.active};
			transform: scale(1);
		}
		50% {
			background: ${(props) => props.theme.colors.indicator.primary};
			transform: scale(1.15);
		}
	}
`;

export const Graphic = styled.div`
	video {
		width: 100%;
		max-width: ${STYLING.cutoffs.max};
		filter: invert(${(props) => (props.theme.scheme === 'dark' ? 0.9175 : 0)});
		position: fixed;
		opacity: 0.45;
		z-index: 0;
		top: -72.5px;
		left: 50%;
		transform: translate(-50%, 0);
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		display: none;
	}
`;
