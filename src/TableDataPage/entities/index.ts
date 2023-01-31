import { declareAction, declareAtom, map, PayloadActionCreator, Store } from '@reatom/core';
import cloneDeep from 'lodash/cloneDeep';
import { AxiosInstance } from 'axios';
import { MutableRefObject } from 'react';
import { settableAtomCreatorObject } from '../utils';
import { FetchErrorHandler, IsActionFetch, SuccessNotificationHandler } from '../utils/declareActionFetch';
import { actionsModule } from './modules/actionsModule';
import { filtersModule } from './modules/filtersModule';
import { userSettingsModule } from './modules/userSettingsModule';
import {
    AddInitialParams,
    DataSettings,
    ModalState,
    PaginationData,
    TableDataAddFilterParams,
    TableDataFetchActionPayload,
    TableDataStore,
    TableQueryParamsEnum,
    TableQueryProps,
    TableSortOrder,
} from './types';
import { getFiltersAfterRemoving, replaceTableHistory, replaceTableParams, updateFilterString } from './utils';
import {
    Content,
    EndlessTableDataContent,
    Nullable,
    PagerPagination,
    PagerTableDataContent,
    PaginationTypesEnum,
    RedirectProps,
    RefTableInterface,
    TableConfig,
    TableDictionary,
} from '../types';
import { RSQLParser } from './modules/rsqlParser';
import { RsqlFilterValue } from './modules/rsqlParser/types';

export * from './types';
export * from './utils';

export const DEFAULT_PAGINATION_DATA: PaginationData = {
    currentPageData: {
        offset: 0,
        limit: 35,
    },
    total: 0,
    options: [],
};

type Params<T> = {
    fetchAction: T;
    filterNames: Record<string, string>;
    store: Store;
    client: AxiosInstance;
    saveFiltersInUrl?: boolean;
    tableConfig?: TableConfig<Content>;
    dictionaries?: TableDictionary;
    ref?: MutableRefObject<Nullable<RefTableInterface>>;
    fetchErrorHandler?: FetchErrorHandler;
    redirectCallback?: (redirectProps: RedirectProps<any>) => void;
    successNotificationHandler?: SuccessNotificationHandler;
    isMock?: boolean;
};

export const createTableDataStore = <T extends IsActionFetch & PayloadActionCreator<TableDataFetchActionPayload>>({
    fetchAction,
    filterNames,
    store,
    client,
    tableConfig,
    saveFiltersInUrl = false,
    ref,
    fetchErrorHandler,
    redirectCallback,
    successNotificationHandler,
    isMock = false,
}: Params<T>): TableDataStore => {
    // TODO после перевода существующих таблиц на конфиги всегда брать сортировку из конфига

    const defaultSort = tableConfig ? tableConfig.defaultSort || {} : { sort: 'editDate', order: TableSortOrder.DESC };

    let pagination = tableConfig?.pagination;

    if (!tableConfig) {
        pagination = { type: PaginationTypesEnum.ENDLESS_SCROLL };
    }

    const resetCursorOnFilter = pagination?.type === PaginationTypesEnum.ENDLESS_SCROLL;

    const modalState = settableAtomCreatorObject<ModalState>(
        `${tableConfig?.tableId}.tableData.data`,
        {
            isOpen: false,
            modalData: null,
            rowIndexSource: 0,
            isHeaderAction: false,
            customComponent: null,
        },
        undefined,
        { persist: false }
    );

    const add = declareAction<Content[]>(`${tableConfig?.tableId}.tableData.add`);
    const setInitialFilters = declareAction<AddInitialParams>(`${tableConfig?.tableId}.tableData.addInitialFilters`);
    const data = settableAtomCreatorObject<Content[]>(`${tableConfig?.tableId}.tableData.data`, [], (on) => [
        on(add, (state, payload) => [...state, ...payload]),
    ]);

    const paginationInitialState: PaginationData =
        pagination && pagination.type === PaginationTypesEnum.PAGER
            ? {
                  currentPageData: {
                      offset: 0,
                      limit:
                          (pagination as PagerPagination).defaultItemsOnPage ||
                          (pagination as PagerPagination).itemsOnPageOptions[0],
                  },
                  total: 0,
                  options: (pagination as PagerPagination).itemsOnPageOptions,
              }
            : DEFAULT_PAGINATION_DATA;

    const setTotal = declareAction<number>(`${tableConfig?.tableId}.tableData.setTotal`);

    const setOffsetAction = declareAction<number>(`${tableConfig?.tableId}.tableData.setOffsetAction`);

    const setLimitAction = declareAction<number>(`${tableConfig?.tableId}.tableData.setLimitAction`);

    const paginationAtom = declareAtom<PaginationData>(
        `${tableConfig?.tableId}.tableData.paginationAtom`,
        paginationInitialState,
        (on) => [
            on(setTotal, (state, total) => ({
                ...state,
                total,
            })),
            on(setOffsetAction, (state, offset) => ({
                ...state,
                currentPageData: {
                    ...state.currentPageData,
                    offset,
                },
            })),
            on(setLimitAction, (state, limit) => ({
                ...state,
                currentPageData: {
                    ...state.currentPageData,
                    limit,
                    offset: 0,
                },
            })),
            on(setInitialFilters, (state, payload) => {
                if (payload.limit !== undefined && payload.offset !== undefined) {
                    return {
                        ...state,
                        currentPageData: {
                            limit: payload.limit,
                            offset: payload.offset,
                        },
                    };
                }

                return state;
            }),
        ]
    );

    const { atom: pollingLoadingAtom, set: setPollingLoadingAction } = settableAtomCreatorObject<boolean>(
        `${tableConfig?.tableId}.tableData.pollingLoadingAtom`,
        false
    );

    const { atom: inlineInputLoadingAtom, set: setInlineInputLoadingAction } = settableAtomCreatorObject<boolean>(
        `${tableConfig?.tableId}.tableData.inlineInputLoadingAtom`,
        false
    );

    const setOffset = declareAction<number>(`${tableConfig?.tableId}.tableData.setOffset`, (payload, storeData) => {
        const {
            currentPageData: { limit },
        } = storeData.getState(paginationAtom);
        replaceTableParams({ name: TableQueryParamsEnum.OFFSET, value: String(payload) });
        replaceTableParams({ name: TableQueryParamsEnum.LIMIT, value: String(limit) });
        storeData.dispatch(setOffsetAction(payload));
    });

    const setLimit = declareAction<number>(`${tableConfig?.tableId}.tableData.setLimit`, (payload, storeData) => {
        const {
            currentPageData: { offset },
        } = storeData.getState(paginationAtom);
        replaceTableParams({ name: TableQueryParamsEnum.LIMIT, value: String(payload) });
        replaceTableParams({ name: TableQueryParamsEnum.OFFSET, value: String(offset) });
        storeData.dispatch(setLimitAction(payload));
    });

    const nextPage = declareAction(`${tableConfig?.tableId}.tableData.nextPage`);
    const prevPage = declareAction(`${tableConfig?.tableId}.tableData.prevPage`);
    const addCursor = declareAction<string>(`${tableConfig?.tableId}.tableData.addCursor`);
    const resetCursor = declareAction(`${tableConfig?.tableId}.tableData.resetCursor`);
    const saveFilter = declareAction<string>(`${tableConfig?.tableId}.tableData.saveFilter`);
    const removeColumnFilter = declareAction<string>(`${tableConfig?.tableId}.tableData.removeColumnFilter`);
    const resetFilters = declareAction(`${tableConfig?.tableId}.tableData.clearFilters`);
    const saveSort = declareAction<{ order?: TableSortOrder; sort?: string }>(
        `${tableConfig?.tableId}.tableData.saveSort`
    );
    const changeSort = declareAction<{ order?: TableSortOrder; sort?: string }>(
        `${tableConfig?.tableId}.tableData.changeSort`,
        (payload, appStore) => {
            if (resetCursorOnFilter) {
                appStore.dispatch(resetCursor());
            }

            const newParams = new URLSearchParams(window.location.search);

            const { order, sort } = payload;

            newParams.delete(TableQueryParamsEnum.ORDER);
            newParams.delete(TableQueryParamsEnum.SORT);

            if (order && sort) {
                newParams.append(TableQueryParamsEnum.ORDER, order);
                newParams.append(TableQueryParamsEnum.SORT, sort);
            }

            replaceTableHistory({ searchParams: newParams });

            appStore.dispatch(saveSort(payload));
        }
    );

    const dataSettings = declareAtom<DataSettings>(
        `${tableConfig?.tableId}.tableData.dataSettings`,
        { cursor: [], ...defaultSort },
        (on) => [
            on(nextPage, (state) => {
                const newState = cloneDeep(state);

                if (newState.nextCursor) {
                    newState.cursor.push(newState.nextCursor);
                }

                return newState;
            }),
            on(prevPage, (state) => {
                const newState = cloneDeep(state);

                newState.cursor.pop();

                return newState;
            }),
            on(addCursor, (state, nextCursor) => ({ ...state, nextCursor })),
            on(resetCursor, (state) => ({
                ...state,
                cursor: [],
                nextCursor: '',
            })),
            on(saveFilter, (state, payload) => {
                return {
                    ...state,
                    filter: payload,
                };
            }),
            on(setInitialFilters, (state, payload) => {
                let newState = cloneDeep(state);
                if (payload.filters) {
                    newState = {
                        ...newState,
                        filter: payload.filters,
                    };
                }

                if (payload.sortData) {
                    newState = {
                        ...newState,
                        sort: payload.sortData.sort,
                        order: payload.sortData.order,
                    };
                }

                return newState;
            }),
            on(removeColumnFilter, (state, payload) => {
                if (!state.filter) {
                    return state;
                }

                const newState = cloneDeep(state);
                newState.filter = state.filter
                    .split(';')
                    .filter((f) => !f.includes(payload))
                    .join(';');

                return newState;
            }),
            on(resetFilters, (state) => ({ ...state, filter: '' })),
            on(saveSort, (state, { sort = state.sort, order = state.order }) => {
                if (state.sort === sort && state.order === order) {
                    return state;
                }

                return {
                    ...state,
                    sort,
                    order,
                };
            }),
        ]
    );

    const removeFilter = declareAction<string>(
        `${tableConfig?.tableId}.tableData.removeFilter`,
        (filterId, appStore) => {
            if (resetCursorOnFilter) {
                appStore.dispatch(resetCursor());
            }
            const { filter } = appStore.getState(dataSettings);
            const newFilterString = getFiltersAfterRemoving({ filterName: filterId, filtersString: filter });
            if (saveFiltersInUrl) {
                const newParams = new URLSearchParams(window.location.search);
                newParams.delete(TableQueryParamsEnum.FILTER);
                newParams.append(TableQueryParamsEnum.FILTER, newFilterString || '');

                replaceTableHistory({ searchParams: newParams });
            }
            store.dispatch(removeColumnFilter(filterId));
        }
    );

    const {
        filterMapper,
        activeFilters,
        clearFilters,
        addFilter,
        isInitialFilterSetAtom,
        setInitialFilterFlag,
        customFilters,
        saveCustomFilters,
        customFilterObject,
        loadedOnceFlagAtom,
        setLoadedOnceFlagAction,
    } = filtersModule({
        dataSettings,
        filterNames,
        removeFilter,
        resetCursor,
        resetCursorOnFilter,
        resetFilters,
        saveFilter,
        saveFiltersInUrl,
        setInitialFilters,
        store,
        tableConfig,
    });
    const {
        setColumnsVisibility,
        visibleColumnsAtom,
        getInitialSettings,
        tempCacheStorageAtom,
        setTempCache,
        setColumnsOrder,
        columnsOrderAtom,
    } = userSettingsModule({
        tableConfig,
    });
    const activeSort = map(`${tableConfig?.tableId}.tableData.activeSort`, dataSettings, ({ order, sort }) => {
        return `${order}-${sort}`;
    });

    const cursor = map(
        `${tableConfig?.tableId}.tableData.cursor`,
        dataSettings,
        (v) => v.cursor[v.cursor.length - 1] ?? ''
    );
    const formattedCustomFilters = map(
        `${tableConfig?.tableId}.tableData.formattedCustomFilters`,
        customFilters,
        (customFiltersData) =>
            Object.keys(customFiltersData).reduce(
                (prevValue, key) => ({
                    ...prevValue,
                    ...customFiltersData[key].value,
                }),
                {}
            )
    );
    const canPrev = map(
        `${tableConfig?.tableId}.tableData.canPrev`,
        dataSettings,
        (v) => v.cursor.filter(Boolean).length > 0
    );
    const canNext = map(`${tableConfig?.tableId}.tableData.canNext`, dataSettings, (v) => Boolean(v.nextCursor));

    const handleGetDataFinishCase = declareAction<PagerTableDataContent | EndlessTableDataContent>(
        'handleGetDataFinishCase',
        (result) => {
            store.dispatch(setPollingLoadingAction(false));
            const cursorData = store.getState(cursor);
            if (tableConfig?.pagination?.type === PaginationTypesEnum.ENDLESS_SCROLL) {
                if (cursorData) {
                    store.dispatch(add(result.content));
                } else {
                    store.dispatch(data.set(result.content));
                }
                store.dispatch(addCursor((result as EndlessTableDataContent).cursor?.value ?? ''));
            } else {
                store.dispatch(data.set(result.content));
                store.dispatch(setTotal((result as PagerTableDataContent).total));
            }

            if (!(pagination?.type === PaginationTypesEnum.ENDLESS_SCROLL && cursorData)) {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                store.dispatch(setCheckboxesGroup([]));
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                store.dispatch(setHeaderCheckbox(false));
            }
        }
    );

    const getData = (isRefresh = false, externalFilters: TableDataAddFilterParams[] = []) => {
        if (isRefresh) {
            store.dispatch(resetCursor());
        }

        if (!store.getState(loadedOnceFlagAtom)) {
            store.dispatch(setLoadedOnceFlagAction(true));
        }

        const headerCustomFilters = store.getState(formattedCustomFilters);
        const { filter, order, sort } = store.getState(dataSettings);
        const { currentPageData } = store.getState(paginationAtom);
        const { limit } = currentPageData;
        const cursorValue = store.getState(cursor);

        const baseParams: TableQueryProps<Content> = {
            order,
            sort,
        };
        let formattedFilter: RsqlFilterValue[] = [];

        if (filter || (externalFilters && externalFilters.length)) {
            baseParams.filter = externalFilters.length
                ? externalFilters.reduce(
                      (prev, externalFilter) => updateFilterString({ oldFilterValue: prev, newFilter: externalFilter }),
                      filter || ''
                  )
                : filter;
            formattedFilter = baseParams.filter
                ? new RSQLParser(RSQLParser.RSQL_OPS, RSQLParser.RSQL_MAPPER).parse(baseParams.filter)
                : [];
        }
        if (cursorValue && !isRefresh) baseParams.cursor = cursorValue;

        if (pagination && pagination.type === PaginationTypesEnum.ENDLESS_SCROLL) {
            const endlessScrollParams = tableConfig?.paramsDataFormatter
                ? tableConfig.paramsDataFormatter({
                      ...baseParams,
                      formattedFilter,
                      limit,
                      switcherFilters: headerCustomFilters,
                  })
                : { ...baseParams, ...headerCustomFilters, limit };
            if (tableConfig?.getSyncDataCallback) {
                const result = tableConfig.getSyncDataCallback(endlessScrollParams);
                store.dispatch(handleGetDataFinishCase(result));
            } else {
                store.dispatch(fetchAction(endlessScrollParams));
            }
        } else if (pagination && pagination.type === PaginationTypesEnum.PAGER) {
            const pagerParams = tableConfig?.paramsDataFormatter
                ? tableConfig.paramsDataFormatter({
                      ...baseParams,
                      formattedFilter,
                      ...currentPageData,
                      switcherFilters: headerCustomFilters,
                  })
                : { ...baseParams, ...headerCustomFilters, ...currentPageData };
            if (tableConfig?.getSyncDataCallback) {
                const result = tableConfig.getSyncDataCallback(pagerParams);
                store.dispatch(handleGetDataFinishCase(result));
            } else {
                store.dispatch(fetchAction(pagerParams));
            }
        } else {
            const withoutPaginationParams = tableConfig?.paramsDataFormatter
                ? tableConfig.paramsDataFormatter({
                      ...baseParams,
                      formattedFilter,
                      switcherFilters: headerCustomFilters,
                  })
                : { ...baseParams, ...headerCustomFilters };
            if (tableConfig?.getSyncDataCallback) {
                const result = tableConfig.getSyncDataCallback(withoutPaginationParams);
                store.dispatch(handleGetDataFinishCase(result));
            } else {
                store.dispatch(fetchAction(withoutPaginationParams));
            }
        }
    };

    store.subscribe(nextPage, getData);
    store.subscribe(prevPage, getData);
    tableConfig?.externalFiltersAtom &&
        store.subscribe(tableConfig.externalFiltersAtom, (params) => {
            if (params && params.length) {
                getData(false, params);
            } else {
                getData();
            }
        });

    const externalUpdateFunction = (externalFilters: TableDataAddFilterParams[]) => {
        getData(false, externalFilters);
    };

    const {
        buttonAction,
        cellInputAction,
        checkboxesData,
        setCheckboxesGroup,
        headerCheckboxValue,
        setRowCheckbox,
        setHeaderCheckbox,
        isModalPendingAtom,
        setModalPendingState,
        editModeAtom,
        setEditModeAction,
        tableDataDraftAtom,
        setFieldDataAfterEdit,
        buttonsPendingStateAtom,
    } = actionsModule({
        data,
        getData,
        modalState,
        setOffset,
        tableConfig,
        client,
        add,
        fetchErrorHandler,
        redirectCallback,
        successNotificationHandler,
        setInlineInputLoadingAction,
        isMock,
    });

    if (ref) {
        ref.current = { getData };
    }

    return {
        data,
        modalState,
        dataSettings,
        nextPage,
        prevPage,
        activeFilters,
        addFilter,
        removeFilter,
        clearFilters,
        changeSort,
        activeSort,
        cursor,
        addCursor,
        canPrev,
        canNext,
        add,
        filterMapper,
        setInitialFilters,
        getData,
        fetchAction,
        checkboxesData,
        setRowCheckbox,
        headerCheckboxValue,
        setHeaderCheckbox,
        setCheckboxesGroup,
        paginationAtom,
        setTotal,
        setLimit,
        setOffset,
        buttonAction,
        cellInputAction,
        saveCustomFilters,
        setColumnsVisibility,
        visibleColumnsAtom,
        getInitialSettings,
        tempCacheStorageAtom,
        setTempCache,
        isModalPendingAtom,
        setModalPendingState,
        isInitialFilterSetAtom,
        setInitialFilterFlag,
        customFilters,
        customFilterObject,
        setColumnsOrder,
        columnsOrderAtom,
        loadedOnceFlagAtom,
        editModeAtom,
        setEditModeAction,
        tableDataDraftAtom,
        setFieldDataAfterEdit,
        setPollingLoadingAction,
        pollingLoadingAtom,
        inlineInputLoadingAtom,
        externalUpdateFunction,
        handleGetDataFinishCase,
        buttonsPendingStateAtom,
    };
};
