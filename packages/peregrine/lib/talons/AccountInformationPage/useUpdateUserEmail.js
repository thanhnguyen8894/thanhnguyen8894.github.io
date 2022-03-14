import { useState, useMemo } from 'react';
import { useMutation } from '@apollo/client';
import { EMAIL_FORMAT } from '@magento/peregrine/lib/util/common';
import DEFAULT_OPERATIONS from './updateUserEmail.gql';
import { useAwaitQuery } from '@magento/peregrine/lib/hooks/useAwaitQuery';
import { useUserContext } from '@magento/peregrine/lib/context/user';

export const useUpdateUserEmail = props => {
    // * STATE
    const { updateUserEmailMutation, getCustomerQuery } = DEFAULT_OPERATIONS;

    const fetchUserDetails = useAwaitQuery(getCustomerQuery);

    const [{ isGettingDetails }, { getUserDetails }] = useUserContext();

    const { customer } = props || {};
    const { email: emailProps = '' } = customer || {};

    const [email, updateEmail] = useState(emailProps);
    const [isValidEmail, updateIsValidEmail] = useState(false);
    const [isLoading, updateIsLoading] = useState(false);
    const [errorMessage, updateErrorMessage] = useState('');

    // * GRAPHQL
    const [updateUserEmail, { error: updateUserEmailError }] = useMutation(
        updateUserEmailMutation
    );

    // * HANDLE STATE CHANGE
    function onChangeEmail(value) {
        updateEmail(value);
        updateIsValidEmail(value && value.match(EMAIL_FORMAT));
    }

    // * HANDLE ACTIONS
    async function onUpdateEmail() {
        try {
            updateIsLoading(true);

            const response = await updateUserEmail({
                variables: {
                    email: email
                }
            });
            const { data } = response;
            // TODO
            await getUserDetails({ fetchUserDetails });

            updateIsLoading(false);
        } catch (error) {
            updateIsLoading(false);
        }
    }

    const errors = useMemo(
        () => new Map([['updateUserEmailMutation', updateUserEmailError]]),
        [updateUserEmailError]
    );

    return {
        email,
        isValidEmail,
        isLoading,
        errorMessage,
        errors,
        onChangeEmail,
        onUpdateEmail
    };
};
