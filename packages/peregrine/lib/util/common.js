var _ = require('lodash');
export const checkVirtualProductInStock = item => {
    const { product } = item || {};
    const { __typename = '', stock_status = '' } = product || {};

    if (
        __typename &&
        stock_status &&
        __typename === 'VirtualProduct' &&
        stock_status === 'IN_STOCK'
    ) {
        return true;
    }

    return false;
};

export const checkValidPhoneNumber = phone => {
    if (!phone || phone.length < 8) return false;
    return true;
};

export const getPhoneCodeByCountry = code => {
    switch (code) {
        case 'saudi-arabia':
            return '966';
        case 'kuwait':
            return '965';
        case 'uae':
            return '971';
        case 'oman':
            return '968';
        default:
            return '966';
    }
};

export const EMAIL_FORMAT = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const PAYMENT_METHODS = {
    cod: 'cashondelivery',
    checkmo: 'checkmo',
    bank_transfer: 'banktransfer',
    hyper_pay_mada: 'HyperPay_Mada',
    hyper_pay_visa: 'HyperPay_Visa',
    hyper_pay_master: 'HyperPay_Master',
    hyper_pay_applepay: 'HyperPay_ApplePay',
    hyper_pay_amex: 'HyperPay_Amex'
};

export const convertCommaToDots = values => {
    if (values.includes(',')) {
        return values.replace(/,/g, '.');
    }
    return values;
};

export const STORE_VIEWS = [
    { value: 'SA', label: 'Saudi Arabia' },
    { value: 'AE', label: 'UAE' },
    { value: 'KW', label: 'Kuwait' },
    { value: 'OM', label: 'Oman' },
    { value: 'BH', label: 'Bahrain' },
    { value: 'QA', label: 'Qatar' },
    { value: 'PK', label: 'Pakistan' }
];

export const STORE_VIEWS_AR = [
    { value: 'SA', label: 'السعودية' },
    { value: 'AE', label: 'الإمارات' },
    { value: 'KW', label: 'الكويت' },
    { value: 'OM', label: 'سلطنة عمان' },
    { value: 'BH', label: 'البحرين' },
    { value: 'QA', label: 'قطر' },
    { value: 'PK', label: 'باكستان' }
];

export const availableStores = ['sa', 'ae', 'kw', 'om', 'bh', 'qa', 'pk'];

export const getStoreViewsByLanguage = currentStore => {
    switch (currentStore) {
        // SA
        case 'en':
            return 'ar';
        case 'ar':
            return 'en';
        // UAE
        case 'uae_en':
            return 'uae_ar';
        case 'uae_ar':
            return 'uae_en';
        // KW
        case 'kw_ar':
            return 'kw_en';
        case 'kw_en':
            return 'kw_ar';
        // OM
        case 'om_ar':
            return 'om_en';
        case 'om_en':
            return 'om_ar';
        // BH
        case 'bahrain_ar':
            return 'bahrain_en';
        case 'bahrain_en':
            return 'bahrain_ar';
        // QA
        case 'qa_ar':
            return 'qa_en';
        case 'qa_en':
            return 'qa_ar';
        // PK
        case 'pak_en':
            return 'pak_en';
        case 'pak_ar':
            return 'pak_en';
        default:
            return 'ar';
    }
};

export const getPhoneImgByCountry = code => {
    switch (code) {
        case 'sa':
            return '/venia-static/icons/flags/SA-square.png';
        case 'kw':
            return '/venia-static/icons/flags/KW-square.png';
        case 'ae':
            return '/venia-static/icons/flags/AE-square.png';
        case 'om':
            return '/venia-static/icons/flags/OM-square.png';
        case 'bh':
            return '/venia-static/icons/flags/BH-square.png';
        case 'qa':
            return '/venia-static/icons/flags/QA-square.png';
        case 'pk':
            return '/venia-static/icons/flags/PK-square.png';
        default:
            return '';
    }
};

export const getCountryCodeByCountry = code => {
    switch (code) {
        case 'sa':
            return '966';
        case 'kw':
            return '965';
        case 'om':
            return '968';
        case 'bh':
            return '973';
        case 'qa':
            return '974';
        case 'ae':
            return '971';
        case 'pk':
            return '92';
        default:
            return '966';
    }
};

export const getPhoneMaskByCountry = code => {
    switch (code) {
        case 'sa':
            return '999 - 999 - 999';
        case 'kw':
        case 'om':
        case 'bh':
        case 'qa':
        case 'ae':
            return '999 - 999 -999999';
        default:
            return '999-999-999999';
    }
};

export const getStoreViewsByCountry = (country, currentStore) => {
    if (currentStore && currentStore.includes('en')) {
        switch (country) {
            case 'SA':
                return 'en';
            case 'AE':
                return 'uae_en';
            case 'KW':
                return 'kw_en';
            case 'OM':
                return 'om_en';
            case 'BH':
                return 'bahrain_en';
            case 'QA':
                return 'qa_en';
            case 'PK':
                return 'pak_en';
            default:
                return 'en';
        }
    } else {
        switch (country) {
            case 'SA':
                return 'ar';
            case 'AE':
                return 'uae_ar';
            case 'KW':
                return 'kw_ar';
            case 'OM':
                return 'om_ar';
            case 'BH':
                return 'bahrain_ar';
            case 'QA':
                return 'qa_ar';
            case 'PK':
                return 'pak_en';
            default:
                return 'ar';
        }
    }
};

export const getPlaceHolderByCountry = countryCode => {
    switch (countryCode) {
        case 'sa':
            return '+966 000 - 000 - 000';
        case 'kw':
            return '+965 00 - 000 - 000';
        case 'om':
            return '+968 00 - 000 - 000';
        case 'bh':
            return '+973 00 - 000 - 000';
        case 'qa':
            return '+974 00 - 000 - 000';
        case 'ae':
            return '+971 00 - 000 - 0000';
    }
};

export const getPlaceHolderByPhoneCode = phoneCode => {
    switch (phoneCode) {
        case '966':
            return '500 - 000 - 000';
        case '965':
            return '50 - 000 - 000';
        case '968':
            return '50 - 000 - 000';
        case '973':
            return '50 - 000 - 000';
        case '974':
            return '50 - 000 - 000';
        case '971':
            return '50 - 000 - 0000';
    }
};

export const getStoreViewByPathInUrl = string => {
    switch (string) {
        case 'sa_ar':
            return 'ar';
        case 'sa_en':
            return 'en';
        case 'kw_ar':
            return 'kw_ar';
        case 'kw_en':
            return 'kw_en';
        case 'om_ar':
            return 'om_ar';
        case 'om_en':
            return 'om_en';
        case 'bahrain_ar':
            return 'bahrain_ar';
        case 'bahrain_en':
            return 'bahrain_en';
        case 'qa_ar':
            return 'qa_ar';
        case 'qa_en':
            return 'qa_en';
        case 'uae_ar':
            return 'uae_ar';
        case 'uae_en':
            return 'uae_en';
        case 'pak_en':
            return 'pak_en';
        case 'pak_ar':
            return 'pak_en';
        default:
            return 'ar';
    }
};

export const converSubDomainToStoreView = subDomain => {
    switch (subDomain) {
        case 'sa':
            return 'sa';
        case 'kw':
            return 'kw';
        case 'om':
            return 'om';
        case 'bh':
            return 'bahrain';
        case 'qa':
            return 'qa';
        case 'ae':
            return 'uae';
        case 'pk':
            return 'pak';
        default:
            return 'sa';
    }
};

export const convertStringCountryCodeToCorrectCountryCode = string => {
    switch (string) {
        case 'sa_ar':
        case 'sa_en':
        case 'kw_ar':
        case 'kw_en':
        case 'om_ar':
        case 'om_en':
        case 'bahrain_ar':
        case 'bahrain_en':
        case 'qa_ar':
        case 'qa_en':
        case 'uae_ar':
        case 'uae_en':
        case 'pak_en':
            return string;
        case 'pak_ar':
            return 'pak_en';
        default:
            return 'ar';
    }
};

export function convertEnglishNumber(number) {
    const persianNumbers = [
        /۰/g,
        /۱/g,
        /۲/g,
        /۳/g,
        /۴/g,
        /۵/g,
        /۶/g,
        /۷/g,
        /۸/g,
        /۹/g
    ];
    const arabicNumbers = [
        /٠/g,
        /١/g,
        /٢/g,
        /٣/g,
        /٤/g,
        /٥/g,
        /٦/g,
        /٧/g,
        /٨/g,
        /٩/g
    ];
    if (typeof number === 'string') {
        for (let i = 0; i < 10; i++) {
            number = number
                .replace(persianNumbers[i], i)
                .replace(arabicNumbers[i], i);
        }
    } else {
        number = `${number}`;
        for (let i = 0; i < 10; i++) {
            number = number
                .replace(persianNumbers[i], i)
                .replace(arabicNumbers[i], i);
        }
    }
    return number;
}

export const checkValidSubdomain = subdomain => {
    const validSubdomain = ['sa', 'kw', 'om', 'bh', 'qa', 'ae', 'pk'];
    return validSubdomain.includes(subdomain);
};

export const checkVaidLanguage = lang => {
    const validLanguage = ['en', 'ar'];
    return validLanguage.includes(lang);
};

export const checkCorrectSubdomain = subdomain => {
    if (checkValidSubdomain(subdomain)) {
        return converSubDomainToStoreView(subdomain);
    } else return 'sa';
};

export const checkCorrectLanguage = lang => {
    if (checkVaidLanguage(lang)) {
        return lang;
    } else return null;
};

export const getUrlFromStoreView = (url, storeView, lang) => {
    const urlSplit = url.split('.');
    const temp = _.cloneDeep(urlSplit);
    if (urlSplit.length > 1) {
        if (urlSplit[0] === 'www') {
            const _temp = _.cloneDeep(temp);
            _temp.shift();
            _temp.unshift(storeView);
            _temp.unshift('www');
            return `${_temp.join('.')}/${lang}`;
        } else {
            const __temp = _.cloneDeep(temp);
            if (availableStores.includes(urlSplit[0])) {
                __temp.shift();
            }
            __temp.unshift(storeView);
            return `${__temp.join('.')}/${lang}`;
        }
    }
    return url;
};

/**
 *
 * @param {*} path
 * @returns
 */
export const getUIRenderOfFooter = path => {
    switch (path) {
        case '/':
            return 'default';
        case '/login':
        case '/create-account':
        case '/verification':
        case '/checkout/registration':
            return 'auth';
        default:
            return 'other';
    }
};

export const fetchWishlistItemId = (id, items) => {
    let wishlistItemId = 0;
    if (items?.length !== 0) {
        for (let index = 0; index < items?.length; index++) {
            const element = items[index];
            if (element?.product?.id === id) {
                wishlistItemId = element?.id;
                break;
            }
        }
    }
    return wishlistItemId;
};

/**
 *
 * @param {string} url Url image maybe path or full url
 * @param {*} baseMediaUrl Url base media get from BE
 * @returns {{url: string}}
 */
export const modifyImageUrl = (url, baseMediaUrl) => {
    const _baseMediaUrl = baseMediaUrl.slice(
        0,
        baseMediaUrl.indexOf('/media/')
    );
    if (typeof url === 'string' && url.includes('http')) {
        return url;
    }
    return `${_baseMediaUrl}${url}`;
};

/**
//  * A [React hook] that provides a logger.
//  *
//  * @param {Number} lines A number of lines to show in the console.
//  * @param {String} fileName A fileName to prepend to the log messages.
//  * @param {*} variable A variable wanna log.
//  * @param {*} content A value of variable wanna log.
//  * @returns {Function} If dev mode, return a function to log, otherwise return message error default.
//  * @returns {Boolean} true if dev mode, otherwise false.
//  */
// export const logger = ({ lines, fileName, variable, content, callback }) => {
//     const devEnvironment = process.env.NODE_ENV === 'development';
//     const logger = devEnvironment
//         ? console.log(
//               `file: ${fileName} ~ lines: ${lines} ~ ${variable}`,
//               content
//           )
//         : typeof callback === 'function' && callback();

//     return logger;
// };

export const priceProductSpecialPriceWithRange = price_range => {
    if (price_range && price_range.minimum_price) {
        const { regular_price, final_price } = price_range?.minimum_price || {};
        if (final_price?.value === regular_price?.value) return null;
        return final_price || null;
    }
    return null;
};

export const priceProductMinimumPriceWithRange = price_range => {
    if (price_range && price_range.minimum_price) {
        const { final_price } = price_range.minimum_price;
        return final_price || null;
    }
    return null;
};

export const priceProductRegularPriceWithRange = price_range => {
    if (price_range && price_range.minimum_price) {
        const { regular_price } = price_range.minimum_price;
        return regular_price || null;
    }

    return null;
};

export const priceProductMaximumPriceWithRange = price_range => {
    if (price_range && price_range.maximum_price) {
        const { final_price } = price_range.maximum_price;
        return final_price || null;
    }
    return null;
};
