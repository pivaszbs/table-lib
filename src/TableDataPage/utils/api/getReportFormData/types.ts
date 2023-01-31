import { SelectorItem } from '../../../components/DynamicSelect/types';

export type FieldType =
    | 'STRING'
    | 'INTEGER'
    | 'FLOAT'
    | 'LIST'
    | 'MULTILIST'
    | 'DATE'
    | 'DATETIME'
    | 'TIME'
    | 'LOCAL_DATE'
    | 'LOCAL_DATETIME'
    | 'LOCAL_TIME';

export interface BaseInputProperties {
    caption: string;
    code: string;
    required: boolean;
}

export interface StringInput extends BaseInputProperties {
    stringValue?: string;
    paramType: 'STRING';
}

export interface DateInput extends BaseInputProperties {
    dateValue?: string;
    paramType: 'DATE' | 'DATETIME';
}

export interface TimeInput extends BaseInputProperties {
    timeValue?: string;
    paramType: 'TIME';
}

export interface LocalDateInput extends BaseInputProperties {
    localDateValue?: string;
    paramType: 'LOCAL_DATE';
}

export interface LocalDateTimeInput extends BaseInputProperties {
    localDateTimeValue?: string;
    paramType: 'LOCAL_DATETIME';
}

export interface LocalTimeInput extends BaseInputProperties {
    localTimeValue?: string;
    paramType: 'LOCAL_TIME';
}

export interface ListInput extends BaseInputProperties {
    allowedValues: string[] | SelectorItem[];
    listValue?: string[];
    dynamicList: boolean;
    paramType: 'LIST' | 'MULTILIST';
    allowedValuesPath?: string;
    hasResetButton?: boolean;
    hasSelfFilter?: boolean;
}

export interface NumberInput extends BaseInputProperties {
    numberValue?: number;
    paramType: 'INTEGER' | 'FLOAT';
}

export type FieldData =
    | ListInput
    | NumberInput
    | StringInput
    | DateInput
    | TimeInput
    | LocalDateInput
    | LocalDateTimeInput
    | LocalTimeInput;

export interface FormDataResponse {
    header: {
        code: string;
        name: string;
        group: string;
        offerGeneratedReportReuse: boolean;
        directPrint?: boolean;
    };
    parameters?: FieldData[];
}

export interface GetFormDataParams {
    reportId: string;
}
