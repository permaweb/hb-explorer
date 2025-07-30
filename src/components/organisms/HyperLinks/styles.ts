import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 25px;
	position: relative;
`;

export const GraphWrapper = styled.div`
	height: 500px;
	width: 100%;
	position: relative;
`;

export const ActiveNodeWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 12.5px;
	padding: 15px;
`;

export const ActiveNodeLine = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;

	p {
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
		text-transform: uppercase;
	}

	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt2};
	}
`;
