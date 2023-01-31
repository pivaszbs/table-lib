import { MouseEvent, KeyboardEvent } from 'react';
import { TextSizes } from '@yandex-levitan/b2b';
import { SelectorItem } from '../../types';

export interface DropdownProps {
    dataE2e: string;
    selectedValues: SelectorItem[];
    items: SelectorItem[];
    inputValue: string;
    isMultiSelect: boolean;
    isTopOpening: boolean;
    hasSubmitButton: boolean;
    hasSearch: boolean;
    hasSelectAll: boolean;
    hasAlphabeticalItemsSort: boolean;
    placeholder: string;
    dropdownClassName: string;
    size: TextSizes;
    onItemSelect: (item: SelectorItem) => void;
    onItemExclude: (item: SelectorItem) => void;
    onGroupSelect: (value: boolean) => void;
    onInputClick: (event: MouseEvent) => void;
    onSubmitClick: (event: MouseEvent) => void;
    onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    onInputChange: (value: string) => void;
    onDropdownOpen: () => void;
}
