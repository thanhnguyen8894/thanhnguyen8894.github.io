import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

//Helper
import {
    STORE_VIEWS,
    getStoreViewsByLanguage,
    STORE_VIEWS_AR,
    getStoreViewsByCountry,
    getUrlFromStoreView
} from '@magento/peregrine/lib/util/common';

import { CREATE_CART } from './storeTrigger.gql';

//Hooks/Redux
import { useCurrentLink } from '@magento/peregrine/lib/index.js';
import { useAppContext } from '@magento/peregrine/lib/context/app';

//Cache
import { BrowserPersistence } from '@magento/peregrine/lib/util';
const storage = new BrowserPersistence();
const storeCode = storage.getItem('store_view_code');

export const useStoreTrigger = () => {
    const history = useHistory();
    const location = useLocation();
    const [{ storeConfig }] = useAppContext();
    const { default_country_code } = storeConfig;
    const { currentLink } = useCurrentLink(location.pathname, 0);

    const isArStore = !storeCode || storeCode.includes('ar') ? true : false;

    const currentStore = useMemo(() => {
        const DATA = isArStore ? [...STORE_VIEWS_AR] : [...STORE_VIEWS];
        if (storeConfig) {
            if (default_country_code) {
                let results;
                DATA.forEach(item => {
                    if (item.value === default_country_code) {
                        results = item;
                    }
                });

                if (results) {
                    storage.setItem('store_view_country', default_country_code);
                    return results;
                }
            }
        }

        // storage.setItem('store_view_country', STORE_VIEWS[0].value);
        return DATA[0];
    }, [default_country_code, isArStore, storeConfig]);

    const handleStoreChange = useCallback(async data => {
        const { value = '' } = data || {};
        const storeView = value.toLowerCase();
        const storeViews = getStoreViewsByCountry(value, storeCode);
        const storeLanguage = storeViews?.includes('ar') ? 'ar' : 'en';
        storage.setItem('store_view_code', storeViews);
        storage.setItem('is_ar_language', storeLanguage);

        //* Return host url
        // EX: https://www.example.com/ => www.example.com
        const host = `${window.location.host}`;

        //* Return url from store view
        //Ex: sa.pwa-arabia.snaptec.co/ar
        const urlRedirect = getUrlFromStoreView(host, storeView, storeLanguage);

        // window.location.assign(urlRedirect);
        if (process.env.NODE_ENV === 'development') {
            window.open(`http://${urlRedirect}`, '_self');
        } else {
            window.open(`https://${urlRedirect}`, '_self');
        }
    }, []);

    const switchStoreName =
        !storeCode || storeCode.includes('ar') ? 'English' : 'العربية';

    const switchStore = useCallback(() => {
        const newStoreViews = getStoreViewsByLanguage(storeCode);
        const storeLanguage = newStoreViews?.includes('ar') ? 'ar' : 'en';
        storage.setItem('store_view_code', newStoreViews);
        storage.setItem('is_ar_language', storeLanguage);
        const url = currentLink && currentLink.url ? currentLink.url : '/';
        if (history.length <= 2 && history.location.pathname === '/') {
            history.push('/');
        } else {
            setTimeout(() => {
                history.push(url);
            }, 500);
        }
        window.location.reload();
    }, [currentLink, history]);

    return {
        currentStore,
        handleStoreChange,
        switchStoreName,
        switchStore
    };
};
