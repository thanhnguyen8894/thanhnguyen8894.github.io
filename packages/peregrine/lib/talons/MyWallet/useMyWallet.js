import { useCallback, useState, useEffect } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useIntl } from 'react-intl';

export const useMyWallet = props => {
    const {
        mutations: {
            sendWalletRewardCreditToFriend,
            setWalletRewardInviteFriend,
            walletRewardWithdrawCredit,
            walletRewardBuyCredit,
            updateWalletRewardEmailSubs
        },
        queries: {
            getCustomerInformationQuery,
            getWalletRewardTransHistoryQuery,
            getWalletRewardWithdrawCreditHistoryQuery,
            getWalletRewardEmailSubs
        },
        walletMinWithdraw
    } = props;

    const { formatMessage } = useIntl();
    const [{ cartId }] = useCartContext();
    const [{ isSignedIn }] = useUserContext();
    const [errorMessage, updateErrorMessage] = useState('');
    const [succesMessage, updateSuccessMessage] = useState('');

    useEffect(() => {
        queryGetCustomerInformation();
        queryGetWalletRewardEmailSubs();
        queryGetWalletRewardTransHistory();
        queryGetWalletRewardWithdrawCreditHistory();
    }, []);

    // QUERY
    const [queryGetCustomerInformation, customerData] = useLazyQuery(
        getCustomerInformationQuery,
        {
            skip: !isSignedIn,
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first'
        }
    );

    const [
        queryGetWalletRewardEmailSubs,
        walletRewardEmailSubsData
    ] = useLazyQuery(getWalletRewardEmailSubs, {
        skip: !isSignedIn,
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const [queryGetWalletRewardTransHistory, transHistoryData] = useLazyQuery(
        getWalletRewardTransHistoryQuery,
        {
            skip: !isSignedIn,
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first'
        }
    );

    const [
        queryGetWalletRewardWithdrawCreditHistory,
        withdrawHistoryData
    ] = useLazyQuery(getWalletRewardWithdrawCreditHistoryQuery, {
        skip: !isSignedIn,
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    // MUTATION
    const [
        sendWalletRewardCreditToFriendMutation,
        { loading: sendWalletRewardCreditToFriendLoading }
    ] = useMutation(sendWalletRewardCreditToFriend, {
        fetchPolicy: 'no-cache'
    });

    const [
        setWalletRewardInviteFriendMutation,
        { loading: setWalletRewardInviteFriendLoading }
    ] = useMutation(setWalletRewardInviteFriend, {
        fetchPolicy: 'no-cache'
    });

    const [
        walletRewardWithdrawCreditMutation,
        { loading: walletRewardWithdrawCreditLoading }
    ] = useMutation(walletRewardWithdrawCredit, {
        fetchPolicy: 'no-cache'
    });

    const [
        walletRewardBuyCreditMutation,
        { loading: walletRewardBuyCreditLoading }
    ] = useMutation(walletRewardBuyCredit, {
        fetchPolicy: 'no-cache'
    });

    const [
        updateWalletRewardEmailSubsMutation,
        { loading: updateWalletRewardEmailSubsLoading }
    ] = useMutation(updateWalletRewardEmailSubs, {
        fetchPolicy: 'no-cache'
    });

    // SUBMIT
    const onSendWalletRewardCreditToFriend = useCallback(
        async formValues => {
            const {
                credit,
                friendFirstName,
                friendLastName,
                friendEmail,
                message
            } = formValues;
            try {
                const currentCredit =
                    customerData?.data?.customer?.wallet_credit || 0;

                if (
                    parseFloat(credit) > parseFloat(currentCredit) ||
                    parseFloat(credit) < 0
                ) {
                    updateErrorMessage(
                        formatMessage({
                            id: 'myWallet.validCreditMessage',
                            defaultMessage: 'Credit amount invalid'
                        })
                    );
                    return;
                }

                const response = await sendWalletRewardCreditToFriendMutation({
                    variables: {
                        credit: parseFloat(credit),
                        firstname: friendFirstName,
                        lastname: friendLastName,
                        email: friendEmail,
                        message: message
                    }
                });
                const { data } = response || {};
                const { sendWalletRewardCreditToFriend } = data || {};
                const { status, message: mess } =
                    sendWalletRewardCreditToFriend || {};

                await queryGetCustomerInformation();
                await queryGetWalletRewardTransHistory();

                if (status && status === 'SUCCESS') {
                    updateSuccessMessage(mess);
                } else {
                    updateErrorMessage(mess);
                }
            } catch (error) {
                // TODO
            }
        },
        [customerData]
    );

    const onWalletRewardInviteFriend = useCallback(async formValues => {
        try {
            const { firstName, lastName, email, yourMessage } = formValues;

            const response = await setWalletRewardInviteFriendMutation({
                variables: {
                    firstname: firstName,
                    lastname: lastName,
                    email: email,
                    message: yourMessage
                }
            });
            const { data } = response || {};
            const { setWalletRewardInviteFriend } = data || {};
            const { status, message: mess } = setWalletRewardInviteFriend || {};

            if (status && status === 'SUCCESS') {
                updateSuccessMessage(mess);
            } else {
                updateErrorMessage(mess);
            }
        } catch (error) {
            // TODO
        }
    }, []);

    const onWalletRewardWithdrawCredit = useCallback(
        async formValues => {
            const { credit, paypalEmail, reason } = formValues;
            try {
                const currentCredit =
                    customerData?.data?.customer?.wallet_credit || 0;

                if (
                    parseFloat(credit) > parseFloat(currentCredit) ||
                    parseFloat(credit) < 0
                ) {
                    updateErrorMessage(
                        formatMessage({
                            id: 'myWallet.validCreditMessage',
                            defaultMessage: 'Credit amount invalid'
                        })
                    );
                    return;
                }
                if (parseFloat(walletMinWithdraw) > parseFloat(credit)) {
                    updateErrorMessage(
                        formatMessage(
                            {
                                id: 'myWallet.minWithdrawValue',
                                defaultMessage: `Credit amount withdraw should be more ${walletMinWithdraw}`
                            },
                            {
                                value: walletMinWithdraw
                            }
                        )
                    );
                    return;
                }

                const response = await walletRewardWithdrawCreditMutation({
                    variables: {
                        credit: parseFloat(credit),
                        email: paypalEmail,
                        reason: reason
                    }
                });
                const { data } = response || {};
                const { walletRewardWithdrawCredit } = data || {};
                const { status, message: mess } =
                    walletRewardWithdrawCredit || {};

                await queryGetWalletRewardWithdrawCreditHistory();

                if (status && status === 'SUCCESS') {
                    updateSuccessMessage(mess);
                } else {
                    updateErrorMessage(mess);
                }
            } catch (error) {
                // TODO
            }
        },
        [customerData]
    );

    const onWalletRewardBuyCredit = useCallback(async formValues => {
        try {
            const { credit } = formValues;

            const response = await walletRewardBuyCreditMutation({
                variables: {
                    credit: parseInt(credit),
                    cart_id: cartId
                }
            });
            const { data } = response || {};
            const { walletRewardBuyCredit } = data || {};
            const { status, message: mess } = walletRewardBuyCredit || {};

            if (status && status === 'SUCCESS') {
                // updateSuccessMessage(mess);
                window.location = '/cart';
            } else {
                updateErrorMessage(mess);
            }
        } catch (error) {
            // TODO
        }
    }, []);

    const onUpdateWalletRewardEmailSubs = useCallback(async statusValue => {
        try {
            const response = await updateWalletRewardEmailSubsMutation({
                variables: {
                    subscription: statusValue
                }
            });
            const { data } = response || {};
            const { setWalletRewardEmailSubscription } = data || {};
            const { status } = setWalletRewardEmailSubscription || {};

            await queryGetWalletRewardEmailSubs();
            if (status) {
                updateSuccessMessage(status);
            }
        } catch (error) {
            // TODO
        }
    }, []);

    // MESSAGE CLOSE
    function onCloseErrorModal() {
        updateErrorMessage('');
    }

    function onCloseSuccessModal() {
        updateSuccessMessage('');
    }

    return {
        customer: customerData?.data?.customer || null,
        walletRewardEmailSubsData:
            walletRewardEmailSubsData?.data?.GetWalletRewardEmailSubscription ||
            null,
        isSignedIn,
        isLoading:
            customerData?.loading ||
            transHistoryData?.loading ||
            withdrawHistoryData?.loading ||
            sendWalletRewardCreditToFriendLoading ||
            setWalletRewardInviteFriendLoading ||
            walletRewardWithdrawCreditLoading ||
            walletRewardBuyCreditLoading ||
            updateWalletRewardEmailSubsLoading,
        errorMessage,
        succesMessage,
        transHistoryData:
            transHistoryData?.data?.GetWalletRewardTransactionalHistory || [],
        withdrawHistoryData:
            withdrawHistoryData?.data?.GetWalletRewardWithdrawCreditHistory ||
            [],
        onCloseErrorModal,
        onCloseSuccessModal,
        onSendWalletRewardCreditToFriend,
        onWalletRewardInviteFriend,
        onWalletRewardWithdrawCredit,
        onWalletRewardBuyCredit,
        onUpdateWalletRewardEmailSubs
    };
};
