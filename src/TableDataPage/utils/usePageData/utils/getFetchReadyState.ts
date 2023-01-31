import { TableQueryParamsEnum } from '../../../entities/types';

interface SortPayload {
    order: string;
    sort: string;
}

interface Params {
    isFilterInitialized: boolean;
    loadedOnceFlag: boolean;
    filter?: string;
    withoutInitialFetchWithEmptyFilter?: boolean;
}

export const getFetchReadyState = ({
    loadedOnceFlag,
    isFilterInitialized,
    filter,
    withoutInitialFetchWithEmptyFilter = false,
}: Params) => {
    const hasFilterParam = new URLSearchParams(window.location.search).has(TableQueryParamsEnum.FILTER);
    const isFilterConditionReady =
        !withoutInitialFetchWithEmptyFilter || Boolean(filter) || hasFilterParam || loadedOnceFlag;
    return isFilterInitialized && isFilterConditionReady;
};
