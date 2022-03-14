import { useCallback, useEffect, useState, useMemo } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';

import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useCatalogContext } from '@magento/peregrine/lib/context/catalog';

import DEFAULT_OPERATIONS from '../Product/product.gql';
import MAIN_OPERATIONS from './categoryContent.gql';
import _ from 'lodash';

const DRAWER_NAME = 'filter';

/**
 * Returns props necessary to render the categoryContent component.
 *
 * @param {object} props.data - The results of a getCategory GraphQL query.
 *
 * @returns {object} result
 * @returns {number} result.categoryId - This category's ID.
 * @returns {string} result.categoryName - This category's name.
 * @returns {object} result.filters - The filters object.
 * @returns {func}   result.handleLoadFilters - A callback function to signal the user's intent to interact with the filters.
 * @returns {func}   result.handleOpenFilters - A callback function that actually opens the filter drawer.
 * @returns {object} result.items - The items in this category.
 * @returns {bool}   result.loadFilters - Whether or not the user has signalled their intent to interact with the filters.
 */
export const useCategoryContent = props => {
    const [{ isSignedIn }] = useUserContext();
    const {
        categoryId,
        data,
        products,
        currentPage,
        setCurrentPage,
        subCategories
    } = props;

    const [
        { pageSize, prevDataGallery, prevCategoryId },
        { setPrevDataGallery, setPrevCategoryId }
    ] = useCatalogContext();

    const operations = mergeOperations(
        DEFAULT_OPERATIONS,
        MAIN_OPERATIONS,
        props.operations
    );

    const {
        getProductFiltersByCategoryQuery,
        getProductsRelated,
        getWishListCustomer
    } = operations;

    const placeholderItems = Array.from({ length: pageSize }).fill(null);
    const [loadFilters, setLoadFilters] = useState(false);
    const [, { toggleDrawer }] = useAppContext();

    const handleLoadFilters = useCallback(() => {
        setLoadFilters(true);
    }, [setLoadFilters]);
    const handleOpenFilters = useCallback(() => {
        setLoadFilters(true);
        toggleDrawer(DRAWER_NAME);
    }, [setLoadFilters, toggleDrawer]);

    const { data: productsRelatedData } = useQuery(getProductsRelated, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        variables: { id: categoryId }
    });

    const [getFilters, { data: filterData }] = useLazyQuery(
        getProductFiltersByCategoryQuery,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first'
        }
    );

    const { data: wishListData, wishlistError, wishListLoading } = useQuery(
        getWishListCustomer,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first',
            skip: !isSignedIn
        }
    );

    useEffect(() => {
        if (categoryId) {
            getFilters({
                variables: {
                    categoryIdFilter: {
                        eq: categoryId
                    }
                }
            });
        }
    }, [categoryId, getFilters]);

    function shallowEqual(object1, object2) {
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (const key of keys1) {
            if (object1[key] !== object2[key]) {
                return false;
            }
        }
        return true;
    }

    useEffect(() => {
        if (categoryId == prevCategoryId || currentPage > 1) {
            if (
                products &&
                products.items &&
                products.items[0] &&
                prevDataGallery &&
                !prevDataGallery.some(prevItem =>
                    shallowEqual(prevItem, products.items[0])
                )
            ) {
                setPrevDataGallery(prevDataGallery.concat(products.items));
            } else return;
        } else if (currentPage == 1) {
            setPrevDataGallery([]);
        } else {
            setCurrentPage(1);
            setPrevDataGallery([]);
            setTimeout(() => {
                setPrevCategoryId(categoryId);
            }, 100);
        }
    }, [
        products,
        categoryId,
        currentPage,
        prevCategoryId,
        setPrevCategoryId,
        setPrevDataGallery
    ]);

    const availableSortMethods = products?.sort_fields?.options;

    const filters = useMemo(() => {
        if (filterData && filterData.products) {
            if (
                filterData.products.aggregations &&
                filterData.products.aggregations.length > 0
            ) {
                const newAggregations = _.cloneDeep(
                    filterData.products.aggregations
                );
                return newAggregations.map(d => {
                    if (d.attribute_code === 'category_id') {
                        d.options = subCategories;
                    }
                    return { ...d };
                });
            }
            // return filterData.products.aggregations;
        }
        return null;
    }, [filterData, subCategories]);

    const items = useMemo(() => {
        if (prevDataGallery && prevDataGallery.length > 0) {
            return prevDataGallery;
        }
        if (products && products.items && products.items.length > 0) {
            return products.items;
        }
        return placeholderItems;
    }, [prevDataGallery, products, placeholderItems]);

    const totalPagesFromData = useMemo(() => {
        if (products && products.page_info) {
            return products.page_info.total_pages;
        }
        return 0;
    }, [products]);

    const totalItems = useMemo(() => {
        if (products) {
            return products.total_count;
        }
        return 0;
    }, [products]);

    const wishLists = useMemo(() => {
        if (wishListData) {
            return _.get(wishListData, 'customer.wishlist', {});
        }
        return null;
    }, [wishListData]);

    const categoryName = data ? data?.category?.name : null;
    const categoryDescription = data ? data?.category?.description : null;

    const mostViewedGroups =
        productsRelatedData &&
        productsRelatedData.amMostviewedGroups &&
        productsRelatedData.amMostviewedGroups.items &&
        productsRelatedData.amMostviewedGroups.items.length > 0 &&
        productsRelatedData.amMostviewedGroups.items.filter(
            ({ position }) => position === 'category_content_bottom'
        )[0];

    const relatedProducts = mostViewedGroups?.items;
    const titleBlock = mostViewedGroups?.block_title;

    return {
        categoryName,
        categoryDescription,
        filters,
        handleLoadFilters,
        handleOpenFilters,
        items,
        loadFilters,
        totalPagesFromData,
        totalItems,
        availableSortMethods,
        relatedProducts,
        titleBlock,
        wishLists
    };
};
