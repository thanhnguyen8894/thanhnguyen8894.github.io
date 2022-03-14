import React, { Fragment, Suspense, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { gql } from '@apollo/client';
import _ from 'lodash';

//Hooks
import { useProductListing } from '@magento/peregrine/lib/talons/CartPage/ProductListing/useProductListing';

//GraphQL
import { GET_CUSTOMER_WISHLIST_QUERY } from '@magento/peregrine/lib/talons/RootComponents/Category/categoryContent.gql';

//Styles
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './productListing.css';

//Component
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import Product from './product';
import { ProductListingFragment } from './productListingFragments';
const EditModal = React.lazy(() => import('./EditModal'));

/**
 * A child component of the CartPage component.
 * This component renders the product listing on the cart page.
 *
 * @param {Object} props
 * @param {Function} props.setIsCartUpdating Function for setting the updating state of the cart.
 * @param {Object} props.classes CSS className overrides.
 * See [productListing.css]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/ProductListing/productListing.css}
 * for a list of classes you can override.
 *
 * @returns {React.Element}
 *
 * @example <caption>Importing into your project</caption>
 * import ProductListing from "@magento/venia-ui/lib/components/CartPage/ProductListing";
 */
const ProductListing = props => {
    const { setIsCartUpdating, cartItems } = props;
    const talonProps = useProductListing({
        queries: {
            getProductListing: GET_PRODUCT_LISTING,
            getWishListCustomer: GET_CUSTOMER_WISHLIST_QUERY
        }
    });
    const {
        activeEditItem,
        isLoading,
        items,
        setActiveEditItem,
        wishLists
    } = talonProps;
    const { items: wishListItems, id: wishListId } = wishLists || {};
    const [wishListing, setWishListing] = useState(wishListItems || []);

    const classes = mergeClasses(defaultClasses, props.classes);
    const itemComponents = useMemo(() => {
        if (cartItems && cartItems.length > 0) {
            return cartItems.map(item => {
                let hasWishLists = false;
                let wishIdOfProduct = null;
                if (wishListing && wishListing.length) {
                    const productInWishList = _.find(
                        wishListing,
                        d => d.product.id === item.product.id
                    );
                    if (productInWishList) {
                        hasWishLists = true;
                        wishIdOfProduct = productInWishList.id;
                    }
                }
                return (
                    <Product
                        item={item}
                        key={item.id}
                        setActiveEditItem={setActiveEditItem}
                        setIsCartUpdating={setIsCartUpdating}
                        wishIdOfProduct={wishIdOfProduct}
                        hasWishLists={hasWishLists}
                        setWishListing={setWishListing}
                        wishListId={wishListId}
                    />
                );
            });
        }
    }, [
        cartItems,
        setActiveEditItem,
        setIsCartUpdating,
        wishListId,
        wishListing
    ]);

    if (isLoading) {
        return (
            <LoadingIndicator>
                <FormattedMessage
                    id={'productListing.loading'}
                    defaultMessage={'Fetching Cart...'}
                />
            </LoadingIndicator>
        );
    }

    if (cartItems && cartItems.length) {
        return (
            <Fragment>
                <ul className={classes.root}>{itemComponents}</ul>
                <Suspense fallback={null}>
                    <EditModal
                        item={activeEditItem}
                        setIsCartUpdating={setIsCartUpdating}
                        setActiveEditItem={setActiveEditItem}
                    />
                </Suspense>
            </Fragment>
        );
    }

    return null;
};

export const GET_PRODUCT_LISTING = gql`
    query getProductListing($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...ProductListingFragment
        }
    }
    ${ProductListingFragment}
`;

export default ProductListing;
