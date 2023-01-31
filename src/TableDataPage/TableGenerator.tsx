/* eslint-disable max-lines */
import { createStore, Store } from '@reatom/core';
import { context as defaultContext } from '@reatom/react';
import { AxiosInstance } from 'axios';
import React, { Context, memo, MutableRefObject, useContext, useEffect, useState } from 'react';
import {
    DeclareActionFetch,
    declareActionFetch,
    FetchErrorHandler,
    SuccessNotificationHandler,
} from './utils/declareActionFetch';
import { createTableDataStore } from './entities';
import { TableDataFetchActionPayload, TableDataStore } from './entities/types';
import {
    Nullable,
    MultipleTankerKeyset,
    TableConfig,
    TableDataContent,
    TableDictionary,
    RefTableInterface,
    RedirectProps,
    CustomFilterRenderFunction,
} from './types';
import { useMapper } from './utils/api';
import TableContainer from './TableContainer';
import Spinner from './components/Spinner';

interface Props {
    tableConfig: TableConfig<any>;
    tableDataMock?: any;
    dictionaries?: Nullable<TableDictionary>;
    tankerKeyset?: MultipleTankerKeyset;
    getDataUrl?: string;
    client: AxiosInstance;
    context?: Context<Store | null>;
    tableRef?: MutableRefObject<Nullable<RefTableInterface>>;
    fetchErrorHandler?: FetchErrorHandler;
    linkRouterHandler: (url: string) => void;
    redirectCallback?: (redirectProps: RedirectProps<any>) => void;
    successNotificationHandler?: SuccessNotificationHandler;
    customFiltersRender?: CustomFilterRenderFunction;
    isMock?: boolean;
}

const DEFAULT_DICTIONARIES = {};

const defaultStore = createStore();

const TableGeneratorComponent: React.FC<Props & { context: Context<Store | null> }> = ({
    tableConfig,
    tableDataMock,
    dictionaries = DEFAULT_DICTIONARIES,
    tankerKeyset,
    getDataUrl,
    tableRef,
    client,
    context,
    fetchErrorHandler,
    linkRouterHandler,
    redirectCallback,
    successNotificationHandler,
    customFiltersRender,
    isMock = false,
}) => {
    const [tableStore, setTableStore] = useState<Nullable<TableDataStore>>(null);
    const store = useContext(context);

    useEffect(() => {
        const endPoint = getDataUrl || tableConfig.getDataEndpoint || '';
        const tableDataApi = useMapper({
            real: (params: TableDataFetchActionPayload) =>
                client.get(endPoint, {
                    params,
                }),
            mock: () => tableDataMock,
            mapper: tableConfig.responseDataFromatter,
            isMock,
        });
        const tableDataFetch = declareActionFetch(tableDataApi, {
            clearNotifications: false,
            errorHandler: fetchErrorHandler,
        });
        const filterNames = tableConfig.columns.reduce(
            (prevValue, { id, title }) => ({
                ...prevValue,
                [id]: title,
            }),
            {}
        );
        const generatedTableStore = createTableDataStore({
            fetchAction: tableDataFetch as DeclareActionFetch<TableDataContent, TableDataFetchActionPayload>,
            filterNames,
            saveFiltersInUrl: tableConfig.saveFiltersInUrl !== undefined ? tableConfig.saveFiltersInUrl : true,
            tableConfig,
            store: store as Store,
            client,
            ref: tableRef,
            fetchErrorHandler,
            redirectCallback,
            successNotificationHandler,
            isMock,
        });
        setTableStore(generatedTableStore);
    }, []);

    return !tableStore ? (
        <Spinner />
    ) : (
        <TableContainer
            dictionaries={dictionaries}
            tableConfig={tableConfig}
            tableStore={tableStore}
            tankerKeyset={tankerKeyset}
            linkRouterHandler={linkRouterHandler}
            customFiltersRender={customFiltersRender}
        />
    );
};

export const TableWrapper = ({ context = defaultContext, ...props }: Props) => {
    const store = useContext(context);

    if (store) {
        return <TableGeneratorComponent {...props} context={context} />;
    }

    return (
        <context.Provider value={defaultStore}>
            <TableGeneratorComponent {...props} context={context} />
        </context.Provider>
    );
};
