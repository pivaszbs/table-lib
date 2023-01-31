import React, { ReactNode, memo, useCallback, useRef, RefObject, useEffect, useState, useMemo } from 'react';
import classNames from 'classnames/bind';
import ResizeHandle from '../ResizeHandle';
import { ColumnTypesEnum, ColumnSizeData } from '../../types';
import styles from './style.pcss';

const cn = classNames.bind(styles);

const MIN_CELL_WIDTH = 110;

const NOT_RESIZABLE_CELLS: (ColumnTypesEnum | null)[] = [ColumnTypesEnum.ACTIONS, ColumnTypesEnum.CHECKBOX];

interface Props {
    columnTitle: ReactNode;
    index: number;
    isResizable: boolean;
    onResize: (diff: number) => void;
    onResizeEnd: (cellData: ColumnSizeData) => void;
    type?: ColumnTypesEnum | null;
    id?: string;
    initialWidth?: number;
}

const HeaderCell = ({ columnTitle, type = null, isResizable, id = '', onResize, onResizeEnd, initialWidth }: Props) => {
    const headerCellRef: RefObject<HTMLTableCellElement> = useRef(null);
    const prevCellWidth = useRef(0);
    const handleResize = useCallback(
        (movement: number) => {
            const cellWidth = headerCellRef?.current?.offsetWidth || 0;
            const newWidth = cellWidth + movement;
            if (newWidth > MIN_CELL_WIDTH) {
                headerCellRef.current?.style.setProperty('--cell-width', `${newWidth}px`);
                const newCellWidth = headerCellRef?.current?.offsetWidth || 0;
                if (prevCellWidth.current !== newWidth) {
                    onResize(movement);
                }
                prevCellWidth.current = newCellWidth;
            }
        },
        [onResize]
    );
    const handleResizeEnd = useCallback(() => {
        const cellWidth = headerCellRef?.current?.offsetWidth || 0;
        onResizeEnd({
            id,
            size: cellWidth,
        });
    }, [onResizeEnd]);
    useEffect(() => {
        const currentWidth = initialWidth || headerCellRef.current?.offsetWidth;
        if (currentWidth) {
            headerCellRef.current?.style.setProperty('--cell-width', `${currentWidth}px`);
        }
    }, []);
    const isCellResizable = useMemo(() => isResizable && !NOT_RESIZABLE_CELLS.includes(type), [isResizable, type]);
    const isServiceCell = useMemo(() => isResizable && NOT_RESIZABLE_CELLS.includes(type), [isResizable, type]);

    return (
        <td
            ref={headerCellRef}
            className={cn('header-cell', {
                'resizable-cell': isCellResizable,
                'service-table-cell': isServiceCell,
            })}
        >
            {columnTitle}
            {isCellResizable && <ResizeHandle onMove={handleResize} onResizeEnd={handleResizeEnd} />}
        </td>
    );
};

export default memo(HeaderCell);
