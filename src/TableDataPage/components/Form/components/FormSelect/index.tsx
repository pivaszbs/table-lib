import React from 'react';
import { Controller } from 'react-hook-form';
import Select from '../../../Select';
import Label from '../../../LargeLabel';
import Text from '../../../Text';
import { CommonFormInputProps } from '../../types';
import { DEFAULT_REQUIRED_ERROR } from '../../constants';
import validationSchemas from '../../validationSchemas';

import styles from './styles.pcss';

interface Option {
    value: string;
    label: string;
}

export type Props = CommonFormInputProps & {
    labelText?: string;
    validationSchema?: keyof typeof validationSchemas;
    errorMessage?: string;
    required?: boolean | string;
    disabled?: boolean;
    options: Option[];
    emptyOption?: boolean;
};

const FormSelect = ({
    name,
    control,
    rules: rulesProp,
    required = false,
    options,
    labelText,
    defaultValue,
    errorMessage,
    disabled,
    emptyOption = true,
}: Props) => {
    const rules = rulesProp ?? {
        required: typeof required === 'string' ? required : required && DEFAULT_REQUIRED_ERROR,
    };

    return (
        <>
            <Label text={labelText}>
                <Controller
                    name={name}
                    control={control}
                    rules={rules}
                    defaultValue={defaultValue}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Select
                            className={styles.select}
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            disabled={disabled}
                        >
                            {emptyOption && !value && <option value="" />}
                            {options.map(({ value: val, label }) => (
                                <option key={val} value={val}>
                                    {label}
                                </option>
                            ))}
                        </Select>
                    )}
                />
            </Label>
            {errorMessage ? (
                <Text color="red" paddingY={3} size="m">
                    {errorMessage}
                </Text>
            ) : null}
        </>
    );
};

export default FormSelect;
