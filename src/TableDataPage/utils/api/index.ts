import { AxiosResponse } from 'axios';
import { getUrlParams } from '..';

export type Unpromisify<T> = T extends Promise<infer R> ? R : T;

const { delayed } = getUrlParams();

export const delayCallback = <T>(timeout: number, result: T) =>
    new Promise<T>((resolve) => {
        setTimeout(() => resolve(result), timeout);
    });

export const useData = async <
    ResponseType,
    MapperResponse = ResponseType,
    Fn extends (...args: any[]) => Promise<AxiosResponse<ResponseType>> = any
>({
    real,
    mock,
    params,
    isMock = false,
}: {
    real: Fn;
    mock: (...requestParams: any[]) => ResponseType;
    params: Parameters<Fn>;
    isMock: boolean;
}) => {
    if (isMock) {
        if (delayed) {
            return delayCallback(1500, mock(...params));
        }
        return mock(...params);
    }
    const { data } = await real(...params);
    return data;
};

export const useMapper =
    <
        ResponseType,
        MapperResponse = ResponseType,
        Fn extends (...args: any[]) => Promise<AxiosResponse<Unpromisify<ResponseType>>> = any
    >({
        real,
        mock,
        mapper = (data: any) => data,
        isMock = false,
    }: {
        real: Fn;
        mock: (...params: any[]) => Unpromisify<ResponseType>;
        mapper?: (data: Unpromisify<ResponseType>) => MapperResponse;
        isMock?: boolean;
    }) =>
    async (...params: Parameters<Fn>) => {
        const data = await useData({ real, mock, params, isMock });
        return mapper(data);
    };
