import { gql } from '@apollo/client';
import { GET_CUSTOMER_WISHLIST_QUERY } from '../RootComponents/Category/categoryContent.gql';

export const GET_PRODUCT_FILTERS_BY_SEARCH = gql`
    query getProductFiltersBySearch($search: String!) {
        products(search: $search) {
            aggregations {
                label
                count
                attribute_code
                options {
                    label
                    value
                }
            }
        }
    }
`;

export const PRODUCT_SEARCH = gql`
    query ProductSearch(
        $currentPage: Int!
        $inputText: String!
        $pageSize: Int!
        $filters: ProductAttributeFilterInput!
        $sort: ProductAttributeSortInput
    ) {
        products(
            currentPage: $currentPage
            pageSize: $pageSize
            search: $inputText
            filter: $filters
            sort: $sort
        ) {
            items {
                id
                sku
                name
                special_price
                special_to_date
                special_from_date
                salable_qty
                small_image {
                    url
                }
                image {
                    label
                    url
                }
                url_key
                url_suffix
                rating_summary
                stock_status
                price {
                    regularPrice {
                        amount {
                            value
                            currency
                        }
                    }
                }
                price_range {
                    minimum_price {
                        regular_price {
                            currency
                            value
                        }
                        final_price {
                            currency
                            value
                        }
                    }
                    maximum_price {
                        final_price {
                            currency
                            value
                        }
                    }
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
            }
            sort_fields {
                default
                options {
                    value
                    label
                }
            }
            page_info {
                total_pages
            }
            total_count
        }
    }
`;

export const GET_FILTER_INPUTS = gql`
    query GetFilterInputsForSearch {
        __type(name: "ProductAttributeFilterInput") {
            inputFields {
                name
                type {
                    name
                }
            }
        }
    }
`;

export default {
    getFilterInputsQuery: GET_FILTER_INPUTS,
    getProductFiltersBySearchQuery: GET_PRODUCT_FILTERS_BY_SEARCH,
    productSearchQuery: PRODUCT_SEARCH,
    getWishListCustomer: GET_CUSTOMER_WISHLIST_QUERY
};
