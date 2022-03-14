import { handleActions } from 'redux-actions';

import actions from '../actions/app';

export const name = 'app';

const initialState = {
    drawer: null,
    hasBeenOffline: !navigator.onLine,
    isOnline: navigator.onLine,
    isPageLoading: false,
    overlay: false,
    pending: {},
    searchOpen: false,
    mobile: false,
    tablet: false,
    subDesktop: false,
    rtl: false,
    baseMediaUrl: 'https://cdn-ara-images.halaexpress.com/media/',
    currentLink: {
        url: '/',
        tabIndex: 0
    },
    websiteId: 1,
    storeConfig: {}
};

const reducerMap = {
    [actions.toggleDrawer]: (state, { payload }) => {
        return {
            ...state,
            drawer: payload,
            overlay: !!payload
        };
    },
    [actions.toggleSearch]: state => {
        return {
            ...state,
            searchOpen: !state.searchOpen
        };
    },
    [actions.setOnline]: state => {
        return {
            ...state,
            isOnline: true
        };
    },
    [actions.setOffline]: state => {
        return {
            ...state,
            isOnline: false,
            hasBeenOffline: true
        };
    },
    [actions.setPageLoading]: (state, { payload }) => {
        return {
            ...state,
            isPageLoading: !!payload
        };
    },
    [actions.setMobile]: (state, { payload }) => {
        return {
            ...state,
            mobile: !!payload
        };
    },
    [actions.setTablet]: (state, { payload }) => {
        return {
            ...state,
            tablet: !!payload
        };
    },
    [actions.setSubDesktop]: (state, { payload }) => {
        return {
            ...state,
            subDesktop: !!payload
        };
    },
    [actions.setRtl]: (state, { payload }) => {
        return {
            ...state,
            rtl: !!payload
        };
    },
    [actions.setBaseMediaUrl]: (state, { payload }) => {
        return {
            ...state,
            baseMediaUrl: payload
        };
    },
    [actions.setCurrentLink]: (state, { payload }) => {
        return {
            ...state,
            currentLink: {
                url: payload.url,
                tabIndex: payload.tabIndex
            }
        };
    },
    [actions.setStoreConfig]: (state, { payload }) => {
        return {
            ...state,
            storeConfig: { ...payload }
        };
    }
};

export default handleActions(reducerMap, initialState);
