import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
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
`;

export const MetricsRow = styled.div`
	width: 100%;
	display: flex;
	gap: 25px;
`;

export const MetricsSection = styled.div`
	width: 100%;
	height: 100%;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 20px;
	background: ${(props) => `${props.theme.colors.container.alt1.background}90`} !important;

	p {
		width: 100%;
		font-size: clamp(0.75rem, 0.6rem + 0.5vw, ${(props) => props.theme.typography.size.xxxSmall});
		font-family: ${(props) => props.theme.typography.family.primary};
		color: ${(props) => props.theme.colors.font.primary};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		white-space: nowrap;
	}

	span {
		font-size: clamp(0.65rem, 0.5rem + 0.05vw, ${(props) => props.theme.typography.size.xxSmall});
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.light};
		color: ${(props) => props.theme.colors.font.alt1};
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.metric-value {
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: clamp(1.3rem, 1rem + 1vw, ${(props) => props.theme.typography.size.xLg});
		font-weight: ${(props) => props.theme.typography.weight.xBold};
		color: ${(props) => props.theme.colors.font.primary};
		opacity: 1;
	}
`;

export const TabsWrapper = styled.div`
	width: 100%;
	position: relative;
	z-index: 3;
	margin: 25px 0 0 0;
	background: ${(props) => props.theme.colors.container.primary.background};
`;

export const Tab = styled.div<{ label: string }>``;

export const HeaderWrapper = styled.div``;

export const Subheader = styled.div`
	width: fit-content;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12.5px;
	border-radius: ${STYLING.dimensions.radius.primary};
	span {
		font-size: ${(props) => props.theme.typography.size.xxLg};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.light};
		color: ${(props) => props.theme.colors.font.primary};
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
		opacity: 0.1;
		z-index: 0;
		top: -${STYLING.dimensions.nav.height};
		left: 50%;
		transform: translate(-50%, 0);
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		display: none;
	}
`;
