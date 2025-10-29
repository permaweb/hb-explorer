import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
`;

export const ErrorWrapper = styled.div`
	padding: 15px;

	p {
		font-size: ${(props) => props.theme.typography.size.small};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
	}
`;
