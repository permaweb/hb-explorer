import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const HeaderWrapper = styled.div`
	position: relative;
	z-index: 1;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 35px;
	position: relative;
	z-index: 1;
`;

export const RouterWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const RouterBody = styled.div`
	width: 100%;
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.alt1};
	overflow: hidden;

	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		}
	}
`;

export const RouterFooter = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: flex-end;
`;

export const NodeRow = styled.div<{ count: number }>`
	display: grid;

	grid-template-columns: repeat(${({ count }) => count}, 1fr);

	> * {
		&:not(:last-child) {
			border-right: 1px solid ${(props) => props.theme.colors.border.primary};
		}
		&:last-child {
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

export const NodeWrapper = styled.a`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 25px;
	padding: 17.5px;
	background: ${(props) => props.theme.colors.container.alt1.background};

	&:hover {
		background: ${(props) => props.theme.colors.container.primary.active};
	}
`;

export const NodeHeader = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
	align-items: center;
	justify-content: space-between;

	p {
		font-size: ${(props) => props.theme.typography.size.small};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};
		text-decoration: underline;
		text-decoration-thickness: 1.25px;
	}

	span {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const IndicatorWrapper = styled.div`
	display: flex;
	gap: 10px;
	align-items: center;

	span {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const Indicator = styled.div<{ status: 'healthy' | 'unhealthy' }>`
	height: 11.5px;
	width: 11.5px;
	margin: 1.5px 0 0 0;
	border-radius: 50%;
	background: ${(props) =>
		props.status === 'healthy' ? props.theme.colors.indicator.active : props.theme.colors.warning.primary};

	animation: ${(props) => (props.status === 'healthy' ? 'pulse-healthy' : 'pulse-unhealthy')} 1.075s infinite;

	@keyframes pulse-healthy {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.15);
		}
	}

	@keyframes pulse-unhealthy {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1);
		}
	}
`;

export const NodeBody = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 12.5px;
	align-items: center;
	justify-content: space-between;
`;

export const NodeLine = styled.div`
	display: flex;
	gap: 5px;
	align-items: center;

	p {
		font-size: ${(props) => props.theme.typography.size.small};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.xBold};
		color: ${(props) => props.theme.colors.font.primary};
	}

	span {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const Subheader = styled.div`
	width: fit-content;
	padding: 6px 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${(props) => props.theme.colors.container.alt8.background};
	border-radius: ${STYLING.dimensions.radius.alt2};
	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.light1};
		text-align: center;
		text-transform: uppercase;
	}
`;

export const Placeholder = styled.div`
	height: 150px;
	width: 100%;
`;

export const Graphic = styled.div`
	video {
		width: 100%;
		max-width: ${STYLING.cutoffs.max};
		filter: invert(${(props) => (props.theme.scheme === 'dark' ? 0.915 : 0)});
		position: fixed;
		opacity: 0.35;
		z-index: 0;
		top: -88.5px;
		left: 50%;
		transform: translate(-50%, 0);
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		display: none;
	}
`;
