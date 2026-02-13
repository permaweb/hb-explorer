import styled from 'styled-components';

export const HeaderWrapper = styled.div`
	width: 100%;
	margin: 15px 0 35px 0;
`;

export const HeaderContent = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 30px 40px;

	h4 {
		line-height: 1;
		font-size: ${(props) => props.theme.typography.size.h4};
		font-family: ${(props) => props.theme.typography.family.primary};
		color: ${(props) => props.theme.colors.font.primary};
		font-weight: ${(props) => props.theme.typography.weight.light};
	}
`;

export const HeaderActions = styled.div`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
`;
