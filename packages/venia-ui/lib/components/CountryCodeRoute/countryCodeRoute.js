import { BrowserPersistence } from '@magento/peregrine/lib/util';
import {
    checkCorrectLanguage,
    checkCorrectSubdomain,
    convertStringCountryCodeToCorrectCountryCode,
    getStoreViewByPathInUrl
} from '@magento/peregrine/lib/util/common';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const storage = new BrowserPersistence();

const CountryCodeRoute = () => {
    const history = useHistory();
    // Replace href with http or https to only host with bellow /
    // EX: https://www.magento.com/ar/ ===> www.magento.com/ar/
    const host = window.location.href.replace(/(^\w+:|^)\/\//, '');

    // Get pathname from url then get language from pathname
    const pathname = window.location.pathname;
    const [, pathStoreLanguage] = pathname.split('/');

    // Determine what the current store code is using the configured basename.
    const basename = history.createHref({ pathname: '/' });
    const currentStoreCode = basename.replace(/\//g, '');

    //Split the host into an array of strings
    //EX: sa.magento.com/ar/ ===> ['sa', 'magento', 'com/ar']
    const splitUrlResult = host?.split('.');

    //Get store code from the url if it exists
    //EX: ['sa', 'magento', 'com/ar'] => 'com/ar' => 'ar'
    // If undefined, return pathStoreLanguage (case user have link with language)
    const storeCode =
        splitUrlResult[splitUrlResult.length - 1]?.split('/')[1] ||
        pathStoreLanguage;

    //Get subdomain from the url if it exists
    //EX: ['sa', 'magento', 'com/ar'] => 'sa'
    const subDomain = checkCorrectSubdomain(splitUrlResult[0]);

    const codeLanguage = storeCode
        ? checkCorrectLanguage(storeCode)
        : checkCorrectLanguage(currentStoreCode);

    //If codeLanguage is undefined return default to 'ar' with current store in subdomain
    const codeLanguageDefault = codeLanguage || 'ar';

    // Get the store views by language
    // EX: https://sa.magento.com/ar/ => sa_ar
    const countryCodeString = `${subDomain}_${codeLanguageDefault}`;

    const countryCodeStringCompare = convertStringCountryCodeToCorrectCountryCode(
        countryCodeString
    );

    // Get the store views by country from url exactly (only store Pakistan had en language)
    const countryCode = getStoreViewByPathInUrl(countryCodeString);

    // Get the store views by country from the store views data
    const currentCountryCodeString = `${subDomain}_${currentStoreCode}`;

    storage.setItem('store_view_code', countryCode);
    useEffect(() => {
        if (!codeLanguage) return;
        if (
            countryCodeStringCompare &&
            countryCodeStringCompare !== currentCountryCodeString
        ) {
            storage.setItem('store_view_code', countryCode);
            storage.setItem(
                'is_ar_language',
                countryCode?.includes('ar') ? 'ar' : 'en'
            );
            history.go(0);
        }
    }, [
        codeLanguage,
        countryCode,
        countryCodeStringCompare,
        currentCountryCodeString,
        history
    ]);

    return null;
};

export default CountryCodeRoute;
