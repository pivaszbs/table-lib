import { FormField } from '../Form/components/Form';

export const dateFields: FormField[] = [
    {
        type: 'dateField',
        props: {
            name: 'from',
            labelText: 'Начало',
            withPortal: false,
            popperPlacement: 'left',
            validationSchema: 'dateRange',
            isCompactDate: true,
            dataE2e: 'filter_from_date_input',
        },
    },

    {
        type: 'dateField',
        props: {
            name: 'to',
            labelText: 'Конец',
            withPortal: false,
            popperPlacement: 'left',
            validationSchema: 'dateRange',
            isCompactDate: true,
            dataE2e: 'filter_to_date_input',
        },
    },
];

export const singleDateForm: FormField[] = [
    {
        type: 'dateTimeField',
        props: {
            name: 'from',
            labelText: 'Дата',
            withPortal: false,
            popperPlacement: 'left',
            isCompactDate: true,
            validationSchema: 'onlyDateRequired',
            dataE2e: 'filter_date_time_input',
        },
    },
];

export const dateTimeFields: FormField[] = [
    {
        type: 'dateTimeField',
        props: {
            name: 'from',
            labelText: 'Начало',
            withPortal: false,
            popperPlacement: 'right',
            validationSchema: 'dateTimeRange',
            isCompactDate: true,
            dataE2e: 'filter_from_date_time_input',
        },
    },

    {
        type: 'dateTimeField',
        props: {
            name: 'to',
            labelText: 'Конец',
            withPortal: false,
            popperPlacement: 'right',
            validationSchema: 'dateTimeRange',
            isCompactDate: true,
            dataE2e: 'filter_to_date_time_input',
        },
    },
];

export const DEFAULT_START_TIME = '00:00:00';
export const DEFAULT_END_TIME = '23:59:59';
