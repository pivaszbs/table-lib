import React, { useCallback, memo } from 'react';
import TextField from '../LargeTextField';
import { BaseComponentProps } from '../../types';

export const TIME_MASK = [/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/];

interface Props extends BaseComponentProps {
    value: string;
    onChange: (value: string) => void;
    withPortal?: boolean;
}

const TimeField = ({ value, onChange, disabled = false, onBlur, dataE2e }: Props) => {
    const handleTimeChange = useCallback(
        (newValue: string) => {
            let formattedTimeValue = newValue;
            const digitValue = newValue.replace(/[^\d]*/gi, '');
            if (digitValue.length === 2) {
                if (Number(digitValue) > 23) {
                    formattedTimeValue = `00${newValue.slice(2)}`;
                }
            }
            if (digitValue.length === 4) {
                if (Number(digitValue.slice(2)) > 59) {
                    formattedTimeValue = `${newValue.slice(0, 3)}59`;
                }
            }

            onChange(formattedTimeValue);
        },
        [onChange]
    );

    const handleBlur = useCallback(() => onBlur?.(), [onBlur]);

    return (
        <TextField
            disabled={disabled}
            value={value}
            onChange={handleTimeChange}
            onBlur={handleBlur}
            placeholder="hh:mm"
            mask={TIME_MASK}
            data-e2e={dataE2e}
        />
    );
};

export default memo(TimeField);
