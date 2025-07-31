import React from 'react';

import { searchDeviceNamesSync } from 'helpers/deviceNames';

export interface UseDeviceAutocompleteProps {
	inputValue: string;
	cursorPosition: number;
	inputRef: React.RefObject<HTMLInputElement>;
	onValueChange: (value: string, cursorPosition: number) => void;
}

export interface UseDeviceAutocompleteReturn {
	showAutocomplete: boolean;
	autocompleteOptions: string[];
	selectedOptionIndex: number;
	handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	acceptAutocomplete: (deviceName: string) => void;
	setShowAutocomplete: (show: boolean) => void;
}

export function useDeviceAutocomplete({
	inputValue,
	cursorPosition,
	inputRef,
	onValueChange,
}: UseDeviceAutocompleteProps): UseDeviceAutocompleteReturn {
	const [showAutocomplete, setShowAutocomplete] = React.useState<boolean>(false);
	const [autocompleteOptions, setAutocompleteOptions] = React.useState<string[]>([]);
	const [selectedOptionIndex, setSelectedOptionIndex] = React.useState<number>(-1);

	// Update autocomplete options when input changes
	React.useEffect(() => {
		if (!inputValue || cursorPosition === 0) {
			setShowAutocomplete(false);
			setAutocompleteOptions([]);
			return;
		}

		// Find the current word being typed (device name part)
		const beforeCursor = inputValue.substring(0, cursorPosition);
		const segments = beforeCursor.split('/');
		const currentSegment = segments[segments.length - 1];

		if (currentSegment && currentSegment.length > 0) {
			const matches = searchDeviceNamesSync(currentSegment);
			if (matches.length > 0) {
				setAutocompleteOptions(matches);
				setShowAutocomplete(true);
				setSelectedOptionIndex(0); // Start with first option selected
			} else {
				setShowAutocomplete(false);
				setAutocompleteOptions([]);
			}
		} else {
			setShowAutocomplete(false);
			setAutocompleteOptions([]);
		}
	}, [inputValue, cursorPosition]);

	// Close autocomplete when clicking outside
	React.useEffect(() => {
		const handleClickOutside = () => {
			setShowAutocomplete(false);
		};

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, []);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (showAutocomplete && autocompleteOptions.length > 0) {
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					setSelectedOptionIndex((prev) => (prev < autocompleteOptions.length - 1 ? prev + 1 : 0));
					break;
				case 'ArrowUp':
					e.preventDefault();
					setSelectedOptionIndex((prev) => (prev > 0 ? prev - 1 : autocompleteOptions.length - 1));
					break;
				case 'Tab':
					e.preventDefault();
					e.stopPropagation();
					acceptAutocomplete(autocompleteOptions[selectedOptionIndex]);
					return;
				case 'Enter':
					if (selectedOptionIndex >= 0) {
						e.preventDefault();
						acceptAutocomplete(autocompleteOptions[selectedOptionIndex]);
						return;
					}
					break;
				case 'Escape':
					e.preventDefault();
					setShowAutocomplete(false);
					break;
				default:
					// Continue with normal typing
					break;
			}
		}
	};

	const acceptAutocomplete = (deviceName: string) => {
		// Find the start and end of the complete device name that contains the cursor
		let deviceStart = 0;
		let deviceEnd = inputValue.length;

		// Find the start of the current device (look backwards for '/')
		for (let i = cursorPosition - 1; i >= 0; i--) {
			if (inputValue[i] === '/') {
				deviceStart = i + 1;
				break;
			}
		}

		// Find the end of the current device (look forwards for '/')
		for (let i = cursorPosition; i < inputValue.length; i++) {
			if (inputValue[i] === '/') {
				deviceEnd = i;
				break;
			}
		}

		// Replace the entire device name with the selected option
		const beforeDevice = inputValue.substring(0, deviceStart);
		const afterDevice = inputValue.substring(deviceEnd);
		const newPath = beforeDevice + deviceName + afterDevice;

		setShowAutocomplete(false);
		setSelectedOptionIndex(-1);

		// Set cursor position after the inserted device name
		const newCursorPosition = deviceStart + deviceName.length;

		// Update the parent component
		onValueChange(newPath, newCursorPosition);

		// Set cursor position in the input
		setTimeout(() => {
			if (inputRef.current) {
				inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
			}
		}, 0);
	};

	return {
		showAutocomplete,
		autocompleteOptions,
		selectedOptionIndex,
		handleKeyDown,
		acceptAutocomplete,
		setShowAutocomplete,
	};
}
