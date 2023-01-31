import React, { useMemo } from 'react';
import { ReactDatePickerProps } from 'react-datepicker';
import { Controller } from 'react-hook-form';
import validationSchemas from '../../validationSchemas';
import Text from '../../../Text';
import { CommonFormInputProps } from '../../types';
import { DATE_REGEX } from '../../../DateField/constants';
import DateTimeField, { DateTimeValue } from '../../../DateTimeField';
import { TIME_REGEX } from '../../../DateTimeField/constants';
import { DEFAULT_REQUIRED_ERROR } from '../../constants';
import LargeLabel from '../../../LargeLabel';

export interface FormDateTimeFieldErrorMessage {
    date?: {
        message: string;
    };
    time?: {
        message: string;
    };
    message?: string;
}

export type Props = Omit<CommonFormInputProps, 'errorMessage'> & {
    withPortal?: boolean;
    disabled?: boolean;
    isCompactDate?: boolean;
    validationSchema?: keyof typeof validationSchemas;
    errorMessage?: FormDateTimeFieldErrorMessage;
    popperPlacement?: ReactDatePickerProps['popperPlacement'];
};

const FormDateTimeField = ({
    name,
    control,
    required = false,
    labelText,
    defaultValue = {
        date: '',
        time: '',
    },
    errorMessage,
    popperPlacement,
    withPortal,
    isCompactDate,
    disabled,
    dataE2e,
}: Props) => {
    const rules = useMemo(
        () => ({
            validate: (value: DateTimeValue) => {
                const requiredErrorText = typeof required === 'string' ? required : DEFAULT_REQUIRED_ERROR;
                if (required) {
                    return (value.time.match(TIME_REGEX) && value.date.match(DATE_REGEX)) || requiredErrorText;
                }

                return true;
            },
        }),
        [required]
    );
    const errorText = errorMessage?.message || errorMessage?.date?.message || errorMessage?.time?.message;

    return (
        <>
            <Controller
                name={name}
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <>
                        <LargeLabel text={labelText} />
                        <DateTimeField
                            dataE2eDate={`${dataE2e}_date`}
                            dataE2eTime={`${dataE2e}_time`}
                            disabled={disabled}
                            onChange={onChange}
                            onBlur={onBlur}
                            withPortal={withPortal}
                            popperPlacement={popperPlacement}
                            value={value}
                            isCompactDate={isCompactDate}
                        />
                    </>
                )}
            />
            {errorText ? (
                <Text color="red" paddingY={3} size="m">
                    {errorText}
                </Text>
            ) : null}
        </>
    );
};

export default FormDateTimeField;
