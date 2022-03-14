import { useCallback, useMemo, useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { useHistory } from 'react-router-dom';

//Redux
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useAwaitQuery } from '@magento/peregrine/lib/hooks/useAwaitQuery';
import { retrieveCartId } from '@magento/peregrine/lib/store/actions/cart';

//Helper/Constants
import {
    checkValidPhoneNumber,
    convertEnglishNumber,
    EMAIL_FORMAT,
    getCountryCodeByCountry
} from '@magento/peregrine/lib/util/common';
import { BrowserPersistence } from '@magento/peregrine/lib/util';
import { clearCartDataFromCache } from '@magento/peregrine/lib/Apollo/clearCartDataFromCache';
import { clearCustomerDataFromCache } from '@magento/peregrine/lib/Apollo/clearCustomerDataFromCache';

//GraphQL
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from './createAccount.gql';

/**
 * Returns props necessary to render CreateAccount component. In particular this
 * talon handles the submission flow by first doing a pre-submisson validation
 * and then, on success, invokes the `onSubmit` prop, which is usually the action.
 *
 * @param {CreateAccountQueries} props.queries queries used by the talon
 * @param {createAccountOTP} props.mutations mutations used by the talon
 * @param {InitialValues} props.initialValues initial values to sanitize and seed the form
 * @param {Function} props.onSubmit the post submit callback
 * @param {Function} props.onCancel the cancel callback
 *
 * @returns {CreateAccountProps}
 *
 * @example <caption>Importing into your project</caption>
 * import { useForgotPassword } from '@magento/peregrine/lib/talons/CreateAccount/useCreateAccount.js';
 */
const IDENTIFICATION = {
    firstname: {
        isValid: false,
        value: ''
    },
    lastname: {
        isValid: false,
        value: ''
    },
    email: {
        isValid: false,
        value: '',
        type: 'email'
    },
    password: {
        value: ''
    }
};

const storage = new BrowserPersistence();

export const useCreateAccount = props => {
    const { initialValues = {}, onSubmit, onCancel } = props;
    const [sentOTP, setSentOTP] = useState(false);
    const [messageRefuseSendOTP, setMessageRefuseSendOTP] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [phone, updatePhone] = useState('');
    const [isValidPhone, updateIsValidPhone] = useState(false);
    const [identification, updateIdentification] = useState({
        ...IDENTIFICATION
    });
    const storeCodeTwoLetter =
        storage.getItem('store_view_country')?.toLowerCase() || 'sa';
    const defaultPhoneCode = getCountryCodeByCountry(storeCodeTwoLetter);

    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const {
        createAccountOTP,
        createCartMutation,
        getCartDetailsQuery,
        getCustomerQuery,
        mergeCartsMutation,
        signInMutation,
        sendOtpToCustomer,
        createCustomerWithEmail
    } = operations;
    const apolloClient = useApolloClient();
    const history = useHistory();
    const [hasError, setHasError] = useState(false);

    const [{ storeConfig }] = useAppContext();
    const [
        { cartId },
        { createCart, removeCart, getCartDetails }
    ] = useCartContext();
    const [
        { isGettingDetails, isSignedIn },
        { getUserDetails, setToken }
    ] = useUserContext();

    const [fetchCartId] = useMutation(createCartMutation);

    const [mergeCarts] = useMutation(mergeCartsMutation);

    // For create account and sign in mutations, we don't want to cache any
    // personally identifiable information (PII). So we set fetchPolicy to 'no-cache'.
    const [createAccount, { error: createAccountError }] = useMutation(
        createAccountOTP,
        {
            fetchPolicy: 'no-cache'
        }
    );
    const [getOTPCustomer, { error: sendOTPError }] = useMutation(
        sendOtpToCustomer
    );

    const [signUpByEmail, { error: signUpByEmailError }] = useMutation(
        createCustomerWithEmail
    );

    const [signIn, { error: signInError }] = useMutation(signInMutation, {
        fetchPolicy: 'no-cache'
    });

    const fetchUserDetails = useAwaitQuery(getCustomerQuery);
    const fetchCartDetails = useAwaitQuery(getCartDetailsQuery);

    const handleCancel = useCallback(() => {
        onCancel && onCancel();
    }, [onCancel]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleCreateAccountOTP = useCallback(
        async ({ otp, phoneNumber, firstname, lastname, email, rootPage }) => {
            try {
                if (!otp || !phoneNumber) {
                    return;
                }
                setIsLoading(true);
                setHasError(false);

                const createAccountOTPResponse = await createAccount({
                    variables: {
                        mobile: phoneNumber,
                        otp: otp,
                        firstname: firstname,
                        lastname: lastname,
                        email: email
                    }
                });

                const token =
                    createAccountOTPResponse.data.createCustomerWithOtp.token;
                await setToken(token);

                await resetAuth(rootPage);
                setIsLoading(false);
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                setIsLoading(false);
                setHasError(true);
            }
        },
        [createAccount, setToken, resetAuth]
    ); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = useCallback(
        async formValues => {
            const {
                email,
                password,
                firstname,
                lastname,
                phone,
                eventType,
                rootPage
            } = formValues || {};
            const { id: storeId } = storeConfig || {};
            setSentOTP(false);
            setIsLoading(true);
            const isLoginByEmail = !!formValues.password;

            const _phone = phone?.includes(defaultPhoneCode)
                ? phone
                : `${defaultPhoneCode}${phone}`;

            try {
                // set data to send OTP customer
                const resIpAddress = await fetch(
                    'https://geolocation-db.com/json/'
                )
                    .then(res => res.json())
                    .catch(err => console.log(err));
                const { IPv4 } = resIpAddress || {};
                if (isLoginByEmail) {
                    const createCustomerWithEmail = await signUpByEmail({
                        variables: {
                            email,
                            password,
                            firstname,
                            lastname,
                            mobile: _phone
                        }
                    });
                    const {
                        data: { createCustomerWithEmail: { token } } = {}
                    } = createCustomerWithEmail || {};
                    await setToken(token);
                    await resetAuth();
                    setIsLoading(false);
                    return;
                }
                const sendOTPToCustomerResponse = await getOTPCustomer({
                    variables: {
                        mobile: _phone,
                        resend: 0,
                        storeId,
                        eventType,
                        ipAddress: IPv4 || '',
                        email
                    }
                });
                const { data: sendOtpToData } = sendOTPToCustomerResponse;
                const { sendOtpToCustomer } = sendOtpToData || {};
                const messageResponseData = sendOtpToCustomer;
                const { status, message } = messageResponseData || {};
                if (status) {
                    setSentOTP(true);
                    setIsLoading(false);
                    history.push({
                        pathname: '/verification',
                        state: {
                            phoneNumber: _phone,
                            eventTypeOTP: eventType,
                            email,
                            firstname,
                            lastname,
                            actionType: 'create_customer',
                            rootPage
                        }
                    });
                } else {
                    const messageResponse = message;
                    setMessageRefuseSendOTP(`${messageResponse}`);
                    setIsLoading(false);
                }
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                setIsLoading(false);
            }
        },
        [
            storeConfig,
            defaultPhoneCode,
            getOTPCustomer,
            signUpByEmail,
            setToken,
            resetAuth,
            history
        ]
    );

    const onChangeData = useCallback((name, value) => {
        updateIdentification(prevState => {
            const field = prevState[name];
            field.value = value;

            if (field.type === 'email') {
                field.isValid = value.match(EMAIL_FORMAT);
            } else {
                field.isValid = value ? true : false;
            }
            return { ...prevState };
        });
    }, []);

    function onChangePhone(value) {
        const _value = convertEnglishNumber(value);
        updatePhone(_value);
        updateIsValidPhone(checkValidPhoneNumber(_value));
    }

    const isValidInputText = !!(
        identification &&
        identification.firstname.isValid &&
        identification.lastname.isValid &&
        identification.email.isValid
    );

    const isValidForm = !!(isValidInputText && isValidPhone);

    const errors = useMemo(
        () =>
            new Map([
                ['createAccountQuery', createAccountError],
                ['sendOTPQuery', sendOTPError],
                ['signInMutation', signInError],
                ['createCustomerWithEmail', signUpByEmailError]
            ]),
        [createAccountError, sendOTPError, signInError, signUpByEmailError]
    );

    return {
        phone,
        errors,
        hasError,
        identification,
        onChangePhone,
        onChangeData,
        handleCancel,
        handleSubmit,
        handleCreateAccountOTP,
        messageRefuseSendOTP,
        isDisabled: isGettingDetails || !isValidForm,
        isValidInputText,
        isSignedIn,
        sentOTP,
        isLoading,
        isValidPhone
    };
};

/** JSDocs type definitions */

/**
 * GraphQL queries for the create account form.
 * This is a type used by the {@link useCreateAccount} talon.
 *
 * @typedef {Object} CreateAccountQueries
 *
 * @property {GraphQLAST} customerQuery query to fetch customer details
 * @property {GraphQLAST} getCartDetailsQuery query to get cart details
 */

/**
 * GraphQL mutations for the create account form.
 * This is a type used by the {@link useCreateAccount} talon.
 *
 * @typedef {Object} createAccountOTP
 *
 * @property {GraphQLAST} createAccountOTP mutation for creating new account
 * @property {GraphQLAST} createCartMutation mutation for creating new cart
 * @property {GraphQLAST} mergeCartsMutation mutation for merging carts
 * @property {GraphQLAST} signInMutation mutation for signing
 */

/**
 * Initial values for the create account form.
 * This is a type used by the {@link useCreateAccount} talon.
 *
 * @typedef {Object} InitialValues
 *
 * @property {String} email email id of the user
 * @property {String} firstName first name of the user
 * @property {String} lastName last name of the user
 */

/**
 * Sanitized initial values for the create account form.
 * This is a type used by the {@link useCreateAccount} talon.
 *
 * @typedef {Object} SanitizedInitialValues
 *
 * @property {String} email email id of the user
 * @property {String} firstname first name of the user
 * @property {String} lastname last name of the user
 */

/**
 * Object type returned by the {@link useCreateAccount} talon.
 * It provides props data to use when rendering the create account form component.
 *
 * @typedef {Object} CreateAccountProps
 *
 * @property {Map} errors a map of errors to their respective mutations
 * @property {Function} handleCancel callback function to handle form cancellations
 * @property {Function} handleSubmit callback function to handle form submission
 * @property {SanitizedInitialValues} initialValues initial values for the create account form
 * @property {Boolean} isDisabled true if either details are being fetched or form is being submitted. False otherwise.
 * @property {Boolean} isSignedIn true if user is signed in. False otherwise.
 */
