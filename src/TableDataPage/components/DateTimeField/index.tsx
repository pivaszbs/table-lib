import React, { useCallback, memo } from 'react';
import { ReactDatePickerProps } from 'react-datepicker';
import { Box } from '@yandex-levitan/b2b';
import DateField from '../DateField';
import TimeField from '../TimeField';
import { BaseComponentProps } from '../../types';

export interface DateTimeValue {
    time: string;
    date: string;
}

interface Props extends BaseComponentProps {
    value: DateTimeValue;
    onChange: (value: DateTimeValue) => void;
    withPortal?: boolean;
    isCompactDate?: boolean;
    dataE2eDate?: string;
    dataE2eTime?: string;
    popperPlacement?: ReactDatePickerProps['popperPlacement'];
}

const DateTimeField = ({
    value = {
        date: '',
        time: '',
    },
    onChange,
    disabled = false,
    withPortal,
    isCompactDate,
    onBlur,
    dataE2eDate = '',
    dataE2eTime = '',
    popperPlacement,
}: Props) => {
    const handleTimeChange = useCallback(
        (newValue: string) =>
            onChange({
                date: value.date,
                time: newValue,
            }),
        [onChange, value]
    );

    const handleDateChange = useCallback(
        (newValue: string) =>
            onChange({
                date: newValue,
                time: value.time,
            }),
        [onChange, value]
    );

    const handleBlur = useCallback(() => onBlur?.(), [onBlur]);

    return (
        <Box direction="row">
            <Box flex={3}>
                <DateField
                    withPortal={withPortal}
                    disabled={disabled}
                    value={value.date}
                    onChange={handleDateChange}
                    onBlur={handleBlur}
                    isCompactDate={isCompactDate}
                    dataE2e={dataE2eDate}
                    popperPlacement={popperPlacement}
                />
            </Box>
            <Box margin="0 0 0 12px">
                <TimeField
                    disabled={disabled}
                    value={value.time}
                    onChange={handleTimeChange}
                    onBlur={handleBlur}
                    dataE2e={dataE2eTime}
                />
            </Box>
        </Box>
    );
};

export default memo(DateTimeField);
