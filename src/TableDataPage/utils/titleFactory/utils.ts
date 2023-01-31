import i18n from '@yandex-int/i18n';
import { format, parse } from 'date-fns';
import * as keyset from '../../TableDataPage.i18n';
import { DateRangeForm } from '../../components/RangeDateForm/types';
import { getFormattedDateString } from '../../entities/utils';
import { ColumnType, ColumnTypesEnum } from '../../types';
import { TextValueFormatterParams } from './types';

const i18N = i18n(keyset);

export const getFormattedDateRange = (id: null | string, initialValues: Record<string, string>): DateRangeForm => {
    let singleDate;
    const [dateStart, timeStart = ''] =
        id !== null && Object.prototype.hasOwnProperty.call(initialValues, `${id}_ge`)
            ? getFormattedDateString(initialValues[`${id}_ge`])
            : ['', ''];
    const [dateEnd, timeEnd = ''] =
        id !== null && Object.prototype.hasOwnProperty.call(initialValues, `${id}_le`)
            ? getFormattedDateString(initialValues[`${id}_le`])
            : ['', ''];
    const visibleTimeStart = timeStart.split(':').slice(0, 2).join(':');
    const visibleTimeEnd = timeEnd.split(':').slice(0, 2).join(':');
    if (dateStart === dateEnd) {
        if (timeStart === '00:00:00' && timeEnd === '23:59:59') {
            singleDate = {
                date: dateStart,
                time: '',
            };
        } else if (timeStart === timeEnd) {
            singleDate = {
                date: dateStart,
                time: visibleTimeStart,
            };
        }
    }

    return {
        from: {
            date: dateStart,
            time: visibleTimeStart,
        },
        to: {
            date: dateEnd,
            time: visibleTimeEnd,
        },
        singleDate,
    };
};

export const trimPercentSymbols = (value: string) => {
    let newValue = value.replace(/^%/, '');
    newValue = newValue.replace(/%$/, '');
    return newValue;
};

export const getFormattedTitle = (
    id: null | string,
    initialValues: Record<string, string>,
    type: ColumnType,
    autoLikeFilterStyle: boolean,
    multiListSeparator: string
) => {
    if (id && initialValues[id] && type === ColumnTypesEnum.MULTI_STRING && autoLikeFilterStyle && id) {
        return initialValues[id]
            .split(',')
            .map((value) => trimPercentSymbols(value))
            .join(multiListSeparator);
    }
    if (type !== 'DateField' && type !== 'DateTimeField') {
        if (id !== null && Object.prototype.hasOwnProperty.call(initialValues, id)) {
            const formattedValue = initialValues[id].replace(/'/gi, '');
            return autoLikeFilterStyle ? trimPercentSymbols(formattedValue) : formattedValue;
        }

        return '';
    }

    const {
        to: { date: to },
        from: { date: from },
    } = getFormattedDateRange(id, initialValues);
    const dateStart = from ? format(parse(from, 'yyyy-mm-dd', new Date()), 'dd.mm.yy') : '';
    const dateEnd = to ? format(parse(to, 'yyyy-mm-dd', new Date()), 'dd.mm.yy') : '';
    if (!from && !to) {
        return i18N('Выбрать период');
    }
    if (from && to) {
        return `${dateStart}-${dateEnd}`;
    }
    if (from && !to) {
        return i18N(`С {dateStart}`, {
            dateStart,
        });
    }

    return i18N(`До {dateEnd}`, {
        dateEnd,
    });
};

export const getFormattedTextValue = ({ value, autoLikeFilterStyle, withSpaceTrimmer }: TextValueFormatterParams) => {
    let formattedValue = value;
    if (withSpaceTrimmer) {
        formattedValue = value.trim();
    }

    if (autoLikeFilterStyle) {
        formattedValue = `%${formattedValue}%`;
    }

    return formattedValue;
};
