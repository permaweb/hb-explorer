import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div<{ isFullScreen: boolean }>`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 25px;
	position: relative;
	padding: ${(props) => (props.isFullScreen ? '20px' : '0')};
	background: ${(props) => (props.isFullScreen ? props.theme.colors.container.primary.background : 'transparent')};
`;

export const InfoWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 12.5px;
	padding: 15px;
`;

export const InfoLine = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 12.5px;
`;

export const InfoLineDivider = styled.div`
	height: 1px;
	width: 100%;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const InfoBlockFlex = styled.div`
	display: flex;
	align-items: center;
	gap: 12.5px;
	flex-wrap: wrap;
`;

export const InfoBlock = styled.div<{ background?: string }>`
	display: flex;
	align-items: center;
	gap: 7.5px;

	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
		text-transform: uppercase;
		display: block;
		margin: 0.5px 0 0 0;
	}

	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt2};
	}

	.indicator {
		height: 12.5px;
		width: 12.5px;
		background: ${(props) => props.background ?? props.theme.colors.container.primary.active};
		border-radius: ${STYLING.dimensions.radius.alt3};
	}
`;

export const InfoBlockDivider = styled.div`
	height: 20px;
	width: 1px;
	border-right: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const GraphWrapper = styled.div`
	min-height: 500px;
	height: calc(100vh - 260px);
	width: 100%;
	position: relative;
	display: flex;
	flex-direction: row;
	gap: 20px;
`;

export const Graph = styled.div<{ isFullScreen?: boolean; hasActiveData?: boolean }>`
	height: 100%;
	width: ${(props) => (props.isFullScreen && props.hasActiveData ? '55%' : '100%')};
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

export const GraphCanvas = styled.div`
	height: 100%;
	width: 100%;
	position: relative;
`;

export const FullScreenDataPanel = styled.div`
	width: 45%;
	height: 100%;
	display: flex;
	flex-direction: column;
`;

export const DataPanelHeader = styled.div`
	padding: 15px 20px;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: ${(props) => props.theme.colors.container.alt1.background};
	font-weight: 500;
	font-size: 14px;
	color: ${(props) => props.theme.colors.font.primary};
`;

export const DataPanelContent = styled.div`
	flex: 1;
	overflow: hidden;

	.modal-wrapper {
		height: 100%;

		> div {
			height: 100% !important;
			border-radius: 0 !important;
			border: none !important;
		}
	}
`;

export const ActiveNodeSection = styled.div`
	background: ${(props) =>
		props.theme.colors.editor.alt1 ? `${props.theme.colors.editor.alt1}20` : 'rgba(255, 85, 0, 0.1)'};
	border: 1px solid ${(props) => props.theme.colors.editor.alt1 || '#FF5500'};
	border-radius: ${STYLING.dimensions.radius.alt1};
	padding: 12px 15px;
	margin-top: 5px;

	.info-line-active {
		margin: 0;
	}
`;
