import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import _ from 'lodash';

import mergeOperations from '../../util/shallowMerge';
import { useAppContext } from '../../context/app';
import { useCatalogContext } from '../../context/catalog';
import { usePagination } from '../../hooks/usePagination';
import { getSearchParam } from '../../hooks/useSearchParam';
import { useSort } from '../../hooks/useSort';
import { getFiltersFromSearch, getFilterInput } from '../FilterModal/helpers';

import DEFAULT_OPERATIONS from './searchPage.gql';
import { useUserContext } from '../../context/user';

/**
 * Return props necessary to render a SearchPage component.
 *
 * @param {Object} props
 * @param {String} props.query - graphql query used for executing search
 */
export const useSearchPage = (props = {}) => {
    const [{ prevDataGallery }, { setPrevDataGallery }] = useCatalogContext();
    const [{ isSignedIn }] = useUserContext();
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);

    const {
        getFilterInputsQuery,
        getProductFiltersBySearchQuery,
        productSearchQuery,
        getWishListCustomer
    } = operations;

    // retrieve app state and action creators
    const [{ mobile, tablet, storeConfig }, appApi] = useAppContext();
    const {
        toggleDrawer,
        actions: { setPageLoading }
    } = appApi;

    const pageSize = mobile ? 10 : tablet ? 12 : 15;

    const placeholderItems = Array.from({ length: pageSize }).fill(null);
    const sortProps = useSort({ idCategory: 2 });
    const { currentSort } = sortProps;
    // Keep track of the sort criteria so we can tell when they change.
    const previousSort = useRef(currentSort);

    // get the URL query parameters.
    const location = useLocation();
    const { search } = location;
    // Keep track of the search terms so we can tell when they change.
    const previousSearch = useRef(search);

    // Set up pagination.
    const [paginationValues, paginationApi] = usePagination();
    const { currentPage, totalPages } = paginationValues;
    const { setCurrentPage, setTotalPages } = paginationApi;

    const inputText = getSearchParam('query', location);

    const searchCategory = useMemo(() => {
        const inputFilters = getFiltersFromSearch(search);
        if (inputFilters.size === 0) {
            return null;
        }

        const targetCategoriesSet = inputFilters.get('category_id');
        if (!targetCategoriesSet) {
            return null;
        }

        // The set looks like ["Bottoms,11", "Skirts,12"].
        // We want to return "Bottoms, Skirts", etc.
        return [...targetCategoriesSet]
            .map(categoryPair => categoryPair.split(',')[0])
            .join(', ');
    }, [search]);

    const openDrawer = useCallback(() => {
        toggleDrawer('filter');
    }, [toggleDrawer]);

    // Get "allowed" filters by intersection of schema and aggregations
    const {
        called: introspectionCalled,
        data: introspectionData,
        loading: introspectionLoading
    } = useQuery(getFilterInputsQuery);

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

    const pageControl = {
        currentPage,
        setPage: setCurrentPage,
        totalPages
    };

    const [
        runQuery,
        { called: searchCalled, loading: searchLoading, error, data }
    ] = useLazyQuery(productSearchQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const { data: wishListData, wishlistError, wishListLoading } = useQuery(
        getWishListCustomer,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first',
            skip: !isSignedIn
        }
    );

    // Return value out of stock to hidden product from list category
    const outOfStockForSaleableQtyZero = useMemo(() => {
        return storeConfig?.out_of_stock_for_saleable_qty_zero || false;
    }, [storeConfig]);

    const isBackgroundLoading = !!data && searchLoading;
    const availableSortMethods = data?.products?.sort_fields?.options;

    const wishLists = useMemo(() => {
        if (wishListData) {
            return _.get(wishListData, 'customer.wishlist', {});
        }
        return null;
    }, [wishListData]);

    // Update the page indicator if the GraphQL query is in flight.
    useEffect(() => {
        setPageLoading(isBackgroundLoading);
    }, [isBackgroundLoading, setPageLoading]);

    useEffect(() => {
        // Wait until we have the type map to fetch product data.
        if (!filterTypeMap.size || !pageSize) {
            return;
        }
        const filters = getFiltersFromSearch(search);

        // Construct the filter arg object.
        const newFilters = {};
        filters.forEach((values, key) => {
            newFilters[key] = getFilterInput(values, filterTypeMap.get(key));
        });

        runQuery({
            variables: {
                currentPage: Number(currentPage),
                filters: newFilters,
                inputText,
                pageSize: Number(pageSize),
                sort: {
                    [currentSort.sortAttribute]: currentSort.isDESC
                        ? 'DESC'
                        : 'ASC'
                }
            }
        });
    }, [
        search,
        runQuery,
        pageSize,
        inputText,
        currentPage,
        currentSort,
        filterTypeMap
    ]);

    // Set the total number of pages whenever the data changes.
    useEffect(() => {
        const totalPagesFromData = data
            ? data.products.page_info.total_pages
            : null;

        setTotalPages(totalPagesFromData);

        return () => {
            setTotalPages(null);
        };
    }, [data, setTotalPages]);

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

    // Fetch category filters for when a user is searching in a category.
    const [getFilters, { data: filterData }] = useLazyQuery(
        getProductFiltersBySearchQuery,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first'
        }
    );

    useEffect(() => {
        if (inputText) {
            getFilters({
                variables: {
                    search: inputText
                }
            });
        }
    }, [getFilters, inputText, search]);

    // Use static category filters when filtering by category otherwise use the
    // default (and potentially changing!) aggregations from the product query.
    const filters = filterData ? filterData.products.aggregations : null;

    // Avoid showing a "empty data" state between introspection and search.
    const loading =
        (introspectionCalled && !searchCalled) ||
        searchLoading ||
        introspectionLoading;

    // Infinite Scroll
    function shallowEqual(object1, object2) {
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (let key of keys1) {
            if (object1[key] !== object2[key]) {
                return false;
            }
        }
        return true;
    }

    useEffect(() => {
        if (currentPage == 1) {
            setPrevDataGallery([]);
        } else if (
            data &&
            data.products &&
            prevDataGallery &&
            !prevDataGallery.some(prevItem =>
                shallowEqual(prevItem, data.products.items[0])
            )
        ) {
            setPrevDataGallery(prevDataGallery.concat(data.products.items));
        }
    }, [data, currentPage, setPrevDataGallery]);

    const items =
        prevDataGallery && prevDataGallery.length > 0
            ? prevDataGallery
            : data
            ? data.products.items
            : placeholderItems;

    const totalCount = data ? data.products.total_count : 0;

    return {
        data,
        items,
        error,
        filters,
        loading,
        sortProps,
        wishLists,
        totalCount,
        openDrawer,
        pageControl,
        searchCategory,
        searchTerm: inputText,
        availableSortMethods,
        outOfStockForSaleableQtyZero
    };
};
