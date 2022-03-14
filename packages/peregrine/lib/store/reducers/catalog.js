import { handleActions } from 'redux-actions';

import actions from '../actions/catalog';

export const name = 'catalog';

const initialState = {
    categories: [],
    currentPage: 1,
    pageSize: 10,
    prevPageTotal: null,
    prevDataGallery: [],
    prevCategoryId: 2,
    productId: null,
    parentUrl: ''
};

const reducerMap = {
    [actions.updateCategories]: (state, { payload }) => {
        return {
            ...state,
            categories: payload
        };
    },
    [actions.updateParentUrl]: (state, { payload }) => {
        return {
            ...state,
            parentUrl: payload
        };
    },
    [actions.setCurrentPage.receive]: (state, { payload, error }) => {
        if (error) {
            return state;
        }

        return {
            ...state,
            currentPage: payload
        };
    },
    [actions.setPrevPageTotal.receive]: (state, { payload, error }) => {
        if (error) {
            return state;
        }

        return {
            ...state,
            prevPageTotal: payload
        };
    },
    [actions.setPrevDataGallery]: (state, { payload }) => {
        return {
            ...state,
            prevDataGallery: payload
        };
    },
    [actions.setPrevCategoryId]: (state, { payload }) => {
        return {
            ...state,
            prevCategoryId: payload
        };
    },
    [actions.setProductId]: (state, { payload }) => {
        return {
            ...state,
            productId: payload
        };
    }
};

export default handleActions(reducerMap, initialState);
