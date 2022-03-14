import { useCallback, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { deriveErrorMessage } from '../../util/deriveErrorMessage';
import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';
import DEFAULT_OPERATIONS from '@magento/peregrine/lib/talons/CheckoutPage/OrderConfirmationPage/createAccount.gql';

const SUPPORTED_PRODUCT_TYPES = ['SimpleProduct', 'ConfigurableProduct'];

/**
 * @param {GraphQLQuery} props.addSimpleProductToCartMutation - configurable product mutation
 * @param {Object} props.product - the product, see RootComponents/Category
 *
 * @returns {{
 *  handleAddToCart: func,
 *  isLoading: boolean,
 *  productDetails: obj,
 *  handleCloseModal: func,
 *  modalAddToCart: boolean
 * }}
 */

export const useGalleryItem = props => {
    const { addSimpleProductToCartMutation, productLink, product } =
        props || {};

    const { __typename = '' } = product || {};
    const productType = __typename;

    const isSupportedProductType = SUPPORTED_PRODUCT_TYPES.includes(
        productType
    );

    const [modalAddToCart, updateModalAddToCart] = useState(false);

    const [
        addSimpleProductToCart,
        { error: errorAddingSimpleProduct, loading: isAddSimpleLoading }
    ] = useMutation(addSimpleProductToCartMutation);

    const { createCartMutation } = DEFAULT_OPERATIONS;
    const [{ cartId }, { resetCart }] = useCartContext();
    const [fetchCartId] = useMutation(createCartMutation);

    const handleAddToCart = useCallback(async () => {
        const payload = {
            item: product,
            productType,
            quantity: 1
        };
        if (isSupportedProductType) {
            const variables = {
                cartId,
                parentSku: payload.parentSku,
                product: payload.item,
                quantity: payload.quantity,
                sku: payload.item.sku
            };
            // Use the proper mutation for the type.
            if (productType === 'SimpleProduct') {
                try {
                    await addSimpleProductToCart({
                        variables
                    });
                } catch (error) {
                    await resetCart({
                        fetchCartId,
                        error
                    });
                    return;
                }
                updateModalAddToCart(true);
            } else if (productType === 'ConfigurableProduct') {
                window.open(`${productLink}`, '_self');
            }

            GTMAnalytics.default().trackingAddProduct({
                ...product,
                quantity: payload?.quantity
            });
        } else {
            console.error('Unsupported product type. Cannot add to cart.');
        }
    }, [
        addSimpleProductToCart,
        cartId,
        isSupportedProductType,
        product,
        productLink,
        productType
    ]);

    const handleCloseModal = useCallback(() => {
        updateModalAddToCart(false);
    }, []);

    // Normalization object for product details we need for rendering.
    const { name = '', sku = '', price, special_price, price_range } = product || {};
    const { regularPrice } = price || {};
    const { amount } = regularPrice || {};
    const productDetails = {
        name: name,
        price: amount,
        sku: sku,
        special_price: special_price,
        thumbnailImage: (product && product.image && product.image.url) || '',
        quantity_addCart: 1,
        color_select: '',
        price_range
    };

    const errorsMessageToast = useMemo(
        () => deriveErrorMessage([errorAddingSimpleProduct]),
        [errorAddingSimpleProduct]
    );

    return {
        productDetails,
        modalAddToCart,
        handleAddToCart,
        handleCloseModal,
        error: errorsMessageToast,
        isLoading: isAddSimpleLoading
    };
};
