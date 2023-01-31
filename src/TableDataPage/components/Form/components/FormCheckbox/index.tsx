import React from 'react';
import { AnySchema } from 'yup';
import { Controller, UseControllerProps } from 'react-hook-form';
import Checkbox from '../../../Checkbox';
import Text from '../../../Text';
import validationSchemas from '../../validationSchemas';

export type Props = UseControllerProps & {
    labelText: string;
    validationSchema?: keyof typeof validationSchemas | AnySchema;
    errorMessage?: string;
    disabled?: boolean;
    required?: boolean | string;
    size?: 's' | 'm' | 'l' | 'xl';
};

const FormCheckbox = ({
    name,
    control,
    rules,
    defaultValue = false,
    errorMessage,
    labelText,
    disabled,
    size = 'xl',
}: Props) => (
    <>
        <Controller
            name={name}
            control={control}
            rules={rules}
            defaultValue={defaultValue}
            render={({ field: { onChange, onBlur, value } }) => (
                <Checkbox
                    size={size}
                    disabled={disabled}
                    label={labelText}
                    onChange={onChange}
                    onBlur={onBlur}
                    checked={value}
                />
            )}
        />
        {errorMessage ? (
            <Text color="red" paddingY={3} size="m">
                {errorMessage}
            </Text>
        ) : null}
    </>
);

export default FormCheckbox;
