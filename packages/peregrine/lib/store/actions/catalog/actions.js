import { createActions } from 'redux-actions';

const prefix = 'CATALOG';
const actionTypes = [
    'UPDATE_CATEGORIES',
    'SET_PREV_DATA_GALLERY',
    'SET_PREV_CATEGORY_ID',
    'UPDATE_CATEGORIES',
    'SET_PRODUCT_ID',
    'UPDATE_PARENT_URL'
];

const actionMap = {
    SET_CURRENT_PAGE: {
        REQUEST: null,
        RECEIVE: null
    },
    SET_PREV_PAGE_TOTAL: {
        REQUEST: null,
        RECEIVE: null
    }
};

export default createActions(actionMap, ...actionTypes, { prefix });
