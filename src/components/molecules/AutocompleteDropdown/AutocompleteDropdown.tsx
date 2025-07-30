import * as S from './styles';

export interface AutocompleteDropdownProps {
	options: string[];
	selectedIndex: number;
	onSelect: (option: string) => void;
	visible: boolean;
	showTabHint?: boolean;
}

export default function AutocompleteDropdown({
	options,
	selectedIndex,
	onSelect,
	visible,
	showTabHint = false,
}: AutocompleteDropdownProps) {
	if (!visible || options.length === 0) {
		return null;
	}

	return (
		<S.Dropdown>
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
		</S.Dropdown>
	);
}
