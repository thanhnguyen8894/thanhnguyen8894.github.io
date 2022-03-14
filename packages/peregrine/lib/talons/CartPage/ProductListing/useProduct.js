import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';

//Redux
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useAppContext } from '@magento/peregrine/lib/context/app';

//Helper
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import configuredVariant from '@magento/peregrine/lib/util/configuredVariant';

//GraphQL
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from './product.gql';

//Analytics
import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';

/**
 * This talon contains logic for a product component used in a product listing component.
 * It performs effects and returns prop data for that component.
 *
 * This talon performs the following effects:
 *
 * - Manage the updating state of the cart while a product is being updated or removed
 *
 * @function
 *
 * @param {Object} props
 * @param {ProductItem} props.item Product item data
 * @param {ProductMutations} props.operations GraphQL mutations for a product in a cart
 * @param {function} props.setActiveEditItem Function for setting the actively editing item
 * @param {function} props.setIsCartUpdating Function for setting the updating state of the cart
 *
 * @return {ProductTalonProps}
 *
 * @example <caption>Importing into your project</caption>
 * import { useProduct } from '@magento/peregrine/lib/talons/CartPage/ProductListing/useProduct';
 */

export const useProduct = props => {
    const {
        item,
        setActiveEditItem,
        setIsCartUpdating,
        queries: { getCartDetails }
    } = props;

    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const { removeItemMutation, updateItemQuantityMutation } = operations;
    const [{ cartId }] = useCartContext();
    const [{ storeConfig }] = useAppContext();

    const configurableThumbnailSource = useMemo(() => {
        if (storeConfig) {
            return storeConfig.configurable_thumbnail_source;
        }
    }, [storeConfig]);

    const flatProduct = flattenProduct(item, configurableThumbnailSource);

    //TODO: note -> errorPolicy to force get data with or withour error reponse
    const [
        removeItem,
        {
            called: removeItemCalled,
            error: removeItemError,
            loading: removeItemLoading
        }
    ] = useMutation(removeItemMutation);

    const [
        updateItemQuantity,
        {
            loading: updateItemLoading,
            error: updateError,
            called: updateItemCalled
        }
    ] = useMutation(updateItemQuantityMutation);

    useEffect(() => {
        if (updateItemCalled || removeItemCalled) {
            // If a product mutation is in flight, tell the cart.
            setIsCartUpdating(updateItemLoading || removeItemLoading);
        }

        // Reset updating state on unmount
        return () => setIsCartUpdating(false);
    }, [
        removeItemCalled,
        removeItemLoading,
        setIsCartUpdating,
        updateItemCalled,
        updateItemLoading
    ]);

    const [isFavorite, setIsFavorite] = useState(false);

    // Use local state to determine whether to display errors or not.
    // Could be replaced by a "reset mutation" function from apollo client.
    // https://github.com/apollographql/apollo-feature-requests/issues/170
    const [displayError, setDisplayError] = useState(false);

    const derivedErrorMessage = useMemo(() => {
        return (
            (displayError &&
                deriveErrorMessage([updateError, removeItemError])) ||
            ''
        );
    }, [displayError, removeItemError, updateError]);

    const handleToggleFavorites = useCallback(() => {
        setIsFavorite(!isFavorite);
    }, [isFavorite]);

    const handleEditItem = useCallback(() => {
        setActiveEditItem(item);

        // If there were errors from removing/updating the product, hide them
        // when we open the modal.
        setDisplayError(false);
    }, [item, setActiveEditItem]);

    const handleRemoveFromCart = useCallback(() => {
        try {
            removeItem({
                variables: {
                    cartId,
                    itemId: item.id
                },
                refetchQueries: [
                    {
                        query: getCartDetails,
                        variables: { cartId }
                    }
                ],
                awaitRefetchQueries: true
            });

            GTMAnalytics.default().trackingRemoveProduct({
                ...item?.product,
                quantity: item?.quantity
            });
        } catch (err) {
            // Make sure any errors from the mutation are displayed.
            setDisplayError(true);
        }
    }, [cartId, getCartDetails, item, removeItem]);

    const handleUpdateItemQuantity = useCallback(
        async quantity => {
            try {
                await updateItemQuantity({
                    variables: {
                        cartId,
                        itemId: item.id,
                        quantity
                    },
                    refetchQueries: [
                        {
                            query: getCartDetails,
                            variables: { cartId }
                        }
                    ],
                    awaitRefetchQueries: true
                });
            } catch (err) {
                // Make sure any errors from the mutation are displayed.
                setDisplayError(true);
            }
        },
        [cartId, getCartDetails, item, updateItemQuantity]
    );

    const isFreegift = item?.prices?.price?.value === 0;

    return {
        errorMessage: derivedErrorMessage,
        handleEditItem,
        handleRemoveFromCart,
        handleToggleFavorites,
        handleUpdateItemQuantity,
        isEditable: !!flatProduct.options.length,
        isFavorite,
        isFreegift,
        product: flatProduct
    };
};

const flattenProduct = (item, configurableThumbnailSource) => {
    const {
        prices,
        product,
        quantity,
        qty_salable: qtySalable,
        configurable_options: options = []
    } = item;

    const configured_variant = configuredVariant(options, product);

    const {
        id,
        name,
        special_price,
        small_image,
        stock_status: stockStatus,
        url_key: urlKey,
        url_suffix: urlSuffix
    } = product;
    const { url: image } =
        configurableThumbnailSource === 'itself' && configured_variant
            ? configured_variant.small_image
            : small_image;

    const { price, row_total_including_tax: totalIncludeTax } = prices;
    const { value: normalPrice, currency } = price;
    const { value: includeTaxPrice } = totalIncludeTax;
    const unitPrice = normalPrice;

    return {
        id,
        name,
        image,
        urlKey,
        options,
        currency,
        quantity,
        urlSuffix,
        unitPrice,
        qtySalable,
        stockStatus,
        subtotalIncludeTax: includeTaxPrice
    };
};

/** JSDocs type definitions */

/**
 * GraphQL mutations for a product in a cart.
 * This is a type used by the {@link useProduct} talon.
 *
 * @typedef {Object} ProductMutations
 *
 * @property {GraphQLAST} removeItemMutation Mutation for removing an item in a cart
 * @property {GraphQLAST} updateItemQuantityMutation Mutation for updating the item quantity in a cart
 *
 * @see [product.js]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/ProductListing/product.js}
 * to see the mutations used in Venia
 */

/**
 * Object type returned by the {@link useProduct} talon.
 * It provides prop data for rendering a product component on a cart page.
 *
 * @typedef {Object} ProductTalonProps
 *
 * @property {String} errorMessage Error message from an operation perfored on a cart product.
 * @property {function} handleEditItem Function to use for handling when a product is modified.
 * @property {function} handleRemoveFromCart Function to use for handling the removal of a cart product.
 * @property {function} handleToggleFavorites Function to use for handling favorites toggling on a cart product.
 * @property {function} handleUpdateItemQuantity Function to use for handling updates to the product quantity in a cart.
 * @property {boolean} isEditable True if a cart product is editable. False otherwise.
 * @property {boolean} isFavorite True if the cart product is a favorite product. False otherwise.
 * @property {ProductItem} product Cart product data
 */

/**
 * Data about a product item in the cart.
 * This type is used in the {@link ProductTalonProps} type returned by the {@link useProduct} talon.
 *
 * @typedef {Object} ProductItem
 *
 * @property {String} currency The currency associated with the cart product
 * @property {String} image The url for the cart product image
 * @property {String} name The name of the product
 * @property {Array<Object>} options A list of configurable option objects
 * @property {number} quantity The quantity associated with the cart product
 * @property {number} unitPrice The product's unit price
 * @property {String} urlKey The product's url key
 * @property {String} urlSuffix The product's url suffix
 */
