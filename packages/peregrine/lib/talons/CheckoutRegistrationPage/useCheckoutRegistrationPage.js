import { useCallback, useState } from 'react';
import { useQuery } from '@apollo/client';
import {
    checkValidPhoneNumber,
    convertEnglishNumber
} from '@magento/peregrine/lib/util/common';

import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';
import { GET_CART_DETAILS } from '@magento/venia-ui/lib/components/CartPage/cartPage.gql';
import { useCartContext } from '@magento/peregrine/lib/context/cart';

export const useCheckoutRegistrationPage = props => {
    const [phone, setPhone] = useState('');
    const [verifyCode, updateVerifyCode] = useState('');
    const [isValidPhone, updateIsValidPhone] = useState(false);
    const [isValidVerifyCode, updateIsValidVerifyCode] = useState(false);

    const [{ cartId }] = useCartContext();
    const {} = useQuery(GET_CART_DETAILS, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: true,
        variables: { cartId },
        onCompleted: data => {
            sentTracking(data);
        },
        onError: error => {}
    });

    function onChangePhone(value) {
        const _value = convertEnglishNumber(value);
        setPhone(_value);
        updateIsValidPhone(checkValidPhoneNumber(_value));
    }

    const onChangeVerifyCode = useCallback(code => {
        if (!code || code.length < 4) {
            updateIsValidVerifyCode(false);
        } else {
            updateIsValidVerifyCode(true);
            updateVerifyCode(code);
        }
    }, []);

    function sentTracking(data) {
        try {
            let itemsCart = data?.cart?.items;

            itemsCart = itemsCart.map(item => {
                return {
                    name: item?.product?.name || '',
                    id: item?.product?.id || '',
                    price: item?.prices?.price?.value || '',
                    quantity: item?.quantity || '',
                    sku: item?.product?.sku || ''
                };
            });

            const params = {
                step: 2,
                option: 'login/signup',
                products: itemsCart
            };
            GTMAnalytics.default().trackingCheckout(params);
        } catch (error) {
            // TODO
        }
    }

    return {
        isValidPhone,
        isValidVerifyCode,
        onChangePhone,
        onChangeVerifyCode,
        verifyCode,
        phone
    };
};
