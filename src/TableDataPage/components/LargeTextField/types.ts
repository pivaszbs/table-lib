import { KeyboardEvent } from 'react';

export interface Props extends Record<string, any> {
    withoutImplicitFocus?: boolean;
    hasAutoSelect?: boolean;
    hasLowerCase?: boolean;
    hasAutoSelectAfterSubmit?: boolean;
    programmaticAutoFocus?: number;
    selector?: string | null;
    priority?: number;
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    mask?: (string | RegExp)[];
}
