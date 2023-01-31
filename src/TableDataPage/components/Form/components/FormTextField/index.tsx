import React from 'react';
import { Controller, UseControllerProps } from 'react-hook-form';
import Label from '../../../LargeLabel';
import TextField from '../../../LargeTextField';
import Text from '../../../Text';
import validationSchemas from '../../validationSchemas';
import { CommonFormInputProps } from '../../types';

export type Props = UseControllerProps &
    CommonFormInputProps & {
        labelText: string;
        errorMessage?: string;
        validationSchema?: keyof typeof validationSchemas;
        required?: boolean | string;
        disabled?: boolean;
        hasLowerCase?: boolean;
        hasAutoSelectAfterSubmit?: boolean;
        autoFocus?: boolean;
        autoComplete?: string;
        placeholder?: string;
        rows?: number;
    };

const FormTextField = ({
    name,
    control,
    rules: rulesProp,
    defaultValue = '',
    errorMessage,
    labelText,
    required = false,
    hasAutoSelectAfterSubmit,
    disabled,
    placeholder,
    hasLowerCase,
    autoFocus,
    autoComplete = 'off',
    dataE2e,
    rows,
}: Props) => {
    const rules = rulesProp ?? {
        required: typeof required === 'string' ? required : required && 'Необходимо ввести значение',
    };

    return (
        <Label text={labelText}>
            <Controller
                name={name}
                control={control}
                rules={rules}
                defaultValue={defaultValue}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                        data-e2e={dataE2e}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        disabled={disabled}
                        hasLowerCase={hasLowerCase}
                        autoFocus={autoFocus}
                        autoComplete={autoComplete}
                        placeholder={placeholder}
                        hasAutoSelectAfterSubmit={hasAutoSelectAfterSubmit}
                        error={
                            <Text color="red" paddingY={3} size="m">
                                {errorMessage}
                            </Text>
                        }
                        state={errorMessage ? 'error' : ''}
                        rows={rows}
                    />
                )}
            />
        </Label>
    );
};

export default FormTextField;
