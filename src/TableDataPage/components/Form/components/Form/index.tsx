/* eslint-disable max-lines */
import { yupResolver } from '@hookform/resolvers/yup';
import { Preloader, Row } from '@yandex-levitan/b2b';
import React, { ReactNode, SyntheticEvent, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { Control, DeepPartial, FieldValues, Mode, SubmitHandler, UnpackNestedValue, useForm } from 'react-hook-form';
import { AnySchema, object, string } from 'yup';
import { ObjectShape } from 'yup/lib/object';
import UXKeyHandler from '../../../UXKeyHandler';
import FormCheckbox, { Props as CheckboxProps } from '../FormCheckbox';
import FormDateField, { Props as DateFieldProps } from '../FormDateField';
import FormDateTimeField, { FormDateTimeFieldErrorMessage, Props as FormDateTimeProps } from '../FormDateTimeField';
import FormMultiSelect, { Props as DynamicSelectProps } from '../FormMultiSelect';
import FormSelect, { Props as SelectProps } from '../FormSelect';
import FormTextField, { Props as TextFieldProps } from '../FormTextField';
import FormTimeField, { Props as FormTimeProps } from '../FormTimeField';
import { DEFAULT_REQUIRED_ERROR } from '../../constants';
import validationSchemas, { isCustomSchema } from '../../validationSchemas';
import { Nullable } from '../../../../types';
import FormMultiField from '../FormMultiField';

export type FormFieldType =
    | 'checkbox'
    | 'textField'
    | 'select'
    | 'dateField'
    | 'multiSelect'
    | 'dateTimeField'
    | 'timeField'
    | 'textMultiField';

export interface FormField {
    type: FormFieldType;
    props:
        | CheckboxProps
        | TextFieldProps
        | SelectProps
        | DateFieldProps
        | FormDateTimeProps
        | FormTimeProps
        | DynamicSelectProps;
    validate?: (value: any) => boolean;
}

export interface Props<T extends FieldValues = FieldValues> {
    fields: FormField[];
    onSubmit: SubmitHandler<T>;
    formId: string;
    initialFormData?: Nullable<T>;
    fieldsPendingState?: Record<string, boolean>;
    validationMode?: Mode;
    formClassName?: string;
    disabled?: boolean;
    resetOnSubmit?: boolean | Partial<T>;
    watchedField?: string; // left it empty to watch all
    onChangeWatched?: (watchedValue: any) => void;
    withUXKeyHandler?: boolean;
    isLoading?: boolean;
    draggable?: boolean;
    onDragSave?: (fields: string[]) => void;
}

const preventDefault = (e: SyntheticEvent<any>) => e.preventDefault();

interface FormFieldWrapperProps {
    name: string;
    children: ReactNode;
    index: number;
    draggable?: boolean;
}

const FormFieldWrapper = ({ name, children, draggable, index }: FormFieldWrapperProps) => {
    if (draggable) {
        return (
            <Draggable key={name} draggableId={name} index={index}>
                {(provided) => {
                    return (
                        <div
                            ref={provided.innerRef}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            style={{
                                ...provided.draggableProps.style,
                                // @ts-ignore
                                top: `calc(${provided.draggableProps.style.top} - 50%)`,
                                // @ts-ignore
                                left: `calc(${provided.draggableProps.style.left} - 50%)`,
                            }}
                        >
                            <Row paddingY={2} key={name}>
                                {children}
                            </Row>
                        </div>
                    );
                }}
            </Draggable>
        );
    }
    return (
        <Row paddingY={2} key={name}>
            {children}
        </Row>
    );
};

const reorder = (list: FormField[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const FormComponent = <T extends FieldValues = FieldValues>({
    fields,
    formId,
    initialFormData,
    formClassName,
    disabled,
    resetOnSubmit = false,
    onSubmit: onSubmitProp,
    validationMode = 'onChange',
    withUXKeyHandler = false,
    fieldsPendingState = {},
    watchedField,
    onChangeWatched,
    draggable,
    onDragSave,
}: Props<T>) => {
    const schema = object().shape(
        fields.reduce((acc: ObjectShape, { props }) => {
            if (!props.validationSchema) {
                if (props.required) {
                    acc[props.name] = string().required(
                        typeof props.required === 'string' ? props.required : DEFAULT_REQUIRED_ERROR
                    );
                }

                return acc;
            }

            acc[props.name] = isCustomSchema(props.validationSchema)
                ? props.validationSchema
                : validationSchemas[props.validationSchema];
            if (props.required) {
                acc[props.name] = (acc[props.name] as AnySchema).required(
                    typeof props.required === 'string' ? props.required : DEFAULT_REQUIRED_ERROR
                );
            }

            return acc;
        }, {})
    );

    const [showedFields, setShowedFields] = useState(fields);

    useEffect(() => {
        setShowedFields(fields);
    }, [fields]);

    const {
        handleSubmit,
        formState: { errors: formErrors },
        control: formControl,
        reset,
        getValues,
        watch,
    } = useForm<T>({
        mode: validationMode,
        resolver: yupResolver(schema),
        defaultValues: initialFormData as UnpackNestedValue<DeepPartial<T>>,
    });
    // @ts-ignore
    const watchedValue = watch(watchedField);

    useEffect(() => onChangeWatched && onChangeWatched(watchedValue), [watchedValue, onChangeWatched]);

    const control = formControl as Control;
    const errors = formErrors as Record<string, any>;

    const onDragEnd = (result: DropResult) => {
        const { destination, source } = result;
        if (!destination) {
            return;
        }

        setShowedFields((oldFields) => reorder(oldFields, source.index, destination.index));
    };

    const onSubmit = handleSubmit(() => {
        onSubmitProp(getValues());
        if (draggable && onDragSave) {
            onDragSave(showedFields.map((value) => value.props.name));
        }
        if (resetOnSubmit) {
            const formData = typeof resetOnSubmit === 'boolean' ? {} : { ...getValues(), ...resetOnSubmit };
            reset(formData as UnpackNestedValue<DeepPartial<T>>);
        }
    });

    return (
        <form role="form" className={formClassName} onSubmit={withUXKeyHandler ? preventDefault : onSubmit} id={formId}>
            {withUXKeyHandler && <UXKeyHandler functor={onSubmit} />}
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {showedFields.map(({ type, props, validate }, index) => {
                                switch (type) {
                                    case 'checkbox': {
                                        const {
                                            name,
                                            labelText,
                                            defaultValue,
                                            size,
                                            disabled: fieldDisable,
                                        } = props as CheckboxProps;

                                        return (
                                            <FormFieldWrapper
                                                key={name}
                                                name={name}
                                                draggable={draggable}
                                                index={index}
                                            >
                                                <FormCheckbox
                                                    labelText={labelText}
                                                    name={name}
                                                    control={control}
                                                    errorMessage={errors[name]?.message}
                                                    defaultValue={defaultValue}
                                                    size={size}
                                                    disabled={disabled || fieldDisable}
                                                />
                                            </FormFieldWrapper>
                                        );
                                    }
                                    case 'textField': {
                                        const {
                                            name,
                                            labelText,
                                            validationSchema,
                                            required,
                                            defaultValue,
                                            hasLowerCase,
                                            autoFocus,
                                            autoComplete,
                                            placeholder,
                                            hasAutoSelectAfterSubmit,
                                            disabled: fieldDisable,
                                            rows,
                                        } = props as TextFieldProps;

                                        return (
                                            <FormFieldWrapper
                                                key={name}
                                                name={name}
                                                draggable={draggable}
                                                index={index}
                                            >
                                                <FormTextField
                                                    labelText={labelText}
                                                    name={name}
                                                    control={control}
                                                    validationSchema={validationSchema}
                                                    required={required}
                                                    autoComplete={autoComplete}
                                                    errorMessage={errors[name]?.message}
                                                    defaultValue={defaultValue}
                                                    disabled={disabled || fieldDisable}
                                                    hasLowerCase={hasLowerCase}
                                                    autoFocus={autoFocus}
                                                    placeholder={placeholder}
                                                    hasAutoSelectAfterSubmit={hasAutoSelectAfterSubmit}
                                                    rows={rows}
                                                />
                                            </FormFieldWrapper>
                                        );
                                    }
                                    case 'select': {
                                        const {
                                            name,
                                            labelText,
                                            validationSchema,
                                            required,
                                            defaultValue,
                                            options,
                                            disabled: fieldDisable,
                                            emptyOption,
                                        } = props as SelectProps;

                                        return (
                                            <FormFieldWrapper
                                                key={name}
                                                name={name}
                                                draggable={draggable}
                                                index={index}
                                            >
                                                <FormSelect
                                                    name={name}
                                                    labelText={labelText}
                                                    control={control}
                                                    validationSchema={validationSchema}
                                                    required={required}
                                                    errorMessage={errors[name]?.message}
                                                    options={options}
                                                    defaultValue={defaultValue}
                                                    disabled={disabled || fieldDisable}
                                                    validate={validate}
                                                    emptyOption={emptyOption}
                                                />
                                            </FormFieldWrapper>
                                        );
                                    }
                                    case 'multiSelect': {
                                        const {
                                            name,
                                            labelText,
                                            hasSearch,
                                            selectType,
                                            required,
                                            defaultValue,
                                            items,
                                            searchAction,
                                            size,
                                            placeholder,
                                            optionSize,
                                            hasResetButton,
                                            hasSelfFilter,
                                            hasIgnoreValidationOnEnter,
                                            dataE2e,
                                            disabled: fieldDisable,
                                            itemsAtom,
                                        } = props as DynamicSelectProps;

                                        return (
                                            <FormFieldWrapper
                                                key={name}
                                                name={name}
                                                draggable={draggable}
                                                index={index}
                                            >
                                                <FormMultiSelect
                                                    dataE2e={dataE2e}
                                                    name={name}
                                                    labelText={labelText}
                                                    control={control}
                                                    required={required}
                                                    errorMessage={errors[name]?.message}
                                                    items={items}
                                                    defaultValue={defaultValue}
                                                    validate={validate}
                                                    hasSearch={hasSearch}
                                                    selectType={selectType}
                                                    searchAction={searchAction}
                                                    isLoading={Boolean(fieldsPendingState[name])}
                                                    size={size}
                                                    optionSize={optionSize}
                                                    placeholder={placeholder}
                                                    hasResetButton={hasResetButton}
                                                    hasSelfFilter={hasSelfFilter}
                                                    hasIgnoreValidationOnEnter={hasIgnoreValidationOnEnter}
                                                    disabled={disabled || fieldDisable}
                                                    itemsAtom={itemsAtom}
                                                />
                                            </FormFieldWrapper>
                                        );
                                    }
                                    case 'dateField': {
                                        const {
                                            dataE2e,
                                            name,
                                            labelText,
                                            required,
                                            defaultValue,
                                            withPortal,
                                            isCompactDate,
                                            popperPlacement,
                                            disabled: fieldDisable,
                                        } = props as DateFieldProps;

                                        return (
                                            <FormFieldWrapper
                                                key={name}
                                                name={name}
                                                draggable={draggable}
                                                index={index}
                                            >
                                                <FormDateField
                                                    dataE2e={dataE2e}
                                                    name={name}
                                                    labelText={labelText}
                                                    control={control}
                                                    required={required}
                                                    errorMessage={errors[name]?.message}
                                                    defaultValue={defaultValue}
                                                    withPortal={withPortal}
                                                    isCompactDate={isCompactDate}
                                                    disabled={disabled || fieldDisable}
                                                    popperPlacement={popperPlacement}
                                                />
                                            </FormFieldWrapper>
                                        );
                                    }
                                    case 'dateTimeField': {
                                        const {
                                            dataE2e,
                                            name,
                                            labelText,
                                            required,
                                            defaultValue,
                                            withPortal,
                                            popperPlacement,
                                            isCompactDate,
                                            disabled: fieldDisable,
                                        } = props as DateFieldProps;
                                        return (
                                            <FormFieldWrapper
                                                key={name}
                                                name={name}
                                                draggable={draggable}
                                                index={index}
                                            >
                                                <FormDateTimeField
                                                    dataE2e={dataE2e}
                                                    name={name}
                                                    labelText={labelText}
                                                    control={control}
                                                    required={required}
                                                    errorMessage={errors[name] as FormDateTimeFieldErrorMessage}
                                                    defaultValue={defaultValue}
                                                    withPortal={withPortal}
                                                    disabled={disabled || fieldDisable}
                                                    validate={validate}
                                                    isCompactDate={isCompactDate}
                                                    popperPlacement={popperPlacement}
                                                />
                                            </FormFieldWrapper>
                                        );
                                    }
                                    case 'timeField': {
                                        const {
                                            name,
                                            labelText,
                                            required,
                                            defaultValue,
                                            dataE2e,
                                            disabled: fieldDisable,
                                        } = props as DateFieldProps;

                                        return (
                                            <FormFieldWrapper
                                                key={name}
                                                name={name}
                                                draggable={draggable}
                                                index={index}
                                            >
                                                <FormTimeField
                                                    dataE2e={dataE2e}
                                                    name={name}
                                                    labelText={labelText}
                                                    control={control}
                                                    required={required}
                                                    errorMessage={errors[name]?.message}
                                                    defaultValue={defaultValue}
                                                    disabled={disabled || fieldDisable}
                                                />
                                            </FormFieldWrapper>
                                        );
                                    }
                                    case 'textMultiField': {
                                        const {
                                            name,
                                            labelText,
                                            required,
                                            defaultValue,
                                            dataE2e,
                                            disabled: fieldDisable,
                                        } = props as DateFieldProps;

                                        return (
                                            <FormFieldWrapper
                                                key={name}
                                                name={name}
                                                draggable={draggable}
                                                index={index}
                                            >
                                                <FormMultiField
                                                    dataE2e={dataE2e}
                                                    name={name}
                                                    labelText={labelText}
                                                    control={control}
                                                    required={required}
                                                    errorMessage={errors[name]?.message}
                                                    defaultValue={defaultValue}
                                                    disabled={disabled || fieldDisable}
                                                />
                                            </FormFieldWrapper>
                                        );
                                    }
                                    default:
                                        return null;
                                }
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </form>
    );
};

const Form = <T extends FieldValues = FieldValues>(props: Props<T>) => {
    return props.initialFormData === null || props.isLoading ? (
        <Preloader pending={true} />
    ) : (
        <FormComponent {...props} />
    );
};

export default Form;
