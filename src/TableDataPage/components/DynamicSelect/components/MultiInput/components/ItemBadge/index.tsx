import React, { memo, useCallback, MouseEvent } from 'react';
import { Text, Icon } from '@yandex-levitan/b2b';

import styles from './style.pcss';
import { SelectorItem } from '../../../../types';

interface MultiInputProps<T extends SelectorItem | string> {
    item: T;
    disabled?: boolean;
    onItemExclude: (item: T) => void;
}

const ItemBadge = <T extends SelectorItem | string>({ item, disabled, onItemExclude }: MultiInputProps<T>) => {
    const handleSelectCancel = useCallback(
        (event: MouseEvent) => {
            onItemExclude(item);
            event.stopPropagation();
        },
        [item, onItemExclude]
    );

    const label = typeof item === 'string' ? item : item.label;

    return (
        <div className={styles['item-bage']}>
            <div className={styles['text-wrapper']}>
                <Text>{label}</Text>
            </div>
            <button type="button" className={styles['exclude-button']} onClick={handleSelectCancel} disabled={disabled}>
                <Icon name="cross" size="s" color="black" />
            </button>
        </div>
    );
};

export default memo(ItemBadge) as typeof ItemBadge;
