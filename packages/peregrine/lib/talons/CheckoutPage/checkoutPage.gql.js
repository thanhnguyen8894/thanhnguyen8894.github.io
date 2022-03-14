import { gql } from '@apollo/client';
import { ProductListingFragment } from '@magento/venia-ui/lib/components/CartPage/ProductListing/productListingFragments';
import { PriceSummaryFragment } from '../CartPage/PriceSummary/priceSummaryFragments.gql';
import { GET_STORE_CONFIG_DATA } from '../RootComponents/Product/product.gql';
import { CheckoutPageFragment } from './checkoutPageFragments.gql';
import { OrderConfirmationPageFragment } from './OrderConfirmationPage/orderConfirmationPageFragments.gql';
import { ShippingInCartCheckoutPageFragment } from './shippingInCartCheckoutPageFragment.gql';

export const CustomerAddressBookAddressFragment = gql`
    fragment CustomerAddressBookAddressFragment on CustomerAddress {
        __typename
        id
        city
        country_code
        default_billing
        default_shipping
        firstname
        lastname
        middlename
        postcode
        region {
            region
            region_code
            region_id
        }
        street
        telephone
    }
`;

export const CREATE_CART = gql`
    mutation createCart {
        cartId: createEmptyCart
    }
`;

export const PLACE_ORDER = gql`
    mutation placeOrder($cartId: String!) {
        placeOrder(input: { cart_id: $cartId }) @connection(key: "placeOrder") {
            order {
                order_number
            }
        }
    }
`;

export const GET_ORDER_DETAILS = gql`
    query getOrderDetails($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...OrderConfirmationPageFragment
        }
    }
    ${OrderConfirmationPageFragment}
`;

export const GET_CHECKOUT_DETAILS = gql`
    query getCheckoutDetails($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...CheckoutPageFragment
        }
    }
    ${CheckoutPageFragment}
`;

export const GET_CUSTOMER = gql`
    query GetCustomerForCheckout {
        customer {
            id
            default_shipping
            email
            firstname
            lastname
            customer_mobile
            addresses {
                id
                ...CustomerAddressBookAddressFragment
            }
            wallet_credit
        }
    }
    ${CustomerAddressBookAddressFragment}
`;

export const GET_PRODUCT_LISTING = gql`
    query getProductListing($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...ProductListingFragment
        }
    }
    ${ProductListingFragment}
`;

const GET_PRICE_SUMMARY = gql`
    query getPriceSummary($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...PriceSummaryFragment
        }
    }
    ${PriceSummaryFragment}
`;

export const SET_SHIPPING_ADDRESS_ON_CART = gql`
    mutation setShippingAddressOnCart(
        $cartId: String!
        $shippingAddress: CartAddressInput!
    ) {
        setShippingAddressesOnCart(
            input: {
                cart_id: $cartId
                shipping_addresses: [{ address: $shippingAddress }]
            }
        ) @connection(key: "setShippingAddressesOnCart") {
            cart {
                id
                ...ShippingInCartCheckoutPageFragment
            }
        }
    }
    ${ShippingInCartCheckoutPageFragment}
`;

export const SET_OLD_SHIPPING_ADDRESS_ON_CART = gql`
    mutation setShippingAddressOnCart(
        $cartId: String!
        $customerAddressId: Int
    ) {
        setShippingAddressesOnCart(
            input: {
                cart_id: $cartId
                shipping_addresses: [
                    { customer_address_id: $customerAddressId }
                ]
            }
        ) @connection(key: "setOldShippingAddressesOnCart") {
            cart {
                id
                ...ShippingInCartCheckoutPageFragment
            }
        }
    }
    ${ShippingInCartCheckoutPageFragment}
`;

export const SET_BILLING_ADDRESS_ON_CART = gql`
    mutation setBillingAddressOnCart(
        $cartId: String!
        $billingAddress: BillingAddressInput!
    ) {
        setBillingAddressOnCart(
            input: { cart_id: $cartId, billing_address: $billingAddress }
        ) @connection(key: "setBillingAddressOnCart") {
            cart {
                id
                billing_address {
                    firstname
                    lastname
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
                available_payment_methods {
                    code
                    title
                }
            }
        }
    }
`;

export const SET_SHIPPING_METHOD_ON_CART = gql`
    mutation setShippingMethodOnCart(
        $cartId: String!
        $shippingMethods: ShippingMethodInput!
    ) {
        setShippingMethodsOnCart(
            input: { cart_id: $cartId, shipping_methods: [$shippingMethods] }
        ) @connection(key: "setShippingMethodsOnCart") {
            cart {
                id
                shipping_addresses {
                    selected_shipping_method {
                        carrier_code
                        carrier_title
                        method_code
                        method_title
                        amount {
                            value
                            currency
                        }
                    }
                }
            }
        }
    }
`;

export const SET_PAYMENT_METHOD_ON_CART = gql`
    mutation setPaymentMethodOnCart(
        $cartId: String!
        $paymentMethods: PaymentMethodInput!
    ) {
        setPaymentMethodOnCart(
            input: { cart_id: $cartId, payment_method: $paymentMethods }
        ) @connection(key: "setPaymentMethodOnCart") {
            cart {
                id
                selected_payment_method {
                    code
                    title
                }
            }
        }
    }
`;

export const RESET_SHIPPING_PAYMENT_METHOD = gql`
    mutation resetShippingAndPaymentMethod($cartId: String!) {
        resetShippingAndPaymentFeeOnCart(cart_id: $cartId) {
            status
            message
        }
    }
`;

export const ADD_NOTE_TO_CART_MUTATION = gql`
    mutation addCustomerNoteToCart($input: AddCustomerNoteToCartInput!) {
        addCustomerNoteToCart(input: $input) {
            cart {
                id
                customer_note
            }
        }
    }
`;

export const ADD_NEW_CUSTOMER_ADDRESS = gql`
    mutation AddNewCustomerAddressToAddressBook(
        $address: CustomerAddressInput!
    ) {
        createCustomerAddress(input: $address)
            @connection(key: "createCustomerAddress") {
            # We don't manually write to the cache to update the collection
            # after adding a new address so there's no need to query for a bunch
            # of address fields here. We use refetchQueries to refresh the list.
            id
        }
    }
`;

export const GET_APPLIED_CREDIT_WALLET = gql`
    query getAppliedCreditWallet($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            applied_wallet_credit
        }
    }
`;

export const GET_DONATION_LIST = gql`
    query getDonationList($storeId: String!){
        getDonationList(store_id: $storeId) {
            items{
                label
                value
            }
        }
    }
`;

export const ADD_DONATION_TO_CART_MUTATION = gql`
    mutation addDonationToCart($input: DonationInput!) {
        addDonationToCart(input: $input) {
            cart {
                id
                customer_note
            }
        }
    }
`;

export default {
    createCartMutation: CREATE_CART,
    getCheckoutDetailsQuery: GET_CHECKOUT_DETAILS,
    getCustomerQuery: GET_CUSTOMER,
    getOrderDetailsQuery: GET_ORDER_DETAILS,
    placeOrderMutation: PLACE_ORDER,
    getProductListing: GET_PRODUCT_LISTING,
    getPriceSummary: GET_PRICE_SUMMARY,
    setShippingAddressOnCart: SET_SHIPPING_ADDRESS_ON_CART,
    setOldShippingAddressOnCart: SET_OLD_SHIPPING_ADDRESS_ON_CART,
    setBillingAddressOnCart: SET_BILLING_ADDRESS_ON_CART,
    setShippingMethodOnCart: SET_SHIPPING_METHOD_ON_CART,
    setPaymentMethodOnCart: SET_PAYMENT_METHOD_ON_CART,
    resetShippingPaymentMethod: RESET_SHIPPING_PAYMENT_METHOD,
    addNoteToCartMutation: ADD_NOTE_TO_CART_MUTATION,
    createCustomerAddressMutation: ADD_NEW_CUSTOMER_ADDRESS,
    getAppliedCreditWalletQuery: GET_APPLIED_CREDIT_WALLET,
    getDonationListQuery: GET_DONATION_LIST,
    addDonationToCartMutation: ADD_DONATION_TO_CART_MUTATION,
};
