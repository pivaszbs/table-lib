import React, { memo, useCallback } from 'react';
import { Switch, Box } from '@yandex-levitan/b2b';
import { CustomFilter } from '../../types';
import { PADDING_BETWEEN_HEADER_BUTTONS } from '../../constants';

interface Props {
    filterData: CustomFilter;
    onChange: (filterData: CustomFilter, value: boolean) => void;
    isActive: boolean;
    isDisable: boolean;
    index: number;
}

const CustomFilterSwitсh = ({ filterData, onChange, isActive, isDisable, index }: Props) => {
    const dataE2e = filterData.dataE2e ? `${filterData.dataE2e}_$index}` : `header_filter_${index}`;
    const handleChange = useCallback(
        (value: boolean) => {
            onChange(filterData, value);
        },
        [onChange, filterData]
    );
    const paddingLeft = index && PADDING_BETWEEN_HEADER_BUTTONS;

    return (
        <Box paddingLeft={paddingLeft}>
            <Switch
                data-e2e={dataE2e}
                disabled={isDisable}
                checked={isActive}
                // @ts-ignore
                onChange={handleChange}
                label={filterData.readableName}
            />
        </Box>
    );
};

export default memo(CustomFilterSwitсh);
