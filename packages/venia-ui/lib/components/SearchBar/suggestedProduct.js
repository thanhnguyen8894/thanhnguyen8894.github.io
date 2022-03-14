import React, { Fragment, useCallback, useMemo } from 'react';
import { func, number, shape, string } from 'prop-types';
import Price from '@magento/venia-ui/lib/components/Price';
import { mergeClasses } from '../../classify';
import { Link, resourceUrl } from '@magento/venia-drivers';
import { useCatalogContext } from '@magento/peregrine/lib/context/catalog';

import Image from '../Image';
import defaultClasses from './suggestedProduct.css';
import {
    priceProductMaximumPriceWithRange,
    priceProductMinimumPriceWithRange,
    priceProductRegularPriceWithRange,
    priceProductSpecialPriceWithRange
} from '@magento/peregrine/lib/util/common';

const IMAGE_WIDTH = 60;

const SuggestedProduct = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const {
        url_key,
        small_image,
        name,
        onNavigate,
        price,
        price_range,
        special_price,
        url_suffix,
        id,
        __typename
    } = props;

    const [, { setProductId }] = useCatalogContext();

    const handleClick = useCallback(() => {
        if (typeof onNavigate === 'function') {
            onNavigate();
        }
        setProductId(id);
    }, [id, onNavigate, setProductId]);

    const uri = useMemo(() => resourceUrl(`/${url_key}${url_suffix || ''}`), [
        url_key,
        url_suffix
    ]);

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

    const priceBlock = useMemo(() => {
        return isProductConfigurable ? (
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
    }, [isProductConfigurable, minPrice, maxPrice, oldPrice, special_price]);

    return (
        <Link className={classes.root} to={uri} onClick={handleClick}>
            <Image
                alt={name}
                classes={{ image: classes.thumbnail, root: classes.image }}
                resource={small_image}
                width={IMAGE_WIDTH}
            />
            <span className={classes.name}>{name}</span>
            <span className={classes.price}>{priceBlock}</span>
        </Link>
    );
};

SuggestedProduct.propTypes = {
    url_key: string.isRequired,
    small_image: string.isRequired,
    name: string.isRequired,
    onNavigate: func,
    price: shape({
        regularPrice: shape({
            amount: shape({
                currency: string,
                value: number
            })
        })
    }).isRequired,
    classes: shape({
        root: string,
        image: string,
        name: string,
        price: string,
        thumbnail: string
    })
};

export default SuggestedProduct;
