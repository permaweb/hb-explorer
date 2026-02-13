// HyperBEAMEdge Graph Script - Complete Implementation
// Converted from JavaScript to TypeScript module

import { STYLING } from 'helpers/config';

declare global {
	interface Window {
		GraphController: any;
		THREE: any;
		d3: any;
		SpriteText: any;
	}
}

export default function initializeHyperBEAMGraph() {
	const THREE = window.THREE;
	const d3 = window.d3;
	const SpriteText = window.SpriteText;

	// Spacing configuration - adjust this to control overall node spread
	const SPACING_MULTIPLIER = 1.0; // 1.0 = default, 2.0 = double spacing, 0.5 = half spacing

	/**
	 * Utility function to create a circular texture for node rendering
	 */
	function createCircleTexture(
		size: number = 64,
		color: number | string = 0xffffff,
		border: boolean = false,
		borderColor: number | string = 0x000000
	): any {
		// Use higher resolution for crisp textures on high-DPI displays
		const pixelRatio = window.devicePixelRatio || 1;
		const actualSize = size * pixelRatio;

		const canvas = document.createElement('canvas');
		canvas.width = actualSize;
		canvas.height = actualSize;
		const context = canvas.getContext('2d')!;

		// Scale context for high-DPI
		context.scale(pixelRatio, pixelRatio);

		context.clearRect(0, 0, size, size);

		const fillColor = typeof color === 'number' ? '#' + color.toString(16).padStart(6, '0') : color;
		const strokeColor = typeof borderColor === 'number' ? '#' + borderColor.toString(16).padStart(6, '0') : borderColor;

		const radius = size / 2 - 2;
		context.beginPath();
		context.arc(size / 2, size / 2, radius, 0, 2 * Math.PI, false);
		context.fillStyle = fillColor;
		context.fill();

		if (border) {
			context.lineWidth = 1;
			context.strokeStyle = strokeColor;
			context.stroke();
		}

		const texture = new THREE.CanvasTexture(canvas);
		texture.needsUpdate = true;
		return texture;
	}

	/**
	 * ThemeManager - Handles configuration and visual styling
	 */
	class ThemeManager {
		config: any;
		themeObj: any;
		editorColors: any;

		constructor(themeObj?: any) {
			this.themeObj = themeObj;
			this.editorColors = themeObj?.colors?.editor || {};

			this.config = {
				nodeSize: {
					simple: 20,
					composite: 20,
				},
				colors: {
					background: themeObj?.colors?.container?.alt1?.background
						? parseInt(themeObj.colors.container.alt1.background.replace('#', ''), 16)
						: 0xf9f9f9,
					simpleNode: this.editorColors.alt4 ? parseInt(this.editorColors.alt4.replace('#', ''), 16) : 0x6495ed,
					compositeNode: this.editorColors.primary
						? parseInt(this.editorColors.primary.replace('#', ''), 16)
						: 0xf08080,
					highlight: this.editorColors.alt6 ? parseInt(this.editorColors.alt6.replace('#', ''), 16) : 0xffa500,
					selectedNode: this.editorColors.alt1 ? parseInt(this.editorColors.alt1.replace('#', ''), 16) : 0xff5500,
					neighborNode: this.editorColors.alt5 ? parseInt(this.editorColors.alt5.replace('#', ''), 16) : 0x4caf50,
					link: themeObj?.colors?.border?.alt2 ? parseInt(themeObj.colors.border.alt2.replace('#', ''), 16) : 0xcccccc,
					activeLink: this.editorColors.alt2 ? parseInt(this.editorColors.alt2.replace('#', ''), 16) : 0x333333,
					hover: this.editorColors.alt7 ? parseInt(this.editorColors.alt7.replace('#', ''), 16) : 0xfafa33,
				},
				showLabels: true,
				physicsEnabled: true,
				defaultDistance: 150,
				highConnectionThreshold: 10,
				zoomLevel: {
					default: 1.0,
					focused: 2.5,
				},
				zPos: {
					line: 0,
					node: 5,
					label: 10,
				},
			};
		}

		getNodeColor(nodeType: string, state: string = 'default'): number {
			switch (state) {
				case 'selected':
					return this.config.colors.selectedNode;
				case 'neighbor':
					return this.config.colors.neighborNode;
				case 'hover':
					return this.config.colors.hover;
				case 'highlight':
					return this.config.colors.highlight;
				case 'active':
					return this.config.colors.hover; // Use hover color (alt7) for active nodes
				default:
					return nodeType === 'composite' ? this.config.colors.compositeNode : this.config.colors.simpleNode;
			}
		}

		getLinkColor(isActive: boolean = false): number {
			return isActive ? this.config.colors.activeLink : this.config.colors.link;
		}

		getNodeSize(nodeType: string): number {
			return this.config.nodeSize[nodeType as keyof typeof this.config.nodeSize] || this.config.nodeSize.simple;
		}
	}

	/**
	 * SceneManager - Manages THREE.js scene, camera, renderer, lighting
	 */
	class SceneManager {
		container: HTMLElement;
		themeManager: ThemeManager;
		scene: any;
		camera: any;
		renderer: any;
		controls: any;
		raycaster: any;
		mouse: any;
		frustum: any;
		projScreenMatrix: any;
		tmpVector: any;
		enableFrustumCulling: boolean;
		frustumCullingDistance: number;
		graphController: any;

		constructor(container: HTMLElement, themeManager: ThemeManager) {
			this.container = container;
			this.themeManager = themeManager;

			// Three.js components
			this.scene = null;
			this.camera = null;
			this.renderer = null;
			this.controls = null;
			this.raycaster = new THREE.Raycaster();
			this.mouse = new THREE.Vector2();

			// Performance optimization
			this.frustum = new THREE.Frustum();
			this.projScreenMatrix = new THREE.Matrix4();
			this.tmpVector = new THREE.Vector3();
			this.enableFrustumCulling = true;
			this.frustumCullingDistance = 1250;

			this.initScene();
		}

		initScene() {
			const width = this.container.clientWidth;
			const height = this.container.clientHeight;

			// Create scene with background color
			this.scene = new THREE.Scene();
			this.scene.background = new THREE.Color(this.themeManager.config.colors.background);

			// Create perspective camera with wider FOV for better initial view
			const aspectRatio = width / height;
			this.camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 15000); // Increased FOV from 40 to 60
			this.camera.position.z = 750; // Default z position

			// Create renderer
			this.renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: true,
			});
			this.renderer.setSize(width, height);
			this.renderer.setPixelRatio(window.devicePixelRatio || 1);
			this.renderer.setClearColor(this.themeManager.config.colors.background, 1);
			this.renderer.sortObjects = true;

			// Apply border-wrapper-primary styling to canvas
			const canvas = this.renderer.domElement;
			canvas.style.borderRadius = STYLING.dimensions.radius.primary;
			canvas.style.border = this.themeManager.themeObj?.colors?.border?.primary
				? `1px solid ${this.themeManager.themeObj.colors.border.primary}`
				: '1px solid #e8e8e8';
			canvas.style.background = this.themeManager.themeObj?.colors?.container?.primary?.background || '#ffffff';

			this.container.appendChild(canvas);

			// Configure raycaster
			this.raycaster = new THREE.Raycaster();
			this.raycaster.params.Points.threshold = 10;

			// Add orbit controls
			this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
			this.controls.enableDamping = true;
			this.controls.dampingFactor = 0.1;
			this.controls.enableRotate = false;
			this.controls.screenSpacePanning = true;
			this.controls.minDistance = 100;
			this.controls.maxDistance = 15000;

			// Handle window resize
			window.addEventListener('resize', () => this.onWindowResize());
		}

		onWindowResize() {
			const width = this.container.clientWidth;
			const height = this.container.clientHeight;

			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(width, height);
			this.renderer.setPixelRatio(window.devicePixelRatio || 1);
		}

		resetView() {
			this.camera.position.set(0, 0, 750); // Updated to match new initial position
			this.controls.target.set(0, 0, 0);
			this.camera.updateProjectionMatrix();
			this.controls.update();
		}

		addToScene(object: any) {
			this.scene.add(object);
		}

		removeFromScene(object: any) {
			this.scene.remove(object);
		}

		updateMousePosition(event: MouseEvent) {
			const rect = this.renderer.domElement.getBoundingClientRect();
			this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
		}

		getIntersectedObjects(objects: any[]): any[] {
			this.raycaster.setFromCamera(this.mouse, this.camera);
			return this.raycaster.intersectObjects(objects);
		}

		render() {
			this.controls.update();
			this.renderer.render(this.scene, this.camera);
		}

		dispose() {
			if (this.renderer) {
				this.container.removeChild(this.renderer.domElement);
				this.renderer.dispose();
			}
			window.removeEventListener('resize', () => this.onWindowResize());
		}
	}

	/**
	 * Enhanced DataManager - Manages graph data, validation, relationships
	 */
	class DataManager {
		graphData: any;
		graphObjects: any;
		selectedNode: string | null;
		neighborNodes: Set<string>;
		hoveredNode: string | null;
		activeLinks: Set<string>;

		constructor() {
			this.graphData = { nodes: [], links: [] };
			this.graphObjects = {
				nodes: new Map(),
				links: new Map(),
			};
			this.selectedNode = null;
			this.neighborNodes = new Set();
			this.hoveredNode = null;
			this.activeLinks = new Set();
		}

		validateData(data: any): boolean {
			if (!data || !data.nodes || !data.links || !Array.isArray(data.nodes) || !Array.isArray(data.links)) {
				return false;
			}

			if (data.nodes.length === 0) {
				return false;
			}

			return true;
		}

		determineNodeType(nodeId: string): string {
			// Simple heuristic: if the node has many connections, it's composite
			const connections = this.getConnectedLinks(nodeId);
			return connections.length > 5 ? 'composite' : 'simple';
		}

		getConnectedLinks(nodeId: string): any[] {
			return this.graphData.links.filter((link: any) => {
				const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
				const targetId = typeof link.target === 'object' ? link.target.id : link.target;
				return sourceId === nodeId || targetId === nodeId;
			});
		}

		getConnectedNodes(nodeId: string): Set<string> {
			const connected = new Set<string>();
			const links = this.getConnectedLinks(nodeId);

			links.forEach((link: any) => {
				const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
				const targetId = typeof link.target === 'object' ? link.target.id : link.target;

				if (sourceId === nodeId) {
					connected.add(targetId);
				} else if (targetId === nodeId) {
					connected.add(sourceId);
				}
			});

			return connected;
		}

		setSelectedNode(nodeId: string) {
			this.selectedNode = nodeId;
			this.updateNeighborNodes(nodeId);
		}

		clearSelectedNode() {
			this.selectedNode = null;
			this.neighborNodes.clear();
			this.activeLinks.clear();
		}

		setHoveredNode(nodeId: string) {
			this.hoveredNode = nodeId;
		}

		clearHoveredNode() {
			this.hoveredNode = null;
		}

		updateNeighborNodes(nodeId: string) {
			this.neighborNodes.clear();
			this.activeLinks.clear();

			this.graphData.links.forEach((link: any) => {
				const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
				const targetId = typeof link.target === 'object' ? link.target.id : link.target;

				if (sourceId === nodeId) {
					this.neighborNodes.add(targetId);
					this.activeLinks.add(`${sourceId}-${targetId}`);
				} else if (targetId === nodeId) {
					this.neighborNodes.add(sourceId);
					this.activeLinks.add(`${sourceId}-${targetId}`);
				}
			});
		}

		storeNodeObject(nodeId: string, nodeObj: any) {
			this.graphObjects.nodes.set(nodeId, nodeObj);
		}

		storeLinkObject(linkId: string, linkObj: any) {
			this.graphObjects.links.set(linkId, linkObj);
		}

		searchNodes(searchTerm: string): string[] {
			if (!searchTerm) return [];

			const lowerTerm = searchTerm.toLowerCase();
			return this.graphData.nodes
				.filter((node: any) => {
					return (
						(node.id && node.id.toLowerCase().includes(lowerTerm)) ||
						(node.label && node.label.toLowerCase().includes(lowerTerm))
					);
				})
				.map((node: any) => node.id);
		}

		getConnectedSubgraph(nodeId: string, depth: number = 2): { nodes: any[]; links: any[] } {
			const visitedNodes = new Set<string>();
			const includedLinks = new Set<string>();
			const nodeQueue: { id: string; currentDepth: number }[] = [{ id: nodeId, currentDepth: 0 }];

			while (nodeQueue.length > 0) {
				const { id: currentNodeId, currentDepth } = nodeQueue.shift()!;

				if (visitedNodes.has(currentNodeId) || currentDepth > depth) {
					continue;
				}

				visitedNodes.add(currentNodeId);

				if (currentDepth < depth) {
					const connectedLinks = this.getConnectedLinks(currentNodeId);

					connectedLinks.forEach((link: any) => {
						const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
						const targetId = typeof link.target === 'object' ? link.target.id : link.target;
						const linkId = `${sourceId}-${targetId}`;

						if (!includedLinks.has(linkId)) {
							includedLinks.add(linkId);
						}

						const neighborId = sourceId === currentNodeId ? targetId : sourceId;
						if (!visitedNodes.has(neighborId)) {
							nodeQueue.push({ id: neighborId, currentDepth: currentDepth + 1 });
						}
					});
				}
			}

			const nodes = this.graphData.nodes.filter((node: any) => visitedNodes.has(node.id));
			const links = this.graphData.links.filter((link: any) => {
				const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
				const targetId = typeof link.target === 'object' ? link.target.id : link.target;
				return includedLinks.has(`${sourceId}-${targetId}`);
			});

			return { nodes, links };
		}
	}

	/**
	 * GraphObjectManager - Creates and manages 3D objects for nodes and links
	 */
	class GraphObjectManager {
		sceneManager: SceneManager;
		themeManager: ThemeManager;
		dataManager: DataManager;
		nodeGeometryCache: Map<string, any>;
		textures: Map<string, any>;
		activeNodeId: string | null;

		constructor(sceneManager: SceneManager, themeManager: ThemeManager, dataManager: DataManager) {
			this.sceneManager = sceneManager;
			this.themeManager = themeManager;
			this.dataManager = dataManager;
			this.nodeGeometryCache = new Map();
			this.textures = new Map();
			this.activeNodeId = null;
		}

		createNodeObject(node: any): any {
			const nodeType = this.dataManager.determineNodeType(node.id);
			const nodeSize = this.themeManager.getNodeSize(nodeType);
			const color = this.themeManager.getNodeColor(nodeType);

			// Create circular texture for the node
			const textureKey = `${color}-${nodeSize}`;
			if (!this.textures.has(textureKey)) {
				this.textures.set(textureKey, createCircleTexture(64, color, true));
			}

			const geometry = new THREE.SphereGeometry(nodeSize, 16, 16);
			const material = new THREE.MeshBasicMaterial({
				color: color,
				transparent: false,
			});

			const sphere = new THREE.Mesh(geometry, material);

			// Check if this is the root node (first node in the graph)
			const isRootNode = this.dataManager.graphObjects.nodes.size === 0;

			let x: number, y: number;

			if (isRootNode) {
				// Position root node at the center
				x = 0;
				y = 0;
			} else {
				// Use compact grid positioning for other nodes
				const nodeCount = this.dataManager.graphData.nodes.length;
				const nodeIndex = this.dataManager.graphObjects.nodes.size;
				const gridSize = Math.ceil(Math.sqrt(nodeCount));
				const spacing = 3 * SPACING_MULTIPLIER; // Very tight spacing

				// Calculate grid position
				const row = Math.floor(nodeIndex / gridSize);
				const col = nodeIndex % gridSize;

				// Center the grid around origin with small randomization
				x = (col - gridSize / 2) * spacing + (Math.random() - 0.5) * spacing * 0.3;
				y = (row - gridSize / 2) * spacing + (Math.random() - 0.5) * spacing * 0.3;
			}

			sphere.position.set(x, y, this.themeManager.config.zPos.node);

			// Add label
			if (this.themeManager.config.showLabels && node.label) {
				const sprite = new SpriteText(node.label);

				// Use theme colors for labels
				const fontColor = this.themeManager.themeObj?.colors?.font?.light1 || '#333333';
				const bgColor = this.themeManager.themeObj?.colors?.container?.alt8?.background || 'rgba(255, 255, 255, 0.9)';
				const borderColor = this.themeManager.themeObj?.colors?.border?.alt4 || 'rgba(0, 0, 0, 0.1)';

				sprite.color = fontColor;
				sprite.textHeight = 12;
				sprite.fontFace =
					this.themeManager.themeObj?.typography?.family?.alt2 ||
					'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
				sprite.fontWeight = '600';
				sprite.resolution = Math.max(window.devicePixelRatio * 2, 4); // Higher resolution for crisp text
				sprite.backgroundColor = bgColor;
				sprite.borderWidth = 1;
				sprite.borderColor = borderColor;
				sprite.borderRadius = 5;
				sprite.padding = 5;
				sprite.position.set(0, nodeSize + 25, this.themeManager.config.zPos.label);
				sphere.add(sprite);
			}

			// Store references
			sphere.userData = {
				nodeId: node.id,
				nodeData: node,
				type: 'node',
			};

			this.sceneManager.addToScene(sphere);

			// Store node with proper simulation coordinates
			const nodeData = {
				...node,
				object: sphere,
				x: sphere.position.x, // Simulation will use these coordinates
				y: sphere.position.y,
				z: sphere.position.z,
				type: nodeType,
			};

			this.dataManager.storeNodeObject(node.id, nodeData);

			return sphere;
		}

		createLinkObject(link: any): any {
			const sourceNode = this.dataManager.graphObjects.nodes.get(link.source);
			const targetNode = this.dataManager.graphObjects.nodes.get(link.target);

			if (!sourceNode || !targetNode) {
				console.warn('Cannot create link: missing source or target node');
				return null;
			}

			const sourcePos = sourceNode.object.position;
			const targetPos = targetNode.object.position;

			// Create line geometry using line z-position from config
			const geometry = new THREE.BufferGeometry();
			const lineZ = this.themeManager.config.zPos.line;
			const vertices = new Float32Array([sourcePos.x, sourcePos.y, lineZ, targetPos.x, targetPos.y, lineZ]);
			geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

			const material = new THREE.LineBasicMaterial({
				color: this.themeManager.getLinkColor(false),
				transparent: false,
			});

			const line = new THREE.Line(geometry, material);
			line.userData = {
				linkId: `${link.source}-${link.target}`,
				sourceId: link.source,
				targetId: link.target,
				type: 'link',
			};

			this.sceneManager.addToScene(line);
			this.dataManager.storeLinkObject(`${link.source}-${link.target}`, {
				...link,
				object: line,
				sourceId: link.source,
				targetId: link.target,
			});

			return line;
		}

		updateNodeAppearance(nodeId: string, state: string = 'default') {
			const nodeObj = this.dataManager.graphObjects.nodes.get(nodeId);
			if (!nodeObj || !nodeObj.object) return;

			const nodeType = nodeObj.type || 'simple';
			const newColor = this.themeManager.getNodeColor(nodeType, state);

			if (nodeObj.object.material) {
				nodeObj.object.material.color.setHex(newColor);
			}
		}

		updateLinkAppearance(linkId: string, isActive: boolean = false) {
			const linkObj = this.dataManager.graphObjects.links.get(linkId);
			if (!linkObj || !linkObj.object) return;

			const newColor = this.themeManager.getLinkColor(isActive);
			linkObj.object.material.color.setHex(newColor);
			// Solid colors only - no opacity changes
		}

		updateLinkPositions() {
			this.dataManager.graphObjects.links.forEach((linkObj: any, linkId: string) => {
				if (!linkObj.object) {
					console.warn('Link object missing for:', linkId);
					return;
				}

				const sourceNode = this.dataManager.graphObjects.nodes.get(linkObj.sourceId);
				const targetNode = this.dataManager.graphObjects.nodes.get(linkObj.targetId);

				if (!sourceNode) {
					console.warn('Source node missing for link:', linkId, 'sourceId:', linkObj.sourceId);
					return;
				}
				if (!targetNode) {
					console.warn('Target node missing for link:', linkId, 'targetId:', linkObj.targetId);
					return;
				}

				if (sourceNode && targetNode && sourceNode.object && targetNode.object) {
					const sourcePos = sourceNode.object.position;
					const targetPos = targetNode.object.position;

					const lineZ = this.themeManager.config.zPos.line;
					const positions = linkObj.object.geometry.attributes.position.array;
					positions[0] = sourcePos.x;
					positions[1] = sourcePos.y;
					positions[2] = lineZ;
					positions[3] = targetPos.x;
					positions[4] = targetPos.y;
					positions[5] = lineZ;

					linkObj.object.geometry.attributes.position.needsUpdate = true;
				}
			});
		}

		highlightNeighbors(nodeId: string) {
			// Reset all nodes to default state, but preserve active node
			this.dataManager.graphObjects.nodes.forEach((nodeObj: any, id: string) => {
				const state = id === this.activeNodeId ? 'active' : 'default';
				this.updateNodeAppearance(id, state);
			});

			// Reset all links to default state
			this.dataManager.graphObjects.links.forEach((linkObj: any, id: string) => {
				this.updateLinkAppearance(id, false);
			});

			// Highlight selected node
			this.updateNodeAppearance(nodeId, 'selected');

			// Highlight neighbors and connecting links
			this.dataManager.neighborNodes.forEach((neighborId: string) => {
				// Don't override active node color with neighbor color
				if (neighborId !== this.activeNodeId) {
					this.updateNodeAppearance(neighborId, 'neighbor');
				}
			});

			this.dataManager.activeLinks.forEach((linkId: string) => {
				this.updateLinkAppearance(linkId, true);
			});
		}

		clearHighlights() {
			this.dataManager.graphObjects.nodes.forEach((nodeObj: any, id: string) => {
				// Keep active node highlighted even when clearing other highlights
				const state = id === this.activeNodeId ? 'active' : 'default';
				this.updateNodeAppearance(id, state);
			});

			this.dataManager.graphObjects.links.forEach((linkObj: any, id: string) => {
				this.updateLinkAppearance(id, false);
			});
		}

		setActiveNode(nodeId: string | null) {
			const previousActive = this.activeNodeId;
			this.activeNodeId = nodeId;

			// Reset previous active node to default
			if (previousActive && previousActive !== nodeId) {
				this.updateNodeAppearance(previousActive, 'default');
			}

			// Set new active node
			if (nodeId) {
				this.updateNodeAppearance(nodeId, 'active');
			}
		}

		toggleLabelsVisibility(showLabels: boolean) {
			// Update all existing nodes to show/hide their labels
			this.dataManager.graphObjects.nodes.forEach((nodeObj: any) => {
				if (nodeObj.object) {
					// Find the label sprite child
					const labelSprite = nodeObj.object.children.find(
						(child: any) => child.type === 'Sprite' || child.constructor.name === 'SpriteText'
					);

					if (labelSprite) {
						labelSprite.visible = showLabels;
					}
				}
			});
		}

		dispose() {
			// Clean up geometries and materials
			this.dataManager.graphObjects.nodes.forEach((nodeObj: any) => {
				if (nodeObj.object) {
					if (nodeObj.object.geometry) nodeObj.object.geometry.dispose();
					if (nodeObj.object.material) nodeObj.object.material.dispose();
					this.sceneManager.removeFromScene(nodeObj.object);
				}
			});

			this.dataManager.graphObjects.links.forEach((linkObj: any) => {
				if (linkObj.object) {
					if (linkObj.object.geometry) linkObj.object.geometry.dispose();
					if (linkObj.object.material) linkObj.object.material.dispose();
					this.sceneManager.removeFromScene(linkObj.object);
				}
			});

			this.textures.forEach((texture: any) => {
				texture.dispose();
			});

			this.nodeGeometryCache.clear();
			this.textures.clear();
		}
	}

	/**
	 * SimulationManager - Handles D3.js force-directed physics simulation
	 */
	class SimulationManager {
		dataManager: DataManager;
		graphObjectManager: GraphObjectManager;
		spatialGrid: SpatialGrid;
		simulation: any;
		isRunning: boolean;
		forces: any;
		animationFrameId: number | null;
		targetPositions: Map<string, { x: number; y: number; z: number }>;
		interpolationSpeed: number;

		constructor(dataManager: DataManager, graphObjectManager: GraphObjectManager, spatialGrid: SpatialGrid) {
			this.dataManager = dataManager;
			this.graphObjectManager = graphObjectManager;
			this.spatialGrid = spatialGrid;
			this.simulation = null;
			this.isRunning = false;
			this.forces = {
				link: null,
				charge: null,
				center: null,
				collision: null,
			};
			this.animationFrameId = null;
			this.targetPositions = new Map();
			this.interpolationSpeed = 0.1; // Smooth interpolation factor (0 = no movement, 1 = instant)

			// Start the smooth animation loop
			this.startSmoothAnimation();
		}

		initializeSimulation() {
			if (!d3) {
				console.warn('D3.js not available for simulation');
				return;
			}

			const nodes = Array.from(this.dataManager.graphObjects.nodes.values());
			const links = this.dataManager.graphData.links;

			// Use parameters similar to original graph.js for better circular clustering
			const linkDistance = Math.max(150, nodes.length * 10); // Adaptive link distance based on node count

			this.simulation = d3
				.forceSimulation(nodes)
				.force(
					'link',
					d3
						.forceLink(links)
						.id((d: any) => d.id)
						.distance(linkDistance)
						.strength(0.1) // Much weaker link force to prevent clustering
				)
				.force(
					'charge',
					d3
						.forceManyBody()
						.strength(-50) // Stronger repulsion to maintain spacing
						.distanceMax(500) // Limit repulsion range
				)
				.force('center', d3.forceCenter(0, 0).strength(0.1)) // Weaker center force
				.force(
					'collision',
					d3
						.forceCollide()
						.radius((d: any) => {
							const nodeType = this.dataManager.determineNodeType(d.id);
							return this.graphObjectManager.themeManager.getNodeSize(nodeType) + 30; // More spacing between nodes
						})
						.strength(1.0)
				)
				.force('x', d3.forceX().strength(0.05)) // Stronger X force to maintain positions
				.force('y', d3.forceY().strength(0.05)) // Stronger Y force to maintain positions
				.alphaDecay(0.05) // Faster decay to settle quickly
				.velocityDecay(0.8); // Higher velocity decay for less movement

			// Store force references
			this.forces.link = this.simulation.force('link');
			this.forces.charge = this.simulation.force('charge');
			this.forces.center = this.simulation.force('center');
			this.forces.collision = this.simulation.force('collision');

			this.simulation.on('tick', () => this.onTick());
			this.simulation.on('end', () => this.onSimulationEnd());
		}

		/**
		 * Start smooth animation loop for interpolating node positions
		 */
		startSmoothAnimation() {
			const animate = () => {
				this.smoothUpdatePositions();
				this.animationFrameId = requestAnimationFrame(animate);
			};
			this.animationFrameId = requestAnimationFrame(animate);
		}

		/**
		 * Smoothly interpolate node positions towards their target positions
		 */
		smoothUpdatePositions() {
			let hasUpdates = false;

			this.dataManager.graphObjects.nodes.forEach((nodeObj: any, nodeId: string) => {
				if (!nodeObj.object) return;

				const target = this.targetPositions.get(nodeId);
				if (!target) return;

				const current = nodeObj.object.position;
				const threshold = 0.1; // Stop interpolating when very close

				// Calculate smooth interpolation
				const deltaX = target.x - current.x;
				const deltaY = target.y - current.y;
				const deltaZ = target.z - current.z;

				// Only update if the distance is significant
				const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
				if (distance > threshold) {
					// Smooth interpolation
					current.x += deltaX * this.interpolationSpeed;
					current.y += deltaY * this.interpolationSpeed;
					current.z += deltaZ * this.interpolationSpeed;

					// Update spatial grid
					this.spatialGrid.updateObject(nodeObj.object, current);
					hasUpdates = true;
				}
			});

			// Update link positions if any nodes moved
			if (hasUpdates) {
				this.graphObjectManager.updateLinkPositions();
			}
		}

		onTick() {
			// Set target positions from simulation instead of directly updating
			this.dataManager.graphObjects.nodes.forEach((nodeObj: any, nodeId: string) => {
				if (nodeObj.object && (nodeObj.x !== undefined || nodeObj.y !== undefined)) {
					// Set smooth target positions from simulation
					this.targetPositions.set(nodeId, {
						x: nodeObj.x || 0,
						y: nodeObj.y || 0,
						z: 0, // Keep 2D for now
					});
				}
			});

			// Note: The smoothUpdatePositions method will handle the actual position updates
			// and link position updates via the smooth animation loop
		}

		onSimulationEnd() {
			this.isRunning = false;
		}

		updateSimulation(restart: boolean = false) {
			if (!this.simulation) {
				this.initializeSimulation();
			}

			const nodes = Array.from(this.dataManager.graphObjects.nodes.values());
			const links = this.dataManager.graphData.links;

			// Update simulation data
			this.simulation.nodes(nodes);
			this.forces.link.links(links);

			// Ensure all link positions are updated with current node positions
			this.graphObjectManager.updateLinkPositions();

			if (restart) {
				this.simulation.alpha(0.5).restart();
				this.isRunning = true;
			} else {
				this.simulation.alpha(0.1).restart();
				this.isRunning = true;
			}
		}

		pauseSimulation() {
			if (this.simulation) {
				this.simulation.stop();
				this.isRunning = false;
			}
		}

		resumeSimulation() {
			if (this.simulation) {
				this.simulation.restart();
				this.isRunning = true;
			}
		}

		adjustForces(options: any = {}) {
			if (!this.simulation) return;

			if (options.linkDistance !== undefined) {
				this.forces.link.distance(options.linkDistance);
			}

			if (options.linkStrength !== undefined) {
				this.forces.link.strength(options.linkStrength);
			}

			if (options.chargeStrength !== undefined) {
				this.forces.charge.strength(options.chargeStrength);
			}

			if (options.collisionRadius !== undefined) {
				this.forces.collision.radius(options.collisionRadius);
			}

			// Restart simulation with new forces
			this.simulation.alpha(0.3).restart();
		}

		focusOnNode(nodeId: string, duration: number = 1000) {
			const nodeObj = this.dataManager.graphObjects.nodes.get(nodeId);
			if (!nodeObj) return;

			// Don't restart simulation for focus, just adjust camera instead
			// The EventManager will handle camera focusing
		}

		getSubgraphSimulation(nodeIds: string[]) {
			const subgraphNodes = nodeIds.map((id) => this.dataManager.graphObjects.nodes.get(id)).filter(Boolean);

			const subgraphLinks = this.dataManager.graphData.links.filter(
				(link: any) => nodeIds.includes(link.source) && nodeIds.includes(link.target)
			);

			return {
				nodes: subgraphNodes,
				links: subgraphLinks,
			};
		}

		dispose() {
			// Stop smooth animation loop
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId);
				this.animationFrameId = null;
			}

			if (this.simulation) {
				this.simulation.stop();
				this.simulation = null;
			}

			this.targetPositions.clear();
			this.isRunning = false;
		}
	}

	/**
	 * EventManager - Handles mouse interactions and user events
	 */
	class EventManager {
		sceneManager: SceneManager;
		dataManager: DataManager;
		graphObjectManager: GraphObjectManager;
		simulationManager: SimulationManager;
		callbacks: Map<string, Function[]>;
		isDragging: boolean;
		dragNode: any;
		mouseDownPosition: any;
		lastClickTime: number;
		doubleClickDelay: number;

		constructor(
			sceneManager: SceneManager,
			dataManager: DataManager,
			graphObjectManager: GraphObjectManager,
			simulationManager: SimulationManager
		) {
			this.sceneManager = sceneManager;
			this.dataManager = dataManager;
			this.graphObjectManager = graphObjectManager;
			this.simulationManager = simulationManager;
			this.callbacks = new Map();
			this.isDragging = false;
			this.dragNode = null;
			this.mouseDownPosition = new THREE.Vector2();
			this.lastClickTime = 0;
			this.doubleClickDelay = 300;

			this.initializeEventListeners();
		}

		initializeEventListeners() {
			const canvas = this.sceneManager.renderer.domElement;

			// Mouse events
			canvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
			canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
			canvas.addEventListener('mouseup', (event) => this.onMouseUp(event));
			canvas.addEventListener('click', (event) => this.onClick(event));
			canvas.addEventListener('dblclick', (event) => this.onDoubleClick(event));

			// Touch events for mobile
			canvas.addEventListener('touchstart', (event) => this.onTouchStart(event));
			canvas.addEventListener('touchmove', (event) => this.onTouchMove(event));
			canvas.addEventListener('touchend', (event) => this.onTouchEnd(event));

			// Wheel/zoom events
			canvas.addEventListener('wheel', (event) => this.onWheel(event));

			// Keyboard events
			document.addEventListener('keydown', (event) => this.onKeyDown(event));
			document.addEventListener('keyup', (event) => this.onKeyUp(event));
		}

		onMouseDown(event: MouseEvent) {
			event.preventDefault();
			this.sceneManager.updateMousePosition(event);
			this.mouseDownPosition.copy(this.sceneManager.mouse);

			const intersectedObjects = this.getIntersectedNodes();
			if (intersectedObjects.length > 0) {
				const nodeObject = intersectedObjects[0].object;
				const nodeData = nodeObject.userData;

				if (nodeData.type === 'node') {
					this.dragNode = nodeData;
					// Don't set isDragging true immediately - wait for actual movement
					this.isDragging = false;

					// Store the initial mouse position and node position
					this.dragNode.initialMousePos = this.sceneManager.mouse.clone();
					this.dragNode.initialNodePos = nodeObject.position.clone();

					// Don't disable controls or fix position until we know it's a real drag
					this.emit('nodeMouseDown', { nodeId: nodeData.nodeId, event });
				}
			}
		}

		onMouseMove(event: MouseEvent) {
			event.preventDefault();
			this.sceneManager.updateMousePosition(event);

			// Check if we should start dragging (mouse moved more than threshold)
			if (this.dragNode && !this.isDragging && this.dragNode.initialMousePos) {
				const mouseDelta = this.sceneManager.mouse.clone().sub(this.dragNode.initialMousePos);
				const dragThreshold = 0.02; // Small threshold to prevent accidental drags on clicks

				if (mouseDelta.length() > dragThreshold) {
					// Start actual dragging
					this.isDragging = true;

					// Disable orbit controls and fix node position
					this.sceneManager.controls.enabled = false;

					if (this.simulationManager.simulation) {
						const nodeObj = this.dataManager.graphObjects.nodes.get(this.dragNode.nodeId);
						if (nodeObj) {
							nodeObj.fx = nodeObj.x;
							nodeObj.fy = nodeObj.y;
						}
					}
				}
			}

			if (this.isDragging && this.dragNode && this.dragNode.initialMousePos && this.dragNode.initialNodePos) {
				// Calculate mouse movement delta in screen space
				const mouseDelta = this.sceneManager.mouse.clone().sub(this.dragNode.initialMousePos);

				// Convert screen delta to world delta
				const camera = this.sceneManager.camera;
				const distance = camera.position.distanceTo(this.dragNode.initialNodePos);
				const worldDelta = new THREE.Vector3(
					mouseDelta.x * distance * 0.001 * camera.aspect,
					mouseDelta.y * distance * 0.001,
					0
				);

				// Apply delta to initial node position
				const worldPosition = this.dragNode.initialNodePos.clone().add(worldDelta);
				const nodeObj = this.dataManager.graphObjects.nodes.get(this.dragNode.nodeId);

				if (nodeObj && nodeObj.object) {
					nodeObj.object.position.x = worldPosition.x;
					nodeObj.object.position.y = worldPosition.y;

					// Update data for simulation
					nodeObj.x = worldPosition.x;
					nodeObj.y = worldPosition.y;
					nodeObj.fx = worldPosition.x;
					nodeObj.fy = worldPosition.y;

					// Update links
					this.graphObjectManager.updateLinkPositions();

					this.emit('nodeDrag', { nodeId: this.dragNode.nodeId, position: worldPosition, event });
				}
			} else {
				// Handle hover effects
				this.handleHover(event);
			}
		}

		onMouseUp(event: MouseEvent) {
			event.preventDefault();

			if (this.isDragging && this.dragNode) {
				// Release node from fixed position
				const nodeObj = this.dataManager.graphObjects.nodes.get(this.dragNode.nodeId);
				if (nodeObj && this.simulationManager.simulation) {
					nodeObj.fx = null;
					nodeObj.fy = null;

					// Only restart simulation if the node was actually moved significantly
					const currentPos = nodeObj.object.position;
					const initialPos = this.dragNode.initialNodePos;
					const distanceMoved = currentPos.distanceTo(initialPos);

					if (distanceMoved > 10) {
						// Only restart if dragged more than 10 units
						this.simulationManager.simulation.alpha(0.05).restart(); // Use very low alpha to minimize movement
					}
				}

				this.emit('nodeMouseUp', { nodeId: this.dragNode.nodeId, event });
			}

			// Re-enable orbit controls and reset drag state
			this.sceneManager.controls.enabled = true;
			this.isDragging = false;
			if (this.dragNode) {
				delete this.dragNode.initialMousePos;
				delete this.dragNode.initialNodePos;
			}
			this.dragNode = null;
		}

		onClick(event: MouseEvent) {
			event.preventDefault();

			const currentTime = Date.now();
			const timeDiff = currentTime - this.lastClickTime;

			// Check if it's a potential double-click
			if (timeDiff < this.doubleClickDelay) {
				return; // Skip single click, wait for double-click
			}

			// Use setTimeout to delay single-click action
			setTimeout(() => {
				const newTimeDiff = Date.now() - this.lastClickTime;
				if (newTimeDiff >= this.doubleClickDelay) {
					this.handleSingleClick(event);
				}
			}, this.doubleClickDelay);

			this.lastClickTime = currentTime;
		}

		handleSingleClick(event: MouseEvent) {
			this.sceneManager.updateMousePosition(event);
			const intersectedObjects = this.getIntersectedNodes();

			if (intersectedObjects.length > 0) {
				const nodeObject = intersectedObjects[0].object;
				const nodeData = nodeObject.userData;

				if (nodeData.type === 'node') {
					this.selectNode(nodeData.nodeId);
					this.emit('nodeClick', { nodeId: nodeData.nodeId, event });
				}
			} else {
				// Clicked on empty space
				this.clearSelection();
				this.emit('backgroundClick', { event });
			}
		}

		onDoubleClick(event: MouseEvent) {
			event.preventDefault();
			this.sceneManager.updateMousePosition(event);

			const intersectedObjects = this.getIntersectedNodes();
			if (intersectedObjects.length > 0) {
				const nodeObject = intersectedObjects[0].object;
				const nodeData = nodeObject.userData;

				if (nodeData.type === 'node') {
					// Focus on double-clicked node
					this.focusOnNode(nodeData.nodeId);
					this.emit('nodeDoubleClick', { nodeId: nodeData.nodeId, event });
				}
			}
		}

		onWheel(event: WheelEvent) {
			// Custom zoom behavior if needed
			this.emit('wheel', { delta: event.deltaY, event });
		}

		onKeyDown(event: KeyboardEvent) {
			switch (event.key) {
				case 'Escape':
					this.clearSelection();
					break;
				case ' ':
					// Spacebar - pause/resume simulation
					event.preventDefault();
					if (this.simulationManager.isRunning) {
						this.simulationManager.pauseSimulation();
					} else {
						this.simulationManager.resumeSimulation();
					}
					break;
				case 'r':
					// Reset camera view
					this.sceneManager.resetView();
					break;
			}

			this.emit('keyDown', { key: event.key, event });
		}

		onKeyUp(event: KeyboardEvent) {
			this.emit('keyUp', { key: event.key, event });
		}

		// Touch events for mobile support
		onTouchStart(event: TouchEvent) {
			if (event.touches.length === 1) {
				const mouseEvent = this.touchToMouseEvent(event.touches[0], 'mousedown');
				this.onMouseDown(mouseEvent);
			}
		}

		onTouchMove(event: TouchEvent) {
			if (event.touches.length === 1) {
				const mouseEvent = this.touchToMouseEvent(event.touches[0], 'mousemove');
				this.onMouseMove(mouseEvent);
			}
		}

		onTouchEnd(event: TouchEvent) {
			const mouseEvent = {
				preventDefault: () => event.preventDefault(),
				clientX: 0,
				clientY: 0,
			} as MouseEvent;
			this.onMouseUp(mouseEvent);
		}

		touchToMouseEvent(touch: Touch, type: string): MouseEvent {
			return {
				type,
				preventDefault: () => {},
				clientX: touch.clientX,
				clientY: touch.clientY,
			} as MouseEvent;
		}

		handleHover(event: MouseEvent) {
			const intersectedObjects = this.getIntersectedNodes();

			if (intersectedObjects.length > 0) {
				const nodeObject = intersectedObjects[0].object;
				const nodeData = nodeObject.userData;

				if (nodeData.type === 'node' && this.dataManager.hoveredNode !== nodeData.nodeId) {
					// Clear previous hover (restore appropriate state)
					if (this.dataManager.hoveredNode) {
						this.restoreNodeState(this.dataManager.hoveredNode);
					}

					// Set new hover (but don't override active node color)
					this.dataManager.setHoveredNode(nodeData.nodeId);
					const isActiveNode = this.graphObjectManager.activeNodeId === nodeData.nodeId;
					if (!isActiveNode) {
						this.graphObjectManager.updateNodeAppearance(nodeData.nodeId, 'hover');
					}
					this.sceneManager.renderer.domElement.style.cursor = 'pointer';

					this.emit('nodeHover', { nodeId: nodeData.nodeId, event });
				}
			} else {
				// Clear hover (restore appropriate state)
				if (this.dataManager.hoveredNode) {
					this.restoreNodeState(this.dataManager.hoveredNode);
					this.dataManager.clearHoveredNode();
					this.sceneManager.renderer.domElement.style.cursor = 'default';
					this.emit('nodeHoverOut', { event });
				}
			}
		}

		restoreNodeState(nodeId: string) {
			// Determine the appropriate state for this node
			let state = 'default';

			if (this.graphObjectManager.activeNodeId === nodeId) {
				state = 'active';
			} else if (this.dataManager.selectedNode === nodeId) {
				state = 'selected';
			} else if (this.dataManager.neighborNodes.has(nodeId)) {
				state = 'neighbor';
			}

			this.graphObjectManager.updateNodeAppearance(nodeId, state);
		}

		getIntersectedNodes(): any[] {
			const nodeObjects = Array.from(this.dataManager.graphObjects.nodes.values())
				.map((nodeObj) => (nodeObj as any).object)
				.filter(Boolean);

			return this.sceneManager.getIntersectedObjects(nodeObjects);
		}

		screenToWorldPosition(screenPosition: any): any {
			// Use raycaster for more accurate screen-to-world conversion
			this.sceneManager.raycaster.setFromCamera(screenPosition, this.sceneManager.camera);

			// Create a plane at z=0 for intersection
			const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
			const worldPosition = new THREE.Vector3();

			// Get intersection with the z=0 plane
			const intersectionPoint = this.sceneManager.raycaster.ray.intersectPlane(plane, worldPosition);

			if (intersectionPoint) {
				return intersectionPoint;
			}

			// Fallback to the original method if plane intersection fails
			const vector = new THREE.Vector3(screenPosition.x, screenPosition.y, 0);
			vector.unproject(this.sceneManager.camera);

			const direction = vector.sub(this.sceneManager.camera.position).normalize();
			const distance = -this.sceneManager.camera.position.z / direction.z;
			return this.sceneManager.camera.position.clone().add(direction.multiplyScalar(distance));
		}

		selectNode(nodeId: string) {
			this.dataManager.setSelectedNode(nodeId);
			this.graphObjectManager.highlightNeighbors(nodeId);

			// Don't automatically focus on single click to avoid jumpy behavior
		}

		clearSelection() {
			this.dataManager.clearSelectedNode();
			this.graphObjectManager.clearHighlights();
		}

		focusOnNode(nodeId: string, zoomLevel: number = 2.5) {
			const nodeObj = this.dataManager.graphObjects.nodes.get(nodeId);
			if (!nodeObj || !nodeObj.object) return;

			const targetPosition = nodeObj.object.position.clone();

			// Animate camera to focus on node
			const camera = this.sceneManager.camera;
			const controls = this.sceneManager.controls;

			// Set target for controls
			controls.target.copy(targetPosition);

			// Move camera closer
			const direction = camera.position.clone().sub(targetPosition).normalize();
			const distance = 200 / zoomLevel;
			camera.position.copy(targetPosition).add(direction.multiplyScalar(distance));

			controls.update();
		}

		// Event system
		on(eventName: string, callback: Function) {
			if (!this.callbacks.has(eventName)) {
				this.callbacks.set(eventName, []);
			}
			this.callbacks.get(eventName)!.push(callback);
		}

		off(eventName: string, callback: Function) {
			if (this.callbacks.has(eventName)) {
				const callbacks = this.callbacks.get(eventName)!;
				const index = callbacks.indexOf(callback);
				if (index > -1) {
					callbacks.splice(index, 1);
				}
			}
		}

		emit(eventName: string, data: any = {}) {
			if (this.callbacks.has(eventName)) {
				this.callbacks.get(eventName)!.forEach((callback) => {
					try {
						callback(data);
					} catch (error) {
						console.error(`Error in event callback for ${eventName}:`, error);
					}
				});
			}
		}

		dispose() {
			const canvas = this.sceneManager.renderer.domElement;

			// Remove event listeners
			canvas.removeEventListener('mousedown', this.onMouseDown);
			canvas.removeEventListener('mousemove', this.onMouseMove);
			canvas.removeEventListener('mouseup', this.onMouseUp);
			canvas.removeEventListener('click', this.onClick);
			canvas.removeEventListener('dblclick', this.onDoubleClick);
			canvas.removeEventListener('touchstart', this.onTouchStart);
			canvas.removeEventListener('touchmove', this.onTouchMove);
			canvas.removeEventListener('touchend', this.onTouchEnd);
			canvas.removeEventListener('wheel', this.onWheel);

			document.removeEventListener('keydown', this.onKeyDown);
			document.removeEventListener('keyup', this.onKeyUp);

			this.callbacks.clear();
		}
	}

	/**
	 * SpatialGrid - Performance optimization for large graphs
	 */
	class SpatialGrid {
		gridSize: number;
		cellSize: number;
		grid: Map<string, Set<any>>;
		bounds: { min: any; max: any };

		constructor(gridSize: number = 20, cellSize: number = 100) {
			this.gridSize = gridSize;
			this.cellSize = cellSize;
			this.grid = new Map();
			this.bounds = {
				min: new THREE.Vector3(-1000, -1000, -100),
				max: new THREE.Vector3(1000, 1000, 100),
			};
		}

		getGridKey(x: number, y: number, z: number = 0): string {
			const gridX = Math.floor((x - this.bounds.min.x) / this.cellSize);
			const gridY = Math.floor((y - this.bounds.min.y) / this.cellSize);
			const gridZ = Math.floor((z - this.bounds.min.z) / this.cellSize);
			return `${gridX},${gridY},${gridZ}`;
		}

		addObject(object: any, position: any) {
			const key = this.getGridKey(position.x, position.y, position.z);
			if (!this.grid.has(key)) {
				this.grid.set(key, new Set());
			}
			this.grid.get(key)!.add(object);
			object.gridKey = key;
		}

		removeObject(object: any) {
			if (object.gridKey && this.grid.has(object.gridKey)) {
				this.grid.get(object.gridKey)!.delete(object);
				delete object.gridKey;
			}
		}

		updateObject(object: any, newPosition: any) {
			this.removeObject(object);
			this.addObject(object, newPosition);
		}

		getObjectsInRadius(position: any, radius: number): any[] {
			const objects: any[] = [];
			const cellRadius = Math.ceil(radius / this.cellSize);

			const centerKey = this.getGridKey(position.x, position.y, position.z);
			const [centerX, centerY, centerZ] = centerKey.split(',').map(Number);

			for (let x = centerX - cellRadius; x <= centerX + cellRadius; x++) {
				for (let y = centerY - cellRadius; y <= centerY + cellRadius; y++) {
					for (let z = centerZ - cellRadius; z <= centerZ + cellRadius; z++) {
						const key = `${x},${y},${z}`;
						if (this.grid.has(key)) {
							this.grid.get(key)!.forEach((obj: any) => {
								const distance = position.distanceTo(obj.position);
								if (distance <= radius) {
									objects.push(obj);
								}
							});
						}
					}
				}
			}

			return objects;
		}

		clear() {
			this.grid.clear();
		}
	}

	// Main GraphController class
	class GraphController {
		container: HTMLElement;
		dataManager: DataManager;
		themeManager: ThemeManager;
		sceneManager: SceneManager;
		graphObjectManager: GraphObjectManager;
		spatialGrid: SpatialGrid;
		simulationManager: SimulationManager;
		eventManager: EventManager;
		animationId: number | null;
		fps: number;
		frameCount: number;
		lastTime: number;
		fpsUpdateInterval: number;

		constructor(containerId: string, themeObj?: any) {
			this.container = document.getElementById(containerId) as HTMLElement;
			this.themeManager = new ThemeManager(themeObj);
			this.dataManager = new DataManager();
			this.sceneManager = new SceneManager(this.container, this.themeManager);
			this.graphObjectManager = new GraphObjectManager(this.sceneManager, this.themeManager, this.dataManager);
			this.spatialGrid = new SpatialGrid();
			this.simulationManager = new SimulationManager(this.dataManager, this.graphObjectManager, this.spatialGrid);
			this.eventManager = new EventManager(
				this.sceneManager,
				this.dataManager,
				this.graphObjectManager,
				this.simulationManager
			);
			this.animationId = null;

			// FPS tracking
			this.fps = 0;
			this.frameCount = 0;
			this.lastTime = performance.now();
			this.fpsUpdateInterval = 500; // Update FPS display every 500ms

			// Setup the API
			this.setupAPI();
		}

		setupAPI() {
			// Setup event callbacks for React integration
			this.eventManager.on('nodeClick', (data: any) => {});

			this.eventManager.on('nodeDoubleClick', (data: any) => {});

			this.eventManager.on('backgroundClick', () => {});

			// Start render loop
			this.animate();
		}

		positionNodesCompact() {
			const nodes = Array.from(this.dataManager.graphObjects.nodes.values());

			// Compact grid-like clustering
			const gridSize = Math.ceil(Math.sqrt(nodes.length));
			const spacing = 3 * SPACING_MULTIPLIER; // Very tight spacing

			nodes.forEach((node: any, index: number) => {
				if (node.object) {
					// Calculate grid position
					const row = Math.floor(index / gridSize);
					const col = index % gridSize;

					// Center the grid around origin
					const x = (col - gridSize / 2) * spacing + (Math.random() - 0.5) * spacing * 0.3;
					const y = (row - gridSize / 2) * spacing + (Math.random() - 0.5) * spacing * 0.3;
					const z = (Math.random() - 0.5) * 2; // Small z variation

					node.object.position.x = x;
					node.object.position.y = y;
					node.object.position.z = z;

					// Update spatial grid
					this.spatialGrid.updateObject(node.object, node.object.position);
				}
			});

			// Update link positions after moving nodes
			this.graphObjectManager.updateLinkPositions();

			// Ensure camera is looking at the center and at proper distance
			this.sceneManager.camera.lookAt(0, 0, 0);
			this.sceneManager.controls.target.set(0, 0, 0);
			this.sceneManager.controls.update();
		}

		animate() {
			this.animationId = requestAnimationFrame(() => this.animate());

			// Update FPS calculation
			this.frameCount++;
			const currentTime = performance.now();
			const elapsed = currentTime - this.lastTime;

			// Update FPS every interval
			if (elapsed > this.fpsUpdateInterval) {
				this.fps = Math.round((this.frameCount * 1000) / elapsed);

				// Reset counters
				this.frameCount = 0;
				this.lastTime = currentTime;
			}

			// Note: Link position updates are now handled by the SimulationManager's smooth animation loop
			this.sceneManager.render();
		}

		destroy() {
			// Stop animation loop
			if (this.animationId) {
				cancelAnimationFrame(this.animationId);
			}

			// Clean up managers
			if (this.eventManager) {
				this.eventManager.dispose();
			}

			if (this.simulationManager) {
				this.simulationManager.dispose();
			}

			if (this.graphObjectManager) {
				this.graphObjectManager.dispose();
			}

			if (this.spatialGrid) {
				this.spatialGrid.clear();
			}

			if (this.sceneManager) {
				this.sceneManager.dispose();
			}

			// Clear data
			if (this.dataManager) {
				this.dataManager.graphData = { nodes: [], links: [] };
				this.dataManager.graphObjects.nodes.clear();
				this.dataManager.graphObjects.links.clear();
				this.dataManager.clearSelectedNode();
				this.dataManager.clearHoveredNode();
			}

			// Clear container
			if (this.container) {
				this.container.innerHTML = '';
			}
		}
	}

	(window as any).GraphController = GraphController;
}
