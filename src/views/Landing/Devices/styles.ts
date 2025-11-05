import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Container = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	min-height: calc(100vh - ${STYLING.dimensions.nav.height} - ${STYLING.dimensions.landingTab.height} - ${STYLING.dimensions.footer.height} - ${STYLING.dimensions.landingHeader.padding});
`;

export const Header = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 16px;
	flex-wrap: wrap;
	padding: ${STYLING.dimensions.landingHeader.padding} 0px ${STYLING.dimensions.landingHeader.padding} 0px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
		align-items: flex-start;
	}
`;

export const HeaderContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 6px;
`;

export const Title = styled.h2`
	font-size: ${(props) => props.theme.typography.size.xLg};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.primary};
`;

export const Subtitle = styled.span`
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.light};
	color: ${(props) => props.theme.colors.font.alt1};
`;

export const SearchWrapper = styled.div`
	display: flex;
	align-items: center;
	min-width: 500px;
	
	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
		min-width: auto;
	}
`;

export const Wrapper = styled.div`
	width: 100%;
	overflow: hidden;
	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		}
	}
`;

export const DeviceRow = styled.div<{ count: number }>`
	display: grid;

	grid-template-columns: repeat(${({ count }) => count}, 1fr);
	> * {
		&:not(:last-child) {
			border-right: 1px solid ${(props) => props.theme.colors.border.primary};
		}
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		grid-template-columns: repeat(1, 1fr);

		> * {
			&:not(:last-child) {
				border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
			}
		}
	}
`;

export const DeviceWrapper = styled.button`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 25px;
	padding: 20px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	cursor: pointer;

	&:hover {
		background: ${(props) => props.theme.colors.container.primary.active};
	}
`;

export const DeviceNameWrapper = styled.div`
	position: relative;
	display: flex;
	align-items: center;

	p {
		font-size: ${(props) => props.theme.typography.size.small};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		color: ${(props) => props.theme.colors.font.primary};
	}
`;

export const DeviceVersionWrapper = styled.div`
	p {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.light};
		color: ${(props) => props.theme.colors.font.primary};
	}
`;

export const CubeSpinWrapper = styled.div`
	position: absolute;
	left: 100%;
	top: 50%;
	transform: translateY(0%) scale(0);
	display: none;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	opacity: 0;
	pointer-events: none;
	transition: opacity 100ms ease-out, transform 100ms ease-out;

	${DeviceWrapper}:hover & {
		display: flex;
		opacity: 1;
		transform: translateY(-50%) scale(1);
	}
`;

export const EmptyState = styled.div`
	padding: 60px 24px;
	text-align: center;
	font-size: ${(props) => props.theme.typography.size.small};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	color: ${(props) => props.theme.colors.font.alt1};
`;
