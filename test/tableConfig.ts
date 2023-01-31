import { SelectTypeEnum } from '../src/TableDataPage/components/DynamicSelect/types';
import {
    ActionsEnum,
    ColumnDataTypesEnum,
    ColumnTypesEnum,
    ModalContentTypesEnum,
    PaginationTypesEnum,
    TableConfig as TableConfigType,
} from '../src';
import { User } from './generator';
import { TableDataMock } from './tableDataMock';

export const TableConfig: TableConfigType<User> = {
    tableId: 'usersTable',
    title: 'Пользователи',
    hasTableSettings: true,
    hasUserSettingsInCache: true,
    emptyListMessage: 'По заданному фильтру отсутствуют пользователи',
    isResizable: true,
    headerActions: [
        {
            actions: [
                {
                    type: ActionsEnum.OPEN_MODAL,
                    modalTitle: 'Добавление ролей пользователю',
                    modalContent: {
                        type: ModalContentTypesEnum.FORM,
                        formFields: [
                            {
                                type: 'multiSelect',
                                props: {
                                    name: 'logins',
                                    labelText: 'Логины',
                                    validationSchema: 'multiSelectRequire',
                                    selectType: SelectTypeEnum.MULTI,
                                    disabled: true,
                                    items: [],
                                    defaultValue: [],
                                    size: 'm',
                                },
                            },
                            {
                                listItemsDictionaryPath: 'roleNames',
                                type: 'multiSelect',
                                props: {
                                    hasSearch: true,
                                    hasSelfFilter: true,
                                    name: 'roleNames',
                                    labelText: 'Добавьте роли',
                                    validationSchema: 'multiSelectRequire',
                                    selectType: SelectTypeEnum.MULTI,
                                    defaultValue: [],
                                    size: 'm',
                                },
                            },
                        ],
                    },
                    submit: {
                        action: [
                            {
                                type: ActionsEnum.SEND_REQUEST,
                                requestOption: {
                                    method: 'POST',
                                    url: `/auth/users/roles`,
                                    bodyParamsFromForm: ['logins', 'roleNames'],
                                    hasModalPendingState: true,
                                    closeModalOnFail: true,
                                    isCriticalForNextActions: true,
                                },
                                notification: {
                                    title: 'Роли добавлены',
                                    theme: 'success',
                                },
                            },
                            {
                                type: ActionsEnum.CLOSE_MODAL,
                            },
                        ],
                        text: 'Добавить роли',
                    },
                    cancel: {
                        action: [
                            {
                                type: ActionsEnum.CLOSE_MODAL,
                                action: [],
                            },
                        ],
                        text: 'Отмена',
                    },
                },
            ],
            text: 'Добавить роли',
            title: 'Добавить роли',
            isDisabledWithoutItems: true,
        },
        {
            actions: [
                {
                    type: ActionsEnum.REFRESH_TABLE,
                },
            ],
            icon: 'refresh',
            iconColor: 'electricBlue',
            title: 'Обновить данные',
            dataE2eBase: 'header_refresh_button',
        },
        {
            actions: [
                {
                    type: ActionsEnum.EXPORT_TABLE,
                },
            ],
            icon: 'download',
            iconColor: 'graphiteGray',
            title: 'Загрузить xls',
            dataE2eBase: 'download_xls',
        },
    ],
    commonRowActions: [
        {
            actions: [
                {
                    type: ActionsEnum.OPEN_MODAL,
                    modalTitle: 'Клонирование пользователя',
                    modalContent: {
                        type: ModalContentTypesEnum.FORM,
                        formFields: [
                            {
                                type: 'textMultiField',
                                props: {
                                    name: 'logins',
                                    labelText: 'Добавьте логины',
                                    validationSchema: 'multiSelectRequire',
                                    selectType: SelectTypeEnum.SIMPLE,
                                    size: 'm',
                                    defaultValue: [],
                                },
                            },
                        ],
                    },
                    submit: {
                        action: [
                            {
                                type: ActionsEnum.SEND_REQUEST,
                                requestOption: {
                                    method: 'POST',
                                    url: `/auth/users/:userId/clone`,
                                    pathParamsFromRowData: ['userId'],
                                    bodyParamsFromForm: ['logins'],
                                    bodyParamsFromRowData: ['locale'],
                                },
                            },
                        ],
                        text: 'Клонирование',
                    },
                    cancel: {
                        action: [
                            {
                                type: ActionsEnum.CLOSE_MODAL,
                                action: [],
                            },
                        ],
                        text: 'Отмена',
                    },
                },
            ],
            icon: 'copy',
            title: 'Клонировать пользователя',
            iconColor: 'electricBlue',
            dataE2eBase: 'clone_user',
        },
        {
            actions: [
                {
                    type: ActionsEnum.REDIRECT,
                    url: `/users/user`,
                    queryParamsFromRowData: ['userId', 'login'],
                },
            ],
            icon: 'open',
            title: 'Перейти к пользователю',
            iconColor: 'electricBlue',
            dataE2eBase: 'open_user',
        },
    ],
    pagination: {
        type: PaginationTypesEnum.PAGER,
        itemsOnPageOptions: [10, 15, 20, 50, 100, 500, 1000, 5000, 10000],
        hasScrollOnNewPage: true,
        defaultItemsOnPage: 20,
    },
    getDataEndpoint: `/auth/users`,
    columns: [
        {
            id: 'checkbox',
            title: '',
            canNotBeHiddenByUser: true,
            titleForUserSettings: 'Чекбокс',
            type: ColumnTypesEnum.CHECKBOX,
            isDisabledResolver: ({rowData}) => rowData.active,
        },
        {
            id: 'actions',
            title: 'Действия',
            type: ColumnTypesEnum.ACTIONS,
        },
        {
            id: 'active',
            title: 'Активен',
            type: ColumnTypesEnum.LIST,
            hasSort: false,
            hasFilter: true,
            options: [
                { value: '1', label: 'Активен' },
                { value: '0', label: 'Не активен' },
            ],
            columnDataType: {
                type: ColumnDataTypesEnum.SWITCHER,
                requestOptions: {
                    method: 'POST',
                    url: `/auth/users/:userId/`,
                    pathResolver: ({ rowData, formattedUrl }) =>
                        `${formattedUrl}${rowData[0].active ? 'activate' : 'deactivate'}`,
                    pathParamsFromRowData: ['userId'],
                },
                refreshTableDataAfterRequest: true,
                refreshTableDataOnFail: false,
            },
        },
        {
            id: 'fullName',
            title: 'Полное имя',
            type: ColumnTypesEnum.MULTI_STRING,
            hasSort: true,
            hasFilter: true,
            hasEllipsis: false,
            columnDataType: {
                type: ColumnDataTypesEnum.STRING,
            },
        },
        {
            id: 'login',
            title: 'Логин',
            type: ColumnTypesEnum.MULTI_STRING,
            hasSort: true,
            hasFilter: true,
            hasEllipsis: false,
            columnDataType: {
                type: ColumnDataTypesEnum.STRING,
            },
        },
        {
            id: 'externLogin',
            title: 'Внешний логин',
            type: ColumnTypesEnum.MULTI_STRING,
            hasSort: true,
            hasFilter: true,
            hasEllipsis: false,
            columnDataType: {
                type: ColumnDataTypesEnum.STRING,
            },
        },
        {
            id: 'locale',
            title: 'Локаль',
            type: ColumnTypesEnum.DATE_TIME,
            hasSort: true,
            hasFilter: true,
            hasEllipsis: false,
            columnDataType: {
                type: ColumnDataTypesEnum.STRING,
            },
        },
        {
            id: 'roleNames',
            title: 'Роли',
            type: ColumnTypesEnum.MULTI_STRING,
            hasSort: true,
            hasFilter: true,
            hasEllipsis: true,
        },
    ],
};
