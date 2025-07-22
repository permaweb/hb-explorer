import React from 'react';

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
				const result = await fetch(`${props.node.prefix}/~meta@1.0/info/address`);
				setHealthy(result.status === 200);
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
				<S.Indicator />
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

	const [routerUrls] = React.useState<string[]>(['router-1.forward.computer']);
	const [routers, setRouters] = React.useState<any[] | null>(null);

	React.useEffect(() => {
		(async () => {
			if (routerUrls.length === 0) return;

			try {
				for (const routerUrl of routerUrls) {
					const res = await fetch(`https://${routerUrl}/~router@1.0/routes/serialize~json@1.0`);
					const parsed = (await res.json())['1'];
					const groups = makeScoreGroups(parsed.nodes);

					setRouters((prev) => [...(prev ?? []), { name: routerUrl, groups }]);
				}
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

	console.log(routers);

	return (
		<S.Wrapper>
			{routers ? (
				routers.map((router, index) => {
					return (
						<S.RouterWrapper key={index}>
							<S.RouterBody>
								{router.groups.map((rowNodes, rowIndex) => (
									<S.NodeRow count={rowNodes.length} key={rowIndex}>
										{rowNodes.map((node: any, index: number) => {
											const nodeIndex = rowIndex * 3 + index + 1;
											return <Node key={nodeIndex} index={nodeIndex} node={node} />;
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
		</S.Wrapper>
	);
}
