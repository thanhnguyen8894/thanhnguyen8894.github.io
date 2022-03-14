import React, { Fragment } from 'react';
import { Meta } from '@magento/venia-ui/lib/components/Head';

const FB_APP_ID = 494788601841040;

const MetaTag = ({ title, desc, image }) => {
    return (
        <Fragment>
            <Meta name="title" content={title} />
            <Meta name="description" content={desc} />
            <Meta
                property="og:title"
                content={
                    title ||
                    'Enjoy shopping at Arabian Oud stores. All you needs in one place'
                }
            />
            <Meta property="og:url" content={window.location.href} />
            <Meta property="og:type" content="website" />

            <Meta
                property="og:description"
                content={desc || 'Arabian Oud Online Store'}
            />
            <Meta
                property="og:image"
                content={image || '/venia-static/icons/app/oudLogo.png'}
            />
            <meta name="twitter:card" content="summary_large_image" />
            <meta
                name="twitter:title"
                content={
                    title ||
                    'Enjoy shopping at Arabian Oud stores. All you needs in one place'
                }
            />
            <meta
                name="twitter:description"
                content={desc || 'Arabian Oud Online Store'}
            />
            <meta name="twitter:image" content={image} />

            <Meta property="fb:app_id" content={FB_APP_ID} />
        </Fragment>
    );
};
export default MetaTag;
