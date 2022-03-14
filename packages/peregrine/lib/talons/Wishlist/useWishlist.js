import { useCallback, useMemo } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';

import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import DEFAULT_OPERATIONS from '@magento/peregrine/lib/talons/HomePage/homePage.gql';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';

export const useWishlist = props => {
    const {
        isSignedIn,
        wishListId,
        afterAddSuccess,
        afterRemoveSuccess,
        afterSubmitError
    } = props;
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const {
        getCustomerWishlistQuery,
        addWishlistMutation,
        removeWishlistItemMutation
    } = operations;

    const [
        fetchCustomerWishlist,
        {
            data: customerWishList,
            loading: customerWishListLoading,
            error: customerWishlistError
        }
    ] = useLazyQuery(getCustomerWishlistQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !isSignedIn
    });

    const [
        removeWishlistItem,
        {
            data: removeWishlistItemData,
            loading: removeWishlistItemLoading,
            error: removeWishlistItemError
        }
    ] = useMutation(removeWishlistItemMutation);

    const [
        addToWishlist,
        {
            data: addToWishlistData,
            loading: addToWishlistLoading,
            error: addToWishlistError
        }
    ] = useMutation(addWishlistMutation);

    const loading = useMemo(() => {
        return (
            addToWishlistLoading ||
            removeWishlistItemLoading ||
            customerWishListLoading
        );
    }, [
        addToWishlistLoading,
        removeWishlistItemLoading,
        customerWishListLoading
    ]);

    const newWhishList = useMemo(() => {
        if (customerWishList) {
            const newValues = customerWishList?.customer?.wishlist?.items || [];
            return newValues;
        }
        return [];
    }, [customerWishList]);

    const errorsMessages = useMemo(
        () =>
            deriveErrorMessage([
                addToWishlistError,
                removeWishlistItemError,
                customerWishlistError
            ]),
        [addToWishlistError, customerWishlistError, removeWishlistItemError]
    );

    const addWishlist = useCallback(
        async item => {
            try {
                const response = await addToWishlist({
                    variables: {
                        wishlistId: wishListId,
                        wishlistItems: [
                            {
                                sku: item.sku,
                                quantity: 1
                            }
                        ],
                        currentPage: 1,
                        pageSize: 10
                    }
                });
                const user_errors =
                    response?.data?.addProductsToWishlist?.user_errors || [];
                if (user_errors.length === 0) {
                    // reload new wish list
                    const fetchNewWishList = await fetchCustomerWishlist({
                        variables: {}
                    });
                    afterAddSuccess();
                }
            } catch (error) {
                errorsMessages && afterSubmitError(errorsMessages);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            addToWishlist,
            fetchCustomerWishlist,
            wishListId,
            afterAddSuccess,
            afterSubmitError,
            addToWishlistError,
            errorsMessages,
            newWhishList
        ]
    );

    const removeWishlist = useCallback(
        async values => {
            try {
                const { wishListId, wishIdOfProduct } = values || {};
                const response = await removeWishlistItem({
                    variables: {
                        wishlistId: wishListId,
                        wishlistItemsIds: [wishIdOfProduct]
                    }
                });
                const user_errors =
                    response?.data?.removeProductsFromWishlist?.user_errors ||
                    [];
                if (user_errors.length === 0) {
                    // reload new wish list
                    const fetchNewWishList = await fetchCustomerWishlist({
                        variables: {}
                    });
                    afterRemoveSuccess();
                } else {
                    const errorData = user_errors[0]
                        ? user_errors[0].message
                        : '';
                    if (errorData) {
                        afterSubmitError(errorData);
                    }
                }
            } catch (error) {
                errorsMessages && afterSubmitError(errorsMessages);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            removeWishlistItem,
            wishListId,
            afterRemoveSuccess,
            afterSubmitError,
            errorsMessages,
            newWhishList
        ]
    );

    return {
        addWishlist,
        removeWishlist,
        newWhishList,
        loading
    };
};
