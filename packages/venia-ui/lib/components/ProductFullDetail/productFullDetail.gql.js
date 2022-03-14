import { gql } from '@apollo/client';

import { CartTriggerFragment } from '../Header/cartTriggerFragments.gql';
import { MiniCartFragment } from '../MiniCart/miniCart.gql';

export const ADD_CONFIGURABLE_MUTATION = gql`
    mutation addConfigurableProductToCart(
        $cartId: String!
        $quantity: Float!
        $sku: String!
        $parentSku: String!
    ) {
        addConfigurableProductsToCart(
            input: {
                cart_id: $cartId
                cart_items: [
                    {
                        data: { quantity: $quantity, sku: $sku }
                        parent_sku: $parentSku
                    }
                ]
            }
        ) @connection(key: "addConfigurableProductsToCart") {
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

export const ADD_SIMPLE_MUTATION = gql`
    mutation addSimpleProductToCart(
        $cartId: String!
        $quantity: Float!
        $sku: String!
    ) {
        addSimpleProductsToCart(
            input: {
                cart_id: $cartId
                cart_items: [{ data: { quantity: $quantity, sku: $sku } }]
            }
        ) @connection(key: "addSimpleProductsToCart") {
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

export const GET_REVIEWS_QUERY = gql`
    query productReviews($id: Int!, $limit: Int!, $page: Int!) {
        productReviews(id: $id, limit: $limit, page: $page) {
            total_count
            avg_rating
            items {
                title
                detail
                nickname
                created_at
                rating_votes {
                    rating_code
                    rating_title
                    value
                }
            }
            page_info {
                page_size
                current_page
                has_next_page
                has_previous_page
                start_page
                end_page
            }
        }
    }
`;

export const ADD_WISHLIST_PRODUCT_MUTATUON = gql`
    mutation addProductsToWishlist(
        $wishlistId: ID!
        $wishlistItems: [WishlistItemInput!]!
        $currentPage: Int!
        $pageSize: Int!
    ) {
        addProductsToWishlist(
            wishlistId: $wishlistId
            wishlistItems: $wishlistItems
        ) {
            wishlist {
                id
                items_count
                items_v2(currentPage: $currentPage, pageSize: $pageSize) {
                    items {
                        id
                        quantity
                        product {
                            uid
                            name
                            sku
                            id
                            price_range {
                                minimum_price {
                                    regular_price {
                                        currency
                                        value
                                    }
                                }
                                maximum_price {
                                    regular_price {
                                        currency
                                        value
                                    }
                                }
                            }
                        }
                    }
                }
            }
            user_errors {
                code
                message
            }
        }
    }
`;

export const REMOVE_WISHLIST_ITEM_MUTATION = gql`
    mutation removeProductsFromWishlist(
        $wishlistId: ID!
        $wishlistItemsIds: [ID!]!
    ) {
        removeProductsFromWishlist(
            wishlistId: $wishlistId
            wishlistItemsIds: $wishlistItemsIds
        ) {
            wishlist {
                id
                items_count
                items_v2 {
                    items {
                        id
                        quantity
                        product {
                            uid
                            name
                            sku
                            id
                            price_range {
                                minimum_price {
                                    regular_price {
                                        currency
                                        value
                                    }
                                }
                                maximum_price {
                                    regular_price {
                                        currency
                                        value
                                    }
                                }
                            }
                        }
                    }
                }
            }
            user_errors {
                code
                message
            }
        }
    }
`;

export const GET_CUSTOMER_WISHLIST_QUERY = gql`
    query getCustomerWishlist {
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
                        sku
                        name
                        id
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
                        }
                    }
                }
            }
        }
    }
`;

export const GET_PRODUCT_REVIEW_RATING_METADATA_QUERY = gql`
    query productReviewRatingsMetadata {
        productReviewRatingsMetadata {
            items {
                id
                name
                values {
                    value_id
                    value
                }
            }
        }
    }
`;

export const CREATE_PRODUCT_REVIEW_MUTATION = gql`
    mutation createProductReview(
        $sku: String!
        $nickname: String!
        $summary: String!
        $text: String!
        $ratings: [ProductReviewRatingInput]!
    ) {
        createProductReview(
            input: {
                sku: $sku
                nickname: $nickname
                summary: $summary
                text: $text
                ratings: $ratings
            }
        ) {
            review {
                nickname
                summary
                text
                average_rating
                ratings_breakdown {
                    name
                    value
                }
            }
        }
    }
`;

export const GET_ATTRIBUTE_PRODUCT_QUERY = gql`
    query AttributeProduct($product_id: Int!) {
        AttributeProduct(product_id: $product_id) {
            items {
                lable
                value
                code
                hash_code
            }
            total_count
        }
    }
`;

export const GET_PRODUCTS_RELATED = gql`
    query amMostviewedGroups($id: Int!) {
        amMostviewedGroups(id: $id) {
            items {
                block_title
                position
                add_to_cart
                block_layout
                items {
                    id
                    name
                    sku
                    url_suffix
                    url_key
                    salable_qty
                    special_price
                    special_to_date
                    special_from_date
                    image {
                        label
                        url
                    }
                    label_am_list {
                        image
                        label_id
                        name
                        position
                        product_id
                        size
                        style
                        txt
                        customer_group_ids
                    }
                    price {
                        regularPrice {
                            amount {
                                value
                                currency
                            }
                        }
                        minimalPrice {
                            amount {
                                value
                                currency
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
                    ... on ConfigurableProduct {
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
`;

export default {
    addConfigurableProductToCartMutation: ADD_CONFIGURABLE_MUTATION,
    addSimpleProductToCartMutation: ADD_SIMPLE_MUTATION,
    getReviewsProduct: GET_REVIEWS_QUERY,
    addWishlistMutation: ADD_WISHLIST_PRODUCT_MUTATUON,
    removeWishlistItemMutation: REMOVE_WISHLIST_ITEM_MUTATION,
    getCustomerWishlistQuery: GET_CUSTOMER_WISHLIST_QUERY,
    productReviewRatingsMetadataQuery: GET_PRODUCT_REVIEW_RATING_METADATA_QUERY,
    createProductReviewMutation: CREATE_PRODUCT_REVIEW_MUTATION,
    getAttributeProductQuery: GET_ATTRIBUTE_PRODUCT_QUERY,
    getProductsRelated: GET_PRODUCTS_RELATED
};
