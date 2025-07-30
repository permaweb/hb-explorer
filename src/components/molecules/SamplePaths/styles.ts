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

export const PathGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
	gap: 20px;
`;

export const PathCard = styled.div`
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: 12px;
	padding: 20px;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: flex-start;
	gap: 16px;

	&:hover {
		border-color: ${(props) => props.theme.colors.border.alt4};
		background: ${(props) => props.theme.colors.container.alt1.background};
		transform: translateY(-2px);
		box-shadow: 0 4px 12px ${(props) => props.theme.colors.shadow.primary}20;
	}
`;

export const PathIcon = styled.div`
	background: ${(props) => props.theme.colors.container.alt3.background};
	border-radius: 8px;
	padding: 12px;
	flex-shrink: 0;

	svg {
		height: 20px;
		width: 20px;
		fill: ${(props) => props.theme.colors.font.primary};
	}
`;

export const PathContent = styled.div`
	flex: 1;
	min-width: 0;
`;

export const PathLabel = styled.h4`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: 16px;
	font-weight: 600;
	margin: 0 0 8px 0;
	line-height: 1.3;
`;

export const PathDescription = styled.p`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: 14px;
	margin: 0 0 12px 0;
	line-height: 1.4;
`;

export const PathValue = styled.div`
	code {
		background: ${(props) => props.theme.colors.container.alt4.background};
		color: ${(props) => props.theme.colors.font.alt4};
		font-family: 'JetBrains Mono', monospace;
		font-size: 13px;
		padding: 4px 8px;
		border-radius: 4px;
		border: 1px solid ${(props) => props.theme.colors.border.alt1};
	}
`;

export const PathAction = styled.div`
	flex-shrink: 0;
	margin-top: 4px;

	svg {
		height: 16px;
		width: 16px;
		fill: ${(props) => props.theme.colors.font.alt1};
		transition: transform 0.2s ease;
	}

	${PathCard}:hover & svg {
		transform: translateX(4px);
		fill: ${(props) => props.theme.colors.font.primary};
	}
`;