import { Spinner as BaseSpinner } from '@yandex-levitan/b2b';
import React from 'react';
import styles from './style.pcss';
import { PartialBy } from '../../types';

type Props = PartialBy<React.ComponentProps<typeof BaseSpinner>, 'size'> & { dataE2e?: string };

const Spinner = ({ size = 'l', dataE2e = '', ...props }: Props) => (
    <div className={styles.wrapper} data-e2e={dataE2e}>
        <BaseSpinner size={size} {...props} />
    </div>
);

export default Spinner;
