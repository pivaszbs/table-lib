import { ActionCreator, Atom, declareAction, map, PayloadActionCreator, Store } from '@reatom/core';
import { settableAtomCreatorObject } from '../../utils';
import { EMPTY_FILTER_SEPARATOR, RANGE_FILTER_TAGS } from '../constants';
import {
    AddInitialParams,
    GroupFilter,
    TableDataAddFilterParams,
    TableQueryParamsEnum,
    TableSortOrder,
} from '../types';
import { replaceTableHistory, updateFilterString } from '../utils';
import { TableConfig } from '../../types';

export interface DataSettings {
    order?: TableSortOrder;
    limit?: number;
    filter?: string;
    sort?: string;
    cursor: string[];
    nextCursor?: string;
}

export interface Result {
    activeFilters: Atom<any>;
    filterMapper: Atom<any>;
    addFilter: PayloadActionCreator<TableDataAddFilterParams, string>;
    clearFilters: ActionCreator<string>;
    isInitialFilterSetAtom: Atom<boolean>;
    setInitialFilterFlag: PayloadActionCreator<boolean, string>;
    customFilters: Atom<Record<string, GroupFilter>>;
    saveCustomFilters: PayloadActionCreator<Record<string, GroupFilter>, string>;
    customFilterObject: Atom<Record<string, string | boolean>>;
    setLoadedOnceFlagAction: PayloadActionCreator<boolean, string>;
    loadedOnceFlagAtom: Atom<boolean>;
}

const MULTIFILTER_SEPARATOR_REGEX = /(^\()|(\)$)/gi;

export interface Params {
    dataSettings: Atom<DataSettings>;
    filterNames: Record<string, string>;
    removeFilter: PayloadActionCreator<string>;
    resetCursor: ActionCreator;
    resetCursorOnFilter: boolean;
    saveFiltersInUrl: boolean;
    resetFilters: ActionCreator<string>;
    saveFilter: PayloadActionCreator<string, string>;
    setInitialFilters: PayloadActionCreator<AddInitialParams, string>;
    store: Store;
    tableConfig?: TableConfig;
}

export const filtersModule = ({
    dataSettings,
    filterNames,
    removeFilter,
    resetCursorOnFilter,
    saveFiltersInUrl,
    resetCursor,
    resetFilters,
    saveFilter,
    setInitialFilters,
    store,
    tableConfig,
}: Params): Result => {
    const activeFilters = map(`${tableConfig?.tableId}.tableData.activeFilters`, dataSettings, (dependedAtomState) => {
        return (
            dependedAtomState.filter
                ?.split(';')
                .filter(Boolean)
                .map((f) => {
                    const filters = f.split('=');

                    return {
                        name: `${filterNames[filters[0]]}: ${filters[filters.length - 1]}`,
                        onClear: () => store.dispatch(removeFilter(filters[0])),
                    };
                }) ?? []
        );
    });
    const filterMapper = map(`${tableConfig?.tableId}.tableData.filterMapper`, dataSettings, ({ filter }) => {
        return filter
            ? filter.split(';').reduce<Record<string, string>>((prevValue, currentFilter) => {
                  let name = '';
                  let value = '';
                  const rangeSeparator = RANGE_FILTER_TAGS.find((separator) =>
                      currentFilter.includes(`=${separator}=`)
                  );
                  if (rangeSeparator) {
                      [name, value] = currentFilter.split(`=${rangeSeparator}=`);
                      name = `${name}_${rangeSeparator}`;
                  } else if (currentFilter.match(/^\(.+\)$/)) {
                      const { filterName, filterValue } = currentFilter
                          .replace(MULTIFILTER_SEPARATOR_REGEX, '')
                          .split(',')
                          .reduce(
                              (acc, nextItem) => {
                                  const [nextName, nextValue] = nextItem.split('==');
                                  if (acc.filterName) {
                                      return {
                                          ...acc,
                                          filterValue: `${acc.filterValue},${nextValue}`,
                                      };
                                  }
                                  return {
                                      filterName: nextName,
                                      filterValue: nextValue,
                                  };
                              },
                              {
                                  filterName: name,
                                  filterValue: value,
                              }
                          );
                      value = filterValue;
                      name = filterName;
                  } else {
                      [name, value] = currentFilter.split('==');
                  }

                  value = value === EMPTY_FILTER_SEPARATOR ? value : value.replace(/'/gi, '');

                  return {
                      ...prevValue,
                      [name]: value,
                  };
              }, {})
            : {};
    });

    const clearFilters = declareAction(`${tableConfig?.tableId}.tableData.clearFilters`, () => {
        if (resetCursorOnFilter) {
            store.dispatch(resetCursor());
        }
        if (saveFiltersInUrl) {
            const newParams = new URLSearchParams(window.location.search);
            newParams.delete(TableQueryParamsEnum.FILTER);
            newParams.append(TableQueryParamsEnum.FILTER, '');
            replaceTableHistory({ searchParams: newParams });
        }
        store.dispatch(resetFilters());
    });

    const addFilter = declareAction<TableDataAddFilterParams>(
        `${tableConfig?.tableId}.tableData.addFilter`,
        (payload, appStore) => {
            const { filter } = appStore.getState(dataSettings);
            const newFilterString = updateFilterString({ newFilter: payload, oldFilterValue: filter });
            if (resetCursorOnFilter) {
                appStore.dispatch(resetCursor());
            }
            if (saveFiltersInUrl) {
                const newParams = new URLSearchParams(window.location.search);
                newParams.delete(TableQueryParamsEnum.FILTER);
                if (newFilterString) {
                    newParams.append(TableQueryParamsEnum.FILTER, newFilterString);
                }

                replaceTableHistory({ searchParams: newParams });
            }
            store.dispatch(saveFilter(newFilterString));
        }
    );

    const { atom: isInitialFilterSetAtom, set: setInitialFilterFlag } = settableAtomCreatorObject<boolean>(
        `${tableConfig?.tableId}.tableData.settableAtomCreatorObject`,
        false,
        (on) => [on(setInitialFilters, () => true)]
    );

    const { atom: customFilters, set: saveCustomFilters } = settableAtomCreatorObject<Record<string, GroupFilter>>(
        `${tableConfig?.tableId}.tableData.customFilters`,
        {}
    );

    const customFilterObject = map(customFilters, (filters) =>
        Object.values(filters).reduce<Record<string, string | boolean>>(
            (result, { value }) => ({ ...result, ...value }),
            {}
        )
    );

    const { atom: loadedOnceFlagAtom, set: setLoadedOnceFlagAction } = settableAtomCreatorObject<boolean>(
        `${tableConfig?.tableId}.tableData.loadedOnceFlagAtom`,
        false
    );

    return {
        activeFilters,
        filterMapper,
        addFilter,
        clearFilters,
        isInitialFilterSetAtom,
        setInitialFilterFlag,
        customFilters,
        saveCustomFilters,
        customFilterObject,
        setLoadedOnceFlagAction,
        loadedOnceFlagAtom,
    };
};
