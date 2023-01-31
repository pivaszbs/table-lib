import { Atom, PayloadActionCreator, Store } from '@reatom/core';
import { TextProps } from '@yandex-levitan/b2b';
import type { B2bIcon } from '@yandex-levitan/b2b/components/Icon/icons/index';
import type { B2bColor } from '@yandex-levitan/b2b/styles/colors/index';
import { AxiosError } from 'axios';
import { FC, ReactNode } from 'react';
import { FieldValues } from 'react-hook-form';
import {
    PathResolverParams,
    TableDataAddFilterParams,
    TableQueryProps,
    TableSortOrder,
    TableDataFetchActionPayload,
} from './entities/types';
import { FormField } from './components/Form/components/Form';
import type { SelectorItem } from './components/DynamicSelect/types';
import { BackendError } from './utils/declareActionFetch';

export type NotificationTheme = 'warning' | 'error' | 'success';

export interface NotificationType {
    title: string;
    text?: string;
    theme: NotificationTheme;
    isClosable?: boolean;
    timeout?: number;
    time?: number;
}

export enum ColumnDataTypesEnum {
    STRING = 'STRING',
    URL = 'URL',
    MULTI_SELECT = 'MULTI_SELECT',
    SINGLE_SELECT = 'SINGLE_SELECT',
    DATE = 'DATE',
    TEXT_FIELD = 'TEXT_FIELD',
    SWITCHER = 'SWITCHER',
}

export interface BaseResolverData<RowData extends Content> {
    selectedRows: RowData[];
}

export interface OnDoneResolverParams<RowData extends Content, ResponseData = any> extends BaseResolverData<RowData> {
    response: ResponseData;
}

export type OnDoneResolverType<
    RowData extends Content,
    ResponseData = any,
    DictionariesNamesType extends string = string
> = (params: OnDoneResolverParams<RowData, ResponseData>) => ButtonAction<RowData, DictionariesNamesType>[];

export interface OnFailResolverParams<RowData extends Content> extends BaseResolverData<RowData> {
    errorData: AxiosError<BackendError>;
}

export type OnFailResolverType<RowData extends Content> = (params: OnFailResolverParams<RowData>) => ButtonAction[];

export type RequestMethods = 'DELETE' | 'GET' | 'POST' | 'PUT' | 'PATCH';

export interface BodyFormatterParams<RowDataType extends Content> {
    actionsChainState: Record<string, any>;
    rowData: RowDataType[];
    bodyParamsFromRowData: (keyof RowDataType)[];
    formData: FieldValues;
    tableEditDraft: RowDataType[];
}

export type BodyResolverType<RowDataType extends Content> = (params: BodyFormatterParams<RowDataType>) => any;

export interface BaseHttpAction<RowDataType extends Content> {
    url: string;
    pathParamsFromRowData?: (keyof RowDataType)[];
    queryParamsFromRowData?: (keyof RowDataType)[];
    externalQueryParams?: Record<string, string | boolean>;
    externalPathParams?: Record<string, string>;
}

export interface BaseHttpOptions<RowDataType extends Content> {
    url: string;
    pathParamsFromRowData?: (keyof RowDataType)[];
    queryParamsFromRowData?: (keyof RowDataType)[];
    externalQueryParams?: Record<string, string | boolean>;
    externalPathParams?: Record<string, string>;
}

export interface RsqlBaseFilterValue {
    name: string;
    rawRsqlString: string;
}

export const rsqlSingleValueFilterOps = [
    'EQUAL',
    'N_EQUAL',
    'SEARCH',
    'LIKE',
    'N_LIKE',
    'LESS',
    'LESS_EQ',
    'GREAT',
    'GREAT_EQ',
] as const;
export type RsqlSingleValueFilterOps = typeof rsqlSingleValueFilterOps[number];

export const rsqlMultiValueFilterOps = ['IN', 'RANGE'] as const;
export type RsqlMultiValueFilterOps = typeof rsqlMultiValueFilterOps[number];

export type RsqlFilterOps = RsqlSingleValueFilterOps | RsqlMultiValueFilterOps;

export interface RsqlStringFilterValue extends RsqlBaseFilterValue {
    value: string;
    op: RsqlFilterOps;
}

export interface RsqlListFilterValue<T = string> extends RsqlBaseFilterValue {
    values: T[];
}

export interface RsqlRangeFilterValue<T = string> extends RsqlBaseFilterValue {
    start: T;
    end: T;
}

export type DisabledResolver<RowDataType extends Content> = ({ rowData }: { rowData: RowDataType }) => boolean;

export type RsqlFilterValue = RsqlBaseFilterValue | RsqlStringFilterValue | RsqlListFilterValue | RsqlRangeFilterValue;

export interface GetFormattedFileUrlParams {
    formattedFilters: RsqlFilterValue[];
    sort?: string;
    order?: TableSortOrder;
}

export interface DownloadFileOptions<RowDataType extends Content> extends BaseHttpOptions<RowDataType> {
    withFilters?: boolean;
    withSort?: boolean;
    getFormattedFilterQueries?: (params: GetFormattedFileUrlParams) => Record<string, string>;
    fileNameResolver?: (params: { selectedRows: RowDataType[] }) => string;
    isNativeFileFetcher?: boolean;
}

export interface RequestOptions<
    RowDataType extends Content,
    ResponseData = any,
    DictionariesNamesType extends string = string
> extends BaseHttpAction<RowDataType> {
    method: RequestMethods;
    bodyParamsFromRowData?: (keyof RowDataType)[];
    bodyParamsFromPreviousStep?: string[];
    queryParamsFromPreviousStep?: string[];
    pathParamsFromPreviousStep?: string[];
    externalBodyParams?: Record<string, any>;
    queryParamsFromForm?: string[];
    bodyParamsFromForm?: string[];
    isCriticalForNextActions?: boolean;
    hasModalPendingState?: boolean;
    closeModalOnFail?: boolean;
    onDoneActionsResolver?: OnDoneResolverType<RowDataType, any, DictionariesNamesType>;
    onFailActionsResolver?: OnFailResolverType<RowDataType>;
    pathResolver?: (params: PathResolverParams<RowDataType>) => string;
    bodyResolver?: BodyResolverType<RowDataType>;
    onDoneActions?: ButtonAction<RowDataType, DictionariesNamesType>[];
    onFailActions?: ButtonAction<RowDataType, DictionariesNamesType>[];
    mock?: ResponseData;
}
export interface StringColumnData {
    type: ColumnDataTypesEnum.STRING;
}

export interface UrlColumnData<RowDataType extends Content> {
    type: ColumnDataTypesEnum.URL;
    path: string;
    rowQueryParams?: (keyof RowDataType)[];
    queryParamsMapper?: { [key in keyof RowDataType]?: string };
    externalQueryParams?: Record<string, string>;
    pathParamsFromRowData?: (keyof RowDataType)[];
    openInNewTab?: boolean;
    nativeTransitionWithRefresh?: boolean;
    inTimeLinkResolver?: (params: { rowData: RowDataType }) => string;
    cellRedirectHandler?: (url: string) => void;
}
export interface EditableColumnData<
    RowDataType extends Content,
    ResponseData = any,
    DictionariesNamesType extends string = string
> {
    type:
        | ColumnDataTypesEnum.MULTI_SELECT
        | ColumnDataTypesEnum.TEXT_FIELD
        | ColumnDataTypesEnum.SWITCHER
        | ColumnDataTypesEnum.SINGLE_SELECT;
    nextActions?: ButtonAction<RowDataType, DictionariesNamesType>[];
    refreshTableDataAfterRequest?: boolean;
    refreshTableDataOnFail?: boolean;
    requestOptions?: RequestOptions<RowDataType, ResponseData, DictionariesNamesType>;
    isDisabledResolver?: DisabledResolver<RowDataType>; // @deprecated use  ColumnConfig method
}

export interface MultiSelectColumnData<
    RowDataType extends Content,
    ResponseData = any,
    DictionariesNamesType extends string = string
> extends EditableColumnData<RowDataType, ResponseData, DictionariesNamesType> {
    type: ColumnDataTypesEnum.MULTI_SELECT;
    dictionaryPath?: DictionariesNamesType;
    items?: SelectorItem[];
    hasSelfFilter?: boolean;
    hasSearch?: boolean;
    hasResetButton?: boolean;
}

export interface SingleSelectColumnData<
    RowDataType extends Content,
    ResponseData = any,
    DictionariesNamesType extends string = string
> extends EditableColumnData<RowDataType, ResponseData, DictionariesNamesType> {
    type: ColumnDataTypesEnum.SINGLE_SELECT;
    dictionaryPath?: DictionariesNamesType;
    items?: SelectorItem[];
    hasSelfFilter?: boolean;
    hasSearch?: boolean;
    hasResetButton?: boolean;
}

export interface DateColumnData {
    type: ColumnDataTypesEnum.DATE;
    // Шаблон форматирования даты (date-fns)
    template?: string;
}

export interface TextField<
    RowDataType extends Content,
    ResponseData = any,
    DictionariesNamesType extends string = string
> extends EditableColumnData<RowDataType, ResponseData, DictionariesNamesType> {
    type: ColumnDataTypesEnum.TEXT_FIELD;
    inputType?: 'number' | 'text';
}

export interface Switcher<
    RowDataType extends Content,
    ResponseData = any,
    DictionariesNamesType extends string = string
> extends EditableColumnData<RowDataType, ResponseData, DictionariesNamesType> {
    type: ColumnDataTypesEnum.SWITCHER;
}

export type ColumnDataType<
    RowDataType extends Content,
    ResponseData = any,
    DictionariesNamesType extends string = string
> =
    | StringColumnData
    | UrlColumnData<RowDataType>
    | MultiSelectColumnData<RowDataType, ResponseData, DictionariesNamesType>
    | SingleSelectColumnData<RowDataType, ResponseData, DictionariesNamesType>
    | DateColumnData
    | TextField<RowDataType, ResponseData, DictionariesNamesType>
    | Switcher<RowDataType, ResponseData, DictionariesNamesType>;

export enum ActionsEnum {
    OPEN_MODAL = 'OPEN_MODAL',
    REDIRECT = 'REDIRECT',
    SEND_REQUEST = 'SEND_REQUEST',
    CLOSE_MODAL = 'CLOSE_MODAL',
    REFRESH_TABLE = 'REFRESH_TABLE',
    OPEN_FIRST_PAGE = 'OPEN_FIRST_PAGE',
    NOTIFICATION = 'NOTIFICATION',
    CUSTOM_ACTION = 'CUSTOM_ACTION',
    DOWNLOAD_FILE = 'DOWNLOAD_FILE',
    START_EDIT = 'START_EDIT',
    STOP_EDIT = 'STOP_EDIT',
    CANCEL_EDIT = 'CANCEL_EDIT',
    EXPORT_TABLE = 'EXPORT_TABLE',
}

export enum ExportFormatsEnum {
    XLS = 'XLS',
}

export interface BaseAction {
    type: ActionsEnum;
    isActionForGroup?: boolean;
    notification?: NotificationType;
}

export interface StartEditAction extends BaseAction {
    type: ActionsEnum.START_EDIT;
}

export interface CancelEditAction extends BaseAction {
    type: ActionsEnum.CANCEL_EDIT;
}

export interface ExportParams {
    format?: ExportFormatsEnum;
    fileName?: string;
    sheetName?: string;
}

export interface ExportTableAction extends BaseAction {
    type: ActionsEnum.EXPORT_TABLE;
    exportParams?: ExportParams;
}

export interface CustomActionPayload<RowDataType extends Content> {
    selectedRows: RowDataType[];
    refreshTableCallback: () => void;
}

export type QueryResolverParams<RowDataType extends Content> = {
    selectedRows: RowDataType[];
    paramsFromPreviousStep: Record<string, any>;
};

export type QueryParamsResolver<RowDataType extends Content = Content> = (
    params: QueryResolverParams<RowDataType>
) => Record<string, string>;

export interface RedirectAction<RowDataType extends Content> extends BaseAction {
    type: ActionsEnum.REDIRECT;
    url: string;
    pathParamsFromRowData?: (keyof RowDataType)[];
    queryParamsFromRowData?: (keyof RowDataType)[];
    labelFromRowData?: keyof RowDataType;
    queryParamsFromPreviousStep?: string[];
    pathParamsFromPreviousStep?: string[];
    externalQueryParams?: Record<string, string | boolean>;
    externalPathParams?: Record<string, string>;
    // TODO сделать нормальный проброс фильтров https://st.yandex-team.ru/MARKETWMSFRONT-1668
    queryParamsResolver: QueryParamsResolver<RowDataType>;
}

export interface CustomFilter {
    id: string;
    queryParams: Record<string, string | boolean>;
    readableName: string;
    dataE2e?: string;
}

export enum ParamsType {
    PATH = 'PATH',
    BODY = 'BODY',
    QUERY = 'QUERY',
}

export interface ParamsFromPreviousStep {
    type: ParamsType;
    paramsList: string[];
}

export interface ResponseHandlingOptions {
    saveResponseName: string;
    pathInResponse?: string;
}

export interface RequestAction<
    RowDataType extends Content,
    ResponseData = any,
    DictionariesNamesType extends string = string
> extends BaseAction {
    type: ActionsEnum.SEND_REQUEST;
    requestOption: RequestOptions<RowDataType, ResponseData, DictionariesNamesType>;
    responseHandlingOptions?: ResponseHandlingOptions;
}

export interface DownloadFileAction<RowDataType extends Content> extends BaseAction {
    type: ActionsEnum.DOWNLOAD_FILE;
    requestOption: DownloadFileOptions<RowDataType>;
}

export interface ExternalCustomAction<RowDataType extends Content> extends BaseAction {
    type: ActionsEnum.CUSTOM_ACTION;
    customAction: PayloadActionCreator<CustomActionPayload<RowDataType>, string>;
}

export interface RequestEditTableDataFormatterParams<RowDataType extends Content = Content> {
    data: RowDataType[];
}
export interface StopEditAction<
    RowDataType extends Content,
    ResponseData = any,
    DictionariesNamesType extends string = string
> extends BaseAction {
    type: ActionsEnum.STOP_EDIT;
    requestOption: RequestOptions<RowDataType, ResponseData, DictionariesNamesType>;
    responseHandlingOptions?: ResponseHandlingOptions;
}

export enum ModalContentTypesEnum {
    FORM = 'FORM',
    FORM_FROM_ROW = 'FORM_FROM_ROW',
    TEXT = 'TEXT',
    CUSTOM_CONTENT = 'CUSTOM_CONTENT',
}

export interface TextModalContent {
    type: ModalContentTypesEnum.TEXT;
    text: string;
}

export type TableFormField<DictionariesNamesType extends string = string> = FormField & {
    listItemsDictionaryPath?: DictionariesNamesType;
};

export interface FormInitialDataResolverParams<RowDataType extends Content> {
    selectedRowsData: RowDataType[];
}

export type FormDataFormatter = (formData: FieldValues) => Record<string, any>;
export interface FormModalContent<RowDataType extends Content, DictionariesNamesType extends string = string> {
    type: ModalContentTypesEnum.FORM;
    formFields?: TableFormField<DictionariesNamesType>[];
    formDataFormatter?: FormDataFormatter;
    formFieldsConfigResolver?: ({
        selectedRowsData,
    }: FormInitialDataResolverParams<RowDataType>) => TableFormField<DictionariesNamesType>[];
    formInitialDataResolver?: ({ selectedRowsData }: FormInitialDataResolverParams<RowDataType>) => FieldValues;
}

export interface CustomModalContentProps<RowData extends Content, ResponsesData extends Record<string, any> = any> {
    responsesData: ResponsesData;
    selectedRowsData: RowData[];
    getData: () => void;
    closeModal: () => void;
}

export interface CustomContent<RowData extends Content, ResponsesData extends Record<string, any> = any> {
    type: ModalContentTypesEnum.CUSTOM_CONTENT;
    component: FC<CustomModalContentProps<RowData, ResponsesData>>;
}
export interface ModalAction<RowDataType extends Content, DictionariesNamesType extends string = string>
    extends BaseAction {
    type: ActionsEnum.OPEN_MODAL;
    modalTitle: string;
    modalWidth?: number;
    cancel?: {
        text: string;
        action: ButtonAction<RowDataType, DictionariesNamesType>[];
    };
    submit?: {
        text: string;
        action: ButtonAction<RowDataType, DictionariesNamesType>[];
    };
    modalContent?: TextModalContent | FormModalContent<RowDataType, DictionariesNamesType> | CustomContent<RowDataType>;
}

export interface CloseModalAction<RowDataType extends Content, DictionariesNamesType extends string = string>
    extends BaseAction {
    type: ActionsEnum.CLOSE_MODAL;
    action: ButtonAction<RowDataType, DictionariesNamesType>[];
}

export type ButtonAction<RowDataType extends Content = Content, DictionariesNamesType extends string = string> =
    | RedirectAction<RowDataType>
    | RequestAction<RowDataType>
    | ModalAction<RowDataType, DictionariesNamesType>
    | CloseModalAction<RowDataType, DictionariesNamesType>
    | ExternalCustomAction<RowDataType>
    | DownloadFileAction<RowDataType>
    | BaseAction
    | StartEditAction
    | StopEditAction<RowDataType, any, DictionariesNamesType>;

export enum ColumnTypesEnum {
    DATE = 'DateField',
    DATE_TIME = 'DateTimeField',
    STRING = 'TextField',
    LIST = 'Select',
    CHECKBOX = 'Checkbox',
    ACTIONS = 'Actions',
    MULTILIST = 'MultiSelect',
    NUMBER = 'Number',
    MULTI_STRING = 'MultiTextField',
}

export type DataColumnTypes =
    | ColumnTypesEnum.DATE
    | ColumnTypesEnum.DATE_TIME
    | ColumnTypesEnum.LIST
    | ColumnTypesEnum.MULTILIST
    | ColumnTypesEnum.MULTI_STRING
    | ColumnTypesEnum.NUMBER
    | ColumnTypesEnum.STRING;

export type ServiceColumnTypes = ColumnTypesEnum.ACTIONS | ColumnTypesEnum.CHECKBOX | null;

export enum PaginationTypesEnum {
    ENDLESS_SCROLL = 'ENDLESS_SCROLL',
    PAGER = 'PAGER',
}

export interface Pagination {
    type: PaginationTypesEnum;
}

export interface PagerPagination extends Pagination {
    itemsOnPageOptions: number[];
    hasScrollOnNewPage: boolean;
    defaultItemsOnPage?: number;
}

export interface CustomCellProps<RowDataType extends Content> {
    rowData: RowDataType;
    refreshTable: () => void;
    actionButtons: ReactNode;
}

export type RedirectProps<RowDataType extends Content> = {
    redirectAction: RedirectAction<RowDataType>;
    tableData: RowDataType[];
    rowIndex: number;
    actionsChainState: Record<string, any>;
    formattedForm?: Record<string, any>;
    selectedRows: RowDataType[];
    additinalData?: Record<string, any>;
};

export type ColumnType = Nullable<ColumnTypesEnum>;

export type TableCellTextProps = Partial<Pick<TextProps<ReactNode, any>, 'size' | 'weight' | 'color'>>;

export type ValueResolver = (value: ContentField) => ContentField;

export type TextStylesResolver = (text: string) => TableCellTextProps;

export type DataColumnIdentityType<RowDataType extends Content> = {
    id: keyof RowDataType;
    title: string;
    type: DataColumnTypes;
};

export type ServiceColumnIdentityType = {
    id: string;
    title: string;
    type: ServiceColumnTypes;
};

export type CustomCellColumnType<RowDataType extends Content, DictionariesNamesType extends string = string> = {
    id: string;
    customCell: FC<CustomCellProps<RowDataType>>;
    type: DataColumnTypes | ServiceColumnTypes;
};

export type ColumnConfigIdentityType<RowDataType extends Content, DictionariesNamesType extends string = string> =
    | DataColumnIdentityType<RowDataType>
    | CustomCellColumnType<RowDataType, DictionariesNamesType>
    | ServiceColumnIdentityType;

export type ExportColumnParams<RowDataType extends Content = Content, DictionariesNamesType extends string = string> = {
    valueFormatter?: (params: {
        rowData: RowDataType;
    }) => ColumnDataType<RowDataType, any, DictionariesNamesType> | undefined;
    notSaveUiFormatting?: boolean;
    hideInExport?: boolean;
};

export type ColumnConfig<RowDataType extends Content = Content, DictionariesNamesType extends string = string> = {
    title: string;
    multiListSeparator?: string;
    hasSingleDateOption?: boolean;
    options?: string[] | SelectorItem[];
    hasSort?: boolean;
    hasFilter?: boolean;
    tankerKeysetName?: string;
    dictionaryPath?: string;
    customCell?: FC<CustomCellProps<RowDataType>>;
    columnActionsForCustomCell?: ActionButton<RowDataType, DictionariesNamesType>[];
    columnDataType?: ColumnDataType<RowDataType, any, DictionariesNamesType>;
    columnDataTypeResolver?: (params: {
        rowData: RowDataType;
    }) => ColumnDataType<RowDataType, any, DictionariesNamesType> | undefined;
    optionsDictionaryName?: DictionariesNamesType;
    // Максимальная ширина столбца в пикселях
    maxWidth?: number;
    minWidth?: number;
    isMultilineText?: boolean;
    hasEllipsis?: boolean;
    tooltipText?: string;
    valuesToHide?: any[];
    filterE2e?: string;
    withoutHeaderCheckbox?: boolean;
    isHiddenByDefault?: boolean;
    withSpaceTrimmer?: boolean;
    textStylesResolver?: TextStylesResolver;
    autoLikeFilterStyle?: boolean;
    columnValueResolver?: ValueResolver;
    hiddenValuesFiller?: string;
    canNotBeHiddenByUser?: boolean;
    titleForUserSettings?: string;
    exportParams?: ExportColumnParams<RowDataType, DictionariesNamesType>;
    isDisabledResolver?: DisabledResolver<RowDataType>;
} & ColumnConfigIdentityType<RowDataType, DictionariesNamesType>;

export enum DropdownButtonOpeningEnum {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
}

export interface DropdownButton<RowDataType extends Content = Content, DictionariesNamesType extends string = string> {
    opening: DropdownButtonOpeningEnum;
    buttonsList: ActionButton<RowDataType, DictionariesNamesType>[];
}

export interface ActionButton<RowDataType extends Content = Content, DictionariesNamesType extends string = string> {
    actions?: ButtonAction<RowDataType, DictionariesNamesType>[];
    text?: string;
    icon?: B2bIcon;
    title?: string;
    tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
    dropdownButtons?: DropdownButton<RowDataType, DictionariesNamesType>;
    iconColor?: B2bColor;
    iconSize?: 's' | 'm' | 'l';
    isDisabledWithoutItems?: boolean;
    checkDisableWithRowData?: (selectedRows: RowDataType[]) => boolean;
    checkVisibilityWithRowData?: (selectedRows: RowDataType[]) => boolean;
    dataE2eBase?: string;
    isDisableInEditMode?: boolean;
    isDisableInReadMode?: boolean;
    isHideWithoutDropdownButtons?: boolean;
    rowUniqueField?: string;
    uniqueId?: string;
}

export interface TableConfig<RowDataType extends Content = any, DictionariesNamesType extends string = string> {
    tableId: string;
    title: string;
    getDataEndpoint?: string;
    getSyncDataCallback?: (
        params: TableDataFetchActionPayload
    ) => PagerTableDataContent<RowDataType> | EndlessTableDataContent<RowDataType>;
    columns: ColumnConfig<RowDataType, DictionariesNamesType>[];
    headerActions: ActionButton<RowDataType, DictionariesNamesType>[];
    customFilters?: CustomFilter[];
    pagination?: Pagination | PagerPagination;
    commonRowActions: ActionButton<RowDataType, DictionariesNamesType>[];
    fetchDataPeriod?: number;
    isResizable?: boolean;
    hasTableSettings?: boolean;
    hasUserSettingsInCache?: boolean;
    withoutInitialFetchWithEmptyFilter?: boolean;
    emptyListMessage?: string;
    messageBeforeInitialLoading?: string;
    defaultFilters?: Record<string, string>;
    withoutDesktopLayout?: boolean;
    withoutClearFiltersButton?: boolean;
    withoutAppFooter?: boolean;
    hasTitle?: boolean;
    defaultSort?: DefaultSortParams<RowDataType>;
    responseDataFromatter?: (response: any) => TableDataContent<RowDataType>;
    paramsDataFormatter?: (params: TableQueryProps<RowDataType>) => any;
    shouldTableUpdate?: (rowsData: RowDataType[]) => any;
    hasEditableMode?: boolean;
    externalFiltersAtom?: Atom<TableDataAddFilterParams[]>;
    saveFiltersInUrl?: boolean;
    rowUniqueField?: string;
}

export type CustomFilterUpdateFunction = (externalFilters: TableDataAddFilterParams[]) => void;

export interface CustomFilterRenderFunctionProps {
    updateFunction: CustomFilterUpdateFunction;
}

export type CustomFilterRenderFunction = (props: CustomFilterRenderFunctionProps) => JSX.Element;

export type TableDictionary = Record<string, Array<SelectorItem> | undefined>;

export type ContentField = string | number | boolean | string[] | null | SelectorItem[];

export type Content = Record<string, any>;

export interface TableDataContent<RowDataType extends Content = Content> {
    content: RowDataType[];
}

export interface PagerTableDataContent<RowDataType extends Content = Content> extends TableDataContent<RowDataType> {
    limit: number;
    offset: number;
    total: number;
}

export interface EndlessTableDataContent<RowDataType extends Content = Content> extends TableDataContent<RowDataType> {
    cursor: {
        value: string;
    };
}

export type ColumnsMeta = {
    maxWidth?: number;
    hasEllipsis?: boolean;
    isMultilineText?: boolean;
    type?: ColumnTypesEnum | null;
    id?: string;
}[];

export type TankerKeyset = Record<string, Record<string, string>>;

export type MultipleTankerKeyset = Record<string, TankerKeyset>;

export interface TableDataCache {
    tableWidth?: number;
    columnsWidth?: Record<string, number>;
    visibleColumns?: Nullable<Record<string, boolean>>;
    columnsOrder?: Nullable<string[]>;
}

export interface ColumnSizeData {
    id: string;
    size: number;
}

export type TableValues = string | ReactNode | number | Nullish;
export interface TableData {
    titles: ReactNode[];
    values: TableValues[][];
}

export type FormFieldData = string | number | string[];

export interface ModalFormSubmitPayload {
    actions: ButtonAction[];
    isHeaderAction: boolean;
    rowIndex?: number;
    formData?: FieldValues;
    formDataFormatter?: FormDataFormatter;
}

export interface DefaultSortParams<RowDataType extends Content> {
    sort: keyof RowDataType;
    order: TableSortOrder;
}

export interface RefTableInterface {
    getData: () => void;
}

export type Nullish = null | undefined;

export type Nullable<T> = T | null;

export interface FetchOptional<Result> {
    onDone?: (result: Result, store: Store) => void;
    onFail?: (error: AxiosError<BackendError>, store: Store) => void;
    callImmediate?: boolean;
}

export interface BaseComponentProps {
    dataE2e?: string;
    disabled?: boolean;
    onBlur?: () => void;
    onFocus?: () => void;
}

export interface ChipType {
    name: string;
    onClear?: () => void;
}

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
