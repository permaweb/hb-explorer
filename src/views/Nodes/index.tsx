import React from 'react';

import { ViewWrapper } from 'app/styles';
import { ViewHeader } from 'components/atoms/ViewHeader';
import { formatCount } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

function Node(props: { index: number; node: any }) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [healthy, setHealthy] = React.useState<boolean | null>(null);

	React.useEffect(() => {
		(async function () {
			if (props.node) {
				try {
					const result = await fetch(`${props.node.prefix}/~meta@1.0/info/address`);
					setHealthy(result.ok);
				} catch (e: any) {
					console.error(e);
					setHealthy(false);
				}
			}
		})();
	}, [props.node]);

	function getHealthStatus() {
		if (healthy === null) {
			return <span>{`${language.checking}...`}</span>;
		}

		return (
			<>
				<span>{healthy ? language.healthy : language.unhealthy}</span>
				<S.Indicator status={healthy ? 'healthy' : 'unhealthy'} />
			</>
		);
	}

	return props.node ? (
		<S.NodeWrapper href={props.node.prefix} target={'_blank'} key={props.node.reference}>
			<S.NodeHeader>
				<p>
					<span>{`${props.index}. `}</span>
					{props.node.prefix}
				</p>
				<S.IndicatorWrapper>{getHealthStatus()}</S.IndicatorWrapper>
			</S.NodeHeader>
			<S.NodeBody>
				<S.NodeLine>
					<span>Price:</span>
					<p>{formatCount(props.node.price?.toString() ?? '0')}</p>
					<span>ARM</span>
				</S.NodeLine>
				<S.NodeLine>
					<span>Performance:</span>
					<p>{formatCount(props.node.performance?.toString() ?? '0')}</p>
				</S.NodeLine>
			</S.NodeBody>
		</S.NodeWrapper>
	) : null;
}

export default function Nodes() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [routerUrls] = React.useState<string[]>(['forward.computer']);
	const [routers, setRouters] = React.useState<any[] | null>(null);

	React.useEffect(() => {
		if (routerUrls.length === 0) {
			setRouters([]);
			return;
		}

		(async () => {
			try {
				const routersData = await Promise.all(
					routerUrls.map(async (routerUrl) => {
						const res = await fetch(`https://${routerUrl}/~router@1.0/routes/serialize~json@1.0`);
						const nodesConfig = await res.json();

						// Check if nodesConfig is an object with routes
						if (!nodesConfig || typeof nodesConfig !== 'object') {
							console.warn(`Invalid response from ${routerUrl}:`, nodesConfig);
							return {
								name: routerUrl,
								groups: [],
							};
						}

						// 1) Extract all nodes from all routes and flatten into a single array
						const flatNodes: any[] = [];
						Object.keys(nodesConfig).forEach((key) => {
							const route = nodesConfig[key];
							if (route && route.nodes && Array.isArray(route.nodes)) {
								flatNodes.push(...route.nodes);
							}
						});

						// 2) dedupe by prefix using a Map so we keep the full object
						const uniqueMap = new Map<string, any>();
						flatNodes.forEach((node) => {
							if (node && node.prefix && !uniqueMap.has(node.prefix)) {
								uniqueMap.set(node.prefix, node);
							}
						});
						const uniqueNodes = Array.from(uniqueMap.values());

						// 3) group the **objects**, not just the strings
						const groups = makeScoreGroups(uniqueNodes);

						return {
							name: routerUrl,
							groups,
						};
					})
				);

				setRouters(routersData);
			} catch (e) {
				console.error(e);
			}
		})();
	}, [routerUrls]);

	function makeScoreGroups<T>(arr: T[]): T[][] {
		const groups: T[][] = [];
		const rem = arr.length % 3;
		let i = 0;

		if (rem !== 0) {
			groups.push(arr.slice(0, rem));
			i = rem;
		}

		while (i < arr.length) {
			groups.push(arr.slice(i, i + 3));
			i += 3;
		}

		return groups;
	}

	return (
		<S.Wrapper>
			<S.HeaderWrapper>
				<ViewHeader header={language.nodes} />
			</S.HeaderWrapper>
			<S.BodyWrapper>
				<ViewWrapper>
					{routers ? (
						routers.map((router, index) => {
							return (
								<S.RouterWrapper key={index}>
									<S.RouterBody>
										{router.groups.map((rowNodes, rowIndex) => (
											<S.NodeRow count={rowNodes.length} key={rowIndex}>
												{rowNodes.map((node: any, index: number) => {
													const nodeIndex = rowIndex * 3 + index + 1;
													return <Node key={`${router.name}-${node.prefix}`} index={nodeIndex} node={node} />;
												})}
											</S.NodeRow>
										))}
									</S.RouterBody>
									<S.RouterFooter>
										<S.Subheader>
											<span>{router.name}</span>
										</S.Subheader>
									</S.RouterFooter>
								</S.RouterWrapper>
							);
						})
					) : (
						<S.RouterWrapper>
							<S.Placeholder />
							<S.Placeholder />
							<S.Placeholder />
						</S.RouterWrapper>
					)}
				</ViewWrapper>
			</S.BodyWrapper>
			{/* <S.Graphic>
				<video src={ASSETS.graphic} autoPlay loop muted playsInline />
			</S.Graphic> */}
		</S.Wrapper>
	);
}
