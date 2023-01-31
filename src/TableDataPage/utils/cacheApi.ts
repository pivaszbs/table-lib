import { differenceInCalendarDays, isValid } from 'date-fns';

export type AnyLiteral = Record<string, any>;

// eslint-disable-next-line no-restricted-globals
const cacheStorage = self.caches;

export enum Type {
    Text,
    Blob,
    Json,
}

export enum CacheNames {
    PHOTOS = 'PHOTOS',
    TABLE_SETTINGS = 'TABLE_SETTINGS',
}

const isCacheOutdated = (date: Date, maxDiff = 3) =>
    !isValid(date) || differenceInCalendarDays(date, new Date()) > maxDiff;

export async function purge(cacheName: string, isLocalStorageAllowed = false) {
    if (!cacheStorage) {
        if (isLocalStorageAllowed) {
            const localStorageData = localStorage.getItem(cacheName);
            if (localStorageData) {
                const storedData = JSON.parse(localStorageData);
                if (typeof storedData === 'object' && storedData !== null) {
                    const freshCache = Object.keys(storedData).reduce((prevValue, key) => {
                        if (key in storedData && 'date' in storedData && 'data' in storedData) {
                            if (isCacheOutdated(new Date(storedData.date))) {
                                return prevValue;
                            }
                        }

                        return {
                            ...prevValue,
                            [key]: storedData[key],
                        };
                    }, {});

                    localStorage.setItem(cacheName, JSON.stringify(freshCache));
                }
            }
        }
        return;
    }

    try {
        const cache = await cacheStorage.open(cacheName);
        const requests = await cache.keys();
        requests.forEach(async (request) => {
            const response = await cache.match(request);
            if (!response) {
                return;
            }
            const cacheDate = response.headers.get('date') || '';

            const date = new Date(cacheDate);
            if (isCacheOutdated(date)) {
                cache.delete(request);
            }
        });
        return;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(err);
    }
}

export async function get(cacheName: string, key: string, type: Type, isLocalStorageAllowed = false) {
    if (!cacheStorage) {
        if (isLocalStorageAllowed) {
            const localStorageData = localStorage.getItem(cacheName);
            if (localStorageData) {
                const storedData = JSON.parse(localStorageData);
                if (typeof storedData === 'object' && storedData !== null && key in storedData) {
                    const { data } = storedData[key];
                    return data;
                }
            }
        }

        return undefined;
    }

    try {
        const request = new Request(key);
        const cache = await cacheStorage.open(cacheName);
        const response = await cache.match(request);
        if (!response) {
            return undefined;
        }

        switch (type) {
            case Type.Text:
                return await response.text();
            case Type.Blob: {
                const blob = await response.blob();

                // Safari does not return correct Content-Type header for webp images.
                if (key.substr(0, 7) === 'sticker') {
                    return new Blob([blob], { type: 'image/webp' });
                }

                // iOS Safari fails to preserve `type` in cache
                if (!blob.type) {
                    const contentType = response.headers.get('Content-Type');
                    if (contentType) {
                        return new Blob([blob], { type: contentType });
                    }
                }

                return blob;
            }
            case Type.Json:
                return await response.json();
            default:
                return undefined;
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(err);
        return undefined;
    }
}

export async function save(cacheName: string, key: string, data: AnyLiteral | string, isLocalStorageAllowed = false) {
    try {
        if (!cacheStorage) {
            if (isLocalStorageAllowed) {
                let storedData = {};
                const localStorageData = localStorage.getItem(cacheName);
                if (localStorageData) {
                    storedData = JSON.parse(localStorageData);
                }

                const newItem = { [key]: { data, date: new Date().toISOString() } };

                if (typeof storedData !== 'object' || storedData === null) {
                    localStorage.setItem(cacheName, JSON.stringify(newItem));
                } else {
                    const updatedState = {
                        ...storedData,
                        ...newItem,
                    };
                    localStorage.setItem(cacheName, JSON.stringify(updatedState));
                }
            }

            return undefined;
        }
        const cacheData: string = typeof data === 'string' ? data : JSON.stringify(data);
        const request = new Request(key);
        const response = new Response(cacheData);
        const cache = await cacheStorage.open(cacheName);
        return await cache.put(request, response);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(err);
        return undefined;
    }
}

export async function clear(cacheName: string, isLocalStorageAllowed = false) {
    try {
        if (!cacheStorage) {
            if (isLocalStorageAllowed) {
                localStorage.removeItem(cacheName);
            }
            return undefined;
        }

        return await cacheStorage.delete(cacheName);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(err);
        return undefined;
    }
}

export const cacheApi = {
    get,
    save,
    clear,
    purge,
    Type,
    CacheNames,
};
