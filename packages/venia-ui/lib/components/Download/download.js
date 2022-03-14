import React, { Fragment, useEffect } from 'react';
import { useDetectPlatform } from '@magento/peregrine/lib/hooks/useDetectPlatform';

const url_apple_store = '#';
const url_ch_play = '#';

const Download = () => {
    const { isSafari } = useDetectPlatform();
    useEffect(() => {
        if (isSafari) {
            window.addEventListener('load', () => {
                window.location.href = url_apple_store;
            });
        } else {
            window.addEventListener('load', () => {
                window.location.href = url_ch_play;
            });
        }
    }, [isSafari]);
    return <Fragment />;
};

export default Download;
