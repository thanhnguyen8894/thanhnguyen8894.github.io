import React, { useEffect, useMemo, useState } from 'react';
import { func, shape, string } from 'prop-types';
import { CachePersistor } from 'apollo-cache-persist';
import { ApolloProvider, createHttpLink } from '@apollo/client';
import { ApolloClient } from '@apollo/client/core';
import { InMemoryCache } from '@apollo/client/cache';
import { setContext } from '@apollo/client/link/context';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { BrowserPersistence } from '@magento/peregrine/lib/util';
import attachClient from '@magento/peregrine/lib/Apollo/attachClientToStore';

import typePolicies from '@magento/peregrine/lib/Apollo/policies';
import { CACHE_PERSIST_PREFIX } from '@magento/peregrine/lib/Apollo/constants';
import StoreCodeRoute from '../components/StoreCodeRoute';
import { shrinkGETQuery } from '../util/shrinkGETQuery';
import CountryCodeRoute from '../components/CountryCodeRoute';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { useAppContext } from '@magento/peregrine/lib/context/app';

/**
 * To improve initial load time, create an apollo cache object as soon as
 * this module is executed, since it doesn't depend on any component props.
 * The tradeoff is that we may be creating an instance we don't end up needing.
 */
const preInstantiatedCache = new InMemoryCache({
    typePolicies,
    // POSSIBLE_TYPES is injected into the bundle by webpack at build time.
    possibleTypes: POSSIBLE_TYPES
});

const storage = new BrowserPersistence();

/**
 * The counterpart to `@magento/venia-drivers` is an adapter that provides
 * context objects to the driver dependencies. The default implementation in
 * `@magento/venia-drivers` uses modules such as `react-redux`, which
 * have implicit external dependencies. This adapter provides all of them at
 * once.
 *
 * Consumers of Venia components can either implement a similar adapter and
 * wrap their Venia component trees with it, or they can override `src/drivers`
 * so its components don't depend on context and IO.
 *
 * @param {String} props.apiBase base path for url
 * @param {Object} props.apollo.cache an apollo cache instance
 * @param {Object} props.apollo.client an apollo client instance
 * @param {Object} props.apollo.link an apollo link instance
 * @param {Object} props.store redux store to provide
 */
const VeniaAdapter = props => {
    const { apiBase, apollo = {}, children, store } = props;
    const [initialized, setInitialized] = useState(false);

    const defaultOptions = {
        watchQuery: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'ignore'
        },
        query: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all'
        }
    };

    const apolloClient = useMemo(() => {
        const cache = apollo.cache || preInstantiatedCache;
        const link = apollo.link || VeniaAdapter.apolloLink(apiBase);
        // const client = apollo.client || new ApolloClient({ cache, link });
        const client =
            apollo.client ||
            new ApolloClient({
                cache,
                link,
                defaultOptions: defaultOptions
            });
        const storeCode = storage.getItem('store_view_code') || 'default';

        const persistor = new CachePersistor({
            key: `${CACHE_PERSIST_PREFIX}-${storeCode}`,
            cache,
            storage: window.localStorage,
            debug: process.env.NODE_ENV === 'development'
        });

        return Object.assign(client, { apiBase, persistor });
    }, [apiBase, apollo]);

    // perform blocking async work here
    useEffect(() => {
        if (initialized) return;

        // immediately invoke this async function
        (async () => {
            // restore persisted data to the Apollo cache
            await apolloClient.persistor.restore();

            // attach the Apollo client to the Redux store
            attachClient(apolloClient);

            // mark this routine as complete
            setInitialized(true);
        })();
    }, [apolloClient, initialized]);

    if (!initialized) {
        // TODO: Replace with app skeleton. See PWA-547.
        return null;
    }

    let storeCodeRouteHandler = null;
    let countryCodeRouteHandler = null;
    const browserRouterProps = {};
    if (process.env.USE_STORE_CODE_IN_URL) {
        const storeCode = storage.getItem('store_view_code') || STORE_VIEW_CODE;
        const storeLanguage =
            storage.getItem('is_ar_language') || STORE_VIEW_CODE;
        browserRouterProps.basename = `/${storeLanguage}`;

        // Include the store code route handler that manages and updates the
        // stored code based on the url.
        // storeCodeRouteHandler = <StoreCodeRoute />;
        countryCodeRouteHandler = <CountryCodeRoute />;
    }

    return (
        <ApolloProvider client={apolloClient}>
            <ReduxProvider store={store}>
                <BrowserRouter {...browserRouterProps}>
                    {/* {storeCodeRouteHandler} */}
                    {countryCodeRouteHandler}
                    {children}
                </BrowserRouter>
            </ReduxProvider>
        </ApolloProvider>
    );
};

// Create a new store link to include store codes and currency in the request
VeniaAdapter.storeLink = setContext((_, { headers }) => {
    const storeCurrency = storage.getItem('store_view_currency') || null;
    const storeCode = storage.getItem('store_view_code') || STORE_VIEW_CODE;

    // return the headers to the context so httpLink can read them
    //TODO: Remove Content-Currency in header
    return {
        headers: {
            ...headers,
            store: storeCode
            // ...(storeCurrency && { 'Content-Currency': storeCurrency })
        }
    };
});

/**
 * We attach this Link as a static method on VeniaAdapter because
 * other modules in the codebase need access to it.
 */
VeniaAdapter.apolloLink = apiBase => {
    // Intercept and shrink URLs from GET queries. Using
    // GET makes it possible to use edge caching in Magento
    // Cloud, but risks exceeding URL limits with default usage
    // of Apollo's http link. `shrinkGETQuery` encodes the URL
    // in a more efficient way.
    const customFetchToShrinkQuery = (uri, options) => {
        let url = uri;
        if (options.method === 'GET') {
            url = shrinkGETQuery(uri);
        }
        return fetch(url, options);
    };

    return createHttpLink({
        uri: apiBase,
        fetch: customFetchToShrinkQuery,
        // Warning: useGETForQueries risks exceeding URL length limits. These limits
        // in practice are typically set at or behind where TLS terminates. For Magento
        // Cloud and Fastly, 8kb is the maximum by default
        // https://docs.fastly.com/en/guides/resource-limits#request-and-response-limits
        useGETForQueries: true
    });
};

VeniaAdapter.propTypes = {
    apiBase: string.isRequired,
    apollo: shape({
        client: shape({
            query: func.isRequired
        }),
        link: shape({
            request: func.isRequired
        }),
        cache: shape({
            readQuery: func.isRequired
        })
    }),
    store: shape({
        dispatch: func.isRequired,
        getState: func.isRequired,
        subscribe: func.isRequired
    }).isRequired
};

export default VeniaAdapter;
