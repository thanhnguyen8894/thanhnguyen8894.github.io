import { gql } from '@apollo/client';

export const CheckoutPageFragment = gql`
    fragment CheckoutPageFragment on Cart {
        id
        items {
            id
            quantity
            product {
                id
                stock_status
                name
                sku
            }
            prices {
                total_item_discount {
                    value
                }
                price {
                    value
                }
                discounts {
                    label
                    amount {
                        value
                    }
                }
            }
        }
        total_quantity
        available_payment_methods {
            code
            title
            # instructions
        }
        selected_payment_method {
            code
            title
        }
        billing_address {
            city
            country {
                code
                label
            }
            firstname
            lastname
            postcode
            region {
                code
                label
            }
            street
            telephone
        }
        shipping_addresses {
            firstname
            lastname
            street
            city
            region {
                code
                label
            }
            country {
                code
                label
            }
            telephone
            postcode
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
                    value
                    currency
                }
                carrier_code
                carrier_title
                method_code
                method_title
            }
        }
        applied_coupons {
            code
        }
    }
`;
