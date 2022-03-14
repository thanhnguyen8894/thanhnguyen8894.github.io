import React, { useMemo, useState } from 'react';
import { string, shape, array } from 'prop-types';
import { useAppContext } from '@magento/peregrine/lib/context/app';

import { mergeClasses } from '../../classify';
import GalleryItem from './item';
import defaultClasses from './gallery.css';

// map Magento 2.3.1 schema changes to Venia 2.0.0 proptype shape to maintain backwards compatibility
const mapGalleryItem = item => {
    const { small_image } = item;
    return {
        ...item,
        small_image:
            typeof small_image === 'object' ? small_image.url : small_image
    };
};

/**
 * Renders a Gallery of items. If items is an array of nulls Gallery will render
 * a placeholder item for each.
 *
 * @params {Array} props.items an array of items to render
 */
const Gallery = props => {
    const [{ mobile, tablet }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);

    const { items, productOutStock, wishLists } = props;
    const { items: wishListItems, id: wishListId } = wishLists || {};
    const [wishListing, setWishListing] = useState(wishListItems || []);

    const galleryItems = useMemo(() => {
        if (items) {
            return items.map((item, index) => {
                const keyValue = `${item?.id}_${index}`;
                if (item === null) {
                    return <GalleryItem key={keyValue} />;
                }
                let hasWishLists = false;
                let wishIdOfProduct = null;
                if (wishListing && wishListing.length) {
                    const productInWishList = _.find(
                        wishListing,
                        d => d.product.id === item.id
                    );
                    if (productInWishList) {
                        hasWishLists = true;
                        wishIdOfProduct = productInWishList.id;
                    }
                }
                return (
                    <GalleryItem
                        key={keyValue}
                        index={index}
                        wishListId={wishListId}
                        wishIdOfProduct={wishIdOfProduct}
                        hasWishLists={hasWishLists}
                        productOutStock={productOutStock}
                        setWishListing={setWishListing}
                        item={mapGalleryItem(item)}
                    />
                );
            });
        }
    }, [items, productOutStock, wishListing]);

    return (
        <div
            className={
                mobile
                    ? classes.rootMobile
                    : tablet
                    ? classes.rootTablet
                    : classes.root
            }
        >
            <div className={classes.items}>{galleryItems}</div>
        </div>
    );
};

Gallery.propTypes = {
    classes: shape({
        items: string,
        root: string,
        rootMobile: string
    }),
    items: array.isRequired
};

export default Gallery;
