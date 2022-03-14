import { gql } from '@apollo/client';

export const GET_PRODUCT_LIST = gql`
    query getProductList(
        $productListId: Int!
        $pageSize: Int!
        $currentPage: Int!
    ) {
        getProductList(
            input: {
                product_list_id: $productListId
                pageSize: $pageSize
                currentPage: $currentPage
            }
        ) {
            productlist_id
            products {
                total_count
                page_size
                items {
                    id
                    sku
                    name
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
                    special_price
                    special_from_date
                    special_to_date
                    small_image {
                        url
                    }
                    image {
                        url
                        label
                    }
                    url_key
                    url_suffix
                }
            }
        }
    }
`;

export default {
    getProductListQuery: GET_PRODUCT_LIST
};
