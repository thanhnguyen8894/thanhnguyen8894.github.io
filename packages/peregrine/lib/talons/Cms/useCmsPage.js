import { useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';

import mergeOperations from '../../util/shallowMerge';
import { useAppContext } from '../../context/app';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';

import DEFAULT_OPERATIONS from './cmsPage.gql';

/**
 * Retrieves data necessary to render a CMS Page
 *
 * @param {object} props
 * @param {object} props.id - CMS Page ID
 * @param {object} props.queries - Collection of GraphQL queries
 * @param {object} props.queries.getCmsPage - Query for getting a CMS Page
 * @returns {{shouldShowLoadingIndicator: *, hasContent: *, cmsPage: *, error: *}}
 */
export const useCmsPage = props => {
    const { id, relativeUrl } = props;

    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const { getCMSPageQuery } = operations;

    const { loading, error, data } = useQuery(getCMSPageQuery, {
        variables: {
            id: Number(id)
        },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const [
        { rtl, storeConfig },
        {
            actions: { setPageLoading }
        }
    ] = useAppContext();
    const [{ currentUser }] = useUserContext();

    useEffect(() => {
        GTMAnalytics.default().trackingPageView(currentUser, rtl, 'homePage');
    }, []);

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

    const cmsPage = data ? data.cmsPage : null;
    const rootCategoryId = storeConfig ? storeConfig.root_category_id : null;

    // Only render <RichContent /> if the page isn't empty and doesn't contain
    // the default CMS Page text. We do this so there is at least a useable home
    // page by default, the category list component.
    const hasContent = useMemo(() => {
        return (
            cmsPage &&
            cmsPage.content &&
            cmsPage.content.length > 0 &&
            !cmsPage.content.includes('CMS homepage content goes here.') &&
            relativeUrl !== 'home'
        );
    }, [cmsPage, relativeUrl]);

    return {
        cmsPage,
        error,
        hasContent,
        rootCategoryId,
        shouldShowLoadingIndicator
    };
};
