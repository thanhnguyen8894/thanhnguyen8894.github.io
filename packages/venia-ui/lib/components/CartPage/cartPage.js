import React, { Fragment, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import _ from 'lodash';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useCartPage } from '@magento/peregrine/lib/talons/CartPage/useCartPage';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Price from '@magento/venia-ui/lib/components/Price';
import { StoreTitle } from '../Head';
import LoadingIndicator from '../LoadingIndicator';
import StockStatusMessage from '../StockStatusMessage';
import ProductListing from './ProductListing';
import PriceSummary from './PriceSummary';
import PopupFreeGifts from './PopupFreeGifts';
import RecommendedProducts from '../RecommendedProducts';
import Button from '../Button';
import FormError from '../FormError';

import defaultClasses from './cartPage.css';
import {
    CLEAR_CART,
    GET_CART_DETAILS,
    ADD_FREE_GIFTS_TO_CART,
    GET_ESTIMATE_SHIPPING_METHOD,
    GET_ESTIMATE_TOTAL_WITH_SHIPPING_METHOD,
    GET_FREE_GIFTS_BY_CART
} from './cartPage.gql';

import Image from '@magento/venia-ui/lib/components/Image';
import { images } from '@magento/venia-ui/lib/constants/images';
import { Link, resourceUrl } from '@magento/venia-drivers';

const CartPage = props => {
    const [{ rtl, mobile, tablet, baseMediaUrl }] = useAppContext();
    const isTabletMobile = () => {
        return mobile || tablet;
    };
    const { formatMessage } = useIntl();
    const classes = mergeClasses(defaultClasses, props.classes);

    const [showModal, setShowModal] = useState(false);
    const [currentEstimateShippings, setCurrentEstimateShippings] = useState({
        countryId: '',
        region: '',
        postcode: ''
    });

    const talonProps = useCartPage({
        queries: {
            clearCart: CLEAR_CART,
            getCartDetails: GET_CART_DETAILS,
            getEstimateShipping: GET_ESTIMATE_SHIPPING_METHOD,
            getEstimateTotalWithShipping: GET_ESTIMATE_TOTAL_WITH_SHIPPING_METHOD,
            getFreeGifts: GET_FREE_GIFTS_BY_CART
        },
        mutation: {
            addFreeGiftsToCart: ADD_FREE_GIFTS_TO_CART
        },
        currentEstimateShippings,
        setCurrentEstimateShippings,
        setShowModal
    });

    const {
        errors,
        banners,
        hasItems,
        cartItems,
        freegifts,
        titleBlock,
        isCartUpdating,
        relatedProducts,
        isDisableCheckout,
        setIsCartUpdating,
        addPromoItemToCart,
        loadingEstimateShipping,
        handleAddFreeGiftsToCart,
        shouldShowLoadingIndicator,
        estimateTotalShippingMethod,
        loadingGetFreeGifts
    } = talonProps;
    const { pwa_image_banner_cart_left, pwa_image_banner_cart_right } =
        banners || {};

    function renderLoading() {
        return (
            <div>
                {loadingEstimateShipping && (
                    <div className={classes.modal_active}>
                        <LoadingIndicator>
                            <FormattedMessage
                                id={'cartPage.loadingEstimateShipping'}
                                defaultMessage={'Loading Estimate Shipping'}
                            />
                        </LoadingIndicator>
                    </div>
                )}
            </div>
        );
    }

    function renderBanners() {
        const conStyles = mobile
            ? classes.headerMobile
            : tablet
            ? classes.headerTablet
            : classes.header;

        const bannerLeft = pwa_image_banner_cart_left
            ? `${baseMediaUrl}snaptec/pwa/${banners.pwa_image_banner_cart_left}`
            : images.bannerCart1;

        const bannerCartRight = pwa_image_banner_cart_right
            ? `${baseMediaUrl}snaptec/pwa/${
                  banners.pwa_image_banner_cart_right
              }`
            : images.bannerCart2;

        return (
            <div className={conStyles}>
                <img
                    className={classes.sectionFirst}
                    alt="banner_cart_left"
                    src={bannerLeft}
                />
                {!isTabletMobile() && (
                    <img
                        className={classes.sectionSecond}
                        alt="banner_cart_right"
                        src={bannerCartRight}
                    />
                )}
            </div>
        );
    }

    function renderHeader() {
        const conStyles = `${classes.heading_container} ${
            mobile ? classes.heading_container_mobile : ''
        } ${tablet ? classes.heading_container_tablet : ''}`;
        return (
            <div className={conStyles}>
                <h1 className={classes.heading}>
                    <FormattedMessage
                        id={'cartPage.heading'}
                        defaultMessage={'Shopping Cart'}
                    />
                </h1>
            </div>
        );
    }

    function renderErrorBlock() {
        return (
            <div className={classes.stockStatusMessageContainer}>
                <StockStatusMessage cartItems={cartItems} />
                {errors && (
                    <FormError
                        classes={{
                            root: classes.formError
                        }}
                        errors={Array.from(errors.values())}
                    />
                )}
            </div>
        );
    }

    function renderFreeGiftsMobbile() {
        return (
            <div>
                {mobile && hasItems && freegifts.length > 0 && (
                    <Button
                        classes={{
                            root_highPriority: classes.addFreeGifts
                        }}
                        onClick={() => {
                            setShowModal(true);
                        }}
                        disabled={false}
                        priority="high"
                        style={rtl ? { float: 'left' } : { float: 'right' }}
                    >
                        <FormattedMessage
                            id={'cartPage.addFreeGifts'}
                            defaultMessage={'Add free gift(s)'}
                        />
                    </Button>
                )}
            </div>
        );
    }

    function renderLableProductListing() {
        return (
            <div>
                {hasItems && !mobile ? (
                    <div className={classes.containerLabel}>
                        <span className={classes.name}>
                            <FormattedMessage
                                id={'cartPage.productNameLabelText'}
                                defaultMessage={'Product Name'}
                            />
                        </span>
                        {/* <span className={classes.priceLabel}>
                            <FormattedMessage
                                id={'cartPage.priceLabelText'}
                                defaultMessage={'Price'}
                            />
                        </span> */}
                        <span className={classes.quantity}>
                            <FormattedMessage
                                id={'cartPage.quantityLabelText'}
                                defaultMessage={'Quantity'}
                            />
                        </span>
                        <span className={classes.subtotal}>
                            <FormattedMessage
                                id={'cartPage.subtotalLabelText'}
                                defaultMessage={'Subtotal'}
                            />
                        </span>
                    </div>
                ) : null}
            </div>
        );
    }

    function renderProductListing() {
        return (
            <div>
                {hasItems ? (
                    <ProductListing
                        setIsCartUpdating={setIsCartUpdating}
                        cartItems={cartItems}
                    />
                ) : (
                    <h3>
                        <FormattedMessage
                            id={'cartPage.emptyCart'}
                            defaultMessage={'There are no items in your cart.'}
                        />
                        <div className={classes.containerButtons}>
                            {/* <Button
                                classes={{
                                    root_highPriority:
                                        classes.buttonContinueShopping
                                }}
                                onClick={() => {
                                    window.open('/', '_self');
                                }}
                                disabled={false}
                                priority="high"
                            >
                                <FormattedMessage
                                    id={'cartPage.continueShoppingText'}
                                    defaultMessage={'Continue Shopping'}
                                />
                            </Button> */}
                            <Link
                                to={resourceUrl('/')}
                                className={classes.buttonContinueShopping}
                            >
                                <FormattedMessage
                                    id={'cartPage.continueShoppingText'}
                                    defaultMessage={'Continue Shopping'}
                                />
                            </Link>
                        </div>
                    </h3>
                )}
            </div>
        );
    }

    function renderActionButtons() {
        return (
            <div>
                {hasItems && !mobile ? (
                    <div className={classes.containerButtons}>
                        {/* <Button
                            classes={{
                                root_highPriority:
                                    classes.buttonContinueShopping
                            }}
                            onClick={() => {
                                window.open('/', '_self');
                            }}
                            disabled={false}
                            priority="high"
                        >
                            <FormattedMessage
                                id={'cartPage.continueShoppingText'}
                                defaultMessage={'Continue Shopping'}
                            />
                        </Button> */}
                        {/* <Button
                            classes={{
                                root_highPriority: classes.buttonUpdateCart
                            }}
                            onClick={() => {
                                window.open('/', '_self');
                            }}
                            disabled={false}
                            priority="high"
                        >
                            <FormattedMessage
                                id={'cartPage.updateCartText'}
                                defaultMessage={'Update Shopping Cart'}
                            />
                        </Button> */}
                        <Link
                            to={resourceUrl('/')}
                            className={classes.buttonContinueShopping}
                        >
                            <FormattedMessage
                                id={'cartPage.continueShoppingText'}
                                defaultMessage={'Continue Shopping'}
                            />
                        </Link>
                        {hasItems && freegifts.length > 0 && (
                            <Button
                                classes={{
                                    root_highPriority: classes.buttonUpdateCart
                                }}
                                onClick={() => {
                                    setShowModal(true);
                                }}
                                disabled={false}
                                priority="high"
                            >
                                <FormattedMessage
                                    id={'cartPage.addFreeGifts'}
                                    defaultMessage={'Add free gift(s)'}
                                />
                            </Button>
                        )}
                    </div>
                ) : null}
            </div>
        );
    }

    function renderSummary() {
        return (
            <div>
                {hasItems && (
                    <div className={classes.adjustmentsContainer}>
                        <div className={classes.rowSumary}>
                            <h2 className={classes.titleSumary}>
                                <FormattedMessage
                                    id={'priceSummary.title'}
                                    defaultMessage={'Summary'}
                                />
                            </h2>
                            <h6 className={classes.countProduct}>
                                {` ${cartItems.length} `}
                                <FormattedMessage
                                    id={'cartPage.items'}
                                    defaultMessage={'items'}
                                />
                            </h6>
                        </div>

                        {estimateTotalShippingMethod && (
                            <div className={classes.estimateShipping}>
                                <div className={classes.lineItems}>
                                    <div className={classes.lineItem}>
                                        <span className={classes.lineItemLabel}>
                                            <FormattedMessage
                                                id={
                                                    'cartPage.subtotalLabelTextSubtotal'
                                                }
                                                defaultMessage={'Subtotal'}
                                            />
                                        </span>
                                        <span className={classes.lineItemValue}>
                                            <Price
                                                value={
                                                    estimateTotalShippingMethod.subtotal
                                                }
                                                currencyCode={
                                                    estimateTotalShippingMethod.currency_code
                                                }
                                            />
                                        </span>
                                    </div>

                                    <div className={classes.lineItem}>
                                        <span className={classes.lineItemLabel}>
                                            <FormattedMessage
                                                id={'orderDetails.shipping'}
                                                defaultMessage={'Shipping'}
                                            />
                                        </span>
                                        <span className={classes.lineItemValue}>
                                            <Price
                                                value={
                                                    estimateTotalShippingMethod.deliveryCharge
                                                }
                                                currencyCode={
                                                    estimateTotalShippingMethod.currency_code
                                                }
                                            />
                                        </span>
                                    </div>

                                    {estimateTotalShippingMethod.discount_amount >
                                        0 && (
                                        <div className={classes.lineItem}>
                                            <span
                                                className={
                                                    classes.lineItemLabel
                                                }
                                            >
                                                <FormattedMessage
                                                    id={'orderDetails.discount'}
                                                    defaultMessage={'Discount'}
                                                />
                                            </span>
                                            <span
                                                className={
                                                    classes.lineItemValue
                                                }
                                            >
                                                <Price
                                                    value={
                                                        estimateTotalShippingMethod.discount_amount
                                                    }
                                                    currencyCode={
                                                        estimateTotalShippingMethod.currency_code
                                                    }
                                                />
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <PriceSummary
                            isUpdating={isCartUpdating}
                            taxAmount={
                                estimateTotalShippingMethod
                                    ? estimateTotalShippingMethod.tax_amount
                                    : null
                            }
                            setIsCartUpdating={setIsCartUpdating}
                            isDisabled={isDisableCheckout}
                        />
                    </div>
                )}
            </div>
        );
    }

    function renderRelatedProducts() {
        // if (!isTabletMobile()) return null;
        return (
            relatedProducts && (
                <div
                    className={`${classes.relatedContainer} ${
                        tablet ? classes.relatedContainer_tablet : ''
                    } ${mobile ? classes.relatedContainer_mobile : ''}`}
                >
                    {!titleBlock && (
                        <h1
                            className={`${classes.heading} ${
                                rtl ? classes.headingRtl : ''
                            }`}
                        >
                            <FormattedMessage
                                id={'cartPage.customerAlsoLike'}
                                defaultMessage={'Customers also like'}
                            />
                        </h1>
                    )}
                    <div>
                        {relatedProducts?.length !== 0 ? (
                            <RecommendedProducts
                                items={relatedProducts}
                                classes={{
                                    root: mobile
                                        ? classes.recommendedProductsMobile
                                        : tablet
                                        ? classes.recommendedProductsTablet
                                        : classes.recommendedProducts
                                }}
                                header={titleBlock}
                            />
                        ) : (
                            <div style={{ marginBottom: '100px' }} />
                        )}
                    </div>
                </div>
            )
        );
    }

    // function renderAdditionalInfo() {
    //     if (isTabletMobile()) return null;
    //     return (
    //         <div className={classes.additionalInfoBlock}>
    //             <div className={classes.additionalInfo}>
    //                 <Image
    //                     alt={'Cart'}
    //                     classes={{ root: classes.image }}
    //                     src={images.CarIcon2}
    //                     width={24}
    //                     height={24}
    //                 />
    //                 <p>
    //                     <FormattedMessage
    //                         id={'cartPage.freeDelivery'}
    //                         defaultMessage={'Free delivery from 49 SAR'}
    //                     />
    //                 </p>
    //             </div>
    //             <div className={classes.additionalInfo}>
    //                 <Image
    //                     alt={'Cart'}
    //                     classes={{ root: classes.image }}
    //                     src={images.ShieldIcon}
    //                     width={24}
    //                     height={24}
    //                 />
    //                 <p>
    //                     <FormattedMessage
    //                         id={'cartPage.secure'}
    //                         defaultMessage={'100% secure payment'}
    //                     />
    //                 </p>
    //             </div>
    //             <div className={classes.additionalInfo}>
    //                 <Image
    //                     alt={'Cart'}
    //                     classes={{
    //                         root: classes.image,
    //                         image: classes.image_2
    //                     }}
    //                     src={images.checkIcon}
    //                     width={18}
    //                     height={18}
    //                 />
    //                 <p>
    //                     <FormattedMessage
    //                         id={'cartPage.savePayment'}
    //                         defaultMessage={'Save payment'}
    //                     />
    //                 </p>
    //             </div>
    //         </div>
    //     );
    // }

    function renderFreeGiftsPopup() {
        return (
            <PopupFreeGifts
                freeGifts={freegifts}
                showModal={showModal}
                isLoading={isCartUpdating}
                setShowModal={setShowModal}
                resultAddToCart={addPromoItemToCart}
                onAddToCart={handleAddFreeGiftsToCart}
            />
        );
    }

    if (shouldShowLoadingIndicator || loadingGetFreeGifts) {
        return (
            <div className={classes.modal_active}>
                <LoadingIndicator global={true}>
                    <FormattedMessage
                        id={'productFullDetail.loading'}
                        defaultMessage={'Loading ...'}
                    />
                </LoadingIndicator>
            </div>
        );
    }

    const contentStyles = mobile
        ? classes.rootMobile
        : tablet
        ? classes.rootTablet
        : classes.root;

    return (
        <Fragment>
            <StoreTitle>
                {formatMessage({
                    id: 'cartPage.title',
                    defaultMessage: 'Cart'
                })}
            </StoreTitle>
            {renderLoading()}
            {renderBanners()}
            <div className={contentStyles}>
                {renderHeader()}
                <div className={classes.body}>
                    <div className={classes.items_container}>
                        {/* {renderErrorBlock()} */}
                        {renderLableProductListing()}
                        {renderProductListing()}
                        {renderActionButtons()}
                        {renderFreeGiftsMobbile()}
                    </div>
                    {renderSummary()}
                </div>
            </div>
            {/* {renderAdditionalInfo()} */}
            {renderRelatedProducts()}
            {renderFreeGiftsPopup()}
        </Fragment>
    );
};

export default CartPage;
