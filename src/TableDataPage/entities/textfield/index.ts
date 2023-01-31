import { declareAction, declareAtom, map } from '@reatom/core';
import { Nullable } from '../../types';

type PriorityFocuseType = {
    selector: Nullable<string>;
    priority?: number;
};

export const pushToSuperFocus = declareAction<PriorityFocuseType>();
export const popFromSuperFocus = declareAction<number>();

export const superFocusAtom = declareAtom<Record<number, Nullable<string>[]>>({}, (on) => [
    on(pushToSuperFocus, (state, { selector, priority = 0 }) => {
        if (state[priority] === undefined) {
            state[priority] = [];
        }
        return {
            ...state,
            [priority]: [...state[priority], selector],
        };
    }),
    on(popFromSuperFocus, (state, priority) => {
        if (state[priority].length > 0) {
            return {
                ...state,
                [priority]: state[priority].slice(0, state[priority].length - 1),
            };
        }
        return {
            ...state,
        };
    }),
]);

export const superFocusPriorityAtom = map(superFocusAtom, (megaFocus) =>
    Object.entries(megaFocus).reduce<Nullable<Required<PriorityFocuseType>>>((megaPriority, [priority, selectors]) => {
        if (selectors.length > 0 && (!megaPriority || Number(priority) > megaPriority?.priority)) {
            return {
                selector: selectors[selectors.length - 1],
                priority: Number(priority),
            };
        }
        return megaPriority;
    }, null)
);

export const superFocuEnableAtom = map(superFocusAtom, (megaFocus) =>
    Object.values(megaFocus).every((selectors) => !selectors.includes(null))
);

export const setInputError = declareAction<boolean>('setInputError');
export const setFocusInput = declareAction<boolean>('setFocusInput');

export const inputAtom = declareAtom('inputErrorAtom', { hasError: false, shouldFocus: false }, (on) => [
    on(setInputError, (state, hasError) => ({ ...state, hasError })),
    on(setFocusInput, (state, shouldFocus) => ({ ...state, shouldFocus })),
]);
