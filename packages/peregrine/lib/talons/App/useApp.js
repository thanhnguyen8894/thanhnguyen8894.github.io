import { useCallback, useEffect, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import errorRecord from '@magento/peregrine/lib/util/createErrorRecord';
import { useAppContext } from '@magento/peregrine/lib/context/app';

const dismissers = new WeakMap();

const GET_BASE_URL_CONFIG_DATA = gql`
    query getBaseUrl {
        storeConfig {
            id
            #for show image
            base_media_url
            #for authentication: login/signup
            website_id
            default_display_currency_code
            default_country_code
            #store switcher
            code
            store_name
            store_group_name
            #footer
            copyright
            #header
            store_name
            #category
            root_category_id
            catalog_default_sort_by
            #Wallet config
            product_url_suffix
            walletreward_wallet_status
            walletreward_reward_enable
            walletreward_reward_earn_reward_creating_order_enable_create_order
            walletreward_reward_earn_reward_creating_order_min_order_qty
            walletreward_reward_earn_reward_creating_order_min_order_total
            walletreward_reward_earn_reward_creating_order_reward_point
            walletreward_reward_earn_reward_creating_order_reward_message
            walletreward_reward_earn_reward_creating_order_earn_type
            walletreward_reward_earn_reward_creating_order_max_reward_per_order
            walletreward_wallet_order_allow_max_credit_per_order
            #product
            out_of_stock_for_saleable_qty_zero
            #banner for cart and checkout page
            pwa_image_banner_checkout_left
            pwa_image_banner_checkout_right
            pwa_image_banner_cart_left
            pwa_image_banner_cart_right
            #cart page
            configurable_thumbnail_source
        }
    }
`;

// Memoize dismisser funcs to reduce re-renders from func identity change.
const getErrorDismisser = (error, onDismissError) => {
    return dismissers.has(error)
        ? dismissers.get(error)
        : dismissers.set(error, () => onDismissError(error)).get(error);
};
/**
 * Talon that handles effects for App and returns props necessary for rendering
 * the app.
 *
 * @param {Function} props.handleError callback to invoke for each error
 * @param {Function} props.handleIsOffline callback to invoke when the app goes offline
 * @param {Function} props.handleIsOnline callback to invoke wen the app goes online
 * @param {Function} props.handleHTMLUpdate callback to invoke when a HTML update is available
 * @param {Function} props.markErrorHandled callback to invoke when handling an error
 * @param {Function} props.renderError an error that occurs during rendering of the app
 * @param {Function} props.unhandledErrors errors coming from the error reducer
 *
 * @returns {{
 *  hasOverlay: boolean
 *  handleCloseDrawer: function
 *  toggleLayout: function
 * }}
 */
export const useApp = props => {
    const {
        handleError,
        handleIsOffline,
        handleIsOnline,
        markErrorHandled,
        renderError,
        unhandledErrors
    } = props;

    const [appState, appApi] = useAppContext();
    const { closeDrawer, setBaseMediaUrl, setStoreConfig } = appApi;
    const { hasBeenOffline, isOnline, overlay, rtl } = appState;

    const { data } = useQuery(GET_BASE_URL_CONFIG_DATA);

    useEffect(() => {
        if (data && data.storeConfig) {
            setBaseMediaUrl(data.storeConfig.base_media_url);
            setStoreConfig(data.storeConfig);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const reload = useCallback(
        process.env.NODE_ENV === 'development'
            ? () => {
                  console.log(
                      'Default window.location.reload() error handler not running in developer mode.'
                  );
              }
            : () => {
                  window.location.reload();
              },
        []
    );

    const renderErrors = useMemo(
        () =>
            renderError
                ? [errorRecord(renderError, window, useApp, renderError.stack)]
                : [],
        [renderError]
    );

    const errors = renderError ? renderErrors : unhandledErrors;
    const handleDismissError = renderError ? reload : markErrorHandled;

    // Only add toasts for errors if the errors list changes. Since `addToast`
    // and `toasts` changes each render we cannot add it as an effect dependency
    // otherwise we infinitely loop.
    useEffect(() => {
        for (const { error, id, loc } of errors) {
            handleError(
                error,
                id,
                loc,
                getErrorDismisser(error, handleDismissError)
            );
        }
    }, [errors, handleDismissError, handleError]);

    useEffect(() => {
        if (hasBeenOffline) {
            if (isOnline) {
                handleIsOnline();
            } else {
                handleIsOffline();
            }
        }
    }, [handleIsOnline, handleIsOffline, hasBeenOffline, isOnline]);

    const handleCloseDrawer = useCallback(() => {
        closeDrawer();
    }, [closeDrawer]);

    const toggleLayout = useCallback(() => {
        const func = rtl ? 'add' : 'remove';
        document.body.classList[func]('rtl');
    }, [rtl]);

    return {
        hasOverlay: !!overlay,
        handleCloseDrawer,
        toggleLayout
    };
};
