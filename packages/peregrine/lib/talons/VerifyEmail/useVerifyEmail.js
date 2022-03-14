import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';

import mergeOperations from '../../util/shallowMerge';
import DEFAULT_OPERATIONS from './verifyEmail.gql';

export const useVerifyEmail = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const {
        checkEmailAvailableQuery
    } = operations;

    const [runQuery, queryResult] = useLazyQuery(checkEmailAvailableQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const {data: checkEmailData, error: checkEmailError, loading: checkEmailLoading} = queryResult;
    const isEmailAvailable =
        checkEmailData &&
        checkEmailData.isEmailAvailable &&
        checkEmailData.isEmailAvailable.is_email_available;

    const handleCheck = useCallback(
        ( email ) => {
            try {
                runQuery({
                    variables: { email }
                });
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                };
            }
        },[runQuery]
    ); // eslint-disable-line react-hooks/exhaustive-deps

    const errors = useMemo(
        () =>
            new Map([
                ['checkEmailAvailableQuery', checkEmailError]
            ]),
        [checkEmailError]
    );

    return {
        errors,
        handleCheck,
        isEmailAvailable,
        isChecking: checkEmailLoading,
    };
};
