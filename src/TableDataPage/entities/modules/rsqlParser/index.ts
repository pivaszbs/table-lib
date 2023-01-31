import {
    RsqlFilterValue,
    RsqlStringFilterValue,
    RsqlListFilterValue,
    RsqlFilterOps,
    RsqlRangeFilterValue,
    rsqlSingleValueFilterOps,
    RsqlSingleValueFilterOps,
} from './types';

export class RSQLParser {
    operators: string[];

    opMapper: (name: string, operator: string, value: string, rawRsqlString: string) => RsqlFilterValue;

    static RSQL_OPS = [
        '==',
        '=q=',
        '=like=',
        '=in=',
        '!=',
        '=notlike=',
        '=lt=',
        '<=',
        '<',
        '=le=',
        '=gt=',
        '>=',
        '=ge=',
        '>',
        '=rng=',
    ];

    static RSQL_MAPPER = (name: string, operator: string, value: string, rawRsqlString: string): RsqlFilterValue => {
        const RsqlFilterOpsMap: Record<string, RsqlFilterOps> = {
            '==': 'EQUAL',
            '!=': 'N_EQUAL',
            '=q=': 'SEARCH',
            '=like=': 'LIKE',
            '=notlike=': 'N_LIKE',
            '<': 'LESS',
            '=lt=': 'LESS',
            '>': 'GREAT',
            '=gt=': 'GREAT',
            '>=': 'GREAT_EQ',
            '=ge=': 'GREAT_EQ',
            '<=': 'LESS_EQ',
            '=le=': 'LESS_EQ',
            '=in=': 'IN',
            '=rng=': 'RANGE',
        };

        const parsedOperator = RsqlFilterOpsMap[operator];

        if (rsqlSingleValueFilterOps.includes(parsedOperator as RsqlSingleValueFilterOps)) {
            return {
                name,
                value,
                op: parsedOperator,
                rawRsqlString,
            };
        }
        if (parsedOperator === 'IN') {
            return {
                name,
                values: value.replace(/\(|\)/g, '').split(','),
                rawRsqlString,
            };
        }
        if (parsedOperator === 'RANGE') {
            return {
                name,
                start: value.replace(/\(|\)/g, '').split(',')[0],
                end: value.replace(/\(|\)/g, '').split(',')[1],
                rawRsqlString,
            };
        }
        return { name, rawRsqlString };
    };

    constructor(
        operators: string[],
        opMapper: (name: string, operator: string, value: string, rawRsqlString: string) => RsqlFilterValue
    ) {
        this.operators = operators;
        this.opMapper = opMapper;
    }

    parse = (rsqlString: string): RsqlFilterValue[] => {
        const filters = rsqlString.split(';').filter(Boolean);

        if (filters.length) {
            return filters.map((filterString: string) => {
                const args = this.getFilterLexems(filterString, this.operators);
                return this.opMapper(...args, filterString);
            });
        }
        return [];
    };

    // works only by built-in RSQL for now
    stringify = (filters: Omit<RsqlFilterValue, 'rawRsqlString'>[]): string => {
        const RsqlFilterOpToStringMap: Record<RsqlFilterOps, string> = {
            EQUAL: '==',
            N_EQUAL: '!=',
            LIKE: '=like=',
            N_LIKE: '=notlike=',
            IN: '=in=',
            SEARCH: '=q=',
            LESS: '=lt=',
            GREAT: '=gt=',
            LESS_EQ: '=le=',
            GREAT_EQ: '=ge=',
            RANGE: '=rng=',
        };

        return filters.reduce((prev, curr) => {
            if ((curr as RsqlStringFilterValue).op) {
                const { name, op, value } = curr as RsqlStringFilterValue;
                return `${prev}${name}${RsqlFilterOpToStringMap[op]}${value};`;
            }
            if ((curr as RsqlListFilterValue).values) {
                const { name, values } = curr as RsqlListFilterValue;
                return `${prev}${name}${RsqlFilterOpToStringMap.IN}(${values.join(',')});`;
            }
            if ((curr as RsqlRangeFilterValue).start) {
                const { name, start, end } = curr as RsqlRangeFilterValue;
                return `${prev}${name}${RsqlFilterOpToStringMap.RANGE}(${start},${end});`;
            }
            return '';
        }, '');
    };

    private getFilterLexems = (filterString: string, ops: string[]): [string, string, string] => {
        // Handles expr (x==y,x==z) by changing them to x=in=(y,z)
        // TODO: Replace with some kind of combination types
        if (filterString.match(/^\(.*\)$/g)?.length === 1) {
            const filtersCombinationString = filterString.replace(/\(|\)/g, '');
            const name = filtersCombinationString.substr(0, filtersCombinationString.indexOf('=='));
            const values = filtersCombinationString
                .split(',')
                .map((filter) => filter.substr(filter.indexOf('==') + 2).replace(/'/g, ''));
            return [name, '=in=', `(${values.join(',')})`];
        }

        let foundOp = '';
        for (let i = 0; i < ops.length; i += 1) {
            if (filterString.includes(ops[i])) {
                foundOp = ops[i];
                break;
            }
        }

        const idx = filterString.indexOf(foundOp);
        return [filterString.substr(0, idx), foundOp, filterString.substr(idx + foundOp.length).replace(/'/g, '')];
    };
}
