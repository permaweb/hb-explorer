import React from 'react';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { HB_METRIC_CATEGORIES } from 'helpers/config';
import { formatCount } from 'helpers/utils';

import * as S from './styles';

export default function Metrics(props: { metrics: any }) {
	const [activeCategory, setActiveCategory] = React.useState<string>('AO Events');
	const [groups, setGroups] = React.useState<any>(null);

	React.useEffect(() => {
		if (props.metrics) {
			const metricsIndex: any = {};
			for (const type in props.metrics) {
				props.metrics[type].forEach((metric) => {
					metricsIndex[metric.name] = { metric, type };
				});
			}

			const updatedGroups: any = {};
			for (const key in HB_METRIC_CATEGORIES) {
				updatedGroups[key] = {};
				for (const subKey of HB_METRIC_CATEGORIES[key]) {
					if (metricsIndex[subKey]) {
						updatedGroups[key][subKey] = metricsIndex[subKey];
					} else {
					}
				}
			}

			setGroups(updatedGroups);
		}
	}, [props.metrics]);

	function getSubGroups(metric: any, metricRegex: any, labelRegex: any) {
		const events = {};

		metric.values.forEach((value) => {
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
		const metric = groups[activeCategory][key].metric;

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
						{Object.keys(subGroups).map((key) => {
							return (
								<S.SubGroup key={key}>
									<S.SubGroupHeader>
										<p>{`${labelPrefix}: ${key}`}</p>
									</S.SubGroupHeader>
									<S.SubGroupBody>
										{Object.keys(subGroups[key]).map((element: any, index) => {
											const value = subGroups[key][element];

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
							);
						})}
					</>
				);
		}

		return (
			<>
				{metric.values.map((value: any) => {
					return (
						<S.GroupLine key={value.label}>
							<p>{value.label}</p>
							{value.data !== null && <span>{formatCount(value.data.toString())}</span>}
						</S.GroupLine>
					);
				})}
			</>
		);
	}

	return props.metrics && groups ? (
		<S.Wrapper>
			<S.Navigation>
				{Object.keys(HB_METRIC_CATEGORIES).map((category) => {
					return (
						<Button
							key={category}
							type={'primary'}
							label={category}
							handlePress={() => setActiveCategory(category)}
							active={category === activeCategory}
							height={37.5}
							fullWidth
						/>
					);
				})}
			</S.Navigation>
			<S.Body className={'border-wrapper-primary scroll-wrapper-hidden'}>
				{Object.keys(groups[activeCategory]).map((key) => {
					return (
						<S.Group key={key}>
							<S.GroupHeader>
								<p>{key}</p>
							</S.GroupHeader>
							<S.GroupBody>{buildGroupBody(key)}</S.GroupBody>
						</S.Group>
					);
				})}
			</S.Body>
		</S.Wrapper>
	) : (
		<Loader sm relative />
	);
}
