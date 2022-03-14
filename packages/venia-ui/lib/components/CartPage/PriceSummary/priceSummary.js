import React from 'react';
import { gql } from '@apollo/client';
import { FormattedMessage, useIntl } from 'react-intl';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { usePriceSummary } from '@magento/peregrine/lib/talons/CartPage/PriceSummary/usePriceSummary';
import { PriceSummaryFragment } from '@magento/peregrine/lib/talons/CartPage/PriceSummary/priceSummaryFragments.gql';

import Price from '@magento/venia-ui/lib/components/Price';
import Button from '@magento/venia-ui/lib/components/Button';

import CouponCode from '../PriceAdjustments/CouponCode';
import defaultClasses from './priceSummary.css';
import DiscountSummary from './DiscountSummary';
import GiftCardSummary from './giftCardSummary';
import ShippingSummary from './ShippingSummary';
import TaxSummary from './TaxSummary';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

const GET_PRICE_SUMMARY = gql`
    query getPriceSummary($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...PriceSummaryFragment
        }
    }
    ${PriceSummaryFragment}
`;

const PriceSummary = props => {
    const { isUpdating, setIsCartUpdating, taxAmount, isDisabled } = props;

    const [{ mobile, storeConfig }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);
    const talonProps = usePriceSummary({
        queries: {
            getPriceSummary: GET_PRICE_SUMMARY
        }
    });

    const {
        handleProceedToCheckout,
        hasError,
        hasItems,
        isCheckout,
        isLoading,
        flatData
    } = talonProps;
    const { formatMessage } = useIntl();

    if (hasError) {
        return (
            <div className={classes.root}>
                <span className={classes.errorText}>
                    <FormattedMessage
                        id={'priceSummary.errorText'}
                        defaultMessage={
                            'Something went wrong. Please refresh and try again.'
                        }
                    />
                </span>
            </div>
        );
    } else if (!hasItems) {
        return null;
    }

    const { total, discounts, giftCards, shipping, subtotal, taxes } = flatData;

    const isPriceUpdating = isUpdating || isLoading;

    const totalPriceLabel = isCheckout
        ? formatMessage({
              id: 'priceSummary.total',
              defaultMessage: 'Total'
          })
        : formatMessage({
              id: 'priceSummary.orderTotal',
              defaultMessage: 'Order Total'
          });

    const proceedToCheckoutButton = !isCheckout ? (
        <Button
            classes={{ root_highPriority: classes.buttonCheckout }}
            disabled={isPriceUpdating || isDisabled}
            priority={'high'}
            onClick={handleProceedToCheckout}
        >
            <FormattedMessage
                id={'priceSummary.checkoutButton'}
                defaultMessage={'Proceed to Checkout'}
            />
        </Button>
    ) : null;

    const { value: subTotalValue = 0, currency: subTotalCurrency = 'SAR' } =
        subtotal || {};

    const subTotalComs = (
        <div className={classes.lineItems}>
            <span className={classes.lineItemLabel}>
                <FormattedMessage
                    id={'cartPage.subTotalVAT'}
                    defaultMessage={'Cart Subtotal (Inc VAT)'}
                />
            </span>
            <span className={classes.price}>
                <Price
                    value={subTotalValue}
                    currencyCode={subTotalCurrency}
                    decimal
                />
            </span>
        </div>
    );

    const shippingComs =
        shipping && shipping.length > 0 ? (
            <div className={classes.lineItems}>
                <ShippingSummary
                    classes={{
                        lineItemLabel: classes.lineItemLabel,
                        price: classes.priceLight
                    }}
                    data={shipping}
                    isCheckout={false}
                />
            </div>
        ) : (
            <div className={classes.lineItems}>
                <span className={classes.lineItemLabelLight}>
                    <FormattedMessage
                        id={'cartPage.shippingVAT'}
                        defaultMessage={'Shipping (Inc VAT)'}
                    />
                </span>
                <span className={classes.priceLight}>
                    <Price
                        value={0}
                        currencyCode={
                            storeConfig?.default_display_currency_code || 'SAR'
                        }
                    />
                </span>
            </div>
        );

    const taxComs =
        taxes && taxes.length > 0 ? (
            <div className={classes.lineItems}>
                <TaxSummary
                    classes={{
                        lineItemLabel: classes.lineItemLabelLight,
                        price: classes.priceLight
                    }}
                    data={taxes || []}
                    isCheckout={isCheckout}
                />
            </div>
        ) : (
            <div className={`${classes.lineItems} ${classes.lineItemsBold}`}>
                <span className={classes.lineItemLabelLight}>
                    <FormattedMessage
                        id={'orderDetails.tax'}
                        defaultMessage={'Tax'}
                    />
                </span>
                <span className={classes.priceLight}>
                    <Price
                        value={0}
                        currencyCode={
                            storeConfig?.default_display_currency_code || 'SAR'
                        }
                    />
                </span>
            </div>
        );

    return (
        <div className={mobile ? classes.rootMobile : classes.root}>
            {subTotalComs}
            {shippingComs}
            {mobile && <div className={classes.lineDivine} />}
            <div className={classes.lineItemsTotal}>
                <span className={classes.totalLabel}>{totalPriceLabel}</span>
                <span className={classes.priceHeavy}>
                    <Price
                        value={total.value}
                        currencyCode={total.currency}
                        decimal
                    />
                </span>
                <DiscountSummary
                    classes={{
                        lineItemLabel: classes.lineItemLabel,
                        price: classes.priceLight
                    }}
                    data={discounts}
                />
                <GiftCardSummary
                    classes={{
                        lineItemLabel: classes.lineItemLabel,
                        price: classes.priceLight
                    }}
                    data={giftCards}
                />
            </div>
            {taxComs}
            <CouponCode
                setIsCartUpdating={setIsCartUpdating}
                classes={{
                    entryForm: classes.couponEntryForm
                }}
            />
            {proceedToCheckoutButton}
        </div>
    );
};

export default PriceSummary;
