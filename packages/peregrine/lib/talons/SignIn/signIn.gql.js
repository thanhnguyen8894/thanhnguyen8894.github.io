import { gql } from '@apollo/client';

export const GET_CUSTOMER = gql`
    query GetCustomerAfterSignIn {
        customer {
            id
            email
            firstname
            lastname
            customer_mobile
            is_subscribed
        }
    }
`;

export const SIGN_IN = gql`
    mutation SignIn($email: String!, $password: String!) {
        generateCustomerToken(email: $email, password: $password) {
            token
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

export const SEND_OTP_CUSTOMER = gql`
    mutation sendOtpToCustomer(
        $mobile: String!
        $resend: Int!
        $storeId: Int!
        $eventType: String!
        $ipAddress: String!
        $email: String
    ) {
        sendOtpToCustomer(
            mobile: $mobile
            resend: $resend
            storeId: $storeId
            eventType: $eventType
            ipAddress: $ipAddress
            email: $email
        ) {
            message
            status
        }
    }
`;

export const CREATE_CUSTOMER_TOKEN_WITH_OTP = gql`
    mutation createCustomerTokenWithOtp(
        $mobile: String!
        $otp: String!
        $websiteId: Int!
    ) {
        createCustomerTokenWithOtp(
            mobile: $mobile
            otp: $otp
            websiteId: $websiteId
        ) {
            message
            token
        }
    }
`;

export const LOGIN_WITH_SOCIAL = gql`
    mutation loginWithSocial(
        $firstName: String!
        $lastName: String!
        $email: String
        $providerId: String!
        $socialUserId: String!
    ) {
        loginWithSocial(
            input: {
                firstname: $firstName
                lastname: $lastName
                email: $email
                provider_id: $providerId
                social_user_id: $socialUserId
            }
        ) {
            success
            token
        }
    }
`;

export default {
    createCartMutation: CREATE_CART,
    getCustomerQuery: GET_CUSTOMER,
    mergeCartsMutation: MERGE_CARTS,
    signInMutation: SIGN_IN,
    sendOtpToCustomer: SEND_OTP_CUSTOMER,
    createCustomerTokenWithOtp: CREATE_CUSTOMER_TOKEN_WITH_OTP,
    createCustomerWithSocial: LOGIN_WITH_SOCIAL
};
