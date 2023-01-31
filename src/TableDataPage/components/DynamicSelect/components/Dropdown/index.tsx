/* eslint-disable max-lines */
import React, { memo, useMemo, ReactNode, useEffect } from 'react';
import classNames from 'classnames/bind';
import { Box, Button } from '@yandex-levitan/b2b';

import DropdownItem from './components/DropdownItem';
import { DropdownProps } from './types';
import styles from './style.pcss';
import TextField from '../../../LargeTextField';

const cn = classNames.bind(styles);

const Dropdown = ({
    selectedValues = [],
    items,
    inputValue,
    isMultiSelect,
    isTopOpening,
    hasSubmitButton,
    hasSearch,
    hasSelectAll,
    hasAlphabeticalItemsSort,
    dropdownClassName,
    dataE2e,
    size,
    placeholder,
    onItemSelect,
    onItemExclude,
    onGroupSelect,
    onInputClick,
    onSubmitClick,
    onInputChange,
    onInputKeyDown,
    onDropdownOpen,
}: DropdownProps) => {
    useEffect(() => onDropdownOpen(), []);

    const { selectedItems, restItems } = useMemo(() => {
        let dropdownItems = items;
        if (hasAlphabeticalItemsSort) {
            dropdownItems = dropdownItems.sort(({ label: labelA }, { label: labelB }) =>
                labelA.toLowerCase() < labelB.toLowerCase() ? -1 : 1
            );
        }
        return dropdownItems.reduce<{
            restItems: ReactNode[];
            selectedItems: ReactNode[];
        }>(
            (prevValue, item) => {
                const isSelected = selectedValues.some(({ value }) => value === item.value);
                const dropdownItem = (
                    <DropdownItem
                        key={item.value}
                        isSelected={isSelected}
                        isMultiSelect={isMultiSelect}
                        itemData={item}
                        onItemSelect={onItemSelect}
                        onItemExclude={onItemExclude}
                        onGroupSelect={onGroupSelect}
                        dataE2e={`${dataE2e}-selectAll`}
                        size={size}
                    />
                );
                if (isSelected) {
                    return {
                        ...prevValue,
                        selectedItems: [...prevValue.selectedItems, dropdownItem],
                    };
                }

                return {
                    ...prevValue,
                    restItems: [...prevValue.restItems, dropdownItem],
                };
            },
            {
                selectedItems: [],
                restItems: [],
            }
        );
    }, [items, onItemSelect, onItemExclude, isMultiSelect, selectedValues, dataE2e, size, hasAlphabeticalItemsSort]);
    const selectAllState: boolean | 'indeterminate' = useMemo(() => {
        if (selectedItems.length === items.length) {
            return true;
        }
        if (!selectedItems.length) {
            return false;
        }

        return 'indeterminate';
    }, [selectedItems, items]);

    return (
        <div
            className={cn(styles.dropdown, {
                [dropdownClassName]: Boolean(dropdownClassName),
                [styles['dropdown--top']]: isTopOpening,
            })}
        >
            {hasSearch && hasSubmitButton && (
                <Box borderBottom="1px solid #ccc">
                    {hasSubmitButton && (
                        <Box padding={1}>
                            <TextField
                                onKeyPress={onInputKeyDown}
                                hasLowerCase
                                value={inputValue}
                                placeholder={placeholder}
                                size={size}
                                onClick={onInputClick}
                                onChange={onInputChange}
                            />
                        </Box>
                    )}
                    {hasSelectAll && isMultiSelect && (
                        <DropdownItem
                            isSelected={selectAllState}
                            isSelectAll
                            isMultiSelect={isMultiSelect}
                            onItemSelect={onItemSelect}
                            onItemExclude={onItemExclude}
                            onGroupSelect={onGroupSelect}
                            dataE2e={dataE2e}
                            size={size}
                        />
                    )}
                </Box>
            )}
            <Box overflow="auto" maxHeight="200px" width="100%">
                {selectedItems}
                {restItems}
            </Box>
            {hasSubmitButton && hasSearch && (
                <Box padding={1}>
                    <Button
                        onClick={onSubmitClick}
                        size={size}
                        width="full"
                        variant="action"
                        data-e2e={`${dataE2e}_select-submit-button`}
                    >
                        Применить
                    </Button>
                </Box>
            )}
        </div>
    );
};

export default memo(Dropdown);
