import React, { Fragment, useEffect, useState } from 'react';
import { shape, string } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useLocation, useHistory } from 'react-router-dom';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './confirmPayment.css';
import Button from '../../Button';
import LoadingIndicator from '../../LoadingIndicator';
import FormError from '../../FormError';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useHyperPay } from '@magento/peregrine/lib/talons/CheckoutPage/useHyperPay';

const ConfirmPayment = props => {
    const { classes: propClasses } = props;
    const classes = mergeClasses(defaultClasses, propClasses);
    const [orderNumber, setOrderNumber] = useState();
    const [checkoutId, setCheckoutId] = useState();
    const [{ cartId }] = useCartContext();

    const talonProps = useHyperPay({
        setCheckoutId,
        setOrderNumber
    });
    const {
        paymentStatusLoading,
        handlePaymentStatus,
        formErrors,
        handleReOrderItems,
        getCartDetailsQuery,
        displayError: hasErrorPayment,
        paymentStatusCalled,
        errorMessagePayment,
        putGGTagsManagerTracking
    } = talonProps;

    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        if (location) {
            const searchParams = location.search;
            const getParameterByName = (name, url = window.location.href) => {
                name = name.replace(/[\[\]]/g, '\\$&');
                const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
                const results = regex.exec(url);
                if (!results) return null;
                if (!results[2]) return '';
                return decodeURIComponent(results[2].replace(/\+/g, ' '));
            };
            if (searchParams) {
                const id = getParameterByName('id');
                if (id) {
                    setCheckoutId(id);
                }
                const orderValue = getParameterByName('orderNumber');
                if (orderValue) {
                    setOrderNumber(orderValue);
                }
            }
        }
    }, [location]);

    useEffect(
        () => {
            if (orderNumber && checkoutId) {
                handlePaymentStatus({
                    orderNumber: orderNumber,
                    checkoutId: checkoutId
                });
            } else if (orderNumber) {
                putGGTagsManagerTracking(orderNumber);
            }
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [orderNumber, checkoutId]
    );

    // re-order when order fails
    useEffect(() => {
        if (
            orderNumber &&
            !hasErrorPayment &&
            errorMessagePayment &&
            paymentStatusCalled
        ) {
            handleReOrderItems({
                variables: { orderNumber },
                refetchQueries: [
                    {
                        query: getCartDetailsQuery,
                        variables: { cartId }
                    }
                ],
                awaitRefetchQueries: true
            });
        }
    }, [
        orderNumber,
        hasErrorPayment,
        errorMessagePayment,
        paymentStatusCalled
    ]);

    const goToHome = () => {
        history.push('/');
    };

    if (paymentStatusLoading) {
        return (
            <div className={classes.modal_active}>
                <LoadingIndicator global>
                    <FormattedMessage
                        id={'checkoutPage.loadingPayment'}
                        defaultMessage={'Loading Payment'}
                    />
                </LoadingIndicator>
            </div>
        );
    }

    return (
        <Fragment>
            <div className={classes.root}>
                {hasErrorPayment && <FormError errors={formErrors} />}

                {/* This case is not finished payment */}
                {paymentStatusCalled &&
                    !hasErrorPayment &&
                    errorMessagePayment &&
                    orderNumber && (
                        <div className={classes.bodyConfirmation}>
                            <div
                                className={`${classes.orderIcon} ${
                                    classes.orderErrorIcon
                                } ${classes.orderErrorIconShow}`}
                            >
                                <span className={classes.orderIconMark}>
                                    <span
                                        className={`${
                                            classes.orderIconMarkLine
                                        } ${classes.orderIconMarkLineLeft}`}
                                    />
                                    <span
                                        className={`${
                                            classes.orderIconMarkLine
                                        } ${classes.orderIconMarkLineRight}`}
                                    />
                                </span>
                            </div>

                            <h1 className={classes.thankYou}>
                                <FormattedMessage
                                    id={'checkoutPage.thankYou'}
                                    defaultMessage={
                                        'Thank you for your order from Arabian Oud'
                                    }
                                />
                            </h1>
                            <h4 className={classes.orderNumber}>
                                {/* <FormattedMessage
                                    id={'order.orderNumberNotSuccess'}
                                    defaultMessage={`Your order number "${orderNumber}" was not completed.`}
                                    values={{
                                        number: orderNumber
                                    }}
                                /> */}
                            </h4>
                            <h4>{errorMessagePayment}</h4>
                        </div>
                    )}

                {!hasErrorPayment && !errorMessagePayment && orderNumber && (
                    <div className={classes.bodyConfirmation}>
                        <div
                            className={`${classes.orderIcon} ${
                                classes.orderIconSuccess
                            }`}
                        >
                            <span
                                className={`${classes.orderIconSuccessLine} ${
                                    classes.orderIconSuccessLineLong
                                }`}
                            />
                            <span
                                className={`${classes.orderIconSuccessLine} ${
                                    classes.orderIconSuccessLineTip
                                }`}
                            />

                            <div
                                className={`${classes.orderIconSuccessRing}`}
                            />
                            <div
                                className={`${
                                    classes.orderIconSuccessHideCorners
                                }`}
                            />
                        </div>

                        <h1 className={classes.thankYou}>
                            <FormattedMessage
                                id={'checkoutPage.thankYou'}
                                defaultMessage={
                                    'Thank you for your order from Arabian Oud'
                                }
                            />
                        </h1>
                        <h4 className={classes.orderNumber}>
                            <FormattedMessage
                                id={'order.orderNumberSuccess'}
                                defaultMessage={`Your order number "${orderNumber}" was completed successfully`}
                                values={{
                                    number: orderNumber
                                }}
                            />
                        </h4>
                        <h4>
                            <FormattedMessage
                                id={'order.subOrderSuccess'}
                                defaultMessage={
                                    'You will be emailed and WhatsApp all the details within 10 min.'
                                }
                            />
                        </h4>
                    </div>
                )}

                <div className={classes.footerConfirmation}>
                    <Button
                        classes={{
                            root_highPriority: classes.buttonContinueShopping
                        }}
                        onClick={() => goToHome()}
                        priority="high"
                    >
                        <FormattedMessage
                            id={'cartPage.continueShoppingText'}
                            defaultMessage={'Continue Shopping'}
                        />
                    </Button>
                </div>
            </div>
        </Fragment>
    );
};

ConfirmPayment.propTypes = {
    classes: shape({
        root: string
    })
};

export default ConfirmPayment;
