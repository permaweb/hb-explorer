import React from 'react';

import { UseDeviceAutocompleteReturn } from 'hooks/useDeviceAutocomplete';

export interface ISearchInput {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	onFocus?: () => void;
	placeholder?: string;
	disabled?: boolean;
	invalid?: { status: boolean; message: string | null };
	hideErrorMessage?: boolean;
	sm?: boolean;
	ref?: React.RefObject<HTMLInputElement>;
	autocomplete?: UseDeviceAutocompleteReturn;
	showAutocomplete?: boolean;
	showSubmitButton?: boolean;
	onSubmit?: () => void;
	submitDisabled?: boolean;
	submitTooltip?: string;
	cacheStatus?: 'default' | 'success' | 'error';
}
