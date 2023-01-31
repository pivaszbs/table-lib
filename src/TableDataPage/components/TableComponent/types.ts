import { RefObject } from 'react';
import { TableDataCache, TableData, TableValues, Pagination, PagerPagination, ColumnsMeta, Content } from '../../types';

export interface Props {
    loading: boolean;
    loadNext?: () => void;
    data: TableData;
    tableRef?: RefObject<HTMLDivElement>;
    keyFinder?: (value: TableValues[]) => string;
    emptyListMessage: string;
    pagination?: Pagination | PagerPagination;
    isResizable: boolean;
    canNext: boolean;
    columnsMeta: ColumnsMeta;
    cachedData: TableDataCache;
    onResize: (data: TableDataCache) => void;
    renderCounter: number;
    rowUniqueField?: string;
    dataList?: Content[];
}
