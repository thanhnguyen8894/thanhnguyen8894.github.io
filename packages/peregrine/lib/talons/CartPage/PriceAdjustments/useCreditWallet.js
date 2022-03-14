import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useCartContext } from '@magento/peregrine/lib/context/cart';

export const useCreditWallet = props => {
    const {
        setIsCartUpdating,
        setUpdateFinish,
        mutations: { applyCreditWalletMutation, removeCreditWalletMutation },
        queries: { getAppliedCreditWalletQuery }
    } = props;

    const [{ cartId }] = useCartContext();
    const [errorMessageCustom, setErrorMessage] = useState('');

    const [
        fetchGetAppliedCreditWalletQuery,
        { data, error: fetchError }
    ] = useLazyQuery(getAppliedCreditWalletQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !cartId,
        variables: {
            cartId
        }
    });

    useEffect(() => {
        fetchGetAppliedCreditWalletQuery();
    }, []);

    const [
        applyCreditWallet,
        {
            called: applyCreditWalletCalled,
            error: applyError,
            loading: applyingCreditWallet
        }
    ] = useMutation(applyCreditWalletMutation);

    const [
        removeCreditWallet,
        {
            called: removeCreditWalletCalled,
            error: removeCreditWalletError,
            loading: removingCreditWallet
        }
    ] = useMutation(removeCreditWalletMutation);

    const handleApplyCreditWallet = useCallback(
        async ({ creditWallet }) => {
            if (!creditWallet) return;
            try {
                setErrorMessage('');
                const result = await applyCreditWallet({
                    variables: {
                        creditWallet: creditWallet,
                        cartId
                    }
                });

                const { data } = result || {};
                const { applyWalletCreditToCart } = data || {};
                const { status, message } = applyWalletCreditToCart || {};

                if (status && status === 'FAILED') {
                    setErrorMessage(message);
                }

                await fetchGetAppliedCreditWalletQuery();
                setUpdateFinish && setUpdateFinish();
            } catch (e) {
                // TODO
            }
        },
        [applyCreditWallet, setUpdateFinish]
    );

    const handleRemoveCreditWallet = useCallback(async () => {
        try {
            await removeCreditWallet({});
            await fetchGetAppliedCreditWalletQuery();
            setUpdateFinish && setUpdateFinish();
        } catch (e) {
            // TODO
        }
    }, [removeCreditWallet, setUpdateFinish]);

    useEffect(() => {
        if (applyCreditWalletCalled || removeCreditWalletCalled) {
            setIsCartUpdating(applyingCreditWallet || removingCreditWallet);
        }
    }, [
        applyCreditWalletCalled,
        applyingCreditWallet,
        removeCreditWalletCalled,
        removingCreditWallet,
        setIsCartUpdating
    ]);

    const errors = useMemo(
        () =>
            new Map([
                ['getAppliedCreditWalletQuery', fetchError],
                ['applyCreditWalletMutation', applyError],
                ['removeCreditWalletMutation', removeCreditWalletError]
            ]),
        [applyError, fetchError, removeCreditWalletError]
    );

    return {
        applyingCreditWallet,
        data,
        errors,
        handleApplyCreditWallet,
        handleRemoveCreditWallet,
        removingCreditWallet,
        errorMessageCustom
    };
};
