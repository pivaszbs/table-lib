import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { Tooltip, Icon } from '@yandex-levitan/b2b';
import { ActionButton, ButtonAction, Content, DownloadFileAction } from '../../types';
import SmallButton from '../buttons/SmallButton';

import styles from './style.pcss';
import { TableSortOrder } from '../../entities/types';
import { getButtonProps } from './utils';

interface Props {
    isEditMode: boolean;
    buttonData: ActionButton;
    rowIndex: number;
    index: number;
    loading: boolean;
    size: 's' | 'm' | 'l';
    isDropdownButton?: boolean;
    onClick: (actionData: ButtonAction[], rowIndex: number, href?: string) => void;
    selectedRowsData: Content[];
    filter?: string;
    order?: TableSortOrder;
    sort?: string;
    position?: string;
    customFilter?: Record<string, string | boolean>;
    isPending?: boolean;
    isDisabled?: boolean;
}

const TableButtonView = ({
    buttonData,
    rowIndex,
    index,
    onClick,
    isDropdownButton = false,
    loading,
    size,
    selectedRowsData,
    filter,
    order,
    sort,
    position,
    isEditMode,
    customFilter,
    isPending = false,
    isDisabled = false,
}: Props) => {
    const dataE2e = buttonData.dataE2eBase
        ? `${buttonData.dataE2eBase}_row_${rowIndex}`
        : `button_row_${rowIndex}_${position}`;
    const buttonProps = useMemo(
        () =>
            getButtonProps({
                buttonData,
                selectedRowsData,
                filter,
                order,
                sort,
                customFilter,
            }),
        [buttonData, selectedRowsData, order, sort, filter]
    );
    const handleClick = useCallback(
        (event) => {
            if (
                buttonProps.href &&
                !(buttonData.actions?.[0] as DownloadFileAction<Content>).requestOption.isNativeFileFetcher
            ) {
                event.preventDefault();
            }
            onClick(buttonData.actions || [], rowIndex, buttonProps.href);
        },
        [buttonData, rowIndex, onClick, buttonProps.href]
    );

    const buttonVariant = !buttonData.text && buttonData.icon ? 'pseudo' : 'normal';

    const style = useMemo(() => ({ marginLeft: index && !isDropdownButton ? '12px' : 0 }), [index, isDropdownButton]);

    const isButtonDisabled = useMemo(
        () =>
            isDisabled ||
            Boolean(buttonData.checkDisableWithRowData && buttonData.checkDisableWithRowData(selectedRowsData)) ||
            Boolean(buttonData.isDisabledWithoutItems && !selectedRowsData.length) ||
            loading ||
            (isEditMode && Boolean(buttonData.isDisableInEditMode)) ||
            (!isEditMode && Boolean(buttonData.isDisableInReadMode)),
        [loading, buttonData, selectedRowsData, isEditMode]
    );

    const tooltipContent = useMemo(
        () => (buttonData.title ? <div className={styles.tooltipWrapper}>{buttonData.title}</div> : ''),
        [buttonData]
    );

    return (
        <Tooltip trigger="hover" content={tooltipContent} position={buttonData.tooltipPosition || 'bottom'}>
            <SmallButton
                data-e2e={dataE2e}
                size={size}
                disabled={isButtonDisabled}
                onClick={handleClick}
                style={style}
                variant={buttonVariant}
                state={isPending ? 'pending' : 'normal'}
                {...buttonProps}
            >
                {buttonData.icon && (
                    <Icon size={buttonData.iconSize || size} color={buttonData.iconColor} name={buttonData.icon} />
                )}
                {buttonData.text}
            </SmallButton>
        </Tooltip>
    );
};

export default memo(TableButtonView);
