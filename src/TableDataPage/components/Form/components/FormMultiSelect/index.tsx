/* eslint-disable max-lines */
import React, { useMemo, useState } from 'react';
import { Atom, declareAtom, PayloadActionCreator } from '@reatom/core';
import { useAction, useAtom } from '@reatom/react';
import { Controller } from 'react-hook-form';
import { TextSizes } from '@yandex-levitan/b2b';
import Text from '../../../Text';
import { CommonFormInputProps } from '../../types';
import DynamicSelect from '../../../DynamicSelect';
import { SelectTypeEnum, SelectorItem, DynamicSelectSize } from '../../../DynamicSelect/types';
import { DEFAULT_REQUIRED_ERROR } from '../../constants';
import LargeLabel from '../../../LargeLabel';
import validationSchemas from '../../validationSchemas';

export interface SearchActionPayload {
    term: string;
    paramId: string;
}

const defaultSelecItemsAtom = declareAtom<SelectorItem[]>('defaultSelecItemsAtom', [], (on) => []);

export type Props = CommonFormInputProps & {
    selectType: SelectTypeEnum;
    items: SelectorItem[];
    hasSearch: boolean;
    isLoading: boolean;
    hasResetButton?: boolean;
    hasSelfFilter?: boolean;
    hasIgnoreValidationOnEnter?: boolean;
    size?: DynamicSelectSize;
    optionSize?: TextSizes;
    searchAction?: PayloadActionCreator<SearchActionPayload>;
    itemsAtom?: Atom<SelectorItem[]>;
    validationSchema?: keyof typeof validationSchemas;
    placeholder?: string;
};

const FormSelect = ({
    isLoading,
    selectType,
    hasSearch,
    hasSelfFilter,
    name,
    control,
    required = false,
    items: itemsFromConfig,
    labelText,
    defaultValue,
    errorMessage,
    searchAction,
    size,
    disabled,
    optionSize,
    placeholder,
    hasResetButton,
    hasIgnoreValidationOnEnter,
    dataE2e,
    itemsAtom,
}: Props) => {
    const selectItemsAtom = itemsAtom || defaultSelecItemsAtom;

    const hasItemsFromAtom = Boolean(itemsAtom);

    const [searchText, setSearchText] = useState('');

    const rules = useMemo(
        () => ({
            validate: (value: SelectorItem[] | SelectorItem | null) => {
                const requiredErrorText = typeof required === 'string' ? required : DEFAULT_REQUIRED_ERROR;
                if (required) {
                    if (Array.isArray(value)) {
                        return Boolean(value.length) || requiredErrorText;
                    }

                    return value !== null || requiredErrorText;
                }

                return true;
            },
        }),
        [required]
    );

    const items = useAtom(selectItemsAtom, (atomItems) => (hasItemsFromAtom ? atomItems : itemsFromConfig), [
        hasItemsFromAtom,
        itemsFromConfig,
    ]);

    const handleDynamicSearch = useAction((query: string) => {
        setSearchText(query);
        return (
            searchAction &&
            searchAction({
                term: query,
                paramId: name,
            })
        );
    });

    return (
        <>
            <Controller
                name={name}
                control={control}
                rules={rules}
                defaultValue={defaultValue}
                render={({ field: { onChange, onBlur, value } }) => (
                    <>
                        <LargeLabel text={labelText} />
                        {selectType === SelectTypeEnum.SIMPLE ? (
                            <DynamicSelect
                                dataE2e={dataE2e}
                                isLoading={isLoading}
                                disabled={disabled}
                                inputValue={searchText}
                                selectType={selectType}
                                onChange={onChange}
                                value={value}
                                items={items}
                                hasSearch={hasSearch}
                                onBlur={onBlur}
                                onInputChange={handleDynamicSearch}
                                size={size}
                                optionSize={optionSize}
                                placeholder={placeholder}
                                hasResetButton={hasResetButton}
                                hasSelfFilter={hasSelfFilter}
                                hasIgnoreValidationOnEnter={hasIgnoreValidationOnEnter}
                            />
                        ) : (
                            <DynamicSelect
                                dataE2e={dataE2e}
                                isLoading={isLoading}
                                disabled={disabled}
                                inputValue={searchText}
                                selectType={selectType}
                                onMultiInputChange={onChange}
                                value={value}
                                items={items}
                                hasSearch={hasSearch}
                                onBlur={onBlur}
                                onInputChange={handleDynamicSearch}
                                size={size}
                                optionSize={optionSize}
                                placeholder={placeholder}
                                hasResetButton={hasResetButton}
                                hasSelfFilter={hasSelfFilter}
                                hasIgnoreValidationOnEnter={hasIgnoreValidationOnEnter}
                            />
                        )}
                    </>
                )}
            />
            {errorMessage ? (
                <Text color="red" paddingY={3} size="m">
                    {errorMessage}
                </Text>
            ) : null}
        </>
    );
};

export default FormSelect;
