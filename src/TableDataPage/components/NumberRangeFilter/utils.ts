import { FormData } from '../RangeDateForm/types';
import { NumbersRangeEnum, RANGE_FILTER_TAGS, RangeTypesMapper } from '../../entities/constants';
import { RangeLabelMapper } from './constants';
import { NumberRangeValue } from './types';

export const getRangeValue = (value: string, mode: NumbersRangeEnum): FormData | string => {
    switch (mode) {
        case NumbersRangeEnum.GREATER:
            return {
                from: value,
                isStrictFrom: true,
            };
        case NumbersRangeEnum.GREATER_EQUAL:
            return {
                from: value,
            };
        case NumbersRangeEnum.LESS:
            return {
                to: value,
                isStrictTo: true,
            };
        case NumbersRangeEnum.LESS_EQUAL:
            return {
                to: value,
            };
        default:
            return value;
    }
};

export const getFormattedRange = (initialValues: Record<string, string>, columnId: string): NumberRangeValue => {
    if (columnId in initialValues) {
        return {
            value: initialValues[columnId],
            mode: {
                value: NumbersRangeEnum.EQUAL,
                label: RangeLabelMapper[NumbersRangeEnum.EQUAL],
            },
        };
    }

    const initialData = RANGE_FILTER_TAGS.reduce(
        (prevValue, separator) => {
            const valueKey = `${columnId}_${separator}`;
            if (valueKey in initialValues) {
                return {
                    value: initialValues[valueKey],
                    mode: {
                        value: RangeTypesMapper[separator],
                        label: RangeLabelMapper[RangeTypesMapper[separator]],
                    },
                };
            }

            return prevValue;
        },
        { value: '', mode: { value: NumbersRangeEnum.EQUAL, label: RangeLabelMapper[NumbersRangeEnum.EQUAL] } }
    );

    return initialData;
};
