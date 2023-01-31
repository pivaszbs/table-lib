import React, { memo } from 'react';
import { Row, Spacer, Button } from '@yandex-levitan/b2b';
import Form, { FormField } from '../../components/Form/components/Form';
import Text from '../Text';
import { Nullable } from '../../types';
import ModalWindow from '../ModalWindow';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onReset: () => void;
    onSubmit: (formData: Record<string, boolean>) => void;
    onDragSave: (fields: string[]) => void;
    initialValue: Nullable<Record<string, boolean>>;
    fields: FormField[];
}

const USER_SETTINGS_FORM = 'userSettingsForm';

const TableSettingsModal = ({ isOpen, onClose, onReset, onSubmit, initialValue, fields, onDragSave }: Props) => {
    return (
        <ModalWindow isOpen={isOpen} onClose={onClose}>
            <Text paddingBottom={4} size="l">
                Выберите отображаемые столбцы или поменяйте их порядок
            </Text>
            <Form
                initialFormData={initialValue}
                fields={fields}
                onSubmit={onSubmit}
                formId={USER_SETTINGS_FORM}
                onDragSave={onDragSave}
                draggable={true}
            />
            <Row>
                <Button variant="action" form={USER_SETTINGS_FORM}>
                    Сохранить
                </Button>
                <Spacer size={4} />
                <Button onClick={onReset} type="button">
                    Сбросить настройки
                </Button>
                <Spacer size={4} />
                <Button onClick={onClose} type="button">
                    Отмена
                </Button>
            </Row>
        </ModalWindow>
    );
};

export default memo(TableSettingsModal);
