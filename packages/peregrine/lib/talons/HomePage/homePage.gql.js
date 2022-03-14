import { gql } from '@apollo/client';

export const GET_LANDING_PAGE = gql`
    query getLandingPage($landingCategoryId: Int!) {
        getLandingPage(input: { landing_category_id: $landingCategoryId }) {
            landing_page_id
            landing_page {
                landing_type
                banner {
                    banner_id
                    banner_name
                    banner_url
                    banner_image
                    banner_image_mobile
                }
                product_list {
                    productlist_id
                    list_type
                    category_id
                    list_title
                    list_image
                    list_image_tablet
                    location
                    slider_rows
                    products {
                        total_count
                        items {
                            id
                            name
                            sku
                            url_key
                            url_suffix
                            url_rewrites {
                                url
                            }
                            stock_status
                            salable_qty
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
                            special_price
                            special_from_date
                            special_to_date
                            rating_summary
                            image {
                                disabled
                                label
                                position
                                url
                            }
                            small_image {
                                disabled
                                label
                                position
                                url
                            }
                            thumbnail {
                                disabled
                                label
                                position
                                url
                            }
                            special_to_date
                        }
                    }
                }
            }
        }
    }
`;

export const GET_CUSTOMATTRIBUTE_METADATA = gql`
    query customAttributeMetadata($attributes: [AttributeInput!]!) {
        customAttributeMetadata(attributes: $attributes) {
            items {
                attribute_code
                attribute_type
                entity_type
                input_type
                attribute_options {
                    value
                    label
                    swatch_data {
                        value
                        ... on ImageSwatchData {
                            thumbnail
                        }
                    }
                }
            }
        }
    }
`;

export const GET_CMS_BLOCK = gql`
    query getCMSBlock($key_footer: [String!]!) {
        cmsBlocks(identifiers: $key_footer) {
            items {
                identifier
                title
                content
            }
        }
    }
`;

export const ADD_WISHLIST_PRODUCT_MUTATION = gql`
    mutation addProductsToWishlist(
        $wishlistId: ID!
        $wishlistItems: [WishlistItemInput!]!
        $currentPage: Int
        $pageSize: Int
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
                        #attribute_show_on_front {
                        #    total_count
                        #    items {
                        #        value
                        #        code
                        #        lable
                        #    }
                        #}
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

export default {
    getLandingPageQuery: GET_LANDING_PAGE,
    getCustomAttributeMetadata: GET_CUSTOMATTRIBUTE_METADATA,
    getCMSBlock: GET_CMS_BLOCK,
    addWishlistMutation: ADD_WISHLIST_PRODUCT_MUTATION,
    removeWishlistItemMutation: REMOVE_WISHLIST_ITEM_MUTATION,
    getCustomerWishlistQuery: GET_CUSTOMER_WISHLIST_QUERY
};
