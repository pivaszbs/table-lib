import React from 'react';
import { ReactDatePickerProps } from 'react-datepicker';
import { Controller, UseControllerProps } from 'react-hook-form';
import Text from '../../../Text';
import DateField from '../../../DateField';
import validationSchemas from '../../validationSchemas';
import { CommonFormInputProps } from '../../types';
import { DEFAULT_REQUIRED_ERROR } from '../../constants';
import Label from '../../../LargeLabel';

export type Props = UseControllerProps &
    CommonFormInputProps & {
        labelText?: string;
        errorMessage?: string;
        required?: boolean | string;
        validationSchema?: keyof typeof validationSchemas;
        withPortal?: boolean;
        isCompactDate?: boolean;
        disabled?: boolean;
        popperPlacement?: ReactDatePickerProps['popperPlacement'];
    };

const FormDateField = ({
    name,
    control,
    rules: rulesProp,
    required = false,
    isCompactDate,
    labelText,
    defaultValue = '',
    errorMessage,
    withPortal,
    disabled,
    popperPlacement,
    dataE2e,
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
                        <>
                            <DateField
                                dataE2e={dataE2e}
                                disabled={disabled}
                                onChange={onChange}
                                onBlur={onBlur}
                                withPortal={withPortal}
                                value={value}
                                isCompactDate={isCompactDate}
                                popperPlacement={popperPlacement}
                            />
                        </>
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

export default FormDateField;
