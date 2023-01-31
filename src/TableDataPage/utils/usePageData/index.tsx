/* eslint-disable max-lines */
import { useAction, useAtom } from '@reatom/react';
import React, { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFetch, useInterval, useTableFilterParams } from '../../entities/hooks';
import { CheckboxStateType, ColumnInputPayload, TableDataAddFilterParams, TableDataStore } from '../../entities/types';
import { getTableSettingsFormData } from './utils/getTableSettingsFormData';
import { getTitles } from './utils/getTitles';
import { getValues } from './utils/getValues';
import CustomFilterSwitch from '../../components/CustomFilterSwitch';
import TableButton from '../../components/TableButton';
import TableModal from '../../components/TableModal';
import TableSettingsModal from '../../components/TableSettingsModal';
import {
    ButtonAction,
    ColumnConfig,
    CustomFilter,
    EndlessTableDataContent,
    ModalFormSubmitPayload,
    MultipleTankerKeyset,
    PagerTableDataContent,
    PaginationTypesEnum,
    TableConfig,
    TableDataCache,
    TableDictionary,
    Content,
    ColumnTypesEnum,
    DisabledResolver,
} from '../../types';
import { getFetchReadyState } from './utils/getFetchReadyState';
import { cacheApi, CacheNames } from '../cacheApi';
import { handleAtom } from '../handleAtom';

interface PageDataParams {
    dictionaries: TableDictionary;
    tableTitle: string;
    tableStore: TableDataStore;
    tableConfig: TableConfig<Content>;
    tankerKeyset?: MultipleTankerKeyset;
    linkRouterHandler?: (url: string) => void;
}

const DEFAULT_TANKER_KEYSET = {};

export const usePageData = ({
    dictionaries,
    tableTitle,
    tableStore,
    tableConfig,
    tankerKeyset = DEFAULT_TANKER_KEYSET,
    linkRouterHandler,
}: PageDataParams) => {
    const [isSettingsModalActive, setActiveModalSettings] = useState(false);
    const [renderCounter, setRenderCounter] = useState(0);
    const tableRef: RefObject<HTMLDivElement> = useRef(null);
    const dataList = useAtom(tableStore.data.atom);
    const tableSettings = useAtom(tableStore.dataSettings);
    const customFiltersData = useAtom(tableStore.customFilters);
    const customFiltersObject = useAtom(tableStore.customFilterObject);
    const canNext = useAtom(tableStore.canNext);
    const canPrev = useAtom(tableStore.canPrev);
    const filtersMapper = useAtom(tableStore.filterMapper);
    const activeFilters = useAtom(tableStore.activeFilters);
    const checkboxesValues = useAtom(tableStore.checkboxesData);
    const headerCheckboxState = useAtom(tableStore.headerCheckboxValue);
    const activeSort = useAtom(
        tableStore.activeSort,
        (atomValue) => ({
            order: atomValue.split('-')[0],
            sort: atomValue.split('-')[1],
        }),
        []
    );
    const modalState = useAtom(tableStore.modalState.atom);
    const paginationData = useAtom(tableStore.paginationAtom);
    const visibleColumns = useAtom(tableStore.visibleColumnsAtom);
    const columns = useAtom(
        tableStore.columnsOrderAtom,
        (order) => {
            if (!order) {
                return tableConfig.columns;
            }
            const newColumns: ColumnConfig[] = new Array(order.length).fill(null);
            tableConfig.columns.forEach((value) => {
                newColumns[order.indexOf(value.id)] = value;
            });

            return newColumns;
        },
        [tableConfig.columns]
    );
    const cachedData = useAtom(tableStore.tempCacheStorageAtom);
    const isModalPending = useAtom(tableStore.isModalPendingAtom);
    const isFilterInitialized = useAtom(tableStore.isInitialFilterSetAtom);
    const loadedOnceFlag = useAtom(tableStore.loadedOnceFlagAtom);
    const isEditMode = useAtom(tableStore.editModeAtom);
    const tableDataDraft = useAtom(tableStore.tableDataDraftAtom);
    const isPollingLoading = useAtom(tableStore.pollingLoadingAtom);
    const isInlineInputLoading = useAtom(tableStore.inlineInputLoadingAtom);
    const buttonsPendingState = useAtom(tableStore.buttonsPendingStateAtom);
    const nextPage = useAction(tableStore.nextPage);
    const prevPage = useAction(tableStore.prevPage);
    const add = useAction(tableStore.add);
    const setInitialFilters = useAction(tableStore.setInitialFilters);
    const setPaginationOffset = useAction(tableStore.setOffset);
    const setPaginationLimit = useAction(tableStore.setLimit);
    const setPollingLoading = useAction(tableStore.setPollingLoadingAction);
    const handleOffsetReset = useCallback(() => {
        if (tableConfig.pagination && tableConfig.pagination.type === PaginationTypesEnum.PAGER) {
            setPaginationOffset(0);
        }
    }, [setPaginationOffset]);
    const addFilter = useAction(
        (payload: TableDataAddFilterParams) => {
            // @ts-ignore
            tableRef?.current?.scrollTo({ top: 0 });
            handleOffsetReset();
            return tableStore.addFilter(payload);
        },
        [handleOffsetReset]
    );
    const changeSort = useAction((payload) => {
        // @ts-ignore
        tableRef?.current?.scrollTo({ top: 0 });
        return tableStore.changeSort(payload);
    });
    const clearFilters = useAction(() => {
        // @ts-ignore
        tableRef?.current?.scrollTo({ top: 0 });
        handleOffsetReset();
        return tableStore.clearFilters();
    }, [handleOffsetReset]);
    const handleRemoveFilter = useAction(
        (filterId: string) => {
            // @ts-ignore
            tableRef?.current?.scrollTo({ top: 0 });
            handleOffsetReset();
            return tableStore.removeFilter(filterId);
        },
        [handleOffsetReset]
    );
    const setRowCheckboxValue = useAction(tableStore.setRowCheckbox);
    const setCheckboxesGroup = useAction(tableStore.setCheckboxesGroup);
    const setHeaderCheckbox = useAction(tableStore.setHeaderCheckbox);
    const handleHeaderButtonClick = useAction(
        (actionButtonData: ButtonAction[], _, href?: string, uniqueId?: string) => {
            return tableStore.buttonAction({
                actionButtons: actionButtonData,
                rowIndex: 0,
                isHeaderAction: true,
                dictionaries,
                tankerKeyset,
                href,
                uniqueId,
            });
        },
        [dictionaries, tankerKeyset, tableStore.buttonAction]
    );
    const handleRowActionButtonClick = useAction(
        (actionButtonData: ButtonAction[], rowIndex: number, href?: string, uniqueId?: string) => {
            return tableStore.buttonAction({
                actionButtons: actionButtonData,
                rowIndex,
                dictionaries,
                tankerKeyset,
                href,
                uniqueId,
            });
        },
        [tableStore, tankerKeyset, dictionaries, tableStore.buttonAction]
    );
    const handleCellInputChange = useAction(
        (payload: ColumnInputPayload) => tableStore.cellInputAction(payload),
        [tableStore]
    );
    const handleModalButtonClick = useAction(
        ({ actions, formData, rowIndex = 0, isHeaderAction, formDataFormatter }: ModalFormSubmitPayload) => {
            return tableStore.buttonAction({
                actionButtons: actions,
                formData,
                rowIndex,
                isHeaderAction,
                formDataFormatter,
            });
        },
        [tableStore]
    );
    const handleCustomFilterChange = useAction(
        ({ id, readableName, queryParams }: CustomFilter, value: boolean) => {
            const customFilters = { ...customFiltersData };
            if (value) {
                customFilters[id] = {
                    readableName,
                    value: queryParams,
                };
            } else {
                delete customFilters[id];
            }

            return tableStore.saveCustomFilters(customFilters);
        },
        [customFiltersData]
    );
    const setTempCacheChange = useAction(tableStore.setTempCache);
    const setColumnsVisibility = useAction(tableStore.setColumnsVisibility);
    const setColumnsOrder = useAction(tableStore.setColumnsOrder);
    handleAtom(tableStore.tempCacheStorageAtom, (data) => {
        if (data && tableConfig?.hasUserSettingsInCache) {
            cacheApi.save(CacheNames.TABLE_SETTINGS, `${tableConfig?.tableId}`, data, true);
        }
    });
    const handleTableSettingsSubmit = useCallback(
        (formData: Record<string, boolean>) => {
            setActiveModalSettings(false);
            if (tableConfig.hasUserSettingsInCache) {
                setColumnsVisibility(formData);
            }
            setRenderCounter(renderCounter + 1);
        },
        [tableConfig, renderCounter, cachedData]
    );
    const handleTableColumnsOrderSubmit = useCallback(
        (fields: string[]) => {
            setActiveModalSettings(false);
            if (tableConfig.hasUserSettingsInCache) {
                setColumnsOrder(fields);
            }
            setRenderCounter(renderCounter + 1);
        },
        [tableConfig, renderCounter, cachedData, visibleColumns]
    );
    const handleTableEdit = useAction(tableStore.setFieldDataAfterEdit);
    const handleSettingsReset = useCallback(() => {
        setActiveModalSettings(false);
        const columnsVisibility = columns.reduce(
            (prevValue, { id }) => ({
                ...prevValue,
                [id]: true,
            }),
            {}
        );
        setTempCacheChange({});
        setColumnsVisibility(columnsVisibility);
        setColumnsOrder(null);
        setRenderCounter(renderCounter + 1);
    }, [renderCounter, columns]);
    const onResize = useAction(
        (newCache: TableDataCache) => {
            setActiveModalSettings(false);
            if (tableConfig.hasUserSettingsInCache) {
                cacheApi.save(CacheNames.TABLE_SETTINGS, `${tableConfig.tableId}`, newCache, true);
            }
            return tableStore.setTempCache(newCache);
        },
        [tableConfig]
    );
    const getCachedData = useAction(tableStore.getInitialSettings);
    const setHeaderCheckboxValue = useCallback(
        (value: CheckboxStateType) => {
            const isDisabledArray = tableConfig.columns.reduce<DisabledResolver<Content>[]>(
                (result, { type, isDisabledResolver }) => {
                    if (type === ColumnTypesEnum.CHECKBOX && isDisabledResolver) {
                        result.push(isDisabledResolver);
                    }
                    return result;
                },
                []
            );
            if (typeof value === 'boolean') {
                const rowsCheckboxes = dataList.map(
                    (rowData) =>
                        value && (isDisabledArray.length === 0 || isDisabledArray.some((func) => !func({ rowData })))
                );
                setCheckboxesGroup(rowsCheckboxes);
            }
            setHeaderCheckbox(value);
        },
        [dataList, tableConfig]
    );
    const handleTableModalSettingsClose = useCallback(() => {
        setActiveModalSettings(false);
    }, []);
    const setRowCheckbox = useCallback(
        ({ id, value: checkboxValue }: { id: number; value: boolean }) => {
            const checkboxesState = [...checkboxesValues];
            checkboxesState[id] = checkboxValue;
            const selectedItemsQuantity = checkboxesState.filter((value) => value).length;

            if (dataList && selectedItemsQuantity === dataList.length) {
                setHeaderCheckbox(true);
            } else if (!selectedItemsQuantity || !dataList) {
                setHeaderCheckbox(false);
            } else {
                setHeaderCheckbox('indeterminate');
            }

            setRowCheckboxValue({ id, value: checkboxValue });
        },
        [dataList, checkboxesValues]
    );
    const title = tableTitle;
    const { loading } = useFetch(tableStore.fetchAction as any, {
        onDone: (result: PagerTableDataContent | EndlessTableDataContent, store) => {
            store.dispatch(tableStore.handleGetDataFinishCase(result));
        },
    });
    const isReadyForFetch = useMemo(
        () =>
            getFetchReadyState({
                filter: tableSettings.filter,
                isFilterInitialized,
                withoutInitialFetchWithEmptyFilter: tableConfig.withoutInitialFetchWithEmptyFilter,
                loadedOnceFlag,
            }),
        [tableSettings.filter, isFilterInitialized, tableConfig.withoutInitialFetchWithEmptyFilter, loadedOnceFlag]
    );
    const emptyListMessage = useMemo(
        () => (isReadyForFetch ? tableConfig.emptyListMessage : tableConfig.messageBeforeInitialLoading || ''),
        [tableConfig.emptyListMessage, tableConfig.messageBeforeInitialLoading, isReadyForFetch]
    );
    const selectedRowsData = useMemo(
        () => dataList.filter((_, index) => Boolean(checkboxesValues[index])),
        [dataList, checkboxesValues]
    );
    const { titles, columnsMeta } = useMemo(
        () =>
            getTitles({
                addFilter,
                changeSort,
                tableSettings,
                filtersMapper,
                handleRemoveFilter,
                columns,
                setHeaderCheckboxValue,
                headerCheckboxState,
                loading: Boolean(loading && !isPollingLoading),
                dictionaries,
                visibleColumns,
                tankerKeyset,
            }),
        [
            isPollingLoading,
            addFilter,
            changeSort,
            tableSettings,
            filtersMapper,
            handleRemoveFilter,
            columns,
            setHeaderCheckboxValue,
            headerCheckboxState,
            loading,
            dictionaries,
            visibleColumns,
        ]
    );

    const uniqueColumnIndex = useMemo(
        () => columns.findIndex(({ id }) => tableConfig.rowUniqueField === id),
        [columns]
    );

    const values = useMemo(
        () =>
            getValues({
                columns,
                dictionaries,
                dataList,
                checkboxesValues,
                setRowCheckbox,
                commonRowActions: tableConfig.commonRowActions,
                handleRowActionButtonClick,
                handleCellInputChange,
                tankerKeyset,
                visibleColumns,
                refreshTable: tableStore.getData,
                linkRouterHandler,
                filter: tableSettings.filter,
                sort: tableSettings.sort,
                order: tableSettings.order,
                isEditMode,
                tableDataDraft,
                handleTableEdit,
                hasEditMode: tableConfig.hasEditableMode || false,
                buttonsPendingState,
            }),
        [
            handleRowActionButtonClick,
            handleCellInputChange,
            dataList,
            columns,
            dictionaries,
            tableConfig.commonRowActions,
            linkRouterHandler,
            checkboxesValues,
            setRowCheckbox,
            headerCheckboxState,
            visibleColumns,
            tableStore.getData,
            tableSettings.filter,
            tableSettings.sort,
            tableSettings.order,
            isEditMode,
            tableDataDraft,
            handleTableEdit,
            tableConfig.hasEditableMode,
            buttonsPendingState,
        ]
    );

    const headerButtons = useMemo(
        () =>
            tableConfig.headerActions.map((buttonData, index) => {
                return (
                    <TableButton
                        isEditMode={isEditMode}
                        key={`button_${index}`}
                        loading={loading}
                        buttonData={buttonData}
                        rowIndex={0}
                        index={index}
                        onClick={handleHeaderButtonClick}
                        size="m"
                        selectedRowsData={selectedRowsData}
                        filter={tableSettings.filter}
                        sort={tableSettings.sort}
                        order={tableSettings.order}
                        position="header"
                        customFilter={customFiltersObject}
                        buttonsPendingState={buttonsPendingState}
                    />
                );
            }),
        [
            tableConfig,
            handleHeaderButtonClick,
            headerCheckboxState,
            loading,
            selectedRowsData,
            tableSettings.filter,
            tableSettings.sort,
            tableSettings.order,
            isEditMode,
            buttonsPendingState,
        ]
    );

    const modal = useMemo(
        () => (
            <TableModal
                modalAction={modalState.modalData}
                rowIndex={modalState.rowIndexSource}
                isOpen={modalState.isOpen}
                isHeaderAction={modalState.isHeaderAction}
                onClick={handleModalButtonClick}
                dictionaries={dictionaries}
                isPending={isModalPending}
                customComponent={modalState.customComponent}
                selectedRowsData={modalState.isHeaderAction ? selectedRowsData : [dataList[modalState.rowIndexSource]]}
            />
        ),
        [modalState, handleModalButtonClick, dictionaries, isModalPending, dataList]
    );

    const tableSettingsFormFields = useMemo(() => getTableSettingsFormData(columns), [columns]);

    const settingsModal = useMemo(
        () => (
            <TableSettingsModal
                isOpen={isSettingsModalActive}
                onClose={handleTableModalSettingsClose}
                onSubmit={handleTableSettingsSubmit}
                initialValue={visibleColumns}
                fields={tableSettingsFormFields}
                onReset={handleSettingsReset}
                onDragSave={handleTableColumnsOrderSubmit}
            />
        ),
        [isSettingsModalActive, visibleColumns, tableSettingsFormFields]
    );

    const onClear = useCallback(() => clearFilters(), [clearFilters]);

    const onSettingsClick = useCallback(() => setActiveModalSettings(true), []);

    const customFilters = useMemo(() => {
        if (tableConfig.customFilters) {
            return tableConfig.customFilters.map((filterData, index) => (
                <CustomFilterSwitch
                    isDisable={loading}
                    key={filterData.id}
                    filterData={filterData}
                    onChange={handleCustomFilterChange}
                    isActive={Boolean(customFiltersData[filterData.id])}
                    index={index}
                />
            ));
        }

        return [];
    }, [customFiltersData, tableConfig.customFilters, handleCustomFilterChange, loading]);

    useTableFilterParams({
        onFilterAdd: setInitialFilters,
        defaultFilters: tableConfig.defaultFilters,
        defaultSort: tableConfig.defaultSort,
        addParamsInUrl: tableConfig.saveFiltersInUrl,
    });

    useEffect(() => {
        getCachedData();
    }, [tableConfig]);

    useEffect(() => {
        if (isReadyForFetch) {
            tableStore.getData();
        }
    }, [
        tableSettings.filter,
        activeSort,
        paginationData.currentPageData.limit,
        paginationData.currentPageData.offset,
        isFilterInitialized,
        customFiltersData,
    ]);

    useInterval(
        () => {
            const isUpdateRequired = !tableConfig.shouldTableUpdate || tableConfig.shouldTableUpdate(dataList);
            if (tableConfig.fetchDataPeriod && !loading && isReadyForFetch && isUpdateRequired) {
                setPollingLoading(true);
                tableStore.getData();
            }
        },
        tableConfig.fetchDataPeriod,
        false,
        [loading, isReadyForFetch, dataList]
    );

    return {
        canNext,
        canPrev,
        nextPage,
        prevPage,
        title,
        loading: loading && !isPollingLoading,
        tableData: {
            titles,
            values,
        },
        activeFilters,
        onClear,
        onSettingsClick,
        isSettingsModalActive,
        add,
        tableRef,
        paginationData,
        setPaginationOffset,
        setPaginationLimit,
        headerButtons,
        modal,
        uniqueColumnIndex,
        columnsMeta,
        customFilters,
        settingsModal,
        visibleColumns,
        cachedData,
        onResize,
        renderCounter,
        cachedDataAtom: tableStore.tempCacheStorageAtom,
        getCachedData,
        dataList,
        emptyListMessage,
        isAsyncLoading: isPollingLoading || isInlineInputLoading,
    };
};
