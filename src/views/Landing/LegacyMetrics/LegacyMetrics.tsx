import React from 'react';

import LazyMetricChart from 'components/molecules/LazyMetricChart';
import { getTxEndpoint } from 'helpers/endpoints';
import { MetricDataPoint } from 'helpers/types';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function LegacyMetrics() {
	const permawebProvider = usePermawebProvider();

	const [metrics, setMetrics] = React.useState<MetricDataPoint[] | null>(null);

	React.useEffect(() => {
		(async function () {
			try {
				const response = await permawebProvider.libs.getGQLData({
					owners: ['yqRGaljOLb2IvKkYVa87Wdcc8m_4w6FI58Gej05gorA'],
					recipients: ['vdpaKV_BQNISuDgtZpLDfDlMJinKHqM3d2NWd3bzeSk'],
					tags: [{ name: 'Action', values: ['Update-Stats'] }],
					paginator: 1,
				});

				const updateId = response?.data?.[0]?.node?.id;
				const data = await fetch(getTxEndpoint(updateId));
				const json = await data.json();
				const interval = Array.isArray(json) ? json.slice(-30) : json;
				setMetrics(interval);
			} catch (e: any) {
				console.error(e);
			}
		})();
	}, [permawebProvider.libs]);

	return (
		<S.Wrapper>
			{metrics ? (
				<>
					<LazyMetricChart
						dataList={metrics}
						metric={'tx_count'}
						totalField={'tx_count_rolling'}
						chartLabel={'Total Messages'}
					/>
					<LazyMetricChart
						dataList={metrics}
						metric={'transfer_count'}
						totalField={'transfer_count'}
						chartLabel={'Transfers'}
					/>
					<LazyMetricChart
						dataList={metrics}
						metric={'active_users'}
						totalField={'active_users'}
						chartLabel={'Users'}
					/>
					<LazyMetricChart
						dataList={metrics}
						metric={'active_processes'}
						totalField={'active_processes'}
						chartLabel={'Processes'}
					/>
				</>
			) : (
				<>
					<S.Placeholder className={'border-wrapper-alt3'} />
					<S.Placeholder className={'border-wrapper-alt3'} />
					<S.Placeholder className={'border-wrapper-alt3'} />
					<S.Placeholder className={'border-wrapper-alt3'} />
				</>
			)}
		</S.Wrapper>
	);
}
