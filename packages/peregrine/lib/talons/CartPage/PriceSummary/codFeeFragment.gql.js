import { gql } from '@apollo/client';

export const CashOnDeliveryFeeFragment = gql`
    fragment CashOnDeliveryFeeFragment on CartPrices {
        cash_on_delivery_fee {
            code
            label
            amount {
                currency
                value
            }
        }
    }
`;
