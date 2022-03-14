import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { AlertCircle as AlertCircleIcon } from 'react-feather';
import { shape, string, object, bool, func, array } from 'prop-types';
import parseHTML from 'html-react-parser';
import { css, Styled } from 'react-css-in-js';
import Countdown, { zeroPad } from 'react-countdown';
import { Link, resourceUrl } from '@magento/venia-drivers';

import { useGalleryItem } from '@magento/peregrine/lib/talons/Gallery/useGalleryItem';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useCatalogContext } from '@magento/peregrine/lib/context/catalog';
import { useToasts } from '@magento/peregrine';
import Price from '@magento/venia-ui/lib/components/Price';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './baseProduct.css';
import Image from '../Image';
import Icon from '../Icon';

import StarIcon from '@magento/venia-ui/venia-static/icons/product/star.png';
import StarNoneIcon from '@magento/venia-ui/venia-static/icons/product/star-none.png';
import TimerIcon from '@magento/venia-ui/venia-static/icons/product/timer.png';
import IconSelected from '@magento/venia-ui/venia-static/icons/selected-product.svg';
import IconSelect from '@magento/venia-ui/venia-static/icons/select-product.svg';

import { ADD_SIMPLE_MUTATION } from '../ProductFullDetail/productFullDetail.gql';
import {
    modifyImageUrl,
    fetchWishlistItemId,
    priceProductRegularPriceWithRange,
    priceProductMaximumPriceWithRange,
    priceProductMinimumPriceWithRange,
    priceProductSpecialPriceWithRange,
} from '@magento/peregrine/lib/util/common';
import { images } from '@magento/venia-ui/lib/constants/images';
import { Spinner } from '@magento/venia-ui/lib/components/LoadingIndicator';
import { isProductConfigurable } from '@magento/peregrine/lib/util/isProductConfigurable';
import { isOutOfStockAllVariants } from '@magento/peregrine/lib/util/isOutOfStockAllVariants';

const Popup = React.lazy(() => import('../Popup/popup'));

const IMAGE_WIDTH = 280;
const IMAGE_HEIGHT = 300;

const errorIcon = (
    <Icon
        src={AlertCircleIcon}
        attrs={{
            width: 18
        }}
    />
);

const BaseProduct = props => {
    const {
        classes: propClasses,
        isLoading,
        item,
        customMobileProductDetails,
        isShowIconSelect,
        onSelectProduct,
        productListIdSelected,
        productOutStock,
        onHandleWishlist,
        derivedWishlists
    } = props;
    const [{ mobile, tablet, subDesktop, baseMediaUrl }] = useAppContext();
    const [, { setProductId }] = useCatalogContext();
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();

    const { price_range } = item || {};

    const specialPrice = useMemo(() => {
        return priceProductSpecialPriceWithRange(price_range);
    }, [item]);
    const oldPrice = useMemo(() => {
        return priceProductRegularPriceWithRange(price_range);
    }, [item]);

    const minPrice = useMemo(() => {
        return priceProductMinimumPriceWithRange(price_range);
    }, [item]);

    const maxPrice = useMemo(() => {
        return priceProductMaximumPriceWithRange(price_range);
    }, [item]);

    const classes = mergeClasses(defaultClasses, propClasses);
    const priceClass = specialPrice ? classes.discountPrice : classes.price;
    const [productLink, setProductLink] = useState('/');
    const division = ':';

    const _isProductConfigurable = isProductConfigurable(item);

    const isOutOfStock = _isProductConfigurable
        ? isOutOfStockAllVariants(item)
        : item?.salable_qty <= 0;

    const heightProductImage = () => {
        if (mobile) {
            return 150;
        }
        if (tablet) {
            return 218;
        }
        if (subDesktop) {
            return 280;
        }
        return IMAGE_HEIGHT;
    };
    const widthProductImage = () => {
        if (mobile) {
            return 150;
        }
        if (tablet) {
            return 218;
        }
        if (subDesktop) {
            return 280;
        }
        return IMAGE_WIDTH;
    };

    useMemo(() => {
        if (item.url_key && item.url_suffix) {
            const link = resourceUrl(
                `/${item.url_key}${item.url_suffix || ''}`
            );
            setProductLink(link);
        }
    }, [item]);

    const seletedProduct = useCallback(
        id => {
            setProductId(id);
        },
        [setProductId]
    );

    const talonProps = useGalleryItem({
        addSimpleProductToCartMutation: ADD_SIMPLE_MUTATION,
        product: item,
        productLink
    });

    const {
        handleAddToCart,
        handleCloseModal,
        modalAddToCart,
        productDetails,
        error
    } = talonProps;

    useEffect(() => {
        if (error) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: error,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [addToast, error]);

    // PRODUCT LABEL
    const imgPosition = position => {
        let cusCss = {
            position: 'absolute',
            zIndex: 2
        };
        if (position.includes('top')) {
            cusCss = {
                ...cusCss,
                top: 0
            };
        }
        if (position.includes('middle')) {
            cusCss = {
                ...cusCss,
                bottom: '33.3%'
            };
        }
        if (position.includes('bottom')) {
            cusCss = {
                ...cusCss,
                bottom: 0
            };
        }
        if (position.includes('left')) {
            cusCss = {
                ...cusCss,
                left: 0
            };
        }
        if (position.includes('center')) {
            cusCss = {
                ...cusCss,
                right: '33.3%'
            };
        }
        if (position.includes('right')) {
            cusCss = {
                ...cusCss,
                right: 0
            };
        }
        return cusCss;
    };

    const txtPosition = image => {
        let txtCss = {};
        if (image) {
            txtCss = {
                position: 'absolute',
                top: '40%',
                right: '10px',
                left: '10px'
            };
        }
        return txtCss;
    };

    const labelProduct =
        item?.label_am_list?.length > 0 &&
        item?.label_am_list.map(label => {
            const { image, name, size, txt, style, position, label_id } = label;
            const sizeImage = size
                ? Math.abs((size / 100) * widthProductImage())
                : 'auto';

            return (
                <div key={label_id} style={imgPosition(position)}>
                    {image && (
                        <img
                            src={modifyImageUrl(`/${image}`, baseMediaUrl)}
                            alt={name}
                            width={sizeImage}
                        />
                    )}
                    <Styled>
                        {css`
                            ${style}
                        `}
                        <label style={txtPosition(image)}>
                            {parseHTML(txt)}
                        </label>
                    </Styled>
                </div>
            );
        });

    const imageStar = (name, active) => {
        return (
            <img
                key={`${Math.random(0, 100)}`}
                alt={name}
                className={classes.starImage}
                src={active ? StarIcon : StarNoneIcon}
                height={24}
                width={24}
            />
        );
    };

    const isFavorite = useMemo(() => {
        return fetchWishlistItemId(item.id, derivedWishlists?.items) > 0
            ? true
            : false;
    }, [derivedWishlists, item.id]);

    const caculateAvgRating = rating_summary => {
        return (rating_summary * 5) / 100;
    };

    const totalStar = rating_summary => {
        const startList = [];
        const temp = rating_summary ? caculateAvgRating(rating_summary) : 0;
        for (let i = 1; i <= 5; i++) {
            if (temp.toFixed(0) >= i) {
                startList.push(imageStar('star', true));
            } else {
                startList.push(imageStar('star', false));
            }
        }
        return startList;
    };

    const renderCountDown = ({ days, hours, minutes, seconds, completed }) => {
        if (completed) {
            return null;
        } else {
            return (
                <div className={classes.productTimer}>
                    <span className={classes.timer}>
                        <span>{days}</span>
                        {division}
                        <span>{zeroPad(hours)}</span>
                        {division}
                        <span>{zeroPad(minutes)}</span>
                        {division}
                        <span className={classes.endTime}>
                            {zeroPad(seconds)}
                        </span>
                    </span>
                    <Image
                        alt="timer"
                        classes={{
                            image: classes.image,
                            root: classes.imageContainer
                        }}
                        height={12}
                        src={TimerIcon}
                        width={11}
                        heightParrentImageAuto
                    />
                </div>
            );
        }
    };

    const caculateDate = dateFromApi => {
        const timeFromApi = Date.parse(dateFromApi.replace(' ', 'T'));
        const timeCurrent = Date.parse(new Date());
        return timeFromApi - timeCurrent;
    };

    const priceBlock = useMemo(() => {
        return _isProductConfigurable ? (
            <Fragment>
                <span className={classes.price}>
                    <Price
                        value={minPrice?.value || 0}
                        currencyCode={minPrice?.currency}
                    />
                </span>
                {' - '}
                <span className={classes.price}>
                    <Price
                        value={maxPrice?.value || 0}
                        currencyCode={maxPrice?.currency}
                    />
                </span>
            </Fragment>
        ) : (
            <Fragment>
                <span className={priceClass}>
                    <Price
                        value={oldPrice?.value || 0}
                        currencyCode={oldPrice?.currency}
                    />
                </span>
                <span className={classes.specialPrice}>
                    {specialPrice && (
                        <Price
                            value={specialPrice?.value || 0}
                            currencyCode={specialPrice?.currency}
                        />
                    )}
                </span>
            </Fragment>
        );
    }, [_isProductConfigurable, minPrice, maxPrice, specialPrice, oldPrice, priceClass]);

    return (
        <div
            className={`${classes.root}
            ${mobile ? classes.rootMobile : ''}
            ${tablet ? classes.rootTablet : ''}
            ${subDesktop ? classes.rootSubDes : ''}
            ${
                customMobileProductDetails
                    ? classes.customMobileProductDetails
                    : ''
            }
        `}
        >
            <div className={classes.productImage}>
                {isShowIconSelect && (
                    <div
                        className={classes.iconSelect}
                        onClick={() => onSelectProduct(item)}
                    >
                        <img
                            alt="icon select"
                            src={
                                productListIdSelected.indexOf(item.id) != -1
                                    ? IconSelected
                                    : IconSelect
                            }
                            width={18}
                            height={18}
                        />
                    </div>
                )}
                <Link
                    to={productLink}
                    className={classes.productImageLink}
                    onClick={() => seletedProduct(item.id)}
                >
                    <Image
                        alt={item.image.label}
                        classes={{
                            image: classes.image,
                            root: classes.imageContainer
                        }}
                        height={heightProductImage()}
                        width={widthProductImage()}
                        src={item.image.url}
                        customMobileProductDetails={customMobileProductDetails}
                    />
                    {labelProduct}
                </Link>

                {!isShowIconSelect && (
                    <button
                        className={`${classes.wishlistArea} ${
                            isFavorite ? classes.wishlistAdded : ''
                        }`}
                        onClick={() => {
                            onHandleWishlist(item);
                        }}
                    >
                        {!isLoading ? (
                            <img
                                alt="wishlist"
                                src={
                                    isFavorite
                                        ? images.heartFillRed
                                        : images.wishListIcon
                                }
                                width={20}
                                height={20}
                            />
                        ) : (
                            <Spinner />
                        )}
                    </button>
                )}
                {item.special_to_date &&
                    caculateDate(item.special_to_date) > 0 && (
                        <Countdown
                            date={
                                Date.now() + caculateDate(item.special_to_date)
                            }
                            renderer={renderCountDown}
                        />
                    )}
            </div>

            <Link
                to={productLink}
                className={classes.productName}
                onClick={() => seletedProduct(item.id)}
            >
                <h2 className={classes.name}>{item.name}</h2>
            </Link>

            <div className={classes.priceProduct}>
                {priceBlock}
            </div>
            {/* <div className={classes.starProduct}>
                {item.rating_summary ? totalStar(item.rating_summary) : null}
            </div> */}

            <div className={classes.actions}>
                {isOutOfStock ? (
                    <button className={classes.addToCart} disabled>
                        {formatMessage({
                            id: 'productFullDetail.soldOut',
                            defaultMessage: 'Sold out'
                        })}
                    </button>
                ) : (
                    <button
                        className={classes.addToCart}
                        disabled={isLoading}
                        onClick={handleAddToCart}
                    >
                        {formatMessage({
                            id: 'wishlistItem.addToCart',
                            defaultMessage: 'Add to Cart'
                        })}
                    </button>
                )}
            </div>
            <Popup
                showModal={modalAddToCart}
                handleCloseModal={handleCloseModal}
                productDetails={productDetails}
                product={item}
            />
        </div>
    );
};
BaseProduct.propTypes = {
    classes: shape({
        root: string
    }),
    isLoading: bool,
    item: object,
    isShowIconSelect: bool,
    onSelectProduct: func,
    productListIdSelected: array
};

BaseProduct.defaultProps = {
    item: {},
    isShowIconSelect: false,
    onSelectProduct: () => {},
    productListIdSelected: []
};

export default BaseProduct;
