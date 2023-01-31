import React, { memo, MouseEvent, useEffect, useRef, useCallback } from 'react';
import throttle from 'lodash/throttle';

import styles from './style.pcss';

interface Props {
    onMove: (value: number) => void;
    onResizeEnd: () => void;
}

const ResizeHandle = ({ onMove, onResizeEnd }: Props) => {
    const initialMousePosition = useRef(0);
    const handleMouseMove = useCallback(
        (event: any) => {
            onMove(event.clientX - initialMousePosition.current);
            initialMousePosition.current = event.clientX;
        },
        [onMove]
    );
    const throttledResize = useCallback(throttle(handleMouseMove, 50), [handleMouseMove]);
    const handleMouseUp = useCallback(
        (event: any) => {
            event.stopPropagation();
            document.removeEventListener('mousemove', throttledResize);
            onResizeEnd();
        },
        [throttledResize]
    );
    const handleMouseDown = useCallback(
        (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            initialMousePosition.current = event.clientX;
            document.addEventListener('mousemove', throttledResize);
            document.addEventListener('mouseup', handleMouseUp);
        },
        [throttledResize, handleMouseUp]
    );
    useEffect(
        () => () => {
            document.removeEventListener('mousemove', throttledResize);
            document.removeEventListener('mouseup', handleMouseUp);
        },
        [throttledResize, handleMouseUp]
    );

    return <div onMouseDown={handleMouseDown} className={styles['resize-handle']} />;
};

export default memo(ResizeHandle);
