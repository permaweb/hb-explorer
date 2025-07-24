export interface IProps {
	value: string;
	helpText?: string;
	wrap?: boolean;
	view?: boolean;
	viewIcon?: string;
	format?: 'truncate' | 'address';
	hideIcon?: string;
}
