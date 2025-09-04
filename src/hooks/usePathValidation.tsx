import React from 'react';

export type ValidationStatus = 'default' | 'success' | 'error';

export interface UsePathValidationProps {
	path: string;
	debounceMs?: number;
}

export interface UsePathValidationReturn {
	validationStatus: ValidationStatus;
}

export function usePathValidation({ path, debounceMs = 500 }: UsePathValidationProps): UsePathValidationReturn {
	const [validationStatus, setValidationStatus] = React.useState<ValidationStatus>('default');

	// Check path validity in real-time as a user types
	React.useEffect(() => {
		if (!path) {
			setValidationStatus('default');
			return;
		}

		const checkPath = async () => {
			try {
				const validationPath = `${path}/~cacheviz@1.0/index`;
				const mainRes = await fetch(`${window.hyperbeamUrl}/${validationPath}`);

				if (mainRes.status === 200) {
					setValidationStatus('success');
				} else {
					setValidationStatus('default');
				}
			} catch (e: any) {
				setValidationStatus('error');
			}
		};

		const timeoutId = setTimeout(checkPath, debounceMs);
		return () => clearTimeout(timeoutId);
	}, [path, debounceMs]);

	return {
		validationStatus,
	};
}
