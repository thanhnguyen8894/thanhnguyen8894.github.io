import { useCallback, useMemo, useState } from 'react';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { useIntl } from 'react-intl';

import { useUserContext } from '@magento/peregrine/lib/context/user';
import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';

//Helper/Constants
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import { ENABLE_TRACKING } from '@magento/venia-ui/lib/constants/constants';
import { fetchWishlistItemId } from '@magento/peregrine/lib/util/common';

//GraphQL
import DEFAULT_OPERATIONS from '@magento/peregrine/lib/talons/HomePage/homePage.gql';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';

/**
 *
 * @param {{lstWishlist?: array, lstIdProduct?: array, reset?: function, setId?: function}} props
 * @returns {{error: string, loading: boolean, addWishlist: function, removeWishlist: function, wishlistAction: function, derivedWishlists: *, successToastProps: *,errorToastProps: * }}
 */
export const useWishlistAction = props => {
    const {
        lstWishlist = [],
        lstIdProduct = [],
        reset = () => {},
        setId = () => {}
    } = props;
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const {
        getCustomerWishlistQuery,
        addWishlistMutation,
        removeWishlistItemMutation
    } = operations;

    const [{ isSignedIn }] = useUserContext();
    const { formatMessage } = useIntl();
    const isHavePropsLstWishlist = useMemo(() => {
        return lstWishlist.length > 0;
    }, [lstWishlist.length]);

    const isMultiProduct = useMemo(() => {
        return lstWishlist.length > 0;
    }, [lstWishlist]);

    const [errorMessage, upadteMessageError] = useState('');

    const errMessage = useCallback(() => {
        upadteMessageError(
            formatMessage({
                id: 'productFullDetail.somethingWentWrong',
                defaultMessage: 'Somethings went wrong'
            })
        );
    }, [formatMessage]);

    const { data, loading, error } = useQuery(getCustomerWishlistQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !isSignedIn || isHavePropsLstWishlist
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

    const [
        fetchCustomerWishlist,
        {
            data: wishlistData,
            loading: wishlistLoading,
            error: customerWishlistError
        }
    ] = useLazyQuery(getCustomerWishlistQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !isSignedIn
    });

    const derivedWishlists = useMemo(() => {
        if (isHavePropsLstWishlist) {
            return lstWishlist;
        }
        return (
            data?.customer?.wishlist || wishlistData?.customer?.wishlist || []
        );
    }, [data, isHavePropsLstWishlist, lstWishlist, wishlistData]);

    const errorsMessageToast = useMemo(
        () =>
            deriveErrorMessage([
                error,
                addToWishlistError,
                removeWishlistItemError,
                customerWishlistError
            ]),
        [
            addToWishlistError,
            customerWishlistError,
            error,
            removeWishlistItemError
        ]
    );

    const removeWishlist = useCallback(
        async id => {
            try {
                const response = await removeWishlistItem({
                    variables: {
                        wishlistId: derivedWishlists?.id,
                        wishlistItemsIds: isMultiProduct ? lstIdProduct : [id]
                    },
                    refetchQueries: [{ query: getCustomerWishlistQuery }],
                    awaitRefetchQueries: true
                });
                const user_errors =
                    response?.data?.removeProductsFromWishlist?.user_errors ||
                    [];
                if (user_errors.length === 0) {
                    //TODO:
                    fetchCustomerWishlist({ variables: {} });
                    reset && reset();
                    setId && setId(0);
                } else {
                    errMessage();
                }
            } catch (error) {
                errMessage();
                return;
            }
        },
        [
            derivedWishlists,
            errMessage,
            fetchCustomerWishlist,
            getCustomerWishlistQuery,
            isMultiProduct,
            lstIdProduct,
            removeWishlistItem,
            reset,
            setId
        ]
    );

    const addWishlist = useCallback(
        async item => {
            try {
                if (!isSignedIn) {
                    upadteMessageError(
                        formatMessage({
                            id: 'productFullDetail.loginFirst',
                            defaultMessage: 'Please login first'
                        })
                    );
                } else {
                    const response = await addToWishlist({
                        variables: {
                            wishlistId: derivedWishlists?.id,
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
                    const items_v2 =
                        response?.data?.addProductsToWishlist?.wishlist
                            ?.items_v2 || {};
                    const user_errors =
                        response?.data?.addProductsToWishlist?.user_errors ||
                        [];
                    if (user_errors.length === 0) {
                        fetchCustomerWishlist({ variables: {} });
                        upadteMessageError('');
                        setId && setId(items_v2);
                    }
                }
            } catch (error) {
                errMessage();
            }
        },
        [
            addToWishlist,
            derivedWishlists.id,
            errMessage,
            fetchCustomerWishlist,
            formatMessage,
            isSignedIn,
            setId
        ]
    );

    const successToastProps = useMemo(() => {
        if (addToWishlistLoading) {
            return {
                type: 'success',
                message: formatMessage({
                    id: 'wishlist.successMessageGeneral',
                    defaultMessage:
                        'Item successfully added to your favorites list.'
                }),
                dismissable: true,
                timeout: 2000
            };
        }
        if (removeWishlistItemLoading) {
            return {
                type: 'success',
                message: formatMessage({
                    id: 'wishlist.remove',
                    defaultMessage:
                        'Item had been remove from your favorites list.'
                }),
                dismissable: true,
                timeout: 2000
            };
        }
    }, [addToWishlistLoading, formatMessage, removeWishlistItemLoading]);

    const errorToastProps = useMemo(() => {
        if (errorsMessageToast || errorMessage) {
            return {
                type: 'error',
                message: errorsMessageToast || errorMessage,
                dismissable: true,
                timeout: 2000
            };
        }
    }, [errorMessage, errorsMessageToast]);

    const wishlistAction = useCallback(
        item => {
            const wishlistId = fetchWishlistItemId(
                item.id,
                derivedWishlists.items
            );
            if (wishlistId !== 0) {
                removeWishlist(wishlistId);
                if (ENABLE_TRACKING) {
                    GTMAnalytics.default().trackingWishlistAction('remove');
                }
            } else {
                addWishlist(item);
                if (ENABLE_TRACKING) {
                    GTMAnalytics.default().trackingWishlistAction('add');
                }
            }
            setTimeout(() => {
                upadteMessageError('');
            }, 100);
        },
        [addWishlist, derivedWishlists, removeWishlist]
    );

    return {
        loading:
            loading ||
            addToWishlistLoading ||
            removeWishlistItemLoading ||
            wishlistLoading,
        derivedWishlists,
        removeWishlist,
        addWishlist,
        wishlistAction,
        successToastProps,
        errorToastProps
    };
};

useWishlistAction.defaultProps = {
    lstWishlist: [],
    operations: {},
    lstIdProduct: [],
    reset: () => {},
    setId: () => {}
};
