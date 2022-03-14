import actions from './actions';

export const toggleDrawer = name => async dispatch =>
    dispatch(actions.toggleDrawer(name));

export const closeDrawer = () => async dispatch =>
    dispatch(actions.toggleDrawer(null));

/** @deprecated */
export const toggleSearch = () => async dispatch =>
    dispatch(actions.toggleSearch());

export const setMobile = () => async dispatch => dispatch(actions.setMobile());

export const setTablet = () => async dispatch => dispatch(actions.setTablet());

export const setSubDesktop = () => async dispatch =>
    dispatch(actions.setSubDesktop());

export const setRtl = () => async dispatch => dispatch(actions.setRtl());

export const setBaseMediaUrl = payload => async dispatch => {
    dispatch(actions.setBaseMediaUrl(payload));
};

export const setCurrentLink = link => async dispatch => {
    dispatch(actions.setCurrentLink(link));
};

export const setStoreConfig = config => async dispatch => {
    dispatch(actions.setStoreConfig(config));
};
