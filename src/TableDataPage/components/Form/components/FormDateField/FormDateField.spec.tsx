import React from 'react';
import { render } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Store } from '@reatom/core';
import { context } from '@reatom/react';
import { store } from '../../../../../store';
import FormDateField from '.';

describe('FormDateField component', () => {
    const labelText = 'Введите дату';
    const Wrapper = () => {
        const { control } = useForm();

        return (
            <context.Provider value={store as Store}>
                <FormDateField control={control} name="dateField" labelText={labelText} />
            </context.Provider>
        );
    };

    it('renders correctly', () => {
        expect(() => {
            render(<Wrapper />);
        }).not.toThrowError();
    });

    it('has labelText', () => {
        const { getByText } = render(<Wrapper />);

        expect(getByText(labelText)).toBeInTheDocument();
    });
});
