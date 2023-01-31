import { ColumnConfig } from '../../../types';
import { FormField } from '../../../components/Form/components/Form';

export const getTableSettingsFormData = (columns: ColumnConfig[]): FormField[] =>
    columns.map(({ id, title, canNotBeHiddenByUser, titleForUserSettings }) => ({
        type: 'checkbox',
        props: {
            name: id,
            labelText: titleForUserSettings || title || '',
            required: true,
            size: 'm',
            disabled: Boolean(canNotBeHiddenByUser),
        },
    }));
