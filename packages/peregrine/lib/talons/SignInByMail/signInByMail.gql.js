import { gql } from '@apollo/client';
import { GET_CART_DETAILS_QUERY } from '@magento/venia-ui/lib/components/SignInByMail/signInByMail.gql';

export const SIGN_IN = gql`
    mutation SignIn($email: String!, $password: String!) {
        generateCustomerToken(email: $email, password: $password) {
            token
        }
    }
`;

export const GET_CUSTOMER = gql`
    query GetCustomerAfterSignIn {
        customer {
            id
            email
            firstname
            lastname
            customer_mobile
        }
    }
`;

export const CREATE_CART = gql`
    mutation CreateCartAfterSignIn {
        cartId: createEmptyCart
    }
`;

export const MERGE_CARTS = gql`
    mutation MergeCartsAfterSignIn(
        $sourceCartId: String!
        $destinationCartId: String!
    ) {
        mergeCarts(
            source_cart_id: $sourceCartId
            destination_cart_id: $destinationCartId
        ) @connection(key: "mergeCarts") {
            id
            items {
                id
            }
        }
    }
`;

export default {
    signInMutation: SIGN_IN,
    getCustomerQuery: GET_CUSTOMER,
    createCartMutation: CREATE_CART,
    mergeCartsMutation: MERGE_CARTS,
    getCartDetailsQuery: GET_CART_DETAILS_QUERY
};
