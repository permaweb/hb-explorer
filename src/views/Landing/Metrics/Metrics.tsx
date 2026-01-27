import React from 'react';
import { ReactSVG } from 'react-svg';

import { Loader } from 'components/atoms/Loader';
import { ASSETS, HB_METRIC_CATEGORIES } from 'helpers/config';
import { formatCount } from 'helpers/utils';

import * as S from './styles';

export default function Metrics(props: { metrics: any }) {
	const categoryKeys = React.useMemo(() => Object.keys(HB_METRIC_CATEGORIES), []);
	const [activeCategory, setActiveCategory] = React.useState<string>(categoryKeys[0] || '');
	const [groups, setGroups] = React.useState<any>(null);
	const CATEGORY_ICONS = React.useMemo<Record<string, string | undefined>>(
		() => ({
			'AO Events': ASSETS.aoEvents,
			'System Stats': ASSETS.systemStats,
			'Network Stats': ASSETS.networkStats,
			Telemetry: ASSETS.telemetry,
			'VM Stats': ASSETS.vmStats,
			Memory: ASSETS.memory,
			'HTTP & Requests': ASSETS.http,
		}),
		[]
	);

	React.useEffect(() => {
		if (props.metrics) {
			const metricsIndex: Record<string, { metric: any; type: string }> = {};
			for (const type in props.metrics) {
				props.metrics[type].forEach((metric: any) => {
					metricsIndex[metric.name] = { metric, type };
				});
			}

			const updatedGroups: Record<string, Record<string, { metric: any; type: string }>> = {};
			for (const key in HB_METRIC_CATEGORIES) {
				updatedGroups[key] = {};
				for (const subKey of HB_METRIC_CATEGORIES[key]) {
					if (metricsIndex[subKey]) {
						updatedGroups[key][subKey] = metricsIndex[subKey];
					}
				}
			}

			setGroups(updatedGroups);
		}
	}, [props.metrics]);

	React.useEffect(() => {
		if (!activeCategory && categoryKeys.length > 0) {
			setActiveCategory(categoryKeys[0]);
		}
	}, [activeCategory, categoryKeys]);

	const summary = React.useMemo(() => {
		const result: Record<string, number> = {};
		if (!groups) {
			return result;
		}

		categoryKeys.forEach((category) => {
			const categoryGroup = groups[category] || {};
			result[category] = Object.keys(categoryGroup).length;
		});

		return result;
	}, [categoryKeys, groups]);

	const activeGroups = React.useMemo(() => {
		if (!groups || !activeCategory) {
			return {};
		}
		return groups[activeCategory] || {};
	}, [groups, activeCategory]);

	const activeCount = summary[activeCategory] ?? 0;
	const visibleCategories = categoryKeys;

	function getSubGroups(metric: any, metricRegex: RegExp, labelRegex: RegExp) {
		const events: Record<string, any[]> = {};

		metric.values.forEach((value: any) => {
			const match = value.label.match(metricRegex);
			if (match) {
				const group = match[1];
				if (!events[group]) {
					events[group] = [];
				}

				const labelMatch = value.label.match(labelRegex);

				events[group].push({ label: labelMatch ? labelMatch[1] : value.label, data: value.data ?? 0 });
			}
		});

		return events;
	}

	function buildGroupBody(key: string) {
		const metric = activeGroups[key]?.metric;
		if (!metric) {
			return null;
		}

		switch (key) {
			case 'event':
			case 'cowboy_requests_total':
			case 'cowboy_spawned_processes_total':
			case 'cowboy_errors_total':
			case 'cowboy_request_duration_seconds':
			case 'cowboy_receive_body_duration_seconds':
			case 'http_request_duration_seconds':
				let metricRegex: RegExp;
				let labelRegex: RegExp;
				let labelPrefix: string;

				if (key === 'event') {
					metricRegex = /topic="([^"]+)"/;
					labelRegex = /event="([^"]+)"/;
					labelPrefix = 'Topic';
				} else {
					if (key === 'http_request_duration_seconds') {
						metricRegex = /http_method="([^"]+)"/;
						labelRegex = /route="([^"]+)"/;
					} else {
						metricRegex = /method="([^"]+)"/;
						labelRegex = /reason="([^"]+)"/;
					}
					labelPrefix = 'Method';
				}

				const subGroups = getSubGroups(metric, metricRegex, labelRegex);

				return (
					<>
						{Object.keys(subGroups).map((groupKey) => (
							<S.SubGroup key={groupKey}>
								<S.SubGroupHeader>
									<p>{`${labelPrefix}: ${groupKey}`}</p>
								</S.SubGroupHeader>
								<S.SubGroupBody>
									{Object.keys(subGroups[groupKey]).map((element: any, index) => {
										const value = subGroups[groupKey][element];

										return (
											<S.SubGroupLine key={`${value.label}-${index}`}>
												<p>{value.label}</p>
												{value.data !== null && typeof value.data === 'number' && (
													<span>{formatCount(value.data.toString())}</span>
												)}
											</S.SubGroupLine>
										);
									})}
								</S.SubGroupBody>
							</S.SubGroup>
						))}
					</>
				);
		}

		return (
			<>
				{metric.values.map((value: any) => (
					<S.GroupLine key={value.label}>
						<p>{value.label}</p>
						{value.data !== null && <span>{formatCount(value.data.toString())}</span>}
					</S.GroupLine>
				))}
			</>
		);
	}

	if (!props.metrics || !groups || !activeCategory) {
		return (
			<S.LoadingWrapper>
				<Loader sm relative />
			</S.LoadingWrapper>
		);
	}

	return (
		<S.Wrapper>
			<S.Sidebar>
				<S.SidebarContent>
					<S.SidebarHeader>
						<S.SidebarHeaderBody>
							<S.SidebarTitle>Node Metrics</S.SidebarTitle>
							<S.SidebarMeta>Hyperbeam node details</S.SidebarMeta>
						</S.SidebarHeaderBody>
						{categoryKeys.length > 0 && (
							<S.SidebarHeaderLabel>
								<S.SidebarHeaderLabelText>
									<ReactSVG src={ASSETS.filter} />
									<span>Filter by</span>
								</S.SidebarHeaderLabelText>
							</S.SidebarHeaderLabel>
						)}
					</S.SidebarHeader>
					<S.SidebarList>
						{categoryKeys.length === 0 && <S.SidebarEmpty>No categories available</S.SidebarEmpty>}
						{visibleCategories.map((category) => {
							const count = summary[category] ?? 0;
							return (
								<S.SidebarItem
									key={category}
									type={'button'}
									onClick={() => setActiveCategory(category)}
									$active={category === activeCategory}
								>
									<S.SidebarItemInner $active={category === activeCategory}>
										<S.SidebarInfo>
											{CATEGORY_ICONS[category] && (
												<S.SidebarIcon>
													<ReactSVG src={CATEGORY_ICONS[category] as string} />
												</S.SidebarIcon>
											)}
											<S.SidebarLabel>{category}</S.SidebarLabel>
											<S.SidebarDescription>{count ? `${count} metrics` : 'No metrics yet'}</S.SidebarDescription>
										</S.SidebarInfo>
									</S.SidebarItemInner>
								</S.SidebarItem>
							);
						})}
					</S.SidebarList>
				</S.SidebarContent>
			</S.Sidebar>
			<S.Content>
				<S.ContentHeader>
					<S.ContentHeading>
						<S.ContentTitleWrapper>
							{CATEGORY_ICONS[activeCategory] && (
								<S.ContentTitleIcon>
									<ReactSVG src={CATEGORY_ICONS[activeCategory] as string} />
								</S.ContentTitleIcon>
							)}
							<S.ContentTitle>{activeCategory}</S.ContentTitle>
						</S.ContentTitleWrapper>
						<S.ContentMeta>
							{activeCount ? `${activeCount} tracked metrics` : 'No tracked metrics for this category yet'}
						</S.ContentMeta>
					</S.ContentHeading>
				</S.ContentHeader>
				<S.ContentBody className={'scroll-wrapper-hidden'}>
					{Object.keys(activeGroups).length ? (
						Object.keys(activeGroups).map((key) => (
							<S.Group key={key}>
								<S.GroupHeader>
									<p>{key}</p>
								</S.GroupHeader>
								<S.GroupBody>{buildGroupBody(key)}</S.GroupBody>
							</S.Group>
						))
					) : (
						<S.EmptyState>No metric data available for this category.</S.EmptyState>
					)}
				</S.ContentBody>
			</S.Content>
		</S.Wrapper>
	);
}
