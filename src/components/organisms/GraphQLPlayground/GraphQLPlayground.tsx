import React from 'react';

import { IconButton } from 'components/atoms/IconButton';
import { Editor } from 'components/molecules/Editor';
import { JSONReader } from 'components/molecules/JSONReader';
import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

const DEFAULT_QUERY = `query Transactions {
    transactions(
        first: 10
        tags: [
            { name: "Data-Protocol", values: ["ao"] }
        ]
    ) {
        count
        edges {
            node {
                id
                tags {
                    name
                    value
                }
                owner {
                    address
                }
                block {
                    height
                    timestamp
                }
            }
        }
    }
}`;

const STORAGE_KEY_VARIABLES = (playgroundId: string) => `lunar-gql-variables-${playgroundId}`;
const STORAGE_KEY_SHOW_VARIABLES = (playgroundId: string) => `lunar-gql-show-variables-${playgroundId}`;

export default function GraphQLPlayground(props: {
	playgroundId: string;
	active: boolean;
	initialQuery?: string;
	onQueryChange?: (query: string, queryName?: string) => void;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [query, setQuery] = React.useState<string>(props.initialQuery || DEFAULT_QUERY);
	const [result, setResult] = React.useState<string | null>(null);
	const [loading, setLoading] = React.useState<boolean>(false);
	const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
	const [showVariables, setShowVariables] = React.useState<boolean>(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY_SHOW_VARIABLES(props.playgroundId));
			return stored ? JSON.parse(stored) : false;
		} catch {
			return false;
		}
	});
	const [variables, setVariables] = React.useState<string>(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY_VARIABLES(props.playgroundId));
			return stored || '{}';
		} catch {
			return '{}';
		}
	});
	const wrapperRef = React.useRef<HTMLDivElement>(null);
	const layoutTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

	// Trigger layout recalculation when tab becomes active
	React.useEffect(() => {
		if (props.active) {
			// Clear any pending layout timeout
			if (layoutTimeoutRef.current) {
				clearTimeout(layoutTimeoutRef.current);
			}
			// Trigger layout after a short delay to ensure the display change has taken effect
			// Dispatch a resize event to trigger Monaco's layout recalculation
			layoutTimeoutRef.current = setTimeout(() => {
				window.dispatchEvent(new Event('resize'));
			}, 50);
		}
		return () => {
			if (layoutTimeoutRef.current) {
				clearTimeout(layoutTimeoutRef.current);
			}
		};
	}, [props.active]);

	const toggleFullscreen = React.useCallback(async () => {
		if (!document.fullscreenElement) {
			try {
				await wrapperRef.current?.requestFullscreen();
				setIsFullscreen(true);
			} catch (err) {
				console.error('Error attempting to enable fullscreen:', err);
			}
		} else {
			try {
				await document.exitFullscreen();
				setIsFullscreen(false);
			} catch (err) {
				console.error('Error attempting to exit fullscreen:', err);
			}
		}
	}, []);

	// Listen for fullscreen changes (e.g., user pressing ESC)
	React.useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(document.fullscreenElement === wrapperRef.current);
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);
		return () => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
		};
	}, []);

	// Persist variables when they change
	React.useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY_VARIABLES(props.playgroundId), variables);
		} catch (e) {
			console.error('Failed to save variables:', e);
		}
	}, [variables, props.playgroundId]);

	// Persist showVariables toggle state
	React.useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY_SHOW_VARIABLES(props.playgroundId), JSON.stringify(showVariables));
		} catch (e) {
			console.error('Failed to save showVariables state:', e);
		}
	}, [showVariables, props.playgroundId]);

	React.useEffect(() => {
		if (props.initialQuery !== undefined) {
			setQuery(props.initialQuery);
		}
	}, [props.initialQuery]);

	// Extract query name from GraphQL query
	const extractQueryName = React.useCallback((queryString: string): string | null => {
		// Match "query QueryName" or "mutation MutationName"
		const match = queryString.match(/^\s*(?:query|mutation)\s+([A-Za-z][A-Za-z0-9_]*)/m);
		return match ? match[1] : null;
	}, []);

	React.useEffect(() => {
		if (props.onQueryChange && query !== (props.initialQuery || DEFAULT_QUERY)) {
			const timeoutId = setTimeout(() => {
				const queryName = extractQueryName(query);
				props.onQueryChange(query, queryName || undefined);
			}, 500);
			return () => clearTimeout(timeoutId);
		}
	}, [query, props.onQueryChange, props.initialQuery, extractQueryName]);

	// Prepare query for sending - only wrap if not already wrapped
	const prepareQuery = React.useCallback((queryString: string): string => {
		const trimmed = queryString.trim();

		// Remove comments (both # single line and multi-line) to check the actual query structure
		const withoutComments = trimmed
			.replace(/#[^\n]*/g, '') // Remove # comments
			.replace(/"""[\s\S]*?"""/g, '') // Remove """ multi-line comments
			.trim();

		// Check if query already starts with 'query', 'mutation', or 'subscription' keyword
		// Allow for optional query name and optional variable definitions like ($var: Type!)
		const hasWrapper = /^\s*(?:query|mutation|subscription)(?:\s+[A-Za-z][A-Za-z0-9_]*)?(?:\s*\([^)]*\))?\s*\{/.test(
			withoutComments
		);
		const startsWithBrace = /^\s*\{/.test(withoutComments);

		// If it has proper wrapper or starts with {, use as-is (return original with comments)
		if (hasWrapper || startsWithBrace) {
			return trimmed;
		}

		// Otherwise, wrap it with query {}
		return `query { ${trimmed} }`;
	}, []);

	const executeQuery = React.useCallback(
		async (queryOverride?: string, variablesOverride?: string) => {
			// Use the override query if provided, otherwise use the state query
			// Handle case where an event object might be passed instead of a string
			const queryToExecute = typeof queryOverride === 'string' ? queryOverride : query;
			const variablesToExecute = typeof variablesOverride === 'string' ? variablesOverride : variables;

			if (queryToExecute && typeof queryToExecute === 'string') {
				setResult(null);
				setLoading(true);
				try {
					const preparedQuery = prepareQuery(queryToExecute);

					// Parse variables if they exist
					let parsedVariables = undefined;
					if (variablesToExecute.trim() && variablesToExecute.trim() !== '{}') {
						try {
							const parsed = JSON.parse(variablesToExecute);
							if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
								parsedVariables = parsed;
							}
						} catch (e) {
							console.error('Invalid variables JSON:', e);
						}
					}

					const body: any = { query: preparedQuery };
					if (parsedVariables) {
						body.variables = parsedVariables;
					}

					const graphQLEndpoint = `${window.hyperbeamUrl.replace(/\/$/, '')}/~query@1.0/graphql`;
					const response = await fetch(graphQLEndpoint, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Codec-Device': 'json@1.0',
						},
						body: JSON.stringify(body),
					});

					const data = await response.json();
					setResult(JSON.stringify(data, null, 2));
				} catch (e: any) {
					console.error(e);
					setResult(JSON.stringify({ error: e.message || language.failedToExecuteQuery }, null, 2));
				}
				setLoading(false);
			}
		},
		[query, prepareQuery, variables, language.failedToExecuteQuery]
	);

	return (
		<S.Wrapper ref={wrapperRef} style={{ display: props.active ? 'flex' : 'none' }} isFullscreen={isFullscreen}>
			<S.Container isFullscreen={isFullscreen}>
				<S.EditorWrapper showVariables={showVariables}>
					<S.QueryEditorWrapper showVariables={showVariables}>
						<Editor
							initialData={query}
							language={'graphql'}
							setEditorData={setQuery}
							loading={loading}
							useFixedHeight
							noFullScreen
							noWrapper
							onSubmitShortcut={(currentQuery) => executeQuery(currentQuery)}
						/>
					</S.QueryEditorWrapper>
					{showVariables && (
						<S.VariablesEditorWrapper>
							<Editor
								initialData={variables}
								language={'json'}
								setEditorData={setVariables}
								loading={false}
								useFixedHeight
								noFullScreen
								noWrapper
								onSubmitShortcut={(currentVariables) => executeQuery(query, currentVariables)}
							/>
						</S.VariablesEditorWrapper>
					)}
				</S.EditorWrapper>
				<S.ActionsWrapper>
					<IconButton
						type={'alt1'}
						src={ASSETS.execute}
						handlePress={executeQuery}
						disabled={loading}
						dimensions={{ wrapper: 30.5, icon: 13.5 }}
						tooltip={loading ? 'Loading...' : `${language.run} (Cmd/Ctrl + Enter)`}
					/>
					<IconButton
						type={'alt1'}
						src={showVariables ? ASSETS.close : ASSETS.code}
						handlePress={() => setShowVariables((prev) => !prev)}
						dimensions={{ wrapper: 30.5, icon: 13.5 }}
						tooltip={showVariables ? 'Hide Query Variables' : 'Show Query Variables'}
					/>
					<IconButton
						type={'alt1'}
						src={ASSETS.fullscreen}
						handlePress={toggleFullscreen}
						dimensions={{ wrapper: 30.5, icon: 13.5 }}
						tooltip={isFullscreen ? language.exitFullScreen : language.enterFullScreen}
					/>
				</S.ActionsWrapper>
				<S.ResultWrapper>
					<JSONReader
						data={result}
						header={language.response}
						placeholder={loading ? `${language.loading}...` : language.runForResponse}
						noFullScreen
					/>
				</S.ResultWrapper>
			</S.Container>
		</S.Wrapper>
	);
}
