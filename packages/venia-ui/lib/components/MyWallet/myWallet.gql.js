import { gql } from '@apollo/client';

export const GET_CUSTOMER_INFORMATION = gql`
    query GetCustomerInformation {
        customer {
            id
            is_subscribed
            wallet_email_status
            wallet_credit
        }
    }
`;

export const GET_WALLET_REWARDS_TRANS_HISTORY = gql`
    query GetWalletRewardTransactionalHistory {
        GetWalletRewardTransactionalHistory {
            transaction_id
            order_id
            customer_id
            trans_title
            reward_point
            credit_get
            credit_spent
            trans_date
            page_info {
                current_page
                page_size
            }
        }
    }
`;

export const GET_WALLET_REWARD_WITHDRAW_CREDIT_HISTORY = gql`
    query GetWalletRewardWithdrawCreditHistory {
        GetWalletRewardWithdrawCreditHistory {
            withdraw_id
            customer_id
            credit
            paypal_email
            reason
            status
            requested_date
            updated_date
        }
    }
`;

export const SEND_WALLET_REWARD_CREDIT_TO_FRIEND = gql`
    mutation sendWalletRewardCreditToFriend(
        $credit: Float!
        $firstname: String!
        $lastname: String!
        $email: String!
        $message: String!
    ) {
        sendWalletRewardCreditToFriend(
            credit: $credit
            firstname: $firstname
            lastname: $lastname
            email: $email
            message: $message
        ) @connection(key: "sendWalletRewardCreditToFriend") {
            status
            message
        }
    }
`;

export const SEND_WALLET_REWARD_INVITE_FRIEND = gql`
    mutation setWalletRewardInviteFriend(
        $firstname: String!
        $lastname: String!
        $email: String!
        $message: String!
    ) {
        setWalletRewardInviteFriend(
            firstname: $firstname
            lastname: $lastname
            email: $email
            message: $message
        ) @connection(key: "setWalletRewardInviteFriend") {
            status
            message
        }
    }
`;

export const WALLET_REWARD_WITHDRAW_CREDIT = gql`
    mutation walletRewardWithdrawCredit(
        $credit: Float!
        $email: String!
        $reason: String!
    ) {
        walletRewardWithdrawCredit(
            credit: $credit
            email: $email
            reason: $reason
        ) @connection(key: "walletRewardWithdrawCredit") {
            status
            message
        }
    }
`;

export const WALLET_REWARD_BUY_CREDIT = gql`
    mutation walletRewardBuyCredit($credit: Int!, $cart_id: String!) {
        walletRewardBuyCredit(credit: $credit, cart_id: $cart_id)
            @connection(key: "walletRewardBuyCredit") {
            status
            message
        }
    }
`;

export const UPDATE_WALLET_REWARD_EMAIL_SUBS = gql`
    mutation setWalletRewardEmailSubscription($subscription: Boolean!) {
        setWalletRewardEmailSubscription(subscription: $subscription)
            @connection(key: "setWalletRewardEmailSubscription") {
            status
        }
    }
`;

export const GET_WALLET_REWARD_EMAIL_SUBS = gql`
    query GetWalletRewardEmailSubscription {
        GetWalletRewardEmailSubscription {
            subscriber_id
            subscriber_email
            subscriber_status
            customer_id
            subscribe_date
        }
    }
`;

export default {
    mutations: {
        sendWalletRewardCreditToFriend: SEND_WALLET_REWARD_CREDIT_TO_FRIEND,
        setWalletRewardInviteFriend: SEND_WALLET_REWARD_INVITE_FRIEND,
        walletRewardWithdrawCredit: WALLET_REWARD_WITHDRAW_CREDIT,
        walletRewardBuyCredit: WALLET_REWARD_BUY_CREDIT,
        updateWalletRewardEmailSubs: UPDATE_WALLET_REWARD_EMAIL_SUBS
    },
    queries: {
        getCustomerInformationQuery: GET_CUSTOMER_INFORMATION,
        getWalletRewardTransHistoryQuery: GET_WALLET_REWARDS_TRANS_HISTORY,
        getWalletRewardWithdrawCreditHistoryQuery: GET_WALLET_REWARD_WITHDRAW_CREDIT_HISTORY,
        getWalletRewardEmailSubs: GET_WALLET_REWARD_EMAIL_SUBS
    }
};
