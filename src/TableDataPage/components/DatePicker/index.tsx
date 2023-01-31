import React, { ReactNode, memo } from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import ruLocale from 'date-fns/locale/ru';
import { Locale } from 'date-fns';

import DatePickerInput from './DatePickerInput';
import styles from './style.pcss';

export interface Props {
    selectedDate: Date;
    withPortal?: boolean;
    input?: ReactNode;
    locale?: Locale;
    onBlur?: () => void;
    onChange: (value: Date) => void;
    disabled?: boolean;
    popperPlacement?: ReactDatePickerProps['popperPlacement'];
}

const DatePicker = ({
    selectedDate,
    withPortal = true,
    input = <DatePickerInput />,
    locale = ruLocale,
    onChange,
    onBlur,
    disabled,
    popperPlacement = 'top-end',
}: Props) => {
    return (
        <div className={styles.datePickerContainer}>
            <ReactDatePicker
                dateFormat="dd.MM.yyyy"
                fixedHeight
                showMonthDropdown
                showYearDropdown
                popperPlacement={popperPlacement}
                withPortal={withPortal}
                selected={selectedDate}
                customInput={input}
                locale={locale}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
            />
        </div>
    );
};

export default memo(DatePicker);
