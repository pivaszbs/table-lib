import { ColumnType } from '../../types';

import { DateRangeForm, FormData } from './types';
import { DEFAULT_END_TIME, DEFAULT_START_TIME } from './constants';

interface Params {
    isRangeSettingActive: boolean;
    initialData: DateRangeForm;
    type: ColumnType;
}

export const getDateRangeInitialData = ({ isRangeSettingActive, initialData, type }: Params) => {
    if (isRangeSettingActive) {
        if (type === 'DateTimeField') {
            const { singleDate, ...dateRangeInitialValue } = initialData;
            return dateRangeInitialValue;
        }
        return {
            to: initialData.to.date,
            from: initialData.from.date,
        };
    }
    if (initialData.singleDate) {
        return {
            from: {
                date: initialData.singleDate.date,
                time: initialData.singleDate.time,
            },
            to: {
                date: '',
                time: '',
            },
        };
    }

    return {
        from: {
            date: '',
            time: '',
        },
        to: {
            date: '',
            time: '',
        },
    };
};

export const getDateTimeRangeValue = (value: DateRangeForm): FormData => {
    const endTime = value.to.time ? `${value.to.time}:59` : DEFAULT_END_TIME;
    const startTime = value.from.time ? `${value.from.time}:00` : DEFAULT_START_TIME;
    const startDate = value.from.date || '';
    const endDate = value.to.date || '';
    const to = endDate ? `${endDate} ${endTime}` : '';
    const from = startDate ? `${startDate} ${startTime}` : '';

    return {
        to,
        from,
    };
};

export const getDateRangeValue = ({ to, from }: FormData): FormData => {
    const endDate = to ? `${to} ${DEFAULT_END_TIME}` : '';
    const startDate = from ? `${from} ${DEFAULT_START_TIME}` : '';

    return {
        to: endDate,
        from: startDate,
    };
};
