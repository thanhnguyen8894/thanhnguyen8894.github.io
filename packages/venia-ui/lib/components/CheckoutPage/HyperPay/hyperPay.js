import React, { Fragment, useEffect, useMemo } from 'react';
import { shape, string } from 'prop-types';

import { useHistory, useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

//Hooks
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useHyperPay } from '@magento/peregrine/lib/talons/CheckoutPage/useHyperPay';

//Styles
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './hyperPay.css';

//Constants
import { PAYMENT_METHODS } from '@magento/peregrine/lib/util/common';
import { images } from '@magento/venia-ui/lib/constants/images';

const HyperPay = props => {
    const { classes: propClasses } = props;
    const classes = mergeClasses(defaultClasses, propClasses);
    const [{ mobile, tablet, rtl, baseMediaUrl }] = useAppContext();
    const isTabletOrMobile = () => {
        return mobile || tablet;
    };

    const history = useHistory();
    const talonProps = useHyperPay({});
    const { banners } = talonProps;
    const { pwa_image_banner_checkout_left, pwa_image_banner_checkout_right } =
        banners || {};
    const hostLocation = window.location.origin;

    const getParamValue = (parameter = '', location = window.location) => {
        const params = new URLSearchParams(location.search);

        return params.get(parameter) || '';
    };

    const { checkoutId, orderNumber, brandName } = useParams();

    // default is Dev env
    // let CHECKOUT_LINK = 'https://test.oppwa.com/v1/paymentWidgets.js?checkoutId=';
    // if (process.env.NODE_ENV === 'production') {
    // CHECKOUT_LINK = 'https://oppwa.com/v1/paymentWidgets.js?checkoutId=';
    // }
    const CHECKOUT_LINK = 'https://oppwa.com/v1/paymentWidgets.js?checkoutId=';
    const loadScripts = (scriptId, src, text, callback) => {
        const existingScript = document.getElementById(scriptId);
        if (existingScript && scriptId === 'hyperPayForm')
            existingScript.remove();
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            if (src) {
                script.src = src;
            }
            if (text) {
                script.text = text;
            }
            script.id = scriptId;
            script.type = 'text/javascript';
            script.async = true;
            document.getElementsByTagName('head')[0].appendChild(script);
            script.onload = () => {
                if (callback) callback();
            };
        }
        if (document.getElementById(scriptId) && callback) callback();
    };

    useEffect(() => {
        history.listen(action => {
            if (action.pathname === '/checkout') {
                // Handle back event
                // we will cancel the order
                action.state = { orderNumber };
            }
        });
    }, [history, orderNumber]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!checkoutId) {
            return null;
        }

        const total = getParamValue('total', window.location);

        const wpwlOptions = `
            var threeDIframeElement;
            var runSizeIFrame = function() {
                // set countdown 2 seconds
                if (threeDIframeElement) {
                    var timeleft = 20;
                    var downloadTimer = setInterval(function() {
                        if(timeleft <= 0) {
                            clearInterval(downloadTimer);
                        }
                        threeDIframeElement.style.width = '400px';
                        threeDIframeElement.setAttribute('width', '400px');
                        threeDIframeElement.setAttribute('scrolling', 'yes');
                        timeleft -= 1;
                    }, 2000);
                }
            };

            var wpwlOptions = {
                style: "card",
                paymentTarget: "_top",
                onReadyIframeCommunication: function() {
                    // this.$iframe.height();
                },
                onLoadThreeDIframe: function() {
                    if (this) {
                        threeDIframeElement = this;
                        runSizeIFrame();
                    }
                }
            };
            wpwlOptions.locale = "${rtl ? 'ar' : 'en'}";
            wpwlOptions.onError = function(error) {
                console.log("error ", error);
                // check if shopper payed after 30 minutes aka checkoutid is invalid
                if (error.name === "InvalidCheckoutIdError") {
                    //doSomething();
                } else if (error.name === "WidgetError") {
                    console.log("here we have extra properties: ");
                    console.log(error.brand + " and " + error.event);
                }
                // read the error message
                console.log(error.message);
            };
        `;

        const applePayOptions = `
            var currency = "SAR";
            var countryCode = "SA";
            var applePayTotalLabel = "Arabian Oud Online Store";
            var merchantIdentifier = "merchant.eddy.applepay;
            
            function getAmount() {
                return ${total};
            }
            
            function getTotal() {
                return {
                    label: applePayTotalLabel,
                    amount: getAmount()
                };
            }
            
            function getLineItems() {
                return [];
            }
            
            var wpwlOptions = {
                style: "card",
                paymentTarget: "_top",
                applePay: {
                    version: 3,
                    
                    displayName: applePayTotalLabel,
            
                    total: getTotal(),
                    
                    currencyCode: currency,
            
                    checkAvailability: "canMakePayments",
            
                    merchantIdentifier: merchantIdentifier,
            
                    style: "white-with-line",
            
                    countryCode: countryCode,
            
                    merchantCapabilities: ["supports3DS"],
            
                    supportedNetworks: ["amex", "mada", "masterCard", "visa"],
            
                    lineItems: getLineItems(),
            
                    // shippingMethods: [],
            
                    // shippingType: "shipping",
            
                    supportedCountries: ["SA"],
            
                    onCancel: function () {
                        console.log("onCancel");
                    },
            
                    // Triggered when a payment method is selected
                    onPaymentMethodSelected: function (paymentMethod) {
                        console.log("onPaymentMethodSelected: " + paymentMethod.type);
                    },
            
                    // Possible values: email, name, phone, postalAddress, phoneticName
                    // requiredShippingContactFields: ["postalAddress", "email"],
            
                    // Possible values: email, name, phone, postalAddress, phoneticName
                    // requiredBillingContactFields: ["postalAddress", "phone"],
            
                    // Triggered when a shipping contact is selected
                    onShippingContactSelected: function (shippingContact) {
                        console.log("onShippingContactSelected: " + JSON.stringify(shippingContact));
                    },
            
                    // Triggered when a shipping method is selected
                    onShippingMethodSelected: function (shippingMethod) {
                        console.log("onShippingMethodSelected: " + JSON.stringify(shippingMethod));
                    },
            
                    // Triggered when the user has authorized the Apple Pay payment
                    onPaymentAuthorized: function (payment) {
                        console.log("onPaymentAuthorized payment: " + JSON.stringify(payment));
                        
                        // Save payment.shippingContact and payment.billingContact
                        
                        // Because the amount might be changed since the checkout creation, you will need to update it.
                        
                        // Default is SUCCESS, if nothing is returned
                        
                        // An example if you want to return an error
                        /*return {
                            // Possible values: SUCCESS, FAILURE
                            status: "FAILURE",
            
                            errors: [{
                                // Possible values: shippingContactInvalid, billingContactInvalid,
                                // addressUnserviceable
                                code: "shippingContactInvalid",
            
                                // Possible values: phoneNumber, emailAddress, name, phoneticName,
                                // postalAddress, addressLines, locality, subLocality, postalCode,
                                // administrativeArea, subAdministrativeArea, country, countryCode
                                contactField: "phoneNumber",
            
                                message: "Invalid phone number"
                            }]
                        };*/
                    }
                }
            };
        `;

        // load config HyperPay form

        if (brandName === PAYMENT_METHODS.hyper_pay_applepay) {
            loadScripts('configHyperPayForm', null, `${applePayOptions}`);
        } else {
            loadScripts('configHyperPayForm', null, `${wpwlOptions}`);
        }

        const baseUrl = `${CHECKOUT_LINK}${checkoutId}`;
        loadScripts('hyperPayForm', baseUrl, null);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkoutId, brandName]);

    const brands = useMemo(() => {
        if (brandName) {
            switch (brandName) {
                case PAYMENT_METHODS.hyper_pay_mada:
                    return 'MADA';
                case PAYMENT_METHODS.hyper_pay_visa:
                    return 'VISA';
                case PAYMENT_METHODS.hyper_pay_master:
                    return 'MASTER';
                case PAYMENT_METHODS.hyper_pay_applepay:
                    return 'APPLEPAY';
                case PAYMENT_METHODS.hyper_pay_amex:
                    return 'AMEX';
                default:
                    break;
            }
        }
        return 'VISA MASTER MADA APPLEPAY AMEX';
    }, [brandName]);

    const BANNERS = (
        <div
            className={
                isTabletOrMobile() ? classes.headerMobile : classes.header
            }
        >
            <img
                className={classes.sectionFirst}
                alt="banner checkout 1"
                src={
                    pwa_image_banner_checkout_left
                        ? `${baseMediaUrl}snaptec/pwa/${pwa_image_banner_checkout_left}`
                        : images.bannerCheckout1
                }
            />
            {!isTabletOrMobile() && (
                <img
                    className={classes.sectionSecond}
                    alt="banner checkout 2"
                    src={
                        pwa_image_banner_checkout_right
                            ? `${baseMediaUrl}snaptec/pwa/${pwa_image_banner_checkout_right}`
                            : images.bannerCheckout2
                    }
                />
            )}
        </div>
    );

    return (
        <Fragment>
            {BANNERS}
            <h1 className={classes.hyperTitle}>
                <FormattedMessage
                    id={'checkoutPage.hyperPayHeading'}
                    defaultMessage={'Continue with HyperPay'}
                />
            </h1>
            <div
                className={`${classes.root} ${
                    mobile ? classes.rootMobile : ''
                }`}
            >
                <form
                    action={`${hostLocation}/checkout/confirm-payment?orderNumber=${orderNumber}`}
                    className="paymentWidgets"
                    data-brands={brands}
                />
            </div>
        </Fragment>
    );
};

HyperPay.propTypes = {
    classes: shape({
        root: string
    })
};

export default HyperPay;
