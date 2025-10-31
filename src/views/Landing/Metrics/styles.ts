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
	width: 300px;
	display: flex;
	flex-direction: column;
	position: relative;
	padding: 0 0 24px 0;

	//border pseudo element
	&::after {
		content: '';
		position: absolute;
		top: -40px;
		left: 0px;
		bottom: 0;
		right: 0;
		border-right: 1px solid ${(props) => props.theme.colors.border.primary};
		z-index: 10;
		pointer-events: none;	
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
	min-height: 70vh;
`;

export const SidebarHeader = styled.div`
	padding: 24px;
	display: flex;
	min-height: 106px;
	flex-direction: column;
	gap: 10px;
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



export const SidebarItemInner = styled.div<{ $active: boolean }>`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 8px;
	background: ${(props) => (props.$active ? props.theme.colors.container.alt2.background : 'transparent')};
	transition: background 0.2s ease;
`;

export const SidebarItem = styled.button<{ $active: boolean }>`
	width: 100%;
	padding: 10px 24px 10px 24px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: none;
	cursor: pointer;
	text-align: left;

	&:hover ${SidebarItemInner} {
		background: ${(props) => props.theme.colors.container.alt2.background};
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		padding: 16px 20px;
	}
`;

export const SidebarInfo = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

export const SidebarIcon = styled.div`
	width: 16px;
	height: 16px;
	display: flex;
	align-items: center;
	justify-content: center;

	div,
	svg {
		width: 16px;
		height: 16px;
	}
`;

export const SidebarLabel = styled.span`
	font-size: ${(props) => props.theme.typography.size.small};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	color: ${(props) => props.theme.colors.font.primary};
`;

export const SidebarDescription = styled.span`
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.light};
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

export const ContentTitleWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
`;

export const ContentTitle = styled.h2`
	font-size: ${(props) => props.theme.typography.size.xLg};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.primary};
`;

export const ContentTitleIcon = styled.div`
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;

	div,
	svg {
		width: 18px;
		height: 18px;
	}
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
		border-bottom: 1px solid ${(props) => props.theme.colors.border.alt1};
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
		> *:not(:last-child) {
		border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	}
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
	padding: 0 0px 16px;
	background: ${(props) => props.theme.colors.container.primary.background};
		> *:not(:last-child) {
		border-bottom: 1px solid ${(props) => props.theme.colors.border.alt1};
	}
`;

export const GroupLine = styled.div`
	padding: 14px 24px;
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
	background: none;
	padding: 16px 24px;

	p {
		color: ${(props) => props.theme.colors.font.alt2};
		font-weight: ${(props) => props.theme.typography.weight.light};
	}
`;

export const SubGroupBody = styled(GroupBody)``;

export const SubGroupLine = styled(GroupLine)``;
