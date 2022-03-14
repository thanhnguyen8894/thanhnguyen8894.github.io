import { useMemo, useEffect } from 'react';
import { useQuery } from '@apollo/client';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';

import mergeOperations from '../../util/shallowMerge';
import DEFAULT_OPERATIONS from './productList.gql';

export const useProductList = props => {
    const [{ rtl, storeConfig }] = useAppContext();
    const [{ currentUser }] = useUserContext();
    const { productListId, currentPage, pageSize } = props;

    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const { getProductListQuery } = operations;

    useEffect(() => {
        GTMAnalytics.default().trackingPageView(
            currentUser,
            rtl,
            'categoryPage'
        );
    }, []);

    const { data, loading, error, called: loadProductListCalled } = useQuery(
        getProductListQuery,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first',
            variables: {
                productListId: Number(productListId),
                pageSize: Number(pageSize),
                currentPage: Number(currentPage)
            }
        }
    );

    // Return value out of stock to hidden product from list category
    const outOfStockForSaleableQtyZero = useMemo(() => {
        return storeConfig?.out_of_stock_for_saleable_qty_zero || false;
    }, [storeConfig]);

    const items = useMemo(() => {
        if (!data || (data && !data.getProductList)) {
            // The product isn't in the cache and we don't have a response from GraphQL yet.
            return [];
        }
        const { products } = data.getProductList;
        const { items } = products;

        if (!items) {
            return [];
        }
        return items;
    }, [data]);

    const totalItems = useMemo(() => {
        if (!data || (data && !data.getProductList)) {
            // The product isn't in the cache and we don't have a response from GraphQL yet.
            return 0;
        }
        const { products } = data.getProductList;
        const { total_count } = products;

        return total_count;
    }, [data]);

    const totalPages = totalItems > 0 ? Math.round(totalItems / pageSize) : 0;

    return {
        error,
        totalItems,
        items,
        loading,
        pageSize,
        totalPages,
        outOfStockForSaleableQtyZero,
        loadProductListCalled
    };
};
