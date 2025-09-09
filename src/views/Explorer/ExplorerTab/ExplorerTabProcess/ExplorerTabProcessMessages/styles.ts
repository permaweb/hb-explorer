import styled from 'styled-components';

export const Wrapper = styled.div``;

export const HeaderWrapper = styled.div`
	display: flex;
	justify-content: flex-end;
	padding: 0 0 15px 0;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	margin-bottom: 15px;
`;
