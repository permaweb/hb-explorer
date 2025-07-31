import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { Copyable } from 'components/atoms/Copyable';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Notification } from 'components/atoms/Notification';
import { Tabs } from 'components/atoms/Tabs';
import { Editor } from 'components/molecules/Editor';
import { JSONReader } from 'components/molecules/JSONReader';
import { ASSETS, URLS } from 'helpers/config';
import {
	filterSignedHeaders,
	getMessageIdFromSignature,
	getSignatureAlg,
	getSignatureKeyId,
	getSignerAddress,
	verifySignature,
} from 'helpers/signatures';
import { checkValidAddress, hbFetch, joinHeaders, parseHeaders, stripUrlProtocol } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { HyperLinks } from '../HyperLinks';

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

					const raw = joinHeaders(response.headers).trim();
					const parsed = parseHeaders(raw);

					const sigInputRaw = parsed['signature-input']?.data;
					const headersToUse = sigInputRaw ? filterSignedHeaders(parsed, sigInputRaw) : parsed;
					const sortedEntries = Object.entries(headersToUse).sort(([keyA, valA]: any, [keyB, valB]: any) => {
						const aIsAddr = checkValidAddress(valA.data) && keyA.includes('link');
						const bIsAddr = checkValidAddress(valB.data) && keyB.includes('link');

						if (aIsAddr && !bIsAddr) return -1;
						if (!aIsAddr && bIsAddr) return 1;

						return keyA.localeCompare(keyB);
					});

					const sortedHeaders = sortedEntries.reduce((acc, [key, val]) => {
						acc[key] = val;
						return acc;
					}, {} as typeof headersToUse);

					setHeaders(sortedHeaders);
				} catch (e: any) {
					console.error(e);
				}
			}
		})();
	}, [open, headers]);

	const isAddress = checkValidAddress(props.data);
	const isLink = isAddress && props.headerKey.includes('link');

	return (
		<S.InfoLineWrapper>
			<S.InfoLine isLink={isLink} onClick={() => (isLink ? setOpen((prev) => !prev) : {})} depth={props.depth}>
				<S.InfoLineHeader open={open}>
					{isLink && <ReactSVG src={ASSETS.arrowRight} />}
					<span>{`${props.headerKey}`}</span>
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

export default function HyperPath(props: {
	path: string;
	active: boolean;
	onPathChange?: (id: string, path: string) => void;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [inputPath, setInputPath] = React.useState<string>(props.path);
	const [fullResponse, setFullResponse] = React.useState<any>(null);
	const [responseBody, setResponseBody] = React.useState<any>(null);
	const [hyperbuddyData, setHyperbuddyData] = React.useState<any>(null);
	const [bodyType, setBodyType] = React.useState<'json' | 'raw'>('raw');

	const [id, setId] = React.useState<string | null>(null);
	const [headers, setHeaders] = React.useState<any>(null);
	const [signature, setSignature] = React.useState<string | null>(null);
	const [signer, setSigner] = React.useState<string | null>(null);
	const [signatureAlg, setSignatureAlg] = React.useState<string | null>(null);
	const [signatureKeyId, setSignatureKeyId] = React.useState<string | null>(null);
	const [signatureValid, setSignatureValid] = React.useState<boolean | null>(null);
	const [commitmentDevice, setCommitmentDevice] = React.useState<string | null>(null);

	const [loadingPath, setLoadingPath] = React.useState<boolean>(false);
	const [copied, setCopied] = React.useState<boolean>(false);
	const [error, setError] = React.useState<string | null>(null);
	const [pathNotFound, setPathNotFound] = React.useState<boolean>(false);

	React.useEffect(() => {
		setInputPath(props.path);
	}, [props.path]);

	React.useEffect(() => {
		if (!inputPath) {
			return;
		}

		const timeoutId = setTimeout(
			async () => {
				handleSubmit();
			},
			checkValidAddress(inputPath) ? 0 : 1000
		);

		return () => {
			clearTimeout(timeoutId);
			setLoadingPath(false);
		};
	}, [inputPath]);

	async function handleSubmit() {
		if (inputPath) {
			setLoadingPath(true);
			try {
				const response = await fetch(`${window.hyperbeamUrl}/${inputPath}`);

				const hyperbuddyResponse = await hbFetch(`/${inputPath}/format~hyperbuddy@1.0`);
				setHyperbuddyData(hyperbuddyResponse);

				if (!response.ok) {
					setPathNotFound(true);
					setLoadingPath(false);
					return;
				}

				setFullResponse(response);

				const raw = joinHeaders(response.headers).trim();
				const parsed = parseHeaders(raw);
				const signature = response.headers.get('signature');

				const sigInputRaw = parsed['signature-input']?.data;
				const headersToUse = sigInputRaw ? filterSignedHeaders(parsed, sigInputRaw) : parsed;
				const sortedEntries = Object.entries(headersToUse).sort(([keyA, valA]: any, [keyB, valB]: any) => {
					const aIsAddr = checkValidAddress(valA.data) && keyA.includes('link');
					const bIsAddr = checkValidAddress(valB.data) && keyB.includes('link');

					if (aIsAddr && !bIsAddr) return -1;
					if (!aIsAddr && bIsAddr) return 1;

					return keyA.localeCompare(keyB);
				});

				const sortedHeaders = sortedEntries.reduce((acc, [key, val]) => {
					acc[key] = val;
					return acc;
				}, {} as typeof headersToUse);

				setHeaders(sortedHeaders);

				if (parsed['commitment_device']) setCommitmentDevice(parsed['commitment_device'].data);

				if (signature) {
					const messageId = await getMessageIdFromSignature(signature);
					setId(messageId);

					const signatureInput = parsed['signature-input']?.data ?? '';

					const signer = signatureInput ? await getSignerAddress(signatureInput) : 'Unknown';
					const isValid = signatureInput ? await verifySignature(signature, signatureInput, response) : false;
					const alg = getSignatureAlg(sigInputRaw);
					const keyid = getSignatureKeyId(sigInputRaw);

					setSignature(signature);
					setSigner(signer);
					setSignatureValid(isValid);
					setSignatureAlg(alg);
					setSignatureKeyId(keyid);
				}

				props.onPathChange(inputPath, inputPath);
				setPathNotFound(false);
			} catch (e: any) {
				console.error(e);

				setPathNotFound(true);
			}
			setLoadingPath(false);
		}
	}

	React.useEffect(() => {
		(async function () {
			if (fullResponse) {
				if (props.path?.includes('serialize~json@1.0')) {
					setBodyType('json');
					try {
						const body = await fullResponse.json();
						setResponseBody(body);
					} catch (e: any) {
						console.error(e);
					}
				} else {
					setBodyType('raw');
					try {
						const body = await fullResponse.text();
						setResponseBody(body);
					} catch (e: any) {
						console.error(e);
					}
				}
			}
		})();
	}, [fullResponse, props.path]);

	const copyInput = React.useCallback(async (value: string) => {
		if (value?.length > 0) {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	}, []);

	function buildInfoSection(label: string, icon: string, data: any) {
		if (data && Object.keys(data).length > 0) {
			return (
				<S.InfoSection className={'border-wrapper-primary fade-in'}>
					<S.InfoHeader>
						<S.InfoTitle>
							<ReactSVG src={icon} />
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
		if (!inputPath || loadingPath || pathNotFound || !fullResponse) {
			return (
				<S.Placeholder>
					<S.PlaceholderIcon>
						<ReactSVG src={pathNotFound ? ASSETS.warning : ASSETS.process} />
					</S.PlaceholderIcon>
					<S.PlaceholderDescription>
						<p>{loadingPath ? `${language.loading}...` : pathNotFound ? language.pathNotFound : language.pathOrId}</p>
					</S.PlaceholderDescription>
				</S.Placeholder>
			);
		}

		return (
			<>
				<S.InfoWrapper>
					{/* {id && (
						<S.InfoSection className={'border-wrapper-primary fade-in'}>
							<S.IDHeader>
								<p>Message ID</p>
								<Copyable value={id} />
							</S.IDHeader>
						</S.InfoSection>
					)} */}
					<S.InfoSection className={'border-wrapper-alt3 fade-in'}>
						<S.SignatureHeader>
							<p>Signature</p>
							{signature ? <Copyable value={signature} format={'truncate'} /> : <p>-</p>}
						</S.SignatureHeader>
						<S.SignatureBody>
							<S.SignatureStatus valid={signatureValid}>
								<span>Status</span>
								<p>{signatureValid === true ? 'Verified' : signatureValid === false ? 'Invalid' : 'Pending'}</p>
							</S.SignatureStatus>
							<S.SignatureLine>
								<span>Signer</span>
								{signer ? <Copyable value={signer} format={'address'} /> : <p>-</p>}
							</S.SignatureLine>
							{signatureAlg && (
								<S.SignatureLine>
									<span>Format</span>
									<p>{signatureAlg}</p>
								</S.SignatureLine>
							)}
							{signatureKeyId && (
								<S.SignatureLine>
									<span>Key</span>
									<p>{signatureKeyId}</p>
								</S.SignatureLine>
							)}
							{commitmentDevice && (
								<S.SignatureLine>
									<span>Commitment Device</span>
									<p>{commitmentDevice}</p>
								</S.SignatureLine>
							)}
						</S.SignatureBody>
					</S.InfoSection>
				</S.InfoWrapper>
				<S.BodyWrapper>
					<Tabs onTabClick={() => {}} type={'primary'}>
						<S.Tab label={'Overview'}>{buildInfoSection('Signed Headers', ASSETS.headers, headers)}</S.Tab>
						<S.Tab label={'Hyperbuddy'}>
							{hyperbuddyData ? (
								<Editor initialData={hyperbuddyData} language={'html'} loading={false} readOnly />
							) : (
								<Loader sm relative />
							)}
						</S.Tab>
						<S.Tab label={'Body'}>
							<>
								{bodyType === 'json' ? (
									<JSONReader data={responseBody} header={'Body'} maxHeight={700} />
								) : (
									<Editor initialData={responseBody} language={'html'} loading={false} readOnly />
								)}
							</>
						</S.Tab>
						<S.Tab label={'Graph'}>
							<HyperLinks path={inputPath} id={id} />
						</S.Tab>
					</Tabs>
				</S.BodyWrapper>
			</>
		);
	}

	return props.active ? (
		<>
			<S.Wrapper>
				<S.HeaderWrapper>
					<S.SearchWrapper>
						<S.SearchInputWrapper>
							<ReactSVG src={ASSETS.search} />
							<FormField
								value={inputPath}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputPath(e.target.value)}
								placeholder={language.pathOrId}
								invalid={{ status: false, message: null }}
								disabled={loadingPath}
								autoFocus
								hideErrorMessage
								sm
							/>
						</S.SearchInputWrapper>
						<IconButton
							type={'alt1'}
							src={ASSETS.go}
							handlePress={() => handleSubmit()}
							disabled={loadingPath || !inputPath}
							dimensions={{
								wrapper: 32.5,
								icon: 17.5,
							}}
							tooltip={loadingPath ? `${language.loading}...` : language.run}
						/>
						<IconButton
							type={'alt1'}
							src={ASSETS.copy}
							handlePress={() => copyInput(inputPath)}
							disabled={!inputPath}
							dimensions={{
								wrapper: 32.5,
								icon: 17.5,
							}}
							tooltip={copied ? `${language.copied}!` : language.copyPath}
						/>
					</S.SearchWrapper>
					<S.HeaderActionsWrapper>
						<S.PathInfoWrapper>
							<S.UpdateWrapper>
								<span>{stripUrlProtocol(window.hyperbeamUrl)}</span>
								<S.Indicator />
							</S.UpdateWrapper>
						</S.PathInfoWrapper>
					</S.HeaderActionsWrapper>
				</S.HeaderWrapper>
				<S.ContentWrapper>{getPath()}</S.ContentWrapper>
				<S.Graphic>
					<video src={ASSETS.graphic} autoPlay loop muted playsInline />
				</S.Graphic>
			</S.Wrapper>
			{error && (
				<Notification
					type={'warning'}
					message={error}
					callback={() => {
						setError(null);
					}}
				/>
			)}
		</>
	) : null;
}
