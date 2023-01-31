import { ActionCreator, Atom, PayloadActionCreator } from '@reatom/core';
import { ReactNode } from 'react';
import { FieldValues } from 'react-hook-form';
import { SettableAtomObject } from '../utils';
import { IsActionFetch } from '../utils/declareActionFetch';
import {
    ButtonAction,
    DefaultSortParams,
    FormDataFormatter,
    ModalAction,
    QueryParamsResolver,
    RequestOptions,
    TableDataCache,
    Nullable,
    Content,
    BodyResolverType,
    TableDictionary,
    MultipleTankerKeyset,
    PaginationTypesEnum,
    PagerTableDataContent,
    EndlessTableDataContent,
} from '../types';
import { FieldType } from '../utils/api/getReportFormData';
import { RsqlFilterValue } from './modules/rsqlParser/types';

export interface GroupFilter {
    readableName: string;
    value: Record<string, string | boolean>;
}

export interface DataSettings {
    order?: TableSortOrder;
    limit?: number;
    filter?: string;
    sort?: string;
    cursor: string[];
    nextCursor?: string;
}

export type TableDataContentArray = Record<string, any>[];

export type TableDataFetchActionPayload = {
    orderId?: string;
    order?: TableSortOrder;
    limit?: number;
    cursor?: string;
    filter?: string;
    sort?: string;
    offset?: number;
};

export type RangeFilter = { from?: string; to?: string; isStrictFrom?: boolean; isStrictTo?: boolean };
export interface TableDataAddFilterParams {
    name: string;
    value: string | RangeFilter | string[];
}

export interface RowCheckboxPayload {
    id: number;
    value: boolean;
}

export interface PaginationData {
    currentPageData: {
        offset: number;
        limit: number;
    };
    total: number;
    options: number[];
}

export interface ActionButtonPayload {
    rowIndex: number;
    actionButtons: ButtonAction[];
    isHeaderAction?: boolean;
    formData?: FieldValues;
    formDataFormatter?: FormDataFormatter;
    responsesData?: Record<string, any>;
    tankerKeyset?: MultipleTankerKeyset;
    dictionaries?: TableDictionary;
    downloadFileHref?: string;
    href?: string;
    uniqueId?: string;
}

export interface ColumnInputPayload {
    value: string[] | string | boolean;
    requestOptions?: RequestOptions<Content>;
    rowId: number;
    columnId: string;
    nextActions: ButtonAction[];
    refreshTableDataAfterRequest: boolean;
    refreshTableDataOnFail: boolean;
}

export interface ModalState {
    modalData: Nullable<ModalAction<Content>>;
    isOpen: boolean;
    rowIndexSource: number;
    isHeaderAction: boolean;
    customComponent: ReactNode;
}

export type FormMetaData = {
    value: string | string[] | number;
    code: string;
    paramType: FieldType;
}[];

export interface BodyParams {
    externalBodyParams?: Record<string, any>;
    bodyParamsFromPreviousStep?: string[];
    bodyParamsFromRowData?: string[];
    bodyParamsFromForm?: string[];
    actionsChainState: Record<string, any>;
    formData?: FieldValues;
    rowData: Record<string, any>[];
    bodyResolver?: BodyResolverType<Content>;
    tableEditDraft: Content[];
}

export interface QueryParams {
    externalQueryParams?: Record<string, string | boolean>;
    queryParamsFromPreviousStep?: string[];
    queryParamsFromRowData?: string[];
    queryParamsFromForm?: string[];
    actionsChainState: Record<string, any>;
    formData?: FieldValues;
    rowData: Record<string, any>[];
    queryParamsResolver?: QueryParamsResolver;
    customFilter?: Record<string, string | boolean>;
}

export interface PathParams<RowDataType extends Content = Content> {
    rowData: RowDataType[];
    actionsChainState?: Record<string, any>;
    path: string;
    pathParamsFromRowData?: (keyof RowDataType)[];
    pathParamsFromPreviousStep?: string[];
    externalPathParams?: Record<string, string | boolean>;
    pathResolver?: (params: PathResolverParams<RowDataType>) => string;
}

export type PathResolverParams<RowDataType extends Content = Content> = PathParams<RowDataType> & {
    formattedUrl: string;
};

export enum TableSortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export interface TableQueryProps<RowDataType extends Content = any> {
    order?: TableSortOrder;
    sort?: keyof RowDataType;
    limit?: number;
    offset?: number;
    filter?: string;
    formattedFilter?: RsqlFilterValue[];
    cursor?: string;
    switcherFilters?: Record<string, string | boolean>;
}

export type CheckboxStateType = boolean | 'indeterminate';

export interface TableDataStore {
    data: SettableAtomObject<TableDataContentArray>;
    modalState: SettableAtomObject<ModalState>;
    dataSettings: Atom<DataSettings>;
    nextPage: ActionCreator<string>;
    prevPage: ActionCreator<string>;
    activeFilters: Atom<any>;
    addFilter: PayloadActionCreator<TableDataAddFilterParams>;
    removeFilter: PayloadActionCreator<string, string>;
    clearFilters: ActionCreator<string>;
    changeSort: PayloadActionCreator<any, string>;
    activeSort: Atom<string>;
    cursor: Atom<string>;
    addCursor: PayloadActionCreator<string, string>;
    canPrev: Atom<boolean>;
    canNext: Atom<boolean>;
    add: PayloadActionCreator<TableDataContentArray, string>;
    filterMapper: Atom<Record<string, any>>;
    setInitialFilters: PayloadActionCreator<AddInitialParams, string>;
    getData: () => void;
    fetchAction: IsActionFetch & PayloadActionCreator<TableDataFetchActionPayload>;
    checkboxesData: Atom<boolean[]>;
    headerCheckboxValue: Atom<CheckboxStateType>;
    setRowCheckbox: PayloadActionCreator<RowCheckboxPayload, string>;
    setHeaderCheckbox: PayloadActionCreator<CheckboxStateType, string>;
    setCheckboxesGroup: PayloadActionCreator<boolean[], string>;
    paginationAtom: Atom<PaginationData>;
    setTotal: PayloadActionCreator<number, string>;
    setLimit: PayloadActionCreator<number, string>;
    setOffset: PayloadActionCreator<number, string>;
    buttonAction: PayloadActionCreator<ActionButtonPayload, string>;
    cellInputAction: PayloadActionCreator<ColumnInputPayload, string>;
    saveCustomFilters: PayloadActionCreator<Record<string, GroupFilter>, string>;
    visibleColumnsAtom: Atom<Nullable<Record<string, boolean>>>;
    setColumnsVisibility: PayloadActionCreator<Nullable<Record<string, boolean>>, string>;
    columnsOrderAtom: Atom<Nullable<string[]>>;
    setColumnsOrder: PayloadActionCreator<Nullable<string[]>>;
    getInitialSettings: ActionCreator<string>;
    tempCacheStorageAtom: Atom<Nullable<TableDataCache>>;
    setTempCache: PayloadActionCreator<Nullable<TableDataCache>, string>;
    isModalPendingAtom: Atom<boolean>;
    setModalPendingState: PayloadActionCreator<boolean, string>;
    isInitialFilterSetAtom: Atom<boolean>;
    setInitialFilterFlag: PayloadActionCreator<boolean, string>;
    customFilters: Atom<Record<string, GroupFilter>>;
    customFilterObject: Atom<Record<string, string | boolean>>;
    loadedOnceFlagAtom: Atom<boolean>;
    editModeAtom: Atom<boolean>;
    setEditModeAction: PayloadActionCreator<boolean, string>;
    tableDataDraftAtom: Atom<Content[]>;
    setFieldDataAfterEdit: PayloadActionCreator<UpdateFieldDataPayload, string>;
    setPollingLoadingAction: PayloadActionCreator<boolean, string>;
    pollingLoadingAtom: Atom<boolean>;
    inlineInputLoadingAtom: Atom<boolean>;
    externalUpdateFunction: (externalFilters: TableDataAddFilterParams[]) => void;
    handleGetDataFinishCase: PayloadActionCreator<PagerTableDataContent | EndlessTableDataContent, string>;
    buttonsPendingStateAtom: Atom<Record<string, boolean>>;
}

export type GroupFilterItem = {
    readableName: string;
    value: Record<string, string | boolean>;
    id: string;
};

export type UpdateFilterStringParams = {
    oldFilterValue?: string;
    newFilter: TableDataAddFilterParams;
    isFilterFormatted?: boolean;
};

export type RemoveFilterParams = {
    filtersString?: string;
    filterName: string;
};

export type AddInitialParams = {
    filters: string;
    sortData?: DefaultSortParams<Content>;
    limit?: number;
    offset?: number;
};

export enum TableQueryParamsEnum {
    SORT = 'sort',
    FILTER = 'filter',
    ORDER = 'order',
    LIMIT = 'limit',
    OFFSET = 'offset',
}

export interface UpdateFieldDataPayload {
    rowIndex: number;
    fieldName: string;
    fieldData: string | string[];
}

export type GetCellTextParams = {
    text: string[];
    hasTankerTranslate: boolean;
    i18N: (param: string) => string;
    dictionary?: TableDictionary[''];
};

export type GetDateStringParams = {
    template?: string;
    value: any;
};

export type ButtonPendingStatePayload = {
    id: string;
    value: boolean;
};
