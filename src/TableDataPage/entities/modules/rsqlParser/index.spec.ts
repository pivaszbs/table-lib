import { RSQLParser } from '.';

const parser = new RSQLParser(RSQLParser.RSQL_OPS, RSQLParser.RSQL_MAPPER);

describe('Парсер RSQL строк', () => {
    it('Пустая строка', () => {
        const result = parser.parse('');
        expect(result).toEqual([]);
    });

    it('Одиночный строковый фильтр ==', () => {
        const result = parser.parse('hello==world');
        expect(result).toEqual([
            {
                name: 'hello',
                value: 'world',
                op: 'EQUAL',
                rawRsqlString: 'hello==world',
            },
        ]);
    });

    it('Множество строковых фильтров', () => {
        const result = parser.parse('hello=like=world;foo<=bar');
        expect(result).toEqual([
            {
                name: 'hello',
                value: 'world',
                op: 'LIKE',
                rawRsqlString: 'hello=like=world',
            },
            {
                name: 'foo',
                op: 'LESS_EQ',
                value: 'bar',
                rawRsqlString: 'foo<=bar',
            },
        ]);
    });

    it('Фильтры со списками', () => {
        const result = parser.parse("hello=like='world';foo=in=(bar,baz);kek=rng=(kek1,kek2)");
        expect(result).toEqual([
            {
                name: 'hello',
                value: 'world',
                op: 'LIKE',
                rawRsqlString: "hello=like='world'",
            },
            {
                name: 'foo',
                values: ['bar', 'baz'],
                rawRsqlString: 'foo=in=(bar,baz)',
            },
            {
                name: 'kek',
                start: 'kek1',
                end: 'kek2',
                rawRsqlString: 'kek=rng=(kek1,kek2)',
            },
        ]);
    });

    it('Фильтры с комбинациями', () => {
        const result = parser.parse("hello=like='world';(foo==bar,foo=='baz');kek=rng=(kek1,kek2)");
        expect(result).toEqual([
            {
                name: 'hello',
                value: 'world',
                op: 'LIKE',
                rawRsqlString: "hello=like='world'",
            },
            {
                name: 'foo',
                values: ['bar', 'baz'],
                rawRsqlString: "(foo==bar,foo=='baz')",
            },
            {
                name: 'kek',
                start: 'kek1',
                end: 'kek2',
                rawRsqlString: 'kek=rng=(kek1,kek2)',
            },
        ]);
    });

    it('Фильтры с датами', () => {
        const result = parser.parse("startTime=ge='2021-10-10 00:00';startTime=le='2021-11-11 23:59'");
        expect(result).toEqual([
            {
                name: 'startTime',
                value: '2021-10-10 00:00',
                op: 'GREAT_EQ',
                rawRsqlString: "startTime=ge='2021-10-10 00:00'",
            },
            {
                name: 'startTime',
                value: '2021-11-11 23:59',
                op: 'LESS_EQ',
                rawRsqlString: "startTime=le='2021-11-11 23:59'",
            },
        ]);
    });
});
