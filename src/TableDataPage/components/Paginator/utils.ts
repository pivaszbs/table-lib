import i18n from '@yandex-int/i18n';
import * as keyset from '../../TableDataPage.i18n';
import { PaginationData } from '../../entities/types';

const i18N = i18n(keyset);

export const getLimitValue = (paginationData: PaginationData) => ({
    value: `${paginationData.currentPageData.limit}`,
    label: `${paginationData.currentPageData.limit}`,
});

export const getPaginationOptions = (paginationData: PaginationData) =>
    paginationData.options.map((value) => ({
        value: `${value}`,
        label: `${value}`,
    }));

export const calculateTotalPages = (paginationData: PaginationData) =>
    Math.ceil(paginationData.total / paginationData.currentPageData.limit);

export const calculateCurrentPage = (paginationData: PaginationData) =>
    Math.floor(paginationData.currentPageData.offset / paginationData.currentPageData.limit) + 1;

export const getRangeText = ({ currentPageData: { offset, limit }, total }: PaginationData) => {
    if (!total) {
        return '';
    }
    const rangeStart = offset + 1;
    const lastItemIndexOnPage = offset + limit;
    const rangeEnd = total < lastItemIndexOnPage ? total : lastItemIndexOnPage;

    return i18N('{rangeStart}-{rangeEnd} из {total}', {
        rangeStart,
        rangeEnd,
        total,
    });
};
