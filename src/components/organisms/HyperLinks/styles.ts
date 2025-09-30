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

export const InfoBlockKey = styled(InfoBlockFlex)`
	gap: 17.5px;
`;

export const InfoBlock = styled.div<{ background?: string }>`
	display: flex;
	align-items: center;
	gap: 5px;
	max-width: 100%;

	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
		white-space: nowrap;
		text-transform: uppercase;
		display: block;
		margin: 0.5px 0 0 0;
	}

	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt2};
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	code {
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-family: ${(props) => props.theme.typography.family.alt2};
		font-weight: ${(props) => props.theme.typography.weight.xBold};
		color: ${(props) => props.theme.colors.font.primary};
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		background: ${(props) => props.theme.colors.button.primary.background};
		border: 1px solid ${(props) => props.theme.colors.button.primary.border};
		border-radius: ${STYLING.dimensions.radius.alt2};
		padding: 1.5px 7.5px;
		cursor: pointer;
		transition: all 100ms;

		&:hover {
			color: ${(props) => props.theme.colors.button.primary.active.color};
			background: ${(props) => props.theme.colors.button.primary.active.background};
			border: 1px solid ${(props) => props.theme.colors.button.primary.active.border};
		}
	}

	.indicator {
		height: 12.5px;
		width: 12.5px;
		background: ${(props) => props.background ?? props.theme.colors.container.primary.active};
		border-radius: ${STYLING.dimensions.radius.alt3};
	}
`;

export const FilterForm = styled.form`
	position: relative;
	margin: 0 0 2.5px 0;

	input {
		height: 37.5px;
		width: 375px;
		max-width: 100%;
		background: ${(props) => props.theme.colors.container.alt1.background} !important;
		padding: 10px 10px 10px 36.5px !important;
	}

	svg {
		height: 15px;
		width: 15px;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
		position: absolute;
		z-index: 1;
		top: 11.5px;
		left: 11.5px;
	}
`;

export const InfoBlockMaxWidth = styled(InfoBlock)`
	max-width: 50%;
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

export const WrapperEmpty = styled.div`
	width: 100%;
	padding: 15px;

	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt2};
	}
`;

export const PanelWrapper = styled.div`
	height: 100%;
`;

export const PanelHeaderWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 7.5px;
	margin: 0 0 7.5px 0;
`;

export const PanelBodyWrapper = styled.div`
	height: calc(100% - 120px);
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	padding: 15px 0;
`;

export const PanelActionWrapper = styled.div`
	margin: 20px 0 0 0;
`;
