import Analytics from 'analytics';
import googleTagManager from '@analytics/google-tag-manager';

const DEBUG_TRACKING = true;
const ENABLE_TRACING = true;

export default class GTMAnalytics {
    static default() {
        if (!GTMAnalytics.instance) {
            GTMAnalytics.instance = new GTMAnalytics();
        }
        return GTMAnalytics.instance;
    }

    static instance;
    analytics = undefined;

    constructor() {
        this.analytics = Analytics({
            app: 'Arabian Oud',
            plugins: [
                googleTagManager({
                    containerId: 'GTM-MHZS73F' // DEV
                })
            ]
        });
    }

    trackEvent = (eventName, params) => {
        if (ENABLE_TRACING) {
            try {
                if (DEBUG_TRACKING) {
                    console.log(
                        `[GTMAnalytics] >>>>>>>>>>> ${eventName} >>>>>>>>>>> [params]`,
                        params
                    );
                }
                if (params) {
                    this.analytics.track(eventName, {
                        ...params,
                        event: eventName
                    });
                }
            } catch (error) {
                if (DEBUG_TRACKING) {
                    console.log('[GTMAnalytics] >>>>>>>>>>> [error]', error);
                }
            }
        }
    };

    trackingPageView = (user, rtl, pageType) => {
        try {
            if (pageType) {
                const params = {
                    title: 'Arabian Oud',
                    url: window.location.href,
                    path: window.location.pathname,
                    language: rtl ? 'AR' : 'EN',
                    page_type: pageType,
                    currencyCode: 'SAR',
                    is_login: user?.firstname === '' ? 'no' : 'yes',
                    user_Id: null,
                    email: user?.email || null,
                    width: window.innerWidth,
                    height: window.innerHeight
                };
                this.trackEvent('page_view', params);
            }
        } catch (error) {
            // TODO
        }
    };

    trackingProductCategory = (products, categoryName) => {
        try {
            if (products) {
                products = products.map((item, index) => {
                    const { sku, name, id, price } = item || {};
                    return {
                        id,
                        sku,
                        name,
                        price: price?.regularPrice?.amount?.value,
                        category: categoryName,
                        position: index + 1
                    };
                });

                const params = {
                    ecommerce: {
                        impressions: products
                    }
                };
                this.trackEvent('product_impressions', params);
            }
        } catch (error) {
            // TODO
        }
    };

    trackingProductImp = product => {
        try {
            if (product) {
                const { id, name, price, sku } = product || {};
                const params = {
                    ecommerce: {
                        detail: {
                            products: [
                                {
                                    name,
                                    id,
                                    price: price?.regularPrice?.amount?.value,
                                    sku
                                }
                            ]
                        }
                    }
                };
                this.trackEvent('product_detail', params);
            }
        } catch (error) {
            // TODO
        }
    };

    trackingAddProduct = product => {
        try {
            if (product) {
                const { id, name, price, quantity, sku } = product || {};
                const params = {
                    ecommerce: {
                        add: {
                            products: [
                                {
                                    name,
                                    id,
                                    price: price?.regularPrice?.amount?.value,
                                    quantity,
                                    sku
                                }
                            ]
                        }
                    }
                };
                this.trackEvent('add_to_cart', params);
            }
        } catch (error) {
            // TODO
        }
    };

    trackingCheckout = data => {
        try {
            if (data) {
                const { step, option, products = [] } = data || {};
                const params = {
                    ecommerce: {
                        checkout: {
                            actionField: { step, option: `${option}` },
                            products
                        }
                    }
                };
                this.trackEvent('checkout', params);
            }
        } catch (error) {
            // TODO
        }
    };

    trackingRemoveProduct = product => {
        try {
            if (product) {
                const { id, name, price, quantity, sku } = product || {};
                const params = {
                    ecommerce: {
                        remove: {
                            products: [
                                {
                                    name,
                                    id,
                                    price: price?.regularPrice?.amount?.value,
                                    quantity,
                                    sku
                                }
                            ]
                        }
                    }
                };
                this.trackEvent('remove_from_cart', params);
            }
        } catch (error) {
            // TODO
        }
    };

    trackingWishlistAction = action => {
        try {
            if (action) {
                let params;
                if (action === 'add') {
                    params = { event: 'add_to_wishlist' };
                    this.trackEvent('add_to_wishlist', params);
                } else {
                    params = { event: 'remove_from_wishlist' };
                    this.trackEvent('remove_from_wishlist', params);
                }
            }
        } catch (error) {
            // TODO
        }
    };

    trackingDowloadApp = () => {
        try {
            const params = { event: 'dowload_app' };
            this.trackEvent('dowload_app', params);
        } catch (error) {
            // TODO
        }
    };

    trackingSubscribe = () => {
        try {
            const params = { event: 'subscribe' };
            this.trackEvent('subscribe', params);
        } catch (error) {
            // TODO
        }
    };

    trackingPurchase = params => {
        try {
            if (params) {
                this.trackEvent('purchase', params);
            }
        } catch (error) {
            // TODO
        }
    };
}
