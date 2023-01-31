/* eslint-disable max-lines */
import React from 'react';
import { format, addDays } from 'date-fns';
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import { string, date } from 'yup';
import { Store } from '@reatom/core';
import { context } from '@reatom/react';
import { store } from '../../../../../store';
import Form, { FormField } from '.';

describe('Form component', () => {
    const formId = 'formId';
    const fields: FormField[] = [
        {
            type: 'textField',
            props: {
                name: 'textField',
                labelText: 'Текстовое поле',
                validationSchema: string().min(5, 'Length should be at least 5'),
            },
        },
        {
            type: 'checkbox',
            props: {
                name: 'checkbox',
                labelText: 'Чекбокс',
            },
        },
        {
            type: 'select',
            props: {
                name: 'select',
                labelText: 'Селект',
                defaultValue: '1',
                options: [
                    {
                        label: 'Option 1',
                        value: '1',
                    },
                    {
                        label: 'Option 2',
                        value: '2',
                    },
                    {
                        label: 'Option 3',
                        value: '3',
                    },
                ],
            },
        },
        {
            type: 'dateField',
            props: {
                name: 'dateField',
                labelText: 'Выбор даты',
                validationSchema: date().min(new Date(), 'There is disallowed to choose date in the past'),
            },
        },
    ];

    const Wrapper = ({ onSubmit = jest.fn() }: { onSubmit?: ReturnType<typeof jest.fn> }) => {
        return (
            <context.Provider value={store as Store}>
                <Form formId={formId} fields={fields} onSubmit={onSubmit} />
            </context.Provider>
        );
    };

    it('renders correctly', () => {
        expect(() => {
            render(<Wrapper />);
        }).not.toThrowError();
    });

    it('renders every field', () => {
        const { getByLabelText } = render(<Wrapper />);

        fields.forEach(({ props: { labelText } }) => {
            expect(getByLabelText(labelText as string)).toBeInTheDocument();
        });
    });

    it('form can be submitted with correct data', async () => {
        const onSubmit = jest.fn();
        const { findByLabelText, findByRole } = render(<Wrapper onSubmit={onSubmit} />);

        const input = (await findByLabelText('Текстовое поле')) as HTMLInputElement;

        act(() => {
            fireEvent.change(input, { target: { value: 'Some text' } });
        });

        expect(input).toHaveValue('SOME TEXT');

        const checkbox = (await findByLabelText('Чекбокс')) as HTMLInputElement;

        act(() => {
            fireEvent.click(checkbox);
        });

        expect(checkbox).toBeChecked();

        const select = (await findByLabelText('Селект')) as HTMLInputElement;

        act(() => {
            fireEvent.change(select, { target: { value: '2' } });
        });

        expect(select).toHaveValue('2');

        const dateField = (await findByLabelText('Выбор даты')) as HTMLInputElement;

        const dateValue = addDays(new Date(), 30);
        const formattedDateValue = format(dateValue, 'dd.MM.yyyy');

        act(() => {
            fireEvent.change(dateField, { target: { value: formattedDateValue } });
        });

        expect(dateField).toHaveValue(formattedDateValue);

        const form = await findByRole('form');

        await waitFor(() => {
            fireEvent.submit(form);
        });

        expect(onSubmit).toBeCalledWith({
            textField: 'SOME TEXT',
            checkbox: true,
            select: '2',
            dateField: format(dateValue, 'yyyy-MM-dd'),
        });
    });

    it('form fields can be validated', async () => {
        const { getByLabelText, getByText } = render(<Wrapper />);

        await waitFor(() => {
            getByLabelText('Текстовое поле');
            getByLabelText('Выбор даты');
        });

        const input = getByLabelText('Текстовое поле') as HTMLInputElement;

        act(() => {
            fireEvent.change(input, { target: { value: 'Some' } });
        });

        await waitFor(() => {
            getByText('Length should be at least 5');
        });

        const textFieldError = getByText('Length should be at least 5');

        expect(textFieldError).toBeInTheDocument();

        const dateField = getByLabelText('Выбор даты') as HTMLInputElement;

        act(() => {
            fireEvent.change(dateField, { target: { value: '21.03.2021' } });
        });

        await waitFor(() => {
            getByText('There is disallowed to choose date in the past');
        });

        const dateFieldError = getByText('There is disallowed to choose date in the past');

        expect(dateFieldError).toBeInTheDocument();
    });
});
