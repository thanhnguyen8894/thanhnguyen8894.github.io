import actions from './actions';

export const setCurrentPage = payload =>
    async function thunk(dispatch) {
        dispatch(actions.setCurrentPage.receive(payload));
    };

export const setPrevPageTotal = payload =>
    async function thunk(dispatch) {
        dispatch(actions.setPrevPageTotal.receive(payload));
    };

export const setPrevDataGallery = payload => async dispatch => {
    dispatch(actions.setPrevDataGallery(payload));
};

export const setPrevCategoryId = payload => async dispatch => {
    dispatch(actions.setPrevCategoryId(payload));
};

export const updateCategories = payload => async dispatch => {
    dispatch(actions.updateCategories(payload));
};

export const setProductId = payload => async dispatch => {
    dispatch(actions.setProductId(payload));
};

export const updateParentUrl = payload => async dispatch => {
    dispatch(actions.updateParentUrl(payload));
};
