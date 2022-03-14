import React from 'react';
import { FormattedMessage } from 'react-intl';

import defaultClasses from './transHistories.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

import HistoryRow from './historyRow';
import WithdrawRow from './withdrawRow';

const TransHistoriesPage = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const { data = [], isTransHistory } = props || {};

    const transHeader = (
        <div className={classes.header}>
            <label className={classes.headerTitle}>
                <FormattedMessage
                    id={'transHistoryOrderId'}
                    defaultMessage={'Order ID'}
                />
            </label>
            <label className={classes.headerTitle}>
                <FormattedMessage
                    id={'transHistoryDetails'}
                    defaultMessage={'Details'}
                />
            </label>
            <label className={classes.headerTitle}>
                <FormattedMessage
                    id={'transHistoryRewardPoint'}
                    defaultMessage={'Reward Point'}
                />
            </label>
            <label className={classes.headerTitle}>
                <FormattedMessage
                    id={'transHistoryEarn'}
                    defaultMessage={'Credit Earn'}
                />
            </label>
            <label className={classes.headerTitle}>
                <FormattedMessage
                    id={'transHistorySpent'}
                    defaultMessage={'Credit Spent'}
                />
            </label>
            <label className={classes.headerTitle}>
                <FormattedMessage
                    id={'transHistoryDate'}
                    defaultMessage={'Transaction date'}
                />
            </label>
        </div>
    );

    const withdrawHeader = (
        <div className={classes.headerWithdraw}>
            <label className={classes.headerTitle}>
                <FormattedMessage
                    id={'transWithdrawId'}
                    defaultMessage={'ID'}
                />
            </label>
            <label className={classes.headerTitle}>
                <FormattedMessage
                    id={'transWithdrawPaypalEmail'}
                    defaultMessage={'Paypal Email'}
                />
            </label>
            <label className={classes.headerTitle}>
                <FormattedMessage
                    id={'transWithdrawCredit'}
                    defaultMessage={'Credit'}
                />
            </label>
            <label className={classes.headerTitle}>
                <FormattedMessage
                    id={'transWithdrawReason'}
                    defaultMessage={'Reason'}
                />
            </label>
            <label className={classes.headerTitle}>
                <FormattedMessage
                    id={'transWithdrawStatus'}
                    defaultMessage={'Status'}
                />
            </label>
            <label className={classes.headerTitle}>
                <FormattedMessage
                    id={'transWithdrawDate'}
                    defaultMessage={'Requested Date'}
                />
            </label>
        </div>
    );

    return (
        <div className={classes.root}>
            {isTransHistory ? transHeader : withdrawHeader}
            {data &&
                data.map((item, index) => {
                    return isTransHistory ? (
                        <HistoryRow key={`history_row_${index}`} data={item} />
                    ) : (
                        <WithdrawRow
                            key={`withdraw_row_${index}`}
                            data={item}
                        />
                    );
                })}
        </div>
    );
};

export default TransHistoriesPage;
