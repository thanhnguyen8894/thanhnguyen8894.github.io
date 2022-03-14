import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { AlertCircle as AlertCircleIcon } from 'react-feather';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useCatalogContext } from '@magento/peregrine/lib/context/catalog';
import { useToasts } from '@magento/peregrine';
import { useProduct } from '@magento/peregrine/lib/talons/CartPage/ProductListing/useProduct';
import { Link, resourceUrl } from '@magento/venia-drivers';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

// constant
import { images } from '@magento/venia-ui/lib/constants/images';

// style
import defaultClasses from './product.css';

// components
import Icon from '@magento/venia-ui/lib/components/Icon';
import Image from '@magento/venia-ui/lib/components/Image';
import Price from '@magento/venia-ui/lib/components/Price';
import Button from '@magento/venia-ui/lib/components/Button';
import Quantity from './quantity';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';

// graphql
import {
    GET_CART_DETAILS,
    GET_FREE_GIFTS_BY_CART,
    REMOVE_ITEM_MUTATION,
    UPDATE_QUANTITY_MUTATION
} from '@magento/venia-ui/lib/components/CartPage/cartPage.gql';
import WishButton from '@magento/venia-ui/lib/components/WishButton';

const errorIcon = (
    <Icon
        src={AlertCircleIcon}
        attrs={{
            width: 18
        }}
    />
);

const Product = props => {
    const { formatMessage } = useIntl();
    const [{ mobile, rtl, currentLocation }] = useAppContext();
    const [, { setProductId }] = useCatalogContext();
    const {
        item,
        setActiveEditItem,
        setIsCartUpdating,
        wishIdOfProduct,
        hasWishLists,
        setWishListing,
        wishListId
    } = props;
    const [, { addToast }] = useToasts();
    const talonProps = useProduct({
        item,
        queries: {
            getCartDetails: GET_CART_DETAILS,
            getFreeGifts: GET_FREE_GIFTS_BY_CART
        },
        operations: {
            removeItemMutation: REMOVE_ITEM_MUTATION,
            updateItemQuantityMutation: UPDATE_QUANTITY_MUTATION
        },
        setActiveEditItem,
        setIsCartUpdating
    });

    const {
        product,
        isEditable,
        isFreegift,
        errorMessage,
        handleEditItem,
        handleRemoveFromCart,
        handleUpdateItemQuantity,
        loading
    } = talonProps;

    const {
        id,
        name,
        image,
        urlKey,
        currency,
        quantity,
        urlSuffix,
        unitPrice,
        qtySalable,
        subtotalIncludeTax
    } = product;

    const [showError, setShowError] = useState(false);

    useEffect(() => {
        if (errorMessage) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: errorMessage,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [addToast, errorMessage]);

    const seletedProduct = useCallback(
        id => {
            setProductId(id);
        },
        [setProductId]
    );

    const classes = mergeClasses(defaultClasses, props.classes);

    const isOutOfStock = qtySalable <= 0;
    const messageRemainProduct =
        qtySalable < item?.quantity && !isOutOfStock
            ? formatMessage(
                  {
                      defaultMessage: `Only ${qtySalable} products left in stock!`,
                      id: 'cartPage.remainProduct'
                  },
                  {
                      count: qtySalable
                  }
              )
            : '';

    const buttonClassOutOfStock = isOutOfStock
        ? classes.isOutOfStock
        : classes.button;

    const itemLink = useMemo(
        () => resourceUrl(`/${urlKey}${urlSuffix || ''}`),
        [urlKey, urlSuffix]
    );

    const textFreeGift = (
        <p className={classes.textFreeGift}>
            <FormattedMessage
                id={'cartPage.freeGift'}
                defaultMessage={'Free gift'}
            />
        </p>
    );

    const listButtonsDesktop = (
        <div className={classes.containerButtons}>
            <Button
                classes={{
                    root_lowPriority: classes.button,
                    content: classes.buttonContent
                }}
                onClick={handleRemoveFromCart}
                disabled={false}
                priority="low"
            >
                <Image
                    classes={{ image: classes.removeImage }}
                    alt="Remove"
                    width={20}
                    height={20}
                    src={images.removeIcon}
                />
                <FormattedMessage
                    id={'cartPage.removeText'}
                    defaultMessage={'Remove'}
                />
            </Button>
            <div className={classes.btnWishlist}>
                <WishButton
                    product={item.product}
                    active={hasWishLists}
                    wishIdOfProduct={wishIdOfProduct}
                    wishListId={wishListId}
                    setWishListing={setWishListing}
                    fromCartPage
                    classes={{
                        root: classes.rootBtnWishlist
                    }}
                />
                <FormattedMessage
                    id={'cartPage.moveToFavorite'}
                    defaultMessage={'Add to favorite'}
                />
            </div>
        </div>
    );

    const listButtons = mobile ? (
        <Button
            classes={{ root_lowPriority: classes.buttonMobile }}
            onClick={handleRemoveFromCart}
            disabled={false}
            priority="low"
        >
            <FormattedMessage
                id={'cartPage.removeText'}
                defaultMessage={'Remove'}
            />
        </Button>
    ) : (
        listButtonsDesktop
    );

    if (loading) {
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

    return (
        <li className={mobile ? classes.rootMobile : classes.root}>
            <span className={classes.errorText}>{errorMessage}</span>
            <div className={classes.item}>
                <Link
                    to={itemLink}
                    className={classes.imageContainer}
                    onClick={() => seletedProduct(id)}
                >
                    <Image
                        alt={name}
                        classes={{
                            root: classes.imageRoot,
                            image: classes.image
                        }}
                        width={mobile ? 60 : 85}
                        resource={image}
                    />
                </Link>
                <div className={classes.details}>
                    <div className={classes.name}>
                        <Link
                            to={itemLink}
                            onClick={() => seletedProduct(id)}
                            className={classes.productName}
                        >
                            {name}
                        </Link>
                        {mobile && (
                            <div
                                className={`${classes.subTotal} ${
                                    rtl ? classes.subTotalRtl : ''
                                }`}
                            >
                                <Price
                                    currencyCode={currency}
                                    value={isFreegift ? 0 : subtotalIncludeTax}
                                    decimal
                                />
                            </div>
                        )}
                        {!mobile && listButtons}
                        {isOutOfStock && (
                            <p className={classes.textOutOfStock}>
                                <FormattedMessage
                                    id={'product.outOfStock'}
                                    defaultMessage={'Out of stock'}
                                />
                            </p>
                        )}
                        <p className={classes.remainProduct}>
                            {messageRemainProduct}
                        </p>
                        {isFreegift && textFreeGift}
                    </div>
                    {/* <span className={classes.price}>
                        <Price
                            currencyCode={currency}
                            value={isFreegift ? 0 : unitPrice}
                        />
                    </span> */}
                    <div className={classes.quantity}>
                        <Quantity
                            itemId={item.id}
                            initialValue={quantity}
                            qtySalable={qtySalable}
                            isFreeGift={isFreegift}
                            setShowError={setShowError}
                            onChange={handleUpdateItemQuantity}
                            setIsCartUpdating={setIsCartUpdating}
                            classes={{
                                input:
                                    item?.quantity > 10
                                        ? classes.quantityInput
                                        : classes.quantityInputLess,
                                rootCart:
                                    item?.quantity > 10
                                        ? classes.quantityRootCart
                                        : classes.quantityRootCartLess
                            }}
                            fromCart
                        />
                        {mobile && listButtons}
                    </div>
                    {!mobile && (
                        <div
                            className={`${classes.subTotal} ${
                                rtl ? classes.subTotalRtl : ''
                            }`}
                        >
                            <Price
                                currencyCode={currency}
                                value={isFreegift ? 0 : subtotalIncludeTax}
                                decimal
                            />
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
};

export default Product;
