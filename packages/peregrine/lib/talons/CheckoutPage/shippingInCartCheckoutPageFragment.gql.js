import gql from 'graphql-tag';

export const ShippingInCartCheckoutPageFragment = gql`
    fragment ShippingInCartCheckoutPageFragment on Cart {
        shipping_addresses {
            firstname
            lastname
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
            company
            street
            city
            region {
                code
                label
            }
            postcode
            telephone
            country {
                code
                label
            }
        }
    }
`;
