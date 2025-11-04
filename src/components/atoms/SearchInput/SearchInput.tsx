import React from 'react';
import { ReactSVG } from 'react-svg';

import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { AutocompleteDropdown } from 'components/molecules/AutocompleteDropdown';
import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';
import { ISearchInput } from './types';

export default React.forwardRef<HTMLInputElement, ISearchInput>(function SearchInput(
	{
		value,
		onChange,
		onKeyDown,
		onKeyPress,
		onFocus,
		placeholder,
		disabled = false,
		invalid = { status: false, message: null },
		hideErrorMessage = false,
		sm = false,
		autocomplete,
		showSubmitButton = false,
		onSubmit,
		submitDisabled = false,
		submitTooltip,
		cacheStatus = 'default',
	},
	ref
) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const inputRef = React.useRef<HTMLInputElement>(null);
	const combinedRef = (ref || inputRef) as React.RefObject<HTMLInputElement>;

	// Use autocomplete if provided
	const showAutocomplete = autocomplete?.showAutocomplete ?? false;
	const autocompleteOptions = autocomplete?.autocompleteOptions ?? [];
	const selectedOptionIndex = autocomplete?.selectedOptionIndex ?? -1;
	const acceptAutocomplete = autocomplete?.acceptAutocomplete;

	// Use autocomplete's handleKeyDown if available, otherwise use the provided onKeyDown
	const handleKeyDown = autocomplete?.handleKeyDown ?? onKeyDown;

	return (
		<S.Wrapper>
			<S.InputWrapper cacheStatus={cacheStatus}>
				<ReactSVG src={ASSETS.search} />
				<FormField
					ref={combinedRef}
					value={value}
					onChange={onChange}
					onKeyDown={handleKeyDown}
					onKeyPress={onKeyPress}
					onFocus={onFocus}
					placeholder={placeholder}
					invalid={invalid}
					disabled={disabled}
					hideErrorMessage={hideErrorMessage}
					sm={sm}
				/>
				{autocomplete && (
					<AutocompleteDropdown
						options={autocompleteOptions}
						selectedIndex={selectedOptionIndex}
						onSelect={acceptAutocomplete || (() => {})}
						visible={showAutocomplete}
						showTabHint={true}
						inputRef={combinedRef}
					/>
				)}
			</S.InputWrapper>
			{showSubmitButton && (
				<S.SubmitWrapper>
					<IconButton
						type={'primary'}
						src={ASSETS.go}
						handlePress={onSubmit || (() => {})}
						disabled={submitDisabled}
						dimensions={{
							wrapper: 32.5,
							icon: 17.5,
						}}
						tooltip={submitTooltip || language.run}
					/>
				</S.SubmitWrapper>
			)}
		</S.Wrapper>
	);
});
