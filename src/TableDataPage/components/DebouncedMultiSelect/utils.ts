import { SelectorItem } from '../DynamicSelect/types';

export const getSelectLabels = (value: string[] | SelectorItem[] = []): string[] => {
    if (!value.length) {
        return value as string[];
    }
    if (typeof value[0] === 'string') {
        return value as string[];
    }

    return (value as SelectorItem[]).map(({ label }) => label);
};
