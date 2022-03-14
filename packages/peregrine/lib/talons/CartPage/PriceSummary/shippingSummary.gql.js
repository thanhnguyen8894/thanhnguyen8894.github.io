import { gql } from '@apollo/client';

export const ShippingSummaryFragment = gql`
    fragment ShippingSummaryFragment on Cart {
        id
        shipping_addresses {
            available_shipping_methods {
                amount {
                    currency
                    value
                }
                available
                carrier_code
                carrier_title
                error_message
                method_code
                method_title
                price_excl_tax {
                    value
                    currency
                }
                price_incl_tax {
                    value
                    currency
                }
            }
            selected_shipping_method {
                amount {
                    currency
                    value
                }
                method_code
            }
            street
        }
    }
`;
