import styled, { css } from 'styled-components';

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
		flex-direction: column-reverse;
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

export const ContentWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	gap: 25px;
	position: relative;
	z-index: 1;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		flex-direction: column;
	}
`;

export const InfoWrapper = styled.div`
	width: 510px;
	display: flex;
	flex-direction: column;
	gap: 25px;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		width: 100%;
	}
`;

export const BodyWrapper = styled.div`
	width: calc(100% - 535px);
	display: flex;
	flex-direction: column;
	gap: 25px;
	position: relative;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		width: 100%;
	}
`;

export const Tab = styled.div<{ label: string }>``;

export const InfoSection = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
`;

export const InfoHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;

	padding: 12.5px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};

	p {
		font-size: ${(props) => props.theme.typography.size.base};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
	}

	span {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.alt1};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt2};
	}
`;

export const InfoTitle = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;

	svg {
		height: 15px;
		width: 15px;
		margin: 8.5px 0 0 0;
		color: ${(props) => props.theme.colors.font.primary};
		fill: ${(props) => props.theme.colors.font.primary};
	}
`;

export const IDHeader = styled(InfoHeader)`
	border-bottom: none;
	padding: 12.5px 12.5px 11.5px 12.5px;
`;

export const SignatureHeader = styled(InfoHeader)`
	border-bottom: none;
	padding: 12.5px 12.5px 8.5px 12.5px;
`;

export const TabButtonGroup = styled.div`
	display: flex;
	gap: 8px;
`;

export const TabButton = styled.button<{ active: boolean }>`
	padding: 6px 12px;
	border: 1px solid ${(props) => (props.active ? 'transparent' : props.theme.colors.border.primary)};
	border-radius: ${STYLING.dimensions.radius.alt2};
	background: ${(props) => (props.active ? props.theme.colors.container.alt8.background : 'transparent')};
	color: ${(props) => (props.active ? props.theme.colors.font.light1 : props.theme.colors.font.alt1)};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	font-family: ${(props) => props.theme.typography.family.primary};
	cursor: pointer;
	transition: all 150ms ease;
	white-space: nowrap;

	&:hover {
		background: ${(props) =>
			props.active ? props.theme.colors.container.alt8.background : props.theme.colors.container.alt1.background};
		color: ${(props) => (props.active ? props.theme.colors.font.light1 : props.theme.colors.font.primary)};
	}

	&:focus {
		outline: none;
		box-shadow: none;
	}
`;

export const InfoBody = styled.div`
	max-height: calc(100vh - 240px);
	display: flex;
	flex-direction: column;

	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		}
	}

	> *:nth-child(even) {
		background: ${(props) => props.theme.colors.container.alt1.background};
	}

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		max-height: none;
	}
`;

export const InfoBodyChild = styled(InfoBody)`
	max-height: none;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const SignatureBody = styled(InfoBody)`
	padding: 2.5px 0;
	> * {
		&:not(:last-child) {
			border-bottom: none;
		}
	}
`;

export const InfoFooter = styled.div`
	padding: 12.5px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};

	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt2};
	}
`;

export const InfoLineWrapper = styled.div`
	width: 100%;
`;

export const InfoLine = styled.div<{ isLink: boolean; depth: number }>`
	height: 45px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 7.5px;
	padding: ${(props) => `12.5px 12.5px 12.5px ${(props.depth * 12.5).toString()}px`};

	p,
	span {
		display: block;
		max-width: calc(65% - 15px);
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt2};
	}

	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
	}

	svg {
		height: 12.5px;
		width: 12.5px;
		margin: 7.5px 0 0 0;
		color: ${(props) => props.theme.colors.font.primary};
		fill: ${(props) => props.theme.colors.font.primary};
	}

	${(props) =>
		props.isLink &&
		css`
			&:hover {
				cursor: pointer;
				background: ${props.theme.colors.container.alt2.background};
			}
		`}
`;

export const SignatureLine = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 7.5px;
	padding: 10px 12.5px;

	p,
	span {
		display: block;
		max-width: calc(50% - 15px);
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
	}

	span {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt2};
	}
`;

export const SignatureStatus = styled(SignatureLine)<{ valid: boolean }>`
	p {
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.light1};
		padding: 3.5px 8.5px 3.5px 9.5px;
		text-transform: uppercase;
		background: ${(props) => (props.valid ? props.theme.colors.indicator.active : props.theme.colors.warning.primary)};
		border-radius: ${STYLING.dimensions.radius.alt1};
	}
`;

export const InfoLineHeader = styled.div<{ open: boolean }>`
	width: 45%;
	display: flex;
	align-items: center;
	gap: 10px;

	svg {
		transition: all 150ms;
		transform: rotate(${(props) => (props.open ? '90deg' : '0deg')});
	}
`;

export const InfoLineEnd = styled.div`
	width: 55%;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 10px;

	span {
		max-width: none;
	}

	svg {
		margin: 0 0 0.75px 0;
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

// Wrapper to add spinning animation to IconButton
export const SpinningWrapper = styled.div`
	&.spinning svg {
		animation: icon-bounce-spin 0.8s ease-out infinite;
		transform-origin: 50% 50%;
	}

	@keyframes icon-bounce-spin {
		0% {
			transform: rotate(0deg);
		}
		10% {
			transform: rotate(-50deg);
		}
		30% {
			transform: rotate(-120deg);
		}
		50% {
			transform: rotate(-180deg);
		}
		60% {
			transform: rotate(-230deg);
		}
		80% {
			transform: rotate(-300deg);
		}
		100% {
			transform: rotate(-360deg);
		}
	}
`;

export const CustomSpinnerButton = styled.button`
	width: 32.5px;
	height: 32.5px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: ${STYLING.dimensions.radius.primary};
	background: ${(props) => props.theme.colors.button.alt1.background};
	border: 1px solid ${(props) => props.theme.colors.button.alt1.border};
	cursor: pointer;
	color: ${(props) => props.theme.colors.button.alt1.color};

	&:hover {
		background: ${(props) => props.theme.colors.button.alt1.background};
		border: 1px solid ${(props) => props.theme.colors.button.alt1.border};
		opacity: 0.8;
	}
`;

export const SpinnerSVG = styled.svg`
	width: 17.5px;
	height: 17.5px;
	animation: smooth-spin 0.5s linear infinite;
	transform-origin: center center;

	@keyframes smooth-spin {
		from {
			transform: rotate(-180deg);
		}
		to {
			transform: rotate(180deg);
		}
	}
`;

export const SearchInputWrapper = styled.div<{ cacheStatus?: 'default' | 'success' | 'error'; hasDropdown?: boolean }>`
	width: 510px;
	max-width: 100%;
	position: relative;
	overflow: visible;

	input {
		background: transparent;
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

		border-radius: ${(props) =>
			props.hasDropdown
				? `${STYLING.dimensions.radius.primary} ${STYLING.dimensions.radius.primary} 0 0 !important`
				: `${STYLING.dimensions.radius.primary} !important`};

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

export const InputActions = styled.div`
	width: 100%;
	display: flex;
	gap: 15px;
	justify-content: flex-end;
	margin: 15px 0 0 0;
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
	margin: 1.5px 0 0 0;
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

export const Graphic = styled.div`
	video {
		width: 100%;
		max-width: ${STYLING.cutoffs.max};
		filter: invert(${(props) => (props.theme.scheme === 'dark' ? 0.915 : 0)});
		opacity: 0.25;
		position: fixed;
		z-index: 0;
		top: 25px;
		left: 0;
		left: 50%;
		transform: translate(-50%, 0);
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		display: none;
	}
`;
