import { gql } from '@apollo/client';

export const GET_CATEGORY = gql`
    query GetCategories(
        $id: Int!
        $pageSize: Int!
        $currentPage: Int!
        $filters: ProductAttributeFilterInput!
        $sort: ProductAttributeSortInput
    ) {
        category(id: $id) {
            id
            description
            name
            image
            product_count
            meta_title
            meta_keywords
            meta_description
        }
        products(
            pageSize: $pageSize
            currentPage: $currentPage
            filter: $filters
            sort: $sort
        ) {
            items {
                # id is always required, even if the fragment includes it.
                id
                # TODO: Once this issue is resolved we can use a
                # GalleryItemFragment here:
                # https://github.com/magento/magento2/issues/28584
                sku
                name
                stock_status
                price {
                    regularPrice {
                        amount {
                            currency
                            value
                        }
                    }
                }
                special_price
                special_from_date
                special_to_date
                small_image {
                    url
                }
                image {
                    label
                    url
                }
                rating_summary
                url_key
                url_suffix
            }
            page_info {
                total_pages
            }
            total_count
        }
    }
`;

export const GET_FILTER_INPUTS = gql`
    query GetFilterInputsForCategory {
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

export const GET_CATEGORY_DETAILS = gql`
    query GetCategories($id: Int!) {
        category(id: $id) {
            id
            description
            name
            image
            product_count
            meta_title
            meta_keywords
            meta_description
        }
    }
`;

export const GET_SUB_CATEGORY_QUERY = gql`
    query categoryList($id: String!) {
        categoryList(filters: { ids: { in: [$id] } }) {
            children {
                id
                level
                name
                path
                url_path
                url_key
            }
        }
    }
`;

export const PRODUCT_SEARCH = gql`
    query ProductSearch(
        $currentPage: Int!
        $pageSize: Int!
        $filters: ProductAttributeFilterInput!
        $sort: ProductAttributeSortInput
    ) {
        products(
            currentPage: $currentPage
            pageSize: $pageSize
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
                current_page
            }
            total_count
        }
    }
`;

export default {
    getCategoryQuery: GET_CATEGORY,
    getFilterInputsQuery: GET_FILTER_INPUTS,
    getCategoryDetailsQuery: GET_CATEGORY_DETAILS,
    productSearchQuery: PRODUCT_SEARCH,
    getSubCategoryQuery: GET_SUB_CATEGORY_QUERY
};
