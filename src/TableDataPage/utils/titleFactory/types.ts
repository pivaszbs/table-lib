import { B2bIcon } from '@yandex-levitan/b2b';
import { FormData } from '../../components/RangeDateForm/types';
import { CheckboxStateType } from '../../entities/types';
import { ColumnType } from '../../types';

export type OnChangeFilterParams = string | FormData | string[];

export interface Option {
    value: string;
    label: string;
}

export interface Options {
    selectOptions?: Option[] | string[];
}

export const orderIcon: Record<string, B2bIcon> = {
    DESC: 'arrowDown',
    ASC: 'arrowUp',
};

export interface TitleProps {
    title: string;
    type?: ColumnType;
    order?: string | null;
    onChange?: (value: OnChangeFilterParams) => void;
    onOrderChange?: (value: string) => void;
    onFilterRemove?: (filterId: string) => void;
    onCheckboxChange?: (value: boolean) => void;
    options?: Options;
    id?: null | string;
    initialValues?: Record<string, string>;
    checkBoxState?: CheckboxStateType;
    isLoading?: boolean;
    hasFilter?: boolean;
    hasSort?: boolean;
    maxWidth?: number | string;
    minWidth?: number | string;
    i18N?: (param: string) => string;
    hasTankerTranslate?: boolean;
    hasSingleDateOption?: boolean;
    tooltipText?: string;
    multiListSeparator?: string;
    filterE2e?: string;
    withoutHeaderCheckbox?: boolean;
    withSpaceTrimmer?: boolean;
    autoLikeFilterStyle?: boolean;
}

export interface TextValueFormatterParams {
    autoLikeFilterStyle: boolean;
    withSpaceTrimmer: boolean;
    value: string;
}
