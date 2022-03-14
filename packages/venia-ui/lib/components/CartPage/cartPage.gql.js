import { gql } from '@apollo/client';
import { CartPageFragment } from './cartPageFragments.gql';
import { AvailableShippingMethodsCartFragment } from './PriceAdjustments/ShippingMethods/shippingMethodsFragments.gql';

export const GET_CART_DETAILS = gql`
    query GetCartDetails($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...CartPageFragment
            available_promo_items {
                product_sku
                qty
                token_code
                discount_minimal_price
                items {
                    id
                    sku
                    name
                    small_image {
                        url
                    }
                    price {
                        regularPrice {
                            amount {
                                currency
                                value
                            }
                        }
                    }
                }
            }
        }
    }
    ${CartPageFragment}
`;

export const REMOVE_ITEM_MUTATION = gql`
    mutation removeItem($cartId: String!, $itemId: Int!) {
        removeItemFromCart(input: { cart_id: $cartId, cart_item_id: $itemId })
            @connection(key: "removeItemFromCart") {
            cart {
                id
                ...CartPageFragment
                ...AvailableShippingMethodsCartFragment
                available_promo_items {
                    product_sku
                    qty
                    token_code
                    discount_minimal_price
                    items {
                        id
                        sku
                        name
                        small_image {
                            url
                        }
                        price {
                            regularPrice {
                                amount {
                                    currency
                                    value
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    ${CartPageFragment}
    ${AvailableShippingMethodsCartFragment}
`;

export const UPDATE_QUANTITY_MUTATION = gql`
    mutation updateItemQuantity(
        $cartId: String!
        $itemId: Int!
        $quantity: Float!
    ) {
        updateCartItems(
            input: {
                cart_id: $cartId
                cart_items: [{ cart_item_id: $itemId, quantity: $quantity }]
            }
        ) @connection(key: "updateCartItems") {
            cart {
                id
                ...CartPageFragment
                ...AvailableShippingMethodsCartFragment
                available_promo_items {
                    product_sku
                    qty
                    token_code
                    discount_minimal_price
                    items {
                        id
                        sku
                        name
                        small_image {
                            url
                        }
                        price {
                            regularPrice {
                                amount {
                                    currency
                                    value
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    ${CartPageFragment}
    ${AvailableShippingMethodsCartFragment}
`;

export const GET_ESTIMATE_TOTAL_WITH_SHIPPING_METHOD = gql`
    query getEstimateTotalWithShippingMethod(
        $cartId: String!
        $countryId: String!
        $postcode: String!
        $region: String!
        $shippingCarrierCode: String!
        $shippingMethodCode: String!
    ) {
        getEstimateTotalWithShippingMethod(
            cart_id: $cartId
            countryId: $countryId
            postcode: $postcode
            region: $region
            shipping_carrier_code: $shippingCarrierCode
            shipping_method_code: $shippingMethodCode
        ) {
            base_currency_code
            base_discount_amount
            base_grand_total
            base_shipping_amount
            base_shipping_discount_amount
            base_shipping_incl_tax
            base_shipping_tax_amount
            base_subtotal
            base_subtotal_incl_tax
            base_subtotal_with_discount
            base_tax_amount
            discount_amount
            grand_total
            items {
                base_discount_amount
                base_price
                base_price_incl_tax
                base_row_total
                base_row_total_incl_tax
                base_tax_amount
                discount_amount
                discount_percent
                item_id
                name
                options
                price_incl_tax
                qty
                row_total
                row_total_incl_tax
                row_total_with_discount
                tax_amount
                tax_percent
            }
            items_qty
            quote_currency_code
            shipping_amount
            shipping_discount_amount
            shipping_incl_tax
            shipping_tax_amount
            subtotal
            subtotal_incl_tax
            subtotal_with_discount
            tax_amount
            total_segments {
                code
                title
                value
            }
        }
    }
`;

export const GET_ESTIMATE_SHIPPING_METHOD = gql`
    query getEstimateShippingMethod(
        $cartId: String!
        $countryId: String!
        $postcode: String!
        $region: String!
    ) {
        getEstimateShippingMethod(
            cart_id: $cartId
            countryId: $countryId
            postcode: $postcode
            region: $region
        ) {
            amount
            available
            base_amount
            carrier_code
            carrier_title
            error_message
            method_code
            method_title
            price_excl_tax
            price_incl_tax
        }
    }
`;

export const GET_FREE_GIFTS_BY_CART = gql`
    query freeGiftsByCart($cartId: String!) {
        freeGiftsByCart(cart_id: $cartId) {
            discount_amount
            gifts {
                item {
                    id
                    name
                    uid
                    small_image {
                        url
                    }
                    price {
                        regularPrice {
                            amount {
                                currency
                                value
                            }
                        }
                    }
                }
                #hidden
                auto_add
                qty
                is_deleted
                minimal_price
            }
            rule_id
            rule_type
        }
    }
`;

export const ADD_FREE_GIFTS_TO_CART = gql`
    mutation addFreeGift($cartId: String!, $uid: String!) {
        addFreeGift(input: { cart_id: $cartId, uid: $uid }) {
            message
            status
        }
    }
`;

export const CLEAR_CART = gql`
    mutation($cartId: String!) {
        clearCart(cart_id: $cartId)
    }
`;
