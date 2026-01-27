import styled from 'styled-components';

export const Container = styled.div<{
	relative: boolean;
	$size: number;
}>`
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: ${(props) => (props.relative ? 'relative' : 'fixed')};
	top: ${(props) => (props.relative ? 'auto' : '0')};
	left: ${(props) => (props.relative ? 'auto' : '0')};
	perspective: 1200px;
	z-index: 11;
	min-height: ${(props) => props.$size * 2}px;
	min-width: ${(props) => props.$size * 2}px;

	--cube-size: ${(props) => props.$size}px;
	--rotX: 0deg;
	--rotY: 0deg;
	--rotZ: 0deg;
`;

export const Cube = styled.div`
	position: absolute;
	left: 50%;
	top: 50%;
	width: var(--cube-size);
	height: var(--cube-size);
	transform-style: preserve-3d;
	transform: translate(-50%, -50%) rotateX(var(--rotX)) rotateY(var(--rotY)) rotateZ(var(--rotZ));
`;

export const Face = styled.div<{ $face: 'front' | 'back' | 'right' | 'left' | 'top' | 'bottom' }>`
	position: absolute;
	left: 0;
	top: 0;
	width: var(--cube-size);
	height: var(--cube-size);
	background: transparent;
	border: 0.5px dashed ${(props) => props.theme.colors.font.primary};
	transform: ${(props) => {
		const halfSize = 'calc(var(--cube-size) / 2)';
		switch (props.$face) {
			case 'front':
				return `rotateY(0deg) translateZ(${halfSize})`;
			case 'back':
				return `rotateY(180deg) translateZ(${halfSize})`;
			case 'right':
				return `rotateY(90deg) translateZ(${halfSize})`;
			case 'left':
				return `rotateY(-90deg) translateZ(${halfSize})`;
			case 'top':
				return `rotateX(90deg) translateZ(${halfSize})`;
			case 'bottom':
				return `rotateX(-90deg) translateZ(${halfSize})`;
			default:
				return `translateZ(${halfSize})`;
		}
	}};
	transform-style: preserve-3d;
`;
