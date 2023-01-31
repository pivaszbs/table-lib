/* eslint-disable max-lines */
import React, { memo, useCallback, useState, RefObject, KeyboardEvent, FocusEvent, MouseEvent, useMemo } from 'react';
import { Registry, TextField as BaseTextField, TextSizes } from '@yandex-levitan/b2b';
import { Key } from 'ts-key-enum';
import classNames from 'classnames/bind';
import { css } from 'reshadow';

import ItemBadge from './components/ItemBadge';
import styles from './style.pcss';
import { SelectorItem } from '../../types';

const cn = classNames.bind(styles);

export type MultiInputProps<T extends SelectorItem | string> = {
    values: T[];
    onChange: (values: T[]) => void;
    labelsMapper?: Record<string, string>;
    inputValue: string;
    disabled?: boolean;
    hasSearch: boolean;
    hasSelfFilter?: boolean;
    hasSubmitButton?: boolean;
    inputRef?: RefObject<HTMLInputElement>;
    onInputChange: (value: string) => void;
    onClick?: (event: MouseEvent) => void;
    onBlur: (event: FocusEvent) => void;
    onFocus?: () => void;
    inputClassName?: string;
    dataE2e?: string;
    size: TextSizes;
    withEnter?: boolean;
};

const Input = Registry.styled(
    BaseTextField,
    css`
        box {
            box-shadow: none !important;
        }

        inner {
            padding: 0 !important;
        }
    `
);

const WIDTH_SCALE = 14;
const EMPTY_INPUT_WIDTH = 2;

const MultiInput = <T extends SelectorItem | string>({
    values = [],
    onChange,
    labelsMapper = {},
    inputValue,
    inputRef,
    disabled,
    hasSearch,
    hasSelfFilter,
    hasSubmitButton,
    onInputChange,
    onClick,
    onFocus,
    inputClassName = '',
    onBlur,
    dataE2e,
    size = 'l',
    withEnter = false,
}: MultiInputProps<T>) => {
    const [inputWidth, setWith] = useState(EMPTY_INPUT_WIDTH);
    const [isFocus, setFocusState] = useState(false);
    const handleInputChange = useCallback((value: string) => {
        setWith(WIDTH_SCALE * value.length || EMPTY_INPUT_WIDTH);
        onInputChange(value);
    }, []);
    const handleFocusChange = useCallback(
        (event: FocusEvent) => {
            onFocus?.();
            setFocusState(!isFocus);
            onBlur(event);
        },
        [isFocus, onBlur, inputValue, onInputChange]
    );

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (inputValue === '' && event.key === Key.Backspace) {
                onChange(values.slice(0, values.length - 1));
            }
            if (withEnter && inputValue !== '' && event.key === Key.Enter) {
                event.stopPropagation();
                event.preventDefault();
                // @ts-ignore
                onChange([...values, inputValue]);
                onInputChange('');
            }
        },
        [inputValue, onChange, values]
    );

    const handleItemRemove = useCallback(
        (removedItem) => {
            onChange(
                values.filter((item) =>
                    typeof item === 'string' ? item !== removedItem : item.value !== removedItem.value
                )
            );
        },
        [onChange, values]
    );

    const handlePaste = useCallback(
        (event: any) => {
            if (event.clipboardData && withEnter) {
                event.stopPropagation();
                event.preventDefault();
                onChange([
                    ...values,
                    ...event.clipboardData
                        .getData('text')
                        .trim()
                        .split(/[;,\s]/g)
                        .filter(Boolean),
                ]);
                onInputChange('');
            }
        },
        [values]
    );

    const handleClick = useCallback(
        (event: MouseEvent) => {
            event.stopPropagation();
            onClick?.(event);
        },
        [onClick]
    );

    const Bages = useMemo(
        () =>
            values.map((item) => {
                let bageItem = item;
                if (typeof item !== 'string') {
                    const labelFromMapper = typeof item !== 'string' ? labelsMapper[item.value] || item.label : item;
                    const label = hasSearch && !hasSelfFilter ? item.label : labelFromMapper;
                    bageItem = {
                        // @ts-ignore
                        ...bageItem,
                        label,
                    };
                }

                return (
                    <ItemBadge
                        key={typeof item !== 'string' ? item.value : item}
                        item={bageItem}
                        onItemExclude={handleItemRemove}
                        disabled={disabled}
                    />
                );
            }),
        [values, handleItemRemove]
    );

    return (
        <div
            className={cn(styles['multi-input'], {
                [styles['multi-input--focus']]: isFocus,
                [inputClassName]: Boolean(inputClassName),
                [`multi-input--${size}`]: true,
            })}
            onClick={handleClick}
        >
            {Bages}
            {hasSearch && !hasSubmitButton && (
                <div className={cn(styles['input-wrapper'])} style={{ width: `${inputWidth}px` }}>
                    <Input
                        onPaste={handlePaste}
                        onBlur={handleFocusChange}
                        onFocus={handleFocusChange}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        // @ts-ignore
                        size={size}
                        $ref={inputRef}
                        disabled={disabled}
                        data-e2e={dataE2e}
                    />
                </div>
            )}
        </div>
    );
};

export default memo(MultiInput) as typeof MultiInput;
