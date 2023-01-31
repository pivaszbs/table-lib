import { Context, useContext, useEffect } from 'react';
import { noop, PayloadActionCreator, Store } from '@reatom/core';
import { context } from '@reatom/react';

function createActionHook(ctx: Context<Store | null> = context) {
    function handleAction<P>(
        action: PayloadActionCreator<P>,
        callback: (store: Store, payload: P) => void,
        deps: any[] = []
    ): void {
        const store = useContext(ctx);
        useEffect(() => {
            if (store) {
                const unsubscribe = store.subscribe(action, (payload) => {
                    callback(store, payload);
                });

                return function cleanup() {
                    unsubscribe();
                };
            }

            return noop;
        }, deps);
    }

    return handleAction;
}

export const handleAction = createActionHook();
