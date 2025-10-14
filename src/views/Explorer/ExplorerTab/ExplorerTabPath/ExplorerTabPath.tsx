import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { Copyable } from 'components/atoms/Copyable';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Tabs } from 'components/atoms/Tabs';
import { Editor } from 'components/molecules/Editor';
import { JSONReader } from 'components/molecules/JSONReader';
import { SamplePaths } from 'components/molecules/SamplePaths';
import { HyperLinks } from 'components/organisms/HyperLinks';
import { ASSETS, URLS } from 'helpers/config';
import { ExplorerTabObjectType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';
import { UseHyperBeamRequestReturn } from 'hooks/useHyperBeamRequest';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

function InfoLine(props: { headerKey: string; data: string; depth: number }) {
	const navigate = useNavigate();

	const [open, setOpen] = React.useState<boolean>(false);
	const [headers, setHeaders] = React.useState<any>(null);

	React.useEffect(() => {
		(async function () {
			if (open && !headers) {
				try {
					const response = await fetch(`${window.hyperbeamUrl}/${props.data}`);

					if (!response.ok) {
						return;
					}

					const headersObj: any = {};
					response.headers.forEach((value, key) => {
						headersObj[key] = { data: value };
					});

					setHeaders(headersObj);
				} catch (e: any) {
					console.error(e);
				}
			}
		})();
	}, [open, headers, props.data]);

	const isAddress = checkValidAddress(props.data);
	const isLink = isAddress && props.headerKey.includes('link');

	return (
		<S.InfoLineWrapper>
			<S.InfoLine isLink={isLink} onClick={() => (isLink ? setOpen((prev) => !prev) : {})} depth={props.depth}>
				<S.InfoLineHeader open={open}>
					{isLink && <ReactSVG src={ASSETS.arrowRight} />}
					<span>{isLink ? `${props.headerKey.replace('+link', '')}` : props.headerKey}</span>
				</S.InfoLineHeader>
				<S.InfoLineEnd>
					{isAddress ? <Copyable value={props.data} format={'address'} /> : <p>{props.data}</p>}
					{isLink && (
						<IconButton
							type={'alt1'}
							src={ASSETS.newTab}
							handlePress={() => navigate(`${URLS.explorer}${props.data}`)}
							dimensions={{
								icon: 10.5,
								wrapper: 20,
							}}
							tooltip={'Open in new tab'}
							tooltipPosition={'bottom-right'}
						/>
					)}
				</S.InfoLineEnd>
			</S.InfoLine>
			{open && headers && (
				<S.InfoBodyChild>
					{Object.keys(headers).map((key) => {
						return <InfoLine key={key} headerKey={key} data={headers[key].data} depth={props.depth + 1} />;
					})}
				</S.InfoBodyChild>
			)}
		</S.InfoLineWrapper>
	);
}

// Cache to store results by path - shared across all ExplorerTabPath instances
const resultsCache = new Map<
	string,
	{
		responseBody: any;
		hyperbuddyData: any;
		bodyType: 'json' | 'raw';
		timestamp: number;
	}
>();

export default function ExplorerTabPath(props: {
	tab: ExplorerTabObjectType;
	hyperBeamRequest: UseHyperBeamRequestReturn;
	refreshKey?: number;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [responseBody, setResponseBody] = React.useState<any>(null);
	const [hyperbuddyData, setHyperbuddyData] = React.useState<any>(null);
	const [bodyType, setBodyType] = React.useState<'json' | 'raw'>('raw');
	const [resultsReady, setResultsReady] = React.useState<boolean>(false);

	// Load cached results or fetch new data when response changes
	React.useEffect(() => {
		(async function () {
			if (props.hyperBeamRequest.response && props.hyperBeamRequest.submittedPath) {
				// Check cache first
				const cached = resultsCache.get(props.hyperBeamRequest.submittedPath);
				if (cached) {
					setResponseBody(cached.responseBody);
					setHyperbuddyData(cached.hyperbuddyData);
					setBodyType(cached.bodyType);
					setResultsReady(true);
					return;
				}

				setResultsReady(false);
				let body;
				let currentBodyType: 'json' | 'raw' = 'raw';

				if (props.hyperBeamRequest.submittedPath.includes('accept=application/json')) {
					currentBodyType = 'json';
					try {
						body = await props.hyperBeamRequest.response.clone().json();
						setBodyType('json');
						setResponseBody(body);
					} catch (e: any) {
						console.error(e);
						body = null;
					}
				} else {
					currentBodyType = 'raw';
					try {
						body = await props.hyperBeamRequest.response.clone().text();
						setBodyType('raw');
						setResponseBody(body || 'Empty Response Body');
					} catch (e: any) {
						console.error(e);
						body = null;
					}
				}

				// Fetch hyperbuddy data
				let hyperbuddyDataResult = null;
				try {
					const hyperbuddyResponse = await fetch(
						`${window.hyperbeamUrl}/${props.hyperBeamRequest.submittedPath}/format~hyperbuddy@1.0`
					);
					if (hyperbuddyResponse.ok) {
						hyperbuddyDataResult = await hyperbuddyResponse.text();
					} else {
						hyperbuddyDataResult = 'Error Fetching Data';
					}
				} catch (e) {
					console.error('Error fetching hyperbuddy data:', e);
				}

				setHyperbuddyData(hyperbuddyDataResult);

				// Cache the results
				if (props.hyperBeamRequest.submittedPath && body !== null) {
					resultsCache.set(props.hyperBeamRequest.submittedPath, {
						responseBody: body,
						hyperbuddyData: hyperbuddyDataResult,
						bodyType: currentBodyType,
						timestamp: Date.now(),
					});
				}

				setTimeout(() => setResultsReady(true), 50);
			} else {
				setResultsReady(false);
			}
		})();
	}, [props.hyperBeamRequest.response, props.hyperBeamRequest.submittedPath]);

	function buildInfoSection(label: string, icon: string, data: any) {
		if (data && Object.keys(data).length > 0) {
			return (
				<S.InfoSection className={'border-wrapper-primary fade-in'}>
					<S.InfoHeader>
						<S.InfoTitle>
							{icon && <ReactSVG src={icon} />}
							<p>{label}</p>
						</S.InfoTitle>
						<span>{`(${Object.keys(data).length}) `}</span>
					</S.InfoHeader>
					<S.InfoBody className={'scroll-wrapper-hidden'}>
						{Object.keys(data).map((key) => {
							return <InfoLine key={key} headerKey={key} data={data[key].data} depth={1} />;
						})}
					</S.InfoBody>
				</S.InfoSection>
			);
		}
		return null;
	}

	function getPath() {
		// Show loading placeholder only when actually loading or processing
		if (props.hyperBeamRequest.loading || (props.hyperBeamRequest.response && !resultsReady)) {
			return (
				<S.Placeholder>
					<S.PlaceholderIcon>
						<ReactSVG src={ASSETS.process} />
					</S.PlaceholderIcon>
					<S.PlaceholderDescription>
						<p>{`${language.loading}...`}</p>
					</S.PlaceholderDescription>
				</S.Placeholder>
			);
		}

		// Show error state
		if (props.hyperBeamRequest.error && !props.hyperBeamRequest.hasContent) {
			return (
				<S.Placeholder>
					<S.PlaceholderIcon>
						<ReactSVG src={ASSETS.warning} />
					</S.PlaceholderIcon>
					<S.PlaceholderDescription>
						<p>{language.pathNotFound}</p>
					</S.PlaceholderDescription>
				</S.Placeholder>
			);
		}

		// If we don't have a current response but we have previous content, use the last successful response
		const responseToUse = props.hyperBeamRequest.response || props.hyperBeamRequest.lastSuccessfulResponse;
		if (!responseToUse) {
			return null;
		}

		return (
			<>
				<S.InfoWrapper>
					<S.InfoSection className={'border-wrapper-alt3 fade-in'}>
						<S.SignatureHeader>
							<p>Signature</p>
							{props.hyperBeamRequest.signature ? (
								<Copyable value={props.hyperBeamRequest.signature} format={'truncate'} />
							) : (
								<p>-</p>
							)}
						</S.SignatureHeader>
						<S.SignatureBody>
							<S.SignatureLine>
								<span>Signer</span>
								{props.hyperBeamRequest.signer ? (
									<Copyable value={props.hyperBeamRequest.signer} format={'address'} />
								) : (
									<p>-</p>
								)}
							</S.SignatureLine>
							{props.hyperBeamRequest.signatureAlg && (
								<S.SignatureLine>
									<span>Format</span>
									<p>{props.hyperBeamRequest.signatureAlg}</p>
								</S.SignatureLine>
							)}
							{props.hyperBeamRequest.signatureKeyId && (
								<S.SignatureLine>
									<span>Key</span>
									<p>{props.hyperBeamRequest.signatureKeyId}</p>
								</S.SignatureLine>
							)}
						</S.SignatureBody>
					</S.InfoSection>
					{buildInfoSection(
						'Signed Fields',
						null,
						(() => {
							// Combine headers with links and sort so links appear on top
							const allHeaders = { ...props.hyperBeamRequest.headers };
							if (props.hyperBeamRequest.links) {
								Object.assign(allHeaders, props.hyperBeamRequest.links);
							}

							// Sort entries to put links on top
							const sortedEntries = Object.entries(allHeaders).sort(([keyA, valA]: any, [keyB, valB]: any) => {
								const aIsAddr = checkValidAddress(valA.data) && keyA.includes('link');
								const bIsAddr = checkValidAddress(valB.data) && keyB.includes('link');

								if (aIsAddr && !bIsAddr) return -1;
								if (!aIsAddr && bIsAddr) return 1;

								return keyA.localeCompare(keyB);
							});

							// Convert back to object
							return sortedEntries.reduce((acc, [key, val]) => {
								acc[key] = val;
								return acc;
							}, {} as any);
						})()
					)}
				</S.InfoWrapper>
				<S.BodyWrapper>
					<Tabs onTabClick={() => {}} type={'primary'}>
						<S.Tab label={'Graph'}>
							<HyperLinks path={props.hyperBeamRequest.submittedPath} id={props.hyperBeamRequest.id} />
						</S.Tab>
						<S.Tab label={'Hyperbuddy'}>
							{hyperbuddyData ? (
								<Editor initialData={hyperbuddyData} loading={false} readOnly />
							) : (
								<Loader sm relative />
							)}
						</S.Tab>
						<S.Tab label={'Content'}>
							{responseBody ? (
								<>
									{bodyType === 'json' ? (
										<JSONReader data={responseBody} header={'Body'} maxHeight={700} />
									) : (
										<Editor initialData={responseBody} language={'html'} loading={false} readOnly />
									)}
								</>
							) : null}
						</S.Tab>
					</Tabs>
				</S.BodyWrapper>
			</>
		);
	}

	return (
		<S.Wrapper>
			{!props.hyperBeamRequest.hasContent ? (
				<SamplePaths
					onPathSelect={(path) => {
						// This would need to be handled by parent component
						console.log('Path selected:', path);
					}}
				/>
			) : (
				getPath()
			)}
		</S.Wrapper>
	);
}
