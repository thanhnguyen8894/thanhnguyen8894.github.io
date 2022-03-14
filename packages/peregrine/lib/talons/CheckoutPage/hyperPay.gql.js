import { gql } from '@apollo/client';
import { CartPageFragment } from '@magento/venia-ui/lib/components/CartPage/cartPageFragments.gql';

export const HYPERPAY_CHECKOUT = gql`
    mutation hyperPayCheckout($orderId: String!) {
        hyperPayCheckout(input: { order_id: $orderId }) {
            status
            code
            description
            build_number
            timestamp
            ndc
        }
    }
`;

export const HYPERPAY_PAYMENT_STATUS = gql`
    mutation hyperPayPaymentStatus(
        $orderId: String!
        $checkoutId: String!
    ) {
        hyperPayPaymentStatus(
            input: {
                order_id: $orderId
                checkout_id: $checkoutId
            }
        ) {
            status
            message
        }
    }
`;

export const CANCEL_ORDER = gql`
    mutation cancelOrder(
        $order_number: String!
        $message: String!
    ) {
        cancelOrder(
            input: {
                order_number: $order_number
                message: $message
            }
        ) {
            status
            message
        }
    }
`;

export const REORDER_ITEMS = gql`
    mutation reOrderItems($orderNumber: String!) {
        reorderItems(orderNumber: $orderNumber){
            cart {
                id
                items {
                uid
                product {
                    sku
                }
                quantity
                prices {
                    price {
                    value
                    }
                }
                }
            }
            userInputErrors{
                code
                message
                path
            }
        }
    }
`;

export const GET_CART_DETAILS = gql`
    query getCartDetails($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...CartPageFragment
        }
    }
    ${CartPageFragment}
`;

export default {
    getCheckoutIdHyperPay: HYPERPAY_CHECKOUT,
    getPaymentStatusHyperPay: HYPERPAY_PAYMENT_STATUS,
    cancelOrder: CANCEL_ORDER,
    reOrderItems: REORDER_ITEMS,
    getCartDetailsQuery: GET_CART_DETAILS
};
