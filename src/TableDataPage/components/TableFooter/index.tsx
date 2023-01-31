import React, { PropsWithChildren, RefObject, memo, useMemo } from 'react';
import noop from 'lodash/noop';
import Paginator from '../Paginator';
import { PaginationData } from '../../entities/types';
import { PagerPagination, Pagination, PaginationTypesEnum } from '../../types';
// TODO: Add Footer

interface Props {
    loading?: boolean;
    tableRef?: RefObject<HTMLDivElement>;
    pagination?: Pagination | PagerPagination;
    paginationData: PaginationData;
    setLimit?: (value: number) => void;
    setOffset?: (value: number) => void;
}

const TableFooter = ({
    loading = false,
    tableRef,
    pagination,
    paginationData,
    setLimit = noop,
    setOffset = noop,
}: PropsWithChildren<Props>) => {
    const footerContent = useMemo(
        () =>
            pagination?.type === PaginationTypesEnum.PAGER ? (
                <Paginator
                    loading={loading}
                    setLimit={setLimit}
                    setOffset={setOffset}
                    paginationData={paginationData}
                    tableRef={tableRef}
                />
            ) : null,
        [loading, setLimit, setOffset, paginationData]
    );

    return footerContent;
};

export default memo(TableFooter);
