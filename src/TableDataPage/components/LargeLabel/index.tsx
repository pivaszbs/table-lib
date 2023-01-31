import { Label, Registry } from '@yandex-levitan/b2b';
import { css } from 'reshadow';

const LargeLabel = Registry.styled(
    Label,
    css`
        Tag name {
            font-size: 26px;
            color: black;
        }
    `
);

export default LargeLabel;
