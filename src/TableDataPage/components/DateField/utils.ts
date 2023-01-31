import { format, isLeapYear } from 'date-fns';

const MAX_DAYS_IN_MONTH = 31;
const MAX_MONTHS_NUMBER = 12;

const DAYS_VALUES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const DATE_TEMPLATE = 'yyyy-MM-dd';

const getDigitValue = (value: string) => (value ? value.replace(/[^\d]*/gi, '') : '');

const getMaxDaysInMonth = (month: string, year: string): number => {
    const digitMonthValue = getDigitValue(month);
    const digitYearValue = getDigitValue(year);
    if (digitMonthValue.length === 2) {
        if (Number(digitMonthValue) !== 2) {
            return DAYS_VALUES[Number(month) - 1];
        }
        // В проверке високосного года пробрасывается случайная дата, так как isLeapYear принимает дату, а не просто год
        const couldYearBeLeap =
            digitYearValue.length !== 4 ||
            (digitYearValue.length === 4 && isLeapYear(new Date(Number(digitYearValue), 6, 1)));
        return couldYearBeLeap ? DAYS_VALUES[1] + 1 : DAYS_VALUES[1];
    }

    return MAX_DAYS_IN_MONTH;
};

const getFormattedValue = (value: string, maxValue: number): string => {
    if (getDigitValue(value).length === 2 && Number(value) === 0) {
        return '01';
    }

    return Number(value) > maxValue ? `${maxValue}` : value;
};

export const getFormattedInputValue = (value: string, isCompactDate = false): string => {
    if (!value) {
        return value;
    }

    const [days, month, year] = value.split('.');
    const formattedYear = isCompactDate ? `20${year}` : year;
    const formattedMonth = getFormattedValue(month, MAX_MONTHS_NUMBER);
    const maxdaysInMonth = getMaxDaysInMonth(formattedMonth, formattedYear);
    const digitValue = getDigitValue(value);
    if (digitValue.length === 2) {
        if (Number(digitValue) > 31) {
            return `${MAX_DAYS_IN_MONTH}${value.slice(2)}`;
        }
    }
    if (digitValue.length === 4) {
        if (Number(digitValue.slice(2)) > 12) {
            return `${value.slice(0, 3)}${MAX_MONTHS_NUMBER}${value.slice(5)}`;
        }
    }

    const formattedDays = getFormattedValue(days, maxdaysInMonth);
    const formattedValue = `${formattedDays}.${formattedMonth}.${formattedYear}`;

    return formattedValue.split('.').reverse().join('-');
};

export const parseDate = (dateTime?: string | Date): string =>
    dateTime ? format(new Date(dateTime), DATE_TEMPLATE) : '';
