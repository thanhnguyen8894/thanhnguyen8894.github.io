import { gql } from '@apollo/client';

import { ProductDetailsFragment } from './productDetailFragment.gql';

export const GET_PRODUCT_DETAIL_QUERY = gql`
    query getProductDetailForProductPage($id: Int!, $attrList: [String]) {
        productDetail(id: $id) {
            id
            dynamicAttributes(fields: $attrList)
            special_price
            special_from_date
            special_to_date
            stock_status
            salable_qty
            label_am_detail {
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
            ...ProductDetailsFragment
        }
    }
    ${ProductDetailsFragment}
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
    getProductDetailQuery: GET_PRODUCT_DETAIL_QUERY,
    getProductsRelated: GET_PRODUCTS_RELATED
};
