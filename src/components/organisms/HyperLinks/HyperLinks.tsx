import React from 'react';

import { Copyable } from 'components/atoms/Copyable';
import { Loader } from 'components/atoms/Loader';
import { Editor } from 'components/molecules/Editor';
import { Graph } from 'components/molecules/Graph';
import { HB_ENDPOINTS } from 'helpers/config';
import { hbFetch } from 'helpers/utils';

import * as S from './styles';

export default function HyperLinks(props: { id?: string; path: string; onError?: (hasError: boolean) => void }) {
	const [raw, setRaw] = React.useState<any>(null);

	const [activeNode, setActiveNode] = React.useState<any | null>(null);
	const [hyperbuddyData, setHyperbuddyData] = React.useState<any>(null);

	const handleNodeClick = React.useCallback((nodeData: any) => {
		setActiveNode(nodeData);
	}, []);

	React.useEffect(() => {
		(async function () {
			if (props.path) {
				try {
					const cacheRes = await fetch(`${window.hyperbeamUrl}/${props.path}${HB_ENDPOINTS.cache}`);
					if (cacheRes.status === 404 && props.onError) {
						props.onError(true);
						setRaw({});
					} else {
						if (props.onError) props.onError(false);
						setRaw(await cacheRes.json());
					}
				} catch (e: any) {
					console.error(e);
					if (props.onError) props.onError(true);
					setRaw({});
				}
			}
		})();
	}, [props.path]);

	const elements = React.useMemo(
		() =>
			raw
				? [
						...raw.nodes.map((n) => ({
							data: { id: n.id, label: n.label, type: n.type },
						})),
						...raw.links.map((l, i) => ({
							data: {
								id: `e${i}`,
								source: l.source,
								target: l.target,
								label: l.label,
							},
						})),
				  ]
				: [],
		[raw]
	);

	React.useEffect(() => {
		if (elements.length > 0 && !activeNode) {
			setActiveNode(elements[0].data);
		}
	}, [elements, activeNode]);

	React.useEffect(() => {
		(async function () {
			if (activeNode) {
				const hyperbuddyResponse = await hbFetch(`/${activeNode.label}/format~hyperbuddy@1.0`);
				setHyperbuddyData(hyperbuddyResponse);
			}
		})();
	}, [activeNode]);

	return raw ? (
		<>
			{Object.keys(raw).length > 0 ? (
				<S.Wrapper>
					{/* <JSONReader data={raw} header={'Cache'} maxHeight={700} /> */}
					{activeNode && (
						<S.ActiveNodeWrapper className={'border-wrapper-alt3'}>
							<S.ActiveNodeLine>
								<span>Active ID</span>
								<Copyable value={activeNode.label} />
							</S.ActiveNodeLine>
							<S.ActiveNodeLine>
								<span>Type</span>
								<p>{activeNode.type}</p>
							</S.ActiveNodeLine>
						</S.ActiveNodeWrapper>
					)}
					<S.GraphWrapper>
						<Graph data={elements} handleCallback={handleNodeClick} activeId={activeNode?.id} />
					</S.GraphWrapper>
					{hyperbuddyData && <Editor initialData={hyperbuddyData} language={'html'} loading={false} readOnly />}
				</S.Wrapper>
			) : null}
		</>
	) : (
		<Loader sm relative />
	);
}
