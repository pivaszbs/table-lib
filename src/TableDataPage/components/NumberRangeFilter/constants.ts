import { SelectorItem } from '../DynamicSelect/types';
import { NumbersRangeEnum } from '../../entities/constants';

export const RangeLabelMapper = {
    [NumbersRangeEnum.LESS]: '<',
    [NumbersRangeEnum.GREATER]: '>',
    [NumbersRangeEnum.LESS_EQUAL]: '≤',
    [NumbersRangeEnum.GREATER_EQUAL]: '≥',
    [NumbersRangeEnum.EQUAL]: '=',
};

export const DEFAULT_MODE = {
    value: NumbersRangeEnum.EQUAL,
    label: RangeLabelMapper[NumbersRangeEnum.EQUAL],
} as const;

export const SELECT_ITEMS: SelectorItem[] = [
    {
        label: RangeLabelMapper[NumbersRangeEnum.LESS],
        value: NumbersRangeEnum.LESS,
    } as const,
    {
        label: RangeLabelMapper[NumbersRangeEnum.GREATER],
        value: NumbersRangeEnum.GREATER,
    } as const,
    {
        label: RangeLabelMapper[NumbersRangeEnum.LESS_EQUAL],
        value: NumbersRangeEnum.LESS_EQUAL,
    } as const,
    {
        label: RangeLabelMapper[NumbersRangeEnum.GREATER_EQUAL],
        value: NumbersRangeEnum.GREATER_EQUAL,
    } as const,
    DEFAULT_MODE,
];
