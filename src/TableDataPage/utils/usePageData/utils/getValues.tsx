/* eslint-disable max-lines */
import i18n from '@yandex-int/i18n';
import { Box, Checkbox, Link, Switch, Text } from '@yandex-levitan/b2b';
import castArray from 'lodash/castArray';
import React, { MouseEvent, ReactNode } from 'react';
import DangerousHtml from '../../../components/DangerousHtml';
import { SelectorItem } from '../../../components/DynamicSelect/types';
import CellTextField from '../../../components/CellTextField';
import DebouncedMultiSelect from '../../../components/DebouncedMultiSelect';
import TableButton from '../../../components/TableButton';
import { SUBSTR_TO_REPLACE } from '../../../entities/constants';
import {
    ColumnInputPayload,
    TableQueryParamsEnum,
    TableSortOrder,
    UpdateFieldDataPayload,
} from '../../../entities/types';
import styles from '../../../style.pcss';
import {
    ActionButton,
    ButtonAction,
    ColumnConfig,
    ColumnDataTypesEnum,
    ColumnTypesEnum,
    Content,
    MultipleTankerKeyset,
    TableDictionary,
    TextStylesResolver,
} from '../../../types';
import { getCellText, getFormattedDate, updateFilterString } from '../../../entities/utils';

interface Params {
    refreshTable: () => void;
    columns: ColumnConfig[];
    dictionaries: TableDictionary;
    dataList: Content[];
    checkboxesValues: boolean[];
    commonRowActions: ActionButton[];
    visibleColumns: Record<string, boolean> | null;
    setRowCheckbox: (payload: { id: number; value: boolean }) => void;
    handleCellInputChange: (payload: ColumnInputPayload) => void;
    handleRowActionButtonClick: (actionButtonData: ButtonAction[], rowIndex: number) => void;
    tankerKeyset: MultipleTankerKeyset;
    linkRouterHandler?: (url: string) => void;
    filter?: string;
    order?: TableSortOrder;
    sort?: string;
    isEditMode: boolean;
    tableDataDraft: Content[];
    handleTableEdit: (payload: UpdateFieldDataPayload) => void;
    hasEditMode: boolean;
    buttonsPendingState: Record<string, boolean>;
}

interface GetCellComponentParams {
    text: string[];
    hasTankerTranslate: boolean;
    textStylesResolver?: TextStylesResolver;
    i18N: (param: string) => string;
    dictionary?: TableDictionary[''];
}

const getCellComponent = ({
    text,
    textStylesResolver,
    hasTankerTranslate,
    dictionary,
    i18N,
}: GetCellComponentParams) => {
    const textStyles = textStylesResolver?.(text[0]) || {};
    const formattedText = getCellText({
        hasTankerTranslate,
        i18N,
        text,
        dictionary,
    });
    if (hasTankerTranslate) {
        return (
            <Text style={{ display: 'inline' }} size="s" {...textStyles}>
                <DangerousHtml html={formattedText} />
            </Text>
        );
    }
    return (
        <Text style={{ display: 'inline' }} size="s" {...textStyles}>
            {formattedText}
        </Text>
    );
};

export const getValues = ({
    columns,
    dictionaries,
    dataList,
    checkboxesValues,
    setRowCheckbox,
    commonRowActions,
    handleRowActionButtonClick,
    handleCellInputChange,
    tankerKeyset,
    visibleColumns,
    refreshTable,
    linkRouterHandler,
    filter,
    sort,
    order,
    isEditMode,
    tableDataDraft,
    handleTableEdit,
    hasEditMode,
    buttonsPendingState,
}: Params) =>
    castArray(dataList).map((row, rowIndex) =>
        columns.reduce<ReactNode[]>(
            (
                prevValue,
                {
                    id,
                    type,
                    columnDataType: staticColumnDataType,
                    columnDataTypeResolver,
                    customCell: CustomCell,
                    tankerKeysetName,
                    valuesToHide = [undefined, null],
                    dictionaryPath,
                    columnActionsForCustomCell = [],
                    textStylesResolver,
                    columnValueResolver,
                    hiddenValuesFiller = '',
                    isDisabledResolver: globalDisableResolver,
                }
            ) => {
                const columnDataType = columnDataTypeResolver
                    ? columnDataTypeResolver({ rowData: row })
                    : staticColumnDataType;
                const isEditModeEnabled = (hasEditMode && isEditMode) || !hasEditMode;
                const isValueInDraftExist =
                    tableDataDraft[rowIndex] &&
                    tableDataDraft[rowIndex][id] !== null &&
                    tableDataDraft[rowIndex][id] !== undefined;
                const hasTankerKeyset = Boolean(tankerKeysetName && tankerKeyset[tankerKeysetName]);
                const columnKeyset = tankerKeysetName ? tankerKeyset[tankerKeysetName] : {};
                const i18N = i18n(columnKeyset);
                const selectedRowsData = [dataList[rowIndex]];
                const globalDisabled = globalDisableResolver !== undefined && globalDisableResolver({ rowData: row });

                if (visibleColumns && !visibleColumns[id]) {
                    return prevValue;
                }

                if (CustomCell) {
                    const customCellButtons = (
                        <>
                            {columnActionsForCustomCell.map((customCellAction, customCellButtonIndex) => {
                                return (
                                    <TableButton
                                        key={`customCellActionButton_${customCellButtonIndex}`}
                                        buttonData={customCellAction}
                                        rowIndex={rowIndex}
                                        index={customCellButtonIndex}
                                        onClick={handleRowActionButtonClick}
                                        size="s"
                                        selectedRowsData={selectedRowsData}
                                        filter={filter}
                                        sort={sort}
                                        order={order}
                                        position={`column_${id}`}
                                        buttonsPendingState={buttonsPendingState}
                                    />
                                );
                            })}
                        </>
                    );

                    return [
                        ...prevValue,
                        <CustomCell
                            key={`cell_${id}`}
                            rowData={row}
                            refreshTable={refreshTable}
                            actionButtons={customCellButtons}
                        />,
                    ];
                }

                if (type === ColumnTypesEnum.CHECKBOX) {
                    const checkboxValue = Boolean(checkboxesValues[rowIndex]);
                    return [
                        ...prevValue,
                        // @ts-ignore
                        <Checkbox
                            key={`customCell_${id}`}
                            checked={checkboxValue}
                            onChange={(newValue: boolean) =>
                                setRowCheckbox({
                                    id: rowIndex,
                                    value: newValue,
                                })
                            }
                            disabled={globalDisabled}
                            data-e2e={`${id}_checkbox_${rowIndex}`}
                        />,
                    ];
                }

                if (type === ColumnTypesEnum.ACTIONS) {
                    const actionButtons = commonRowActions.map((rowAction, buttonIndex) => {
                        return (
                            <TableButton
                                key={`button_${buttonIndex}`}
                                buttonData={rowAction}
                                rowIndex={rowIndex}
                                index={buttonIndex}
                                onClick={handleRowActionButtonClick}
                                size="s"
                                selectedRowsData={selectedRowsData}
                                filter={filter}
                                sort={sort}
                                order={order}
                                position={`column_${id}`}
                                buttonsPendingState={buttonsPendingState}
                            />
                        );
                    });
                    return [
                        ...prevValue,
                        <Box key={`actionButtons_${id}`} direction="row">
                            {actionButtons}
                        </Box>,
                    ];
                }

                if (columnDataType?.type === ColumnDataTypesEnum.URL) {
                    const {
                        externalQueryParams,
                        rowQueryParams = [],
                        path: rawPath,
                        queryParamsMapper,
                        pathParamsFromRowData = [],
                        openInNewTab = false,
                        nativeTransitionWithRefresh = false,
                        inTimeLinkResolver,
                        cellRedirectHandler,
                    } = columnDataType;
                    let queryParams = externalQueryParams || {};
                    const templates = rawPath.match(SUBSTR_TO_REPLACE);
                    let path = rawPath;
                    if (templates) {
                        for (const template of templates) {
                            const dataKey = template.substr(1);
                            const hasKeyInRows = pathParamsFromRowData.find((rowParam) => rowParam === dataKey);
                            if (hasKeyInRows) {
                                path = path.replace(template, row[dataKey] as string);
                            }
                        }
                    }
                    const filterString = rowQueryParams.reduce((prevFilterString, param) => {
                        const newFilterString = updateFilterString({
                            oldFilterValue: prevFilterString,
                            newFilter: {
                                name: queryParamsMapper ? (queryParamsMapper[param] as string) : param,
                                value: String(row[param]),
                            },
                        });
                        return newFilterString;
                    }, '');
                    if (filterString) {
                        queryParams = { ...queryParams, [TableQueryParamsEnum.FILTER]: filterString };
                    }
                    const queryString = new URLSearchParams(queryParams).toString();
                    const hrefFromParams = queryString ? `${path}?${queryString}` : path;
                    const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
                        if (!nativeTransitionWithRefresh && !openInNewTab) {
                            let href = hrefFromParams;
                            if (inTimeLinkResolver) {
                                href = inTimeLinkResolver({ rowData: row });
                            }
                            event.preventDefault();
                            if (cellRedirectHandler) {
                                cellRedirectHandler(href);
                            } else if (linkRouterHandler) {
                                linkRouterHandler(href);
                            }
                        }
                    };
                    const formattedValue = columnValueResolver ? columnValueResolver(row[id]) : row[id] || '';
                    return [
                        ...prevValue,
                        <Link
                            className={styles['cell-link']}
                            key={`link_${id}`}
                            href={hrefFromParams}
                            // @ts-ignore
                            onClick={onClick}
                            data-e2e={`${id}_row_link_select`}
                            target={openInNewTab ? '_blank' : '_self'}
                            as="a"
                        >
                            {formattedValue}
                        </Link>,
                    ];
                }

                if (columnDataType?.type === ColumnDataTypesEnum.DATE) {
                    const { template } = columnDataType;
                    const cellDateValue = getFormattedDate({
                        template,
                        value: row[id],
                    });
                    return row[id]
                        ? [
                              ...prevValue,
                              getCellComponent({
                                  text: [cellDateValue],
                                  hasTankerTranslate: false,
                                  i18N,
                              }),
                          ]
                        : [...prevValue, ''];
                }

                if (columnDataType?.type === ColumnDataTypesEnum.MULTI_SELECT && isEditModeEnabled) {
                    const {
                        requestOptions,
                        items,
                        dictionaryPath: multiDictionaryPath,
                        nextActions = [],
                        refreshTableDataAfterRequest = false,
                        refreshTableDataOnFail = false,
                        isDisabledResolver,
                        ...restParams
                    } = columnDataType;
                    const isDisabled =
                        globalDisabled || (isDisabledResolver !== undefined && isDisabledResolver({ rowData: row }));
                    let selectItems: SelectorItem[] = [];
                    if (items) {
                        selectItems = [...items];
                    } else if (multiDictionaryPath) {
                        selectItems = dictionaries[multiDictionaryPath] || [];
                    }
                    const handleSelectChange = (selectedValues: string | string[]) => {
                        if (hasEditMode) {
                            handleTableEdit({ fieldData: selectedValues, rowIndex, fieldName: id });
                        } else {
                            handleCellInputChange({
                                value: selectedValues,
                                requestOptions,
                                rowId: rowIndex,
                                columnId: id,
                                nextActions,
                                refreshTableDataAfterRequest,
                                refreshTableDataOnFail,
                            });
                        }
                    };
                    const selectValue = isValueInDraftExist ? tableDataDraft[rowIndex][id] : [];
                    return [
                        ...prevValue,
                        <DebouncedMultiSelect
                            key={`debounceMultiSelect_${id}`}
                            onChange={handleSelectChange}
                            value={selectValue as string[] | SelectorItem[]}
                            items={selectItems}
                            size="s"
                            dataE2e={`${id}_row_multi_select_${rowIndex}`}
                            hasTableEditMode={hasEditMode}
                            isDisabled={isDisabled}
                            {...restParams}
                        />,
                    ];
                }

                if (columnDataType?.type === ColumnDataTypesEnum.SINGLE_SELECT && isEditModeEnabled) {
                    const {
                        requestOptions,
                        items,
                        dictionaryPath: singleDictionaryPath,
                        nextActions = [],
                        refreshTableDataAfterRequest = false,
                        refreshTableDataOnFail = false,
                        isDisabledResolver,
                        ...restParams
                    } = columnDataType;
                    const isDisabled =
                        globalDisabled || (isDisabledResolver !== undefined && isDisabledResolver({ rowData: row }));
                    let selectItems: SelectorItem[] = [];
                    if (items) {
                        selectItems = [...items];
                    } else if (singleDictionaryPath) {
                        selectItems = dictionaries[singleDictionaryPath] || [];
                    }
                    const handleSelectChange = (selectedValue: string | string[]) => {
                        if (hasEditMode) {
                            handleTableEdit({
                                fieldData: selectedValue,
                                rowIndex,
                                fieldName: id,
                            });
                        } else {
                            handleCellInputChange({
                                value: selectedValue,
                                requestOptions,
                                rowId: rowIndex,
                                columnId: id,
                                nextActions,
                                refreshTableDataAfterRequest,
                                refreshTableDataOnFail,
                            });
                        }
                    };
                    const selectValue = isValueInDraftExist ? tableDataDraft[rowIndex][id] : [];
                    return [
                        ...prevValue,
                        <DebouncedMultiSelect
                            key={`debounceSingleSelect_${id}`}
                            onChange={handleSelectChange}
                            value={selectValue as string | SelectorItem[]}
                            items={selectItems}
                            size="s"
                            dataE2e={`${id}_row_multi_select_${rowIndex}`}
                            hasTableEditMode={hasEditMode}
                            isMulti={false}
                            isDisabled={isDisabled}
                            {...restParams}
                        />,
                    ];
                }

                if (columnDataType?.type === ColumnDataTypesEnum.TEXT_FIELD && isEditModeEnabled) {
                    const {
                        requestOptions,
                        nextActions = [],
                        refreshTableDataAfterRequest = false,
                        refreshTableDataOnFail = false,
                        inputType,
                        isDisabledResolver,
                    } = columnDataType;
                    const isDisabled =
                        globalDisabled || (isDisabledResolver !== undefined && isDisabledResolver({ rowData: row }));
                    const handleInputFinish = (textFieldValue: string) => {
                        handleCellInputChange({
                            value: textFieldValue,
                            requestOptions,
                            rowId: rowIndex,
                            columnId: id,
                            nextActions,
                            refreshTableDataAfterRequest,
                            refreshTableDataOnFail,
                        });
                    };
                    const textFieldValue = isValueInDraftExist ? `${tableDataDraft[rowIndex][id]}` : '';
                    const handleEdit = (fieldData: string) => handleTableEdit({ fieldData, rowIndex, fieldName: id });
                    return [
                        ...prevValue,
                        <CellTextField
                            key={`textField_${id}`}
                            isDisabled={isDisabled}
                            onInputFinish={handleInputFinish}
                            onChange={handleEdit}
                            initialValue={textFieldValue}
                            data-e2e={`${id}_text_field_${rowIndex}`}
                            hasTableEditMode={hasEditMode}
                            inputType={inputType}
                        />,
                    ];
                }

                if (columnDataType?.type === ColumnDataTypesEnum.SWITCHER) {
                    const {
                        requestOptions,
                        nextActions = [],
                        refreshTableDataAfterRequest = false,
                        refreshTableDataOnFail = false,
                        isDisabledResolver,
                    } = columnDataType;
                    const isDisabled =
                        globalDisabled || (isDisabledResolver !== undefined && isDisabledResolver({ rowData: row }));
                    const isActive = Boolean(row[id]);
                    const handleChange = (value: boolean) =>
                        handleCellInputChange({
                            value,
                            requestOptions,
                            rowId: rowIndex,
                            columnId: id,
                            nextActions,
                            refreshTableDataAfterRequest,
                            refreshTableDataOnFail,
                        });
                    return [
                        ...prevValue,
                        <Switch
                            disabled={isDisabled}
                            key={`switcher_${id}`}
                            checked={isActive}
                            // @ts-ignore
                            onChange={handleChange}
                            size="s"
                            data-e2e={`${id}_switch_${rowIndex}`}
                        />,
                    ];
                }

                const cellValue = valuesToHide.includes(row[id]) ? hiddenValuesFiller : row[id];
                const formattedValue = columnValueResolver ? columnValueResolver(cellValue) : cellValue;
                const cellComponent = getCellComponent({
                    text: Array.isArray(formattedValue) ? formattedValue.map(String) : [String(formattedValue)],
                    hasTankerTranslate: hasTankerKeyset,
                    textStylesResolver,
                    i18N,
                    dictionary: dictionaries[dictionaryPath || ''],
                });
                return [...prevValue, cellComponent];
            },
            []
        )
    );
