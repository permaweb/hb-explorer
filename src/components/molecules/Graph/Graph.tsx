import React from 'react';
import cytoscape from 'cytoscape';
import { useTheme } from 'styled-components';

import * as S from './styles';

export default function Graph(props: { data: any; handleCallback: (node: any) => void; activeId: string | null }) {
	const theme = useTheme();

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
			selector: `node[type = "stamp"]`,
			style: {
				'background-color': theme.colors.editor.alt1,
			},
		},
		{
			selector: `node[type = "root"]`,
			style: {
				'background-color': theme.colors.editor.alt6,
			},
		},
		{
			selector: `node[type = "comment"]`,
			style: {
				'background-color': theme.colors.editor.alt2,
			},
		},
		{
			selector: `node[id = "${props.activeId}"]`,
			style: {
				'background-color': theme.colors.editor.primary,
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

	const cyRef = React.useRef<any>();

	React.useEffect(() => {
		const cy = cytoscape({
			container: cyRef.current,
			elements: props.data,
			style: styles,
			userPanningEnabled: false,
			userZoomingEnabled: false,
		});

		const layout = cy.layout({
			name: 'concentric',
			fit: true,
			padding: 30,
			startAngle: (Math.PI * 3) / 2,
			sweep: undefined,
			clockwise: true,
			equidistant: false,
			minNodeSpacing: 10,
			height: undefined,
			width: undefined,
			avoidOverlap: true,
			nodeDimensionsIncludeLabels: false,
			spacingFactor: undefined,
			concentric: function (node) {
				return node.degree();
			},
			levelWidth: function (nodes) {
				return nodes.maxDegree() / 4;
			},
		});

		layout.run();

		cy.on('click', 'node', function (event) {
			const target = event.target;
			props.handleCallback(target['_private'].data);
		});

		cy.on('tap', 'node', function (event) {
			const target = event.target;
			props.handleCallback(target['_private'].data);
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
					case 'stamp':
						node.style('background-color', theme.colors.editor.alt1);
						break;
					case 'comment':
						node.style('background-color', theme.colors.editor.alt2);
						break;
					case 'root':
						node.style('background-color', theme.colors.editor.alt6);
						break;
					default:
						node.style('background-color', theme.colors.button.primary.background);
						break;
				}
			}
		});

		return () => {
			cy.destroy();
		};
	}, [props.activeId, props.data, theme]);

	return (
		<S.Graph className={'border-wrapper-primary'}>
			<S.CyWrapper ref={cyRef} />
		</S.Graph>
	);
}
