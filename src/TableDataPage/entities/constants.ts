export enum NumbersRangeEnum {
    LESS = 'LESS',
    GREATER = 'GREATER',
    GREATER_EQUAL = 'GREATER_EQUAL',
    LESS_EQUAL = 'LESS_EQUAL',
    EQUAL = 'EQUAL',
}

export const RangeTypesMapper = {
    ge: NumbersRangeEnum.GREATER_EQUAL,
    le: NumbersRangeEnum.LESS_EQUAL,
    gt: NumbersRangeEnum.GREATER,
    lt: NumbersRangeEnum.LESS,
} as const;

export type RangeSeparators = keyof typeof RangeTypesMapper;

export const RANGE_FILTER_TAGS: RangeSeparators[] = ['le', 'ge', 'gt', 'lt'];

export const SUBSTR_TO_REPLACE = /:\w+/gi;

export const EMPTY_FILTER_SEPARATOR = "''";
