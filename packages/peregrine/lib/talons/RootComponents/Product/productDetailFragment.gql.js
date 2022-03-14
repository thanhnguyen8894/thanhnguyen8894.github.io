import { gql } from '@apollo/client';

export const ProductDetailsFragment = gql`
    fragment ProductDetailsFragment on ProductInterface {
        __typename
        categories {
            id
            breadcrumbs {
                category_id
            }
        }
        description {
            html
        }
        short_description {
            html
        }
        id
        media_gallery_entries {
            id
            label
            position
            disabled
            file
        }
        meta_description
        name
        price {
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
        sku
        small_image {
            url
        }
        url_key
        ... on ConfigurableProduct {
            configurable_options {
                attribute_code
                attribute_id
                id
                label
                values {
                    default_label
                    label
                    store_label
                    use_default_value
                    value_index
                    swatch_data {
                        ... on ImageSwatchData {
                            thumbnail
                        }
                        value
                    }
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
                    special_price
                    special_from_date
                    special_to_date
                    price {
                        regularPrice {
                            amount {
                                currency
                                value
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
                }
            }
        }
    }
`;
