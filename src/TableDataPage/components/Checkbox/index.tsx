import React from 'react';
import { Checkbox as BaseCheckbox, Registry } from '@yandex-levitan/b2b';
import { css } from 'reshadow';

const Checkbox = Registry.styled(
    BaseCheckbox,
    css`
        container[|size][|size='l'] misc {
            margin-left: 12px;
        }

        container[|size][|size='l'] misc label {
            font-size: 20px;
            line-height: 24px;
        }

        container[|size][|size='l'] misc description {
            margin-top: 6px;
        }

        container[|size][|size='l'] box {
            width: 24px;
            height: 24px;
            min-width: 24px;
            min-height: 24px;
        }

        container[|size][|size='xl'] misc {
            margin-left: 16px;
        }

        container[|size][|size='xl'] misc label {
            font-size: 26px;
            line-height: 30px;
        }

        container[|size][|size='xl'] misc description {
            margin-top: 8px;
            font-weight: bold;
        }

        container[|size][|size='xl'] box {
            width: 30px;
            height: 30px;
            min-width: 30px;
            min-height: 30px;
        }
    `
);

export default Checkbox;
