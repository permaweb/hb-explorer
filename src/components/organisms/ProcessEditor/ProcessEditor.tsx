import React from 'react';

import { JSONReader } from 'components/molecules/JSONReader';
import { JSONWriter } from 'components/molecules/JSONWriter';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { WalletBlock } from 'wallet/WalletBlock';

import * as S from './styles';

export default function ProcessEditor(props: { processId: string; type: 'read' | 'write' }) {
	const arProvider = useArweaveProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const editorRef = React.useRef(null);

	const [loading, setLoading] = React.useState<boolean>(false);
	const [output, setOutput] = React.useState<any>(null);

	React.useEffect(() => {
		if (editorRef.current) {
			setTimeout(() => {
				editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 10);
		}
	}, []);

	async function handleSubmit(message: object) {
		setLoading(true);
		setOutput({
			Error: 'AO read/write helpers are unavailable because the Permaweb SDK has been removed.',
			Request: message,
		});
		setLoading(false);
	}

	if (props.type === 'write' && !arProvider.wallet) {
		return <WalletBlock />;
	}

	return arProvider.walletAddress ? (
		<S.Wrapper ref={editorRef}>
			<S.EditorWrapper>
				<JSONWriter
					initialData={{
						process: props.processId ?? '',
						data: '',
						tags: [
							{
								name: 'Action',
								value: 'Info',
							},
						],
					}}
					handleSubmit={(message: object) => handleSubmit(message)}
					loading={loading}
				/>
			</S.EditorWrapper>
			<S.ResultWrapper>
				<JSONReader
					data={loading ? { Status: 'Loading...' } : output}
					header={language.response}
					placeholder={loading ? `${language.running}...` : language.runForResponse}
					noFullScreen
				/>
			</S.ResultWrapper>
		</S.Wrapper>
	) : (
		<WalletBlock />
	);
}
