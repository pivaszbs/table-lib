/* eslint-disable max-lines */
import noop from 'lodash/noop';
import React, { memo, PropsWithChildren, useMemo } from 'react';
import FixedFooterHeaderLayout from '../../layout/FixedFooterHeaderLayout';
import TableComponent from '../TableComponent';
import TableFooter from '../TableFooter';
import TableHeader from '../TableHeader';
import { DEFAULT_PAGINATION_DATA } from '../../entities';

import { Props } from './types';

const TablePageView = ({
    title,
    activeFilters,
    onClear,
    onSettingsClick,
    loading = false,
    loadNext,
    data,
    tableRef,
    keyFinder,
    rowUniqueField,
    emptyListMessage = 'По заданному фильтру отсутствуют данные',
    pagination,
    paginationData = DEFAULT_PAGINATION_DATA,
    setLimit,
    setOffset,
    hasTitle = false,
    hasTableSettings = false,
    isResizable = false,
    withoutClearFiltersButton = false,
    canNext = true,
    isAsyncLoading = false,
    renderCounter = 0,
    headerButtons = [],
    columnsMeta = [],
    customFilters = [],
    cachedData = {},
    dataList,
    onResize = noop,
}: PropsWithChildren<Props>) => {
    const content = useMemo(
        () => (
            <TableComponent
                onResize={onResize}
                cachedData={cachedData}
                columnsMeta={columnsMeta}
                renderCounter={renderCounter}
                emptyListMessage={emptyListMessage}
                pagination={pagination}
                isResizable={isResizable}
                loading={loading}
                loadNext={loadNext}
                data={data}
                tableRef={tableRef}
                keyFinder={keyFinder}
                rowUniqueField={rowUniqueField}
                dataList={dataList}
                canNext={canNext}
            />
        ),
        [
            onResize,
            cachedData,
            columnsMeta,
            renderCounter,
            emptyListMessage,
            pagination,
            isResizable,
            loading,
            loadNext,
            data,
            keyFinder,
            rowUniqueField,
            dataList,
            canNext,
        ]
    );
    const footer = useMemo(
        () => (
            <TableFooter
                loading={loading}
                tableRef={tableRef}
                pagination={pagination}
                paginationData={paginationData}
                setLimit={setLimit}
                setOffset={setOffset}
            />
        ),
        [loading, paginationData, pagination, setLimit, setOffset]
    );
    const header = useMemo(
        () => (
            <TableHeader
                title={title}
                activeFilters={activeFilters}
                onClear={onClear}
                onSettingsClick={onSettingsClick}
                loading={loading}
                hasTitle={hasTitle}
                hasTableSettings={hasTableSettings}
                headerButtons={headerButtons}
                customFilters={customFilters}
                withoutClearFiltersButton={withoutClearFiltersButton}
                isAsyncLoading={isAsyncLoading}
            />
        ),
        [
            title,
            activeFilters,
            onClear,
            onSettingsClick,
            loading,
            hasTitle,
            hasTableSettings,
            headerButtons,
            customFilters,
            withoutClearFiltersButton,
            isAsyncLoading,
        ]
    );
    return <FixedFooterHeaderLayout content={content} footer={footer} header={header} contentRef={tableRef} />;
};

export default memo(TablePageView);
