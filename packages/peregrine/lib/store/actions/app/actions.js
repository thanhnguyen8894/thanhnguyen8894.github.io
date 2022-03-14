import { createActions } from 'redux-actions';

const prefix = 'APP';
const actionTypes = [
    'TOGGLE_DRAWER',
    'SET_ONLINE',
    'SET_OFFLINE',
    'TOGGLE_SEARCH',
    'EXECUTE_SEARCH',
    'MARK_ERROR_HANDLED',
    'SET_PAGE_LOADING',
    'SET_MOBILE',
    'SET_TABLET',
    'SET_SUB_DESKTOP',
    'SET_RTL',
    'SET_BASE_MEDIA_URL',
    'SET_CURRENT_LINK',
    'SET_STORE_CONFIG'
];

export default createActions(...actionTypes, { prefix });
