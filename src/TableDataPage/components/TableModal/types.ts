import { ReactNode } from 'react';
import { ModalAction, TableDictionary, ModalFormSubmitPayload, Content, Nullable } from '../../types';

export interface Props {
    isOpen: boolean;
    isHeaderAction: boolean;
    rowIndex: number;
    modalAction: Nullable<ModalAction<any>>;
    dictionaries: TableDictionary;
    isPending: boolean;
    customComponent: ReactNode;
    onClick: (payload: ModalFormSubmitPayload) => void;
    selectedRowsData: Content[];
}
