import { gql } from '@apollo/client';

export const GET_PRODUCT_FILTERS_BY_CATEGORY = gql`
    query getProductFiltersByCategory(
        $categoryIdFilter: FilterEqualTypeInput!
    ) {
        products(filter: { category_id: $categoryIdFilter }) {
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
                        #attribute_show_on_front{
                        #    total_count
                        #    items{
                        #      value
                        #      code
                        #      lable
                        #    }
                        #  }
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
    getProductFiltersByCategoryQuery: GET_PRODUCT_FILTERS_BY_CATEGORY,
    getWishListCustomer: GET_CUSTOMER_WISHLIST_QUERY
};
