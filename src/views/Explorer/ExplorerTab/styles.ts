import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 25px;
`;

export const HeaderWrapper = styled.form`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 20px;
	position: relative;
	z-index: 1;
	overflow: visible;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
		align-items: flex-start;
	}
`;

export const HeaderActionsWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
	}
`;

export const SearchWrapper = styled.div`
	max-width: 100%;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 15px;
	position: relative;
	overflow: visible;
`;

export const SearchInputWrapper = styled.div<{ cacheStatus?: 'default' | 'success' | 'error' }>`
	width: 510px;
	max-width: 100%;
	position: relative;
	overflow: visible;

	input {
		padding: 10px 10px 10px 43.5px !important;
		border: 1px solid
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

		&:focus {
			outline: 0;
			border: 1px solid
				${(props) => {
					switch (props.cacheStatus) {
						case 'success':
							return props.theme.colors.form.valid.outline;
						case 'error':
							return props.theme.colors.form.invalid.outline;
						default:
							return props.theme.colors.form.default.outline;
					}
				}} !important;

			outline: 0.5px solid
				${(props) => {
					switch (props.cacheStatus) {
						case 'success':
							return props.theme.colors.form.valid.outline;
						case 'error':
							return props.theme.colors.form.invalid.outline;
						default:
							return props.theme.colors.form.default.outline;
					}
				}} !important;

			box-shadow: 0 0 0.5px solid
				${(props) => {
					switch (props.cacheStatus) {
						case 'success':
							return props.theme.colors.form.valid.shadow;
						case 'error':
							return props.theme.colors.form.invalid.shadow;
						default:
							return props.theme.colors.form.default.outline;
					}
				}} !important;

			transition: box-shadow, border, outline 225ms ease-in-out;
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

export const PathInfoWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 15px;
	flex-wrap: wrap;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
	}
`;

export const UpdateWrapper = styled.div`
	width: fit-content;
	padding: 4.5px 15px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12.5px;
	background: ${(props) => props.theme.colors.container.alt8.background};
	border: 1px solid ${(props) => props.theme.colors.border.alt2};
	border-radius: ${STYLING.dimensions.radius.alt2};
	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.alt1};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.light1};
		text-align: center;
		text-transform: uppercase;
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
		padding: 7.5px 15px;
	}
`;

export const Indicator = styled.div`
	height: 10.5px;
	width: 10.5px;
	border-radius: 50%;

	animation: pulse 1.075s infinite;

	@keyframes pulse {
		0%,
		100% {
			background: ${(props) => props.theme.colors.indicator.active};
			transform: scale(1);
		}
		50% {
			background: ${(props) => props.theme.colors.indicator.primary};
			transform: scale(1.15);
		}
	}
`;

export const BodyWrapper = styled.div`
	width: 100%;
`;

export const Placeholder = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20px;
	padding: 80px 0;
`;

export const PlaceholderIcon = styled.div`
	height: 150px;
	width: 150px;
	display: flex;
	justify-content: center;
	align-items: center;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: 50%;

	svg {
		height: 85px;
		width: 85px;
		color: ${(props) => props.theme.colors.icon.primary.fill};
		fill: ${(props) => props.theme.colors.icon.primary.fill};
		margin: 5px 0 0 0;
	}
`;

export const PlaceholderDescription = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 10px;

	p,
	span {
		text-align: center;
	}

	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt2};
		text-transform: uppercase;
	}

	span {
		display: block;
		max-width: 350px;
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		color: ${(props) => props.theme.colors.font.alt1};
	}
`;
