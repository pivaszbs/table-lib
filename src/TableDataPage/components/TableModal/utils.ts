import { FieldValues } from 'react-hook-form';
import { FormFieldType } from '../Form/components/Form';

interface GetFormattedFieldsParams {
    fieldsMapper: Record<string, FormFieldType>;
    formData: FieldValues;
}

export const getFormattedFormValues = ({ fieldsMapper, formData }: GetFormattedFieldsParams) =>
    Object.keys(formData).reduce((prevValue, fieldName) => {
        const value = formData[fieldName];
        if (fieldsMapper[fieldName] === 'multiSelect') {
            if (Array.isArray(value)) {
                const formattedValue = value.map((multiSelectItem) => multiSelectItem.value);

                return {
                    ...prevValue,
                    [fieldName]: formattedValue,
                };
            }

            if (value) {
                return {
                    ...prevValue,
                    [fieldName]: value.value,
                };
            }
        }

        return {
            ...prevValue,
            [fieldName]: value,
        };
    }, {});
