import React from 'react';
import { createPortal } from 'react-dom';

import * as S from './styles';

export interface AutocompleteDropdownProps {
	options: string[];
	selectedIndex: number;
	onSelect: (option: string) => void;
	visible: boolean;
	showTabHint?: boolean;
	inputRef?: React.RefObject<HTMLInputElement>;
}

export default function AutocompleteDropdown({
	options,
	selectedIndex,
	onSelect,
	visible,
	showTabHint = false,
	inputRef,
}: AutocompleteDropdownProps) {
	const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });

	const updatePosition = React.useCallback(() => {
		if (visible && inputRef?.current) {
			const rect = inputRef.current.getBoundingClientRect();
			setPosition({
				top: rect.bottom + 7.5, // Subtract 2px to align with border
				left: rect.left,
				width: rect.width,
			});
		}
	}, [visible, inputRef]);

	React.useEffect(() => {
		updatePosition();
	}, [updatePosition]);

	React.useEffect(() => {
		if (visible) {
			window.addEventListener('scroll', updatePosition, true);
			window.addEventListener('resize', updatePosition);
			return () => {
				window.removeEventListener('scroll', updatePosition, true);
				window.removeEventListener('resize', updatePosition);
			};
		}
	}, [visible, updatePosition]);

	if (!visible || options.length === 0) {
		return null;
	}

	return createPortal(
		<S.Dropdown
			style={{
				position: 'fixed',
				top: `${position.top}px`,
				left: `${position.left}px`,
				width: `${position.width}px`,
			}}
		>
			{options.map((option, index) => (
				<S.Option
					key={option}
					isSelected={index === selectedIndex}
					onClick={(e) => {
						e.stopPropagation();
						onSelect(option);
					}}
				>
					{option}
					{showTabHint && index === selectedIndex && <S.TabHint>Tab</S.TabHint>}
				</S.Option>
			))}
		</S.Dropdown>,
		document.body
	);
}
