import { gql } from '@apollo/client';
import { AccountInformationPageFragment } from './accountInformationPageFragment.gql';

export const SET_CUSTOMER_INFORMATION = gql`
    mutation SetCustomerInformation($customerInput: CustomerInput!) {
        updateCustomer(input: $customerInput)
            @connection(key: "updateCustomer") {
            customer {
                id
                ...AccountInformationPageFragment
            }
        }
    }
    ${AccountInformationPageFragment}
`;

export const CHANGE_CUSTOMER_PASSWORD = gql`
    mutation ChangeCustomerPassword(
        $currentPassword: String!
        $newPassword: String!
    ) {
        changeCustomerPassword(
            currentPassword: $currentPassword
            newPassword: $newPassword
        ) @connection(key: "changeCustomerPassword") {
            id
            email
        }
    }
`;

export const GET_CUSTOMER_INFORMATION = gql`
    query GetCustomerInformation {
        customer {
            id
            ...AccountInformationPageFragment
        }
    }
    ${AccountInformationPageFragment}
`;

export const CREATE_CUSTOMER_ADDRESS_INFORMATION = gql`
    mutation CreateCustomerAddressInformation(
        $region: String
        $regionCode: String
        $countryCode: CountryCodeEnum
        $street: [String]
        $telephone: String
        $postcode: String
        $city: String
        $firstname: String
        $lastname: String
        $defaultShipping: Boolean
        $defaultBilling: Boolean
    ) {
        createCustomerAddress(
            input: {
                region: { region: $region, region_code: $regionCode }
                country_code: $countryCode
                street: $street
                telephone: $telephone
                postcode: $postcode
                city: $city
                firstname: $firstname
                lastname: $lastname
                default_shipping: $defaultShipping
                default_billing: $defaultBilling
            }
        ) @connection(key: "createCustomerAddress") {
            id
            firstname
            lastname
            region {
                region
                region_code
            }
            country_code
            street
            telephone
            postcode
            city
            default_shipping
            default_billing
        }
    }
`;

export const UPDATE_CUSTOMER_ADDRESS_INFORMATION = gql`
    mutation UpdateCustomerAddressInAddressBook(
        $id: Int!
        $region: String
        $regionCode: String
        $countryCode: CountryCodeEnum
        $street: [String]
        $telephone: String
        $postcode: String
        $city: String
        $firstname: String
        $lastname: String
    ) {
        updateCustomerAddress(
            id: $id
            input: {
                region: { region: $region, region_code: $regionCode }
                country_code: $countryCode
                street: $street
                telephone: $telephone
                postcode: $postcode
                city: $city
                firstname: $firstname
                lastname: $lastname
            }
        ) @connection(key: "updateCustomerAddress") {
            id
            firstname
            lastname
            region {
                region
                region_code
            }
            country_code
            street
            telephone
            postcode
            city
        }
    }
`;

export const SIGN_OUT = gql`
    mutation signOut {
        revokeCustomerToken {
            result
        }
    }
`;

export const DELETE_CUSTOMER_ADDRESS_INFORMATION = gql`
    mutation deleteCustomerAddressMutation($id: Int!) {
        deleteCustomerAddress(id: $id)
    }
`;

export const GET_STORE_CONFIG_DATA = gql`
    query getStoreConfigData {
        storeConfig {
            id
            walletreward_wallet_status
            walletreward_wallet_withdraw_allow_withdrawal #allow withdrawal
            walletreward_wallet_withdraw_sendtofriend_allow_send_credit #allow send credit
            walletreward_reward_earn_reward_newsletter_subscribers_enable #allow subscribe newsletter
            walletreward_reward_earn_reward_invited_friend_registration_enable #allow invited friend registration
            walletreward_wallet_credit_usages_buy_credite #allow buy credit
            walletreward_wallet_withdraw_min_withdraw #min withdraw
        }
    }
`;

export default {
    mutations: {
        setCustomerInformationMutation: SET_CUSTOMER_INFORMATION,
        changeCustomerPasswordMutation: CHANGE_CUSTOMER_PASSWORD,
        createCustomerAddressMutation: CREATE_CUSTOMER_ADDRESS_INFORMATION,
        updateCustomerAddressMutation: UPDATE_CUSTOMER_ADDRESS_INFORMATION,
        signOutMutation: SIGN_OUT,
        deleteCustomerAddressMutation: DELETE_CUSTOMER_ADDRESS_INFORMATION
    },
    queries: {
        getCustomerInformationQuery: GET_CUSTOMER_INFORMATION,
        getStoreConfigData: GET_STORE_CONFIG_DATA
    }
};
