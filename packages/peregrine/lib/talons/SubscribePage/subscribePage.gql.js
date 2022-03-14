import { gql } from '@apollo/client';

export const SET_SUBSCRIPTION = gql`
    mutation subscribeEmailToNewsletter(
        $email: String!
    ) {
        subscribeEmailToNewsletter(
            email : $email
        ) {
            status
        }
    }
`;

export default {
    setSubscriptionMutation: SET_SUBSCRIPTION
};
