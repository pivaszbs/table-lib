import { UseControllerProps } from 'react-hook-form';
import validationSchemas from './validationSchemas';

export type CommonFormInputProps = UseControllerProps & {
    validate?: (value: any) => boolean;
    errorMessage?: string;
    labelText?: string;
    required?: boolean | string;
    validationSchema?: keyof typeof validationSchemas;
    dataE2e?: string;
    disabled?: boolean;
};
