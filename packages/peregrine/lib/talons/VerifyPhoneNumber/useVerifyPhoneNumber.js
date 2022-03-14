import { useCallback, useState, useMemo } from 'react';
import { useMutation } from '@apollo/client';

import mergeOperations from '../../util/shallowMerge';
import DEFAULT_OPERATIONS from './verifyPhoneNumber.gql';

export const useVerifyPhoneNumber = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const {
        checkMobileExistMutation
    } = operations;
    const [hasPhone, setHasPhone] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [checkMobileExistRequest, { error: checkMobileExistError }] = useMutation(checkMobileExistMutation);

    const handleSubmit = useCallback(
        async ({ phone }) => {
            if (isSubmitting) {
                return;
            }
            // reset to check phone
            setHasPhone(null);
            setIsSubmitting(true);
            try {
                const checkMobileExistResponse = await checkMobileExistRequest({
                    variables: {
                        mobile: phone,
                    }
                });
                const { data: dataCheckMobileExist } = checkMobileExistResponse;
                const isMobileExist = dataCheckMobileExist && dataCheckMobileExist.checkMobileExist && dataCheckMobileExist.checkMobileExist.status;
                setHasPhone(!isMobileExist ? 'not-ready' : 'ready');
                setIsSubmitting(false);
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                setIsSubmitting(false);
            }
        },[
            isSubmitting,
            checkMobileExistRequest
        ]
    ); // eslint-disable-line react-hooks/exhaustive-deps

    const errors = useMemo(
        () =>
            new Map([
                ['checkMobileExistMutation', checkMobileExistError]
            ]),
        [checkMobileExistError]
    );

    return {
        errors,
        isSubmitting,
        handleSubmit,
        hasPhone,
        setHasPhone
    };
};
