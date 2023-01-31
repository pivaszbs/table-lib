import { format, parse } from 'date-fns';
import { FieldType } from '../utils/api/getReportFormData/types';
import { DateTimeValue } from '../components/DateTimeField';
import { SelectorItem } from '../components/DynamicSelect/types';
import { FormData } from '../components/RangeDateForm/types';
import { EMPTY_FILTER_SEPARATOR, SUBSTR_TO_REPLACE } from './constants';

import {
    BodyParams,
    FormMetaData,
    PathParams,
    QueryParams,
    RemoveFilterParams,
    TableDataAddFilterParams,
    UpdateFilterStringParams,
    TableQueryParamsEnum,
    GetCellTextParams,
} from './types';
import { GetDateStringParams } from '.';
import { dateSafariPolifill } from '../utils';

export type InitialDataType = Record<string, string | SelectorItem[] | SelectorItem | DateTimeValue | null>;
export interface FieldMetaData {
    caption: string;
    fieldType: FieldType;
}

export const getFormattedDateString = (rowDataString: string) => rowDataString.replace(/'/gi, '').split(' ');

export const getFormattedDateFilterValue = (value: FormData, name: string) => {
    const { from = '', to = '' } = value as FormData;
    return { name, value: { from, to } };
};

export const getFormattedUrl = (url: string, rowData: Record<string, any>) => {
    let formattedUrl = url;
    const templates = formattedUrl.match(SUBSTR_TO_REPLACE);
    if (templates) {
        for (const template of templates) {
            const dataKey = template.substr(1);
            formattedUrl = formattedUrl.replace(template, rowData[dataKey]);
        }
    }

    return formattedUrl;
};

export const getBodyItem = (bodyFields: string[], rowData: Record<string, any>) => {
    return bodyFields.reduce(
        (prevValue, id) => ({
            ...prevValue,
            [id]: rowData[id],
        }),
        {}
    );
};

export const getFormattedBody = (bodyFields: string[], rowsData: Record<string, any>[]) => {
    return bodyFields.length ? rowsData.map((rowData) => getBodyItem(bodyFields, rowData)) : [];
};

export const getMultiSelectQueryParams = (values: string[]) => {
    return values.reduce(
        (prevValue, selectValue) => (prevValue ? `${prevValue},${selectValue}` : `${selectValue}`),
        ''
    );
};

export const getBody = ({
    externalBodyParams = {},
    bodyParamsFromPreviousStep,
    bodyParamsFromRowData,
    bodyParamsFromForm = [],
    actionsChainState,
    formData = {},
    rowData,
    bodyResolver,
    tableEditDraft,
}: BodyParams) => {
    if (bodyResolver) {
        return bodyResolver({
            actionsChainState,
            bodyParamsFromRowData: bodyParamsFromRowData || [],
            formData,
            rowData,
            tableEditDraft,
        });
    }
    const formFields = bodyParamsFromForm.reduce((prevValue, bodyParam) => {
        if (bodyParam in formData && formData[bodyParam] !== null && formData[bodyParam] !== undefined) {
            return {
                ...prevValue,
                [bodyParam]: formData[bodyParam],
            };
        }

        return prevValue;
    }, {});
    let body = { ...externalBodyParams, ...formFields };
    body = bodyParamsFromPreviousStep
        ? bodyParamsFromPreviousStep.reduce(
              (prevValue, bodyParam) => ({
                  ...prevValue,
                  [bodyParam]: actionsChainState[bodyParam],
              }),
              body
          )
        : body;
    const bodyFromRow = getFormattedBody(bodyParamsFromRowData || [], rowData);
    body = {
        ...body,
        ...(bodyFromRow.length ? { content: bodyFromRow } : {}),
    };

    return body;
};

export const getQueryParams = ({
    externalQueryParams = {},
    queryParamsFromPreviousStep,
    queryParamsFromRowData,
    queryParamsFromForm = [],
    actionsChainState,
    formData = {},
    rowData,
    queryParamsResolver,
    customFilter = {},
}: QueryParams) => {
    const formFields = queryParamsFromForm.reduce((prevValue, queryParam) => {
        if (queryParam in formData && formData[queryParam] !== null && formData[queryParam] !== undefined) {
            const value = formData[queryParam];
            return {
                ...prevValue,
                [queryParam]: Array.isArray(value) ? getMultiSelectQueryParams(value) : value,
            };
        }

        return prevValue;
    }, {});
    let queryParams = { ...externalQueryParams, ...formFields };
    queryParams = queryParamsFromPreviousStep
        ? queryParamsFromPreviousStep.reduce<Record<string, string>>(
              (prevValue, param) => ({
                  ...prevValue,
                  [param]: `${actionsChainState[param]}`,
              }),
              {}
          )
        : queryParams;
    const hasQueriesFromRowData = Boolean(
        rowData && rowData.length && queryParamsFromRowData && queryParamsFromRowData.length
    );

    queryParams = hasQueriesFromRowData
        ? (queryParamsFromRowData as string[]).reduce(
              (prevValue, param) => ({
                  ...prevValue,
                  [param]: rowData[0][param],
              }),
              queryParams
          )
        : queryParams;

    if (queryParamsResolver) {
        const resolvedQueryParams = queryParamsResolver({
            paramsFromPreviousStep: actionsChainState,
            selectedRows: rowData,
        });
        queryParams = {
            ...queryParams,
            ...resolvedQueryParams,
        };
    }

    return {
        ...queryParams,
        ...customFilter,
    };
};

export const getFormattedPath = ({
    pathParamsFromRowData = [],
    pathParamsFromPreviousStep = [],
    externalPathParams,
    actionsChainState = {},
    rowData = [],
    path,
    pathResolver,
}: PathParams) => {
    let formattedUrl = path;
    const templates = formattedUrl.match(SUBSTR_TO_REPLACE);
    if (templates && rowData.length) {
        for (const template of templates) {
            const dataKey = template.substr(1);
            const hasKeyInRows = pathParamsFromRowData.find((rowParam) => rowParam === dataKey);
            const hasKeyInPrevParams = pathParamsFromPreviousStep.find((prevStepParam) => prevStepParam === dataKey);
            if (hasKeyInRows) {
                formattedUrl = formattedUrl.replace(template, `${rowData[0][dataKey]}`);
            } else if (hasKeyInPrevParams) {
                formattedUrl = formattedUrl.replace(template, actionsChainState[dataKey]);
            } else if (externalPathParams && externalPathParams[dataKey]) {
                formattedUrl = formattedUrl.replace(template, externalPathParams[dataKey] as string);
            }
        }
    }

    if (pathResolver) {
        return pathResolver({
            pathParamsFromRowData,
            pathParamsFromPreviousStep,
            externalPathParams,
            actionsChainState,
            rowData,
            path,
            formattedUrl,
            pathResolver,
        });
    }

    return formattedUrl;
};

const DATE_TIME_PATTERN = 'yyyy-MM-dd,HH:mm';

const getFormattedListValue = (value: SelectorItem[] | SelectorItem | null): string[] | string => {
    if (Array.isArray(value)) {
        return value.map((item) => item.value);
    }
    if (value) {
        return value.value;
    }

    return [];
};

export const getFormattedFormData = (
    formData: InitialDataType,
    fieldMapper: Record<string, FieldMetaData>
): FormMetaData => {
    const formattedValues = Object.keys(formData).map((key) => {
        const { fieldType } = fieldMapper[key];
        const baseFieldData = {
            code: key,
            paramType: fieldType,
        };
        const fieldValue = formData[key];
        switch (fieldType) {
            case 'FLOAT':
            case 'INTEGER':
                return {
                    ...baseFieldData,
                    value: Number(fieldValue),
                };
            case 'DATE':
                return {
                    ...baseFieldData,
                    value: parse(fieldValue as string, 'yyyy-MM-dd', new Date()).toISOString(),
                };
            case 'TIME':
                return {
                    ...baseFieldData,
                    value: `${fieldValue}`,
                };
            case 'LOCAL_TIME':
                return {
                    ...baseFieldData,
                    value: `${fieldValue}`,
                };
            case 'LOCAL_DATE':
                return {
                    ...baseFieldData,
                    value: `${fieldValue}`,
                };
            case 'DATETIME': {
                const dateTimeValue = formData[key] as DateTimeValue;
                const stringifiedDateTime = `${dateTimeValue.date},${dateTimeValue.time}`;
                return {
                    ...baseFieldData,
                    value: parse(stringifiedDateTime, DATE_TIME_PATTERN, new Date()).toISOString(),
                };
            }
            case 'LOCAL_DATETIME': {
                const dateTimeValue = formData[key] as DateTimeValue;
                const stringifiedDateTime = `${dateTimeValue.date},${dateTimeValue.time}`;
                const dateValue = parse(stringifiedDateTime, DATE_TIME_PATTERN, new Date());
                return {
                    ...baseFieldData,
                    value: format(dateValue, 'yyyy-MM-dd_HH:mm:ss.000').replace('_', 'T'),
                };
            }
            case 'LIST':
            case 'MULTILIST':
                return {
                    ...baseFieldData,
                    value: getFormattedListValue(fieldValue as SelectorItem[] | SelectorItem | null),
                };
            default: {
                return {
                    ...baseFieldData,
                    value: `${fieldValue}`,
                };
            }
        }
    });

    return formattedValues;
};

export const createFilterValue = ({ value, name }: TableDataAddFilterParams) => {
    if (typeof value === 'string') {
        if (value) {
            const formattedValue = value === EMPTY_FILTER_SEPARATOR ? EMPTY_FILTER_SEPARATOR : `'${value}'`;
            return `${name}==${formattedValue}`;
        }

        return '';
    }

    if (Array.isArray(value)) {
        const filterSubstrings = value.map((listValue) => `${name}=='${listValue}'`);
        return value.length ? `(${filterSubstrings.join(',')})` : '';
    }

    if (!value.from && !value.to) {
        return '';
    }

    if (value.from && value.to) {
        const fromMode = value.isStrictFrom ? 'gt' : 'ge';
        const toMode = value.isStrictTo ? 'lt' : 'le';
        return `${name}=${fromMode}='${value.from}';${name}=${toMode}='${value.to}'`;
    }

    if (!value.from) {
        const toMode = value.isStrictTo ? 'lt' : 'le';
        return `${name}=${toMode}='${value.to}'`;
    }

    if (!value.to) {
        const fromMode = value.isStrictFrom ? 'gt' : 'ge';
        return `${name}=${fromMode}='${value.from}'`;
    }

    return '';
};

export const updateFilterString = ({
    oldFilterValue,
    newFilter,
    isFilterFormatted = false,
}: UpdateFilterStringParams) => {
    let newFilterString = oldFilterValue;
    const filterItem = newFilterString?.split(';').find((item) => item.includes(newFilter.name));
    if (filterItem !== undefined) {
        newFilterString = newFilterString
            ?.split(';')
            .filter((item) => !item.includes(newFilter.name))
            .join(';');
    }

    let { value } = newFilter;

    if (!isFilterFormatted) {
        value = createFilterValue(newFilter);
    }

    newFilterString = `${newFilterString ? `${newFilterString};` : ''}${value}`;

    if (newFilterString.endsWith(';')) {
        newFilterString = newFilterString.slice(0, newFilterString.length - 1);
    }

    return newFilterString;
};

export const getFiltersAfterRemoving = ({ filterName, filtersString }: RemoveFilterParams) => {
    if (!filtersString) {
        return filtersString;
    }

    const newFilterString = filtersString
        .split(';')
        .filter((f) => !f.includes(filterName))
        .join(';');

    return newFilterString;
};

export const replaceTableHistory = ({ searchParams }: { searchParams: URLSearchParams }) => {
    const { pathname } = document.location;

    const queryString = searchParams.toString();

    const url = queryString ? `${pathname}?${queryString}` : pathname;

    window.history.replaceState({}, '', url);
};

export const replaceTableParams = ({ name, value }: { name: TableQueryParamsEnum; value: string }) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.delete(name);
    newParams.append(name, String(value));

    replaceTableHistory({ searchParams: newParams });
};

export const getCellText = ({ text, hasTankerTranslate, i18N, dictionary = [] }: GetCellTextParams) => {
    if (hasTankerTranslate) {
        return text.map(i18N).join(', ');
    }

    return text
        .map((currentText) => dictionary.find(({ value }) => value === currentText)?.label || currentText)
        .join(', ');
};

export const getFormattedDate = ({ template, value }: GetDateStringParams) => {
    // Safari doesn't support 'dd.mm.yyyy hh:mm' only 'dd.mm.yyyyThh:mm'
    const formattedDateValue = value ? dateSafariPolifill(value as string) : value;
    const dateValue = new Date(formattedDateValue as string);
    const realTemplate = template || 'dd.MM.yyyy, HH:mm';

    return value && format(dateValue, realTemplate);
};
