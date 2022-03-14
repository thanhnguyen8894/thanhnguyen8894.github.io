import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Price from '@magento/venia-ui/lib/components/Price';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { useAppContext } from '@magento/peregrine/lib/context/app';

/**
 * A component that renders the shipping summary line item after address and
 * method are selected
 *
 * @param {Object} props.classes
 * @param {Object} props.data fragment response data
 */
const ShippingSummary = props => {
    const classes = mergeClasses({}, props.classes);
    const { data, isCheckout } = props;
    const { formatMessage } = useIntl();
    const [{ storeConfig }] = useAppContext();

    // Don't render estimated shipping until an address has been provided and
    // a method has been selected.
    if (!data.length || !data[0]) {
        return null;
    }

    const { available_shipping_methods, selected_shipping_method } = data[0];

    // if (
    //     !selected_shipping_method ||
    //     !available_shipping_methods.length ||
    //     !available_shipping_methods[0]
    // ) {
    //     return null;
    // }

    const { method_code: mCode = '' } = selected_shipping_method || {};
    let itemResult = undefined;

    available_shipping_methods.forEach(item => {
        const { method_code = '' } = item || {};

        if (method_code === mCode) {
            itemResult = item;
        }
    });

    // if (!itemResult) {
    //     return null;
    // }

    const shipping = itemResult?.amount;

    const shippingLabel = formatMessage({
        id: 'cartPage.shippingVAT',
        defaultMessage: 'Shipping (Inc VAT)'
    });

    // For a value of "0", display "FREE".
    const price = shipping?.value ? (
        <Price
            value={shipping.value}
            currencyCode={shipping.currency}
            decimal
        />
    ) : (
        <span>
            {/* <FormattedMessage id={'global.free'} defaultMessage={'FREE'} /> */}
            <Price value={0} currencyCode={storeConfig?.default_display_currency_code || 'SAR'} />
        </span>
    );

    return (
        <>
            <span className={classes.lineItemLabel}>{shippingLabel}</span>
            <span className={classes.price}>{price}</span>
        </>
    );
};

export default ShippingSummary;
