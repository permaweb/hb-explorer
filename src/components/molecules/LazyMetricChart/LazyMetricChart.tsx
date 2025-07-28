import React, { lazy, Suspense } from 'react';
import { Loader } from 'components/atoms/Loader';
import { MetricDataPoint } from 'helpers/types';

const MetricChart = lazy(() => import('components/molecules/MetricChart'));

interface LazyMetricChartProps {
	dataList: MetricDataPoint[];
	metric: keyof MetricDataPoint;
	totalField: keyof MetricDataPoint;
	chartLabel: string;
}

export default function LazyMetricChart(props: LazyMetricChartProps) {
	return (
		<Suspense fallback={<Loader sm relative />}>
			<MetricChart {...props} />
		</Suspense>
	);
}
