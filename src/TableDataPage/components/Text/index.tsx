import { DefaultLayoutProps, Text as BaseText, TextProps } from '@yandex-levitan/b2b';
import React from 'react';

const Text = (props: TextProps<any, any> & DefaultLayoutProps<any>) => (
    <div>
        <BaseText {...props} />
    </div>
);

export default Text;
