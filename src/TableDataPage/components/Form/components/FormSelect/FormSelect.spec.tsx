import React from 'react';
import { render } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Store } from '@reatom/core';
import { context } from '@reatom/react';
import { store } from '../../../../../store';
import FormSelect from '.';

describe('FormSelect component', () => {
    const labelText = 'Выберите нужный вариант';
    const Wrapper = () => {
        const { control } = useForm();

        return (
            <context.Provider value={store as Store}>
                <FormSelect
                    control={control}
                    name="selectField"
                    labelText={labelText}
                    defaultValue="1"
                    options={[
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
                    ]}
                />
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
