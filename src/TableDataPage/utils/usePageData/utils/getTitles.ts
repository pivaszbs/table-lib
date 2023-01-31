import i18n from '@yandex-int/i18n';
import { ReactNode } from 'react';
import { CheckboxStateType, DataSettings, TableDataAddFilterParams } from '../../../entities/types';
import { ColumnConfig, ColumnsMeta, ColumnTypesEnum, MultipleTankerKeyset, TableDictionary } from '../../../types';
import { titleFactory } from '../../titleFactory';
import { OnChangeFilterParams } from '../../titleFactory/types';

interface SortPayload {
    order: string;
    sort: string;
}

interface Params {
    addFilter: (filters: TableDataAddFilterParams) => void;
    changeSort: (sortData: SortPayload) => void;
    tableSettings: DataSettings;
    filtersMapper: Record<string, string>;
    visibleColumns: Record<string, boolean> | null;
    handleRemoveFilter: (filterId: string) => void;
    columns: ColumnConfig[];
    setHeaderCheckboxValue: (value: CheckboxStateType) => void;
    headerCheckboxState: CheckboxStateType;
    loading: boolean;
    dictionaries: TableDictionary;
    tankerKeyset: MultipleTankerKeyset;
}

export const getTitles = ({
    addFilter,
    changeSort,
    tableSettings,
    filtersMapper,
    handleRemoveFilter,
    columns,
    setHeaderCheckboxValue,
    headerCheckboxState,
    loading,
    dictionaries,
    visibleColumns,
    tankerKeyset,
}: Params) =>
    columns.reduce<{
        titles: ReactNode[];
        columnsMeta: ColumnsMeta;
    }>(
        (
            prevValue,
            {
                title: columnTitle,
                type,
                id,
                options,
                optionsDictionaryName,
                maxWidth,
                minWidth,
                tankerKeysetName,
                tooltipText,
                hasSingleDateOption,
                multiListSeparator,
                isMultilineText = false,
                hasEllipsis = false,
                hasFilter = true,
                hasSort = true,
                withoutHeaderCheckbox,
                filterE2e,
                withSpaceTrimmer,
                autoLikeFilterStyle,
            }
        ) => {
            if (visibleColumns && !visibleColumns[id]) {
                return prevValue;
            }

            const nextColumnsMeta = [...prevValue.columnsMeta, { maxWidth, isMultilineText, hasEllipsis, type, id }];

            const hasTankerKeyset = Boolean(tankerKeysetName && tankerKeyset[tankerKeysetName]);
            const columnKeyset = tankerKeysetName ? tankerKeyset[tankerKeysetName] : {};
            const i18N = i18n(columnKeyset);

            const nextTitle = titleFactory({
                title: columnTitle,
                type: type === ColumnTypesEnum.ACTIONS ? null : type,
                order: tableSettings.sort === id ? tableSettings.order : '',
                onChange: (value: OnChangeFilterParams) => addFilter({ name: id, value }),
                onOrderChange: (order: string) => changeSort({ sort: id, order }),
                onFilterRemove: handleRemoveFilter,
                id,
                initialValues: filtersMapper,
                onCheckboxChange: setHeaderCheckboxValue,
                checkBoxState: headerCheckboxState,
                options: optionsDictionaryName
                    ? { selectOptions: dictionaries[optionsDictionaryName] }
                    : { selectOptions: options || [] },
                isLoading: loading,
                maxWidth,
                minWidth,
                i18N,
                hasTankerTranslate: hasTankerKeyset,
                tooltipText,
                hasSingleDateOption,
                hasFilter,
                hasSort,
                multiListSeparator,
                filterE2e,
                withoutHeaderCheckbox,
                withSpaceTrimmer,
                autoLikeFilterStyle,
            });

            const updatedTitles = [...prevValue.titles, nextTitle];

            return {
                titles: updatedTitles,
                columnsMeta: nextColumnsMeta,
            };
        },
        { titles: [], columnsMeta: [] }
    );
