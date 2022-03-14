import React, { useState } from 'react';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './paymentMethod.css';
import { PAYMENT_METHODS } from '@magento/peregrine/lib/util/common';

import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';
import { FormattedMessage } from 'react-intl';

const PaymentMethod = props => {
    const {
        classes: propClasses,
        paymentMethods = [],
        paymentMethodSelected = {},
        onChangePaymentMethod,
        isCanPayWithApple,
        cartItems
    } = props;

    const classes = mergeClasses(defaultClasses, propClasses);

    const [isPick, setIsPick] = useState('COD');

    function getIcon(isSelected) {
        if (isSelected) {
            return '/venia-static/icons/radio_on.svg';
        }

        return '/venia-static/icons/radio_off.svg';
    }

    function getPaymentIcon(code) {
        switch (code) {
            case PAYMENT_METHODS.cod:
                return '/venia-static/icons/payment/cod.svg';
            case PAYMENT_METHODS.hyper_pay_mada:
                return '/venia-static/icons/payment/mada.svg';
            case PAYMENT_METHODS.hyper_pay_master:
                return '/venia-static/icons/payment/Mastercard.svg';
            case PAYMENT_METHODS.hyper_pay_visa:
                return '/venia-static/icons/payment/Visa.svg';
            case PAYMENT_METHODS.hyper_pay_applepay:
                return '/venia-static/icons/payment/applepay.svg';
            case PAYMENT_METHODS.hyper_pay_amex:
                return '/venia-static/icons/payment/Amex.svg';
            default:
                break;
        }
    }

    function sentTracking() {
        try {
            let itemsCart = cartItems;

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
                step: 3,
                option: 'Payment Details',
                products: itemsCart
            };
            GTMAnalytics.default().trackingCheckout(params);
        } catch (error) {
            // TODO
        }
    }

    return (
        <div>
            {paymentMethods &&
                paymentMethods.map((item, index) => {
                    const { code = '', title = '' } = item || {};
                    const { code: codeSelected } = paymentMethodSelected || {};
                    const isSelected =
                        code && codeSelected && code === codeSelected;

                    if (
                        code === PAYMENT_METHODS.hyper_pay_applepay &&
                        !isCanPayWithApple
                    ) {
                        return;
                    }

                    return (
                        <div
                            key={`${code}_${index}`}
                            className={`${classes.item} ${
                                isSelected ? classes.active : ''
                            }`}
                            onClick={() => {
                                onChangePaymentMethod(item);
                                sentTracking();
                            }}
                            aria-hidden="true"
                        >
                            <img alt="" src={getIcon(isSelected)} />
                            <div className={classes.text}>
                                <div className={classes.title}>{title}</div>
                                {/* {code === 'cashondelivery' && (
                                    <div className={classes.description}>
                                        <FormattedMessage
                                            id="checkoutPage.codSubTitle"
                                            defaultMessage="An amount of 12 Saudi riyals will be added for the payment of cash on delivery service fees"
                                        />
                                    </div>
                                )} */}
                            </div>
                            <img alt="" src={getPaymentIcon(code)} />
                        </div>
                    );
                })}
        </div>
    );
};

export default PaymentMethod;
