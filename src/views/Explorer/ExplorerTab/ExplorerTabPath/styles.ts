import styled, { css } from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
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
		font-family: ${(props) => props.theme.typography.family.primary};
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

export const SignatureHeader = styled(InfoHeader)`
	border-bottom: none;
	background: transparent;
	padding: 12.5px 12.5px 8.5px 12.5px;
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
	background: transparent !important;

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
	border-radius: ${STYLING.dimensions.radius.circle};

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
