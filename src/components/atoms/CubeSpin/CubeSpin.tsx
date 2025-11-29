import React from 'react';

import * as S from './styles';
import { ICubeSpin } from './types';

export default function CubeSpin({ size = 100, relative = false, speed = 1 }: ICubeSpin) {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const xRef = React.useRef(0);
	const yRef = React.useRef(0);

	React.useEffect(() => {
		if (!containerRef.current) return;

		const intervalX = setInterval(() => {
			xRef.current = (xRef.current + 2.4 * speed) % 360;
			if (containerRef.current) {
				containerRef.current.style.setProperty('--rotX', `${xRef.current}deg`);
			}
		}, 50);

		const intervalY = setInterval(() => {
			yRef.current = (yRef.current + 2.1 * speed) % 360;
			if (containerRef.current) {
				containerRef.current.style.setProperty('--rotY', `${yRef.current}deg`);
			}
		}, 30);

		return () => {
			clearInterval(intervalX);
			clearInterval(intervalY);
		};
	}, [speed]);

	return (
		<S.Container ref={containerRef} relative={relative} $size={size}>
			<S.Cube>
				<S.Face $face="front" />
				<S.Face $face="back" />
				<S.Face $face="right" />
				<S.Face $face="left" />
				<S.Face $face="top" />
				<S.Face $face="bottom" />
			</S.Cube>
		</S.Container>
	);
}
