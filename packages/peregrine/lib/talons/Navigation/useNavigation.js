import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';

import mergeOperations from '../../util/shallowMerge';
import { useAppContext } from '../../context/app';
import { useCatalogContext } from '../../context/catalog';
import { useUserContext } from '../../context/user';
import { useAwaitQuery } from '../../hooks/useAwaitQuery';

import DEFAULT_OPERATIONS from './navigation.gql';
import MAIN_OPERATIONS from '@magento/peregrine/lib/talons/MegaMenu/megaMenu.gql';

const ancestors = {
    CREATE_ACCOUNT: 'SIGN_IN',
    FORGOT_PASSWORD: 'SIGN_IN',
    MY_ACCOUNT: 'MENU',
    SIGN_IN: 'MENU',
    MENU: null
};

export const useNavigation = (props = {}) => {
    const operations = mergeOperations(
        DEFAULT_OPERATIONS,
        MAIN_OPERATIONS,
        props.operations
    );
    const { getCustomerQuery, getMegaMenuQuery } = operations;
    // retrieve app state from context
    const [appState, { closeDrawer }] = useAppContext();
    const [
        { categories, parentUrl },
        { updateCategories, updateParentUrl }
    ] = useCatalogContext();
    const [, { getUserDetails }] = useUserContext();
    const fetchUserDetails = useAwaitQuery(getCustomerQuery);

    // request data from server
    useEffect(() => {
        getUserDetails({ fetchUserDetails });
    }, [fetchUserDetails, getUserDetails]);

    const { data } = useQuery(getMegaMenuQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const rootCategory = data?.categoryList[0]?.children;
    useEffect(() => {
        if (rootCategory) {
            updateCategories(rootCategory);
        }
    }, [rootCategory]);

    // extract relevant data from app state
    const { drawer, storeConfig } = appState;
    const isOpen = drawer === 'nav';

    const rootCategoryId = useMemo(() => {
        if (storeConfig) {
            return storeConfig.root_category_id;
        }
    }, [storeConfig]);

    // get local state
    const [view, setView] = useState('MENU');
    const [categoryId, setCategoryId] = useState(rootCategoryId);

    useEffect(() => {
        // On a fresh render with cold cache set the current category as root
        // once the root category query completes.
        if (rootCategoryId && !categoryId) {
            setCategoryId(rootCategoryId);
        }
    }, [categoryId, rootCategoryId]);

    // define local variables
    const isTopLevel = categoryId === rootCategoryId;
    const hasModal = view !== 'MENU';

    // define handlers
    const handleBack = useCallback(() => {
        const parent = ancestors[view];

        if (parent) {
            setView(parent);
        } else if (categories && !isTopLevel) {
            updateParentUrl('');
            updateCategories(rootCategory);
            setCategoryId(rootCategoryId);
        } else {
            closeDrawer();
        }
    }, [categories, updateParentUrl, closeDrawer, isTopLevel, view]);

    const handleClose = useCallback(() => {
        closeDrawer();
    }, [closeDrawer]);

    // create callbacks for local state
    const showCreateAccount = useCallback(() => {
        setView('CREATE_ACCOUNT');
    }, [setView]);
    const showForgotPassword = useCallback(() => {
        setView('FORGOT_PASSWORD');
    }, [setView]);
    const showMainMenu = useCallback(() => {
        setView('MENU');
    }, [setView]);
    const showMyAccount = useCallback(() => {
        setView('MY_ACCOUNT');
    }, [setView]);
    const showSignIn = useCallback(() => {
        setView('SIGN_IN');
    }, [setView]);

    return {
        parentUrl,
        updateParentUrl,
        categories,
        updateCategories,
        categoryId,
        handleBack,
        handleClose,
        hasModal,
        isOpen,
        isTopLevel,
        setCategoryId,
        showCreateAccount,
        showForgotPassword,
        showMainMenu,
        showMyAccount,
        showSignIn,
        view
    };
};
