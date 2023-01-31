import { FocusEvent, MouseEvent } from 'react';
import { TextSizes } from '@yandex-levitan/b2b';

export enum SelectTypeEnum {
    SIMPLE = 'simple',
    MULTI = 'multi',
}

export interface SelectorItem {
    label: string;
    value: string;
}

export type DynamicSelectSize = 's' | 'm' | 'l';

export interface BaseSelectProps {
    items: SelectorItem[];
    dataE2e?: string;
    inputValue?: string;
    inputWidth?: number | 'full';
    disabled?: boolean;
    hasSearch?: boolean;
    hasSubmitButton?: boolean;
    hasSelectAll?: boolean;
    hasSelfFilter?: boolean;
    hasSelfStoreInput?: boolean;
    hasCompactMultiInput?: boolean;
    hasIgnoreValidationOnEnter?: boolean;
    submitButtonTitle?: string;
    isLoading?: boolean;
    isTopOpening?: boolean;
    hasResetButton?: boolean;
    withoutArrowButton?: boolean;
    hasAlphabeticalItemsSort?: boolean;
    dropdownClassName?: string;
    inputClassName?: string;
    placeholder?: string;
    size?: DynamicSelectSize;
    optionSize?: TextSizes;
    searchInputModifier?: (newValue: string, lastValue: string) => string;
    textInputEnterSubmitModifier?: (value: string) => string;
    onInputChange?: (value: string) => void;
    onChange?: (value: SelectorItem | null) => void;
    onMultiInputChange?: (value: SelectorItem[]) => void;
    onBlur?: (event: FocusEvent) => void;
    onClick?: (event: MouseEvent) => void;
}

export interface SimpleSelectProps extends BaseSelectProps {
    value: SelectorItem | null;
    selectType?: SelectTypeEnum.SIMPLE;
}

export interface MultiSelectProps extends BaseSelectProps {
    value: SelectorItem[];
    selectType?: SelectTypeEnum.MULTI;
}
