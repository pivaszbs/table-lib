import React, { ReactNode, memo, useCallback, useRef, RefObject, useEffect, useState, useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from './style.pcss';

const cn = classNames.bind(styles);

interface Props {
    children: ReactNode;
    hasEllipsis?: boolean;
    isMultiline?: boolean;
    dataE2e: string;
}

const BodyCell = ({ children, hasEllipsis = false, isMultiline = false, dataE2e }: Props) => {
    const content = useMemo(
        () => (hasEllipsis ? <div className={cn('ellipsis-content')}>{children}</div> : children),
        [children, hasEllipsis]
    );

    return (
        <td
            className={cn('body-cell', {
                'multiline-cell': isMultiline,
            })}
            data-e2e={dataE2e}
        >
            {content}
        </td>
    );
};

export default memo(BodyCell);
