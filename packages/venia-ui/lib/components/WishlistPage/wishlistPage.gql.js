import { gql } from '@apollo/client';
import { CartTriggerFragment } from '../Header/cartTriggerFragments.gql';
import { MiniCartFragment } from '../MiniCart/miniCart.gql';

/*
    This feature is being built ahead of GraphQL coverage that is landing in 2.4.2 of Magento. We're going to mock
    the data based on the approved schema to make removing the mocking layer as seamless as possible.

    @see https://github.com/magento/architecture/blob/master/design-documents/graph-ql/coverage/Wishlist.graphqls
 */
export const GET_CUSTOMER_WISHLIST = gql`
    query GetCustomerWishlist {
        customer {
            wishlist {
                id
                items_count
                sharing_code
                updated_at
                items {
                    id
                    qty
                    added_at
                    product {
                        id
                        sku
                        name
                        price {
                            minimalPrice {
                                amount {
                                    currency
                                    value
                                }
                            }
                            maximalPrice {
                                amount {
                                    currency
                                    value
                                }
                            }
                            regularPrice {
                                amount {
                                    currency
                                    value
                                }
                            }
                        }
                        price_range {
                            maximum_price {
                                final_price {
                                    currency
                                    value
                                }
                            }
                            minimum_price {
                                regular_price {
                                    value
                                    currency
                                    __typename
                                }
                                final_price {
                                    value
                                    currency
                                    __typename
                                }

                                __typename
                            }
                            __typename
                        }
                        special_price
                        special_from_date
                        special_to_date
                        image {
                            label
                            url
                        }
                        url_key
                        url_suffix
                        rating_summary
                        ... on BundleProduct {
                            sku
                            dynamic_sku
                        }
                        ... on ConfigurableProduct {
                            sku
                            configurable_options {
                                id
                                attribute_id_v2
                                attribute_code
                                label
                                __typename
                                use_default
                                values {
                                    store_label
                                    swatch_data {
                                        value
                                    }
                                    use_default_value
                                }
                            }
                            variants {
                                attributes {
                                    code
                                    value_index
                                }
                                product {
                                    id
                                    media_gallery_entries {
                                        id
                                        disabled
                                        file
                                        label
                                        position
                                    }
                                    sku
                                    stock_status
                                    salable_qty
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
            }
        }
    }
`;

export const ADD_MULTI_SIMPLE_MUTATION = gql`
    mutation addSimpleProductToCart(
        $cartId: String!
        $cart_items: [SimpleProductCartItemInput]!
    ) {
        addSimpleProductsToCart(
            input: { cart_id: $cartId, cart_items: $cart_items }
        ) @connection(key: "addSimpleProductsToCartWishlist") {
            cart {
                id
                # Update the cart trigger when adding an item.
                ...CartTriggerFragment
                # Update the mini cart when adding an item.
                ...MiniCartFragment
            }
        }
    }
    ${CartTriggerFragment}
    ${MiniCartFragment}
`;

export default {
    queries: {
        getCustomerWishlistQuery: GET_CUSTOMER_WISHLIST
    },
    mutation: {
        addSimpleProductToCartMutation: ADD_MULTI_SIMPLE_MUTATION
    }
};
