import React from 'react';
import cytoscape from 'cytoscape';
import { useTheme } from 'styled-components';

import * as S from './styles';

const LARGE_NODE_THRESHOLD = 150;

function adjustZoomForNodeCount(cy: any) {
	const count = cy.nodes().length;
	if (count > LARGE_NODE_THRESHOLD) {
		const zoom = Math.max(0.2, Math.min(1, LARGE_NODE_THRESHOLD / count));
		cy.zoom(zoom);
		cy.center();
	} else {
		cy.fit(cy.nodes(), 30);
	}
}

export default function Graph(props: { data: any; handleCallback: (node: any) => void; activeId: string | null }) {
	const theme = useTheme();
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const cyRef = React.useRef<any>(null);

	React.useEffect(() => {
		if (!containerRef.current) return;

		if (cyRef.current) {
			cyRef.current.destroy();
			cyRef.current = null;
		}

		const isLarge = Array.isArray(props.data) && props.data.length > LARGE_NODE_THRESHOLD;

		const styles: any = [
			{
				selector: 'node',
				style: {
					'background-color': theme.colors.button.primary.background,
					'text-valign': 'center',
					'text-halign': 'center',
					height: props.data && props.data.length < 20 ? '4.5px' : '25px',
					width: props.data && props.data.length < 20 ? '4.5px' : '25px',
					'border-width': props.data && props.data.length < 20 ? '0.25px' : '1px',
					'border-color': theme.colors.border.primary,
					'overlay-opacity': 0,
				},
			},
			{
				selector: 'node.active',
				style: {
					'background-color': theme.colors.editor.primary,
					'border-width': 2,
					'border-color': theme.colors.editor.primary,
				},
			},
			{
				selector: 'node:hover',
				style: {
					cursor: 'pointer',
				},
			},
			{
				selector: 'edge',
				style: {
					'line-color': theme.colors.border.primary,
					width: props.data && props.data.length < 20 ? 0.25 : 1.5,
				},
			},
		];

		const cy = cytoscape({
			container: containerRef.current,
			elements: props.data,
			style: styles,
			userPanningEnabled: true,
			userZoomingEnabled: true,
			boxSelectionEnabled: false,
			zoomingEnabled: true,
		});

		cyRef.current = cy;

		const layoutOpts: any = isLarge
			? {
					name: 'cose',
					idealEdgeLength: 80,
					nodeOverlap: 10,
					refresh: 20,
					fit: false,
					animate: false,
			  }
			: {
					name: 'concentric',
					fit: false,
					padding: 30,
					startAngle: (Math.PI * 3) / 2,
					clockwise: true,
					equidistant: false,
					minNodeSpacing: 10,
					avoidOverlap: true,
					nodeDimensionsIncludeLabels: false,
					concentric: (node: any) => node.degree(),
					levelWidth: (nodes: any) => Math.max(1, nodes.maxDegree() / 4),
			  };

		const layout = cy.layout(layoutOpts);
		layout.run();

		adjustZoomForNodeCount(cy);

		if (props.activeId) {
			const activeNode = cy.getElementById(props.activeId);
			if (activeNode) activeNode.addClass('active');
		}

		cy.on('tap', 'node', (event: any) => {
			const target = event.target;
			props.handleCallback(target.data());
		});

		cy.on('mouseover', 'node', function (event: any) {
			const node = event.target;
			cyRef.current.style.cursor = 'pointer';
			node.style('background-color', theme.colors.editor.primary);
		});

		cy.on('mouseout', 'node', function (event: any) {
			const node = event.target;
			cyRef.current.style.cursor = 'default';
			if (node.id() !== props.activeId) {
				switch (node.data().type) {
					case 'root':
						node.style('background-color', theme.colors.editor.alt6);
						break;
					default:
						node.style('background-color', theme.colors.button.primary.background);
						break;
				}
			}
		});

		const resizeObserver = new ResizeObserver(() => {
			cy.resize();
			adjustZoomForNodeCount(cy);
		});
		if (containerRef.current) resizeObserver.observe(containerRef.current);

		return () => {
			resizeObserver.disconnect();
			cy.destroy();
			cyRef.current = null;
		};
	}, [props.data, theme]);

	React.useEffect(() => {
		const cy = cyRef.current;
		if (!cy) return;

		cy.batch(() => {
			cy.nodes().removeClass('active');
			if (props.activeId) {
				const node = cy.getElementById(props.activeId);
				if (node) node.addClass('active');
			}
		});
	}, [props.activeId]);

	return (
		<S.Graph className={'border-wrapper-primary'}>
			<S.CyWrapper ref={(el: HTMLDivElement) => (containerRef.current = el)} />
		</S.Graph>
	);
}
