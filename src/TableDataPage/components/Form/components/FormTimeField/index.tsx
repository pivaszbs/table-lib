import React from 'react';
import { Controller } from 'react-hook-form';
import validationSchemas from '../../validationSchemas';
import Text from '../../../Text';
import { CommonFormInputProps } from '../../types';
import TimeField from '../../../TimeField';
import LargeLabel from '../../../LargeLabel';

export type Props = CommonFormInputProps & {
    disabled?: boolean;
    validationSchema?: keyof typeof validationSchemas;
    errorMessage?: string;
};

const FormTimeField = ({ defaultValue, name, control, labelText, errorMessage, disabled, dataE2e }: Props) => {
    return (
        <>
            <Controller
                name={name}
                control={control}
                defaultValue={defaultValue}
                render={({ field: { onChange, onBlur, value } }) => (
                    <>
                        <LargeLabel text={labelText} />
                        <TimeField
                            dataE2e={dataE2e}
                            disabled={disabled}
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                        />
                    </>
                )}
            />
            {errorMessage ? (
                <Text color="red" paddingY={3} size="m">
                    {errorMessage}
                </Text>
            ) : null}
        </>
    );
};

export default FormTimeField;
