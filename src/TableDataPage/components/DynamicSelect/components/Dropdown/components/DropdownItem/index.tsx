import React, { memo, useCallback, useMemo, MouseEvent } from 'react';
import { Text, Checkbox, TextSizes } from '@yandex-levitan/b2b';
import classNames from 'classnames/bind';
import { SelectorItem } from '../../../../types';

import styles from './style.pcss';

const cn = classNames.bind(styles);
interface DropdownProps {
    isSelected: boolean | 'indeterminate';
    isMultiSelect: boolean;
    isSelectAll?: boolean;
    dataE2e: string;
    itemData?: SelectorItem;
    size: TextSizes;
    onItemSelect: (item: SelectorItem) => void;
    onItemExclude: (item: SelectorItem) => void;
    onGroupSelect: (value: boolean) => void;
}

const DropdownItem = ({
    isSelected,
    isMultiSelect,
    isSelectAll = false,
    dataE2e,
    itemData = { value: '', label: 'Выбрать всё' },
    onItemSelect,
    onItemExclude,
    onGroupSelect,
    size,
}: DropdownProps) => {
    const handleItemSelect = useCallback(
        (event: MouseEvent) => {
            event.stopPropagation();
            if (isSelectAll) {
                if (isSelected === 'indeterminate' || !isSelected) {
                    onGroupSelect(true);
                } else {
                    onGroupSelect(false);
                }

                return;
            }
            if (isSelected) {
                onItemExclude(itemData);
            } else {
                onItemSelect(itemData);
            }
        },
        [isSelected, itemData, onItemExclude, onItemSelect, onGroupSelect]
    );
    const label = useMemo(
        () => (
            <Text size={size} align="left">
                {itemData.label}
            </Text>
        ),
        [itemData]
    );

    const itemDataE2e = `${dataE2e}_${itemData.label}`;

    return (
        <div
            className={cn('option-wrapper', {
                'option-wrapper--selected': isSelected,
            })}
            role="button"
        >
            {isMultiSelect ? (
                <div onClick={handleItemSelect} role="button" className={cn('multi-input')} data-e2e={itemDataE2e}>
                    <Checkbox checked={isSelected} size="s" />
                    <span className={cn('label-wrapper')}>{label}</span>
                </div>
            ) : (
                <button type="button" className={cn('select-button')} onClick={handleItemSelect} data-e2e={itemDataE2e}>
                    {label}
                </button>
            )}
        </div>
    );
};

export default memo(DropdownItem);
