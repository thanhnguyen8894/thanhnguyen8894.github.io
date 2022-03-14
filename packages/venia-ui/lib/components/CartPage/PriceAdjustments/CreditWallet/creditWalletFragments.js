import { gql } from '@apollo/client';

export const AppliedCreditWalletFragment = gql`
    fragment AppliedCreditWalletFragment on Cart {
        applied_wallet_credit
    }
`;
