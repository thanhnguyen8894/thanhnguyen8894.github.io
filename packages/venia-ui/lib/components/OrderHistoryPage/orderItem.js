import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { Link, resourceUrl } from '@magento/venia-drivers';
import Image from '../Image';
import placeholderImage from '@magento/venia-ui/venia-static/icons/placeholderImage.jpg';

import defaultClasses from './orderItem.css';
import { useCatalogContext } from '@magento/peregrine/lib/context/catalog';

const OrderItem = props => {
    const { classes: propClasses } = props;
    const classes = mergeClasses(defaultClasses, propClasses);
    const { item } = props;
    const [, { setProductId }] = useCatalogContext();

    const seletedProduct = useCallback(
        id => {
            setProductId(id);
        },
        [setProductId]
    );

    const { url_key, url_suffix, thumbnail, id } = item || {};
    const { label, url } = thumbnail || {};
    const productLink = resourceUrl(`/${url_key}${url_suffix || ''}`);
    const link = (productLink.includes('.html') && productLink) || '/';

    return (
        <Link to={link} onClick={() => seletedProduct(id)}>
            <div className={classes.imageContainer}>
                <Image
                    alt={label || ''}
                    classes={{ image: classes.image }}
                    src={url ? url : placeholderImage}
                    width={130}
                    height={130}
                />
            </div>
            <h2 className={classes.title}>
                <FormattedMessage
                    id={'orderDetails.imageTitle'}
                    defaultMessage={
                        (item && item.thumbnail && item.thumbnail.label) ||
                        'Default'
                    }
                />
            </h2>
        </Link>
    );
};

export default OrderItem;
