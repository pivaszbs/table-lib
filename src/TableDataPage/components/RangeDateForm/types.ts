import { ColumnType } from '../../types';
import { DateTimeValue } from '../DateTimeField';

export interface DateRangeForm {
    from: DateTimeValue;
    to: DateTimeValue;
    singleDate?: DateTimeValue;
}

export interface FormData {
    from?: string;
    to?: string;
    isStrictFrom?: boolean;
    isStrictTo?: boolean;
}

export interface Props {
    onSubmit: (value: FormData | string) => void;
    onClose: () => void;
    formId: string;
    hasSingleDateOption: boolean;
    isSingleDateActive: boolean;
    initialData: DateRangeForm;
    type: ColumnType;
}
