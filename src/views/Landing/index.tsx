import React from 'react';
import { useTheme } from 'styled-components';

import { ViewWrapper } from 'app/styles';
import { Tabs } from 'components/atoms/Tabs';
import { ViewHeader } from 'components/atoms/ViewHeader';
import { ASSETS, HB_ENDPOINTS } from 'helpers/config';
import { formatCount, hbFetch, stripUrlProtocol } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { Console } from './Console';
import { Devices } from './Devices';
import { Ledger } from './Ledger';
import { Metrics } from './Metrics';
import * as S from './styles';

export default function Landing() {
	const theme = useTheme();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const uptimeRef = React.useRef<HTMLParagraphElement>(null);

	const [executions, setExecutions] = React.useState<string>('-');
	const [systemLoad, setSystemLoad] = React.useState<string>('-');
	const [reads, setReads] = React.useState<string>('-');
	const [writes, setWrites] = React.useState<string>('-');

	const [metrics, setMetrics] = React.useState<any>(null);

	React.useEffect(() => {
		const header = document.getElementById('navigation-header');
		if (!header) return;

		const handleScroll = () => {
			if (window.scrollY > 0) {
				header.style.borderBottom = `1px solid ${theme.colors.border.primary}`;
			} else {
				header.style.borderBottom = '1px solid transparent';
			}
		};

		window.addEventListener('scroll', handleScroll);
		handleScroll();

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, [theme.colors.border.primary]);

	React.useEffect(() => {
		let seed = 0;
		let startTime = Date.now();
		let rafId: number;

		async function init() {
			const text = await hbFetch(HB_ENDPOINTS.metrics);
			const groups = parseMetrics(text);
			setMetrics(groups);

			const u = groups.gauge?.find((m) => m.name === 'process_uptime_seconds')?.values[0].data;
			if (u == null) return;

			seed = u;
			if (uptimeRef.current) {
				uptimeRef.current.textContent = formatCount(seed.toString());
			}
			startTime = Date.now();

			function animate() {
				const elapsed = (Date.now() - startTime) / 1000;
				const current = seed + elapsed;
				if (uptimeRef.current) {
					uptimeRef.current.textContent = formatCount(current.toFixed(2));
				}
				rafId = requestAnimationFrame(animate);
			}
			animate();
		}

		init();
		return () => cancelAnimationFrame(rafId);
	}, []);

	function parseMetrics(text: string) {
		const lines = text.split('\n');
		const groups: any = {};
		let currentMetric = null;

		lines.forEach((line) => {
			line = line.trim();
			if (!line) return;

			if (line.startsWith('# TYPE')) {
				const parts = line.split(/\s+/);
				const metricName = parts[2];
				const metricType = parts[3];

				if (!groups[metricType]) {
					groups[metricType] = [];
				}

				currentMetric = {
					name: metricName,
					help: '',
					values: [],
				};

				groups[metricType].push(currentMetric);
			} else if (line.startsWith('# HELP')) {
				const parts = line.split(/\s+/);
				const metricName = parts[2];
				const helpText = parts.slice(3).join(' ');
				if (currentMetric && currentMetric.name === metricName) {
					currentMetric.help = helpText;
				}
			} else if (line.startsWith('#')) {
				// Skip other comments
			} else {
				if (currentMetric) {
					const match = line.match(/(-?\d+(\.\d+)?)(\s*)$/);
					if (match) {
						let label = currentMetric.name;
						const data = parseFloat(match[1]);

						const inputMatch = line.match(/\{([^}]*)\}/);
						if (inputMatch) {
							label = inputMatch[1];
						}
						if (label === `system_load`) {
							setSystemLoad(formatCount(data.toString()));
						} else if (currentMetric.name === 'event' && label.includes('topic="ao_result",event="ao_result"')) {
							setExecutions(formatCount(data.toString()));
						}

						currentMetric.values.push({ label, data });
					}
				}
			}
		});

		if (groups.counter) {
			const spawnedProcesse = groups.counter.find((item) => item.name === 'cowboy_spawned_processes_total');

			if (spawnedProcesse?.values) {
				const readsHandled =
					spawnedProcesse.values.find((value) =>
						value.label.includes('method="GET",reason="normal",status_class="success"')
					)?.data || 0;

				const writesHandled =
					spawnedProcesse.values.find((value) =>
						value.label.includes('method="POST",reason="normal",status_class="success"')
					)?.data || 0;

				setReads(formatCount(readsHandled.toString()));
				setWrites(formatCount(writesHandled.toString()));
			}
		}

		return groups;
	}

	return (
		<S.Wrapper>
			<S.MetricsWrapper>
				<S.HeaderWrapper>
					<ViewHeader
						header={language.app}
						actions={[
							<S.Subheader>
								<span>{stripUrlProtocol(window.hyperbeamUrl)}</span>
								<S.Indicator />
							</S.Subheader>,
						]}
					/>
				</S.HeaderWrapper>
				<ViewWrapper>
					<S.MetricsBody>
						<S.MetricsRow>
							<S.MetricsSection className={'border-wrapper-alt3 fade-in'}>
								<p>Uptime</p>
								<p ref={uptimeRef} className={'metric-value'}>
									–
								</p>
								<span>Seconds</span>
							</S.MetricsSection>
							<S.MetricsSection className={'border-wrapper-alt3 fade-in'}>
								<p>AO-Core Executions</p>
								<p className={'metric-value'}>{executions}</p>
								<span>Executions</span>
							</S.MetricsSection>
							<S.MetricsSection className={'border-wrapper-alt3 fade-in'}>
								<p>System Load</p>
								<p className={'metric-value'}>{systemLoad}</p>
								<span>CPU Average</span>
							</S.MetricsSection>
						</S.MetricsRow>
						<S.MetricsRow>
							<S.MetricsSection className={'border-wrapper-alt3 fade-in'}>
								<p>Read Requests Handled</p>
								<p className={'metric-value'}>{reads}</p>
								<span>Requests</span>
							</S.MetricsSection>
							<S.MetricsSection className={'border-wrapper-alt3 fade-in'}>
								<p>Write Requests Handled</p>
								<p className={'metric-value'}>{writes}</p>
								<span>Requests</span>
							</S.MetricsSection>
						</S.MetricsRow>
					</S.MetricsBody>
				</ViewWrapper>
			</S.MetricsWrapper>
			<S.TabsWrapper>
				<Tabs onTabClick={() => {}} type={'alt1'}>
					<S.Tab label={'Metrics'}>
						<Metrics metrics={metrics} />
					</S.Tab>
					<S.Tab label={'Console'}>
						<Console />
					</S.Tab>
					<S.Tab label={'Devices'}>
						<Devices />
					</S.Tab>
					<S.Tab label={'Ledger'}>
						<Ledger />
					</S.Tab>
				</Tabs>
			</S.TabsWrapper>
			<S.Graphic>
				<video src={ASSETS.graphic} autoPlay loop muted playsInline />
			</S.Graphic>
		</S.Wrapper>
	);
}
