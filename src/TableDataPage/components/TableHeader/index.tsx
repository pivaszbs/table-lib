import { useI18N } from '@yandex-int/i18n/lib/react';
import { Box, Button, Text, Tooltip } from '@yandex-levitan/b2b';
import React, { memo, ReactNode } from 'react';
import * as keyset from '../../TableDataPage.i18n';
import { PADDING_BETWEEN_HEADER_BUTTONS } from '../../constants';
import { ChipType, ColumnsMeta } from '../../types';

import styles from './style.pcss';
import Spinner from '../Spinner';

export interface Props {
    withoutClearFiltersButton: boolean;
    title?: string;
    activeFilters?: ChipType[];
    onClear?: () => void;
    loading?: boolean;
    onSettingsClick?: () => void;
    headerButtons?: ReactNode[];
    hasTitle?: boolean;
    hasTableSettings?: boolean;
    isAsyncLoading?: boolean;
    columnsMeta?: ColumnsMeta;
    customFilters?: ReactNode[];
}

const TableFooter = ({
    withoutClearFiltersButton,
    title,
    activeFilters,
    onClear,
    onSettingsClick,
    loading = false,
    hasTitle = false,
    hasTableSettings = false,
    isAsyncLoading = false,
    headerButtons = [],
    customFilters = [],
}: Props) => {
    const i18N = useI18N(keyset);

    return (
        <Box padding={3}>
            {hasTitle && (
                <Text size="l" weight="bold">
                    {title}
                </Text>
            )}
            <Box justifyContent="space-between" direction="row" alignItems="center">
                <Box direction="row" alignItems="center">
                    <Box direction="row" alignItems="center" paddingRight={PADDING_BETWEEN_HEADER_BUTTONS}>
                        {headerButtons}
                    </Box>
                    {customFilters}
                </Box>
                <Box direction="row" justifyContent="flex-end" alignItems="center">
                    {isAsyncLoading && <Spinner dataE2e="async_loading_spinner" size="xxs" />}
                    {onClear && !withoutClearFiltersButton && (
                        <Button
                            className={styles['header-button']}
                            onClick={onClear}
                            disabled={!activeFilters?.length || loading}
                            icon="clear"
                            variant="pseudo"
                            data-e2e="reset_table_filters"
                        >
                            {i18N('Сбросить фильтры')}
                        </Button>
                    )}
                    {hasTableSettings && (
                        <Tooltip trigger="hover" content="Настройки таблицы">
                            <Button
                                onClick={onSettingsClick}
                                className={styles['header-button']}
                                variant="pseudo"
                                icon="gear"
                                data-e2e="table_user_settings_button"
                            />
                        </Tooltip>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default memo(TableFooter);
