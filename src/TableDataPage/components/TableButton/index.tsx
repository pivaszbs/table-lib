import React, { memo, useState, useCallback, useRef, useMemo } from 'react';
import { Box } from '@yandex-levitan/b2b';
import classNames from 'classnames/bind';
import { ButtonAction, DropdownButtonOpeningEnum } from '../../types';
import { useClickOutside } from '../../entities/hooks';
import TableButtonView from '../TableButtonView';
import styles from './style.pcss';
import { Props } from './types';

const cn = classNames.bind(styles);

const TableButton = ({
    buttonData,
    rowIndex,
    index,
    onClick,
    loading = false,
    size = 'm',
    selectedRowsData,
    filter,
    order,
    sort,
    position,
    isEditMode = false,
    customFilter,
    buttonsPendingState,
}: Props) => {
    const [isDropdownVisible, setDropdownVisibility] = useState(false);
    const dropdownRef = useRef(null);
    const hasDropdown = Boolean(buttonData.dropdownButtons);
    const handleClick = useCallback(
        (actionData: ButtonAction[], buttonRowIndex: number, href?: string) => {
            if (buttonData.dropdownButtons) {
                setDropdownVisibility(!isDropdownVisible);
            }

            onClick(actionData, buttonRowIndex, href, buttonData.uniqueId);
        },
        [hasDropdown, isDropdownVisible, onClick, buttonData]
    );
    useClickOutside(dropdownRef, () => setDropdownVisibility(false));
    const isRight = hasDropdown && buttonData.dropdownButtons?.opening === DropdownButtonOpeningEnum.RIGHT;
    const isPending = buttonData.uniqueId !== undefined && Boolean(buttonsPendingState[buttonData.uniqueId]);
    const dropdownButtons = useMemo(
        () =>
            buttonData.dropdownButtons &&
            buttonData.dropdownButtons.buttonsList.filter(
                ({ checkVisibilityWithRowData }) =>
                    !checkVisibilityWithRowData || checkVisibilityWithRowData(selectedRowsData)
            ),
        [selectedRowsData, buttonData]
    );
    const isDisabledWithoutButtons = Boolean(hasDropdown && !dropdownButtons?.length);
    const isRootButtonVisible = useMemo(
        () => !buttonData.checkVisibilityWithRowData || buttonData.checkVisibilityWithRowData(selectedRowsData),
        [buttonData, selectedRowsData]
    );

    return !isRootButtonVisible || (isDisabledWithoutButtons && buttonData.isHideWithoutDropdownButtons) ? null : (
        <Box position="relative" direction="row" backgroundColor="#f7f7f7">
            <TableButtonView
                isEditMode={isEditMode}
                onClick={handleClick}
                buttonData={buttonData}
                size={size}
                index={index}
                rowIndex={rowIndex}
                selectedRowsData={selectedRowsData}
                loading={loading}
                filter={filter}
                order={order}
                sort={sort}
                position={position}
                customFilter={customFilter}
                isPending={isPending}
                isDisabled={isDisabledWithoutButtons}
            />
            {dropdownButtons && Boolean(dropdownButtons.length) && isDropdownVisible && (
                <div
                    ref={dropdownRef}
                    className={cn('dropdown', {
                        'dropdown--left': !isRight,
                        'dropdown--right': isRight,
                    })}
                >
                    {dropdownButtons.map((dropdownButtonData, buttonIndex) => (
                        <TableButtonView
                            isEditMode={isEditMode}
                            isDropdownButton
                            key={`dropdownButton_${buttonIndex}`}
                            onClick={handleClick}
                            index={buttonIndex}
                            rowIndex={rowIndex}
                            buttonData={dropdownButtonData}
                            size={size}
                            selectedRowsData={selectedRowsData}
                            loading={loading}
                            filter={filter}
                            order={order}
                            sort={sort}
                            position={`${position}_dropdownButton_${buttonIndex}`}
                            customFilter={customFilter}
                            isPending={isPending}
                        />
                    ))}
                    <div
                        className={cn('arrow', {
                            'arrow--left': !isRight,
                            'arrow--right': isRight,
                        })}
                    />
                </div>
            )}
        </Box>
    );
};

export default memo(TableButton);
