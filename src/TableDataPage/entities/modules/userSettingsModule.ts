import { ActionCreator, Atom, declareAction, declareAtom, PayloadActionCreator } from '@reatom/core';
import { settableAtomCreatorObject } from '../../utils';
import { TableConfig, TableDataCache, Nullable, Content } from '../../types';
import { cacheApi, CacheNames } from '../../utils/cacheApi';
import { TableSortOrder } from '../types';

export interface DataSettings {
    order?: TableSortOrder;
    limit?: number;
    filter?: string;
    sort?: string;
    cursor: string[];
    nextCursor?: string;
}

export interface Result {
    visibleColumnsAtom: Atom<Nullable<Record<string, boolean>>>;
    setColumnsVisibility: PayloadActionCreator<Nullable<Record<string, boolean>>>;
    getInitialSettings: ActionCreator;
    tempCacheStorageAtom: Atom<Nullable<TableDataCache>>;
    setTempCache: PayloadActionCreator<Nullable<TableDataCache>>;
    columnsOrderAtom: Atom<Nullable<string[]>>;
    setColumnsOrder: PayloadActionCreator<Nullable<string[]>>;
}

export interface Params {
    tableConfig?: TableConfig<Content>;
}

export const userSettingsModule = ({ tableConfig }: Params): Result => {
    const initialVisibleData =
        tableConfig?.columns.reduce(
            (prevValue, { id, isHiddenByDefault = false }) => ({
                ...prevValue,
                [id]: !isHiddenByDefault,
            }),
            {}
        ) || null;
    const initialOrderData = tableConfig?.columns.map(({ id }) => id) || null;
    const { atom: columnsOrderAtom, set: setColumnsOrder } = settableAtomCreatorObject<Nullable<string[]>>(
        `${tableConfig?.tableId}.tableData.columnsOrder`,
        initialOrderData
    );
    const { atom: visibleColumnsAtom, set: setColumnsVisibility } = settableAtomCreatorObject<
        Nullable<Record<string, boolean>>
    >(`${tableConfig?.tableId}.tableData.visibleColumns`, initialVisibleData);
    const setTempCache = declareAction<Nullable<TableDataCache>>(
        `${tableConfig?.tableId}.tableData.tempCacheStorageSet`
    );
    const tempCacheStorageAtom = declareAtom<Nullable<TableDataCache>>(
        `${tableConfig?.tableId}.tableData.tempCacheStorageAtom`,
        null,
        (on) => [
            on(setTempCache, (state, payload) => payload),
            on(setColumnsVisibility, (state, visibleColumns) => ({ ...state, visibleColumns })),
            on(setColumnsOrder, (state, columnsOrder) => ({ ...state, columnsOrder })),
        ]
    );
    const getInitialSettings = declareAction(`${tableConfig?.tableId}.tableData.changeSort`, async (_, store) => {
        const cachedSettings: TableDataCache = await cacheApi.get(
            CacheNames.TABLE_SETTINGS,
            `${tableConfig?.tableId}`,
            cacheApi.Type.Json,
            true
        );
        store.dispatch(setTempCache(cachedSettings || {}));
        if (cachedSettings) {
            if (cachedSettings.visibleColumns && tableConfig) {
                let patchedCacheSettings = { ...cachedSettings.visibleColumns };
                // Нужно, чтобы колонки которые запретили для скрытия точно отобразились у пользвателя
                // Если он их ранее скрыл
                patchedCacheSettings = tableConfig.columns.reduce((prevValue, { id, canNotBeHiddenByUser }) => {
                    if (canNotBeHiddenByUser) {
                        return {
                            ...prevValue,
                            [id]: true,
                        };
                    }

                    if (patchedCacheSettings[id] === undefined) {
                        return {
                            ...prevValue,
                            [id]:
                                !initialVisibleData ||
                                Boolean(initialVisibleData[id as keyof typeof initialVisibleData]),
                        };
                    }

                    return prevValue;
                }, patchedCacheSettings);
                store.dispatch(setColumnsVisibility(patchedCacheSettings));
            }
            if (cachedSettings.columnsOrder && tableConfig !== undefined) {
                const newColumnsInConfig = tableConfig.columns.filter(
                    ({ id }) => !cachedSettings.columnsOrder?.includes(id)
                );
                const oldColumnsInOrder = cachedSettings.columnsOrder.filter(
                    (columnId) => !tableConfig.columns.some(({ id }) => id === columnId)
                );
                if (newColumnsInConfig.length || oldColumnsInOrder.length) {
                    store.dispatch(setColumnsOrder(null));
                    store.dispatch(setColumnsVisibility(initialVisibleData));
                } else {
                    store.dispatch(setColumnsOrder(cachedSettings.columnsOrder));
                }
            }
        }
    });

    return {
        visibleColumnsAtom,
        setColumnsVisibility,
        getInitialSettings,
        tempCacheStorageAtom,
        setTempCache,
        columnsOrderAtom,
        setColumnsOrder,
    };
};
