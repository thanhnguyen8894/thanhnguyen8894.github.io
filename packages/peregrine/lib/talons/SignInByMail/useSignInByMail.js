import { useCallback, useState, useMemo, useEffect } from 'react';
import { useLazyQuery, useMutation, useApolloClient } from '@apollo/client';
import { EMAIL_FORMAT } from '@magento/peregrine/lib/util/common';
import DEFAULT_OPERATIONS from './signInByMail.gql';

import { clearCartDataFromCache } from '@magento/peregrine/lib/Apollo/clearCartDataFromCache';
import { clearCustomerDataFromCache } from '@magento/peregrine/lib/Apollo/clearCustomerDataFromCache';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useAwaitQuery } from '@magento/peregrine/lib/hooks/useAwaitQuery';
import { retrieveCartId } from '@magento/peregrine/lib/store/actions/cart';
import { useHistory } from 'react-router-dom';

export const useSignInByMail = props => {
    const history = useHistory();
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const {
        signInMutation,
        getCustomerQuery,
        getCartDetailsQuery,
        createCartMutation,
        mergeCartsMutation
    } = operations;

    const [
        { cartId },
        { createCart, removeCart, getCartDetails }
    ] = useCartContext();

    const [
        { isGettingDetails },
        { getUserDetails, setToken }
    ] = useUserContext();

    const apolloClient = useApolloClient();
    const [fetchCartId] = useMutation(createCartMutation);
    const [mergeCarts, { error: mergeCartsError }] = useMutation(
        mergeCartsMutation
    );
    const fetchUserDetails = useAwaitQuery(getCustomerQuery);
    const fetchCartDetails = useAwaitQuery(getCartDetailsQuery);

    const [signIn, { error: signInError }] = useMutation(signInMutation, {
        fetchPolicy: 'no-cache'
    });

    const [getCustomer, getCustomerResults] = useLazyQuery(getCustomerQuery, {
        fetchPolicy: 'no-cache'
    });

    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const isDisable = useMemo(() => {
        if (!email || !password) {
            return true;
        }

        if (email && !email.match(EMAIL_FORMAT)) {
            return true;
        }

        return false;
    }, [email, password]);

    function onChangeEmail(value) {
        setEmail(value);

        // if (value && !value.match(EMAIL_FORMAT)) {
        //     setErrorMessage(
        //         formatMessage({
        //             id: 'signInByMail.wrongEmailFormat',
        //             defaultMessage: 'Wrong email format.'
        //         })
        //     );
        // } else {
        //     setErrorMessage('');
        // }
    }

    function onChangePassword(value) {
        setPassword(value);
    }

    useEffect(() => {
        if (getCustomerResults) {
            const { called, data, error } = getCustomerResults || {};
            const { customer } = data || {};
            const { customer_mobile } = customer || {};

            if (called) {
                if (customer_mobile || error) {
                    window.open('/', '_self');
                } else if (data) {
                    window.open('/update-user-phone', '_self');
                }
            }
        }
    }, [getCustomerResults]);

    const handleSubmit = useCallback(
        async ({ email, password, rootPage }) => {
            try {
                setIsLoading(true);
                const response = await signIn({
                    variables: {
                        email: email,
                        password: password
                    }
                });
                const { data } = response || {};
                const { generateCustomerToken } = data || {};
                const { token = '' } = generateCustomerToken || {};

                if (token) {
                    const sourceCartId = cartId;

                    await setToken(token);

                    // Clear all cart/customer data from cache and redux.
                    await clearCartDataFromCache(apolloClient);
                    await clearCustomerDataFromCache(apolloClient);
                    await removeCart();

                    // Create and get the customer's cart id.
                    await createCart({
                        fetchCartId
                    });
                    const destinationCartId = await retrieveCartId();

                    // Merge the guest cart into the customer cart.
                    await mergeCarts({
                        variables: {
                            destinationCartId,
                            sourceCartId
                        }
                    });

                    // Ensure old stores are updated with any new data.
                    getUserDetails({ fetchUserDetails });
                    getCartDetails({ fetchCartId, fetchCartDetails });

                    // CHECK PHONE EXIST
                    if (rootPage) {
                        history.push(rootPage);
                    } else {
                        getCustomer();
                    }
                }

                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            email,
            password,
            cartId,
            setToken,
            apolloClient,
            removeCart,
            createCart,
            fetchCartId,
            mergeCarts,
            getUserDetails,
            fetchUserDetails,
            getCartDetails,
            fetchCartDetails
        ]
    );

    const errors = useMemo(
        () =>
            new Map([
                ['signInMutation', signInError],
                ['mergeCartsMutation', mergeCartsError]
            ]),
        [signInError, mergeCartsError]
    );

    return {
        errors,
        errorMessage,
        signInError,
        isDisable,
        isLoading: isLoading || isGettingDetails,
        email,
        password,
        onChangeEmail,
        onChangePassword,
        handleSubmit
    };
};
