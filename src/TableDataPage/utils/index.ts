import { ActionCreator, Atom, declareAction, declareAtom, PayloadActionCreator } from '@reatom/core';

const MIN_ITEMS_ON_PAGE = '1';

export const validateItemsOnPage = (newValue: string, lastValue: string) => {
    if (!newValue.match(/^\d*$/) && newValue !== '') {
        return lastValue;
    }

    if (Number(newValue) > 100 || (Number(newValue) < 1 && newValue !== '')) {
        return lastValue;
    }

    return newValue;
};

export const getValidItemsOnPageAfterSubmit = (value: string) => value || MIN_ITEMS_ON_PAGE;

type Reducer<TState, TValue> = (state: TState, value: TValue) => TState;
type AtomsMap<T> = { [key: string]: Atom<T> };

interface DependencyMatcherOn<TState> {
    <T>(dependency: Atom<T>, reducer: Reducer<TState, T>): void;

    <T>(dependency: PayloadActionCreator<T>, reducer: Reducer<TState, T>): void;

    <T>(dependency: Atom<T> | PayloadActionCreator<T>, reducer: Reducer<TState, T>): void;
}

type DependencyMatcher<TState> = (on: DependencyMatcherOn<TState>) => any;

export type SettableAtom<Type> = [Atom<Type>, PayloadActionCreator<Type>, ActionCreator];
export type SettableAtomObject<Type> = { atom: Atom<Type>; set: PayloadActionCreator<Type>; reset: ActionCreator };

export const capitalize = (value: string) => value[0].toUpperCase() + value.slice(1);

export const settableAtomCreator = <Type>(
    name: string,
    initialState: Type,
    dependencyMatcherOn?: DependencyMatcher<Type>,
    config?: { persist: boolean }
): SettableAtom<Type> => {
    const setAction = declareAction<Type>(`set${capitalize(name)}`);
    const resetAction = declareAction(`reset${capitalize(name)}`);
    const { persist = true } = config ?? {};
    let prevState;

    if (persist) {
        prevState = sessionStorage.getItem(name);
    }

    if (prevState) {
        prevState = JSON.parse(prevState);
    }
    // @ts-ignore
    const atom = declareAtom<Type>(name, prevState || initialState, (on) => {
        if (dependencyMatcherOn && typeof dependencyMatcherOn === 'function') {
            // @ts-ignore
            dependencyMatcherOn(on);
        }
        return [on(setAction, (state, payload) => payload), on(resetAction, () => initialState)];
    });

    // @ts-ignore
    atom.atomName = name;

    return [atom, setAction, resetAction];
};

export const settableAtomCreatorObject = <Type>(
    name: string,
    initialState: Type,
    dependencyMatcherOn?: DependencyMatcher<Type>,
    config?: { persist: boolean }
): SettableAtomObject<Type> => {
    const [atom, set, reset] = settableAtomCreator(name, initialState, dependencyMatcherOn, config);
    return { atom, set, reset };
};

export function paramsToObject(entries: IterableIterator<[string, string]>): Record<string, string | boolean> {
    const result: Record<string, string | boolean> = {};
    for (const [key, value] of entries) {
        switch (value) {
            case 'false':
            case '0': {
                result[key] = false;
                break;
            }
            case 'true':
            case '1': {
                result[key] = true;
                break;
            }
            default:
                result[key] = value;
        }
    }
    return result;
}

export function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    // @ts-ignore
    const entries = urlParams.entries();
    return paramsToObject(entries);
}

export const dateSafariPolifill = (dateString: string) => dateString.trim().replace(' ', 'T');
