import React, { memo, forwardRef } from 'react';
import noop from 'lodash/noop';
import { Button } from '@yandex-levitan/b2b';
import CalendarIcon from '../CalendarIcon';

interface Props {
    onClick?: () => void;
}

const DatePickerInput = forwardRef<HTMLButtonElement, Props>(({ onClick = noop }: Props, ref) => {
    return (
        <Button type="button" ref={ref} onClick={onClick} size="s" variant="pseudo">
            <CalendarIcon />
        </Button>
    );
});

DatePickerInput.displayName = 'DatePickerInput';
export default memo(DatePickerInput);
