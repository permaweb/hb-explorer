import React from 'react';

import { Modal } from 'components/atoms/Modal';
import { ASSETS } from 'helpers/config';
import { formatRequiredField } from 'helpers/utils';

import { IconButton } from '../IconButton';

import * as S from './styles';
import { IProps } from './types';

export default React.forwardRef<HTMLInputElement, IProps>(function FormField(props, ref) {
	const [showTooltip, setShowTooltip] = React.useState<boolean>(false);
	const generatedId = React.useId();
	const inputId = props.id || generatedId;
	const inputName = props.name || props.id || generatedId;

	function getValue() {
		if (props.type === 'number') {
			return isNaN(Number(props.value)) ? '' : props.value;
		} else {
			return props.value;
		}
	}

	return (
		<>
			{props.tooltip && showTooltip && (
				<Modal header={props.tooltipLabel ? props.tooltipLabel : props.label} handleClose={() => setShowTooltip(false)}>
					<S.Tooltip>
						<p>{props.tooltip}</p>
					</S.Tooltip>
				</Modal>
			)}
			<S.Wrapper sm={props.sm}>
				{props.label && (
					<S.TWrapper>
						{props.label && (
							<S.Label htmlFor={inputId}>{props.required ? formatRequiredField(props.label) : props.label}</S.Label>
						)}
						{props.tooltip && (
							<IconButton
								type={'primary'}
								active={false}
								src={ASSETS.info}
								handlePress={() => setShowTooltip(!showTooltip)}
								dimensions={{ wrapper: 22.5, icon: 13.5 }}
							/>
						)}
					</S.TWrapper>
				)}
				<S.Input
					ref={ref}
					type={props.type ? props.type : 'text'}
					step={props.step ? props.step : '1'}
					value={getValue()}
					onWheel={(e: any) => e.target.blur()}
					onChange={props.onChange}
					onFocus={props.onFocus}
					onClick={props.onClick}
					onKeyPress={props.onKeyPress}
					onKeyDown={props.onKeyDown}
					disabled={props.disabled}
					invalid={props.invalid.status}
					placeholder={props.placeholder ? props.placeholder : ''}
					sm={props.sm}
					autoFocus={props.autoFocus ? props.autoFocus : false}
					id={inputId}
					name={inputName}
					data-testid={props.testingCtx}
				/>
				{props.endText && (
					<S.EndTextContainer disabled={props.disabled} sm={props.sm}>
						{props.endText && <S.EndText sm={props.sm}>{props.endText}</S.EndText>}
					</S.EndTextContainer>
				)}
				{!props.hideErrorMessage && props.invalid.message && (
					<S.ErrorContainer>{props.invalid.message && <S.Error>{props.invalid.message}</S.Error>}</S.ErrorContainer>
				)}
			</S.Wrapper>
		</>
	);
});
