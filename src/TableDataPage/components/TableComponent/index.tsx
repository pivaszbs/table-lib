/* eslint-disable max-lines */
import React, { useCallback, useMemo, useState, useEffect, useRef, RefObject, memo } from 'react';
import { Box, Text, Preloader, TableHead, TableBody, Registry, Button } from '@yandex-levitan/b2b';
import throttle from 'lodash/throttle';
import { css } from 'reshadow';
import classNames from 'classnames/bind';
import { InView } from 'react-intersection-observer';
import Table from '../Table';
import { PaginationTypesEnum, TableDataCache, ColumnSizeData, ContentField } from '../../types';
import HeaderCell from '../HeaderCell';
import BodyCell from '../BodyCell';

import { Props } from './types';
import styles from './style.pcss';

const cn = classNames.bind(styles);

const ToTopButton = Registry.styled(
    Button,
    css`
        Clickable[|size][|size='l'] {
            padding: 24px 30px;
            border-radius: 50%;
        }
    `
);

const limit = 15;
const observerItem = limit / 3;

const TableComponent = ({
    loading,
    loadNext,
    data,
    tableRef,
    keyFinder,
    rowUniqueField,
    emptyListMessage,
    pagination,
    isResizable,
    renderCounter,
    columnsMeta,
    cachedData,
    onResize,
    dataList,
    canNext,
}: Props) => {
    const [isToTopVisible, setToTopVisibility] = useState(false);
    const isTableEmpty = useMemo(() => data.values.length === 0, [data.values]);
    const tableWrapperRef: RefObject<HTMLDivElement> = useRef(null);
    const handleResize = useCallback(
        (diff: number) => {
            const tableElement = tableWrapperRef.current?.getElementsByTagName('table')[0];
            const currentWidth = tableElement?.offsetWidth;
            if (currentWidth) {
                const newWidth = currentWidth + diff;
                tableWrapperRef?.current?.style.setProperty('--table-width', `${newWidth}px`);
            }
        },
        [cachedData]
    );
    const handleResizeEnd = useCallback(
        ({ size, id }: ColumnSizeData) => {
            const tableElement = tableWrapperRef.current?.getElementsByTagName('table')[0];
            const currentWidth = tableElement?.offsetWidth;
            if (currentWidth) {
                const cachedColumnsWidth = cachedData.columnsWidth || {};
                const newCache: TableDataCache = {
                    ...cachedData,
                    tableWidth: currentWidth,
                    columnsWidth: {
                        ...cachedColumnsWidth,
                        [id]: size,
                    },
                };
                onResize(newCache);
            }
        },
        [cachedData]
    );
    // eslint-disable-next-line consistent-return
    useEffect(() => {
        if (isResizable) {
            const resizeObserver = new ResizeObserver(() => {
                const cachedWidth = cachedData.tableWidth;
                const tableElement = tableWrapperRef.current?.getElementsByTagName('table')[0];
                const tableWidth = cachedWidth || tableElement?.offsetWidth;
                const currentWidth =
                    tableWidth &&
                    tableWrapperRef.current?.offsetWidth &&
                    tableWrapperRef.current.offsetWidth < tableWidth
                        ? tableWidth
                        : tableWrapperRef.current?.offsetWidth;
                if (tableElement && currentWidth) {
                    tableWrapperRef.current?.style.setProperty('--table-width', `${currentWidth}px`);
                }
            });
            if (tableWrapperRef.current) {
                resizeObserver.observe(tableWrapperRef.current);

                return () => resizeObserver.unobserve(tableWrapperRef.current as HTMLElement);
            }
        }
    }, [renderCounter]);
    const handleScroll = useCallback(
        ({ wheelDeltaY }) => {
            const atButtom =
                tableRef?.current &&
                tableRef.current.offsetHeight + tableRef.current.scrollTop >= tableRef.current.scrollHeight;
            if (
                (wheelDeltaY > 0 || atButtom) &&
                !isToTopVisible &&
                tableRef?.current &&
                tableRef.current.scrollTop > 0
            ) {
                setToTopVisibility(true);
            } else if (wheelDeltaY < 0 && isToTopVisible && !atButtom) {
                setToTopVisibility(false);
            }
        },
        [isToTopVisible]
    );
    const throttledHandleScroll = useCallback(throttle(handleScroll, 500), [handleScroll]);
    // @ts-ignore
    const handleScrollTop = useCallback(() => tableRef?.current.scrollTo({ top: 0, behavior: 'smooth' }), []);

    useEffect(() => {
        tableRef?.current?.addEventListener('wheel', throttledHandleScroll);
        return () => tableRef?.current?.removeEventListener('wheel', throttledHandleScroll);
    }, [throttledHandleScroll]);

    return (
        <div
            ref={tableWrapperRef}
            className={cn('table-wrapper', {
                'table-wrapper--resizable': isResizable,
            })}
        >
            <Preloader pending={loading} data-e2e={loading ? 'enabled_table_preloader' : 'disabled_table_preloader'}>
                <Table hasFixedHeader key={`${renderCounter}`}>
                    <TableHead
                        className={cn('table-header', {
                            'table-header--resizable': isResizable,
                        })}
                    >
                        <tr>
                            {data.titles.map((columnTitle, index) => {
                                const headerCellId = columnsMeta[index]?.id || '';
                                const initialWidth = cachedData.columnsWidth && cachedData.columnsWidth[headerCellId];

                                return (
                                    <HeaderCell
                                        isResizable={isResizable}
                                        type={columnsMeta[index]?.type}
                                        onResize={handleResize}
                                        onResizeEnd={handleResizeEnd}
                                        key={`headerCell_${index}`}
                                        id={headerCellId}
                                        index={index}
                                        columnTitle={columnTitle}
                                        initialWidth={initialWidth}
                                    />
                                );
                            })}
                        </tr>
                    </TableHead>
                    <TableBody className={cn('table-body')}>
                        {data.values.map((rowItems, i) => {
                            let rowKey: ContentField;

                            if (rowUniqueField && dataList && dataList[i][rowUniqueField]) {
                                rowKey = dataList[i][rowUniqueField];
                            } else if (keyFinder) {
                                rowKey = keyFinder(rowItems);
                            } else {
                                rowKey = `row_${i}`;
                            }
                            const bodyCells = rowItems.map((rowItem, cellIndex) => {
                                return (
                                    <BodyCell
                                        key={`cell_${cellIndex}`}
                                        hasEllipsis={columnsMeta[cellIndex]?.hasEllipsis}
                                        isMultiline={columnsMeta[cellIndex]?.isMultilineText}
                                        dataE2e={`${columnsMeta[cellIndex]?.id || ''}_cell_${rowKey}`}
                                    >
                                        {rowItem}
                                    </BodyCell>
                                );
                            });

                            if (i === data.values.length - observerItem) {
                                return (
                                    <React.Fragment key={`${rowKey}`}>
                                        {/* @ts-ignore */}
                                        <InView
                                            as="tr"
                                            onChange={(inView) =>
                                                inView &&
                                                pagination?.type === PaginationTypesEnum.ENDLESS_SCROLL &&
                                                canNext &&
                                                loadNext?.()
                                            }
                                        />
                                        <tr data-e2e={`row_${rowKey}`}>{bodyCells}</tr>
                                    </React.Fragment>
                                );
                            }

                            return (
                                <tr key={`${rowKey}`} data-e2e={`row_${rowKey}`}>
                                    {bodyCells}
                                </tr>
                            );
                        })}
                    </TableBody>
                </Table>
            </Preloader>
            {tableRef && pagination?.type === PaginationTypesEnum.ENDLESS_SCROLL && isToTopVisible && (
                <Box position="fixed" right="60px" bottom="20px">
                    <ToTopButton onClick={handleScrollTop} size="l" icon="arrowUp" variant="pseudo" />
                </Box>
            )}
            {isTableEmpty && !loading && <Text size="l">{emptyListMessage}</Text>}
        </div>
    );
};

export default memo(TableComponent);
