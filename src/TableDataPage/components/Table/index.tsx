import React from 'react';
import { Registry, Table as TableBase, TableProps } from '@yandex-levitan/b2b';
import { css } from 'reshadow';

interface Props {
    hasFixedHeader?: boolean;
    withoutHeader?: boolean;
}

const BaseTable = Registry.styled(
    TableBase,
    css`
        tableWrapper table {
            font-size: 16px;
        }

        TableBody TableRow:hover {
            background-color: #f5f5f5;
        }
    `
);

const FixedHeaderTable = Registry.styled(
    BaseTable,
    css`
        container {
            overflow-x: visible !important;
            overflow-y: visible !important;
        }

        container:before {
            box-shadow: none !important;
        }

        container:after {
            box-shadow: none !important;
        }

        tableWrapper {
            overflow-y: visible !important;
            overflow-x: visible !important;
            overflow: visible !important;
        }

        TableHead TableRow * {
            position: sticky;
            top: 0;
            background-color: var(--contentSelectColor);
            z-index: 90;
        }
    `
);

const WithoutHeaderTable = Registry.styled(
    BaseTable,
    css`
        TableHead {
            display: none;
        }
    `
);

const Table = (props: TableProps & Props) => {
    if (props.withoutHeader) {
        return <WithoutHeaderTable {...props} />;
    }

    return props.hasFixedHeader ? <FixedHeaderTable {...props} /> : <BaseTable {...props} />;
};

export default Table;
