import { useCallback, useState, useMemo } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';

import { clearCartDataFromCache } from '@magento/peregrine/lib/Apollo/clearCartDataFromCache';
import { clearCustomerDataFromCache } from '@magento/peregrine/lib/Apollo/clearCustomerDataFromCache';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useAwaitQuery } from '@magento/peregrine/lib/hooks/useAwaitQuery';
import { retrieveCartId } from '@magento/peregrine/lib/store/actions/cart';
import { useAppContext } from '@magento/peregrine/lib/context/app';

import DEFAULT_OPERATIONS from './signIn.gql';

import { useHistory } from 'react-router-dom';

export const useSignIn = props => {
    const {
        getCartDetailsQuery,
        setDefaultUsername,
        showCreateAccount,
        showForgotPassword
    } = props;

    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const {
        createCartMutation,
        getCustomerQuery,
        mergeCartsMutation,
        signInMutation,
        sendOtpToCustomer,
        createCustomerTokenWithOtp,
        createCustomerWithSocial
    } = operations;

    const apolloClient = useApolloClient();
    const [{ storeConfig }] = useAppContext();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sentOTP, setSentOTP] = useState(false);
    const [refuseSendOTP, setRefuseSendOTP] = useState(false);
    const [messageRefuseSendOTP, setMessageRefuseSendOTP] = useState('');
    const [hasError, setHasError] = useState(false);

    const history = useHistory();

    const [
        { cartId },
        { createCart, removeCart, getCartDetails }
    ] = useCartContext();

    const [
        { isGettingDetails, getDetailsError },
        { getUserDetails, setToken }
    ] = useUserContext();

    const [signIn, { error: signInError }] = useMutation(signInMutation, {
        fetchPolicy: 'no-cache'
    });

    const [fetchCartId] = useMutation(createCartMutation);
    const [mergeCarts, { error: mergeCartsError }] = useMutation(
        mergeCartsMutation,
        {
            onError: error => {
                // console.log(error);
            }
        }
    );
    const fetchUserDetails = useAwaitQuery(getCustomerQuery);
    const fetchCartDetails = useAwaitQuery(getCartDetailsQuery);

    // OTP
    const [getOTPCustomer, { error: sendOTPError }] = useMutation(
        sendOtpToCustomer
    );
    const [
        addCustomerTokenWithOtp,
        { error: createCustomerTokenWithOtpError }
    ] = useMutation(createCustomerTokenWithOtp);

    async function resetAuth(rootPage) {
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
                sourceCartId: cartId
            }
        });

        // Ensure old stores are updated with any new data.
        getUserDetails({ fetchUserDetails });
        getCartDetails({ fetchCartId, fetchCartDetails });
        setIsLoading(false);

        // navigate to page
        history.push(rootPage ? rootPage : '/account-information');
    }

    async function handleAfterLogin({ otp, phoneNumber, rootPage }) {
        try {
            if (!otp || !phoneNumber) {
                return;
            }

            setIsLoading(true);
            setHasError(false);

            const response = await addCustomerTokenWithOtp({
                variables: {
                    mobile: phoneNumber,
                    otp: otp,
                    websiteId: storeConfig.website_id
                }
            });

            const token = response?.data?.createCustomerTokenWithOtp?.token;
            await setToken(token);
            await resetAuth(rootPage);
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(error);
            }
            setIsLoading(false);
            setHasError(true);
        }
    }

    const handleSubmit = useCallback(
        async ({ phone, resend, eventType, needToNavigate, rootPage }) => {
            const { id: storeId } = storeConfig;
            // setIsSigningIn(true);
            setSentOTP(false);
            try {
                // Get source cart id (guest cart id).
                // const sourceCartId = cartId;

                if (phone) {
                    setIsLoading(true);

                    // set data to send OTP customer
                    const resIpAddress = await fetch(
                        'https://geolocation-db.com/json/'
                    )
                        .then(res => res.json())
                        .catch(err => console.log(err));
                    const { IPv4 } = resIpAddress || {};
                    const resendNumber = resend || 0;
                    const sendOTPToCustomerResponse = await getOTPCustomer({
                        variables: {
                            mobile: phone,
                            resend: resendNumber,
                            storeId,
                            eventType,
                            ipAddress: IPv4 || '',
                            email: ''
                        }
                    });
                    const { data: sendOtpToData } = sendOTPToCustomerResponse;
                    const messageResponseData = sendOtpToData.sendOtpToCustomer;
                    if (messageResponseData && messageResponseData.status) {
                        setRefuseSendOTP(false);
                        setSentOTP(true);
                        if (needToNavigate) {
                            history.push({
                                pathname: '/verification',
                                state: {
                                    phoneNumber: phone,
                                    eventTypeOTP: eventType,
                                    actionType: 'signin',
                                    rootPage
                                }
                            });
                        }
                    } else {
                        setRefuseSendOTP(true);
                        const messageResponse =
                            messageResponseData && messageResponseData.message;
                        setMessageRefuseSendOTP(`${messageResponse}`);
                    }
                    setIsLoading(false);
                }
                // TODO
                // Sign in and set the token.
                // const signInResponse = await signIn({
                //     variables: { email, password }
                // });
                // const token = signInResponse.data.generateCustomerToken.token;
                // await setToken(token);
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                setIsLoading(false);
                setIsSigningIn(false);
            }
        },
        [getOTPCustomer, history, storeConfig]
    );

    // Login With Social
    const [loginWithSocial, { error: loginWithSocialError }] = useMutation(
        createCustomerWithSocial
    );

    async function handleLoginSocial(dataSocialNetwork) {
        const { res, social } = dataSocialNetwork;
        setIsSigningIn(true);
        try {
            if (social === 'google') {
                const { profileObj } = res || {};
                const { email, familyName, givenName, googleId } =
                    profileObj || {};
                const logInSocialResponse = await loginWithSocial({
                    variables: {
                        firstName: givenName,
                        lastName: familyName,
                        email: email,
                        providerId: social,
                        socialUserId: googleId
                    }
                });
                const token = logInSocialResponse.data.loginWithSocial.token;
                await setToken(token);
            } else if (social === 'facebook') {
                const { id, email, name } = res || {};
                const formatName = name.split(' ');
                const lengthName = formatName.length;
                const logInSocialResponse = await loginWithSocial({
                    variables: {
                        firstName: formatName[0],
                        lastName: formatName[lengthName - 1],
                        email: email,
                        providerId: social,
                        socialUserId: id
                    }
                });
                const token = logInSocialResponse.data.loginWithSocial.token;
                await setToken(token);
            }

            // set root page = null => redirect to account page
            await resetAuth(null);
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(error);
            }
            setIsSigningIn(false);
        }
    }

    const handleForgotPassword = useCallback(() => {
        const { current: formApi } = formApiRef;

        if (formApi) {
            setDefaultUsername(formApi.getValue('email'));
        }

        showForgotPassword();
    }, [setDefaultUsername, showForgotPassword]);

    const handleCreateAccount = useCallback(() => {
        const { current: formApi } = formApiRef;

        if (formApi) {
            setDefaultUsername(formApi.getValue('email'));
        }

        showCreateAccount();
    }, [setDefaultUsername, showCreateAccount]);

    const errors = useMemo(
        () =>
            new Map([
                ['getUserDetailsQuery', getDetailsError],
                ['signInMutation', signInError],
                ['sendOtpToCustomer', sendOTPError],
                [
                    'createCustomerTokenWithOtpError',
                    createCustomerTokenWithOtpError
                ],
                ['mergeCartsError', mergeCartsError],
                ['loginWithSocialError', loginWithSocialError]
            ]),
        [
            getDetailsError,
            signInError,
            sendOTPError,
            createCustomerTokenWithOtpError,
            mergeCartsError,
            loginWithSocialError
        ]
    );

    return {
        errors,
        hasError,
        sentOTP,
        handleSubmit,
        refuseSendOTP,
        handleAfterLogin,
        handleLoginSocial,
        handleCreateAccount,
        handleForgotPassword,
        messageRefuseSendOTP,
        isBusy: isGettingDetails || isSigningIn || isLoading
    };
};
