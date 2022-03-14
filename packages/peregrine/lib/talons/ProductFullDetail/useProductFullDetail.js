import { useCallback, useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { appendOptionsToPayload } from '@magento/peregrine/lib/util/appendOptionsToPayload';
import { findMatchingVariant } from '@magento/peregrine/lib/util/findMatchingProductVariant';
import { isProductConfigurable } from '@magento/peregrine/lib/util/isProductConfigurable';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import DEFAULT_OPERATIONS from '@magento/peregrine/lib/talons/CheckoutPage/OrderConfirmationPage/createAccount.gql';
import { useIntl } from 'react-intl';
import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';

const INITIAL_OPTION_CODES = new Map();
const INITIAL_OPTION_SELECTIONS = new Map();
const INITAL_LIMIT = 3;

export const RATE = [
    {
        id: 'Mg==',
        value_id: ''
    }
];

export const OPTION_SELECT = [
    {
        key: 'quantity',
        value: 1
    },
    {
        key: 'color',
        value: ''
    }
];

const deriveOptionCodesFromProduct = product => {
    // If this is a simple product it has no option codes.
    if (!isProductConfigurable(product)) {
        return INITIAL_OPTION_CODES;
    }

    // Initialize optionCodes based on the options of the product.
    const initialOptionCodes = new Map();
    for (const {
        attribute_id,
        attribute_code
    } of product.configurable_options) {
        initialOptionCodes.set(attribute_id, attribute_code);
    }

    return initialOptionCodes;
};

// Similar to deriving the initial codes for each option.
const deriveOptionSelectionsFromProduct = product => {
    if (!isProductConfigurable(product)) {
        return INITIAL_OPTION_SELECTIONS;
    }

    const initialOptionSelections = new Map();
    for (const { attribute_id } of product.configurable_options) {
        initialOptionSelections.set(attribute_id, undefined);
    }

    return initialOptionSelections;
};

const getIsMissingOptions = (product, optionSelections) => {
    // Non-configurable products can't be missing options.
    if (!isProductConfigurable(product)) {
        return false;
    }

    // Configurable products are missing options if we have fewer
    // option selections than the product has options.
    const { configurable_options } = product;
    const numProductOptions = configurable_options.length;
    const numProductSelections = Array.from(optionSelections.values()).filter(
        value => !!value
    ).length;

    return numProductSelections < numProductOptions;
};

const getMediaGalleryEntries = (product, optionCodes, optionSelections) => {
    let value = [];

    const { media_gallery_entries, variants } = product;
    const isConfigurable = isProductConfigurable(product);

    // Selections are initialized to "code => undefined". Once we select a value, like color, the selections change. This filters out unselected options.
    const optionsSelected =
        Array.from(optionSelections.values()).filter(value => !!value).length >
        0;

    if (!isConfigurable || !optionsSelected) {
        value = media_gallery_entries;
    } else {
        // If any of the possible variants matches the selection add that
        // variant's image to the media gallery. NOTE: This _can_, and does,
        // include variants such as size. If Magento is configured to display
        // an image for a size attribute, it will render that image.
        const item = findMatchingVariant({
            optionCodes,
            optionSelections,
            variants
        });

        value = item
            ? [...item.product.media_gallery_entries, ...media_gallery_entries]
            : media_gallery_entries;
    }

    return value;
};

// We only want to display breadcrumbs for one category on a PDP even if a
// product has multiple related categories. This function filters and selects
// one category id for that purpose.
const getBreadcrumbCategoryId = categories => {
    // Exit if there are no categories for this product.
    if (!categories || !categories.length) {
        return;
    }
    const breadcrumbSet = new Set();
    categories.forEach(({ breadcrumbs }) => {
        // breadcrumbs can be `null`...
        (breadcrumbs || []).forEach(({ category_id }) =>
            breadcrumbSet.add(category_id)
        );
    });

    // Until we can get the single canonical breadcrumb path to a product we
    // will just return the first category id of the potential leaf categories.
    const leafCategory = categories.find(
        category => !breadcrumbSet.has(category.id) && category.breadcrumbs
    );

    // If we couldn't find a leaf category then just use the first category
    // in the list for this product.
    return leafCategory ? leafCategory.id : categories[0].id;
};

const getConfigPrice = (product, optionCodes, optionSelections) => {
    let value;

    const { variants } = product;
    const isConfigurable = isProductConfigurable(product);

    const optionsSelected =
        Array.from(optionSelections.values()).filter(value => !!value).length >
        0;

    if (!isConfigurable || !optionsSelected) {
        value = product.price.regularPrice.amount;
    } else {
        const item = findMatchingVariant({
            optionCodes,
            optionSelections,
            variants
        });

        value = item
            ? item.product.price.regularPrice.amount
            : product.price.regularPrice.amount;
    }

    return value;
};

const getConfigItem = (product, optionCodes, optionSelections) => {
    let value;

    const { variants } = product;
    const isConfigurable = isProductConfigurable(product);

    const optionsSelected =
        Array.from(optionSelections.values()).filter(value => !!value).length >
        0;

    if (!isConfigurable || !optionsSelected) {
        value = product;
    } else {
        const item = findMatchingVariant({
            optionCodes,
            optionSelections,
            variants
        });

        value = item ? item.product : product;
    }

    return value;
};

const fetchWishlistItemId = (id, items) => {
    let wishlistItemId = 0;
    if (items.length !== 0) {
        items.forEach(item => {
            if (id === item.product.id) {
                wishlistItemId = item.id;
            }
        });
    }
    return wishlistItemId;
};

const getValueIdRating = (currentRating, dataRating) => {
    const array = new Map();
    Object.keys(currentRating).forEach(function(key) {
        dataRating.map(item => {
            if (item.id === currentRating[key].id) {
                item.values.forEach(i => {
                    if (
                        item.id === currentRating[key].id &&
                        i.value == currentRating[key].value_id
                    ) {
                        array.set(currentRating[key].id, i.value_id);
                    }
                });
            }
        });
    });
    return array;
};

const SUPPORTED_PRODUCT_TYPES = ['SimpleProduct', 'ConfigurableProduct'];

/**
 * @param {GraphQLQuery} props.addConfigurableProductToCartMutation - configurable product mutation
 * @param {GraphQLQuery} props.addSimpleProductToCartMutation - configurable product mutation
 * @param {Object} props.product - the product, see RootComponents/Product
 *
 * @returns {{
 *  breadcrumbCategoryId: string|undefined,
 *  errorMessage: string|undefined,
 *  errorsMessageToast: string|undefined,
 *  errorsMessageWishlist: string|undefined,
 *  isAddToCartDisabled: boolean,
 *  modalReview: boolean,
 *  isFavorite: boolean,
 *  isLoading: boolean,
 *  mediaGalleryEntries: array,
 *  productDetails: object,
 *  rate: object,
 *  handleSelectionChange: func,
 *  handleViewAllReview: func,
 *  handleSubmitReview: func,
 *  handleSelectReview: func,
 *  handleCloseReview: func,
 *  handleOpenReview: func,
 *  handleAddToCart: func,
 *  handleSelectTab: func,
 *  wishlistAction: func,
 *  onChangeRating: func,
 *  tabIndex: int,
 *  limit: int.
 * }}
 */
export const useProductFullDetail = props => {
    const {
        addConfigurableProductToCartMutation,
        addSimpleProductToCartMutation,
        getReviewsProduct,
        addWishlistMutation,
        removeWishlistItemMutation,
        getCustomerWishlistQuery,
        productReviewRatingsMetadataQuery,
        createProductReviewMutation,
        getAttributeProductQuery,
        product,
        afterSubmitReview,
        getProductsRelated
    } = props;

    useEffect(() => {
        GTMAnalytics.default().trackingProductImp(product);
        GTMAnalytics.default().trackingPageView(
            currentUser,
            rtl,
            'productPage'
        );
    }, []);

    const productType = product.__typename;

    const options = product.configurable_options;
    const variants = product.variants;

    const labelOption = values => {
        const labelSelection = values.map((value, index) => {
            return options[index]?.values?.find(
                ({ value_index }) => value_index === value?.value_index
            )?.label;
        });
        return labelSelection
            .reverse()
            .toString()
            .replace(',', ' - ');
    };

    const isSupportedProductType = SUPPORTED_PRODUCT_TYPES.includes(
        productType
    );

    const { createCartMutation } = DEFAULT_OPERATIONS;
    const [{ cartId }, { resetCart }] = useCartContext();
    const [fetchCartId] = useMutation(createCartMutation);

    const [{ rtl }] = useAppContext();
    const [{ isSignedIn, currentUser }] = useUserContext();
    const { formatMessage } = useIntl();

    const [rate, updateRate] = useState({ ...RATE });
    const [optionSelect, updateOptionSelect] = useState({ ...OPTION_SELECT });
    const [dataSelect, updateDataSelect] = useState();
    const [wishlistItemId, setWishlistItemId] = useState(0);
    const [tabIndex, setTabIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [modalReview, updateModalReview] = useState(false);
    const [modalAddToCart, updateModalAddToCart] = useState(false);
    const [limit, setLimit] = useState(INITAL_LIMIT);
    const [message, updateMessage] = useState('');

    const [email, setEmail] = useState('');

    const { data: productsRelatedData } = useQuery(getProductsRelated, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        variables: { id: product.id }
    });

    const { data: reviewRatingData, loading: reviewRatingLoading } = useQuery(
        productReviewRatingsMetadataQuery,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first'
        }
    );

    const [
        addConfigurableProductToCart,
        {
            error: errorAddingConfigurableProduct,
            loading: isAddConfigurableLoading
        }
    ] = useMutation(addConfigurableProductToCartMutation);

    const [
        addSimpleProductToCart,
        { error: errorAddingSimpleProduct, loading: isAddSimpleLoading }
    ] = useMutation(addSimpleProductToCartMutation);

    const { data: reviewsData, loading: isReviewsLoading } = useQuery(
        getReviewsProduct,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first',
            skip: false,
            variables: {
                id: product.id,
                limit: limit,
                page: 1
            }
        }
    );

    const {
        data: customerWishlistData,
        loading: customerWishlistLoading,
        error: customerWishlistError
    } = useQuery(getCustomerWishlistQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !isSignedIn
    });

    const {
        data: attributeProductData,
        loading: attributeProductLoading,
        error: attributeProductError
    } = useQuery(getAttributeProductQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        variables: {
            product_id: product.id
        }
    });

    const [
        createReview,
        { error: createReviewError, loading: createReviewLoading }
    ] = useMutation(createProductReviewMutation);

    const [
        addToWishlist,
        { loading: addToWishlistLoading, error: addToWishlistError }
    ] = useMutation(addWishlistMutation);

    const [
        removeWishlistItem,
        { loading: removeWishlistItemLoading, error: removeWishlistItemError }
    ] = useMutation(removeWishlistItemMutation);

    const { id: wishlistId } = customerWishlistData?.customer?.wishlist || {};

    const itemsWishlist = customerWishlistData?.customer?.wishlist?.items || [];

    useEffect(() => {
        if (
            !(
                customerWishlistData &&
                Object.keys(customerWishlistData).length === 0
            ) &&
            fetchWishlistItemId(product.id, itemsWishlist) !== 0 &&
            !customerWishlistLoading
        ) {
            setIsFavorite(true);
            setWishlistItemId(fetchWishlistItemId(product.id, itemsWishlist));
        }
    }, [customerWishlistData, customerWishlistLoading, itemsWishlist, product]);

    const productReviewRatingsMetadata =
        reviewRatingData?.productReviewRatingsMetadata || {};

    const { AttributeProduct } = attributeProductData || {};
    const { items } = AttributeProduct || {};

    const atrribute = {
        manufacturer:
            items?.filter(item => item.code === 'manufacturer')[0]?.value || '',
        color:
            items?.filter(item => item.code === 'color')[0]?.hash_code ||
            'transparent',
        material:
            items?.filter(item => item.code === 'material')[0]?.value || '',
        dimensions:
            items?.filter(item => item.code === 'dimensions')[0]?.value || '',
        mpn: items?.filter(item => item.code === 'mpn')[0]?.value || '',
        ean: items?.filter(item => item.code === 'ean')[0]?.value || ''
    };

    const breadcrumbCategoryId = useMemo(
        () => getBreadcrumbCategoryId(product.categories),
        [product.categories]
    );

    const derivedOptionSelections = useMemo(
        () => deriveOptionSelectionsFromProduct(product),
        [product]
    );

    const [optionSelections, setOptionSelections] = useState(
        derivedOptionSelections
    );

    const derivedOptionCodes = useMemo(
        () => deriveOptionCodesFromProduct(product),
        [product]
    );
    const [optionCodes] = useState(derivedOptionCodes);

    const isMissingOptions = useMemo(
        () => getIsMissingOptions(product, optionSelections),
        [product, optionSelections]
    );

    const mediaGalleryEntries = useMemo(
        () => getMediaGalleryEntries(product, optionCodes, optionSelections),
        [product, optionCodes, optionSelections]
    );

    const handleOpenReview = useCallback(() => {
        document.getElementsByClassName('dialog-mask-2Ax')[0].click();
        setTimeout(() => {
            updateModalReview(true);
        }, 100);
    }, []);

    const handleCloseReview = useCallback(() => {
        updateModalReview(false);
        updateModalAddToCart(false);
    }, []);

    const handleSelectReview = useCallback(() => {
        setTabIndex(2);
        const bottomTabs = document.getElementById('bottomTab');
        const reviewTabs = document.getElementById('review');
        if (bottomTabs) {
            bottomTabs.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (reviewTabs) {
            reviewTabs.click();
            bottomTabs.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    const errorMessage = useCallback(() => {
        updateMessage(
            formatMessage({
                id: 'productFullDetail.somethingWentWrong',
                defaultMessage: 'Somethings went wrong'
            })
        );
    }, [formatMessage]);

    const handleSelectTab = useCallback(index => {
        setTabIndex(index);
    }, []);

    const handleViewAllReview = useCallback(index => {
        setLimit(index);
    }, []);

    const handleUpdateOptionSelect = data => {
        updateDataSelect(data);
    };

    const onChangeRating = useCallback(
        (name, value) => {
            updateRate(prevState => {
                Object.keys(prevState).forEach(function(key) {
                    if (prevState[key].id === name) {
                        prevState[key].value_id = value;
                        prevState[key].value_id = getValueIdRating(
                            prevState,
                            productReviewRatingsMetadata.items
                        ).get(name);
                    }
                });
                return { ...prevState };
            });
        },
        [productReviewRatingsMetadata]
    );

    const handleSubmitReview = useCallback(
        async (formValues, ref) => {
            try {
                const { nickname, summary, text } = formValues;
                const response = await createReview({
                    variables: {
                        sku: product.sku,
                        nickname: nickname,
                        summary: text,
                        text: text,
                        ratings: rate
                    }
                });
                const { data } = response || {};
                const { createProductReview } = data || {};
                const { review } = createProductReview || {};
                if (review) {
                    handleCloseReview();
                    updateRate(prevState => {
                        Object.keys(prevState).forEach(function(key) {
                            prevState[key].value_id = '';
                        });
                        return { ...prevState };
                    });
                    if (afterSubmitReview) {
                        afterSubmitReview();
                    }
                }
            } catch (error) {
                handleCloseReview();
                return;
            }
        },
        [afterSubmitReview, createReview, handleCloseReview, product.sku, rate]
    );

    const handleAddToCart = useCallback(
        async formValues => {
            const { quantity } = formValues;
            const payload = {
                item: product,
                productType,
                quantity
            };

            if (isProductConfigurable(product)) {
                appendOptionsToPayload(payload, optionSelections, optionCodes);
            }

            if (isSupportedProductType) {
                const variables = {
                    cartId,
                    // parentSku: payload.parentSku,
                    product: payload.item,
                    quantity: payload.quantity,
                    sku: payload.item.sku
                };
                try {
                    await addSimpleProductToCart({
                        variables
                    });
                } catch (error) {
                    await resetCart({
                        fetchCartId,
                        error
                    });
                    return;
                }
                updateOptionSelect(prevState => {
                    prevState[0].value = quantity;
                    prevState[1].value = dataSelect?.swatch_data?.value || '';
                    return { ...prevState };
                });
                updateModalAddToCart(true);

                GTMAnalytics.default().trackingAddProduct({
                    ...product,
                    quantity
                });
            } else {
                console.error('Unsupported product type. Cannot add to cart.');
            }
        },
        [
            addConfigurableProductToCart,
            addSimpleProductToCart,
            cartId,
            dataSelect,
            isSupportedProductType,
            optionCodes,
            optionSelections,
            product,
            productType
        ]
    );

    const handleSelectionChange = useCallback(
        (optionId, selection) => {
            // We must create a new Map here so that React knows that the value
            // of optionSelections has changed.
            const nextOptionSelections = new Map([...optionSelections]);
            nextOptionSelections.set(optionId, selection);
            setOptionSelections(nextOptionSelections);
        },
        [optionSelections]
    );

    const findOptionsFromVariant = useCallback(
        attributes => {
            const optionsFromVariant = new Map([...optionSelections]);
            for (const { code, value_index } of attributes) {
                const optionId = options.find(
                    ({ attribute_code }) => attribute_code === code
                )?.attribute_id;
                optionsFromVariant.set(optionId, value_index);
            }
            setOptionSelections(optionsFromVariant);
        },
        [optionSelections, options]
    );

    const productPrice = useMemo(
        () => getConfigPrice(product, optionCodes, optionSelections),
        [product, optionCodes, optionSelections]
    );

    const productSelected = useMemo(
        () => getConfigItem(product, optionCodes, optionSelections),
        [product, optionCodes, optionSelections]
    );

    const specialPrice = useMemo(() => {
        const { final_price, regular_price } =
            productSelected?.price_range?.minimum_price || {};
        if (final_price?.value === regular_price?.value) return null;
        return final_price?.value || 0;
    }, [productSelected]);

    // Normalization object for product details we need for rendering.
    const productDetails = {
        description: product.description,
        name: product.name,
        price: productPrice,
        sku: productSelected.sku,
        special_price: specialPrice,
        short_description: product.short_description,
        thumbnailImage: product.small_image || '',
        quantity_addCart: optionSelect[0].value,
        color_select: optionSelect[1].value || '',
        salable_qty: productSelected.salable_qty,
        product_type: productType,
        dynamicAttributes: JSON.parse(product.dynamicAttributes),
        price_range: productSelected.price_range || {},
        ...atrribute
    };

    const handleAddProductToWishlist = useCallback(async () => {
        try {
            const payload = {
                item: product
            };

            if (isProductConfigurable(product)) {
                appendOptionsToPayload(payload, optionSelections, optionCodes);
            }
            if (!isSignedIn) {
                updateMessage(
                    formatMessage({
                        id: 'productFullDetail.loginFirst',
                        defaultMessage: 'Please login first'
                    })
                );
            } else {
                const response = await addToWishlist({
                    variables: {
                        wishlistId: wishlistId,
                        wishlistItems: [
                            {
                                sku: payload.item.sku,
                                quantity: 1,
                                parent_sku: payload.parentSku
                            }
                        ],
                        currentPage: 1,
                        pageSize: 10
                    }
                });
                const items_v2 =
                    response?.data?.addProductsToWishlist?.wishlist?.items_v2 ||
                    {};
                const user_errors =
                    response?.data?.addProductsToWishlist?.user_errors || [];
                if (user_errors.length === 0) {
                    updateMessage('');
                    setIsFavorite(true);
                    setWishlistItemId(
                        fetchWishlistItemId(product.id, items_v2.items)
                    );
                }
            }
        } catch (err) {
            errorMessage();
        }
    }, [
        addToWishlist,
        errorMessage,
        formatMessage,
        isSignedIn,
        optionCodes,
        optionSelections,
        product,
        wishlistId
    ]);

    const handleRemoveProductFormWishlist = useCallback(async () => {
        try {
            const response = await removeWishlistItem({
                variables: {
                    wishlistId: wishlistId,
                    wishlistItemsIds: [wishlistItemId]
                }
            });
            const user_errors =
                response?.data?.removeProductsFromWishlist?.user_errors || [];
            if (user_errors.length === 0) {
                setIsFavorite(false);
                setWishlistItemId(0);
            } else {
                errorMessage();
            }
        } catch (error) {
            errorMessage();
            return;
        }
    }, [errorMessage, removeWishlistItem, wishlistId, wishlistItemId]);

    const wishlistAction = useCallback(() => {
        if (wishlistItemId === 0) {
            handleAddProductToWishlist();
            GTMAnalytics.default().trackingWishlistAction('add');
        } else {
            handleRemoveProductFormWishlist();
            GTMAnalytics.default().trackingWishlistAction('remove');
        }

        setTimeout(() => {
            updateMessage('');
        }, 100);
    }, [
        handleAddProductToWishlist,
        handleRemoveProductFormWishlist,
        wishlistItemId
    ]);

    const derivedErrorMessage = useMemo(
        () =>
            deriveErrorMessage([
                errorAddingSimpleProduct,
                errorAddingConfigurableProduct
            ]),
        [errorAddingConfigurableProduct, errorAddingSimpleProduct]
    );

    const errorsMessageToast = useMemo(
        () =>
            deriveErrorMessage([
                customerWishlistError,
                addToWishlistError,
                removeWishlistItemError,
                createReviewError,
                attributeProductError
            ]),
        [
            addToWishlistError,
            createReviewError,
            customerWishlistError,
            removeWishlistItemError,
            attributeProductError
        ]
    );

    const mostViewedGroups =
        productsRelatedData &&
        productsRelatedData.amMostviewedGroups &&
        productsRelatedData.amMostviewedGroups.items &&
        productsRelatedData.amMostviewedGroups.items.length > 0 &&
        productsRelatedData.amMostviewedGroups.items.filter(
            ({ position }) => position === 'product_content_bottom'
        )[0];

    const relatedProducts = mostViewedGroups?.items;
    const titleBlock = mostViewedGroups?.block_title;

    const labelProduct = product?.label_am_detail;

    return {
        rate,
        limit,
        variants,
        labelOption,
        findOptionsFromVariant,
        tabIndex,
        titleBlock,
        modalReview,
        modalAddToCart,
        breadcrumbCategoryId,
        errorMessage: derivedErrorMessage,
        errorsMessageToast: errorsMessageToast,
        errorsMessageWishlist: message,
        isFavorite,
        isAddToCartDisabled:
            !isSupportedProductType ||
            isMissingOptions ||
            isAddConfigurableLoading ||
            isAddSimpleLoading,
        isLoading:
            addToWishlistLoading ||
            removeWishlistItemLoading ||
            removeWishlistItemLoading ||
            isReviewsLoading ||
            reviewRatingLoading ||
            createReviewLoading ||
            attributeProductLoading,
        mediaGalleryEntries,
        productDetails,
        reviewsData: reviewsData?.productReviews,
        relatedProducts,
        labelProduct,
        handleAddToCart,
        wishlistAction,
        handleSelectionChange,
        handleOpenReview,
        handleCloseReview,
        handleSubmitReview,
        handleSelectReview,
        handleViewAllReview,
        handleSelectTab,
        handleUpdateOptionSelect,
        onChangeRating,

        email,
        setEmail
    };
};
