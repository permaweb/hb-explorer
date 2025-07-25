import React from 'react';
import { ReactSVG } from 'react-svg';

import { ASSETS } from 'helpers/config';
import { formatAddress } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';
import { IProps } from './types';

export default function Copyable(props: IProps) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [copied, setCopied] = React.useState<boolean>(false);

	const copyAddress = React.useCallback(
		async (e: any) => {
			if (props.value) {
				if (props.value.length > 0) {
					e.stopPropagation();
					await navigator.clipboard.writeText(props.value);
					setCopied(true);
					setTimeout(() => setCopied(false), 2000);
				}
			}
		},
		[props.value]
	);

	function getDisplayValue() {
		if (props.format) {
			switch (props.format) {
				case 'truncate':
					return `${props.value.substring(0, 36)}...`;
				case 'address':
					return formatAddress(props.value, props.wrap);
			}
		}
		return formatAddress(props.value, props.wrap);
	}

	return (
		<>
			<S.Wrapper disabled={copied} onClick={copied ? () => {} : (e) => copyAddress(e)}>
				{props.helpText && <span>{props.helpText}:</span>}
				<p>{copied ? `${language.copied}!` : getDisplayValue()}</p>
				<ReactSVG src={ASSETS.copy} />
			</S.Wrapper>
		</>
	);
}
