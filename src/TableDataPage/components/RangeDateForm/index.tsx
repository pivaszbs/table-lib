import React, { useCallback, useMemo, useState, memo } from 'react';
import { Row, Spacer, Switch, Box, Button } from '@yandex-levitan/b2b';
import Form from '../Form/components/Form';

import { dateTimeFields, dateFields, singleDateForm, DEFAULT_END_TIME, DEFAULT_START_TIME } from './constants';
import { Props, DateRangeForm, FormData } from './types';
import { getDateRangeInitialData, getDateTimeRangeValue, getDateRangeValue } from './utils';
import Text from '../Text';

const RangeDateForm = ({
    onSubmit,
    onClose,
    formId,
    initialData,
    hasSingleDateOption,
    isSingleDateActive,
    type,
}: Props) => {
    const [isRangeSettingActive, setRangeSetting] = useState(!isSingleDateActive || !hasSingleDateOption);
    const fields = useMemo(() => {
        if (isRangeSettingActive) {
            if (type === 'DateTimeField') {
                return dateTimeFields;
            }
            return dateFields;
        }

        return singleDateForm;
    }, [type, isRangeSettingActive]);
    const formattedInitialData = useMemo(
        () =>
            getDateRangeInitialData({
                initialData,
                type,
                isRangeSettingActive,
            }),
        [initialData, type, isRangeSettingActive]
    );
    const handleSubmit = useCallback(
        (value: DateRangeForm | FormData) => {
            if (!isRangeSettingActive) {
                const { date } = (value as DateRangeForm).from;
                const { time } = (value as DateRangeForm).from;
                if (time) {
                    onSubmit({
                        from: `${date} ${time}:00`,
                        to: `${date} ${time}:59`,
                    });
                } else {
                    onSubmit({
                        from: `${date} ${DEFAULT_START_TIME}`,
                        to: `${date} ${DEFAULT_END_TIME}`,
                    });
                }
            } else if (type === 'DateTimeField') {
                const dateTimeRange = getDateTimeRangeValue(value as DateRangeForm);

                onSubmit(dateTimeRange);
            } else {
                onSubmit(getDateRangeValue(value as FormData));
            }
        },
        [onSubmit, type, isRangeSettingActive]
    );
    const handleModeChange = useCallback(
        (value: boolean) => {
            setRangeSetting(value);
        },
        [onSubmit, type]
    );
    const title = isRangeSettingActive ? 'Введите временной интервал' : 'Выберите дату';

    return (
        <Box>
            <Text paddingBottom={4} size="xl">
                {title}
            </Text>
            <Form
                key={String(isRangeSettingActive)}
                initialFormData={formattedInitialData}
                fields={fields}
                onSubmit={handleSubmit}
                formId={formId}
            />
            <Spacer size={4} />
            {hasSingleDateOption && (
                <Box paddingY={2}>
                    <Switch
                        data-e2e="date_range_filter_switch"
                        checked={isRangeSettingActive}
                        // @ts-ignore
                        onChange={handleModeChange}
                        label="Задать дипазон"
                    />
                </Box>
            )}
            <Row gap={4}>
                <Button data-e2e="save_date_filter" variant="action" form={formId}>
                    Сохранить
                </Button>
                <Button data-e2e="cancel_date_filter" onClick={onClose} type="button">
                    Отмена
                </Button>
            </Row>
        </Box>
    );
};

export default memo(RangeDateForm);
