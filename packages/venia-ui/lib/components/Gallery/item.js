import React, { Fragment, useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { AlertCircle as AlertCircleIcon } from 'react-feather';
import { string, number, shape } from 'prop-types';
import { css, Styled } from 'react-css-in-js';
import { Link, resourceUrl } from '@magento/venia-drivers';
import Price from '@magento/venia-ui/lib/components/Price';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { transparentPlaceholder } from '@magento/peregrine/lib/util/images';
import { UNCONSTRAINED_SIZE_KEY } from '@magento/peregrine/lib/talons/Image/useImage';
import { useGalleryItem } from '@magento/peregrine/lib/talons/Gallery/useGalleryItem';
import StarIcon from '@magento/venia-ui/venia-static/icons/product/star.png';
import StarNoneIcon from '@magento/venia-ui/venia-static/icons/product/star-none.png';
import { useCatalogContext } from '@magento/peregrine/lib/context/catalog';

import { mergeClasses } from '../../classify';
import Image from '../Image';
import defaultClasses from './item.css';

import { ADD_SIMPLE_MUTATION } from '../ProductFullDetail/productFullDetail.gql';
import Popup from '../Popup';
import { useToasts } from '@magento/peregrine';
import Icon from '../Icon';
import WishButton from '@magento/venia-ui/lib/components/WishButton/wishButton';

import parseHTML from 'html-react-parser';
import {
    modifyImageUrl,
    priceProductMaximumPriceWithRange,
    priceProductMinimumPriceWithRange,
    priceProductRegularPriceWithRange,
    priceProductSpecialPriceWithRange
} from '@magento/peregrine/lib/util/common';
import { isProductConfigurable } from '@magento/peregrine/lib/util/isProductConfigurable';
import { isOutOfStockAllVariants } from '@magento/peregrine/lib/util/isOutOfStockAllVariants';

// The placeholder image is 1:1, so we should make sure to size our product
// images appropriately.
const IMAGE_WIDTH = 280;
const IMAGE_HEIGHT = 300;

// Gallery switches from two columns to three at 640px.
const IMAGE_WIDTHS = new Map()
    .set(640, IMAGE_WIDTH)
    .set(UNCONSTRAINED_SIZE_KEY, 840);

const ItemPlaceholder = ({ classes }) => (
    <div className={classes.root_pending}>
        <div className={classes.images_pending}>
            <Image
                alt="Placeholder for gallery item image"
                classes={{
                    image: classes.image_pending,
                    root: classes.imageContainer
                }}
                src={transparentPlaceholder}
            />
        </div>
        <div className={classes.name_pending} />
        <div className={classes.price_pending} />
    </div>
);

const errorIcon = (
    <Icon
        src={AlertCircleIcon}
        attrs={{
            width: 18
        }}
    />
);

const GalleryItem = props => {
    const {
        item,
        productOutStock,
        hasWishLists,
        wishListId,
        wishIdOfProduct,
        setWishListing
    } = props;

    const { formatMessage } = useIntl();
    const classes = mergeClasses(defaultClasses, props.classes);
    const [, { addToast }] = useToasts();

    const [{ mobile, tablet, subDesktop, baseMediaUrl }] = useAppContext();
    const [, { setProductId }] = useCatalogContext();

    const heightProductImage = () => {
        if (mobile) {
            return 150;
        }
        if (tablet) {
            return 218;
        }
        if (subDesktop) {
            return 210;
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
            return 210;
        }
        return IMAGE_WIDTH;
    };

    const seletedProduct = useCallback(
        id => {
            setProductId(id);
        },
        [setProductId]
    );

    const {
        id,
        name,
        price,
        price_range,
        special_price,
        small_image,
        url_key,
        url_suffix,
        rating_summary,
        salable_qty,
        label_am_list
    } = item || {};

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

    const priceClass = specialPrice ? classes.oldPrice : classes.price;
    const _isProductConfigurable = isProductConfigurable(item);

    const isOutOfStock = _isProductConfigurable
        ? isOutOfStockAllVariants(item)
        : salable_qty <= 0;

    const productLink = resourceUrl(`/${url_key}${url_suffix || ''}`);

    const talonProps = useGalleryItem({
        addSimpleProductToCartMutation: ADD_SIMPLE_MUTATION,
        product: item,
        productLink
    });

    const {
        error,
        isLoading,
        productDetails,
        modalAddToCart,
        handleAddToCart,
        handleCloseModal
    } = talonProps;

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
        label_am_list?.length > 0 &&
        label_am_list.map(label => {
            const { image, name, size, txt, position, label_id, style } = label;
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
                        {css`${style}`}
                        <label style={txtPosition(image)}>
                            {parseHTML(txt)}
                        </label>
                    </Styled>
                </div>
            );
        });
    // END

    /**
     * Check hidden Product from list
     * out_of_stock_for_saleable_qty_zero: true && salable_qty <=0 hidden
     * out_of_stock_for_saleable_qty_zero: false && salable_qty <=0 sold out
     */
    const isHiddenProductList = salable_qty <= 0 && productOutStock;

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

    const priceForSale = useMemo(() => {
        if (price_range && price_range.minimum_price) {
            const { final_price } = price_range.minimum_price;
            return final_price || null;
        }
        return null;
    }, [item]);

    if (!item) {
        return <ItemPlaceholder classes={classes} />;
    }

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

    const buttonAddToCartOrNot = handleAddToCart => {
        if (isOutOfStock) {
            return (
                <button className={classes.outOfStock} disabled>
                    {formatMessage({
                        id: 'productFullDetail.soldOut',
                        defaultMessage: 'Sold out'
                    })}
                </button>
            );
        } else {
            return (
                <button
                    className={classes.addToCart}
                    onClick={handleAddToCart}
                    disabled={isLoading}
                >
                    {formatMessage({
                        id: 'wishlistItem.addToCart',
                        defaultMessage: 'Add to Cart'
                    })}
                </button>
            );
        }
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
            className={
                mobile
                    ? classes.rootMobile
                    : tablet
                    ? classes.rootTablet
                    : subDesktop
                    ? classes.rootSubDes
                    : classes.root
            }
            style={{ display: isHiddenProductList ? 'none' : '' }}
        >
            <Link
                to={productLink}
                className={classes.images}
                onClick={() => seletedProduct(id)}
            >
                <Image
                    alt={name}
                    classes={{
                        image: classes.image,
                        root: classes.imageContainer
                    }}
                    resource={small_image}
                    height={heightProductImage()}
                    width={widthProductImage()}
                />
                {labelProduct}
            </Link>
            <div className={classes.wishlistArea}>
                <WishButton
                    product={item}
                    active={hasWishLists}
                    wishIdOfProduct={wishIdOfProduct}
                    wishListId={wishListId}
                    setWishListing={setWishListing}
                />
            </div>
            <Link
                to={productLink}
                className={classes.nameProduct}
                onClick={() => seletedProduct(id)}
            >
                <h2 className={classes.name}>{name}</h2>
            </Link>
            <div className={classes.priceProduct}>{priceBlock}</div>
            {/* <div className={classes.starProduct}>
                {rating_summary ? totalStar(rating_summary) : null}
            </div> */}
            <div className={classes.actions}>
                {buttonAddToCartOrNot(handleAddToCart)}
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

GalleryItem.propTypes = {
    classes: shape({
        image: string,
        imageContainer: string,
        imagePlaceholder: string,
        image_pending: string,
        images: string,
        images_pending: string,
        nameProduct: string,
        name: string,
        name_pending: string,
        priceProduct: string,
        specialPrice: string,
        price: string,
        price_pending: string,
        starProduct: string,
        starImage: string,
        actions: string,
        addToCart: string,
        root: string,
        rootMobile: string,
        root_pending: string
    }),
    item: shape({
        id: number.isRequired,
        name: string.isRequired,
        small_image: string.isRequired,
        url_key: string.isRequired,
        special_price: number,
        price: shape({
            regularPrice: shape({
                amount: shape({
                    value: number.isRequired,
                    currency: string.isRequired
                }).isRequired
            }).isRequired
        }).isRequired
    })
};

export default GalleryItem;
