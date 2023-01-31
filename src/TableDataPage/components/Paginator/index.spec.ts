import { getRangeText } from './utils';

const OPTIONS = [0, 10, 15, 100];

describe('Утилита формирования выбранного диапазона пагинации', () => {
    it('Пустой список, total === 0', () => {
        const formattedDate = getRangeText({
            currentPageData: {
                offset: 0,
                limit: 10,
            },
            total: 0,
            options: OPTIONS,
        });
        expect(formattedDate).toEqual('');
    });

    it('Диапазон на первой странице, limit === 10', () => {
        const formattedDate = getRangeText({
            currentPageData: {
                offset: 0,
                limit: 10,
            },
            total: 100,
            options: OPTIONS,
        });
        expect(formattedDate).toEqual('1-10 из 100');
    });

    it('Диапазон на третьей странице странице, limit === 10', () => {
        const formattedDate = getRangeText({
            currentPageData: {
                offset: 20,
                limit: 10,
            },
            total: 100,
            options: OPTIONS,
        });
        expect(formattedDate).toEqual('21-30 из 100');
    });

    it('Диапазон при total < limit', () => {
        const formattedDate = getRangeText({
            currentPageData: {
                offset: 0,
                limit: 10,
            },
            total: 9,
            options: OPTIONS,
        });
        expect(formattedDate).toEqual('1-9 из 9');
    });

    it('Диапазон при total равном limit', () => {
        const formattedDate = getRangeText({
            currentPageData: {
                offset: 0,
                limit: 10,
            },
            total: 10,
            options: OPTIONS,
        });
        expect(formattedDate).toEqual('1-10 из 10');
    });
});
