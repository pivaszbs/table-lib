import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import DynamicSelect from '../DynamicSelect';
import { BaseSelectProps, SelectorItem, SelectTypeEnum } from '../DynamicSelect/types';

type Props = {
    value: string[] | string | SelectorItem[];
    items: SelectorItem[];
    onChange: (value: string | string[]) => void;
    debounceTime?: number;
    isMulti?: boolean;
    isDisabled?: boolean;
    hasTableEditMode?: boolean;
} & Omit<BaseSelectProps, 'value' | 'items' | 'onChange'>;

const DebouncedMultiSelect = ({
    value,
    onChange,
    debounceTime = 1000,
    items,
    hasTableEditMode = false,
    isMulti = true,
    isDisabled = false,
    ...restProps
}: Props) => {
    const [selectValue, setValue] = useState<SelectorItem[]>([]);
    const debouncedOnChange = useCallback(debounce(onChange, debounceTime), [onChange]);
    const handleMultiChange = useCallback(
        (
            selectedItems: {
                label: string;
                value: string;
            }[]
        ) => {
            const updatedValue = selectedItems.map(({ value: valueSelect }) => valueSelect);
            if (hasTableEditMode) {
                onChange(updatedValue);
            } else {
                setValue(selectedItems);
                debouncedOnChange(updatedValue);
            }
        },
        [setValue, debouncedOnChange, hasTableEditMode]
    );
    const handleSingleChange = useCallback(
        (selectedItem: { label: string; value: string } | null) => {
            const updatedValue = (selectedItem && selectedItem.value) || '';
            if (hasTableEditMode) {
                onChange(updatedValue);
            } else {
                setValue((selectedItem && [selectedItem]) || []);
                onChange(updatedValue);
            }
        },
        [debouncedOnChange, hasTableEditMode, onChange]
    );

    const formattedValue = useMemo(() => {
        if (!value) {
            return [];
        }

        if (!value.length) {
            return value as SelectorItem[];
        }
        if (typeof value[0] === 'string') {
            if (isMulti) {
                return (value as string[]).map((valueItem) => ({
                    label: valueItem,
                    value: valueItem,
                }));
            }
            const simpleSelectValue = items.find(({ value: itemsValue }) => itemsValue === value);
            return simpleSelectValue ? [simpleSelectValue] : [{ label: value as string, value: value as string }];
        }

        return value as SelectorItem[];
    }, [value, items]);
    useEffect(() => setValue(formattedValue), [formattedValue]);

    return isMulti ? (
        <DynamicSelect
            value={selectValue}
            selectType={SelectTypeEnum.MULTI}
            items={items}
            onMultiInputChange={handleMultiChange}
            disabled={isDisabled}
            {...restProps}
        />
    ) : (
        <DynamicSelect
            value={selectValue[0]}
            selectType={SelectTypeEnum.SIMPLE}
            items={items}
            onChange={handleSingleChange}
            disabled={isDisabled}
            {...restProps}
        />
    );
};

export default memo(DebouncedMultiSelect);
