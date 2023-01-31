/* eslint-disable max-lines */
import React, { useCallback, useMemo } from 'react';
import { FieldValues } from 'react-hook-form';
import { Row, Text, Box, Button } from '@yandex-levitan/b2b';
import { ModalContentTypesEnum, ActionsEnum } from '../../types';
import Form from '../Form/components/Form';
import { Props } from './types';
import { getFormattedFormValues } from './utils';
import ModalWindow from '../ModalWindow';

const TABLE_ID = 'tableModalForm';

const TableModal = ({
    isOpen,
    isHeaderAction,
    rowIndex,
    modalAction,
    dictionaries,
    isPending,
    customComponent,
    onClick,
    selectedRowsData,
}: Props) => {
    const modalTitle = modalAction?.modalTitle;
    const modalFormData = useMemo(() => {
        if (modalAction?.modalContent?.type === ModalContentTypesEnum.FORM) {
            let formFieldsConfig = modalAction?.modalContent?.formFields;
            if (modalAction?.modalContent?.formFieldsConfigResolver) {
                formFieldsConfig = modalAction.modalContent.formFieldsConfigResolver({ selectedRowsData });
            }
            if (formFieldsConfig) {
                const formFields = formFieldsConfig.map((formField) => {
                    if (
                        (formField.type === 'select' || formField.type === 'multiSelect') &&
                        formField.listItemsDictionaryPath
                    ) {
                        return {
                            ...formField,
                            props: {
                                ...formField.props,
                                items: dictionaries[formField.listItemsDictionaryPath],
                            },
                        };
                    }

                    return formField;
                });

                const fieldsMapper = formFieldsConfig.reduce(
                    (prevValue, nextFormField) => ({
                        ...prevValue,
                        [nextFormField.props.name]: nextFormField.type,
                    }),
                    {}
                );

                const initialData = modalAction.modalContent.formInitialDataResolver
                    ? modalAction.modalContent.formInitialDataResolver({
                          selectedRowsData,
                      })
                    : {};

                return {
                    formFields,
                    initialData,
                    fieldsMapper,
                };
            }
        }

        return null;
    }, [modalAction, dictionaries, selectedRowsData, rowIndex]);
    const handleSubmitClick = useCallback(() => {
        if (modalAction && !modalFormData && modalAction.submit) {
            onClick({ actions: modalAction.submit.action, rowIndex, isHeaderAction });
        }
    }, [onClick, modalAction, modalFormData, isHeaderAction, rowIndex]);
    const handleFormSubmit = useCallback(
        (formData: FieldValues) => {
            if (
                modalAction &&
                modalAction.submit &&
                modalAction?.modalContent?.type === ModalContentTypesEnum.FORM &&
                modalFormData?.fieldsMapper
            ) {
                onClick({
                    actions: modalAction.submit.action,
                    formData: getFormattedFormValues({
                        formData,
                        fieldsMapper: modalFormData.fieldsMapper,
                    }),
                    rowIndex,
                    isHeaderAction,
                    formDataFormatter: modalAction?.modalContent?.formDataFormatter,
                });
            }
        },
        [onClick, modalAction, modalAction, modalFormData, rowIndex, isHeaderAction]
    );
    const handleCancel = useCallback(() => {
        if (modalAction && modalAction.cancel) {
            onClick({ actions: modalAction.cancel.action, isHeaderAction });
        } else {
            onClick({
                actions: [
                    {
                        type: ActionsEnum.CLOSE_MODAL,
                    },
                ],
                isHeaderAction,
            });
        }
    }, [onClick, modalAction, isHeaderAction]);
    const modalWidth = modalAction?.modalWidth ? modalAction.modalWidth : 'auto';

    return (
        <ModalWindow width={modalWidth} isOpen={isOpen} onClose={handleCancel}>
            <Box padding={3} alignItems="center">
                <Text size="xl" align="center" style={{ overflowWrap: 'break-word' }}>
                    {modalTitle}
                </Text>
                {modalAction && modalFormData && (
                    <Box minWidth="100%" minHeight="20vh">
                        <Form
                            initialFormData={modalFormData.initialData}
                            fields={modalFormData.formFields}
                            onSubmit={handleFormSubmit}
                            formId={TABLE_ID}
                            validationMode="all"
                            disabled={false}
                        />
                    </Box>
                )}
            </Box>
            {customComponent}
            {(modalAction?.cancel || modalAction?.submit) && (
                <Row gap={4} padding={4} direction="row">
                    {modalAction?.cancel && (
                        <Button data-e2e="table_modal_cancel" disabled={isPending} onClick={handleCancel}>
                            {modalAction?.cancel.text}
                        </Button>
                    )}
                    {modalAction?.submit && (
                        <Button
                            data-e2e="table_modal_submit"
                            variant="action"
                            onClick={handleSubmitClick}
                            form={TABLE_ID}
                            state={isPending ? 'pending' : 'normal'}
                            disabled={isPending}
                        >
                            {modalAction?.submit.text}
                        </Button>
                    )}
                </Row>
            )}
        </ModalWindow>
    );
};

export default TableModal;
