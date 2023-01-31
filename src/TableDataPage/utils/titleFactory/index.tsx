/* eslint-disable max-lines */
import { Box, Checkbox, Column, Icon, Tooltip } from '@yandex-levitan/b2b';
import classNames from 'classnames/bind';
import noop from 'lodash/noop';
import React, { FC, MouseEvent, ReactNode, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import ModalWindow from '../../components/ModalWindow';
import SmallButton from '../../components/buttons/SmallButton';
import DynamicSelect from '../../components/DynamicSelect';
import { SelectorItem, SelectTypeEnum } from '../../components/DynamicSelect/types';
import TextField from '../../components/LargeTextField';
import NumberRangeFilter from '../../components/NumberRangeFilter';
import RangeDateForm from '../../components/RangeDateForm';
import { FormData } from '../../components/RangeDateForm/types';
import { RANGE_FILTER_TAGS } from '../../entities/constants';
import styles from '../../style.pcss';
import { ColumnTypesEnum, Nullable } from '../../types';

import { Option, orderIcon, TitleProps } from './types';
import { getFormattedDateRange, getFormattedTextValue, getFormattedTitle } from './utils';

const cn = classNames.bind(styles);

const NOT_CLEARABLE_ON_BLUR_FIELDS: Nullable<ColumnTypesEnum>[] = [ColumnTypesEnum.MULTI_STRING];

export const Title = ({
    title,
    type = null,
    onChange,
    onOrderChange,
    onFilterRemove,
    onCheckboxChange = noop,
    multiListSeparator = ',',
    order = null,
    options,
    id = null,
    initialValues = {},
    checkBoxState = false,
    isLoading = false,
    hasTankerTranslate = false,
    hasSingleDateOption = false,
    hasFilter = true,
    hasSort: hasSortFromConfig = true,
    withSpaceTrimmer = true,
    maxWidth = 'auto',
    minWidth = 'auto',
    i18N = (textValue) => textValue,
    tooltipText,
    filterE2e = `${id}_filter`,
    withoutHeaderCheckbox = false,
    autoLikeFilterStyle = false,
}: TitleProps) => {
    const initialValue = useMemo(
        () => getFormattedTitle(id, initialValues, type, autoLikeFilterStyle, multiListSeparator),
        [id, initialValues, type, autoLikeFilterStyle, multiListSeparator]
    );
    const dateRangeInitialValue = useMemo(() => getFormattedDateRange(id, initialValues), [id, initialValues, type]);
    const isFilterActive = useMemo(() => {
        if (!id) {
            return false;
        }

        return id in initialValues || RANGE_FILTER_TAGS.some((separator) => `${id}_${separator}` in initialValues);
    }, [initialValues, id]);
    const [value, setValue] = useState(initialValue);
    const [isFilterModalVisible, setFilterModalVisiblity] = useState(false);

    const hasSort = useMemo(() => Boolean(type && type !== 'Checkbox') && hasSortFromConfig, [type, hasSortFromConfig]);

    const [orderValue, dispatchOrder] = useReducer((state) => {
        if (isLoading || !hasSort) {
            return state;
        }
        if (state === 'DESC') {
            onOrderChange?.('ASC');
            return 'ASC';
        }

        if (state === 'ASC') {
            onOrderChange?.('');
            return '';
        }

        if (state === '') {
            onOrderChange?.('DESC');
            return 'DESC';
        }

        return state;
    }, order ?? '');

    const filterOptions = useMemo(() => {
        if (options?.selectOptions && options.selectOptions.length && typeof options.selectOptions[0] === 'string') {
            return (options.selectOptions as string[]).map((label: string) => ({
                value: label,
                label: hasTankerTranslate ? i18N(label) : label,
            }));
        }
        if (options?.selectOptions && options.selectOptions.length) {
            return options.selectOptions as Option[];
        }

        return [];
    }, [options, hasTankerTranslate, hasSort]);

    const selectValue = useMemo(
        () => filterOptions.find(({ value: itemValue, label }) => itemValue === value) || null,
        [filterOptions, value]
    );

    const multiSelectValue = useMemo(() => {
        const selectedValues = value.split(',').reduce<Record<string, boolean>>(
            (prevValue, option) => ({
                ...prevValue,
                [option]: true,
            }),
            {}
        );

        return filterOptions.reduce<SelectorItem[]>(
            (prevValue, { value: valueSelect, label: inputLabel }) =>
                valueSelect && selectedValues[valueSelect]
                    ? [
                          ...prevValue,
                          {
                              label: inputLabel,
                              value: valueSelect,
                          },
                      ]
                    : prevValue,
            []
        );
    }, [filterOptions, value]);

    const onValueChange = useCallback(() => {
        if (type === 'MultiTextField') {
            let multiTextFormattedValue = value ? value.split(multiListSeparator) : [];
            multiTextFormattedValue = multiTextFormattedValue.map((valueItem) => {
                const formattedValue = getFormattedTextValue({
                    value: valueItem,
                    autoLikeFilterStyle,
                    withSpaceTrimmer,
                });

                return formattedValue;
            });
            onChange?.(multiTextFormattedValue);
            return;
        }
        const formattedValue = getFormattedTextValue({
            value,
            autoLikeFilterStyle,
            withSpaceTrimmer,
        });

        onChange?.(formattedValue);
    }, [value, withSpaceTrimmer, autoLikeFilterStyle, onChange]);

    const onModalClose = useCallback(() => setFilterModalVisiblity(false), []);

    const onRangeDateFormSubmit = useCallback(
        (formDate: FormData | string) => {
            onChange?.(formDate);
            onModalClose();
        },
        [onModalClose, onChange]
    );

    const handleClick = useCallback(
        (event: MouseEvent) => {
            event.stopPropagation();
            if (type === 'DateField' || type === 'DateTimeField') {
                setFilterModalVisiblity(true);
            }
        },
        [type]
    );

    const onKeyPress = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                onValueChange();
            }
        },
        [onValueChange]
    );

    const handleOnChange = useCallback(
        (v: string) => {
            if (type === 'Select') {
                onChange?.(v);
                return;
            }

            setValue(v);
        },
        [onChange]
    );

    const handleCheckboxChange = useCallback(
        (newValue: boolean) => {
            onCheckboxChange(newValue);
        },
        [onCheckboxChange]
    );

    const handleBlur = useCallback(() => {
        if (!NOT_CLEARABLE_ON_BLUR_FIELDS.includes(type)) {
            setValue(initialValue);
        }
    }, [initialValue, initialValues, type]);

    const handleReset = useCallback(
        (event: MouseEvent) => {
            event.stopPropagation();
            if (id && onFilterRemove) {
                onFilterRemove(id);
            }
        },
        [id]
    );

    const handleSelectValueChange = useCallback(
        (newValue: SelectorItem | null) => {
            if (newValue) {
                onChange?.(newValue.value);
            }
        },
        [onChange]
    );

    const handleMultiSelectValueChange = useCallback(
        (newValue: SelectorItem[]) => {
            const newMultiSelectValue = newValue.map(({ value: selectorValue }) => selectorValue);
            onChange?.(newMultiSelectValue);
        },
        [onChange]
    );

    const checkbox = useMemo(
        () =>
            withoutHeaderCheckbox ? null : (
                <Box justifyContent="center" direction="row">
                    <Checkbox
                        data-e2e={filterE2e}
                        disabled={isLoading}
                        checked={checkBoxState}
                        onChange={handleCheckboxChange}
                    />
                </Box>
            ),
        [isLoading, checkBoxState, withoutHeaderCheckbox, handleReset, handleCheckboxChange, filterE2e]
    );

    const textFilter = useMemo(
        () => (
            <TextField
                size="s"
                placeholder={title}
                value={value}
                onChange={handleOnChange}
                onBlur={handleBlur}
                onKeyPress={onKeyPress}
                onClick={handleClick}
                disabled={isLoading}
                hasLowerCase
                data-e2e={filterE2e}
            />
        ),
        [isLoading, title, value, handleOnChange, handleBlur, onKeyPress, handleClick, isFilterActive, filterE2e]
    );

    const dateFilter = useMemo(
        () => (
            <SmallButton
                size="s"
                value={value}
                onChange={handleOnChange}
                onClick={handleClick}
                variant={isFilterActive ? 'action' : 'normal'}
                disabled={isLoading}
                data-e2e={filterE2e}
            >
                {initialValue}
            </SmallButton>
        ),
        [isLoading, title, value, handleOnChange, handleBlur, handleClick, isFilterActive, filterE2e, initialValue]
    );

    const selectFilter = useMemo(
        () => (
            <DynamicSelect
                size="s"
                placeholder={title}
                items={filterOptions || []}
                value={selectValue}
                onChange={handleSelectValueChange}
                onClick={handleClick}
                hasAlphabeticalItemsSort
                dataE2e={filterE2e}
            />
        ),
        [isLoading, title, value, handleOnChange, handleClick, isFilterActive, filterE2e]
    );

    const multiSelectFilter = useMemo(
        () => (
            <DynamicSelect
                onMultiInputChange={handleMultiSelectValueChange}
                value={multiSelectValue || []}
                items={filterOptions || []}
                selectType={SelectTypeEnum.MULTI}
                size="s"
                placeholder={title}
                hasSubmitButton
                hasSearch
                hasCompactMultiInput
                hasSelectAll
                hasSelfFilter
                hasIgnoreValidationOnEnter
                hasAlphabeticalItemsSort
                dataE2e={filterE2e}
            />
        ),
        [handleMultiSelectValueChange, filterOptions, multiSelectValue, title, filterE2e]
    );

    const numberFilter = useMemo(() => {
        if (id && onChange) {
            return <NumberRangeFilter initialValues={initialValues} id={id} onChange={onChange} dataE2e={filterE2e} />;
        }

        return null;
    }, [onChange, id, initialValues, filterE2e]);

    const filterComponent = (() => {
        switch (type) {
            case ColumnTypesEnum.STRING:
            case ColumnTypesEnum.MULTI_STRING:
                return textFilter;
            case ColumnTypesEnum.LIST:
                return selectFilter;
            case ColumnTypesEnum.DATE:
            case ColumnTypesEnum.DATE_TIME:
                return dateFilter;
            case ColumnTypesEnum.CHECKBOX:
                return checkbox;
            case ColumnTypesEnum.MULTILIST:
                return multiSelectFilter;
            case ColumnTypesEnum.NUMBER:
                return numberFilter;
            default:
                return null;
        }
    })();

    const columnTitle = useMemo(() => <span className={cn('title-wrapper')}>{title}</span>, [title]);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    return (
        <>
            <Box
                position="relative"
                padding={3}
                onClick={dispatchOrder}
                minWidth={minWidth}
                maxWidth={maxWidth}
                alignItems="stretch"
                data-e2e={`${filterE2e}_sort`}
                className={cn('header-cell', {
                    'header-cell--sort': order && hasSort,
                    'header-cell--with-sort': hasSort,
                })}
            >
                <Column>
                    <Box direction="row" alignItems="center" padding={1} minHeight="36px">
                        <Box direction="row" alignItems="center">
                            {type !== 'Checkbox' &&
                                (tooltipText ? (
                                    <Tooltip trigger="hover" content={tooltipText}>
                                        <span>{columnTitle}</span>
                                    </Tooltip>
                                ) : (
                                    columnTitle
                                ))}
                        </Box>
                        <Box direction="row" flex={1} justifyContent="space-between" alignItems="center">
                            {hasSort && (
                                <span
                                    className={cn('sort-icon-wrapper', {
                                        'sort-icon-wrapper--visible': order,
                                    })}
                                >
                                    <Icon size="s" name={orderIcon[orderValue] ?? 'code'} />
                                </span>
                            )}
                            {hasFilter && type && type !== 'Checkbox' && (
                                <Box flex={1} direction="row" justifyContent="flex-end" alignItems="flex-start">
                                    <Tooltip trigger="hover" content="Сбросить фильтр">
                                        <SmallButton
                                            disabled={!isFilterActive || isLoading}
                                            onClick={handleReset}
                                            size="s"
                                            icon="cross"
                                            data-e2e={`${filterE2e}_reset_filter`}
                                        />
                                    </Tooltip>
                                </Box>
                            )}
                        </Box>
                    </Box>
                    {hasFilter && type && filterComponent}
                </Column>
                {order && hasSort && <div className={cn('sort-hightlighter')} />}
            </Box>
            <ModalWindow isOpen={isFilterModalVisible} onClose={onModalClose}>
                <RangeDateForm
                    initialData={dateRangeInitialValue}
                    onSubmit={onRangeDateFormSubmit}
                    onClose={onModalClose}
                    formId="filterForm"
                    type={type}
                    hasSingleDateOption={hasSingleDateOption}
                    isSingleDateActive={Boolean(dateRangeInitialValue.singleDate)}
                />
            </ModalWindow>
        </>
    );
};

export const titleFactory = (titleProps: TitleProps) => <Title {...titleProps} />;
