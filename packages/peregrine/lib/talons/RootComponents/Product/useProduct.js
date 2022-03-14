import { useQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useCatalogContext } from '@magento/peregrine/lib/context/catalog';
import _ from 'lodash';

import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from './product.gql';
import { useUserContext } from '@magento/peregrine/lib/context/user';

/**
 * A [React Hook]{@link https://reactjs.org/docs/hooks-intro.html} that
 * controls the logic for the Product Root Component.
 *
 * @kind function
 *
 * @param {object}      props
 * @param {Function}    props.mapProduct - A function for updating products to the proper shape.
 * @param {GraphQLAST}  props.queries.getStoreConfigData - Fetches storeConfig product url suffix using a server query
 * @param {GraphQLAST}  props.queries.getProductQuery - Fetches product using a server query
 *
 * @returns {object}    result
 * @returns {Bool}      result.error - Indicates a network error occurred.
 * @returns {Bool}      result.loading - Indicates the query is in flight.
 * @returns {Bool}      result.product - The product's details.
 */

const attributesField = ['Brands', 'size', 'origins', 'fragrance', 'type'];

export const useProduct = props => {
    const { mapProduct, productId } = props;
    const { formatMessage } = useIntl();
    const [{ isSignedIn: isUserSignedIn }] = useUserContext();

    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const { getProductDetailQuery } = operations;

    const [
        { storeConfig },
        {
            actions: { setPageLoading }
        }
    ] = useAppContext();

    /**
     * walletreward_wallet_status: Enabled wallet feature
     * walletreward_reward_enable: Enabled reward feature
     * walletreward_reward_earn_reward_creating_order_enable_create_order: Enabled reward when creating order
     * walletreward_reward_earn_reward_creating_order_reward_message: Enable reward message when creating order in product detail
     */
    const configShowMessage = useMemo(() => {
        const {
            walletreward_reward_earn_reward_creating_order_enable_create_order: enableCreateOrder,
            walletreward_reward_earn_reward_creating_order_reward_message: rewardMessage,
            walletreward_wallet_status: walletStatus,
            walletreward_reward_enable: rewardEnable
        } = storeConfig || {};

        if (
            walletStatus === '1' &&
            rewardEnable === '1' &&
            rewardMessage === '1' &&
            enableCreateOrder === '1' &&
            isUserSignedIn
        ) {
            return true;
        }
        return false;
    }, [isUserSignedIn, storeConfig]);

    const { error, loading, data } = useQuery(getProductDetailQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        variables: {
            id: productId,
            attrList: attributesField
        }
    });

    const isBackgroundLoading = useMemo(() => {
        return !!data && loading;
    }, [data, loading]);

    const product = useMemo(() => {
        if (!data && loading) {
            // The product isn't in the cache and we don't have a response from GraphQL yet.
            return null;
        }

        // Note: if a product is out of stock _and_ the backend specifies not to
        // display OOS items, the items array will be empty.

        // Only return the product that we queried for.
        const product = data?.productDetail;
        if (_.isNil(product)) return null;
        return mapProduct(product);
    }, [data, loading, mapProduct]);

    const productPrice = useMemo(() => {
        if (product) {
            if (product?.special_price) {
                return product.special_price;
            }
            return product?.price?.regularPrice?.amount?.value;
        }
    }, [product]);

    const productRewardMessage = useMemo(() => {
        if (storeConfig) {
            const {
                walletreward_reward_earn_reward_creating_order_min_order_qty: minOrderQty,
                walletreward_reward_earn_reward_creating_order_min_order_total: minOrderTotal,
                walletreward_reward_earn_reward_creating_order_reward_point: rewardPoint,
                walletreward_reward_earn_reward_creating_order_earn_type: earnType
            } = storeConfig || {};

            const rewartPoint =
                earnType === '0'
                    ? `${rewardPoint} ${formatMessage({
                          id: 'product.sar',
                          defaultMessage: 'SAR'
                      })}`
                    : `${(productPrice * parseFloat(rewardPoint - 1.5)) /
                          100} ${formatMessage({
                          id: 'product.sar',
                          defaultMessage: 'SAR'
                      })}`;

            if (configShowMessage) {
                const message = formatMessage(
                    {
                        id: 'creditWallet.productMessage',
                        defaultMessage: ''
                    },
                    {
                        reward_point: rewartPoint,
                        min_order_qty: minOrderQty,
                        min_order_total: parseFloat(
                            minOrderTotal * 1.15
                        ).toFixed(2)
                    }
                );

                return message;
            }
        }
    }, [configShowMessage, formatMessage, productPrice, storeConfig]);

    // Update the page indicator if the GraphQL query is in flight.
    useEffect(() => {
        setPageLoading(isBackgroundLoading);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [isBackgroundLoading, setPageLoading]);

    return {
        error,
        loading,
        productRewardMessage: '',
        product: !_.isNil(product) ? product : null
    };
};
