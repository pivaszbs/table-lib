import { useAtom } from '@reatom/react';
import React, { memo } from 'react';
import { TableDataStore } from './entities/types';
import TablePageView from './components/TablePageView';
import { CustomFilterRenderFunction, MultipleTankerKeyset, Nullable, TableConfig, TableDictionary } from './types';

import { usePageData } from './utils/usePageData';
import Spinner from './components/Spinner';

interface Props {
    dictionaries: Nullable<TableDictionary>;
    tableConfig: TableConfig;
    tableStore: TableDataStore;
    tankerKeyset?: MultipleTankerKeyset;
    linkRouterHandler?: (url: string) => void;
    customFiltersRender?: CustomFilterRenderFunction;
}

const TableContainer = ({
    dictionaries,
    tableConfig,
    tableStore,
    tankerKeyset,
    linkRouterHandler,
    customFiltersRender,
}: Props) => {
    const {
        nextPage,
        title,
        loading,
        tableData,
        activeFilters,
        onClear,
        tableRef,
        paginationData,
        setPaginationLimit,
        setPaginationOffset,
        headerButtons,
        modal,
        settingsModal,
        columnsMeta,
        customFilters,
        onSettingsClick,
        onResize,
        renderCounter,
        cachedDataAtom,
        dataList,
        canNext,
        emptyListMessage,
        isAsyncLoading,
    } = usePageData({
        tableTitle: tableConfig.title,
        tableStore,
        tableConfig,
        tankerKeyset,
        linkRouterHandler,
        dictionaries: dictionaries || {},
    });

    const cachedData = useAtom(cachedDataAtom);

    return cachedData !== null ? (
        <>
            {customFiltersRender && customFiltersRender({ updateFunction: tableStore.externalUpdateFunction })}
            <TablePageView
                tableRef={tableRef}
                activeFilters={activeFilters}
                onClear={onClear}
                onSettingsClick={onSettingsClick}
                loading={loading}
                title={title}
                data={tableData}
                loadNext={nextPage}
                emptyListMessage={emptyListMessage}
                pagination={tableConfig.pagination}
                paginationData={paginationData}
                setOffset={setPaginationOffset}
                setLimit={setPaginationLimit}
                headerButtons={headerButtons}
                rowUniqueField={tableConfig.rowUniqueField}
                columnsMeta={columnsMeta}
                customFilters={customFilters}
                isResizable={tableConfig.isResizable}
                withoutClearFiltersButton={tableConfig.withoutClearFiltersButton}
                hasTableSettings={tableConfig.hasTableSettings}
                cachedData={cachedData}
                onResize={onResize}
                renderCounter={renderCounter}
                hasTitle={tableConfig.hasTitle}
                dataList={dataList}
                canNext={canNext}
                isAsyncLoading={isAsyncLoading}
            />
            {modal}
            {settingsModal}
        </>
    ) : (
        <Spinner />
    );
};

export default memo(TableContainer);
