import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useCartContext } from '@magento/peregrine/lib/context/cart';

//GraphQL
import DEFAULT_OPERATIONS from '../RootComponents/Product/product.gql';
import MAIN_OPERATIONS from '@magento/peregrine/lib/talons/HomePage/homePage.gql';
import ACCOUNT_OPERATIONS from '@magento/peregrine/lib/talons/CheckoutPage/OrderConfirmationPage/createAccount.gql';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';

import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';

//Helper/Constants
import { ENABLE_TRACKING } from '@magento/venia-ui/lib/constants/constants';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';

/**
 * This talon contains logic for a cart page component.
 * It performs effects and returns prop data for rendering the component.
 *
 * This talon performs the following effects:
 *
 * - Manages the updating state of the cart while cart details data is being fetched
 *
 * @function
 *
 * @param {Object} props
 * @param {CartPageQueries} props.queries GraphQL queries
 *
 * @returns {CartPageTalonProps}
 *
 * @example <caption>Importing into your project</caption>
 * import { useCartPage } from '@magento/peregrine/lib/talons/CartPage/useCartPage';
 */
export const useCartPage = props => {
    const operations = mergeOperations(
        DEFAULT_OPERATIONS,
        MAIN_OPERATIONS,
        ACCOUNT_OPERATIONS,
        props.operations
    );
    const { getProductsRelated, createCartMutation } = operations;
    const {
        queries: {
            clearCart,
            getCartDetails,
            getEstimateShipping,
            getEstimateTotalWithShipping,
            getFreeGifts
        },
        mutation: { addFreeGiftsToCart },
        currentEstimateShippings,
        setCurrentEstimateShippings,
        setShowModal
    } = props;

    const [{ cartId }, { resetCart }] = useCartContext();
    const [fetchCartId] = useMutation(createCartMutation);

    const [{ rtl, storeConfig }] = useAppContext();
    const [{ currentUser }] = useUserContext();
    const [isCartUpdating, setIsCartUpdating] = useState(false);

    const { called, data, loading, error } = useQuery(getCartDetails, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        variables: { cartId }
    });

    const {
        data: freeGiftsData,
        loading: loadingGetFreeGifts,
        error: errorGetFreeGifts
    } = useQuery(getFreeGifts, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        variables: { cartId }
    });

    const [
        fetchEstimateShippingMethod,
        { data: estimateShipping, loading: estimateShippingLoading }
    ] = useLazyQuery(getEstimateShipping, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const [
        fetchEstimateTotalWithShippingMethod,
        { data: estimateTotalShipping, loading: estimateTotalShippingLoading }
    ] = useLazyQuery(getEstimateTotalWithShipping, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const [
        onAddFreeGiftsToCart,
        { data: dataAddFreeGift, loading: loadingAddFreeGift }
    ] = useMutation(addFreeGiftsToCart);
    const { addPromoItemToCart } = dataAddFreeGift || {};
    const [onClearCart, { data: resultClearCart }] = useMutation(clearCart);

    const cartItems = useMemo(() => {
        return data?.cart?.items || [];
    }, [data]);

    const isDisableCheckoutWhenOutOfStock = useMemo(() => {
        let result = false;
        cartItems?.forEach(item => {
            if (item?.qty_salable < item?.quantity) {
                result = true;
            }
        });
        return result;
    }, [cartItems]);

    const freegifts = useMemo(() => {
        return freeGiftsData?.freeGiftsByCart || [];
    }, [freeGiftsData]);

    const { data: productsRelatedData, error: productsRelatedError } = useQuery(
        getProductsRelated,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first',
            variables: {
                id: cartItems[0]?.product?.id
            },
            skip: cartItems?.length === 0
        }
    );

    useEffect(() => {
        if (
            !loading &&
            cartId &&
            currentEstimateShippings &&
            currentEstimateShippings.countryId &&
            currentEstimateShippings.postcode &&
            currentEstimateShippings.region
        ) {
            fetchEstimateShippingMethod({
                variables: {
                    cartId,
                    countryId: currentEstimateShippings.countryId,
                    postcode: currentEstimateShippings.postcode,
                    region: currentEstimateShippings.region
                }
            });
        }
    }, [
        loading,
        cartId,
        currentEstimateShippings,
        setCurrentEstimateShippings,
        fetchEstimateShippingMethod
    ]);

    useEffect(() => {
        if (!loading && cartId && estimateShipping) {
            const estimateShippingMethodList =
                estimateShipping.getEstimateShippingMethod;
            if (
                estimateShippingMethodList &&
                estimateShippingMethodList.length > 0
            ) {
                const estimateShippingMethodData =
                    estimateShippingMethodList[0];
                const {
                    carrier_code,
                    method_code
                } = estimateShippingMethodData;
                if (carrier_code && method_code) {
                    fetchEstimateTotalWithShippingMethod({
                        variables: {
                            cartId,
                            countryId: currentEstimateShippings.countryId,
                            postcode: currentEstimateShippings.postcode,
                            region: currentEstimateShippings.region,
                            shippingCarrierCode: carrier_code,
                            shippingMethodCode: method_code
                        }
                    });
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        loading,
        cartId,
        estimateShipping,
        fetchEstimateTotalWithShippingMethod
    ]);

    const handleAddFreeGiftsToCart = useCallback(async uid => {
        await onAddFreeGiftsToCart({
            variables: {
                cartId,
                uid
            },
            refetchQueries: [
                {
                    query: getCartDetails,
                    variables: { cartId }
                },
                {
                    query: getFreeGifts,
                    variables: { cartId }
                }
            ],
            awaitRefetchQueries: true
        });
        setShowModal(false);
    }, []);

    // Clear the cart when there is only free gift in the cart even though there is no main item
    useEffect(() => {
        const freeGiftsArr = cartItems?.filter(item => {
            if (item == null) {
                return false;
            }
            const { prices } = item || {};
            return prices?.price?.value === 0;
        });
        if (freeGiftsArr?.length === cartItems?.length && hasItems) {
            onClearCart({
                variables: { cartId }
            });
        }
    }, [cartItems]);

    const estimateTotalShippingMethod = useMemo(() => {
        if (estimateShipping) {
            const estimateShippingMethodList =
                estimateShipping.getEstimateShippingMethod;
            if (
                estimateShippingMethodList &&
                estimateShippingMethodList.length === 0
            ) {
                return null;
            }
        }
        if (
            estimateTotalShipping &&
            estimateTotalShipping.getEstimateTotalWithShippingMethod
        ) {
            return {
                currency_code:
                    estimateTotalShipping.getEstimateTotalWithShippingMethod
                        .base_currency_code,
                subtotal:
                    estimateTotalShipping.getEstimateTotalWithShippingMethod
                        .subtotal,
                deliveryCharge:
                    estimateTotalShipping.getEstimateTotalWithShippingMethod
                        .shipping_incl_tax,
                discount_amount:
                    estimateTotalShipping.getEstimateTotalWithShippingMethod
                        .discount_amount,
                tax_amount:
                    estimateTotalShipping.getEstimateTotalWithShippingMethod
                        .tax_amount,
                grand_total:
                    estimateTotalShipping.getEstimateTotalWithShippingMethod
                        .subtotal_incl_tax
            };
        }
        return null;
    }, [estimateShipping, estimateTotalShipping]);

    useEffect(() => {
        // Let the cart page know it is updating while we're waiting on network data.
        setIsCartUpdating(loading || loadingAddFreeGift);
    }, [loading, loadingAddFreeGift]);

    const hasItems = !!(data && data?.cart?.total_quantity);
    const { items } = data?.cart || {};
    const outOfStockItem =
        items &&
        items.filter(item => {
            return item?.qty_salable <= 0;
        });
    const hasOutOfStock =
        outOfStockItem && outOfStockItem.length === 0 ? false : true;
    const shouldShowLoadingIndicator = useMemo(() => {
        return called && loading && !hasItems;
    }, [called, hasItems, loading]);

    const loadingEstimateShipping =
        estimateShippingLoading || estimateTotalShippingLoading;

    //* Maybe useMemo to handle case reload query call related product (Amasty) when data is change.
    //* Note: dont use dependencies
    const mostViewedGroups = useMemo(() => {
        return (
            productsRelatedData &&
            !productsRelatedError &&
            productsRelatedData.amMostviewedGroups &&
            productsRelatedData.amMostviewedGroups.items &&
            productsRelatedData.amMostviewedGroups.items.length > 0 &&
            productsRelatedData.amMostviewedGroups.items.filter(
                ({ position }) => position === 'cart_content_bottom'
            )[0]
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const relatedProducts = useMemo(() => {
        return cartItems?.length > 0 && mostViewedGroups?.items;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const titleBlock = mostViewedGroups?.block_title;

    const errors = useMemo(
        () =>
            new Map([
                ['errorCart', error],
                ['errorGetFreeGifts', errorGetFreeGifts]
            ]),
        [error, errorGetFreeGifts]
    );

    const isDisableCheckout = useMemo(() => {
        return (
            hasOutOfStock ||
            isCartUpdating ||
            deriveErrorMessage(Array.from(errors.values())) !== '' ||
            isDisableCheckoutWhenOutOfStock
        );
    }, [
        errors,
        hasOutOfStock,
        isCartUpdating,
        isDisableCheckoutWhenOutOfStock
    ]);

    function sentTracking(data) {
        let itemsCart = data?.cart?.items;

        itemsCart = itemsCart.map(item => {
            return {
                name: item?.product?.name || '',
                id: item?.product?.id || '',
                price: item?.prices?.price?.value || '',
                quantity: item?.quantity || '',
                sku: item?.product?.sku || ''
            };
        });

        if (ENABLE_TRACKING) {
            const params = {
                step: 1,
                option: 'view_cart',
                products: itemsCart
            };
            GTMAnalytics.default().trackingCheckout(params);
            GTMAnalytics.default().trackingPageView(
                currentUser,
                rtl,
                'cartPage'
            );
        }
    }

    if (!loading) {
        if (data && data.cart) {
            sentTracking(data);
        } else if (data && cartId) {
            resetCart({
                fetchCartId,
                error,
                isFromCart: true
            });
        }
    }

    return {
        errors,
        banners: storeConfig,
        hasItems,
        cartItems,
        freegifts,
        titleBlock,
        hasOutOfStock,
        isCartUpdating,
        relatedProducts,
        isDisableCheckout,
        setIsCartUpdating,
        addPromoItemToCart,
        loadingEstimateShipping,
        handleAddFreeGiftsToCart,
        shouldShowLoadingIndicator,
        estimateTotalShippingMethod,
        loadingGetFreeGifts
    };
};

/** JSDoc type definitions */

/**
 * GraphQL formatted string queries used in this talon.
 *
 * @typedef {Object} CartPageQueries
 *
 * @property {GraphQLAST} getCartDetails Query for getting the cart details.
 *
 * @see [cartPage.gql.js]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/cartPage.gql.js}
 * for queries used in Venia
 */

/**
 * Props data to use when rendering a cart page component.
 *
 * @typedef {Object} CartPageTalonProps
 *
 * @property {Map<Object>} errors Errors contained in the cart.
 * @property {Object} banners Banners data.
 * @property {boolean} hasItems True if the cart has items. False otherwise.
 * @property {Array<Object>} cartItems An array of item objects in the cart.
 * @property {Array<Object>} freegifts An array of free gift objects in the cart.
 * @property {string} titleBlock Title block of the most viewed groups.
 * @property {boolean} hasOutOfStock True if the cart has out of stock items. False otherwise.
 * @property {boolean} isCartUpdating True if the cart is updating. False otherwise.
 * @property {boolean} relatedProducts An array of related products.
 * @property {boolean} isDisableCheckout True if the cart have any item is out of stock. False otherwise.
 * @property {function} setIsCartUpdating Callback function for setting the updating state of the cart page.
 * @property {boolean} shouldShowLoadingIndicator True if the loading indicator should be rendered. False otherwise.
 */
