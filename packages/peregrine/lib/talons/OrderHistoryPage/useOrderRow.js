import { useCallback, useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';

import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from './orderRow.gql';

/**
 * @function
 *
 * @param {Object} props
 * @param {Array<Object>} props.items Collection of items in Order
 * @param {OrderRowOperations} props.operations GraphQL queries for the Order Row Component
 *
 * @returns {OrderRowTalonProps}
 */
export const useOrderRow = props => {
    const { items } = props;
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const {
        getProductThumbnailsQuery,
        getConfigurableThumbnailSource
        // getCustomerInvoicePdf
    } = operations;

    const urlKeys = useMemo(() => {
        return items.map(item => item.product_url_key).sort();
    }, [items]);

    const { data, loading } = useQuery(getProductThumbnailsQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        variables: {
            urlKeys
        }
    });

    const { data: configurableThumbnailSourceData } = useQuery(
        getConfigurableThumbnailSource,
        {
            fetchPolicy: 'cache-and-network'
        }
    );

    // const [getCustomerInvoice, { loading: getInvoiceLoading }] = useMutation(
    //     getCustomerInvoicePdf,
    //     { fetchPolicy: 'no-cache' }
    // );

    const configurableThumbnailSource = useMemo(() => {
        if (configurableThumbnailSourceData) {
            return configurableThumbnailSourceData.storeConfig
                .configurable_thumbnail_source;
        }
    }, [configurableThumbnailSourceData]);

    const imagesData = useMemo(() => {
        if (data) {
            // Images data is taken from simple product or from configured variant and assigned to item sku
            const mappedImagesData = {};
            items.forEach(item => {
                const product = data.products.items.find(
                    element => item.product_url_key === element.url_key
                );
                if (
                    configurableThumbnailSource === 'itself' &&
                    product.variants &&
                    product.variants.length > 0
                ) {
                    const foundVariant = product.variants.find(variant => {
                        return variant.product.sku === item.product_sku;
                    });
                    mappedImagesData[item.product_sku] = foundVariant.product;
                } else {
                    mappedImagesData[item.product_sku] = product;
                }
            });
            const arr = Object.keys(mappedImagesData).map(
                k => mappedImagesData[k]
            );
            return arr;
        } else {
            return [];
        }
    }, [data, items, configurableThumbnailSource]);

    const [isOpen, setIsOpen] = useState(false);

    const handleContentToggle = useCallback(() => {
        setIsOpen(currentValue => !currentValue);
    }, []);

    // Dowload invoice
    const base64toBlob = data => {
        // Cut the prefix `data:application/pdf;base64` from the raw base 64
        const base64WithoutPrefix = data.substr(
            'data:application/pdf;base64,'.length
        );

        const bytes = atob(base64WithoutPrefix);
        let length = bytes.length;
        let out = new Uint8Array(length);

        while (length--) {
            out[length] = bytes.charCodeAt(length);
        }

        return new Blob([out], { type: 'application/pdf' });
    };

    function downloadBase64File(contentBase64, fileName) {
        // const linkSource = `data:application/pdf;base64,${contentBase64}`;
        const downloadLink = document.createElement('a');
        document.body.appendChild(downloadLink);

        downloadLink.href = contentBase64;
        downloadLink.target = '_self';
        downloadLink.download = fileName;
        downloadLink.click();
    }

    // const onDownloadInvoice = useCallback(async number => {
    //     try {
    //         const response = await getCustomerInvoice({
    //             variables: {
    //                 orderNumber: number
    //             }
    //         });

    //         const { data } = response || {};
    //         const { customerInvoicePdf } = data || {};
    //         const { content, file_name } = customerInvoicePdf || {};

    //         if (content && file_name) {
    //             const blob = base64toBlob(content);
    //             const url = URL.createObjectURL(blob);
    //             downloadBase64File(url, file_name);
    //             alert(i18n.t('accountPage.downloadMessage'));
    //         }
    //     } catch (error) {
    //         // TODO
    //     }
    // }, []);

    return {
        // isLoading: loading || getInvoiceLoading,
        isLoading: loading,
        imagesData,
        isOpen,
        // onDownloadInvoice,
        handleContentToggle,
        orderDetailData: data
    };
};

/**
 * JSDoc type definitions
 */

/**
 * GraphQL operations for the Order Row Component
 *
 * @typedef {Object} OrderRowOperations
 *
 * @property {GraphQLAST} getProductThumbnailsQuery The query used to get product thumbnails of items in the Order.
 *
 * @see [`orderRow.gql.js`]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/OrderHistoryPage/orderRow.gql.js}
 * for queries used in Venia
 */

/**
 * Props data to use when rendering a collapsed image gallery
 *
 * @typedef {Object} OrderRowTalonProps
 *
 * @property {Object} imagesData Images data with thumbnail URLs to render.
 * @property {Boolean} isOpen Boolean which represents if a row is open or not
 * @property {Function} handleContentToggle Callback to toggle isOpen value
 */
