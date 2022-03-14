import { useQuery } from '@apollo/client';
import { useCallback } from 'react';
import { useHistory } from '@magento/venia-ui/lib/drivers';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';

import DEFAULT_OPERATIONS from './footer.gql';
import MAIN_OPERATIONS from '@magento/peregrine/lib/talons/HomePage/homePage.gql';
import { IS_USE_STATIC_FOOTER } from '@magento/venia-ui/lib/constants/constants';

/**
 *
 * @param {*} props.operations GraphQL operations used by talons
 */
export const useFooter = (props = {}) => {
    const operations = mergeOperations(
        DEFAULT_OPERATIONS,
        MAIN_OPERATIONS,
        props.operations
    );
    const [{ isSignedIn }, { setAccountMenuActive }] = useUserContext();
    const [{ mobile, tablet, storeConfig }] = useAppContext();
    const loginLink = '/login';
    const history = useHistory();
    const { getCMSBlock } = operations;

    const keyFooter = mobile
        ? 'main_footer_mobile'
        : tablet
        ? 'main_footer_tablet'
        : 'main_footer';

    const { data: cmsData } = useQuery(getCMSBlock, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        variables: { key_footer: keyFooter },
        skip: IS_USE_STATIC_FOOTER
    });

    const { data: socialData } = useQuery(getCMSBlock, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        variables: { key_footer: 'social_footer' },
        skip: IS_USE_STATIC_FOOTER
    });

    const trackDowloadApp = () => {
        GTMAnalytics.default().trackingDowloadApp();
    };

    const handleLinkClick = useCallback(
        async id => {
            if (!isSignedIn) {
                history.push(loginLink);
            } else {
                await setAccountMenuActive(id);
                history.push('/account-information');
            }
            window.scrollTo({
                behavior: 'smooth',
                left: 0,
                top: 0
            });
        },
        [history, isSignedIn, loginLink, setAccountMenuActive]
    );
    const footerLink =
        cmsData &&
        cmsData.cmsBlocks &&
        cmsData.cmsBlocks.items &&
        cmsData.cmsBlocks.items[0]
            ? cmsData.cmsBlocks.items[0].content
            : `<div></div>`;

    const socialLink =
        socialData &&
        socialData.cmsBlocks &&
        socialData.cmsBlocks.items &&
        socialData.cmsBlocks.items[0]
            ? socialData.cmsBlocks.items[0].content
            : `<div></div>`;
    return {
        copyrightText: storeConfig && storeConfig.copyright,
        footerLink,
        socialLink,
        handleLinkClick,
        trackDowloadApp
    };
};
