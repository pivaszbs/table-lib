import React, { ReactNode, memo, RefObject } from 'react';
import { Box, PaddingProps } from '@yandex-levitan/b2b';

import styles from './style.pcss';

interface Props {
    header?: ReactNode;
    content?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    paddingConfig?: PaddingProps;
    contentRef?: RefObject<HTMLDivElement>;
}

const FixedFooterHeaderLayout = ({ header, content, footer, paddingConfig, contentRef, children }: Props) => {
    return (
        <Box height="100%" overflow="hidden" {...paddingConfig}>
            {header && <Box>{header}</Box>}
            <div ref={contentRef} className={styles.content}>
                {content || children}
            </div>
            <Box>{footer}</Box>
        </Box>
    );
};

export default memo(FixedFooterHeaderLayout);
