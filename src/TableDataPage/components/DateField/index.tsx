import React, { useCallback, memo, useMemo, useState, useEffect } from 'react';
import { ReactDatePickerProps } from 'react-datepicker';
import { Box, Text } from '@yandex-levitan/b2b';
import TextField from '../LargeTextField';
import DatePicker from '../DatePicker';
import { getFormattedInputValue, parseDate } from './utils';

import { INPUT_MASK, DATE_REGEX, COMPACT_INPUT_MASK } from './constants';
import styles from './style.pcss';

interface Props {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    withPortal?: boolean;
    dataE2e?: string;
    fieldLabel?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    isCompactDate?: boolean;
    popperPlacement?: ReactDatePickerProps['popperPlacement'];
}

const DateField = ({
    dataE2e,
    value,
    disabled,
    onChange,
    onBlur,
    withPortal,
    autoFocus,
    isCompactDate = false,
    popperPlacement,
    fieldLabel,
}: Props) => {
    const [inputValue, setInputValue] = useState(value);

    const formattedInputValue = useMemo(() => {
        const [year, month, day] = inputValue.split('-');
        const visibleYear = isCompactDate ? year.slice(2) : year;
        return `${day}.${month}.${visibleYear}`;
    }, [inputValue, isCompactDate]);

    const selectedDate = useMemo(
        () => (inputValue.match(DATE_REGEX) ? new Date(inputValue) : new Date()),
        [inputValue]
    );

    const handleDatePick = useCallback(
        (pickedDate: Date) => {
            const formattedDate = parseDate(pickedDate);
            onChange(formattedDate);
        },
        [onChange]
    );

    const handleInputChange = useCallback(
        (newValue: string) => {
            const formattedDate = getFormattedInputValue(newValue, isCompactDate);
            if (formattedDate.match(DATE_REGEX)) {
                onChange(formattedDate);
            } else {
                onChange('');
            }

            setInputValue(formattedDate);
        },
        [onChange, isCompactDate]
    );

    const mask = isCompactDate ? COMPACT_INPUT_MASK : INPUT_MASK;

    useEffect(() => {
        if (value.match(DATE_REGEX)) {
            setInputValue(value);
        }
    }, [value]);

    const labelWidth = '50%';
    const datePickerWidth = fieldLabel ? '50%' : '100%';
    const formattedPlaceholder = isCompactDate ? 'dd.mm.yy' : 'dd.mm.yyyy';

    return (
        <div className={styles.wrapper}>
            {fieldLabel && (
                <Box width={labelWidth}>
                    <Text size="l">{fieldLabel}</Text>
                </Box>
            )}
            <Box width={datePickerWidth}>
                <TextField
                    data-e2e={dataE2e}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    value={formattedInputValue}
                    onChange={handleInputChange}
                    placeholder={formattedPlaceholder}
                    mask={mask}
                />
                <div className={styles.calendar}>
                    <DatePicker
                        selectedDate={selectedDate}
                        withPortal={withPortal}
                        onChange={handleDatePick}
                        onBlur={onBlur}
                        disabled={disabled}
                        popperPlacement={popperPlacement}
                    />
                </div>
            </Box>
        </div>
    );
};

export default memo(DateField);
