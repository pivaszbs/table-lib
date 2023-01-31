import React, { memo, RefObject, useCallback, useMemo } from 'react';
import { Box, Pager, Text } from '@yandex-levitan/b2b';
import DynamicSelect from '../DynamicSelect';
import { SelectorItem } from '../DynamicSelect/types';
import { PaginationData } from '../../entities/types';
import { getValidItemsOnPageAfterSubmit, validateItemsOnPage } from '../../utils';

import { calculateCurrentPage, calculateTotalPages, getLimitValue, getPaginationOptions, getRangeText } from './utils';

interface Props {
    loading: boolean;
    tableRef?: RefObject<HTMLDivElement>;
    paginationData: PaginationData;
    setLimit: (value: number) => void;
    setOffset: (value: number) => void;
}

const Paginator = ({ loading, tableRef, paginationData, setLimit, setOffset }: Props) => {
    const limitValue = useMemo(() => getLimitValue(paginationData), [paginationData]);
    const paginationOptions = useMemo(() => getPaginationOptions(paginationData), [paginationData]);
    const totalPages = useMemo(() => calculateTotalPages(paginationData), [paginationData]);
    const currentPage = useMemo(() => calculateCurrentPage(paginationData), [paginationData]);
    const itemsRangeText = useMemo(() => getRangeText(paginationData), [paginationData]);
    const handleLimitChange = useCallback(
        (selectValue: SelectorItem | null) => {
            if (!selectValue) {
                return;
            }
            tableRef?.current?.scrollTo({ top: 0, behavior: 'smooth' });
            setLimit(Number(selectValue.value));
            setOffset(0);
        },
        [setLimit, setOffset]
    );
    const handlePageChange = useCallback(
        (newPage: number) => {
            tableRef?.current?.scrollTo({ top: 0, behavior: 'smooth' });
            setOffset((newPage - 1) * paginationData.currentPageData.limit);
        },
        [setOffset, paginationData]
    );

    return (
        <Box padding={3} justifyContent="center" alignItems="center" direction="row">
            <Box width="100px">
                <DynamicSelect
                    isTopOpening
                    value={limitValue}
                    items={paginationOptions}
                    onChange={handleLimitChange}
                    size="s"
                    disabled={loading}
                    hasSearch
                    hasIgnoreValidationOnEnter
                    hasSelfStoreInput
                    searchInputModifier={validateItemsOnPage}
                    textInputEnterSubmitModifier={getValidItemsOnPageAfterSubmit}
                    dataE2e="items_on_page_selector"
                />
            </Box>
            <Box paddingX={3}>
                <Pager
                    data-e2e="table_paginator"
                    size="s"
                    onChange={handlePageChange}
                    total={totalPages}
                    current={currentPage}
                />
            </Box>
            <Text color="Grayscale_AshGray" size="s">
                {itemsRangeText}
            </Text>
        </Box>
    );
};

export default memo(Paginator);
