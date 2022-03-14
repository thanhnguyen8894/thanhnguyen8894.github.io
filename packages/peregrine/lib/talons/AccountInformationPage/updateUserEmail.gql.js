import { gql } from '@apollo/client';

export const UPDATE_USER_EMAIL = gql`
    mutation updateEmail($email: String!) {
        updateEmail(email: $email) {
            customer {
                email
            }
        }
    }
`;

export const GET_CUSTOMER = gql`
    query GetCustomerAfterCheckout {
        customer {
            id
            email
            firstname
            lastname
            is_subscribed
        }
    }
`;

export default {
    updateUserEmailMutation: UPDATE_USER_EMAIL,
    getCustomerQuery: GET_CUSTOMER
};
