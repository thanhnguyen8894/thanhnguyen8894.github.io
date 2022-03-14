import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import mergeOperations from '../../util/shallowMerge';
import _ from 'lodash';

import DEFAULT_OPERATIONS from './hyperPay.gql.js';

import { BrowserPersistence } from '@magento/peregrine/lib/util';
const storage = new BrowserPersistence();

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';

export const useHyperPay = props => {
    const { setCheckoutId, setOrderNumber, loadCheckoutId } = props;
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const {
        getCheckoutIdHyperPay,
        getPaymentStatusHyperPay,
        cancelOrder,
        reOrderItems,
        getCartDetailsQuery
    } = operations;

    const [displayError, setDisplayError] = useState(false);
    const [errorMessagePayment, setErrorMessagePayment] = useState(null);

    const [{ rtl, storeConfig }] = useAppContext();
    const [{ currentUser }] = useUserContext();
    const [{ cartId }] = useCartContext();

    function putGGTagsManagerTracking(orderNumber) {
        try {
            const dataCheckout = storage.getItem('dataCheckout');

            if (dataCheckout) {
                let dataJson = JSON.parse(dataCheckout);

                if (dataJson) {
                    dataJson.ecommerce.purchase.actionField.id = orderNumber;
                    GTMAnalytics.default().trackingPurchase(dataJson);
                    GTMAnalytics.default().trackingPageView(
                        currentUser,
                        rtl,
                        'successPage'
                    );
                    storage.setItem('dataCheckout', null);
                }
            }
        } catch (error) {}
    }

    // defined the load checkoutId query
    const [
        loadCheckoutIdHyperPayMethod,
        {
            error: checkoutIdError,
            called: checkoutIdCalled,
            loading: checkoutIdLoading
        }
    ] = useMutation(getCheckoutIdHyperPay, { fetchPolicy: 'no-cache' });

    // defined the load payment status query
    const [
        loadPaymentStatusHyperPayMethod,
        {
            error: paymentStatusError,
            called: paymentStatusCalled,
            loading: paymentStatusLoading
        }
    ] = useMutation(getPaymentStatusHyperPay, { fetchPolicy: 'no-cache' });

    const [
        handleCancelOrder,
        {
            error: cancelOrderError,
            called: cancelOrderCalled,
            loading: cancelOrderLoading
        }
    ] = useMutation(cancelOrder, { fetchPolicy: 'no-cache' });

    const [
        handleReOrderItems,
        {
            error: reOrderItemsError,
            called: reOrderItemsCalled,
            loading: reOrderItemsLoading
        }
    ] = useMutation(reOrderItems, { fetchPolicy: 'no-cache' });

    // call the re-order API when redirecting to another page while the order is incomplete
    const arrPath = window.location.pathname.split('/');
    const _orderNumber = arrPath[arrPath.length - 1];
    useEffect(() => {
        return () => {
            if (_orderNumber && !_.isNaN(parseInt(_orderNumber))) {
                doCancelOrder({ orderNumber: _orderNumber });
                doReOrderItems({ orderNumber: _orderNumber });
            }
        };
    }, []);

    // call Checkout id
    const handleCheckout = useCallback(
        async formValues => {
            try {
                setDisplayError(false);
                const checkoutIdResponse = await loadCheckoutIdHyperPayMethod({
                    variables: {
                        orderId: formValues.orderId
                    }
                });
                const {
                    ndc: checkoutId
                } = checkoutIdResponse.data.hyperPayCheckout;
                if (checkoutId) {
                    setOrderNumber(formValues.orderId);
                    setCheckoutId(checkoutId);

                    // navigate to HyperPay form
                    loadCheckoutId({
                        checkoutId,
                        orderId: formValues.orderId,
                        paymentMethod: formValues.paymentMethod
                    });
                }
            } catch {
                // Make sure any errors from the mutations are displayed.
                setDisplayError(true);
                return;
            }
        },
        [
            setCheckoutId,
            setOrderNumber,
            loadCheckoutIdHyperPayMethod,
            loadCheckoutId
        ]
    );

    // call Payment Status
    const handlePaymentStatus = useCallback(
        async formValues => {
            // reset message
            setErrorMessagePayment('');
            try {
                setDisplayError(false);
                const paymentStatusResponse = await loadPaymentStatusHyperPayMethod(
                    {
                        variables: {
                            orderId: formValues.orderNumber,
                            checkoutId: formValues.checkoutId
                        }
                    }
                );
                const {
                    message,
                    status
                } = paymentStatusResponse.data.hyperPayPaymentStatus;
                if (!status) {
                    setErrorMessagePayment(message);
                } else {
                    putGGTagsManagerTracking(formValues?.orderNumber);
                }
            } catch {
                // Make sure any errors from the mutations are displayed.
                setDisplayError(true);
                return;
            }
        },
        [loadPaymentStatusHyperPayMethod]
    );

    // call Payment Status
    const doCancelOrder = useCallback(
        async formValues => {
            // reset message
            setErrorMessagePayment('');
            try {
                setDisplayError(false);
                const handleCancelOrderResponse = await handleCancelOrder({
                    variables: {
                        order_number: formValues.orderNumber,
                        message: 'Customer cancel payment.'
                    }
                });
                const {
                    message,
                    status
                } = handleCancelOrderResponse.data.cancelOrder;
                if (!status) {
                    setErrorMessagePayment(message);
                }
            } catch {
                // Make sure any errors from the mutations are displayed.
                setDisplayError(true);
                return;
            }
        },
        [handleCancelOrder]
    );

    const doReOrderItems = useCallback(
        async formValues => {
            // resetMessage
            setErrorMessagePayment('');
            try {
                setDisplayError(false);
                const handleReOrderItemsResponse = await handleReOrderItems({
                    variables: {
                        orderNumber: formValues.orderNumber
                    },
                    refetchQueries: [
                        {
                            query: getCartDetailsQuery,
                            variables: { cartId }
                        }
                    ],
                    awaitRefetchQueries: true
                });
                const { userInputErrors } = handleReOrderItemsResponse?.data;
                if (userInputErrors?.length > 0) {
                    userInputErrors.forEach(err => {
                        const { code, message, path } = err || {};
                        setErrorMessagePayment(message);
                    });
                }
                // reload after click back button of browser
                if (
                    window.location.pathname == '/en/checkout' ||
                    window.location.pathname == '/ar/checkout'
                ) {
                    window.location.reload();
                }
            } catch {
                // Make sure any errors from the mutations are displayed.
                setDisplayError(true);
                return;
            }
        },
        [handleReOrderItems]
    );

    // handle the errors
    const formErrors = useMemo(() => {
        if (displayError) {
            return new Map([
                ['getCheckoutIdHyperPay', checkoutIdError],
                ['getPaymentStatusHyperPay', paymentStatusError]
            ]);
        } else return new Map();
    }, [checkoutIdError, displayError, paymentStatusError]);

    return {
        setOrderNumber,
        setCheckoutId,
        checkoutIdLoading,
        checkoutIdCalled,
        handleCheckout,
        paymentStatusCalled,
        paymentStatusLoading,
        handlePaymentStatus,
        formErrors,
        displayError,
        errorMessagePayment,
        banners: storeConfig,
        doCancelOrder,
        handleReOrderItems,
        getCartDetailsQuery,
        cancelOrderCalled,
        putGGTagsManagerTracking
    };
};
