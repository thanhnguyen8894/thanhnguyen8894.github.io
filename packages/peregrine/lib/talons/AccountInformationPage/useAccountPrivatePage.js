import { useCallback, useMemo } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import { clearCustomerDataFromCache } from '@magento/peregrine/lib/Apollo/clearCustomerDataFromCache';
import { clearCartDataFromCache } from '@magento/peregrine/lib/Apollo/clearCartDataFromCache';

export const useAccountPrivatePage = props => {
    const {
        mutations: { signOutMutation }
    } = props;
    const history = useHistory();
    const apolloClient = useApolloClient();
    const [, { signOut }] = useUserContext();

    const [revokeToken, { error: signOutError }] = useMutation(signOutMutation);

    const handleSignOut = useCallback(async () => {
        try {
            await signOut({ revokeToken });
            await clearCustomerDataFromCache(apolloClient);
            await clearCartDataFromCache(apolloClient);
        } catch (error) {
            console.log(error);
        }
        history.go(0);
    }, [apolloClient, history, revokeToken, signOut]);

    // Handle errors
    const errorsMessage = useMemo(() => {
        deriveErrorMessage([signOutError]);
    }, [signOutError]);

    return {
        handleSignOut,
        errorsMessage
    };
};
