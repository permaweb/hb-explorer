import React from 'react';

import { IconButton } from 'components/atoms/IconButton';
import { JSONReader } from 'components/molecules/JSONReader';
import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

const Input = React.forwardRef<
	HTMLDivElement,
	{
		value: string;
		onChange: (v: string) => void;
		placeholder?: string;
		onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
		disabled?: boolean;
	}
>(({ value, onChange, placeholder, onKeyDown, disabled }, forwardedRef) => {
	const ref = React.useRef<HTMLDivElement>(null);
	const isUserInteractingRef = React.useRef<boolean>(false);

	React.useImperativeHandle(forwardedRef, () => ref.current!);

	const [isEmpty, setIsEmpty] = React.useState(value.trim() === '');

	React.useEffect(() => {
		setIsEmpty(value.trim() === '');
	}, [value]);

	React.useEffect(() => {
		if (isUserInteractingRef.current) {
			isUserInteractingRef.current = false;
			return;
		}

		if (ref.current && ref.current.innerText !== value) {
			ref.current.innerText = value;
		}
	}, [value]);

	const handleInput = () => {
		isUserInteractingRef.current = true;
		const text = ref.current?.innerText || '';
		setIsEmpty(text.trim() === '');
		onChange(text);
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
		e.preventDefault();
		const text = e.clipboardData.getData('text/plain');
		document.execCommand('insertText', false, text);
	};

	// React.useEffect(() => {
	// 	// Auto focus on mount
	// 	if (ref.current && !disabled) {
	// 		ref.current.focus();
	// 	}
	// }, [disabled]);

	return (
		<S.Input
			ref={ref}
			contentEditable={!disabled}
			onInput={handleInput}
			onPaste={handlePaste}
			onKeyDown={onKeyDown}
			className={disabled && isEmpty ? 'loading' : isEmpty && !disabled ? 'placeholder' : ''}
			suppressContentEditableWarning
			data-placeholder={disabled && isEmpty ? placeholder : placeholder}
			disabled={disabled}
		/>
	);
});

export default function Console() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const wrapperRef = React.useRef<any>(null);
	const inputRef = React.useRef<HTMLDivElement>(null);
	const resultsRef = React.useRef<HTMLDivElement>(null);

	const [fullScreenMode, setFullScreenMode] = React.useState<boolean>(false);
	const [editorMode, _setEditorMode] = React.useState<boolean>(true);

	const [inputValue, setInputValue] = React.useState<string>('');
	const [commandHistory, setCommandHistory] = React.useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = React.useState<number>(-1);
	const [resultLines, setResultLines] = React.useState<
		Array<{
			text: string;
			rawText?: string;
			type: 'command' | 'output' | 'error' | 'loading' | 'success' | 'splash';
			isHtml?: boolean;
			isJson?: boolean;
			jsonData?: any;
			header?: string;
		}>
	>([]);
	const [loadingMessage, setLoadingMessage] = React.useState<boolean>(false);

	React.useEffect(() => {
		const onFullScreenChange = () => {
			setFullScreenMode(document.fullscreenElement === wrapperRef.current);
		};
		document.addEventListener('fullscreenchange', onFullScreenChange);
		return () => {
			document.removeEventListener('fullscreenchange', onFullScreenChange);
		};
	}, []);

	const toggleFullscreen = React.useCallback(async () => {
		const el = wrapperRef.current!;
		if (!document.fullscreenElement) {
			await el.requestFullscreen?.();
		} else {
			await document.exitFullscreen?.();
		}
	}, []);

	const addResultLine = React.useCallback(
		(
			text: string,
			type: 'command' | 'output' | 'error' | 'loading' | 'success' | 'splash' = 'output',
			isHtml = false,
			rawText?: string,
			isJson = false,
			jsonData?: any,
			header?: string
		) => {
			setResultLines((prev) => [...prev, { text, rawText, type, isHtml, isJson, jsonData, header }]);
			setTimeout(() => {
				if (resultsRef.current) {
					resultsRef.current.scrollTop = resultsRef.current.scrollHeight;
				}
			}, 0);
		},
		[]
	);

	const handleSubmit = React.useCallback(async () => {
		const command = inputValue.trim();

		if (command) {
			setCommandHistory((prev) => [...prev, command]);
			setHistoryIndex(-1);
			await resolveCommand(command);
			setInputValue('');
		}
	}, [inputValue, addResultLine, setCommandHistory, setHistoryIndex, resolveCommand]);

	const handleInputKeyDown = React.useCallback(
		async (e: React.KeyboardEvent<HTMLDivElement>) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				await handleSubmit();
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				setCommandHistory((prev) => {
					if (prev.length === 0) return prev;
					const newIndex = historyIndex === -1 ? prev.length - 1 : Math.max(0, historyIndex - 1);
					setHistoryIndex(newIndex);
					setInputValue(prev[newIndex] || '');
					return prev;
				});
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				if (historyIndex !== -1) {
					const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
					if (newIndex === commandHistory.length - 1 && historyIndex === commandHistory.length - 1) {
						setHistoryIndex(-1);
						setInputValue('');
					} else {
						setHistoryIndex(newIndex);
						setInputValue(commandHistory[newIndex] || '');
					}
				}
			}
		},
		[inputValue, historyIndex, commandHistory, prompt, addResultLine]
	);

	async function resolveCommand(data: string | null) {
		if (data && data.startsWith('.')) {
			const command = data.substring(1);
			switch (command) {
				case 'editor':
					addResultLine('Editor mode not available in this view', 'error');
					return;
				default:
					addResultLine('Command Not Supported', 'error');
					return;
			}
		}

		await sendMessage(data);
	}

	async function sendMessage(data: string | null, outputType?: 'data' | 'prompt') {
		setLoadingMessage(true);
		if (outputType !== 'prompt') {
			addResultLine('Loading...', 'loading');
		}
		try {
			// Parse the command for headers (key==value) and body (body:='...')
			const headers: Record<string, string> = {};
			let bodyContent: string | undefined;
			let pathParts: string[] = [];

			// Split by spaces but preserve quoted strings
			const tokens = data.match(/(?:[^\s']+|'[^']*')+/g) || [];

			for (const token of tokens) {
				if (token.includes('==')) {
					// Parse header: key==value
					const [key, value] = token.split('==');
					headers[key] = value;
				} else if (token.startsWith("body:='") && token.endsWith("'")) {
					// Parse body: body:='...'
					bodyContent = token.slice(7, -1); // Remove body:=' and trailing '
				} else if (token.startsWith('body:=')) {
					// Parse body without quotes: body:=...
					bodyContent = token.slice(6);
				} else {
					// Path component
					pathParts.push(token);
				}
			}

			// Construct the URL from path parts
			const path = pathParts.join(' ');
			let requestUrl: string;

			// Check if path already contains a full URL
			if (path.startsWith('http://') || path.startsWith('https://')) {
				requestUrl = path;
			} else {
				// Otherwise, prepend the hyperbeam URL
				let requestData = path;
				if (!requestData.startsWith('/')) requestData = `/${requestData}`;
				requestUrl = `${window.hyperbeamUrl}${requestData}`;
			}

			// Determine method: POST if there's a body or headers, otherwise GET
			const method = bodyContent || Object.keys(headers).length > 0 ? 'POST' : 'GET';

			const response = await fetch(requestUrl, {
				method,
				headers,
				body: bodyContent,
			});

			setLoadingMessage(false);
			setResultLines((prev) => prev.filter((line) => line.type !== 'loading'));

			addResultLine(`${method} ${requestUrl}`, 'command');
			addResultLine(`Status: ${response.status.toString()}`, response.ok ? 'success' : 'error');

			// Add all response headers as JSONReader
			const headersObj: Record<string, string> = {};
			response.headers.forEach((value, key) => {
				headersObj[key] = value;
			});
			if (Object.keys(headersObj).length > 0) {
				addResultLine('', 'output', false, undefined, true, headersObj, 'Headers');
			}

			// Add response body
			const contentType = response.headers.get('content-type');
			const body = await response.text();
			if (body) {
				if (contentType?.includes('application/json')) {
					try {
						const jsonData = JSON.parse(body);
						addResultLine('', 'output', false, undefined, true, jsonData, 'Body');
					} catch {
						addResultLine(`Body\n${body}`, 'output');
					}
				} else {
					addResultLine(`Body\n${body}`, 'output');
				}
			}
		} catch (e: any) {
			console.error(e);
			setLoadingMessage(false);
			setResultLines((prev) => prev.filter((line) => line.type !== 'loading'));
			addResultLine(e.message || 'Error occurred', 'error');
			setLoadingMessage(false);
		}
	}

	return (
		<S.Wrapper ref={wrapperRef} fullScreenMode={fullScreenMode} useFixedHeight={false}>
			<S.ConsoleWrapper editorMode={false}>
				<S.ResultsWrapper ref={resultsRef} className={'fade-in scroll-wrapper'}>
					<S.SplashScreen className={'fade-in border-wrapper-alt4'}>
						<S.SplashScreenHeader>{`HyperBEAM Console`}</S.SplashScreenHeader>
						<S.SplashScreenLine>
							<p>Explore this node by requesting a path</p>
						</S.SplashScreenLine>
						<S.SplashScreenLine>
							<p>
								{`Node: `}
								<span>{window.hyperbeamUrl}</span>
							</p>
						</S.SplashScreenLine>
						<S.SplashScreenDivider />
						<S.SplashScreenLine>
							<p>{`Examples`}</p>
						</S.SplashScreenLine>
						<S.SplashScreenLine>
							<p>
								{`GET `}
								<span>{`~meta@1.0/info/address`}</span>
							</p>
						</S.SplashScreenLine>
						<S.SplashScreenLine>
							<p>
								{`GET `}
								<span>{`~message@1.0&hello=world&k=v/k`}</span>
							</p>
						</S.SplashScreenLine>
						<S.SplashScreenLine>
							<p>
								{`POST `}
								<span>{`~message@1.0/id require-codec==json@1.0 body:='{"greeting":{"text":"Hello","recipient":"World"}}'`}</span>
							</p>
						</S.SplashScreenLine>
					</S.SplashScreen>
					{resultLines.map((line, index) =>
						line.isJson ? (
							<JSONReader key={index} data={line.jsonData} header={line.header} noWrapper noFullScreen />
						) : line.isHtml ? (
							<S.ResultLine
								key={index}
								className={`result-line ${line.type === 'command' ? 'result-command' : ''} ${
									line.type === 'error' ? 'result-error' : ''
								} ${line.type === 'loading' ? 'result-loading' : ''} ${
									line.type === 'success' ? 'result-success' : ''
								} ${line.type === 'splash' ? 'result-success' : ''}`}
							>
								{line.type === 'loading' && <S.Spinner />}
								{line.type === 'loading' ? (
									<S.LoadingText>{line.text?.replace(/\.\.\.$/g, '') || 'Loading'}</S.LoadingText>
								) : (
									<span dangerouslySetInnerHTML={{ __html: line.text || '\u00A0' }} />
								)}
							</S.ResultLine>
						) : (
							<S.ResultLine
								key={index}
								className={`result-line ${line.type === 'command' ? 'result-command' : ''} ${
									line.type === 'error' ? 'result-error' : ''
								} ${line.type === 'loading' ? 'result-loading' : ''} ${
									line.type === 'success' ? 'result-success' : ''
								} ${line.type === 'splash' ? 'result-success' : ''}`}
							>
								{line.type === 'loading' && <S.Spinner />}
								{line.type === 'loading' ? (
									<S.LoadingText>{line.text?.replace(/\.\.\.$/g, '') || 'Loading'}</S.LoadingText>
								) : (
									<span>{line.text || '\u00A0'}</span>
								)}
							</S.ResultLine>
						)
					)}
				</S.ResultsWrapper>
				<S.InputWrapper
					className={'fade-in border-wrapper-alt3'}
					disabled={loadingMessage && !editorMode}
					onClick={() => inputRef.current?.focus()}
				>
					<Input
						ref={inputRef}
						value={inputValue}
						onChange={(value) => setInputValue(value)}
						onKeyDown={handleInputKeyDown}
						placeholder={loadingMessage ? 'Loading...' : 'Enter Path'}
						disabled={loadingMessage}
					/>
					<S.InputActionsWrapper>
						<S.InputActionsSection>
							<IconButton
								type={'primary'}
								src={ASSETS.fullscreen}
								handlePress={toggleFullscreen}
								dimensions={{
									wrapper: 25,
									icon: 15,
								}}
								tooltip={fullScreenMode ? language.exitFullScreen : language.enterFullScreen}
							/>
						</S.InputActionsSection>
						<S.InputActionsSection>
							<IconButton
								type={'primary'}
								src={ASSETS.send}
								handlePress={handleSubmit}
								dimensions={{
									wrapper: 25,
									icon: 15,
								}}
								disabled={loadingMessage || !inputValue}
								tooltip={language.run}
							/>
						</S.InputActionsSection>
					</S.InputActionsWrapper>
				</S.InputWrapper>
			</S.ConsoleWrapper>
		</S.Wrapper>
	);
}
