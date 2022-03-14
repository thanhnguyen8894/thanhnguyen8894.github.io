import { gql } from '@apollo/client';

export const ProductListingFragment = gql`
    fragment ProductListingFragment on Cart {
        id
        items {
            id
            prices {
                price {
                    value
                    currency
                }
                row_total_including_tax {
                    value
                    currency
                }
            }
            product {
                id
                name
                sku
                url_key
                url_suffix
                thumbnail {
                    url
                }
                small_image {
                    url
                }
                price {
                    regularPrice {
                        amount {
                            value
                            currency
                        }
                    }
                }
                special_price
                special_from_date
                special_to_date
                stock_status
                salable_qty
                ... on ConfigurableProduct {
                    variants {
                        attributes {
                            uid
                        }
                        product {
                            id
                            small_image {
                                url
                            }
                        }
                    }
                }
            }
            quantity
            qty_salable
            ... on ConfigurableCartItem {
                configurable_options {
                    id
                    option_label
                    value_id
                    value_label
                }
            }
        }
    }
`;
