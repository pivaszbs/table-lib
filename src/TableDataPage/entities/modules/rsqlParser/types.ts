export interface RsqlBaseFilterValue {
    name: string;
    rawRsqlString: string;
}

export const rsqlSingleValueFilterOps = [
    'EQUAL',
    'N_EQUAL',
    'SEARCH',
    'LIKE',
    'N_LIKE',
    'LESS',
    'LESS_EQ',
    'GREAT',
    'GREAT_EQ',
] as const;
export type RsqlSingleValueFilterOps = typeof rsqlSingleValueFilterOps[number];

export const rsqlMultiValueFilterOps = ['IN', 'RANGE'] as const;
export type RsqlMultiValueFilterOps = typeof rsqlMultiValueFilterOps[number];

export type RsqlFilterOps = RsqlSingleValueFilterOps | RsqlMultiValueFilterOps;

export interface RsqlStringFilterValue extends RsqlBaseFilterValue {
    value: string;
    op: RsqlFilterOps;
}

export interface RsqlListFilterValue<T = string> extends RsqlBaseFilterValue {
    values: T[];
}

export interface RsqlRangeFilterValue<T = string> extends RsqlBaseFilterValue {
    start: T;
    end: T;
}

export type RsqlFilterValue = RsqlBaseFilterValue | RsqlStringFilterValue | RsqlListFilterValue | RsqlRangeFilterValue;
