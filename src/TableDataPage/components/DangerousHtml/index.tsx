import React, { memo } from 'react';

interface Props {
    html: string;
}

const DangerousHtml = ({ html }: Props) => (
    <span
        dangerouslySetInnerHTML={{
            __html: html,
        }}
    />
);

export default memo(DangerousHtml);
