import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { RequestMethods } from './types';
import { useMapper } from './utils/api';

interface GeneratorParams {
    path: string;
    type: RequestMethods;
    mock?: any;
    client: AxiosInstance;
    isMock: boolean;
    axiosConfig?: AxiosRequestConfig;
}

interface RequestPayload {
    params: Record<string, string | number>;
    body: Record<string, any>;
}

export const apiGenerator = ({ path, type, mock, client, isMock, axiosConfig = {} }: GeneratorParams) => {
    switch (type) {
        case 'GET':
            return useMapper({
                real: ({ params }: RequestPayload) =>
                    client.get(path, {
                        params,
                        ...axiosConfig,
                    }),
                mock: () => mock,
                isMock,
            });
        case 'POST':
            return useMapper({
                real: ({ params, body }: RequestPayload) =>
                    client.post(path, body, {
                        params,
                        ...axiosConfig,
                    }),
                mock: () => mock,
                isMock,
            });
        case 'DELETE':
            return useMapper({
                real: ({ params, body }: RequestPayload) =>
                    client.delete(path, {
                        params,
                        ...axiosConfig,
                    }),
                mock: () => mock,
                isMock,
            });
        case 'PUT':
            return useMapper({
                real: ({ params, body }: RequestPayload) =>
                    client.put(path, body, {
                        params,
                        ...axiosConfig,
                    }),
                mock: () => mock,
                isMock,
            });
        case 'PATCH':
            return useMapper({
                real: ({ params, body }: RequestPayload) =>
                    client.patch(path, body, {
                        params,
                        ...axiosConfig,
                    }),
                mock: () => mock,
                isMock,
            });
        default:
            return useMapper({
                real: ({ params }: RequestPayload) =>
                    client.get(path, {
                        params,
                        ...axiosConfig,
                    }),
                mock: () => mock,
                isMock,
            });
    }
};
