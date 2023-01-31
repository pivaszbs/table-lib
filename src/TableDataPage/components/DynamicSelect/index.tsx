/* eslint-disable max-lines */
import { useI18N } from '@yandex-int/i18n/lib/react';
import { Box, Icon, Spinner } from '@yandex-levitan/b2b';
import noop from 'lodash/noop';
import React, {
    KeyboardEvent,
    memo,
    MouseEvent,
    RefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import * as keyset from '../../TableDataPage.i18n';
import TextField from '../LargeTextField';
import { useClickOutside } from '../../entities/hooks';
import SmallButton from '../buttons/SmallButton';

import Dropdown from './components/Dropdown';
import MultiInput from './components/MultiInput';
import styles from './style.pcss';
import { MultiSelectProps, SelectorItem, SelectTypeEnum, SimpleSelectProps } from './types';

const DynamicSelect = ({
    value = null,
    items,
    dataE2e = 'dynamic-select',
    dropdownClassName = '',
    inputClassName = '',
    inputWidth = 'full',
    inputValue = '',
    placeholder = '',
    size = 'l',
    optionSize,
    selectType = SelectTypeEnum.SIMPLE,
    hasSearch = false,
    disabled = false,
    isLoading = false,
    isTopOpening = false,
    hasResetButton = false,
    hasSelectAll = false,
    hasSubmitButton = false,
    hasCompactMultiInput = false,
    withoutArrowButton = false,
    hasSelfFilter = false,
    hasSelfStoreInput = false,
    hasIgnoreValidationOnEnter = false,
    hasAlphabeticalItemsSort = false,
    searchInputModifier,
    textInputEnterSubmitModifier,
    onInputChange = noop,
    onChange = noop,
    onMultiInputChange = noop,
    onBlur = noop,
    onClick = noop,
    ...otherProps
}: SimpleSelectProps | MultiSelectProps) => {
    const i18N = useI18N(keyset);

    const [isDropdownVisible, setDropdownVisibility] = useState<boolean>(false);
    const [localSearchValue, setLocalSearchValue] = useState<string>('');
    const [filteredItems, setFilteredItems] = useState<SelectorItem[]>([]);
    const [localMultiSelectValue, setLocalMultiSelectValue] = useState<SelectorItem[]>([]);
    const selectRef: RefObject<HTMLDivElement> = useRef(null);
    const inputRef: RefObject<HTMLInputElement> = useRef(null);
    const arrowIcon = isDropdownVisible ? 'cornerUp' : 'cornerDown';

    const textInputValue = useMemo(() => {
        if (isDropdownVisible && hasSearch) {
            return hasSelfFilter || hasSelfStoreInput ? localSearchValue : inputValue;
        }
        if (Array.isArray(value)) {
            return '';
        }

        return value?.label || '';
    }, [localSearchValue, hasSelfFilter, hasSelfStoreInput, value, inputValue, isDropdownVisible]);

    const dropdownItems = useMemo(
        () => (hasSelfFilter && localSearchValue ? filteredItems : items),
        [hasSelfFilter, localSearchValue, filteredItems, items]
    );

    const handleArrowClick = useCallback(
        (event: MouseEvent) => {
            event.stopPropagation();
            if (!disabled) {
                setDropdownVisibility(!isDropdownVisible);
                inputRef.current?.focus();
            }
        },
        [isDropdownVisible, disabled]
    );
    const handleInputClick = useCallback(
        (event: MouseEvent) => {
            event.stopPropagation();
            if (!disabled) {
                setDropdownVisibility(true);
                inputRef.current?.focus();
            }
            onClick(event);
        },
        [isDropdownVisible, disabled]
    );
    const handleInputChange = useCallback(
        (newValue: string) => {
            const newFormattedValue = searchInputModifier ? searchInputModifier(newValue, textInputValue) : newValue;
            setDropdownVisibility(true);
            if (hasSelfFilter || hasSelfStoreInput) {
                setLocalSearchValue(newFormattedValue);
            }
            if (hasSelfFilter) {
                const searchedItems = items.filter(({ label }) =>
                    label.toLowerCase().includes(newFormattedValue.trim().toLowerCase())
                );
                setFilteredItems(searchedItems);
            } else {
                onInputChange(newFormattedValue);
            }
        },
        [onInputChange, hasSelfFilter, hasSelfStoreInput, value, items, textInputValue, searchInputModifier]
    );
    const simpleDropdownValues: SelectorItem[] = value === null ? [] : [value as SelectorItem];
    const dropdownValues: SelectorItem[] = useMemo(() => {
        if (hasSubmitButton) {
            return localMultiSelectValue;
        }

        return Array.isArray(value) ? value : simpleDropdownValues;
    }, [localMultiSelectValue, value, simpleDropdownValues, hasSubmitButton]);
    const handleItemSelect = useCallback(
        (item: SelectorItem) => {
            if (selectType === SelectTypeEnum.SIMPLE) {
                onChange(item);
                setDropdownVisibility(false);
            } else {
                const newSelectValue = dropdownValues.concat(item);
                if (hasSubmitButton) {
                    setLocalMultiSelectValue(newSelectValue);
                } else {
                    onMultiInputChange(newSelectValue);
                }
            }

            onInputChange('');
            if (hasSelfFilter) {
                setLocalSearchValue('');
            }
        },
        [onChange, onMultiInputChange, selectType, dropdownValues, onInputChange, hasSubmitButton, hasSelfFilter]
    );
    const handleResetClick = useCallback(
        (event: MouseEvent) => {
            event.stopPropagation();
            if (selectType === SelectTypeEnum.SIMPLE) {
                onChange(null);
                setDropdownVisibility(false);
            } else {
                onMultiInputChange([]);
            }

            if (hasSelfFilter) {
                setLocalSearchValue('');
            }

            onInputChange('');
        },
        [onChange, onMultiInputChange, selectType, dropdownValues, onInputChange, hasSelfFilter]
    );
    const handleItemExclude = useCallback(
        ({ value: excludingValue }: SelectorItem) => {
            if (Array.isArray(value)) {
                const restValues = dropdownValues.filter(({ value: itemValue }) => itemValue !== excludingValue);
                if (hasSubmitButton) {
                    setLocalMultiSelectValue(restValues);
                } else {
                    onMultiInputChange(restValues);
                }
            }
        },
        [dropdownValues, onMultiInputChange, hasSubmitButton]
    );
    const handleMultiSelectGroupSelect = useCallback(
        (selectValue: boolean) => {
            const newValue = selectValue ? dropdownItems : [];
            if (hasSubmitButton) {
                setLocalMultiSelectValue(newValue);
            } else {
                onMultiInputChange(newValue);
            }
        },
        [dropdownItems, onMultiInputChange, hasSubmitButton]
    );
    const handleOutsideClick = useCallback(() => setDropdownVisibility(false), []);

    const handleEnterPress = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (hasIgnoreValidationOnEnter && selectType === SelectTypeEnum.SIMPLE) {
                    const formattedTextInput = textInputEnterSubmitModifier
                        ? textInputEnterSubmitModifier(textInputValue)
                        : textInputValue;
                    handleItemSelect({
                        value: formattedTextInput,
                        label: formattedTextInput,
                    });
                    if (formattedTextInput !== textInputValue && (hasSelfFilter || hasSelfStoreInput)) {
                        setLocalSearchValue(formattedTextInput);
                    }
                    setDropdownVisibility(false);
                }

                if (hasSubmitButton && selectType === SelectTypeEnum.MULTI) {
                    onMultiInputChange(dropdownValues);
                    setDropdownVisibility(false);
                }
            }
        },
        [
            selectType,
            items,
            handleItemSelect,
            isDropdownVisible,
            hasIgnoreValidationOnEnter,
            dropdownValues,
            onMultiInputChange,
            onChange,
            hasSubmitButton,
            textInputEnterSubmitModifier,
        ]
    );

    const handleFocus = useCallback(() => {
        if (hasSearch && selectType === SelectTypeEnum.SIMPLE) {
            onInputChange('');
            if (hasSelfFilter) {
                setLocalSearchValue('');
            }
        } else {
            onInputChange(textInputValue);
        }
    }, [onInputChange, textInputValue, hasSelfFilter]);

    const handleSubmitClick = useCallback(
        (event: MouseEvent) => {
            event.stopPropagation();
            onMultiInputChange(dropdownValues);
            setDropdownVisibility(false);
        },
        [onMultiInputChange, dropdownValues]
    );

    const handleDropdownOpen = useCallback(() => {
        if (hasSearch && hasSubmitButton && selectType === SelectTypeEnum.MULTI) {
            setLocalMultiSelectValue(value as SelectorItem[]);
        }
    }, [value, hasSearch, hasSubmitButton, selectType]);

    useEffect(() => {
        if (isDropdownVisible && inputRef.current) {
            const inputElement = inputRef.current.getElementsByTagName('input');
            if (inputElement && inputElement.length) {
                inputElement[0].focus();
            }
        }
    }, [isDropdownVisible]);

    useClickOutside(selectRef, handleOutsideClick);

    const labelsMapper = useMemo(
        () =>
            items.reduce(
                (prevValue, { label: itemLabel, value: itemValue }) => ({
                    ...prevValue,
                    [itemValue]: itemLabel,
                }),
                {}
            ),
        [items]
    );

    const selectPlaceholder = useMemo(() => {
        if (selectType === SelectTypeEnum.SIMPLE && hasSearch && value && isDropdownVisible) {
            return (value as SelectorItem).label;
        }

        return placeholder;
    }, [selectType, hasSearch, value, isDropdownVisible, placeholder, localSearchValue]);

    const textInput = useMemo(() => {
        if (selectType === SelectTypeEnum.SIMPLE) {
            return (
                <TextField
                    value={textInputValue}
                    onChange={handleInputChange}
                    onBlur={onBlur}
                    onClick={handleInputClick}
                    onFocus={handleFocus}
                    readOnly={!hasSearch}
                    disabled={disabled}
                    className={inputClassName}
                    size={size}
                    $ref={inputRef}
                    hasAutoSelect={false}
                    hasLowerCase
                    selector={dataE2e}
                    placeholder={selectPlaceholder}
                    onKeyPress={handleEnterPress}
                    {...otherProps}
                />
            );
        }

        if (hasCompactMultiInput) {
            const selectedItemsCount = (value as SelectorItem[]).length;
            const buttonTitle = i18N('Выбрано {selectedItemsCount}', {
                selectedItemsCount,
            });
            const variant = selectedItemsCount ? 'action' : 'normal';
            return (
                <Box minWidth={160}>
                    <SmallButton
                        width="full"
                        icon={arrowIcon}
                        iconPosition="right"
                        onClick={handleArrowClick}
                        size={size}
                        variant={variant}
                        data-e2e={dataE2e}
                    >
                        {buttonTitle}
                    </SmallButton>
                </Box>
            );
        }

        return (
            <MultiInput<SelectorItem>
                onClick={handleInputClick}
                inputRef={inputRef}
                onInputChange={handleInputChange}
                onChange={onMultiInputChange}
                onFocus={handleFocus}
                values={value as SelectorItem[]}
                labelsMapper={labelsMapper}
                inputValue={textInputValue}
                disabled={disabled}
                hasSearch={hasSearch}
                hasSelfFilter={hasSelfFilter}
                inputClassName={inputClassName}
                onBlur={onBlur}
                dataE2e={dataE2e}
                size={size}
                hasSubmitButton={hasSubmitButton}
                {...otherProps}
            />
        );
    }, [
        selectType,
        textInputValue,
        handleInputChange,
        handleInputClick,
        hasSearch,
        hasSelfFilter,
        disabled,
        value,
        handleEnterPress,
        selectPlaceholder,
        hasCompactMultiInput,
        hasSubmitButton,
        arrowIcon,
        items,
        labelsMapper,
    ]);

    const inputWithValue = inputWidth === 'full' ? '100%' : `${inputWidth}px`;

    return (
        <div className={styles.wrapper} ref={selectRef} style={{ width: inputWithValue }} onClick={handleArrowClick}>
            <div className={styles['input-wrapper']}>
                {textInput}
                {!hasCompactMultiInput && !withoutArrowButton && (
                    <div className={styles['input-icon']}>
                        {hasResetButton && (
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={handleResetClick}
                                className={styles['arrow-button']}
                            >
                                <Icon name="cross" size={size} />
                            </button>
                        )}
                        <div className={styles['arrow-wrapper']}>
                            {isLoading ? (
                                <Spinner size="xxs" />
                            ) : (
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={handleArrowClick}
                                    className={styles['arrow-button']}
                                >
                                    <Icon name={arrowIcon} size={size} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {isDropdownVisible && Boolean(items?.length) && (
                <Dropdown
                    isMultiSelect={selectType === 'multi'}
                    selectedValues={dropdownValues}
                    items={dropdownItems}
                    inputValue={textInputValue}
                    onItemSelect={handleItemSelect}
                    onItemExclude={handleItemExclude}
                    onGroupSelect={handleMultiSelectGroupSelect}
                    onInputClick={handleInputClick}
                    onInputChange={handleInputChange}
                    onSubmitClick={handleSubmitClick}
                    onInputKeyDown={handleEnterPress}
                    onDropdownOpen={handleDropdownOpen}
                    dropdownClassName={dropdownClassName}
                    isTopOpening={isTopOpening}
                    hasSubmitButton={hasSubmitButton}
                    hasSearch={hasSearch}
                    hasSelectAll={hasSelectAll}
                    hasAlphabeticalItemsSort={hasAlphabeticalItemsSort}
                    dataE2e={dataE2e}
                    size={optionSize || size}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
};

export default memo(DynamicSelect);
