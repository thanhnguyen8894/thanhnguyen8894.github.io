import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';

import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';

export const wishlistMenuInitial = [
    {
        id: 1,
        key: 'selectAll',
        label: 'Select all'
    },
    {
        id: 2,
        key: 'moveTo',
        label: 'Move to'
    },
    {
        id: 3,
        key: 'remove',
        label: 'Remove'
    }
];

const fetchWishlistItemId = (id, dataWishList) => {
    let wishlistItemId = 0;
    const { items } = dataWishList || {};
    items.forEach(item => {
        if (id === item.product.id) {
            wishlistItemId = item.id;
        }
    });
    return wishlistItemId;
};

const fetchWishlistItemIdWithListId = (listId, dataWishList) => {
    const listWishlistItemId = [];
    listId &&
        listId.map(item => {
            listWishlistItemId.push(fetchWishlistItemId(item, dataWishList));
        });
    return listWishlistItemId;
};

/**
 * @function
 *
 * @param {WishlistQueries} props.queries Wishlist Page queries
 *
 * @returns {WishlistPageProps}
 */
export const useWishlistPage = props => {
    const { queries, mutation, removeWishlistItemMutation } = props;
    const { getCustomerWishlistQuery } = queries;
    const { addSimpleProductToCartMutation } = mutation;

    const history = useHistory();
    const [{ isSignedIn }] = useUserContext();
    const [{ cartId }] = useCartContext();
    const { formatMessage } = useIntl();

    const [wishlistMenu, setWishlistMenu] = useState(wishlistMenuInitial);
    const [productListIdSelected, setProductListIdSelected] = useState([]);
    const [typeProduct, setTypeProduct] = useState([]);
    const [skuData, setSkuData] = useState([]);
    const [wishlistItemId, setWishlistItemId] = useState([]);
    const [message, updateMessage] = useState('');

    const { data, error, loading } = useQuery(getCustomerWishlistQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !isSignedIn
    });

    const [
        fetchCustomerWishlist,
        {
            data: customerWishlistData,
            loading: customerWishlistLoading,
            error: customerWishlistError
        }
    ] = useLazyQuery(getCustomerWishlistQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !isSignedIn
    });

    const [
        removeWishlistItem,
        { loading: removeWishlistItemLoading, error: removeWishlistItemError }
    ] = useMutation(removeWishlistItemMutation);

    const [
        addSimpleProductToCartAction,
        {
            error: addingSimpleProductError,
            loading: addSimpleProductToCartLoading
        }
    ] = useMutation(addSimpleProductToCartMutation);

    const derivedWishlists = useMemo(() => {
        return (
            customerWishlistData?.customer?.wishlist ||
            data?.customer?.wishlist ||
            []
        );
    }, [customerWishlistData, data]);

    const isEnableAction = derivedWishlists?.items_count !== 0;

    const errors = useMemo(() => {
        return new Map([['getCustomerWishlistQuery', error]]);
    }, [error]);

    useEffect(() => {
        if (!isSignedIn) {
            history.push('/');
        }
    }, [history, isSignedIn]);

    // reset menu with status
    const resetMenu = useCallback(
        status => {
            const newList = [...wishlistMenu];
            newList.filter(item => {
                if (status) {
                    if (item.key === 'unSelectAll') {
                        item.key = 'selectAll';
                    }
                } else {
                    if (item.key === 'selectAll') {
                        item.key = 'unSelectAll';
                    }
                }
            });
            setWishlistMenu(newList);
        },
        [wishlistMenu]
    );

    //Reset state
    const handleReset = useCallback(() => {
        setSkuData([]);
        setProductListIdSelected([]);
        setWishlistItemId([]);
        setTypeProduct([]);
        resetMenu(true);
    }, [resetMenu]);

    // handle loading
    useEffect(() => {
        if (productListIdSelected.length === 0) {
            resetMenu(true);
        }
    }, []);

    const errorMessage = useCallback(() => {
        updateMessage(
            formatMessage({
                id: 'priceSummary.errorText',
                defaultMessage:
                    'Something went wrong. Please refresh and try again.'
            })
        );
    }, [formatMessage]);

    // Handle select id and type each product.
    const onSelectProduct = useCallback(
        item => {
            const { id, __typename: type, sku } = item || {};
            let ids = [...productListIdSelected];
            let types = [...typeProduct];
            let skus = [...skuData];
            let wlIds = [...wishlistItemId];

            if (ids.indexOf(id) !== -1) {
                const idIndex = ids.indexOf(id);
                const typeIndex = types.indexOf(type);
                const skuIndex = skus.indexOf(sku);
                const wlIndex = wlIds.indexOf(
                    fetchWishlistItemId(id, derivedWishlists)
                );
                ids.splice(idIndex, 1);
                types.splice(typeIndex, 1);
                skus.splice(skuIndex, 1);
                wlIds.splice(wlIndex, 1);
            } else {
                ids = [...ids, id];
                types = [...types, type];
                skus = [...skus, sku];
                wlIds = [...wlIds, fetchWishlistItemId(id, derivedWishlists)];
            }
            setWishlistItemId(wlIds);
            setSkuData(skus);
            setProductListIdSelected(ids);
            setTypeProduct(types);
            if (ids.length === 0) {
                resetMenu(true);
            } else if (ids.length === derivedWishlists.items_count) {
                resetMenu(false);
            }
        },
        [
            derivedWishlists,
            productListIdSelected,
            resetMenu,
            skuData,
            typeProduct,
            wishlistItemId
        ]
    );

    // Handle select and de-select all.
    const onFilterItem = useCallback(
        id => {
            const newList = [...wishlistMenu];
            newList.filter(item => {
                if (id === 1 && item.id === id) {
                    if (item.key === 'selectAll') {
                        item.key = 'unSelectAll';
                        const { items } = derivedWishlists;
                        const listId =
                            items &&
                            items.map(item => {
                                return item.product.id;
                            });
                        const typeProduct =
                            items &&
                            items.map(item => {
                                return item.product.__typename;
                            });
                        const skuProduct =
                            items &&
                            items.map(item => {
                                return item.product.sku;
                            });
                        setSkuData(skuProduct);
                        setProductListIdSelected(listId);
                        setWishlistItemId(
                            fetchWishlistItemIdWithListId(
                                listId,
                                derivedWishlists
                            )
                        );
                        setTypeProduct(typeProduct);
                    } else {
                        item.key = 'selectAll';
                        handleReset();
                    }
                } else {
                    item.key = item.key;
                }
            });
            setWishlistMenu(newList);
        },
        [wishlistMenu, derivedWishlists, handleReset]
    );

    const canRemoveWishlist =
        wishlistItemId && derivedWishlists && wishlistItemId.length !== 0;

    // Handle remove product from wishlist with an array of product ID
    const handleRemoveProductFromWishlist = useCallback(async () => {
        try {
            if (canRemoveWishlist) {
                const response = await removeWishlistItem({
                    variables: {
                        wishlistId: derivedWishlists.id,
                        wishlistItemsIds: wishlistItemId
                    }
                });
                const user_errors =
                    response?.data?.removeProductsFromWishlist?.user_errors ||
                    [];
                if (user_errors.length === 0) {
                    // Handle success
                    fetchCustomerWishlist({ variables: {} });
                    handleReset();
                } else {
                    // Handle errors
                    errorMessage();
                }
            } else {
                // Handle update message can't now remove
                updateMessage(
                    formatMessage({
                        id: 'wishlistPage.cantRemoveWishlist',
                        defaultMessage:
                            "Sorry, you can't remove, Please choose item need to remove wishlist and try again"
                    })
                );
            }
        } catch (error) {
            errorMessage();
            return;
        }
    }, [
        canRemoveWishlist,
        derivedWishlists.id,
        errorMessage,
        fetchCustomerWishlist,
        formatMessage,
        handleReset,
        removeWishlistItem,
        wishlistItemId
    ]);

    // Check is list product select has ConfigurableProduct or not.
    // So if not we can add to cart
    const checkCanAddtoCart =
        typeProduct &&
        typeProduct.length !== 0 &&
        !typeProduct.includes('ConfigurableProduct');

    // Handle add to cart
    const handleAddToCart = useCallback(async () => {
        if (checkCanAddtoCart) {
            // Create SimpleProductCartItemInput field
            const temp = [];
            skuData.forEach(item => {
                temp.push({ data: { quantity: 1, sku: item } });
            });
            try {
                const response = await addSimpleProductToCartAction({
                    variables: {
                        cartId,
                        cart_items: temp
                    }
                });
                const addSimpleProductsToCart =
                    response?.data?.addSimpleProductsToCart;
                if (addSimpleProductsToCart) {
                    //TODO: handle add success
                    GTMAnalytics.default().trackingAddProduct({
                        ...temp?.item,
                        quantity: temp?.quantity
                    });

                    handleReset();
                } else {
                    //TODO: handle error if add to cart fail
                    errorMessage();
                }
            } catch (error) {
                // handle error
                errorMessage();
                return;
            }
        } else {
            updateMessage(
                formatMessage({
                    id: 'wishlistPage.cantAddToCart',
                    defaultMessage:
                        "You can't add to cart now, maybe have product you must choose option. Please check again."
                })
            );
        }
    }, [
        addSimpleProductToCartAction,
        cartId,
        checkCanAddtoCart,
        errorMessage,
        formatMessage,
        handleReset,
        skuData
    ]);

    // Handle action for each button: select all, move to cart and remove
    const handleAction = useCallback(
        (action, data) => {
            switch (action) {
                case wishlistMenuInitial[0].label:
                    onFilterItem(data);
                    break;
                case wishlistMenuInitial[1].label:
                    handleAddToCart();
                    break;
                case wishlistMenuInitial[2].label:
                    handleRemoveProductFromWishlist();
                    break;
                default:
                    break;
            }
        },
        [handleAddToCart, handleRemoveProductFromWishlist, onFilterItem]
    );

    const errorsMessageGraphql = useMemo(() => {
        deriveErrorMessage([
            error,
            customerWishlistError,
            removeWishlistItemError,
            addingSimpleProductError
        ]);
    }, [
        addingSimpleProductError,
        customerWishlistError,
        error,
        removeWishlistItemError
    ]);

    return {
        errors,
        errorsMessageGraphql: errorsMessageGraphql,
        errorsHandle: message,
        loading:
            loading ||
            removeWishlistItemLoading ||
            customerWishlistLoading ||
            addSimpleProductToCartLoading,
        wishlists: derivedWishlists,
        isEnableAction,
        wishlistMenu,
        productListIdSelected,
        onSelectProduct,
        handleAddToCart,
        onFilterItem,
        handleAction
    };
};

/**
 * JSDoc type definitions
 */

/**
 * GraphQL mutations for the Wishlist Page
 *
 * @typedef {Object} WishlistQueries
 *
 * @property {GraphQLAST} getCustomerWishlistQuery Query to get customer wish lists
 *
 * @see [`wishlistPage.gql.js`]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/WishlistPage/wishlistPage.gql.js}
 * for queries used in Venia
 */

/**
 * GraphQL types for the Wishlist Page
 *
 * @property {Function} Customer.fields.wishlists.read
 *
 * @see [`wishlistPage.gql.js`]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/WishlistPage/wishlistPage.gql.js}
 * for queries used in Venia
 */

/**
 * Props data to use when rendering the Wishlist Item component
 *
 * @typedef {Object} WishlistPageProps
 *
 * @property {Map} errors A map of all the GQL query errors
 * @property {} errorsMessageGraphql A message error form the GQL query response
 * @property {String} errorsHandle A message handle when action fail
 * @property {Boolean} loading Show loading when data calling
 * @property {Object} wishlists List of all customer wishlists
 * @property {Object} wishlistMenu List of action menu include: select all, move to cart, remove from wishlist
 * @property {Boolean} isEnableAction Check is enable action when have data wishlist
 * @property {Array} productListIdSelected A number of ID product selected
 * @property {Function} onSelectProduct Function handle select each product
 * @property {Function} onFilterItem Function handle select all or de-select all product
 * @property {Function} handleAddToCart Function handle add to card for selected product
 * @property {Function} handleAction Function navigation action of menu list.
 */
