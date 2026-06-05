import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div<{ isFullscreen?: boolean }>`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	gap: 25px;
	position: relative;

	&:fullscreen {
		background: ${(props) => props.theme.colors.container.primary.background};
		padding: 15px;
		overflow: auto;
	}
`;

export const Container = styled.div<{ isFullscreen?: boolean }>`
	height: calc(100vh - 245px);
	width: 100%;
	display: flex;
	gap: 15px;
	position: relative;

	${(props) =>
		props.isFullscreen &&
		`
		height: calc(100vh - 12.5px);
	`}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const EditorWrapper = styled.div<{ showVariables?: boolean }>`
	height: 100%;
	flex: 1;
	min-width: 0;
	position: relative;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	gap: ${(props) => (props.showVariables ? '25px' : '0')};
`;

export const QueryEditorWrapper = styled.div<{ showVariables?: boolean }>`
	height: ${(props) => (props.showVariables ? '65%' : '100%')};
	position: relative;
	overflow: hidden;
`;

export const VariablesEditorWrapper = styled.div`
	height: 35%;
	position: relative;
	overflow: hidden;
	padding: 15px 0 0 0;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const ActionsWrapper = styled.div`
	width: fit-content;
	display: flex;
	flex-direction: column;
	gap: 15px;
	align-items: center;
`;

export const ResultWrapper = styled.div`
	height: 100%;
	flex: 1;
	min-width: 0;
	position: relative;
	overflow: hidden;

	> * {
		&:first-child {
			height: 100%;
		}
	}
`;

export const ErrorMessage = styled.div`
	position: absolute;
	bottom: 20px;
	left: 20px;
	right: 20px;
	padding: 15px;
	background: ${(props) => props.theme.colors.warning};
	z-index: 10;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.small};
	}
`;
