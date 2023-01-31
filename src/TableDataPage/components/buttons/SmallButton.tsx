import { Button, Registry } from '@yandex-levitan/b2b';
import { css } from 'reshadow';

// TODO кнопка для таблиц (удалить если в левитане появится аналогичный компактный вариант кнопки)

const SmallButton = Registry.styled(
    Button,
    css`
        Clickable[|size][|size='s'] {
            font-size: 12px;
            line-height: 16px;
            padding: 6px 10px;
        }

        Clickable[|size][|size='s'] Icon {
            width: 16px;
            height: 16px;
            max-width: 16px;
            max-height: 16px;
            min-width: 16px;
            min-height: 16px;
        }

        Clickable[|variant='error'] {
            background-color: #f00;
        }
        Clickable[|variant='process']::after {
            background-image: repeating-linear-gradient(-45deg, #fc0, #fc0 6px, #ffeba0 0, #ffeba0 12px);
            background-size: 200% 200%;
        }
        @keyframes small_button {
            from {
                margin-left: -16.97px;
            }
            to {
                margin-left: 0;
            }
        }
        Clickable[|variant='process']::after {
            animation: small_button 0.5s linear infinite;
        }

        content {
            display: flex;
            align-items: center;
            overflow-wrap: break-word;

            padding: unset;
        }
    `
);

export default SmallButton;
