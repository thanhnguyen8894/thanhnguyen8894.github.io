import { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { useUserContext } from '@magento/peregrine/lib/context/user';
import { gql, useQuery } from '@apollo/client';

export const useFavoriteTrigger = () => {
    const history = useHistory();
    const [{ isSignedIn }, { setAccountMenuActive }] = useUserContext();
    const loginLink = '/login';

    const { data } = useQuery(GET_WISHLIST_COUNT, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !isSignedIn
    });

    const handleLinkClick = useCallback(async () => {
        if (!isSignedIn) {
            history.push(loginLink);
        } else {
            await setAccountMenuActive(5);
            history.push('/account-information');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [history, isSignedIn, loginLink]);

    const itemCount = useMemo(() => {
        return data?.customer?.wishlist?.items_count;
    }, [data]);

    return {
        handleLinkClick,
        itemCount
    };
};

export const GET_WISHLIST_COUNT = gql`
    query WishlistCount {
        customer {
            id
            wishlist {
                id
                items_count
            }
        }
    }
`;
