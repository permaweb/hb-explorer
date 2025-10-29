import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const Sidebar = styled.aside`
	width: 260px;
	display: flex;
	flex-direction: column;
	position: relative;
	padding: 0 0 24px 0;
	border-right: 1px solid ${(props) => props.theme.colors.border.primary};

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: -25px;
		bottom: 0;
		right: 0;
		background: ${(props) => props.theme.colors.container.alt1.background};
		z-index: 0;
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;

		&::before {
			left: -15px;
		}
	}
`;

export const SidebarContent = styled.div`
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
`;

export const SidebarHeader = styled.div`
	padding: 24px 24px 18px 24px;
	display: flex;
	flex-direction: column;
	gap: 10px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const SidebarTitle = styled.h3`
	font-size: ${(props) => props.theme.typography.size.lg};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.primary};
`;

export const SidebarMeta = styled.span`
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	color: ${(props) => props.theme.colors.font.alt1};
`;

export const SidebarFilter = styled.button`
	width: fit-content;
	padding: 6px 14px 7px 14px;
	border-radius: 18px;
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	background: ${(props) => props.theme.colors.container.primary.background};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.alt1};
	letter-spacing: 0.35px;
	text-transform: uppercase;
	cursor: pointer;
	transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;

	&:hover {
		background: ${(props) => props.theme.colors.container.alt2.background};
	}

	&:focus {
		outline: none;
		box-shadow: 0 0 0 1px ${(props) => props.theme.colors.border.alt5};
	}
`;

export const SidebarList = styled.div`
	display: flex;
	flex-direction: column;
	background: ${(props) => props.theme.colors.container.primary.background};
`;

export const SidebarIndicator = styled.div<{ $active: boolean }>`
	height: 12px;
	width: 12px;
	border-radius: 50%;
	border: 2px solid ${(props) => props.theme.colors.border.alt2};
	background: ${(props) => (props.$active ? props.theme.colors.indicator.active : 'transparent')};
	transition: background 0.18s ease, border-color 0.18s ease;
`;

export const SidebarItem = styled.button<{ $active: boolean }>`
	width: 100%;
	padding: 18px 24px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: ${(props) =>
		props.$active ? props.theme.colors.container.alt1.background : props.theme.colors.container.primary.background};
	border: none;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	cursor: pointer;
	text-align: left;
	transition: background 0.18s ease, border-color 0.18s ease;

	&:hover {
		background: ${(props) => props.theme.colors.container.alt1.background};
	}

	&:focus {
		outline: none;
		box-shadow: inset 0 0 0 1px ${(props) => props.theme.colors.border.alt5};
	}

	&:hover ${SidebarIndicator} {
		border-color: ${(props) => props.theme.colors.border.alt5};
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		padding: 16px 20px;
	}
`;

export const SidebarInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

export const SidebarLabel = styled.span`
	font-size: ${(props) => props.theme.typography.size.small};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.primary};
`;

export const SidebarDescription = styled.span`
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	color: ${(props) => props.theme.colors.font.alt1};
	text-transform: uppercase;
	letter-spacing: 0.45px;
`;

export const SidebarEmpty = styled.div`
	padding: 40px 24px;
	text-align: center;
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	color: ${(props) => props.theme.colors.font.alt1};
`;

export const Content = styled.section`
	flex: 1;
	display: flex;
	flex-direction: column;
	background: ${(props) => props.theme.colors.container.primary.background};
`;

export const ContentHeader = styled.div`
	padding: 24px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 16px;
	flex-wrap: wrap;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const ContentHeading = styled.div`
	display: flex;
	flex-direction: column;
	gap: 6px;
`;

export const ContentTitle = styled.h2`
	font-size: ${(props) => props.theme.typography.size.xLg};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.primary};
`;

export const ContentMeta = styled.span`
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	color: ${(props) => props.theme.colors.font.alt1};
`;

export const ContentActions = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
`;

export const ContentBody = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	background: ${(props) => props.theme.colors.container.primary.background};
	max-height: 77.5vh;
	overflow-y: auto;

	> div:not(:last-child) {
		border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		max-height: none;
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

export const Group = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
`;

export const GroupHeader = styled.div`
	background: ${(props) => props.theme.colors.container.alt2.background};
	padding: 16px 24px;

	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
		text-transform: uppercase;
		letter-spacing: 0.55px;
	}
`;

export const GroupBody = styled.div`
	padding: 0 24px 16px;
	background: ${(props) => props.theme.colors.container.primary.background};

	> *:not(:last-child) {
		border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	}
`;

export const GroupLine = styled.div`
	padding: 14px 0;
	display: grid;
	grid-template-columns: minmax(0, 2.5fr) minmax(0, 1fr);
	align-items: center;
	gap: 16px;

	p {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		color: ${(props) => props.theme.colors.font.primary};
		white-space: normal;
	}

	span {
		justify-self: end;
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const SubGroup = styled(Group)``;

export const SubGroupHeader = styled(GroupHeader)`
	background: ${(props) => props.theme.colors.container.alt1.background};

	p {
		color: ${(props) => props.theme.colors.font.alt2};
	}
`;

export const SubGroupBody = styled(GroupBody)``;

export const SubGroupLine = styled(GroupLine)``;
