import React, { useState } from 'react';
import { Controller, UseControllerProps } from 'react-hook-form';
import Text from '../../../Text';
import validationSchemas from '../../validationSchemas';
import { CommonFormInputProps } from '../../types';
import { DEFAULT_REQUIRED_ERROR } from '../../constants';
import Label from '../../../LargeLabel';
import MultiInput, { MultiInputProps } from '../../../DynamicSelect/components/MultiInput';

export type Props = UseControllerProps &
    CommonFormInputProps & {
        labelText?: string;
        errorMessage?: string;
        required?: boolean | string;
        validationSchema?: keyof typeof validationSchemas;
        isCompactDate?: boolean;
    } & Omit<
        MultiInputProps<string>,
        | 'onChange'
        | 'onInputChange'
        | 'onBlur'
        | 'value'
        | 'values'
        | 'size'
        | 'hasSearch'
        | 'hasSelfFilter'
        | 'labelsMapper'
        | 'inputValue'
        | 'hasSubmitButton'
        | 'onItemExclude'
        | 'onClick'
        | 'onItemPop'
        | 'onFocus'
        | 'inputClassName'
    >;

const FormMultiField = ({
    name,
    rules: rulesProp,
    defaultValue = [],
    control,
    errorMessage,
    required = false,
    dataE2e,
    disabled,
    labelText,
}: Props) => {
    const rules = rulesProp ?? {
        required: typeof required === 'string' ? required : required && DEFAULT_REQUIRED_ERROR,
    };
    const [inputValue, setInputValue] = useState('');

    return (
        <>
            <Label text={labelText}>
                <Controller
                    name={name}
                    control={control}
                    rules={rules}
                    defaultValue={defaultValue}
                    render={({ field: { onChange, onBlur, value } }) => {
                        return (
                            <MultiInput
                                onInputChange={setInputValue}
                                values={value || []}
                                inputValue={inputValue}
                                disabled={disabled}
                                onChange={onChange}
                                hasSearch={true}
                                size="l"
                                onBlur={onBlur}
                                dataE2e={dataE2e}
                                withEnter
                            />
                        );
                    }}
                />
            </Label>
            {errorMessage && (
                <Text color="red" paddingY={3} size="m">
                    {errorMessage}
                </Text>
            )}
        </>
    );
};

export default FormMultiField;
