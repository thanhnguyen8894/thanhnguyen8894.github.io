import React, { Fragment, useEffect, useState, useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { AlertCircle as AlertCircleIcon } from 'react-feather';

import { useHistory } from 'react-router-dom';

// * TALONS
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useToasts } from '@magento/peregrine';
import { useCheckoutPage } from '@magento/peregrine/lib/talons/CheckoutPage/useCheckoutPage';
// * STYLES
import defaultClasses from './checkoutPage.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

//Constants
import { images } from '@magento/venia-ui/lib/constants/images';

// * COMPONENTS
import Icon from '../Icon';
import Button from '../Button';
import { fullPageLoadingIndicator } from '../LoadingIndicator';
import { StoreTitle } from '../Head';
import UserInformation from './UserInformation';
import Maps from './Maps';
import ShippingAddress from './ShippingAddress';
import ShippingMethod from './ShippingMethod';
import PaymentMethod from './PaymentMethod';
import Review from './Review';
import Donation from './Donation';

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const CheckoutPage = props => {
    const { classes: propClasses } = props;
    const classes = mergeClasses(defaultClasses, propClasses);
    const { formatMessage } = useIntl();
    const [{ mobile, tablet, baseMediaUrl, storeConfig }] = useAppContext();
    const isTabletOrMobile = () => {
        return mobile || tablet;
    };

    const isSAStore = storeConfig?.default_country_code == 'SA';

    const history = useHistory();
    // * TOAST MESSAGE
    const [, { addToast }] = useToasts();
    const [isShowAddress, setIsShowAddress] = useState(false);

    const afterSubmitShippingAddress = useCallback(() => {
        addToast({
            type: 'info',
            message: formatMessage({
                id: 'checkoutPage.confirmationShippingAddress',
                defaultMessage: 'Save Shipping Address successfully'
            }),
            timeout: 5000
        });
    }, [addToast, formatMessage]);

    // * TALONS PROPS
    const talonProps = useCheckoutPage({
        afterSubmitShippingAddress,
        setIsShowAddress
    });

    const {
        addNoteResult,
        customerData,
        cartItems,
        isCartEmpty,
        priceSummaryData,
        orderNumber,
        checkoutId,
        currentLocation,

        currentAddress,
        setCurrentAddress,
        myAddress,
        shippingAddresses,
        defaultMyAddress,

        shippingMethods,
        shippingMethodSelected,
        paymentMethods,
        paymentMethodSelected,
        isShowShippingMethodModal,
        isEditAddress,
        isDisablePlaceOrder,
        isDisableSaveMyAddress,
        isSignedIn,
        error,
        hasError,
        isLoading,
        onChangeAddressFromMap,
        onClickCurrentLocation,
        onChangeShippingMethod,
        onChangePaymentMethod,
        onSubmitPlaceOrder,
        onSaveShippingAddress,
        setIsShowShippingMethodModal,
        onCouponActionDoing,
        onCouponActionDone,
        onSubmitNote,
        banners,
        isCanPayWithApple,
        walletData,

        donationList,
        valueDonation,
        setValueDonation,
        warningDonation,
        setWarningDonation,
        callAddDonationToCart
    } = talonProps;

    const { total } = priceSummaryData || {};
    const { pwa_image_banner_checkout_left, pwa_image_banner_checkout_right } =
        banners || {};

    // * CHECK SIGN-IN
    if (!isSignedIn) {
        history.push('/checkout/registration');
    }

    useEffect(() => {
        if (hasError) {
            const message =
                error && error.message
                    ? error.message
                    : formatMessage({
                          id: 'checkoutPage.errorSubmit',
                          defaultMessage:
                              'Oops! An error occurred while submitting. Please try again.'
                      });
            addToast({
                type: 'error',
                icon: errorIcon,
                message,
                dismissable: true,
                timeout: 7000
            });

            if (process.env.NODE_ENV !== 'production') {
                console.error(error);
            }
        }
    }, [addToast, error, hasError, formatMessage]);

    useEffect(() => {
        if (error && typeof error === 'string' && error !== '') {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error,
                dismissable: true,
                timeout: 7000
            });
        }
        if (process.env.NODE_ENV !== 'production') {
            console.error(error);
        }
    }, [addToast, error]);

    // * RENDER
    const headerComs = (
        <div
            className={
                mobile
                    ? classes.headerMobile
                    : tablet
                    ? classes.headerTablet
                    : classes.header
            }
        >
            <img
                className={classes.sectionFirst}
                alt="banner checkout 1"
                src={
                    pwa_image_banner_checkout_left
                        ? `${baseMediaUrl}snaptec/pwa/${pwa_image_banner_checkout_left}`
                        : mobile
                        ? images.bannerCheckout1Mobile
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

    const pageTitle = formatMessage({
        id: 'checkoutPage.titleCheckout',
        defaultMessage: 'Checkout'
    });

    const userInformation = (
        <div className={classes.userInformation}>
            <div className={classes.title}>
                <FormattedMessage
                    id={'checkoutPage.stepSignIn'}
                    defaultMessage={'1. Sign In'}
                />
            </div>
            <div className={classes.phoneInput}>
                <UserInformation data={customerData} />
            </div>
        </div>
    );

    const shippingMethod = (
        <ShippingMethod
            shippingMethods={shippingMethods}
            shippingMethodSelected={shippingMethodSelected}
            onChangeShippingMethod={onChangeShippingMethod}
        />
    );

    const shippingAddressTemplate = (
        <div className={classes.shippingAddress}>
            <div className={classes.title}>
                <FormattedMessage
                    id={'checkoutPage.stepShippingAddress'}
                    defaultMessage={'2. Shipping Address & Method'}
                />
            </div>
            <div className={classes.subTitle}>
                <FormattedMessage
                    id={'checkoutPage.itemTitle'}
                    defaultMessage={
                        'Add your information for complete identification'
                    }
                />
            </div>
            <Maps
                customerData={customerData}
                currentLocation={currentLocation}
                onChangeLatLng={onChangeAddressFromMap}
                onClickCurrentLocation={onClickCurrentLocation}
            />
            <ShippingAddress
                currentAddress={currentAddress}
                onSave={onSaveShippingAddress}
                isShowAddress={isShowAddress}
                setIsShowAddress={setIsShowAddress}
                isSubmitting={isLoading}
                myAddress={myAddress}
                setCurrentAddress={setCurrentAddress}
                shippingAddresses={shippingAddresses}
                isEditAddress={isEditAddress}
                cartItems={cartItems}
                customerData={customerData}
            />
        </div>
    );

    const paymentMethod = (
        <div className={classes.paymentMethod}>
            <div className={classes.title}>
                <FormattedMessage
                    id={'checkoutPage.stepPaymentMethod'}
                    defaultMessage={'3. Payment Method'}
                />
            </div>
            <div className={classes.subTitle}>
                <FormattedMessage
                    id={'checkoutPage.itemTitle'}
                    defaultMessage={
                        'Add your information for complete identification'
                    }
                />
            </div>
            <PaymentMethod
                paymentMethods={paymentMethods}
                paymentMethodSelected={paymentMethodSelected}
                onChangePaymentMethod={onChangePaymentMethod}
                isCanPayWithApple={isCanPayWithApple}
                cartItems={cartItems}
            />
        </div>
    );

    const reviewPart = (
        <Review
            addNoteResult={addNoteResult}
            checkoutId={checkoutId}
            cartItems={cartItems}
            priceSummaryData={priceSummaryData}
            isDisablePlaceOrder={isDisablePlaceOrder}
            isDisableSaveMyAddress={isDisableSaveMyAddress}
            onSubmitPlaceOrder={onSubmitPlaceOrder}
            onCouponActionDoing={onCouponActionDoing}
            onCouponActionDone={onCouponActionDone}
            onSubmitNote={onSubmitNote}
            customerData={customerData}
            creditWalletValue={walletData?.cart?.applied_wallet_credit}
            storeConfig={storeConfig}
            classes={{
                root: classes.reviewRoot
            }}
            isSAStore={isSAStore}
            valueDonation={valueDonation}
            setWarningDonation={setWarningDonation}
            callAddDonationToCart={callAddDonationToCart}
            error={error}
        />
    );

    const comeBackHome = () => {
        history.push('/');
    };

    const emptyComs = isCartEmpty && !orderNumber && !checkoutId && (
        <div className={classes.emptyCartContainer}>
            <div className={classes.headingContainer}>
                <h1 className={classes.heading}>
                    <FormattedMessage
                        id={'checkoutPage.checkout'}
                        defaultMessage={'Checkout'}
                    />
                </h1>
            </div>
            <h3 className={classes.subHeading}>
                <FormattedMessage
                    id={'checkoutPage.emptyMessage'}
                    defaultMessage={'There are no items in your cart.'}
                />
            </h3>
            <Button
                className={classes.backToHome}
                priority="high"
                type="button"
                onClick={() => comeBackHome()}
            >
                <FormattedMessage
                    id={'checkoutPage.backToHome'}
                    defaultMessage={'Back To Home'}
                />
            </Button>
        </div>
    );

    const donationBlock = (
        <Donation
            donationList={donationList}
            valueDonation={valueDonation}
            setValueDonation={setValueDonation}
            warningDonation={warningDonation}
            setWarningDonation={setWarningDonation}
        />
    );

    const bodyComs = (
        <div>
            {!isCartEmpty && !checkoutId && (
                <div className={classes.container}>
                    <div className={classes.step}>
                        {userInformation}
                        {shippingAddressTemplate}
                        {shippingMethod}
                        {paymentMethod}
                    </div>
                    {isSAStore ? (
                        <div>
                            {donationBlock}
                            {reviewPart}
                        </div>
                    ) : (
                        <>{reviewPart}</>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <Fragment>
            <StoreTitle>{pageTitle}</StoreTitle>
            {headerComs}
            <div
                className={`${classes.root} ${
                    isTabletOrMobile() ? classes.rootMobile : ''
                } ${tablet && classes.rootTablet}`}
            >
                {emptyComs}
                {bodyComs}
            </div>
            {isLoading && fullPageLoadingIndicator}
        </Fragment>
    );
};

export default CheckoutPage;
