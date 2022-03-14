import { React, useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
    useApolloClient,
    useLazyQuery,
    useMutation,
    useQuery
} from '@apollo/client';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { clearCartDataFromCache } from '@magento/peregrine/lib/Apollo/clearCartDataFromCache';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useCartContext } from '@magento/peregrine/lib/context/cart';

import { PAYMENT_METHODS } from '@magento/peregrine/lib/util/common';
import { useAppContext } from '@magento/peregrine/lib/context/app';

import { useHyperPay } from './useHyperPay';
import DEFAULT_OPERATIONS from './checkoutPage.gql.js';
import MAIN_OPERATIONS from '@magento/peregrine/lib/talons/HomePage/homePage.gql';
import CheckoutError from './CheckoutError';
import {
    flattenData,
    toAddress,
    toLatLng,
    splitFullname
} from './checkoutHelper';

import _ from 'lodash';

import Geocode from 'react-geocode';
import { GOOGLE_MAP_API_KEY } from '@magento/venia-ui/lib/constants/constants';
Geocode.setApiKey(GOOGLE_MAP_API_KEY);

import { BrowserPersistence } from '@magento/peregrine/lib/util';
const storage = new BrowserPersistence();

import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';

const DEFAULT_VALUE = {
    lat: 24.774265,
    lng: 46.738586
};

const SHIPPING_ADDRESS = {
    fullName: {
        value: '',
        isValid: false
    },
    phoneNumber: {
        value: '',
        isValid: false
    },
    country: {
        value: 'SA',
        isValid: true
    },
    city: {
        isValid: false,
        value: ''
    },
    district: {
        isValid: false,
        value: ''
    },
    address: {
        isValid: false,
        value: ''
    },
    postCode: {
        isValid: false,
        value: ''
    },
    tempLatLng: {
        lat: DEFAULT_VALUE.lat,
        lng: DEFAULT_VALUE.lng
    },
    estAddress: {
        isValid: false,
        value: ''
    }
};

export const useCheckoutPage = (props = {}) => {
    const operations = mergeOperations(
        DEFAULT_OPERATIONS,
        MAIN_OPERATIONS,
        props.operations
    );
    const { afterSubmitShippingAddress, setIsShowAddress } = props;
    const { formatMessage } = useIntl();

    // * CONTEXT
    const apolloClient = useApolloClient();
    const [{ isSignedIn, currentUser }] = useUserContext();
    const [{ cartId }, { createCart, removeCart }] = useCartContext();

    const history = useHistory();
    const [{ rtl, storeConfig }] = useAppContext();
    Geocode.setLanguage(rtl ? 'ar' : 'en');

    // * STATE
    const [isLoading, setIsLoading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(SHIPPING_ADDRESS);
    const [isShowShippingMethodModal, setIsShowShippingMethodModal] = useState(
        false
    );
    const [errorMessage, setErrorMessage] = useState('');
    const [isCartEmpty, setIsCartEmpty] = useState(false);
    const [isEditAddress, setIsEditAddress] = useState(false);

    const [orderNumber, setOrderNumber] = useState('');
    const [checkoutId, setCheckoutId] = useState('');
    const [currentPaymentMethod, setCurrentPaymentMethod] = useState();

    const [userLocation, setUserLocation] = useState(undefined);
    const [isChangeLocationFirstTime, setIsChangeLocationFirstTime] = useState(
        false
    );

    const [addNoteResult, updateAddNoteResult] = useState({});
    const [isCanPayWithApple, setIsCanPayWithApple] = useState(false);

    // Address
    const [currentAddress, setCurrentAddress] = useState({});
    const [shippingAddresses, setShippingAddresses] = useState({});
    const [isDisableSaveMyAddress, setIsDisableSaveMyAddress] = useState(false);

    // Donation
    const [valueDonation, setValueDonation] = useState(null);
    const [warningDonation, setWarningDonation] = useState(false);

    // * GQL
    const {
        createCartMutation,
        getCheckoutDetailsQuery,
        getCustomerQuery,
        placeOrderMutation,
        getPriceSummary,
        setShippingAddressOnCart,
        setOldShippingAddressOnCart,
        setBillingAddressOnCart,
        setShippingMethodOnCart,
        setPaymentMethodOnCart,
        resetShippingPaymentMethod,
        addNoteToCartMutation,
        createCustomerAddressMutation,
        getAppliedCreditWalletQuery,
        getDonationListQuery,
        addDonationToCartMutation
    } = operations;

    const isSAStore = storeConfig?.default_country_code == 'SA';

    //* Set default country code with data from storeConfig
    useEffect(() => {
        setCurrentLocation(preState => {
            preState.country.value = storeConfig?.default_country_code;
            return { ...preState };
        });
    }, [storeConfig]);

    useEffect(() => {
        if (cartId) {
            queryGetCheckoutDetail();
            queryGetPriceSummary();
            if (isSAStore) {
                fetchGetDonationListQuery();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cartId, isSAStore]);

    const [
        fetchGetAppliedCreditWalletQuery,
        { data: walletData }
    ] = useLazyQuery(getAppliedCreditWalletQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !cartId,
        variables: {
            cartId
        }
    });

    const [
        fetchGetDonationListQuery,
        { data: donationListData }
    ] = useLazyQuery(getDonationListQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !cartId,
        variables: {
            storeId: storeConfig?.id
        }
    });

    useEffect(() => {
        if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
            setIsCanPayWithApple(true);
        }

        fetchGetAppliedCreditWalletQuery();
    }, []);

    const { data: customerData, loading: customerLoading } = useQuery(
        getCustomerQuery,
        {
            skip: !isSignedIn,
            notifyOnNetworkStatusChange: true,
            fetchPolicy: 'no-cache'
        }
    );

    const myAddress = useMemo(() => {
        if (customerData) {
            const { customer } = customerData || {};
            const { addresses } = customer || {};
            if (addresses && addresses.length) {
                return addresses;
            }
        }
        return [];
    }, [customerData]);

    const [queryGetCheckoutDetail, checkoutDetailResults] = useLazyQuery(
        getCheckoutDetailsQuery,
        {
            skip: !cartId,
            notifyOnNetworkStatusChange: true,
            variables: {
                cartId
            },
            fetchPolicy: 'no-cache'
        }
    );

    const [queryGetPriceSummary, priceSummaryResults] = useLazyQuery(
        getPriceSummary,
        {
            skip: !cartId,
            notifyOnNetworkStatusChange: true,
            variables: {
                cartId
            },
            fetchPolicy: 'no-cache'
        }
    );

    const [
        createCustomerAddress,
        {
            error: createCustomerAddressError,
            loading: isCreatingCustomerAddress
        }
    ] = useMutation(createCustomerAddressMutation);

    const [
        addDonationToCart,
        { error: addDonationToCartError, loading: addDonationToCartLoading }
    ] = useMutation(addDonationToCartMutation);

    const defaultMyAddress = useMemo(() => {
        if (customerData) {
            const { customer } = customerData || {};
            const { customer_mobile, firstname, lastname, addresses } =
                customer || {};
            if (addresses && addresses.length) {
                const _defaultAddress = _.filter(
                    addresses,
                    d => d.default_shipping === true
                );
                if (_defaultAddress && _defaultAddress.length > 0) {
                    const {
                        city,
                        street,
                        postcode,
                        region,
                        country_code
                    } = _defaultAddress[0];
                    const { region_code } = region || {};
                    const fullName = `${firstname} ${lastname}`;
                    const phoneNumber = customer_mobile;
                    const defaultAddress = {
                        fullName,
                        phoneNumber,
                        city,
                        country: country_code,
                        address: street ? street[0] : null,
                        postCode: postcode,
                        district: region_code || ''
                    };
                    return defaultAddress;
                }
            }
        }
        return null;
    }, [customerData]);

    const hasProductInCart = useMemo(() => {
        if (checkoutDetailResults && checkoutDetailResults.data) {
            const { cart } = checkoutDetailResults.data || {};
            const { items } = cart || {};
            if (items && items.length > 0) {
                return true;
            }
        }
        return false;
    }, [checkoutDetailResults]);

    const nameCustomer = useMemo(() => {
        if (customerData) {
            const { customer } = customerData || {};
            const { firstname, lastname } = customer || {};
            return `${firstname} ${lastname}`;
        }
        return '';
    }, [customerData]);

    const phoneCustomer = useMemo(() => {
        if (customerData) {
            const { customer } = customerData || {};
            const { customer_mobile } = customer || {};
            return customer_mobile;
        }
        return '';
    }, [customerData]);

    // useEffect(() => {
    //     if (customerData) {
    //         const { customer } = customerData || {};
    //         const { customer_mobile, firstname, lastname, addresses } =
    //             customer || {};
    //         // set data for customer
    //         if (customer_mobile && firstname && lastname) {
    //             const fullName = `${firstname} ${lastname}`;
    //             const phoneNumber = customer_mobile;
    //             setCurrentAddress(prevState => {
    //                 prevState.fullName = fullName;
    //                 prevState.phoneNumber = phoneNumber;
    //                 return { ...prevState };
    //             });
    //         }

    //         if (addresses && addresses.length) {
    //             const defaultAddress = _.filter(
    //                 addresses,
    //                 d => d.default_shipping === true
    //             );
    //             if (defaultAddress && defaultAddress.length > 0) {
    //                 const {
    //                     city,
    //                     street,
    //                     postcode,
    //                     region,
    //                     country_code
    //                 } = defaultAddress[0];
    //                 const { region_code } = region || {};
    //                 const fullName = `${firstname} ${lastname}`;
    //                 const phoneNumber = customer_mobile;

    //                 const requestShippingAddress = {
    //                     fullName,
    //                     phoneNumber,
    //                     city,
    //                     country: country_code,
    //                     address: street ? street[0] : null,
    //                     postCode: postcode,
    //                     district: region_code || ''
    //                 };

    //                 // Check to auto call the Shipping Address when Address data is ready
    //                 // Call to submit Shipping Address
    //                 if (
    //                     requestShippingAddress &&
    //                     requestShippingAddress.fullName &&
    //                     requestShippingAddress.phoneNumber &&
    //                     requestShippingAddress.address &&
    //                     requestShippingAddress.city &&
    //                     requestShippingAddress.country &&
    //                     requestShippingAddress.district &&
    //                     requestShippingAddress.postCode
    //                     // && hasProductInCart
    //                 ) {
    //                     requestShippingAddress.estAddress =
    //                         requestShippingAddress.city;
    //                     setTimeout(() => {
    //                         onSaveShippingAddress(requestShippingAddress);
    //                     }, 0);
    //                 }
    //             }
    //         }

    //         if (!customer_mobile) {
    //             history.push('/update-user-phone');
    //         }
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [customerData]);

    const loadCheckoutId = useCallback(
        async responseData => {
            if (responseData) {
                const { checkoutId, orderId, paymentMethod } = responseData;

                let priceSummaryData =
                    priceSummaryResults && priceSummaryResults.data
                        ? priceSummaryResults.data
                        : undefined;

                priceSummaryData = flattenData(priceSummaryData);

                const { total } = priceSummaryData || {};
                const { value } = total || {};

                handleAfterLoadCheckoutId(
                    checkoutId,
                    orderId,
                    paymentMethod,
                    value
                );
            }
        },
        [priceSummaryResults]
    ); // eslint-disable-line react-hooks/exhaustive-deps

    // * HYPER PAY
    const hyperPayProps = useHyperPay({
        setCheckoutId,
        setOrderNumber,
        loadCheckoutId
    });

    const {
        checkoutIdLoading,
        handleCheckout: handleCheckoutOnHyperPay,
        doCancelOrder
    } = hyperPayProps;

    // * CHECKOUT
    const [
        setShippingAddressOnCartMutation,
        { error: setShippingAddressOnCartError }
    ] = useMutation(setShippingAddressOnCart, { fetchPolicy: 'no-cache' });

    const [
        setOldShippingAddressOnCartMutation,
        { error: setOldShippingAddressOnCartError }
    ] = useMutation(setOldShippingAddressOnCart, { fetchPolicy: 'no-cache' });

    const [
        setBillingAddressOnCartMutation,
        { error: setBillingAddressOnCartError }
    ] = useMutation(setBillingAddressOnCart, { fetchPolicy: 'no-cache' });

    const [
        setShippingMethodOnCartMutation,
        { error: setShippingMethodOnCartError }
    ] = useMutation(setShippingMethodOnCart, { fetchPolicy: 'no-cache' });

    const [
        setPaymentMethodOnCartMutation,
        { error: setPaymentMethodOnCartError }
    ] = useMutation(setPaymentMethodOnCart, { fetchPolicy: 'no-cache' });

    const [
        resetShippingPaymentMethodMutation,
        { error: resetShippingPaymentMethodError }
    ] = useMutation(resetShippingPaymentMethod, { fetchPolicy: 'no-cache' });

    const [placeOrder, { error: placeOrderError }] = useMutation(
        placeOrderMutation,
        { fetchPolicy: 'no-cache' }
    );

    const [addNote, { error: addNoteError }] = useMutation(
        addNoteToCartMutation,
        {
            fetchPolicy: 'no-cache'
        }
    );
    // * AFTER CHECKOUT
    const [fetchCartId] = useMutation(createCartMutation);

    // * STATE CHANGE
    async function onChangeAddressFromMap(formValues) {
        try {
            const { lat, lng, fullName, phoneNumber } = formValues || {};
            if (!lat || !lng) {
                return;
            }
            const {
                customer_mobile: phoneLogin,
                firstname: firstNameLogin,
                lastname: lastNameLogin
            } = currentUser || {};

            setIsLoading(true);
            saveTempLocation({ lat, lng });
            const newAddress = await toAddress({ lat, lng });

            const { customer } = customerData || {};
            const { firstname = '', lastname = '', customer_mobile = '' } =
                customer || {};

            let newFullName = '';
            if (firstname && lastname) {
                newFullName = `${firstname} ${lastname}`;
            } else {
                const nameLogin =
                    firstNameLogin && lastNameLogin
                        ? `${firstNameLogin} ${lastNameLogin}`
                        : '';
                newFullName = fullName || nameLogin || nameCustomer;
            }
            const newPhoneNumber =
                customer_mobile || phoneNumber || phoneLogin || phoneCustomer;

            // force to close the Address
            setIsShowAddress(false);

            const addressToForm = {
                fullName:
                    newFullName && newFullName.trim()
                        ? newFullName.trim()
                        : currentAddress.fullName,
                phoneNumber: newPhoneNumber || currentAddress.phoneNumber,
                city: newAddress.city,
                district: newAddress.district,
                address: newAddress.address,
                estAddress: newAddress.city,
                postCode: newAddress.postCode,
                country: newAddress.country
            };

            setCurrentAddress(prevState => {
                if (addressToForm.fullName) {
                    prevState.fullName = addressToForm.fullName;
                }
                if (addressToForm.phoneNumber) {
                    prevState.phoneNumber = addressToForm.phoneNumber;
                }
                prevState.city = addressToForm.city;
                prevState.country = addressToForm.country;
                prevState.address = addressToForm.address;
                prevState.postCode = addressToForm.postCode;
                prevState.estAddress = addressToForm.estAddress;
                prevState.district = addressToForm.district;
                return { ...prevState };
            });

            // Call to submit Shipping Address
            setTimeout(() => {
                onSaveShippingAddress(addressToForm);
            }, 0);

            setIsEditAddress(true);

            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error(error);
        }
    }

    function onClickCurrentLocation(status) {
        setIsLoading(true);
        if (status === false) {
            setTimeout(() => setIsLoading(false), 1000);
        }
    }

    function checkDuplicateAddress(lstAddress, address) {
        let result = false;
        lstAddress.forEach(item => {
            if (
                item.city == address.city &&
                item.country == address.country_code &&
                item.street[0] == address.address &&
                item.postcode == address.postCode &&
                item.region.region == address.district
            ) {
                result = true;
            }
        });
        return result;
    }

    useEffect(() => {
        if (currentAddress && currentAddress?.fullName) {
            if (checkDuplicateAddress(myAddress, currentAddress)) {
                setIsDisableSaveMyAddress(true);
            }
        }
    }, [currentAddress]);

    async function onSaveShippingAddress(data) {
        if (typeof data === 'object') {
            const {
                city,
                district,
                address,
                postCode,
                country,
                fullName,
                phoneNumber
            } = data || {};

            const { firstname, lastname } = splitFullname(fullName) || {};

            const addressParams = {
                firstname,
                lastname,
                company: '',
                street: address,
                city: city,
                region: district,
                postcode: postCode,
                country_code: country,
                telephone: phoneNumber,
                save_in_address_book: false
            };

            if (
                !firstname ||
                !lastname ||
                !address ||
                !city ||
                !district ||
                !country ||
                !phoneNumber
            ) {
                // this save not call to server side
                return;
            }
            await setAddressToOrder(addressParams);
        } else {
            await setAddressToOrder(data);
        }
    }

    const saveTempLocation = useCallback(({ lat, lng }) => {
        setCurrentLocation(prevState => {
            prevState.tempLatLng = { lat, lng };
            return { ...prevState };
        });
    }, []);

    async function onChangeShippingMethod(method) {
        setIsShowShippingMethodModal(false);
        if (method) {
            const { carrier_code, method_code } = method || {};
            if (carrier_code && method_code) {
                await setShippingMethodToOrder(carrier_code, method_code);
            }
        }
    }

    async function onChangePaymentMethod(method) {
        if (method) {
            const { code } = method || {};
            if (code) {
                await setPaymentMethodToOrder(code);
            }
        }
    }

    function onCouponActionDoing(status) {
        if (status) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    }

    function onCouponActionDone() {
        queryGetCheckoutDetail();
        queryGetPriceSummary();
        fetchGetAppliedCreditWalletQuery();
    }

    // * DATA CHANGE
    const getCheckoutDetailLoading = useMemo(() => {
        return checkoutDetailResults && checkoutDetailResults.loading;
    }, [checkoutDetailResults]);

    const cartItems = useMemo(() => {
        let isAddressNotAvailable = true;
        let itemsData = [];

        if (checkoutDetailResults && checkoutDetailResults.data) {
            const { cart } = checkoutDetailResults.data || {};
            const { items = [], shipping_addresses } = cart || {};

            if (shipping_addresses && shipping_addresses.length > 0) {
                const address = shipping_addresses[0];

                if (address) {
                    const {
                        city = '',
                        country,
                        street = [],
                        region,
                        postcode = '',
                        firstname,
                        lastname,
                        telephone
                    } = address || {};
                    const { code: countryCode = '' } = country || {};
                    const { code: regionCode = '' } = region || {};

                    isAddressNotAvailable = false;
                    const newShippingAddress = {
                        fullName: `${firstname} ${lastname}`,
                        phoneNumber: telephone,
                        country: countryCode,
                        city,
                        district: regionCode,
                        address: street && street.length > 0 ? street[0] : '',
                        estAddress: city,
                        postCode: postcode
                    };

                    setShippingAddresses(prevState => {
                        prevState.fullName = newShippingAddress.fullName;
                        prevState.phoneNumber = newShippingAddress.phoneNumber;
                        prevState.city = newShippingAddress.city;
                        prevState.country = newShippingAddress.country;
                        prevState.address = newShippingAddress.address;
                        prevState.postCode = newShippingAddress.postCode;
                        prevState.estAddress = newShippingAddress.estAddress;
                        prevState.district = newShippingAddress.district;
                        return { ...prevState };
                    });

                    setIsEditAddress(true);
                    setIsChangeLocationFirstTime(true);
                }
            }
            if (items.length === 0) {
                setIsCartEmpty(true);
            }

            itemsData = items;
        }

        if (
            isAddressNotAvailable &&
            userLocation &&
            !isChangeLocationFirstTime
        ) {
            const { lat, lng } = userLocation || {};
            onChangeAddressFromMap({ lat, lng });
            setIsChangeLocationFirstTime(true);
        }

        return itemsData;
    }, [
        checkoutDetailResults,
        userLocation,
        setShippingAddresses,
        isChangeLocationFirstTime
    ]);

    const shippingMethods = useMemo(() => {
        if (checkoutDetailResults && checkoutDetailResults.data) {
            const { cart } = checkoutDetailResults.data || {};
            const { shipping_addresses } = cart || {};

            if (shipping_addresses && shipping_addresses.length > 0) {
                const { available_shipping_methods = [] } =
                    shipping_addresses[0] || {};

                return available_shipping_methods;
            }
        }

        return undefined;
    }, [checkoutDetailResults]);

    const paymentMethods = useMemo(() => {
        if (checkoutDetailResults && checkoutDetailResults.data) {
            const { cart } = checkoutDetailResults.data || {};
            const { available_payment_methods = [] } = cart || {};

            return available_payment_methods;
        }

        return undefined;
    }, [checkoutDetailResults]);

    const shippingMethodSelected = useMemo(() => {
        if (checkoutDetailResults && checkoutDetailResults.data) {
            const { cart } = checkoutDetailResults.data || {};
            const { shipping_addresses = [] } = cart || {};

            if (shipping_addresses && shipping_addresses.length > 0) {
                const { selected_shipping_method } =
                    shipping_addresses[0] || {};

                if (selected_shipping_method) {
                    return selected_shipping_method;
                }
            }
        }

        return undefined;
    }, [checkoutDetailResults]);

    const paymentMethodSelected = useMemo(() => {
        if (checkoutDetailResults && checkoutDetailResults.data) {
            const { cart } = checkoutDetailResults.data || {};
            const { selected_payment_method } = cart || {};

            if (selected_payment_method) {
                return selected_payment_method;
            }
        }

        return undefined;
    }, [checkoutDetailResults]);

    // * HANDLE CREATE ORDER
    async function setAddressToOrder(address) {
        try {
            const saveNewAddressOrOld = typeof address === 'object';
            setIsLoading(true);
            let response;
            if (saveNewAddressOrOld) {
                response = await setShippingAddressOnCartMutation({
                    variables: {
                        cartId,
                        shippingAddress: address
                    }
                });
                setIsDisableSaveMyAddress(false);
            } else {
                response = await setOldShippingAddressOnCartMutation({
                    variables: {
                        cartId,
                        customerAddressId: address
                    }
                });
                setIsDisableSaveMyAddress(true);
            }

            const _address = myAddress?.find(item => item.id === address);
            const addressOld = {
                city: _address?.city,
                company: '',
                country_code: _address?.country_code || '',
                firstname: _address?.firstname || '',
                lastname: _address?.lastname || '',
                postcode: _address?.postcode || '',
                region: _address?.region?.region_code || '',
                save_in_address_book: false,
                street: _address?.street[0] || '',
                telephone: _address?.telephone || ''
            };

            await setBillingAddressOnCartMutation({
                variables: {
                    cartId,
                    billingAddress: {
                        address: saveNewAddressOrOld ? address : addressOld,
                        same_as_shipping: false
                    }
                }
            });

            const { data } = response || {};

            if (data) {
                const { setShippingAddressesOnCart } = data || {};
                const { cart } = setShippingAddressesOnCart || {};
                const { shipping_addresses } = cart || {};

                if (shipping_addresses && shipping_addresses.length > 0) {
                    const {
                        available_shipping_methods = []
                    } = shipping_addresses[0];

                    if (available_shipping_methods) {
                        if (available_shipping_methods.length === 1) {
                            const { carrier_code, method_code } =
                                available_shipping_methods[0] || {};

                            await setShippingMethodToOrder(
                                carrier_code,
                                method_code
                            );
                        } else {
                            setIsShowShippingMethodModal(true);
                        }
                    }
                }

                setIsEditAddress(true);
                queryGetCheckoutDetail();
                queryGetPriceSummary();

                setIsLoading(false);

                if (afterSubmitShippingAddress) {
                    afterSubmitShippingAddress();
                }
            }
        } catch (error) {
            setIsLoading(false);
        }
    }

    async function setShippingMethodToOrder(carrier_code, method_code) {
        try {
            setIsLoading(true);
            const response = await setShippingMethodOnCartMutation({
                variables: {
                    cartId,
                    shippingMethods: {
                        carrier_code: carrier_code,
                        method_code: method_code
                    }
                }
            });
            setIsLoading(false);

            const { data } = response || {};
            if (data) {
                queryGetCheckoutDetail();
                queryGetPriceSummary();
            }
        } catch (error) {
            setIsLoading(false);
        }
    }

    async function setPaymentMethodToOrder(code) {
        try {
            setIsLoading(true);
            const response = await setPaymentMethodOnCartMutation({
                variables: {
                    cartId,
                    paymentMethods: {
                        code: code
                    }
                }
            });
            setIsLoading(false);

            const { data } = response || {};
            if (data) {
                queryGetCheckoutDetail();
                queryGetPriceSummary();
            }
        } catch (error) {
            setIsLoading(false);
        }
    }

    async function resetShippingPaymentMethodToOrder() {
        try {
            setIsLoading(true);
            const response = await resetShippingPaymentMethodMutation({
                variables: {
                    cartId
                }
            });
            setIsLoading(false);

            const { data } = response || {};
            if (data) {
                await queryGetCheckoutDetail();
                await queryGetPriceSummary();
            }
        } catch (error) {
            setIsLoading(false);
        }
    }

    async function saveToMyAddress(address) {
        try {
            setIsLoading(true);
            await createCustomerAddress({
                variables: { address }
            });

            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    }

    const saveAddressToMyAddress = isSave => {
        if (isSave) {
            // TODO : Need to check data existing into MyAddress
            // const isExistingAddress = _.findIndex(myAddress, address =>
            //     _.isEqual(currentAddress, address)
            const { firstname, lastname } =
                splitFullname(currentAddress.fullName) || {};
            const addressPayload = {
                city: currentAddress.city,
                country_code: currentAddress.country,
                default_billing: false,
                default_shipping: false,
                firstname: firstname,
                lastname: lastname,
                middlename: '',
                postcode: currentAddress.postCode,
                telephone: currentAddress.phoneNumber,
                street: [currentAddress.address],
                region: {
                    region: currentAddress.district,
                    region_code: currentAddress.district,
                    region_id: null
                }
            };
            saveToMyAddress(addressPayload);
        }
    };

    const callAddDonationToCart = useCallback(async () => {
        await addDonationToCart({
            variables: {
                input: {
                    cart_id: cartId,
                    donation: valueDonation?.value
                }
            }
        });
    }, [valueDonation]);

    //* Check condition and setMessage for show toast when submit order
    const checkCondition = useCallback(() => {
        const { city, district, address, country, fullName, phoneNumber } =
            currentAddress || {};
        // Hiddent text red field required when seleted donation alr
        if (valueDonation) {
            setWarningDonation(false);
        }
        if (
            _.isEmpty(currentAddress) ||
            !city ||
            !district ||
            !address ||
            !fullName ||
            !phoneNumber ||
            !country
        ) {
            setErrorMessage(
                formatMessage({
                    id: 'checkoutPage.addressInfoError',
                    defaultMessage: 'Address info is missing'
                })
            );
        } else if (!shippingMethodSelected) {
            setErrorMessage(
                formatMessage({
                    id: 'checkoutPage.shippingMethodError',
                    defaultMessage: 'Shipping method is missing.'
                })
            );
        } else if (!paymentMethodSelected) {
            setErrorMessage(
                formatMessage({
                    id: 'checkoutPage.paymentMethodError',
                    defaultMessage: 'Payment method is missing.'
                })
            );
        } else if (!paymentMethodSelected.code) {
            setErrorMessage(
                formatMessage({
                    id: 'checkoutPage.paymentMethodError',
                    defaultMessage: 'Payment method is missing.'
                })
            );
        } else if ((warningDonation || !valueDonation) && isSAStore) {
            setErrorMessage(
                formatMessage({
                    id: 'checkoutPage.donationError',
                    defaultMessage: 'Please select donation.'
                })
            );
        } else {
            setErrorMessage('');
        }
        setTimeout(() => {
            setErrorMessage('');
        }, 300);
    }, [
        currentAddress,
        formatMessage,
        isSAStore,
        paymentMethodSelected,
        shippingMethodSelected,
        valueDonation,
        warningDonation
    ]);

    // * HANDLE CHECKOUT
    const onSubmitPlaceOrder = useCallback(
        formValues => {
            checkCondition();
            if (errorMessage === '') {
                const { isSaveToMyAddress } = formValues || {};

                if (!shippingMethodSelected) {
                    setIsShowShippingMethodModal(true);
                } else {
                    const { code } = paymentMethodSelected || {};
                    setCurrentPaymentMethod(code);

                    // save Shipping Address to My Address
                    saveAddressToMyAddress(isSaveToMyAddress);

                    switch (code) {
                        case PAYMENT_METHODS.cod:
                            placeOrderCOD();
                            break;
                        case PAYMENT_METHODS.hyper_pay_visa:
                        case PAYMENT_METHODS.hyper_pay_master:
                        case PAYMENT_METHODS.hyper_pay_mada:
                        case PAYMENT_METHODS.hyper_pay_applepay:
                        case PAYMENT_METHODS.hyper_pay_amex:
                            placeOrderOnCard(code);
                            break;
                        default:
                            break;
                    }

                    getDataCheckout(code);
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            checkCondition,
            getDataCheckout,
            paymentMethodSelected,
            saveAddressToMyAddress,
            shippingMethodSelected
        ]
    );

    async function placeOrderCOD() {
        try {
            setIsLoading(true);
            const response = await placeOrder({
                variables: {
                    cartId
                }
            });
            const { data } = response || {};
            if (data) {
                const { placeOrder } = data || {};
                const { order } = placeOrder || {};
                const { order_number } = order || {};
                if (order_number) {
                    // Reset card
                    await removeCart();
                    await clearCartDataFromCache(apolloClient);

                    await createCart({
                        fetchCartId
                    });

                    setOrderNumber(order_number);

                    setIsLoading(false);
                }
            }
        } catch (error) {
            setIsLoading(false);
        }
    }

    async function placeOrderOnCard(paymentCode) {
        try {
            setIsLoading(true);
            // Handle scroll top when click placeholder
            window.scrollTo({ top: 0, behavior: 'smooth' });
            const response = await placeOrder({
                variables: {
                    cartId
                }
            });
            const { data } = response || {};
            if (data) {
                const { placeOrder } = data || {};
                const { order } = placeOrder || {};
                const { order_number } = order || {};
                if (order_number) {
                    handleCheckoutOnHyperPay({
                        orderId: order_number,
                        paymentMethod: paymentCode
                    });
                }
            }
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    }

    // * HANDLE AFTER CHECKOUT
    useEffect(() => {
        if (orderNumber && currentPaymentMethod === PAYMENT_METHODS.cod) {
            history.push(
                `/checkout/confirm-payment?orderNumber=${orderNumber}`
            );
        }
    }, [orderNumber, currentPaymentMethod, history]);

    const handleAfterLoadCheckoutId = async (
        checkoutId,
        orderId,
        paymentMethod,
        total
    ) => {
        if (checkoutId && orderId) {
            try {
                setIsLoading(true);
                await removeCart();
                await clearCartDataFromCache(apolloClient);

                await createCart({
                    fetchCartId
                });
                setIsLoading(false);
                history.push(
                    `/checkout/${checkoutId}/hyperpay/${paymentMethod}/${orderId}?total=${total}`
                );
            } catch (error) {
                setIsLoading(false);
                console.error(error);
            }
        }
    };

    function getDataCheckout(option) {
        try {
            const sumPrices = priceSummaryResults?.data?.cart?.prices || {};
            const items = checkoutDetailResults?.data?.cart?.items || [];
            const applied_coupons =
                checkoutDetailResults?.data?.cart?.applied_coupons || [];
            const shipping =
                checkoutDetailResults?.data?.cart?.shipping_addresses || [];

            const total = sumPrices?.grand_total?.value || '';
            const applied_taxes = sumPrices?.applied_taxes || [];
            const cash_on_delivery_fee =
                sumPrices?.cash_on_delivery_fee?.amount?.value || 0;

            let taxTotal = 0;
            applied_taxes.forEach(taxItem => {
                taxTotal += taxItem?.amount?.value;
            });

            let shippingTotal = cash_on_delivery_fee;
            shipping.forEach(shipping => {
                shippingTotal +=
                    shipping?.selected_shipping_method?.amount?.value;
            });

            let couponText = '';
            applied_coupons.forEach(coupon => {
                couponText += coupon?.code;
            });

            const products = [];

            items.forEach(item => {
                products.push({
                    name: item?.product?.name || '',
                    id: item?.product?.id || '',
                    price: item?.prices?.price?.value || '',
                    quantity: item?.quantity || '',
                    sku: item?.product?.sku || ''
                });
            });

            const results = {
                ecommerce: {
                    purchase: {
                        actionField: {
                            id: '',
                            affiliation: `${option}`,
                            revenue: `${total}`,
                            tax: `${taxTotal}`,
                            shipping: `${shippingTotal}`,
                            coupon: `${couponText}`
                        },
                        products: products
                    }
                }
            };

            const dataString = JSON.stringify(results);
            storage.setItem('dataCheckout', dataString);
        } catch (error) {}
    }

    // * USER LOCATION
    function getCurrentLocation() {
        if (
            navigator.permissions &&
            navigator.permissions.query &&
            !checkoutDetailResults.loading
        ) {
            navigator.permissions
                .query({ name: 'geolocation' })
                .then(function(result) {
                    if (result.state == 'denied') {
                        alert(
                            'Please turn on your location to auto get your current address'
                        );
                    } else {
                        onGetCurrentLocation();
                    }
                });
        } else if (navigator.geolocation) {
            onGetCurrentLocation();
        } else {
            alert(
                'Please turn on your location to auto get your current address'
            );
        }
    }

    const onGetCurrentLocation = () => {
        function storeCoordinates(position) {
            const { coords } = position || {};
            const { latitude, longitude } = coords || {};
            const { customer } = customerData || {};
            const { firstname = '', lastname = '', customer_mobile = '' } =
                customer || {};
            const fullName = `${firstname} ${lastname}`;
            const phoneNumber = customer_mobile;
            if (latitude && longitude) {
                saveTempLocation({ lat: latitude, lng: longitude });
                setUserLocation({ lat: latitude, lng: longitude });
                onChangeAddressFromMap({
                    fullName,
                    phoneNumber,
                    lat: latitude,
                    lng: longitude
                });
            }
        }
        function errorHandler(error) {
            console.warn(error);
        }
        navigator.geolocation.getCurrentPosition(
            storeCoordinates,
            errorHandler,
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
        );
    };

    // * HANDLE ERROR
    const checkoutError = useMemo(() => {
        if (setShippingAddressOnCartError) {
            return new CheckoutError(setShippingAddressOnCartError);
        }

        if (setOldShippingAddressOnCartError) {
            return new CheckoutError(setOldShippingAddressOnCartError);
        }

        if (setShippingMethodOnCartError) {
            return new CheckoutError(setShippingMethodOnCartError);
        }

        if (setPaymentMethodOnCartError) {
            return new CheckoutError(setPaymentMethodOnCartError);
        }

        if (placeOrderError) {
            return new CheckoutError(placeOrderError);
        }
        if (addNoteError) {
            return new CheckoutError(addNoteError);
        }
        if (addDonationToCartError) {
            return new CheckoutError(addDonationToCartError);
        }
    }, [
        setShippingAddressOnCartError,
        setOldShippingAddressOnCartError,
        setShippingMethodOnCartError,
        setPaymentMethodOnCartError,
        placeOrderError,
        addNoteError,
        addDonationToCartError
    ]);

    const isDisablePlaceOrder = useMemo(() => {
        // if (
        //     currentAddress &&
        //     shippingMethodSelected &&
        //     paymentMethodSelected &&
        //     paymentMethodSelected.code
        // ) {
        //     const { city, district, address, country, fullName, phoneNumber } =
        //         currentAddress || {};
        //     if (
        //         city &&
        //         district &&
        //         address &&
        //         fullName &&
        //         phoneNumber &&
        //         country
        //     ) {
        //         return false;
        //     }
        // }

        // return true;
        return false;
    }, [currentAddress, paymentMethodSelected, shippingMethodSelected]);

    // * Handle add note on cart
    const onSubmitNote = useCallback(
        async formValues => {
            try {
                const { note } = formValues;
                const response = await addNote({
                    variables: {
                        input: {
                            cart_id: cartId,
                            customer_note: note
                        }
                    }
                });
                const { data } = response || {};
                const { addCustomerNoteToCart } = data || {};
                if (addCustomerNoteToCart) {
                    // TODO
                    updateAddNoteResult(addCustomerNoteToCart);
                } else {
                    updateAddNoteResult({});
                }
            } catch (error) {
                console.log(error);
                updateAddNoteResult({});
            }
        },
        [addNote, cartId]
    );

    const priceSummaryData =
        priceSummaryResults && priceSummaryResults.data
            ? priceSummaryResults.data
            : undefined;
    const getPriceSummaryLoading =
        priceSummaryResults && priceSummaryResults.loading;

    useEffect(() => {
        getCurrentLocation();
        if (customerData) {
            GTMAnalytics.default().trackingPageView(
                currentUser,
                rtl,
                'checkoutPage'
            );
        }
    }, [customerData]);

    const donationList = useMemo(() => {
        return donationListData?.getDonationList?.items || [];
    }, [donationListData]);

    return {
        addNoteResult,
        customerData,
        cartItems,
        isCartEmpty,
        priceSummaryData: flattenData(priceSummaryData),
        orderNumber,
        checkoutId,
        isLoading:
            isLoading ||
            customerLoading ||
            getCheckoutDetailLoading ||
            getPriceSummaryLoading ||
            checkoutIdLoading ||
            addDonationToCartLoading,
        isShowShippingMethodModal,
        currentLocation,
        currentAddress,
        shippingMethods,
        shippingMethodSelected,
        paymentMethods,
        paymentMethodSelected,
        isEditAddress,
        isDisablePlaceOrder,
        isDisableSaveMyAddress,
        isSignedIn,
        currentPaymentMethod,
        error: checkoutError || errorMessage,
        hasError: !!checkoutError,
        onChangeAddressFromMap,
        onClickCurrentLocation,
        onChangeShippingMethod,
        onChangePaymentMethod,
        onSubmitPlaceOrder,
        onSaveShippingAddress,
        myAddress,
        shippingAddresses,
        defaultMyAddress,
        setCurrentAddress,
        setIsShowShippingMethodModal,
        onCouponActionDoing,
        onCouponActionDone,
        onSubmitNote,
        banners: storeConfig,
        isCanPayWithApple,
        doCancelOrder,
        walletData,

        donationList,
        valueDonation,
        setValueDonation,
        warningDonation,
        setWarningDonation,
        callAddDonationToCart
    };
};
