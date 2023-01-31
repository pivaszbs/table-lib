import { useCallback, useEffect } from 'react';

export const ENTER_CODE = 13;

interface Props {
    functor: () => void;
    disabled?: boolean;
}

const isNotDisabled = (input: HTMLInputElement) => !input.disabled;

const UXKeyHandler = ({ functor, disabled }: Props) => {
    const handler = useCallback(
        (event) => {
            if (event.keyCode === ENTER_CODE) {
                const inputs = Array.from(document.getElementsByTagName('input')).filter(isNotDisabled);
                const index = inputs.indexOf(event.target) + 1;
                if (index === inputs.length) {
                    if (!disabled) {
                        functor();
                    } else {
                        inputs[0]?.focus();
                    }
                } else {
                    inputs[index]?.focus();
                }
            }
        },
        [functor, disabled]
    );

    useEffect(() => {
        document.addEventListener('keydown', handler, false);
        return () => {
            document.removeEventListener('keydown', handler, false);
        };
    }, [handler]);

    useEffect(() => {
        const inputs = Array.from(document.getElementsByTagName('input')).filter(isNotDisabled);
        inputs[0]?.focus();
    }, []);

    return null;
};

export default UXKeyHandler;
