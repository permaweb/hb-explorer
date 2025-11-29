import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: stretch;
	margin: 20px 0 0 0;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
		gap: 0;
	}
	height: calc(
		100vh - ${STYLING.dimensions.nav.height} - ${STYLING.dimensions.landingTab.height} -
			${STYLING.dimensions.footer.height} - ${STYLING.dimensions.landingHeader.padding}
	);
`;

export const Sidebar = styled.aside`
	width: 300px;
	display: flex;
	flex-direction: column;
	position: relative;
	padding: 0 0 24px 0;
	border-right: 1px solid ${(props) => props.theme.colors.border.primary};

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
		padding: 0 0 16px 0;
		border-right: none;
		border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	}
`;

export const SidebarContent = styled.div`
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	flex: 1;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		min-height: auto;
	}
`;

export const SidebarHeader = styled.div`
	padding: ${STYLING.dimensions.landingHeader.padding};
	display: flex;
	min-height: 106px;
	flex-direction: column;
	gap: 10px;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	justify-content: space-between;
	align-items: flex-start;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		padding: 20px ${STYLING.dimensions.landingHeader.padding} 16px ${STYLING.dimensions.landingHeader.padding};
		min-height: auto;
		flex-direction: row;
		align-items: center;
		gap: 16px;
	}
`;

export const SidebarHeaderBody = styled.div`
	display: flex;
	flex-direction: column;
	gap: 6px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		gap: 6px;
	}
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
	font-weight: ${(props) => props.theme.typography.weight.light};
	color: ${(props) => props.theme.colors.font.alt1};
`;

export const SidebarFilter = styled.button`
	width: fit-content;
	padding: 6px 14px 7px 14px;
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

	@media (max-width: ${STYLING.cutoffs.initial}) {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
		padding: 16px 24px 24px 24px;
	}

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	@media (max-width: 360px) {
		grid-template-columns: repeat(1, minmax(0, 1fr));
	}
`;

export const SidebarHeaderLabel = styled.div`
	display: none;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-left: auto;
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		text-transform: uppercase;
		letter-spacing: 0.4px;
	}
`;

export const SidebarHeaderLabelText = styled.span`
	display: flex;
	align-items: center;
	gap: 8px;

	svg {
		width: 16px;
		height: 16px;
	}
`;

export const SidebarItemInner = styled.div<{ $active: boolean }>`
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 8px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		padding: 7px 14px 7px 14px;
		border: 1px solid ${(props) => props.theme.colors.border.primary};
		background: ${(props) =>
			props.$active ? props.theme.colors.container.alt2.background : props.theme.colors.container.primary.background};
	}
`;

export const SidebarItem = styled.button<{ $active: boolean }>`
	width: 100%;
	height: 100%;
	max-height: 52.5px;
	padding: 10px 16px 10px 24px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: ${(props) => (props.$active ? props.theme.colors.container.alt2.background : 'transparent')};
	border: none;
	cursor: pointer;
	text-align: left;

	&:hover {
		background: ${(props) =>
			props.$active ? props.theme.colors.container.alt2.background : props.theme.colors.container.alt1.background};
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
		height: 100%;
		padding: 0;
		background: transparent;
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

	@media (max-width: ${STYLING.cutoffs.initial}) {
		display: none;
	}
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
	width: 100%;
	flex-direction: column;
	background: ${(props) => props.theme.colors.container.primary.background};
`;

export const ContentHeader = styled.div`
	padding: ${STYLING.dimensions.landingHeader.padding};
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
	font-weight: ${(props) => props.theme.typography.weight.light};
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
	overflow-y: auto;

	> div:not(:last-child) {
		border-bottom: 1px solid ${(props) => props.theme.colors.border.alt1};
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
	background: ${(props) => props.theme.colors.container.alt1.background};
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
