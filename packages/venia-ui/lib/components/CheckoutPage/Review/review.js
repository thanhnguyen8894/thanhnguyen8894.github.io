import { Form } from 'informed';
import React, { Fragment, useState, useRef, useMemo, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

//Hooks
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useToasts } from '@magento/peregrine';

//Helper/Constants
import combine from '@magento/venia-ui/lib/util/combineValidators';
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';
import { images } from '@magento/venia-ui/lib/constants/images';

//Styles
import defaultClasses from './review.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

//Components
import Checkbox from '@magento/venia-ui/lib/components/Checkbox';
import Price from '@magento/venia-ui/lib/components/Price';
import TextArea from '@magento/venia-ui/lib/components/TextArea';
import CouponCode from '@magento/venia-ui/lib/components/CartPage/PriceAdjustments/CouponCode';
import TaxSummary from '@magento/venia-ui/lib/components/CartPage/PriceSummary/TaxSummary';
import ShippingSummary from '@magento/venia-ui/lib/components/CartPage/PriceSummary/ShippingSummary';
import DiscountSummary from '@magento/venia-ui/lib/components/CartPage/PriceSummary/DiscountSummary';
import CreditWallet from '@magento/venia-ui/lib/components/CartPage/PriceAdjustments/CreditWallet';

const Review = props => {
    const {
        classes: propClasses,
        addNoteResult,
        cartItems = [],
        priceSummaryData = {},
        isDisablePlaceOrder,
        isDisableSaveMyAddress,
        onSubmitPlaceOrder,
        onCouponActionDoing,
        onCouponActionDone,
        onSubmitNote,
        customerData,
        creditWalletValue,
        storeConfig,
        isSAStore,
        valueDonation,
        setWarningDonation,
        callAddDonationToCart,
        error
    } = props;

    const {
        walletreward_reward_earn_reward_creating_order_enable_create_order: isWalletEnable = '',
        walletreward_wallet_order_allow_max_credit_per_order: walletMaxOrder,
        walletreward_wallet_status: walletStatus,
        walletreward_reward_enable: walletRewardStatus,
        walletreward_reward_earn_reward_creating_order_reward_point: walletRewardPoint,
        walletreward_reward_earn_reward_creating_order_earn_type: walletEarnType,
        walletreward_reward_earn_reward_creating_order_max_reward_per_order: walletMaxRewardPerOrder,
        walletreward_reward_earn_reward_creating_order_min_order_total: walletMinOrderTotal
    } = storeConfig || {};

    const { formatMessage } = useIntl();
    const classes = mergeClasses(defaultClasses, propClasses);
    const [{ mobile }] = useAppContext();
    const [, { addToast }] = useToasts();

    const [isShowCouponCode, setIsShowCouponCode] = useState(false);
    const [isShowNote, setIsShowNote] = useState(false);
    const [isShowCreditWallet, setIsShowCreditWallet] = useState(true);
    const [message, setMessage] = useState(null);
    const formSaveAddressApiRef = useRef();

    useEffect(() => {
        if (message) {
            addToast({
                message: message,
                type: 'error',
                duration: 3000,
                dismissable: true
            });
        }
    }, [addToast, message]);

    const isHaveVitualProduct = useMemo(() => {
        let status = false;
        if (cartItems) {
            cartItems.forEach(item => {
                if (item?.product?.sku === 'rewardpoints') {
                    status = true;
                }
            });
        }

        return status;
    }, [cartItems, isWalletEnable]);

    const isShowWalletFeature = useMemo(() => {
        if (
            walletStatus === '1' &&
            walletRewardStatus === '1' &&
            !isHaveVitualProduct
        ) {
            return true;
        }
        return false;
    }, [isHaveVitualProduct, walletRewardStatus, walletStatus]);

    const isDisable = addNoteResult && addNoteResult.cart;
    const { subtotal, subtotalEx, total, discounts, taxes, shipping, codFee } =
        priceSummaryData || {};

    const { value: subTotalValue = 0, currency: subTotalCurrency = 'SAR' } =
        subtotal || {};
    const { value: totalValue = 0, currency: totalCurrency = 'SAR' } =
        total || {};
    const { value: subTotalExValue = 0, currency: subTotalExCurrency = 'SAR' } =
        subtotalEx || {};

    //walletMinOrderTotal includes tax
    const walletMinOrderTotalValue = parseFloat(walletMinOrderTotal) * 1.15;

    //rewardPoints with walletEarnType = 1 (percent)
    const rewardPointsPercent = useMemo(() => {
        return `${(
            (subTotalExValue * parseFloat(walletRewardPoint)) /
            100
        ).toFixed(2)} ${formatMessage({
            id: 'product.sar',
            defaultMessage: 'SAR'
        })}`;
    }, [subTotalExValue, walletRewardPoint]);

    const walletPoint = useMemo(() => {
        if (walletEarnType === '0') {
            return `${walletRewardPoint}`;
        }
        if (walletEarnType === '1') {
            if (
                parseFloat(rewardPointsPercent) >
                parseFloat(walletMaxRewardPerOrder)
            ) {
                return `${walletMaxRewardPerOrder}`;
            }
            return `${rewardPointsPercent}`;
        }
        return;
    }, [
        rewardPointsPercent,
        walletEarnType,
        walletMaxRewardPerOrder,
        walletRewardPoint
    ]);

    const titleComs = (
        <div className={classes.title}>
            <FormattedMessage
                id={'checkoutPage.reviewTitle'}
                defaultMessage={'Review your requests'}
            />
        </div>
    );

    const productCountComs = (
        <div className={classes.nameCart}>
            <FormattedMessage
                id={'checkoutPage.productInCart'}
                defaultMessage={'Product cart: '}
                values={{ number: cartItems.length }}
            />
        </div>
    );

    const subTotalComs = (
        <div className={`${classes.lineItems} ${classes.linesItemsBold}`}>
            <span className={classes.lineItemLabel}>
                <FormattedMessage
                    id={'miniCart.subtotal'}
                    defaultMessage={'Subtotal'}
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

    const shippingFeeComs = (
        <div className={classes.lineItems}>
            <ShippingSummary
                classes={{
                    lineItemLabel: classes.lineItemLabel,
                    price: classes.price
                }}
                data={shipping || []}
                isCheckout={true}
            />
        </div>
    );

    const { amount: codAmount, label: codLabel } = codFee || {};
    const { value: codValue = 0, currency: codCurrency = 'SAR' } =
        codAmount || {};

    const codFeeComs = codFee && (
        <div className={classes.lineItems}>
            <span
                style={{ color: '#333333' }}
                className={classes.lineItemLabel}
            >
                {codLabel}
            </span>
            <span className={classes.price}>
                <Price value={codValue} currencyCode={codCurrency} decimal />
            </span>
        </div>
    );

    const walletComs =
        creditWalletValue && creditWalletValue !== 0 ? (
            <div className={classes.lineItems}>
                <span
                    style={{ color: '#333333' }}
                    className={classes.lineItemLabel}
                >
                    <FormattedMessage
                        id={'checkoutPage.creditWalletDiscount'}
                        defaultMessage={'Credit Wallet Discount'}
                    />
                </span>
                <span className={classes.price}>
                    <Price
                        value={-creditWalletValue}
                        currencyCode={'SAR'}
                        decimal
                    />
                </span>
            </div>
        ) : null;

    const grandTotalComs = (
        <div className={`${classes.lineItems} ${classes.linesItemsBold}`}>
            <span className={classes.lineItemLabel}>
                <FormattedMessage
                    id={'cartPage.grandTotal'}
                    defaultMessage={'Grand Total'}
                />
            </span>
            <span className={classes.price}>
                <Price
                    value={totalValue}
                    currencyCode={totalCurrency}
                    decimal
                />
            </span>
        </div>
    );

    const taxComs = taxes && taxes.length > 0 && (
        <div className={classes.lineItems}>
            <TaxSummary
                classes={{
                    lineItemLabel: classes.lineItemLabel,
                    price: classes.price
                }}
                data={taxes || []}
                isCheckout={true}
            />
        </div>
    );

    const discountComs = discounts && (
        <div className={classes.lineItems}>
            <DiscountSummary
                classes={{
                    lineItemLabel: classes.lineItemLabel,
                    price: classes.priceDiscount
                }}
                data={discounts || []}
            />
        </div>
    );

    const { customer } = customerData || {};
    const { wallet_credit = '0' } = customer || {};

    const couponComs = (
        <div className={classes.discount}>
            <div className={classes.item}>
                <div className={classes.itemTitle}>
                    <FormattedMessage
                        id={'checkoutPage.useDiscount'}
                        defaultMessage={'Use a discount code'}
                    />
                    <button
                        className={classes.itemExpanded}
                        onClick={() => {
                            setIsShowCouponCode(!isShowCouponCode);
                        }}
                    >
                        <img
                            alt="Expanded button"
                            className={classes.itemExpanded}
                            src={
                                isShowCouponCode
                                    ? images.removeIconCheckout
                                    : images.plusIconCheckout
                            }
                        />
                    </button>
                </div>
                {isShowCouponCode && (
                    <CouponCode
                        setIsCartUpdating={onCouponActionDoing}
                        setUpdateFinish={onCouponActionDone}
                        classes={{
                            entryForm: classes.couponEntryForm
                        }}
                    />
                )}
            </div>

            {/* // => hot fix, need put back when issues slove */}
            {isShowWalletFeature && (
                <div className={classes.item}>
                    <div className={classes.itemTitle}>
                        <FormattedMessage
                            id={'checkoutPage.useCreditWallet'}
                            defaultMessage={'Use credit wallet'}
                        />
                        <button
                            className={classes.itemExpanded}
                            onClick={() => {
                                setIsShowCreditWallet(!isShowCreditWallet);
                            }}
                        >
                            <img
                                alt="Expanded button"
                                className={classes.itemExpanded}
                                src={
                                    isShowCreditWallet
                                        ? images.removeIconCheckout
                                        : images.plusIconCheckout
                                }
                            />
                        </button>
                    </div>
                    {isShowCreditWallet && (
                        <div>
                            <label className={classes.walletLabel}>
                                {formatMessage(
                                    {
                                        id: 'creditWallet.yourWalletCredit',
                                        defaultMessage:
                                            'Your wallet credit: SAR {credit}'
                                    },
                                    {
                                        credit: wallet_credit
                                    }
                                )}
                            </label>
                            <CreditWallet
                                setIsCartUpdating={onCouponActionDoing}
                                setUpdateFinish={onCouponActionDone}
                            />
                            {/* <label className={classes.walletLabel}>
                                {formatMessage(
                                    {
                                        id: 'creditWallet.maximumRedeem',
                                        defaultMessage:
                                            'Maximum Redeemable credit(s) are SAR {credit}'
                                    },
                                    {
                                        credit: walletMaxOrder
                                    }
                                )}
                            </label> */}
                            {walletRewardPoint &&
                                subTotalValue >= walletMinOrderTotalValue && (
                                    <p
                                        className={`${classes.walletLabel} ${
                                            classes.textRewardPoint
                                        }`}
                                    >
                                        {formatMessage(
                                            {
                                                id: 'creditWallet.rewardPoint',
                                                defaultMessage: `You are eligible to earn ${walletPoint} Points when proceeding with this order.`
                                            },
                                            {
                                                credit: walletPoint
                                            }
                                        )}
                                    </p>
                                )}
                        </div>
                    )}
                </div>
            )}

            <div className={classes.item}>
                <div className={classes.itemTitle}>
                    <FormattedMessage
                        id={'checkoutPage.addNote'}
                        defaultMessage={'Add a note'}
                    />
                    <button
                        className={classes.itemExpanded}
                        onClick={() => {
                            setIsShowNote(!isShowNote);
                        }}
                    >
                        <img
                            alt="Expanded button"
                            className={classes.itemExpanded}
                            src={
                                isShowNote
                                    ? images.removeIconCheckout
                                    : images.plusIconCheckout
                            }
                        />
                    </button>
                </div>
                {isShowNote && (
                    <Fragment>
                        <Form className={classes.form} onSubmit={onSubmitNote}>
                            <div className={classes.form_item}>
                                <TextArea
                                    field="note"
                                    validate={combine([isRequired])}
                                    validateOnBlur
                                    disabled={isDisable}
                                    placeholder={
                                        isDisable
                                            ? addNoteResult.cart.customer_note
                                            : formatMessage({
                                                  id: 'checkoutPage.addNote',
                                                  defaultMessage: 'Add a note'
                                              })
                                    }
                                />
                            </div>
                            <button
                                type="submit"
                                className={classes.button}
                                disabled={isDisable}
                            >
                                <FormattedMessage
                                    id={'contactPage.submit'}
                                    defaultMessage={'Submit'}
                                />
                            </button>
                        </Form>
                    </Fragment>
                )}
            </div>

            {/* <div className={classes.item}>
                <div className={classes.itemTitle}>
                    <Form
                        className={classes.saveAddressForm}
                        getApi={formApi =>
                            (formSaveAddressApiRef.current = formApi)
                        }
                    >
                        {!isDisableSaveMyAddress ? (
                            <Checkbox
                                field="isSaveToMyAddress"
                                classes={{ label: classes.myAddress }}
                                label={formatMessage({
                                    id: 'checkoutPage.saveMyAddress',
                                    defaultMessage: 'Save My Address'
                                })}
                                isDisable={isDisableSaveMyAddress}
                            />
                        ) : (
                            <div />
                        )}
                    </Form>
                </div>
            </div> */}
        </div>
    );

    const onSubmitOrder = () => {
        if (isSAStore) {
            const { value } = valueDonation || {};
            if (
                !valueDonation ||
                value == 'Select Donation' ||
                value == 'قم بأختيار جهة التبرع'
            ) {
                setWarningDonation(true);
                // //* Set toast message when click submit placeholder on checkout page
                setMessage(
                    formatMessage({
                        id: 'checkoutPage.donationError',
                        defaultMessage: 'Please select donation.'
                    })
                );
                setTimeout(() => {
                    setMessage(null);
                }, 300);
                return;
            } else if (error && typeof error === 'string' && error === '') {
                callAddDonationToCart();
            }
        }

        let hasSaveAddress = false;
        if (formSaveAddressApiRef && formSaveAddressApiRef.current) {
            hasSaveAddress = formSaveAddressApiRef.current.getValue(
                'isSaveToMyAddress'
            );
        }
        onSubmitPlaceOrder({ isSaveToMyAddress: hasSaveAddress });
    };

    const buttonSubmit = (
        <button
            disabled={isDisablePlaceOrder}
            onClick={() => onSubmitOrder()}
            className={
                isDisablePlaceOrder
                    ? classes.placeOrderButtonDisable
                    : classes.placeOrderButton
            }
        >
            <FormattedMessage
                id={'checkoutPage.placeOrder'}
                defaultMessage={'Place order'}
            />
        </button>
    );

    return (
        <div className={mobile ? classes.rootMobile : classes.root}>
            {titleComs}
            {/* {productCountComs} */}
            {subTotalComs}
            {shippingFeeComs}
            {codFeeComs}
            {walletComs}
            {/* <section className={classes.divider} /> */}
            {grandTotalComs}
            {taxComs}
            {discountComs}
            {couponComs}
            {buttonSubmit}
        </div>
    );
};

export default Review;
