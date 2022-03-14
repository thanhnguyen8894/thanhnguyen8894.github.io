import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';
import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';
import mergeOperations from '../../util/shallowMerge';
import DEFAULT_OPERATIONS from './subscribePage.gql';

export const useSubscribePage = props => {
    const { afterSubmit } = props;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const {
        setSubscriptionMutation
    } = operations;

    const [
        setSubscription, { error: setSubscriptionError}
    ] = useMutation(setSubscriptionMutation);

    const handleSubmit = useCallback(
        async formValues => {
            const { email } = formValues;
            setIsSubmitting(true);
            GTMAnalytics.default().trackingSubscribe();
            try {
                const subscriptionResponse = await setSubscription({
                    variables: {
                        email
                    }
                });
                const { data: subscriptionData } = subscriptionResponse;
                const messageResponseData = subscriptionData.subscribeEmailToNewsletter;
                if (messageResponseData && messageResponseData.status) {
                    setIsSubmitting(false);
                }
            } catch (error) {
                setIsSubmitting(false);
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                // we have an onError link that logs errors, and FormError already renders this error, so just return
                // to avoid triggering the success callback
                return;
            }
            if (afterSubmit) {
                afterSubmit();
            }
        },
        [setSubscription, afterSubmit]
    );

    return {
        formErrors: [setSubscriptionError],
        handleSubmit,
        isSubmitting: isSubmitting,
    };
};
