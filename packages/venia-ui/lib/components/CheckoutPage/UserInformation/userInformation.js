import React from 'react';
import { BrowserPersistence } from '@magento/peregrine/lib/util';

//Helper
import {
    getCountryCodeByCountry,
    getPhoneImgByCountry,
    getPhoneMaskByCountry
} from '@magento/peregrine/lib/util/common';

//Components
import PhoneInputCustom from '@magento/venia-ui/lib/components/PhoneInputCustom/phoneInputCustom';

const storage = new BrowserPersistence();

const UserInformation = props => {
    const { classes: propClasses, data } = props || {};

    const storeCodeTwoLetter =
        storage.getItem('store_view_country')?.toLowerCase() || 'sa';
    const defaultPhoneCode = getCountryCodeByCountry(storeCodeTwoLetter);

    const { customer } = data || {};
    const { customer_mobile = '' } = customer || {};
    const phone = customer_mobile?.replace(defaultPhoneCode, '');

    return (
        <div>
            <PhoneInputCustom
                countryCode={defaultPhoneCode}
                countryImg={getPhoneImgByCountry(storeCodeTwoLetter)}
                mask={getPhoneMaskByCountry(storeCodeTwoLetter)}
                value={phone}
                disabled={true}
            />
        </div>
    );
};

export default UserInformation;
