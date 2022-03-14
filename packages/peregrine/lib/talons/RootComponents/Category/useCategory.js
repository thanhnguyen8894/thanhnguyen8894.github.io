import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLazyQuery, useQuery } from '@apollo/client';

import _ from 'lodash';

import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { usePagination } from '@magento/peregrine/lib/hooks/usePagination';
import { useSort } from '@magento/peregrine/lib/hooks/useSort';
import {
    getFiltersFromSearch,
    getFilterInput
} from '@magento/peregrine/lib/talons/FilterModal/helpers';
import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';

import DEFAULT_OPERATIONS from './category.gql';

/**
 * A [React Hook]{@link https://reactjs.org/docs/hooks-intro.html} that
 * controls the logic for the Category Root Component.
 *
 * @kind function
 *
 * @param {object}      props
 * @param {number}      props.id - Category Id.
 * @param {GraphQLAST}  props.operations.getCategoryQuery - Fetches category using a server query
 * @param {GraphQLAST}  props.operations.getFilterInputsQuery - Fetches "allowed" filters using a server query
 * @param {GraphQLAST}  props.queries.getStoreConfig - Fetches store configuration using a server query
 *
 * @returns {object}    result
 * @returns {object}    result.error - Indicates a network error occurred.
 * @returns {object}    result.categoryData - Category data.
 * @returns {bool}      result.isLoading - Category data loading.
 * @returns {string}    result.metaDescription - Category meta description.
 * @returns {object}    result.pageControl - Category pagination state.
 * @returns {object}     result.sortProps - Category sorting parameters.
 * @returns {number}    result.pageSize - Category total pages.
 */
export const useCategory = props => {
    const [
        { mobile, tablet, rtl, storeConfig },
        {
            actions: { setPageLoading }
        }
    ] = useAppContext();

    const [{ currentUser }] = useUserContext();

    const { setCategoryId, id } = props;

    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const {
        getFilterInputsQuery,
        productSearchQuery,
        getCategoryDetailsQuery,
        getSubCategoryQuery
    } = operations;

    const pageSize = mobile ? 10 : tablet ? 12 : 16;

    const [paginationValues, paginationApi] = usePagination();
    const { currentPage, totalPages } = paginationValues;
    const { setCurrentPage, setTotalPages } = paginationApi;

    const sortProps = useSort({ idCategory: id });
    const { currentSort } = sortProps;

    // Keep track of the sort criteria so we can tell when they change.
    const previousSort = useRef(currentSort);

    const pageControl = {
        currentPage,
        setPage: setCurrentPage,
        totalPages
    };

    // Category details
    const [runCategoryDetailsQuery, categoryDetails] = useLazyQuery(
        getCategoryDetailsQuery,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first',
            errorPolicy: 'all'
        }
    );
    // const { called: categoryCalled, data, loading: categoryLoading } = useQuery(
    //     getCategoryDetailsQuery,
    //     {
    //         fetchPolicy: 'cache-and-network',
    //         nextFetchPolicy: 'cache-first',
    //         errorPolicy: 'all',
    //         variables: {
    //             id: Number(id)
    //         }
    //     }
    // );

    const {
        called: categoryCalled,
        loading: categoryLoading,
        data
    } = categoryDetails;
    // end Category details

    const {
        called: subCategoryCalled,
        data: subCategory,
        loading: subCategoryLoading
    } = useQuery(getSubCategoryQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        variables: {
            id
        }
    });

    const [runQuery, productSearchData] = useLazyQuery(productSearchQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    // Products
    let products = {};
    const {
        called: productSearchCalled,
        loading: productSearchLoading,
        error,
        data: productList
    } = productSearchData;
    if (productList) {
        products = productList.products;
    }

    const { search } = useLocation();

    const isBackgroundLoading =
        (!!data && categoryLoading) || (!!productList && productSearchLoading);

    // Update the page indicator if the GraphQL query is in flight.
    useEffect(() => {
        setPageLoading(isBackgroundLoading);
    }, [isBackgroundLoading, setPageLoading]);

    // Keep track of the search terms so we can tell when they change.
    const previousSearch = useRef(search);

    // Get "allowed" filters by intersection of schema and aggregations
    const {
        called: introspectionCalled,
        data: introspectionData,
        loading: introspectionLoading
    } = useQuery(getFilterInputsQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    // Create a type map we can reference later to ensure we pass valid args
    // to the graphql query.
    // For example: { category_id: 'FilterEqualTypeInput', price: 'FilterRangeTypeInput' }
    const filterTypeMap = useMemo(() => {
        const typeMap = new Map();
        if (introspectionData) {
            introspectionData.__type.inputFields.forEach(({ name, type }) => {
                typeMap.set(name, type.name);
            });
        }
        return typeMap;
    }, [introspectionData]);

    // Run the category query immediately and whenever its variable values change.
    useEffect(() => {
        // Wait until we have the type map to fetch product data.
        if (!filterTypeMap.size || !pageSize) {
            return;
        }

        const filters = getFiltersFromSearch(search);

        // Construct the filter arg object.
        const newFilters = {};

        // set default to search by category on router
        newFilters['category_id'] = { eq: String(id) };

        filters.forEach((values, key) => {
            newFilters[key] = getFilterInput(values, filterTypeMap.get(key));
        });

        // currentPage === 1 => first load
        if (currentPage === 1) {
            const newCategoryId = _.get(newFilters.category_id, 'eq') || id;
            if (newCategoryId) {
                // this case is one category
                runCategoryDetailsQuery({
                    variables: {
                        id: Number(newCategoryId)
                    }
                });
            } else {
                // this case is one category
                runCategoryDetailsQuery({
                    variables: {
                        id: Number(id)
                    }
                });
            }
            setCategoryId(Number(newCategoryId));
        }

        // Use the category id for the current category page regardless of the
        // applied filters. Follow-up in PWA-404.
        if (!_.isNil(data?.category)) {
            runQuery({
                variables: {
                    currentPage: Number(currentPage),
                    filters: newFilters,
                    pageSize: Number(pageSize),
                    sort: {
                        [currentSort.sortAttribute]: currentSort.isDESC
                            ? 'DESC'
                            : 'ASC'
                    }
                }
            });
        }
    }, [
        id,
        search,
        pageSize,
        runQuery,
        currentPage,
        currentSort,
        filterTypeMap,
        setCategoryId,
        runCategoryDetailsQuery,
        data
    ]);

    // Return value out of stock to hidden product from list category
    const outOfStockForSaleableQtyZero = useMemo(() => {
        return storeConfig?.out_of_stock_for_saleable_qty_zero || false;
    }, [storeConfig]);

    const totalPagesFromData = products?.page_info?.total_pages || null;

    useEffect(() => {
        setTotalPages(totalPagesFromData);
        return () => {
            setTotalPages(null);
        };
    }, [setTotalPages, totalPagesFromData]);

    // If we get an error after loading we should try to reset to page 1.
    // If we continue to have errors after that, render an error message.
    useEffect(() => {
        if (
            error &&
            !productSearchLoading &&
            !productList &&
            currentPage !== 1
        ) {
            setCurrentPage(1);
        }
    }, [currentPage, error, productSearchLoading, setCurrentPage, productList]);

    // Reset the current page back to one (1) when the search string, filters
    // or sort criteria change.
    useEffect(() => {
        // We don't want to compare page value.
        const prevSearch = new URLSearchParams(previousSearch.current);
        const nextSearch = new URLSearchParams(search);
        prevSearch.delete('page');
        nextSearch.delete('page');

        if (
            prevSearch.toString() !== nextSearch.toString() ||
            previousSort.current.sortAttribute.toString() !==
                currentSort.sortAttribute.toString() ||
            previousSort.current.isDESC !== currentSort.isDESC
        ) {
            // The search term changed.
            setCurrentPage(1);
            // And update the ref.
            previousSearch.current = search;
            previousSort.current = currentSort;
        }
    }, [currentSort, previousSearch, search, setCurrentPage]);

    const categoryData = useMemo(() => {
        if (categoryLoading && !data) {
            return null;
        }
        return data;
    }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

    const metaTitle = useMemo(() => {
        if (data && data.category && data.category.meta_title) {
            return data.category.meta_title;
        }
        return '';
    }, [data]);

    const metaDescription = useMemo(() => {
        if (data && data.category && data.category.meta_description) {
            return data.category.meta_description;
        }
        return '';
    }, [data]);

    const categoryImage = useMemo(() => {
        if (data && data.category && data.category.image) {
            return data.category.image;
        }
        return '';
    }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

    const subCategories = useMemo(() => {
        if (
            subCategory &&
            subCategory.categoryList &&
            subCategory.categoryList.length > 0
        ) {
            const { children: newSubCategory } =
                subCategory.categoryList[0] || {};
            if (newSubCategory && newSubCategory.length > 0) {
                return newSubCategory.map(cate => {
                    return {
                        value: cate.id.toString(),
                        label: cate.name
                    };
                });
            }
        }
        return [];
    }, [subCategory]); // eslint-disable-line react-hooks/exhaustive-deps

    // When only categoryLoading is involved, noProductsFound component flashes for a moment
    const loading =
        (introspectionCalled && !categoryCalled) ||
        (categoryLoading && !data) ||
        introspectionLoading ||
        (productSearchCalled && productSearchLoading);

    const [isSentTracking, setIsSentTracking] = useState(false);

    useEffect(() => {
        if (
            productSearchCalled &&
            currentPage &&
            currentPage === 1 &&
            productList &&
            productList?.products?.items?.length > 0 &&
            !isSentTracking
        ) {
            const categoryName = categoryData?.category?.name || '';

            GTMAnalytics.default().trackingProductCategory(
                productList?.products?.items,
                categoryName
            );
            GTMAnalytics.default().trackingPageView(
                currentUser,
                rtl,
                'categoryPage'
            );

            setIsSentTracking(true);
        }
    }, [
        productSearchCalled,
        productList,
        currentPage,
        categoryData,
        isSentTracking
    ]);

    return {
        error,
        categoryImage,
        categoryData,
        loading,
        categoryLoading,
        metaTitle,
        metaDescription,
        pageControl,
        sortProps,
        pageSize,
        products,
        productSearchLoading,
        productSearchCalled,
        subCategories,
        outOfStockForSaleableQtyZero
    };
};
