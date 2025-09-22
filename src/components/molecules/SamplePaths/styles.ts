import styled from 'styled-components';

export const Wrapper = styled.div`
	max-width: 800px;
	margin: 0 auto;
	padding: 40px 20px;
`;

export const Header = styled.div`
	text-align: center;
	margin-bottom: 40px;
`;

export const HeaderTitle = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12px;
	margin-bottom: 12px;

	svg {
		height: 24px;
		width: 24px;
		fill: ${(props) => props.theme.colors.font.light1};
	}

	h3 {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: 24px;
		font-weight: 600;
		margin: 0;
	}
`;

export const HeaderDescription = styled.p`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: 16px;
	margin: 0;
	line-height: 1.5;
`;

export const PathList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
	justify-content: center;
	align-items: center;
`;

export const PathCard = styled.div`
	width: 100%;
	max-width: 500px;
	background: ${(props) => `${props.theme.colors.container.alt1.background}90`} !important;
	backdrop-filter: blur(7.5px);
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: 12px;
	padding: 12px 16px;
	cursor: pointer;
	transition: all 100ms;
	display: flex;
	align-items: flex-start;
	gap: 12px;

	&:hover {
		border-color: ${(props) => props.theme.colors.border.alt4};
		background: ${(props) => props.theme.colors.container.alt1.background};
		box-shadow: 0 4px 12px ${(props) => props.theme.colors.shadow.primary}20;
	}
`;

export const PathIcon = styled.div`
	background: ${(props) => props.theme.colors.container.alt3.background};
	border-radius: 8px;
	padding: 8px;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;

	& > div {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 18px;
		width: 18px;
	}

	svg {
		height: 18px;
		width: 18px;
		fill: ${(props) => props.theme.colors.font.primary};
		margin: 7.5px 0 0 0;
	}
`;

export const PathContent = styled.div`
	flex: 1;
	min-width: 0;
`;

export const PathLabel = styled.h4`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: 15px;
	font-weight: 600;
	margin: 0 0 4px 0;
	line-height: 1.2;
`;

export const PathDescription = styled.p`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: 13px;
	margin: 0 0 8px 0;
	line-height: 1.3;
`;

export const PathValue = styled.div`
	code {
		background: ${(props) => props.theme.colors.container.alt8.background};
		color: ${(props) => props.theme.colors.font.light1};
		font-family: ${(props) => props.theme.typography.family.alt2};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-size: 12px;
		padding: 2px 6px;
		border-radius: 4px;
		border: 1px solid ${(props) => props.theme.colors.border.alt1};
		word-wrap: break-word;
	}
`;

export const PathAction = styled.div`
	flex-shrink: 0;
	margin-top: 2px;

	svg {
		height: 14px;
		width: 14px;
		fill: ${(props) => props.theme.colors.font.alt1};
		transition: all 100ms;
	}

	${PathCard}:hover & svg {
		fill: ${(props) => props.theme.colors.font.primary};
	}
`;
