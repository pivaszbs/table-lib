import * as XLSX from 'xlsx';
import i18n from '@yandex-int/i18n';
import { castArray } from 'lodash';
import {
    ColumnConfig,
    ColumnDataTypesEnum,
    ColumnTypesEnum,
    Content,
    DataColumnTypes,
    ExportParams,
    MultipleTankerKeyset,
    ServiceColumnTypes,
    TableDictionary,
} from '../../types';
import { TableDataContentArray } from '../types';
import { getSelectLabels } from '../../../TableDataPage/components/DebouncedMultiSelect/utils';
import { getCellText, getFormattedDate } from '../utils';
import { SelectorItem } from '../../../TableDataPage/components/DynamicSelect/types';

type Params = {
    tableTitle: string;
    tableData: TableDataContentArray;
    columns: ColumnConfig<Content, string>[];
    tankerKeyset?: MultipleTankerKeyset;
    dictionaries?: TableDictionary;
    exportParams?: ExportParams;
};

const NOT_EXPORTABLE_TYPES: Array<ServiceColumnTypes | DataColumnTypes> = [
    ColumnTypesEnum.ACTIONS,
    ColumnTypesEnum.CHECKBOX,
];
const exportDataInExcel = ({
    tableTitle,
    tableData,
    columns,
    tankerKeyset = {},
    dictionaries = {},
    exportParams = {},
}: Params) => {
    const fileName = exportParams.fileName || tableTitle;
    const sheetName = exportParams.sheetName || '';
    const exportableColumns = columns.filter(
        ({ type, exportParams: params = {} }) => !NOT_EXPORTABLE_TYPES.includes(type) && !params.hideInExport
    );
    const header = exportableColumns.map(({ title }) => title);
    const rowsData = tableData.map((nextRow) =>
        exportableColumns.map(
            ({
                id,
                columnDataType,
                tankerKeysetName,
                dictionaryPath,
                columnValueResolver,
                exportParams: params = {},
                valuesToHide = [null, undefined],
                hiddenValuesFiller = '',
            }) => {
                const { notSaveUiFormatting, valueFormatter } = params;

                let value = nextRow[id];

                value = valuesToHide.includes(value) ? hiddenValuesFiller : value;

                if (valueFormatter) {
                    value = valueFormatter(value);
                } else if (columnValueResolver && !notSaveUiFormatting) {
                    value = columnValueResolver(value);
                }

                const hasTankerTranslate = Boolean(tankerKeysetName && tankerKeyset[tankerKeysetName]);
                const i18N = tankerKeysetName && hasTankerTranslate ? i18n(tankerKeyset[tankerKeysetName]) : i18n({});

                if (
                    (columnDataType?.type === ColumnDataTypesEnum.MULTI_SELECT ||
                        columnDataType?.type === ColumnDataTypesEnum.SINGLE_SELECT) &&
                    !valueFormatter
                ) {
                    let items: SelectorItem[] = columnDataType.items || [];
                    if (columnDataType.dictionaryPath && dictionaries[columnDataType.dictionaryPath]) {
                        items = dictionaries[columnDataType.dictionaryPath] as SelectorItem[];
                    }

                    if (!value) {
                        return '';
                    }

                    if (!value.length) {
                        return '';
                    }

                    value = castArray(value);

                    if (typeof value[0] === 'string') {
                        const values = items.filter(({ value: selectValue }) => value.includes(selectValue));
                        return getSelectLabels(values).join(',');
                    }
                    const values = items.filter(({ value: selectValue }) =>
                        (value as SelectorItem[]).find(({ value: selectedValue }) => selectedValue === selectValue)
                    );
                    return getSelectLabels(values).join(',');
                }

                if (columnDataType?.type === ColumnDataTypesEnum.DATE) {
                    const { template } = columnDataType;
                    return getFormattedDate({ value: nextRow[id], template });
                }

                return getCellText({
                    text: Array.isArray(value) ? [value.join(',')] : [String(value)],
                    hasTankerTranslate,
                    i18N,
                    dictionary: dictionaryPath && dictionaries[dictionaryPath] ? dictionaries[dictionaryPath] : [],
                });
            }
        )
    );
    const data = [header].concat(rowsData);

    const workSheet = XLSX.utils.aoa_to_sheet(data);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, workSheet, sheetName);
    XLSX.writeFileXLSX(newWorkbook, `${fileName}.xlsx`, { bookType: 'xlsx' });
};

export default exportDataInExcel;
