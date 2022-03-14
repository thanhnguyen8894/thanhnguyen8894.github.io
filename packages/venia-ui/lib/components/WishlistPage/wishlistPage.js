import React, { Fragment, useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { AlertCircle as AlertCircleIcon } from 'react-feather';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useWishlistPage } from '@magento/peregrine/lib/talons/WishlistPage/useWishlistPage';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import BaseProduct from '@magento/venia-ui/lib/components/Product/baseProduct';
import { useToasts } from '@magento/peregrine';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

import { fullPageLoadingIndicator } from '../LoadingIndicator';
import defaultClasses from './wishlistPage.css';
import WishlistPageOperations from './wishlistPage.gql';
import ProductFullDetailPageOperations from '../ProductFullDetail/productFullDetail.gql';
import Icon from '../Icon';

const errorIcon = (
    <Icon
        src={AlertCircleIcon}
        attrs={{
            width: 18
        }}
    />
);

const WishlistPage = props => {
    const [{ mobile, tablet }] = useAppContext();
    const talonProps = useWishlistPage({
        ...WishlistPageOperations,
        ...ProductFullDetailPageOperations
    });
    const {
        loading,
        errors,
        wishlists,
        wishlistMenu,
        productListIdSelected,
        onSelectProduct,
        handleAction,
        errorsHandle,
        errorsMessageGraphql,
        isEnableAction
    } = talonProps;
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();
    const error = errors.get('getCustomerWishlistQuery');

    const classes = mergeClasses(defaultClasses, props.classes);
    const WISHLIST_DISABLED_MESSAGE = formatMessage({
        id: 'wishlistPage.wishlistDisabledMessage',
        defaultMessage: 'The wishlist is not currently available.'
    });

    useEffect(() => {
        if (errorsMessageGraphql) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: errorsMessageGraphql,
                dismissable: true,
                timeout: 7000
            });
        }
        if (errorsHandle) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: errorsHandle,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [addToast, errorsHandle, errorsMessageGraphql]);

    //TODO: update value props productOutStock later
    const wishlistElements = useMemo(() => {
        const { items } = wishlists;
        if (items && items.length > 0) {
            return items.map(wishlist => (
                <BaseProduct
                    key={wishlist.id}
                    showTime={false}
                    item={wishlist.product}
                    isShowIconSelect
                    onSelectProduct={onSelectProduct}
                    productListIdSelected={productListIdSelected}
                    productOutStock={false}
                />
            ));
        }
    }, [
        wishlists,
        classes.wishlistRoot,
        onSelectProduct,
        productListIdSelected
    ]);

    const contentMenu = useMemo(() => {
        return wishlistMenu.map(item => {
            return (
                <li
                    className={`${classes.wishlistMenuItem} ${
                        !isEnableAction ? classes.disable : ''
                    }`}
                    key={item.id}
                    onClick={() =>
                        isEnableAction ? handleAction(item.label, item.id) : {}
                    }
                >
                    <FormattedMessage
                        id={`wishlistPage.${item.key}`}
                        defaultMessage={item.label}
                    />
                </li>
            );
        });
    }, [
        classes.disable,
        classes.wishlistMenuItem,
        handleAction,
        isEnableAction,
        wishlistMenu
    ]);

    if (loading && !error) {
        return fullPageLoadingIndicator;
    }

    let content;
    if (error) {
        const derivedErrorMessage = deriveErrorMessage([error]);
        const errorElement =
            derivedErrorMessage === WISHLIST_DISABLED_MESSAGE ? (
                <p>
                    <FormattedMessage
                        id={'wishlistPage.disabledMessage'}
                        defaultMessage={
                            'Sorry, this feature has been disabled.'
                        }
                    />
                </p>
            ) : (
                <p className={classes.fetchError}>
                    <FormattedMessage
                        id={'wishlistPage.fetchErrorMessage'}
                        defaultMessage={
                            'Something went wrong. Please refresh and try again.'
                        }
                    />
                </p>
            );

        content = <div className={classes.errorContainer}>{errorElement}</div>;
    } else {
        content =
            wishlists && wishlists.items && wishlists.items.length > 0 ? (
                <div>
                    <ul className={classes.wishlistMenu}>{contentMenu}</ul>
                    <div className={classes.wishlistsBlock}>
                        {wishlistElements}
                    </div>
                </div>
            ) : (
                <p className={classes.text}>
                    <FormattedMessage
                        id={'wishlistPage.dontHaveWishlist'}
                        defaultMessage={
                            "You don't have any products in your wish list yet."
                        }
                    />
                </p>
            );
    }

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
            <div className={classes.main}>
                <h2 className={classes.title}>
                    <FormattedMessage
                        id={'wishlistPage.title'}
                        defaultMessage={'MY WISHLIST'}
                    />
                </h2>
                <h4 className={classes.subTitle}>
                    <FormattedMessage
                        id={'wishlistPage.wishlistPageText'}
                        defaultMessage={'You can check the list of your wishes'}
                    />
                </h4>
                {content}
            </div>
        </div>
    );
};

export default WishlistPage;
