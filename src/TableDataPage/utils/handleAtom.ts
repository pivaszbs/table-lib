import { Atom, noop, Store } from '@reatom/core';
import { context } from '@reatom/react';
import { Context, useContext, useEffect } from 'react';

function createAtomHook(ctx: Context<Store | null> = context) {
    function handleAtom<P>(atom: Atom<P>, callback: (state: P) => void, deps: any[] = []): void {
        const store = useContext(ctx);
        useEffect(() => {
            if (store) {
                const unsubscribe = store.subscribe(atom, (state) => {
                    callback(state);
                });

                return function cleanup() {
                    unsubscribe();
                };
            }

            return noop;
        }, deps);
    }

    return handleAtom;
}

export const handleAtom = createAtomHook();
