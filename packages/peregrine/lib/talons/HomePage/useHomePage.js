import { useEffect, useMemo, useState } from 'react';
import { useLazyQuery } from '@apollo/client';

//GraphQL
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from './homePage.gql';

//Redux
import { useAppContext } from '@magento/peregrine/lib/context/app';

/**
 * Retrieves data necessary to render a Home Page
 *
 * @param {object} props
 * @param {object} props.landingCategoryId - Landing Category ID
 * @param {object} props.queries - Collection of GraphQL queries
 * @param {object} props.queries.getLandingPage - Query for getting a Home Page
 * @returns {{shouldShowLoadingIndicator: *, data: *, error: *}}
 */
export const useHomePage = props => {
    const { landingCategoryId } = props;
    const [{ storeConfig }] = useAppContext();

    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const [firstCallLandingPage, setFirstCallLandingPage] = useState(true);
    const [homePage, setHomePage] = useState([]);
    const { getLandingPageQuery } = operations;
    // const { getLandingPageQuery, getCustomAttributeMetadata } = operations;

    const [getLandingPage, { data, error, loading }] = useLazyQuery(
        getLandingPageQuery,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first'
        }
    );

    // const { data: brands, brandsLoading } = useQuery(getCustomAttributeMetadata, {
    //     fetchPolicy: 'cache-and-network',
    //     nextFetchPolicy: 'cache-first',
    //     variables: {
    //         attributes: [
    //           {
    //             attribute_code: 'manufacturer',
    //             entity_type: 'catalog_product'
    //           }
    //         ]
    //     }
    // });

    const [
        ,
        {
            actions: { setPageLoading }
        }
    ] = useAppContext();

    useEffect(() => {
        if (firstCallLandingPage) {
            getLandingPage({
                variables: {
                    landingCategoryId: Number(landingCategoryId)
                }
            });
        }
    }, [firstCallLandingPage]);

    useEffect(async () => {
        if (data && firstCallLandingPage) {
            await setHomePage(data.getLandingPage);
            setFirstCallLandingPage(false);
        }
    }, [data]);

    // To prevent loading indicator from getting stuck, unset on unmount.
    useEffect(() => {
        return () => {
            setPageLoading(false);
        };
    }, [setPageLoading]);

    // Ensure we mark the page as loading while we check the network for updates
    useEffect(() => {
        setPageLoading(loading);
    }, [loading, setPageLoading]);

    const shouldShowLoadingIndicator = loading && !data;
    // const homePage = data ? data.getLandingPage : [];

    // Return value out of stock to hidden product from list category
    const outOfStockForSaleableQtyZero = useMemo(() => {
        return storeConfig.out_of_stock_for_saleable_qty_zero || false;
    }, [storeConfig]);

    return {
        homePage,
        error,
        shouldShowLoadingIndicator,
        outOfStockForSaleableQtyZero
        // brandsLoading,
        // brands
    };
};
