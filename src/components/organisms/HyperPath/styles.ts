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

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		width: 100%;
	}
`;

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

	p {
		font-size: ${(props) => props.theme.typography.size.base};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
	}

	svg {
		height: 15px;
		width: 15px;
		margin: 8.5px 0 0 0;
		color: ${(props) => props.theme.colors.font.primary};
		fill: ${(props) => props.theme.colors.font.primary};
	}
`;

export const SignatureHeader = styled(InfoHeader)`
	border-bottom: none;
	padding: 12.5px 12.5px 8.5px 12.5px;
`;

export const InfoBody = styled.div`
	max-height: 400px;
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

export const InfoLine = styled.div<{ isAddress: boolean }>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 7.5px;
	padding: 12.5px;

	p,
	span {
		display: block;
		max-width: calc(65% - 15px);
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	span {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt2};
	}

	p {
		font-size: ${(props) => props.theme.typography.size.xSmall};
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
		props.isAddress &&
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

export const InfoLineHeader = styled.div`
	width: 75%;
	display: flex;
	align-items: center;
	gap: 10px;
`;

export const SearchWrapper = styled.div`
	max-width: 100%;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 15px;
	position: relative;
`;

export const SearchInputWrapper = styled.div`
	width: 510px;
	max-width: 100%;
	position: relative;

	input {
		max-width: 100%;
		padding: 10px 10px 10px 42.5px !important;
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
		filter: invert(${(props) => (props.theme.scheme === 'dark' ? 0.9275 : 0)});
		opacity: 0.35;
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
