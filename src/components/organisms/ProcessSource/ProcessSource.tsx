import React from 'react';

import { Loader } from 'components/atoms/Loader';
import { Editor } from 'components/molecules/Editor';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress } from 'helpers/utils';

import * as S from './styles';

export default function ProcessSource(props: { processId: string; onBoot?: string }) {
	const editorRef = React.useRef(null);

	const [src, setSrc] = React.useState<string | null>(null);

	React.useEffect(() => {
		(async function () {
			if (props.processId && checkValidAddress(props.processId)) {
				try {
					if (props.onBoot && checkValidAddress(props.onBoot)) {
						const srcResponse = await fetch(getTxEndpoint(props.onBoot));
						const rawSrc = await srcResponse.text();
						setSrc(rawSrc);
					} else {
						setSrc('No source found');
					}
				} catch (e: any) {
					console.error(e);
				}
			}
		})();
	}, [props.processId]);

	React.useEffect(() => {
		if (src && editorRef.current) {
			setTimeout(() => {
				editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 10);
		}
	}, [src]);

	return src ? (
		<S.Wrapper ref={editorRef}>
			<Editor initialData={src} language={'lua'} readOnly loading={!src} />
		</S.Wrapper>
	) : (
		<Loader sm relative />
	);
}
