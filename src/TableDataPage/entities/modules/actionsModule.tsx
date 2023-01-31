/* eslint-disable max-lines */
import { Atom, declareAction, declareAtom, PayloadActionCreator } from '@reatom/core';
import castArray from 'lodash/castArray';
import React from 'react';
import { AxiosInstance } from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import { settableAtomCreatorObject, SettableAtomObject } from '../../utils';
import { declareActionFetch, FetchErrorHandler, SuccessNotificationHandler } from '../../utils/declareActionFetch';
import { apiGenerator } from '../../apiGenerator';
import {
    ActionButtonPayload,
    CheckboxStateType,
    ColumnInputPayload,
    ModalState,
    RowCheckboxPayload,
    TableDataContentArray,
    UpdateFieldDataPayload,
    ButtonPendingStatePayload,
} from '../types';
import { getBody, getFormattedPath, getQueryParams } from '../utils';
import {
    ActionsEnum,
    ColumnConfig,
    Content,
    CustomContent,
    ExternalCustomAction,
    ModalAction,
    ModalContentTypesEnum,
    RedirectAction,
    RedirectProps,
    RequestAction,
    StopEditAction,
    TableConfig,
    ExportTableAction,
    DownloadFileAction,
} from '../../types';
/* eslint-disable no-await-in-loop */

interface Params {
    data: SettableAtomObject<TableDataContentArray>;
    client: AxiosInstance;
    tableConfig?: TableConfig;
    modalState: SettableAtomObject<ModalState>;
    setOffset: PayloadActionCreator<number>;
    getData: (isRefresh?: boolean) => void;
    add: PayloadActionCreator<Content[], string>;
    fetchErrorHandler?: FetchErrorHandler;
    redirectCallback?: (redirectProps: RedirectProps<any>) => void;
    successNotificationHandler?: SuccessNotificationHandler;
    setInlineInputLoadingAction: PayloadActionCreator<boolean, string>;
    isMock: boolean;
}

interface Result {
    buttonAction: PayloadActionCreator<ActionButtonPayload>;
    cellInputAction: PayloadActionCreator<ColumnInputPayload>;
    checkboxesData: Atom<boolean[]>;
    headerCheckboxValue: Atom<CheckboxStateType>;
    setRowCheckbox: PayloadActionCreator<RowCheckboxPayload>;
    setHeaderCheckbox: PayloadActionCreator<CheckboxStateType>;
    setCheckboxesGroup: PayloadActionCreator<boolean[]>;
    isModalPendingAtom: Atom<boolean>;
    setModalPendingState: PayloadActionCreator<boolean>;
    editModeAtom: Atom<boolean>;
    setEditModeAction: PayloadActionCreator<boolean, string>;
    tableDataDraftAtom: Atom<Content[]>;
    setFieldDataAfterEdit: PayloadActionCreator<UpdateFieldDataPayload, string>;
    buttonsPendingStateAtom: Atom<Record<string, boolean>>;
}

export const actionsModule = ({
    data,
    modalState,
    getData,
    setOffset,
    tableConfig,
    client,
    add,
    fetchErrorHandler,
    redirectCallback,
    successNotificationHandler,
    setInlineInputLoadingAction,
    isMock,
}: Params): Result => {
    const setFieldDataAfterEdit = declareAction<UpdateFieldDataPayload>(
        `${tableConfig?.tableId}.tableData.setFieldDataAfterEdit`
    );

    const setButtonPendingStateAction = declareAction<ButtonPendingStatePayload>(
        `${tableConfig?.tableId}.tableData.setButtonPendingStateAction`
    );

    const { atom: isModalPendingAtom, set: setModalPendingState } = settableAtomCreatorObject<boolean>(
        `${tableConfig?.tableId}.tableData.isModalPendingAtom`,
        false
    );

    const { atom: editModeAtom, set: setEditModeAction } = settableAtomCreatorObject<boolean>(
        `${tableConfig?.tableId}.tableData.editModeAtom`,
        false
    );

    const { atom: buttonsPendingStateAtom } = settableAtomCreatorObject<Record<string, boolean>>(
        `${tableConfig?.tableId}.tableData.buttonsPendingStateAtom`,
        {},
        (on) => [on(setButtonPendingStateAction, (state, payload) => ({ ...state, [payload.id]: payload.value }))]
    );

    const { atom: tableDataDraftAtom, set: setDataDraftAction } = settableAtomCreatorObject<Content[]>(
        `${tableConfig?.tableId}.tableData.tableDataDraftAtom`,
        [],
        (on) => [
            on(add, (state, payload) => [...state, ...payload]),
            on(data.set, (_, payload) => payload),
            on(setFieldDataAfterEdit, (state, { rowIndex, fieldName, fieldData }) => {
                const newState = cloneDeep(state);
                newState[rowIndex][fieldName] = fieldData;
                return newState;
            }),
        ]
    );

    const setRowCheckbox = declareAction<RowCheckboxPayload>(`${tableConfig?.tableId}.tableData.setRowCheckbox`);

    const setCheckboxesGroup = declareAction<boolean[]>(`${tableConfig?.tableId}.tableData.setCheckboxesGroup`);

    const checkboxesData = declareAtom<boolean[]>(`${tableConfig?.tableId}.tableData.checkBoxesData`, [], (on) => [
        on(setRowCheckbox, (state, { id: rowId, value }) => {
            const newState = [...state];
            newState[rowId] = value;
            return newState;
        }),
        on(setCheckboxesGroup, (state, payload) => payload),
    ]);

    const setHeaderCheckbox = declareAction<CheckboxStateType>(`${tableConfig?.tableId}.tableData.setHeaderCheckbox`);

    const headerCheckboxValue = declareAtom<CheckboxStateType>(
        `${tableConfig?.tableId}.tableData.headerCheckboxState`,
        false,
        (on) => [on(setHeaderCheckbox, (state, value) => value)]
    );

    const buttonAction = declareAction<ActionButtonPayload>(
        `${tableConfig?.tableId}.tableData.buttonAction`,
        async (
            {
                rowIndex,
                actionButtons,
                isHeaderAction = false,
                formData,
                formDataFormatter,
                responsesData = {},
                dictionaries,
                tankerKeyset,
                href = '',
                uniqueId,
            },
            store
        ) => {
            const actionsChainState: Record<string, any> = responsesData;
            const tableData = store.getState(data.atom);
            const rowData = tableData[rowIndex];
            const checkboxes = store.getState(checkboxesData);
            let formattedForm = formData;
            if (formData && formDataFormatter) {
                formattedForm = formDataFormatter(formData);
            }

            for (const action of actionButtons) {
                const { notification } = action;
                const selectedRows =
                    isHeaderAction || action.isActionForGroup
                        ? tableData.filter((_, index) => Boolean(checkboxes[index]))
                        : castArray(rowData);

                if (action.type === ActionsEnum.CUSTOM_ACTION) {
                    store.dispatch(
                        (action as ExternalCustomAction<any>).customAction({
                            selectedRows,
                            refreshTableCallback: () => getData(true),
                        })
                    );
                }
                if (action.type === ActionsEnum.SEND_REQUEST || action.type === ActionsEnum.STOP_EDIT) {
                    let shouldChainBreak = false;
                    const {
                        requestOption: {
                            method,
                            bodyParamsFromRowData,
                            pathParamsFromRowData,
                            queryParamsFromRowData,
                            externalBodyParams,
                            externalPathParams,
                            externalQueryParams,
                            bodyParamsFromPreviousStep,
                            queryParamsFromPreviousStep,
                            pathParamsFromPreviousStep,
                            bodyParamsFromForm,
                            queryParamsFromForm,
                            mock,
                            url: path,
                            isCriticalForNextActions,
                            hasModalPendingState,
                            closeModalOnFail,
                            onDoneActions = [],
                            onFailActions = [],
                            onDoneActionsResolver,
                            onFailActionsResolver,
                            bodyResolver,
                        },
                        responseHandlingOptions,
                    } = action as RequestAction<Content> | StopEditAction<Content>;

                    if (action.type === ActionsEnum.STOP_EDIT) {
                        store.dispatch(setEditModeAction(false));
                    }

                    const tableEditDraft = store.getState(tableDataDraftAtom);

                    const queryParams = getQueryParams({
                        externalQueryParams,
                        queryParamsFromPreviousStep,
                        queryParamsFromRowData,
                        queryParamsFromForm,
                        actionsChainState,
                        formData: formattedForm,
                        rowData: selectedRows,
                    });

                    const formattedRequestBody = getBody({
                        externalBodyParams,
                        bodyParamsFromPreviousStep,
                        bodyParamsFromRowData,
                        bodyParamsFromForm,
                        actionsChainState,
                        formData: formattedForm,
                        rowData: selectedRows,
                        bodyResolver,
                        tableEditDraft,
                    });

                    const formattedPath = getFormattedPath({
                        externalPathParams,
                        pathParamsFromPreviousStep,
                        pathParamsFromRowData,
                        rowData: selectedRows,
                        path,
                        actionsChainState,
                    });

                    const headerActionApi = apiGenerator({ path: formattedPath, type: method, mock, client, isMock });
                    const baseNextActionData = {
                        rowIndex,
                        formData,
                        formDataFormatter,
                        isHeaderAction,
                    };
                    const headerFetchAction = declareActionFetch(headerActionApi, {
                        onDone: (response) => {
                            let successActionsList = [...onDoneActions];
                            if (responseHandlingOptions) {
                                const { saveResponseName, pathInResponse } = responseHandlingOptions;
                                actionsChainState[saveResponseName] = pathInResponse
                                    ? response[pathInResponse]
                                    : response;
                            }

                            if (onDoneActionsResolver) {
                                const nextActions = onDoneActionsResolver({
                                    selectedRows,
                                    response,
                                });
                                successActionsList = [...successActionsList, ...nextActions];
                            }

                            store.dispatch(
                                buttonAction({
                                    ...baseNextActionData,
                                    responsesData: actionsChainState,
                                    actionButtons: successActionsList,
                                })
                            );
                        },
                        onFail: (errorData) => {
                            if (closeModalOnFail) {
                                store.dispatch(
                                    modalState.set({
                                        modalData: null,
                                        isOpen: false,
                                        rowIndexSource: rowIndex,
                                        isHeaderAction: false,
                                        customComponent: null,
                                    })
                                );
                            }
                            if (isCriticalForNextActions) {
                                shouldChainBreak = true;
                            }
                            let failActionsList = [...onFailActions];
                            if (onFailActionsResolver) {
                                const nextActions = onFailActionsResolver({
                                    selectedRows,
                                    errorData,
                                });
                                failActionsList = [...failActionsList, ...nextActions];
                            }

                            store.dispatch(
                                buttonAction({
                                    ...baseNextActionData,
                                    actionButtons: failActionsList,
                                })
                            );
                        },
                        errorHandler: fetchErrorHandler,
                    });

                    if (hasModalPendingState) {
                        store.dispatch(setModalPendingState(true));
                    }
                    await headerFetchAction
                        .cast(store, {
                            body: formattedRequestBody,
                            params: queryParams,
                        })
                        .catch()
                        .finally(() => store.dispatch(setModalPendingState(false)));

                    if (shouldChainBreak) {
                        break;
                    }
                }

                if (action.type === ActionsEnum.DOWNLOAD_FILE) {
                    const {
                        requestOption: { fileNameResolver, isNativeFileFetcher },
                    } = action as DownloadFileAction<any>;
                    if (uniqueId !== undefined && !isNativeFileFetcher) {
                        store.dispatch(setButtonPendingStateAction({ id: uniqueId, value: true }));
                    }

                    if (!isNativeFileFetcher) {
                        fetch(href)
                            .then((response) => {
                                if (response.ok) {
                                    response.blob().then((fileData) => {
                                        let fileName = fileNameResolver ? fileNameResolver({ selectedRows }) : '';
                                        const header = response.headers.get('Content-Disposition');

                                        if (header && !fileNameResolver) {
                                            const parts = header.split(';');
                                            const [_, newFileName] = parts[1].split('=')[1];
                                            fileName = newFileName;
                                        }

                                        const fileAnchor = document.createElement('a');
                                        fileAnchor.href = window.URL.createObjectURL(fileData);
                                        fileAnchor.download = `${fileName}`;
                                        fileAnchor.click();
                                        fileAnchor.remove();
                                    });
                                } else {
                                    throw Error(JSON.stringify(response.body));
                                }
                            })
                            .catch((error) => fetchErrorHandler?.processingError?.(error, store))
                            .finally(() => {
                                if (uniqueId !== undefined) {
                                    store.dispatch(setButtonPendingStateAction({ id: uniqueId, value: false }));
                                }
                            });
                    }
                }

                if (action.type === ActionsEnum.REDIRECT && tableConfig && redirectCallback) {
                    redirectCallback({
                        redirectAction: action as RedirectAction<any>,
                        tableData,
                        rowIndex,
                        selectedRows,
                        formattedForm,
                        actionsChainState,
                    });
                }

                if (action.type === ActionsEnum.OPEN_MODAL) {
                    let customComponent = null;
                    const closeModal = () =>
                        store.dispatch(
                            modalState.set({
                                modalData: null,
                                isOpen: false,
                                rowIndexSource: rowIndex,
                                isHeaderAction: false,
                                customComponent: null,
                            })
                        );
                    if ((action as ModalAction<any>)?.modalContent?.type === ModalContentTypesEnum.CUSTOM_CONTENT) {
                        const modalContent = (action as ModalAction<any>).modalContent as CustomContent<any>;
                        const CustomComponent = modalContent.component;
                        customComponent = (
                            <CustomComponent
                                closeModal={closeModal}
                                getData={getData}
                                selectedRowsData={selectedRows}
                                responsesData={actionsChainState}
                            />
                        );
                    }
                    store.dispatch(
                        modalState.set({
                            modalData: action as ModalAction<any>,
                            isOpen: true,
                            rowIndexSource: rowIndex,
                            isHeaderAction,
                            customComponent,
                        })
                    );
                }

                if (action.type === ActionsEnum.CLOSE_MODAL) {
                    store.dispatch(
                        modalState.set({
                            modalData: null,
                            isOpen: false,
                            rowIndexSource: rowIndex,
                            isHeaderAction: false,
                            customComponent: null,
                        })
                    );
                }

                if (action.type === ActionsEnum.REFRESH_TABLE) {
                    getData(true);
                }

                if (action.type === ActionsEnum.OPEN_FIRST_PAGE) {
                    store.dispatch(setOffset(0));
                }

                if (action.type === ActionsEnum.START_EDIT) {
                    store.dispatch(setEditModeAction(true));
                }

                if (action.type === ActionsEnum.CANCEL_EDIT) {
                    const savedTableData = store.getState(data.atom);
                    store.dispatch(setEditModeAction(false));
                    store.dispatch(setDataDraftAction(savedTableData));
                }

                if (action.type === ActionsEnum.EXPORT_TABLE) {
                    const { exportParams } = action as ExportTableAction;
                    import('./exportDataModule').then(({ default: exportDataInExcel }) =>
                        exportDataInExcel({
                            tableTitle: tableConfig?.title || tableConfig?.tableId || 'tableExport',
                            tableData,
                            columns: (tableConfig?.columns || []) as ColumnConfig<Content, string>[],
                            dictionaries,
                            tankerKeyset,
                            exportParams,
                        })
                    );
                }

                if (notification && successNotificationHandler) {
                    successNotificationHandler(notification, store);
                }
            }
        }
    );

    const cellInputAction = declareAction<ColumnInputPayload>(
        `${tableConfig?.tableId}.tableData.columnMultiSelectAction`,
        async (
            {
                value,
                rowId,
                columnId,
                nextActions,
                refreshTableDataAfterRequest,
                refreshTableDataOnFail,
                requestOptions,
            },
            store
        ) => {
            if (!requestOptions) {
                return;
            }
            const {
                bodyParamsFromPreviousStep,
                bodyParamsFromRowData,
                externalBodyParams,
                externalPathParams,
                externalQueryParams,
                method,
                mock,
                pathParamsFromPreviousStep,
                pathParamsFromRowData,
                queryParamsFromPreviousStep,
                queryParamsFromRowData,
                url: path,
                pathResolver,
                onDoneActions = [],
                onFailActions = [],
                onDoneActionsResolver,
                onFailActionsResolver,
                bodyResolver,
            } = requestOptions;
            const actionsChainState: Record<string | number, string> = {};
            const tableData = store.getState(data.atom);
            const tableEditDraft = store.getState(tableDataDraftAtom);
            const dataFromRow = tableData[rowId];
            const formattedRowData = {
                ...dataFromRow,
                [columnId]: value,
            };
            const rowData = castArray(formattedRowData);

            const queryParams = getQueryParams({
                externalQueryParams,
                queryParamsFromPreviousStep,
                queryParamsFromRowData,
                actionsChainState,
                rowData,
            });

            const formattedRequestBody = getBody({
                externalBodyParams,
                bodyParamsFromPreviousStep,
                bodyParamsFromRowData,
                actionsChainState,
                rowData,
                tableEditDraft,
                bodyResolver,
            });

            const formattedPath = getFormattedPath({
                externalPathParams,
                pathParamsFromPreviousStep,
                pathParamsFromRowData,
                rowData,
                path,
                actionsChainState,
                pathResolver,
            });

            const realNextAction = refreshTableDataAfterRequest
                ? [
                      {
                          type: ActionsEnum.REFRESH_TABLE,
                      },
                      ...nextActions,
                  ]
                : nextActions;
            const selectActionApi = apiGenerator({ path: formattedPath, type: method, mock, client, isMock });
            const multiSelectFetchAction = declareActionFetch(selectActionApi, {
                onDone: (response) => {
                    let successActionsList = [...onDoneActions];

                    if (onDoneActionsResolver) {
                        const nextSuccessActions = onDoneActionsResolver({
                            selectedRows: rowData,
                            response,
                        });
                        successActionsList = [...successActionsList, ...nextSuccessActions];
                    }

                    store.dispatch(
                        buttonAction({
                            actionButtons: [...realNextAction, ...successActionsList],
                            rowIndex: rowId,
                        })
                    );
                },
                onFail: (errorData) => {
                    let failActionsList = [...onFailActions];
                    if (onFailActionsResolver) {
                        const failedNextActions = onFailActionsResolver({
                            selectedRows: rowData,
                            errorData,
                        });
                        failActionsList = [...failedNextActions, ...failActionsList];
                    }

                    if (failActionsList.length) {
                        store.dispatch(
                            buttonAction({
                                actionButtons: failActionsList,
                                rowIndex: rowId,
                            })
                        );
                    }
                    if (refreshTableDataOnFail) {
                        getData();
                    }
                },
                errorHandler: fetchErrorHandler,
            });
            store.dispatch(setInlineInputLoadingAction(true));
            multiSelectFetchAction
                .cast(store, {
                    body: formattedRequestBody,
                    params: queryParams,
                })
                .catch()
                .finally(() => store.dispatch(setInlineInputLoadingAction(false)));
        }
    );

    return {
        buttonAction,
        cellInputAction,
        setRowCheckbox,
        headerCheckboxValue,
        setHeaderCheckbox,
        checkboxesData,
        setCheckboxesGroup,
        isModalPendingAtom,
        setModalPendingState,
        editModeAtom,
        setEditModeAction,
        tableDataDraftAtom,
        setFieldDataAfterEdit,
        buttonsPendingStateAtom,
    };
};
