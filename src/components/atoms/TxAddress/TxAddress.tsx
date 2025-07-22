import React from 'react';

import { formatAddress } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';
import { IProps } from './types';

export default function TxAddress(props: IProps) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [copied, setCopied] = React.useState<boolean>(false);

	const copyAddress = React.useCallback(
		async (e: any) => {
			if (props.address) {
				if (props.address.length > 0) {
					e.stopPropagation();
					await navigator.clipboard.writeText(props.address);
					setCopied(true);
					setTimeout(() => setCopied(false), 2000);
				}
			}
		},
		[props.address]
	);

	return (
		<>
			<S.Wrapper disabled={copied} onClick={copied ? () => {} : (e) => copyAddress(e)}>
				<p>{copied ? `${language.copied}!` : formatAddress(props.address, props.wrap)}</p>
			</S.Wrapper>
		</>
	);
}
