import { Box } from '@yandex-levitan/b2b';
import React, { KeyboardEvent, memo, MouseEvent, useCallback, useEffect, useState } from 'react';
import DynamicSelect from '../DynamicSelect';
import TextField from '../LargeTextField';
import { SelectorItem } from '../DynamicSelect/types';
import { NumbersRangeEnum } from '../../entities/constants';
import { RangeFilter } from '../../entities/types';

import { DEFAULT_MODE, SELECT_ITEMS } from './constants';
import { getFormattedRange, getRangeValue } from './utils';

type Props = {
    initialValues: Record<string, string>;
    id: string;
    onChange: (range: RangeFilter | string) => void;
    dataE2e?: string;
};

const NumberRangeFilter = ({ initialValues, id, onChange, dataE2e = '' }: Props) => {
    const [currentMode, setMode] = useState<SelectorItem>(DEFAULT_MODE);
    const [value, setValue] = useState('');
    const handleModeChange = useCallback(
        (mode: SelectorItem | null) => {
            if (mode) {
                setMode(mode);
                if (mode && value) {
                    const rangeValue = getRangeValue(value, mode.value as NumbersRangeEnum);
                    onChange(rangeValue);
                }
            }
        },
        [value, onChange]
    );
    const handleNumberValueChange = useCallback((inputValue: string) => setValue(inputValue), []);
    const handleInputClick = useCallback((event: MouseEvent) => event.stopPropagation(), []);
    const handleEnterPress = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                const rangeValue = getRangeValue(value, currentMode.value as NumbersRangeEnum);
                onChange(rangeValue);
            }
        },
        [currentMode, value]
    );
    const handleClick = useCallback((event: MouseEvent) => {
        event.stopPropagation();
    }, []);
    useEffect(() => {
        const { mode, value: initialValue } = getFormattedRange(initialValues, id);
        setMode(mode);
        setValue(initialValue);
    }, [initialValues, id]);

    return (
        <Box direction="row">
            <Box flex={2}>
                <DynamicSelect
                    value={currentMode}
                    items={SELECT_ITEMS}
                    onChange={handleModeChange}
                    size="s"
                    withoutArrowButton
                    onClick={handleClick}
                    dataE2e={`${dataE2e}_operator`}
                />
            </Box>
            <Box flex={5} paddingLeft="1">
                <TextField
                    type="number"
                    onKeyPress={handleEnterPress}
                    onChange={handleNumberValueChange}
                    onClick={handleInputClick}
                    value={value}
                    size="s"
                    data-e2e={`${dataE2e}_value_input`}
                />
            </Box>
        </Box>
    );
};

export default memo(NumberRangeFilter);
