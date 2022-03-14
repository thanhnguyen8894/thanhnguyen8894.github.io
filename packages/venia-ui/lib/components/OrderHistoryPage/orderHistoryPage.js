import React, { useMemo, useEffect } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { AlertCircle as AlertCircleIcon } from 'react-feather';
import { shape, string } from 'prop-types';

import { useToasts } from '@magento/peregrine/lib/Toasts';
import OrderHistoryContextProvider from '@magento/peregrine/lib/talons/OrderHistoryPage/orderHistoryContext';
import { useOrderHistoryPage } from '@magento/peregrine/lib/talons/OrderHistoryPage/useOrderHistoryPage';
import { useAppContext } from '@magento/peregrine/lib/context/app';

import { mergeClasses } from '../../classify';
import Icon from '../Icon';
import LoadingIndicator from '../LoadingIndicator';

import defaultClasses from './orderHistoryPage.css';
import OrderRow from './orderRow';
import Button from '../Button';

const errorIcon = (
    <Icon
        src={AlertCircleIcon}
        attrs={{
            width: 18
        }}
    />
);

const OrderHistoryPage = props => {
    const talonProps = useOrderHistoryPage();
    const {
        errorMessage,
        loadMoreOrders,
        handleReset,
        isBackgroundLoading,
        isLoadingWithoutData,
        orders,
        pageInfo,
        searchText
    } = talonProps;
    const [{ mobile, tablet }] = useAppContext();
    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();
    const PAGE_TITLE = formatMessage({
        id: 'orderHistoryPage.pageTitleText',
        defaultMessage: 'MY ORDERS'
    });

    const classes = mergeClasses(defaultClasses, props.classes);

    const orderRows = useMemo(() => {
        return (
            orders &&
            orders.map(order => {
                return <OrderRow key={order.id} order={order} />;
            })
        );
    }, [orders]);

    const pageContents = useMemo(() => {
        if (isLoadingWithoutData) {
            return <LoadingIndicator />;
        } else if (!isBackgroundLoading && !orders.length) {
            return (
                <h3 className={classes.emptyHistoryMessage}>
                    <FormattedMessage
                        id={'orderHistoryPage.emptyDataMessage'}
                        defaultMessage={"You don't have any orders yet."}
                    />
                </h3>
            );
        } else {
            return <ul className={classes.orderHistoryTable}>{orderRows}</ul>;
        }
    }, [
        classes.emptyHistoryMessage,
        classes.orderHistoryTable,
        isBackgroundLoading,
        isLoadingWithoutData,
        orderRows,
        orders.length
    ]);

    const loadMoreButton = loadMoreOrders ? (
        <Button
            classes={{ root_lowPriority: classes.checkAll }}
            disabled={isBackgroundLoading || isLoadingWithoutData}
            onClick={loadMoreOrders}
            priority="low"
        >
            <FormattedMessage
                id={'orderRow.checkAll'}
                defaultMessage={'Check all orders'}
            />
        </Button>
    ) : null;

    useEffect(() => {
        if (errorMessage) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: errorMessage,
                dismissable: true,
                timeout: 10000
            });
        }
    }, [addToast, errorMessage]);

    return (
        <OrderHistoryContextProvider>
            <div
                className={`${classes.root} ${
                    mobile || tablet ? classes.rootMobile : ''
                }`}
            >
                <div className={classes.main}>
                    <h1 className={classes.heading}>{PAGE_TITLE}</h1>
                    <h4 className={classes.subTitle}>
                        <FormattedMessage
                            id={'orderRow.wishlistPageText'}
                            defaultMessage={
                                'You can check the list of your orders'
                            }
                        />
                    </h4>
                    {pageContents}
                    {loadMoreButton}
                </div>
            </div>
        </OrderHistoryContextProvider>
    );
};

export default OrderHistoryPage;

OrderHistoryPage.propTypes = {
    classes: shape({
        root: string,
        heading: string,
        emptyHistoryMessage: string,
        orderHistoryTable: string,
        search: string,
        searchButton: string,
        submitIcon: string,
        loadMoreButton: string
    })
};
