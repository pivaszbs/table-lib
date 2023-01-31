import { Icon, AsProp } from '@yandex-levitan/b2b';
import React, { JSX, SyntheticEvent, Ref } from 'react';

declare module '@yandex-levitan/b2b' {
    type B2bIcon = Parameters<Icon<any>>[0]['icon'];

    interface TableProps {
        children?: React.ReactNode;
        data?: TableDataType;
        setScrollableElem?: (e?: HTMLElement) => void;
        onRowClick?: (e: SyntheticEvent<HTMLElement>, [row]: [{ dataset: { id: number } }]) => void;
        empty?: React.ReactElement<string>;
        TableHead?: React.ComponentType<any>;
        TableRow?: React.ComponentType<any>;
        TableBody?: React.ComponentType<any>;
        TableCell?: React.ComponentType<any>;
        className?: string;
        $ref?: Ref<''>;
    }

    interface TableProps {
        children?: React.ReactNode;
        data?: TableDataType;
        setScrollableElem?: (e?: HTMLElement) => void;
        onRowClick?: (e: SyntheticEvent<HTMLElement>, [row]: [{ dataset: { id: number } }]) => void;
        empty?: React.ReactElement<string>;
        TableHead?: React.ComponentType<any>;
        TableRow?: React.ComponentType<any>;
        TableBody?: React.ComponentType<any>;
        TableCell?: React.ComponentType<any>;
        className?: string;
        $ref?: Ref<''>;
    }

    function Table<Type>(props: TableProps & React.HtmlHTMLAttributes<Type>): JSX.Element;

    function Button<Type>(
        props: {
            /**
             * Размер кнопки. Зависит от контекста
             */
            size?: 's' | 'm' | 'l';
            /**
             * svg иконки
             */
            icon?: B2bIcon;
            /**
             * Расположение иконки относительно текста
             */
            iconPosition?: 'left' | 'right';
            /**
             * Тип кнопки
             */
            variant?: 'normal' | 'action' | 'float' | 'outline' | 'pseudo';
            /**
             * Неактивность кнопки
             */
            disabled?: boolean;
            /**
             * Размер закруглений углов
             */
            shape?: 'rectangle' | 'rounded';
            /**
             * Состояние кнопки
             */
            state?: 'normal' | 'pending';
            /**
             * Ширина кнопки
             */
            width?: 'auto' | 'full' | number;

            /**
             * Текст кнопки
             */
            children?: React.ReactNode;
        } & AsProp<Type, 'a' | 'button' | 'span', 'button'>
    ): JSX.Element;

    function Preloader<Type>(
        props: {
            /**
             * Контент
             */
            children?: React.ReactNode;
            /**
             * Состояние
             */
            pending?: boolean;
        } & React.HTMLAttributes<Type>
    ): JSX.Element;

    function Checkbox<T>(props: {
        /**
         * Размер чекбокса. Зависит от контекста
         */
        size?: 's' | 'm' | 'l' | 'xl';

        /**
         * Выбран или нет
         */
        checked: boolean | 'indeterminate';

        /**
         * Активность чекбокса
         */
        disabled?: boolean;

        /**
         * Лейбл
         */
        label?: React.ReactNode;

        /**
         * Дополнительная информация
         */
        description?: string;
        onChange?: (value: boolean, evt: React.ChangeEvent<HTMLInputElement>) => void;
        onBlur?: (evt: MouseEvent) => void;
        name?: string;
    }): JSX.Element;
}
