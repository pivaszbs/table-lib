import React, { memo, useCallback, useState, useEffect, KeyboardEvent } from 'react';
import TextField from '../LargeTextField';

interface Props {
    initialValue: string;
    onInputFinish: (value: string) => void;
    onChange: (value: string) => void;
    dataE2e?: string;
    hasTableEditMode: boolean;
    isDisabled?: boolean;
    inputType?: 'number' | 'text';
}

const CellTextField = ({
    initialValue,
    onInputFinish,
    onChange,
    dataE2e = '',
    hasTableEditMode,
    isDisabled = false,
    inputType = 'text',
}: Props) => {
    const handleInputFinish = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter' && !hasTableEditMode) {
                onInputFinish(initialValue);
            }
        },
        [onInputFinish, hasTableEditMode, initialValue]
    );

    return (
        <TextField
            disabled={isDisabled}
            data-e2e={dataE2e}
            onChange={onChange}
            value={initialValue}
            onKeyPress={handleInputFinish}
            hasLowerCase
            size="s"
            hasAutoSelect={false}
            type={inputType}
        />
    );
};

export default memo(CellTextField);
