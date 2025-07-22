import { Button } from '../Button';
import { IconButton } from '../IconButton';

import * as S from './styles';

export default function Toggle(props: {
	label?: string;
	options: { label: string; icon?: string }[];
	activeOption: string;
	handleToggle: (option: string) => void;
	disabled: boolean;
}) {
	return (
		<S.Wrapper>
			{props.label && (
				<S.Label>
					<p>{props.label}</p>
				</S.Label>
			)}
			<S.Options>
				{props.options.map((option: { label: string; icon?: string }, index: number) => {
					return option.icon ? (
						<IconButton
							key={index}
							type={'alt1'}
							src={option.icon}
							handlePress={() => props.handleToggle(option.label)}
							disabled={props.disabled}
							active={option.label.toLowerCase() === props.activeOption.toLowerCase()}
							dimensions={{
								icon: 12.5,
								wrapper: 22.5,
							}}
						/>
					) : (
						<Button
							key={index}
							type={'alt3'}
							label={option.label}
							handlePress={() => props.handleToggle(option.label)}
							disabled={props.disabled}
							active={option.label.toLowerCase() === props.activeOption.toLowerCase()}
						/>
					);
				})}
			</S.Options>
		</S.Wrapper>
	);
}
