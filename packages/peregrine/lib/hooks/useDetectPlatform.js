import { useLayoutEffect, useState } from 'react';

export const useDetectPlatform = () => {
    const [isSafari, setIsSafari] = useState(false);
    useLayoutEffect(() => {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf('safari') != -1) {
            if (ua.indexOf('chrome') > -1) {
                setIsSafari(false);
            } else {
                setIsSafari(true);
            }
        }
    }, []);

    return { isSafari };
};
