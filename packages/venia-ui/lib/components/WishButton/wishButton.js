import React, { useCallback, useEffect, useState } from 'react';
import { shape, string, bool, object } from 'prop-types';
import { useIntl } from 'react-intl';
import { AlertCircle as AlertCircleIcon } from 'react-feather';

import defaultClasses from './wishButton.css';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Button from '@magento/venia-ui/lib/components/Button';
import Image from '@magento/venia-ui/lib/components/Image';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { Spinner } from '@magento/venia-ui/lib/components/LoadingIndicator';
import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';

// constant
import { images } from '@magento/venia-ui/lib/constants/images';
import { ENABLE_TRACKING } from '@magento/venia-ui/lib/constants/constants';

//Hooks/Redux
import { useToasts } from '@magento/peregrine';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useWishlist } from '@magento/peregrine/lib/talons/Wishlist/useWishlist';

const WishButton = props => {
    const {
        product,
        active,
        wishListId,
        wishIdOfProduct,
        setWishListing,
        fromCartPage
    } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const [{ mobile }] = useAppContext();
    const [{ isSignedIn }] = useUserContext();
    const [, { addToast }] = useToasts();

    const [hasSelected, setSelected] = useState(active);
    useEffect(() => {
        if (!!active || !!wishIdOfProduct) {
            setSelected(true);
        }
    }, [active, wishIdOfProduct]);

    const errorIcon = (
        <Icon
            src={AlertCircleIcon}
            attrs={{
                width: 18
            }}
        />
    );

    const afterAddSuccess = useCallback(() => {
        addToast({
            type: 'success',
            message: formatMessage({
                id: 'wishlist.successMessageGeneral',
                defaultMessage:
                    'Item successfully added to your favorites list.'
            }),
            dismissable: true,
            timeout: 2000
        });
        setSelected(true);
    }, [setSelected, addToast, formatMessage]);

    const afterRemoveSuccess = useCallback(() => {
        addToast({
            type: 'success',
            message: formatMessage({
                id: 'wishlist.remove',
                defaultMessage: 'Item had been remove from your favorites list.'
            }),
            dismissable: true,
            timeout: 2000
        });
        setSelected(false);
    }, [setSelected, addToast, formatMessage]);

    const afterSubmitError = useCallback(
        value => {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: value,
                dismissable: true,
                timeout: 5000
            });
        },
        [addToast, errorIcon]
    );

    const { newWhishList, addWishlist, removeWishlist, loading } = useWishlist({
        isSignedIn,
        wishListId,
        afterAddSuccess,
        afterRemoveSuccess,
        afterSubmitError
    });

    const handleWishListAction = useCallback(() => {
        if (!isSignedIn) {
            addToast({
                type: 'error',
                message: formatMessage({
                    id: 'productFullDetail.loginFirst',
                    defaultMessage: 'Please login first'
                }),
                dismissable: true,
                timeout: 2000
            });
            return;
        }
        if (hasSelected) {
            removeWishlist({ wishListId, wishIdOfProduct });
            if (ENABLE_TRACKING) {
                GTMAnalytics.default().trackingWishlistAction('remove');
            }
        }
        if (!hasSelected) {
            addWishlist(product);
            if (ENABLE_TRACKING) {
                GTMAnalytics.default().trackingWishlistAction('add');
            }
        }
    }, [isSignedIn, product, wishIdOfProduct, hasSelected, wishListId]);

    useEffect(() => {
        if (newWhishList && newWhishList.length) {
            setWishListing(newWhishList);
        }
    }, [newWhishList]);

    const icon = hasSelected
        ? images.heartFillRed
        : fromCartPage
        ? images.wishListIcon
        : images.heartIcon;

    return (
        <Button
            className={`${classes.root} ${mobile ? classes.rootMobile : ''} ${
                hasSelected ? classes.active : ''
            } ${loading ? classes.loading : ''}`}
            priority="high"
            onClick={handleWishListAction}
        >
            {!loading && (
                <Image
                    classes={{ container: classes.heartImage }}
                    alt="Wishlist"
                    width={20}
                    height={20}
                    src={icon}
                />
            )}
            {loading && <Spinner />}
        </Button>
    );
};

WishButton.propTypes = {
    classes: shape({
        root: string
    }),
    product: object,
    active: bool,
    wishListId: string,
    fromCartPage: bool
};

WishButton.defaultProps = {
    product: {},
    active: false,
    fromCartPage: false
};

export default WishButton;
