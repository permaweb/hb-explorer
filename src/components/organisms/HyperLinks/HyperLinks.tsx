import React from 'react';

import { Loader } from 'components/atoms/Loader';
import { JSONReader } from 'components/molecules/JSONReader';
import { HB_ENDPOINTS } from 'helpers/config';

import * as S from './styles';

export default function HyperLinks(props: { path: string; onError?: (hasError: boolean) => void }) {
	const [links, setLinks] = React.useState<any>(null);

	React.useEffect(() => {
		(async function () {
			if (props.path) {
				try {
					const cacheRes = await fetch(`${window.hyperbeamUrl}/${props.path}${HB_ENDPOINTS.cache}`);
					if (cacheRes.status === 404 && props.onError) {
						props.onError(true);
						setLinks({});
					} else {
						if (props.onError) props.onError(false);
						setLinks(await cacheRes.json());
					}
				} catch (e: any) {
					console.error(e);
					if (props.onError) props.onError(true);
					setLinks({});
				}
			}
		})();
	}, [props.path]);

	return links ? (
		<S.Wrapper>
			{Object.keys(links).length > 0 ? <JSONReader data={links} header={'Cache'} maxHeight={700} /> : null}
		</S.Wrapper>
	) : (
		<Loader sm relative />
	);
}
