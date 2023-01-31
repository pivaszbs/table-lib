// import Testapp from './test/testapp';
import TableContainer from './TableDataPage/TableContainer';
import { TableWrapper as TableGenerator } from './TableDataPage/TableGenerator';
import TableComponent from './TableDataPage/components/TableComponent';
import TableHeader from './TableDataPage/components/TableHeader';
import TableFooter from './TableDataPage/components/TableFooter';
import { ActionsEnum, ColumnTypesEnum } from './TableDataPage/types';
import { getRangeValue } from './TableDataPage/components/NumberRangeFilter/utils';
import { titleFactory } from './TableDataPage/utils/titleFactory';
import { getDateRangeValue } from './TableDataPage/components/RangeDateForm/utils';
import { useTableFilterParams } from './TableDataPage/entities/hooks';
import type { FormData } from './TableDataPage/components/RangeDateForm/types';
import type { FetchErrorHandler, SuccessNotificationHandler } from './TableDataPage/utils/declareActionFetch';
import { SelectTypeEnum, SelectorItem } from './TableDataPage/components/DynamicSelect/types';
import validationSchemas from './TableDataPage/components/Form/validationSchemas';
import { NumbersRangeEnum } from './TableDataPage/entities/constants';

export {
    TableContainer,
    TableGenerator,
    TableComponent,
    TableFooter,
    TableHeader,
    ColumnTypesEnum,
    ActionsEnum,
    getRangeValue,
    titleFactory,
    getDateRangeValue,
    useTableFilterParams,
    FormData,
    FetchErrorHandler,
    SuccessNotificationHandler,
    SelectTypeEnum,
    validationSchemas,
    NumbersRangeEnum,
    SelectorItem,
};
export * from './TableDataPage/types';
export * from './TableDataPage/entities';
export * from './TableDataPage/utils/types';

// Testapp();
