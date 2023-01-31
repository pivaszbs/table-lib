import { ReactNode, RefObject } from 'react';
import { GroupFilter, PaginationData } from '../../entities/types';
import {
    ChipType,
    ColumnsMeta,
    Content,
    PagerPagination,
    Pagination,
    TableData,
    TableDataCache,
    TableValues,
} from '../../types';

export interface Props {
    title?: string;
    activeFilters?: ChipType[];
    onClear?: () => void;
    loading?: boolean;
    loadNext?: () => void;
    data: TableData;
    tableRef?: RefObject<HTMLDivElement>;
    keyFinder?: (value: TableValues[]) => string;
    rowUniqueField?: string;
    emptyListMessage?: string;
    pagination?: Pagination | PagerPagination;
    paginationData?: PaginationData;
    setLimit?: (value: number) => void;
    setOffset?: (value: number) => void;
    onSettingsClick?: () => void;
    headerButtons?: ReactNode[];
    hasTitle?: boolean;
    isResizable?: boolean;
    isSettingsModalActive?: boolean;
    hasTableSettings?: boolean;
    canNext?: boolean;
    columnsMeta?: ColumnsMeta;
    cachedData?: TableDataCache;
    onResize?: (data: TableDataCache) => void;
    renderCounter?: number;
    withoutClearFiltersButton?: boolean;
    groupFilters?: Record<string, GroupFilter>;
    customFilters?: ReactNode[];
    dataList?: Content[];
    isAsyncLoading?: boolean;
}
