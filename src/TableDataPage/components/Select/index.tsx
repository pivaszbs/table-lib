import React, { ReactNode, MouseEvent } from 'react';
import classNames from 'classnames';

import styles from './style.pcss';

interface Props {
    id?: string;
    value?: string;
    disabled?: boolean;
    label?: ReactNode;
    labelClassName?: string;
    className?: string;
    onChange: (value: any) => void;
    onClick?: (event: MouseEvent) => void;
    onBlur?: (value: any) => void;
    children: ReactNode[] | ReactNode;
}

const Select = ({
    id,
    value,
    disabled,
    label,
    className,
    labelClassName,
    onChange,
    onClick,
    onBlur,
    children,
}: Props) => {
    return (
        <>
            {label && (
                <label className={labelClassName} htmlFor={id}>
                    {label}
                </label>
            )}
            <select
                id={id}
                data-e2e="duration-selector"
                className={classNames(styles.dropdown, className)}
                value={value}
                disabled={disabled}
                onClick={onClick}
                onChange={(event) => onChange(event.currentTarget.value)}
                onBlur={onBlur}
            >
                {children}
            </select>
        </>
    );
};

export default Select;
