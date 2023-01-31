import React from 'react';
import { render } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Store } from '@reatom/core';
import { context } from '@reatom/react';
import { store } from '../../../../../store'; // TODO: Add
import FormTextField from '.';

describe('FormTextField component', () => {
    const labelText = 'Введите текст';
    const Wrapper = () => {
        const { control } = useForm();

        return (
            <context.Provider value={store as Store}>
                <FormTextField control={control} name="inputField" labelText={labelText} />
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
