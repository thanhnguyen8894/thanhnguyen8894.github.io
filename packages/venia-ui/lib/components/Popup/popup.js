import React, { Fragment, useMemo } from 'react';
import { X as CloseIcon } from 'react-feather';
import ReactModal from 'react-modal';
import { FormattedMessage, useIntl } from 'react-intl';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import Price from '@magento/venia-ui/lib/components/Price';
import { Link, resourceUrl } from '@magento/venia-drivers';

import defaultClasses from './popup.css';
import Icon from '../Icon';
import Image from '../Image';

import {
    priceProductMaximumPriceWithRange,
    priceProductMinimumPriceWithRange,
    priceProductRegularPriceWithRange,
    priceProductSpecialPriceWithRange
} from '@magento/peregrine/lib/util/common';

const Popup = props => {
    const { showModal, handleCloseModal, productDetails, product } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const [{ mobile, tablet, rtl }] = useAppContext();

    const {
        name,
        price,
        special_price,
        color,
        material,
        dimensions,
        thumbnailImage,
        quantity_addCart,
        color_select,
        __typename,
        price_range
    } = productDetails;

    const regularPriceClassName = special_price
        ? classes.price
        : classes.specialPrice;
        
    const customStyles = {
        overlay: {
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
        },
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: rtl ? '-70%' : '-50%',
            transform: 'translate(-50%, -50%)',
            padding: mobile ? '15px' : '30px',
            overflowY: 'auto',
            maxHeight: '-webkit-fill-available',
            width: mobile || tablet ? '100%' : 'auto',
            height: 'auto'
        }
    };

    const lineItem = (name, item) => {
        return (
            <div className={classes.lineItems}>
                <span className={classes.lineItemLabel}>
                    <FormattedMessage
                        id={`productFullDetail.${name}`}
                        defaultMessage={`${name}`}
                    />
                </span>
                <span className={classes.lineItemText}>{item}</span>
            </div>
        );
    };

    const optionColor = (
        <span
            style={{ backgroundColor: color_select ? color_select : color }}
            className={classes.optionColor}
        />
    );

    const isProductConfigurable = __typename === 'ConfigurableProduct' || false;

    const specialPrice = useMemo(() => {
        return priceProductSpecialPriceWithRange(price_range);
    }, [price_range]);

    const oldPrice = useMemo(() => {
        return priceProductRegularPriceWithRange(price_range);
    }, [price_range]);

    const minPrice = useMemo(() => {
        return priceProductMinimumPriceWithRange(price_range);
    }, [price_range]);

    const maxPrice = useMemo(() => {
        return priceProductMaximumPriceWithRange(price_range);
    }, [price_range]);

    const priceClass = specialPrice ? classes.regularPrice : classes.price;

    const pricePopup = (
        <section
            className={`${classes.productPrice} ${
                mobile ? classes.productPriceMobile : ''
            }`}
        >
            {
                isProductConfigurable ? (
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
                )
            }
            {/* {special_price && (
                <div className={classes.specialPrice}>
                    <Price
                        currencyCode={price.currency}
                        value={special_price}
                    />
                </div>
            )}
            <div className={regularPriceClassName}>
                <Price currencyCode={price.currency} value={price.value} />
            </div> */}
        </section>
    );

    return (
        <ReactModal
            isOpen={showModal}
            style={customStyles}
            shouldCloseOnOverlayClick={true}
            contentLabel="View Cart or Continue Shopping"
            ariaHideApp={false}
            onRequestClose={handleCloseModal}
        >
            <div className={classes.modalAddToCart}>
                <button
                    className={`${rtl ? classes.buttonRtl : classes.button}`}
                    onClick={handleCloseModal}
                >
                    <Icon src={CloseIcon} />
                </button>
                <h3 className={classes.titleModal}>
                    <FormattedMessage
                        id={'productFullDetail.addToCartPopup'}
                        defaultMessage={'Items was add to cart'}
                    />
                </h3>
                <div className={classes.info}>
                    <Image
                        src={thumbnailImage}
                        alt="productimagereview"
                        classes={{ image: classes.img }}
                    />
                    <div className={classes.detail}>
                        <p>{name}</p>
                        <section className={classes.miniDetails}>
                            {lineItem('price', pricePopup)}
                            {/* {lineItem('material', material || 'none')}
                            {lineItem('dimensions', dimensions || 'none')}
                            {lineItem('color', optionColor)} */}
                            {lineItem('quantity', quantity_addCart)}
                        </section>
                    </div>
                </div>
                <div className={classes.footerModal}>
                    <button
                        className={classes.continueShoppingButton}
                        onClick={handleCloseModal}
                    >
                        <FormattedMessage
                            id={'productFullDetail.goToShop'}
                            defaultMessage={'Go to shop'}
                        />
                    </button>
                    <button className={classes.viewCartButton} onClick={handleCloseModal}>
                        <Link to={resourceUrl('/cart')}>
                            <FormattedMessage
                                id={'productFullDetail.viewCart'}
                                defaultMessage={'View cart'}
                            />
                        </Link>
                    </button>
                </div>
            </div>
        </ReactModal>
    );
};

export default Popup;
