/* eslint-disable max-lines */
import { useAction, useAtom } from '@reatom/react';
import { Registry, TextField as BaseTextField } from '@yandex-levitan/b2b';
import noop from 'lodash/noop';
import React, { KeyboardEvent, memo, useCallback, useEffect, useRef } from 'react';
import { css } from 'reshadow';
import {
    popFromSuperFocus,
    pushToSuperFocus,
    superFocuEnableAtom,
    superFocusPriorityAtom,
    inputAtom,
    setFocusInput,
    setInputError,
} from '../../entities/textfield';

import { Props } from './types';

const LargeTextField = Registry.styled(
    BaseTextField,
    css`
        container[|size][|size='l'] inner {
            font-size: 24px;
            line-height: 36px;
        }

        container[|size][|size='m'] inner {
            font-size: 20px;
            line-height: 28px;
        }
    `
);

const TextField = ({
    withoutImplicitFocus,
    hasLowerCase = false,
    hasAutoSelect = true,
    hasAutoSelectAfterSubmit = false,
    programmaticAutoFocus,
    selector = null,
    priority = 0,
    disabled,
    onKeyDown = noop,
    mask,
    ...textFieldProps
}: Props) => {
    const ref = useRef<HTMLInputElement | null>(null);
    const callbackRef = useRef<any>();
    const { hasError, shouldFocus } = useAtom(inputAtom);
    const superFocuEnable = useAtom(superFocuEnableAtom);
    const superFocusCondition = useAtom(
        superFocusPriorityAtom,
        (atomValue) => superFocuEnable && atomValue?.selector === selector && selector !== null,
        [selector, superFocuEnable]
    );
    const pushFocus = useAction(pushToSuperFocus);
    const popFocus = useAction(popFromSuperFocus);
    const setError = useAction(setInputError);
    const setFocus = useAction(setFocusInput);

    useEffect(() => {
        document.removeEventListener('keydown', callbackRef.current);
        callbackRef.current = () => {
            if (superFocusCondition) {
                ref.current?.focus();
            }
        };
        document.addEventListener('keydown', callbackRef.current);
        return () => document.removeEventListener('keydown', callbackRef.current);
    }, [superFocusCondition]);

    useEffect(() => {
        if (programmaticAutoFocus) {
            // @ts-ignore
            setTimeout(() => ref.current?.focus(), programmaticAutoFocus);
        }
    }, []);

    useEffect(() => {
        if (superFocusCondition && !disabled) {
            ref.current?.select();
        }
    }, [superFocusCondition, disabled]);

    useEffect(() => {
        if (hasError && ref.current?.select) {
            ref.current?.select();
            setError(false);
            return;
        }
        if (shouldFocus && !withoutImplicitFocus && ref.current?.focus) {
            ref.current?.focus();
            setFocus(false);
        }
    }, [shouldFocus, hasError]);

    const onChange = useCallback(
        (value: string) => {
            if (hasLowerCase) {
                textFieldProps.onChange(value);
                return;
            }

            textFieldProps.onChange(String(value).toLocaleUpperCase());
        },
        [textFieldProps.onChange, hasLowerCase]
    );

    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        if (hasAutoSelectAfterSubmit && event.key === 'Enter') {
            ref.current?.select();
        }

        // Костыль для инпута с маской (не отрабатывает onChange, если стереть ввод)

        if (
            mask &&
            event.key === 'Backspace' &&
            // @ts-ignore
            ref?.current?.textMaskInputElement?.state?.previousConformedValue === ''
        ) {
            // @ts-ignore
            onChange(ref.current.textMaskInputElement.state.previousConformedValue);
        }

        onKeyDown(event);
    }, []);

    const handleFocus = useCallback(
        (e: FocusEvent) => {
            if (hasAutoSelect) {
                // @ts-ignore
                e.target.select();
            }
        },
        [hasAutoSelect]
    );

    useEffect(() => {
        pushFocus({
            selector,
            priority,
        });

        return () => {
            popFocus(priority);
        };
    }, [pushFocus, popFocus, selector, priority]);

    return (
        <LargeTextField
            data-e2e={selector || 'text-field'}
            autoComplete="off"
            $inputRef={ref}
            // @ts-ignore
            onFocus={handleFocus}
            {...textFieldProps}
            onChange={onChange}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            mask={mask}
        />
    );
};

export default memo(TextField);
