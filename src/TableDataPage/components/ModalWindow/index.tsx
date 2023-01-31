import { ModalWindow as BaseModalWindow, Registry } from '@yandex-levitan/b2b';
import { css } from 'reshadow';

const ModalWindow = Registry.styled(
    BaseModalWindow,
    css`
        ReactModal box {
            width: auto;
            overflow: visible;
        }
    `
);

export default ModalWindow;
