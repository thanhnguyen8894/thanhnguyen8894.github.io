import { gql } from '@apollo/client';

export const CHECK_MOBILE_EXIST = gql`
    mutation checkMobileExist($mobile: String!) {
        checkMobileExist(mobile: $mobile) {
            status
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

export const UPDATE_USER_PHONE = gql`
    mutation updateCustomerWithOtp(
        $mobile: String!
        $otp: String!
        $email: String!
    ) {
        updateCustomerWithOtp(
            mobile: $mobile
            otp: $otp
            websiteId: 1
            input: { email: $email }
        ) {
            customer {
                id
                email
                firstname
                lastname
                customer_mobile
            }
        }
    }
`;

export const GET_CUSTOMER = gql`
    query GetCustomer {
        customer {
            id
            email
            firstname
            lastname
            customer_mobile
        }
    }
`;

export default {
    checkMobileExistMutation: CHECK_MOBILE_EXIST,
    sendOtpToCustomerMutation: SEND_OTP_CUSTOMER,
    updateUserPhoneMutation: UPDATE_USER_PHONE,
    getCustomerQuery: GET_CUSTOMER
};
