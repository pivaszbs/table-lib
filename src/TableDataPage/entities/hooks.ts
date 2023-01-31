import { useAction, useAtom } from '@reatom/react';
import noop from 'lodash/noop';
import { EffectCallback, useCallback, useEffect, useRef } from 'react';
import { Content, DefaultSortParams, FetchOptional } from '../types';
import { getUrlParams } from '../utils';
import { DeclareActionFetch } from '../utils/declareActionFetch';
import { handleAction } from '../utils/handleAction';
import { RANGE_FILTER_TAGS } from './constants';
import { AddInitialParams, TableQueryParamsEnum, TableSortOrder } from './types';
import { replaceTableHistory, updateFilterString } from './utils';

interface UseTableParams {
    onFilterAdd: (filters: AddInitialParams) => void;
    defaultFilters?: Record<string, string>;
    defaultSort?: DefaultSortParams<Content>;
    dependencies?: any[];
    addParamsInUrl?: boolean;
}

export const useTableFilterParams = ({
    onFilterAdd,
    defaultFilters = {},
    defaultSort,
    dependencies = [],
    addParamsInUrl = true,
}: UseTableParams) => {
    useEffect(() => {
        const newParams = new URLSearchParams(addParamsInUrl ? window.location.search : '');
        const filtersFromParams = newParams.get(TableQueryParamsEnum.FILTER);
        let filters = filtersFromParams || '';
        let sortData;
        let limit;
        let offset;
        if (filtersFromParams === null) {
            Object.keys(defaultFilters).forEach((filterName) => {
                filters = updateFilterString({
                    isFilterFormatted: true,
                    oldFilterValue: filters,
                    newFilter: { name: filterName, value: defaultFilters[filterName] },
                });
            });
            if (filters) {
                newParams.append(TableQueryParamsEnum.FILTER, filters);
            }
        }

        if (!newParams.has(TableQueryParamsEnum.SORT) && !newParams.has(TableQueryParamsEnum.ORDER) && defaultSort) {
            newParams.append(TableQueryParamsEnum.SORT, defaultSort.sort);
            newParams.append(TableQueryParamsEnum.ORDER, defaultSort.order);
            sortData = { ...defaultSort };
        } else if (newParams.has(TableQueryParamsEnum.SORT) && newParams.has(TableQueryParamsEnum.ORDER)) {
            sortData = {
                sort: newParams.get(TableQueryParamsEnum.SORT) || '',
                order: newParams.get(TableQueryParamsEnum.ORDER) as TableSortOrder,
            };
        }

        if (newParams.has(TableQueryParamsEnum.LIMIT) && newParams.has(TableQueryParamsEnum.OFFSET)) {
            limit = Number(newParams.get(TableQueryParamsEnum.LIMIT));
            offset = Number(newParams.get(TableQueryParamsEnum.OFFSET));
        }

        if (addParamsInUrl) {
            replaceTableHistory({ searchParams: newParams });
        }

        onFilterAdd({ filters, limit, offset, sortData });
    }, dependencies);
};

export const useEffectOnce: (effect: EffectCallback) => void = (effect: EffectCallback) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(effect, []);
};

export const useClickOutside = <T extends HTMLElement>(ref: React.RefObject<T>, handler: () => void) => {
    useEffect(() => {
        const listener = (event: any) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }

            handler();
        };

        document.addEventListener('mousedown', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
        };
    }, [ref, handler]);
};

export const useMount: (fn: () => void) => void = (fn: () => void) => {
    useEffectOnce(() => {
        fn();
    });
};

export const useFetch = <ResultType, PayloadType, WithData, WithParams>(
    fetchAction: DeclareActionFetch<ResultType, PayloadType, WithData, WithParams>,
    optional?: FetchOptional<ResultType>,
    deps: any[] = []
) => {
    const loading = useAtom(fetchAction.isPending);
    const params = useAtom(fetchAction.paramsAtom);
    const data = useAtom(fetchAction.dataAtom);
    const fetchFunction = useAction(fetchAction) as (payload?: PayloadType) => void;

    handleAction(
        fetchAction.done,
        (store, payload) => {
            if (optional?.onDone) {
                optional.onDone(payload, store);
            }
        },
        deps
    );

    handleAction(
        fetchAction.fail,
        (store, payload) => {
            if (optional?.onFail) {
                optional.onFail(payload, store);
            }
        },
        deps
    );

    // todo: with args
    useMount(optional?.callImmediate ? fetchFunction : noop);

    return {
        fetchFunction,
        loading,
        params,
        data,
    };
};

export const useInterval = (callback: () => void, timeout = 1000, callImmediately = false, deps: any[] = []) => {
    const ref = useRef<number>();
    const cb = useCallback(callback, deps);
    useEffect(() => {
        if (ref.current) {
            window.clearInterval(ref.current);
        }
        if (callImmediately) {
            cb();
        }
        const intervalId = window.setInterval(cb, timeout);
        ref.current = intervalId;
        return () => window.clearInterval(intervalId);
    }, [cb]);
};
