import { ActionButton, ButtonAction, Content } from '../../types';
import { TableSortOrder } from '../../entities/types';

export type Props = {
    buttonData: ActionButton;
    rowIndex: number;
    index: number;
    loading?: boolean;
    size?: 's' | 'm' | 'l';
    onClick: (actionData: ButtonAction[], rowIndex: number, href?: string, uniqueId?: string) => void;
    selectedRowsData: Content[];
    filter?: string;
    order?: TableSortOrder;
    sort?: string;
    position?: string;
    isEditMode?: boolean;
    customFilter?: Record<string, string | boolean>;
    buttonsPendingState: Record<string, boolean>;
};
