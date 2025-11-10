import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	position: relative;
`;

export const InputWrapper = styled.div<{ cacheStatus?: 'default' | 'success' | 'error' }>`
	width: 100%;
	position: relative;

	input {
		background: transparent;
		padding: 10px 10px 10px 43.5px !important;
        height: 37.5px !important;
		border: 0.5px solid
			${(props) => {
				switch (props.cacheStatus) {
					case 'success':
						return props.theme.colors.form.valid.outline;
					case 'error':
						return props.theme.colors.form.invalid.outline;
					default:
						return props.theme.colors.form.border;
				}
			}} !important;
        }

		
	}

	svg {
		height: 15px;
		width: 15px;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
		position: absolute;
		z-index: 1;
		top: 11.5px;
		left: 14.5px;
	}
`;

export const SubmitWrapper = styled.div`
	position: absolute;
	top: 2.5px;
	right: 4.5px;
`;

