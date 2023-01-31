import { ActionCreator, Atom, declareAction, declareAtom, noop, PayloadActionCreator, Store } from '@reatom/core';
import { AxiosError } from 'axios';
import { settableAtomCreatorObject } from '..';
import { FetchOptional, NotificationType } from '../../types';
import logger from '../logger';

export interface BackendError {
    message: string;
    status: string;
}

const IS_ACTION_FETCH = 'fetchAction';
type WithParamsType<Opt, Payload> = Opt extends true ? { paramsAtom: Atom<Payload> } : Record<string, never>;
type WithDataType<Opt, Result> = Opt extends true ? { dataAtom: Atom<Result> } : Record<string, never>;
type ActionDetectorType<Payload> = Payload extends undefined ? ActionCreator : PayloadActionCreator<Payload>;

type DeclareActionFetchAdditional<Result, Payload, WithData, WithParams> = WithDataType<WithData, Result> &
    WithParamsType<WithParams, Payload> & {
        done: PayloadActionCreator<Result>;
        fail: PayloadActionCreator<AxiosError<BackendError>>;
        isPending: Atom<boolean>;
        cast(store: Store, payload?: Payload): Promise<Result>;
        [IS_ACTION_FETCH]: true;
    };

export type DeclareActionFetch<
    Result,
    Payload,
    WithData = undefined,
    WithParams = undefined
> = ActionDetectorType<Payload> & DeclareActionFetchAdditional<Result, Payload, WithData, WithParams>;

export interface IsActionFetch {
    [IS_ACTION_FETCH]: true;
}

const retryableActionFetchDispatcher = async <Payload, Result>(
    fetcher: (payload: Payload) => Promise<Result>,
    payload: Payload,
    store: Store,
    n: number
    // eslint-disable-next-line consistent-return
) => {
    if (n === 1) {
        return fetcher(payload);
    }
    for (let i = 1; i < n + 1; i++) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const result = await fetcher(payload);
            return result;
        } catch (err) {
            // Ошибка с бэкенда
            if (err.response) {
                throw err;
            }
            const isLastAttempt = i === n;
            if (isLastAttempt) {
                throw err;
            }
        }
    }
};

export interface FetchErrorHandler {
    fetchError?: (error: any, store: Store) => void;
    processingError?: (error: any, store: Store) => void;
}

export type SuccessNotificationHandler = (notificationData: NotificationType, store: Store) => void;

interface ExtreFetchOption<Result, WithData, WithParams> extends FetchOptional<Result> {
    name?: string;
    ignoreError?: boolean;
    notificationTimeout?: number;
    clearNotifications?: boolean;
    withGlobalLoading?: boolean;
    retry?: number;
    withData?: WithData;
    withParams?: WithParams;
    errorHandler?: FetchErrorHandler;
}

export function declareActionFetch<Result, Payload = undefined, WithData = boolean, WithParams = boolean>(
    fetcher: (payload: Payload) => Promise<Result>,
    {
        name = 'someFetch',
        onDone = noop,
        onFail = noop,
        retry = 0,
        withData,
        withParams,
        errorHandler = {},
    }: ExtreFetchOption<Result, WithData, WithParams> = {}
): DeclareActionFetch<Result, Payload, WithData, WithParams> {
    // eslint-disable-next-line consistent-return
    const fetchAction: any = declareAction<Payload>(`${name}/FETCH/START`, async (payload, store) => {
        try {
            logger.arguments(payload);

            const response = await retryableActionFetchDispatcher(fetcher, payload, store, retry + 1);

            logger.response(response);
            try {
                store.dispatch(fetchAction.done(response));
            } catch (error) {
                if (errorHandler?.processingError) {
                    errorHandler.processingError(error, store);
                }
                logger.error(error);
            }
            return response;
        } catch (error) {
            if (errorHandler?.fetchError) {
                errorHandler.fetchError(error, store);
            }
            store.dispatch(fetchAction.fail(error));
            logger.error(error);
        }
    });

    const done = declareAction<Result>(`${name}/FETCH/DONE`, onDone);
    const fail = declareAction<AxiosError<BackendError>>(`${name}/FETCH/FAIL`, onFail);
    const isPending = declareAtom(`${name}PendingAtom`, false, (on) => [
        on(fetchAction, () => true),
        on(done, () => false),
        on(fail, () => false),
    ]);
    const { atom } = settableAtomCreatorObject<Result | null>(`${name}/FETCH/DATA`, null, (on) => {
        if (withData) {
            return [on(done, (state, payload) => payload)];
        }

        return [];
    });
    const paramsAtom = declareAtom<Payload | null>(`${name}/FETCH/PARAMS`, null, (on) => {
        if (withParams) {
            return [
                // @ts-ignore
                on(fetchAction, (state, payload) => payload),
            ];
        }

        return [];
    });

    const cast = (store: Store, payload?: Payload) => {
        const action = fetchAction(payload);

        return new Promise((res, rej) =>
            // eslint-disable-next-line no-promise-executor-return
            store.dispatch({
                ...action,
                reactions: [
                    (...a) =>
                        action.reactions[0](...a).then(
                            (p: Payload) => res(p),
                            (e: Error) => rej(e)
                        ),
                ],
            })
        );
    };

    fetchAction.done = done;
    fetchAction.fail = fail;
    fetchAction.isPending = isPending;
    fetchAction.cast = cast;
    if (withData) {
        fetchAction.dataAtom = atom;
    }
    if (withParams) {
        fetchAction.paramsAtom = paramsAtom;
    }
    fetchAction[IS_ACTION_FETCH] = true;

    return fetchAction;
}
