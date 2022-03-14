import React from 'react';
import { useAppContext } from '@magento/peregrine/lib/context/app';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './historyRow.css';

const HistoryRow = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const [{ mobile, tablet }] = useAppContext();

    const { data } = props || {};

    const {
        transaction_id,
        order_id = '',
        customer_id,
        trans_title,
        reward_point,
        credit_get,
        credit_spent,
        trans_date
    } = data || {};

    return (
        <li
            className={`${classes.root} ${
                mobile || tablet ? classes.rootMobile : ''
            }`}
        >
            <div className={classes.rowInfor}>
                <div className={classes.textBlock}>
                    <div className={classes.subText}>{order_id}</div>
                </div>
                <div className={classes.textBlock}>
                    <div className={classes.subText}>{`${trans_title}`}</div>
                </div>
                <div className={classes.textBlock}>
                    <div className={classes.subText}>{`${reward_point}`}</div>
                </div>
                <div className={classes.textBlock}>
                    <div className={classes.subText}>{`${credit_get}`}</div>
                </div>
                <div className={classes.textBlock}>
                    <div className={classes.subText}>{`${credit_spent}`}</div>
                </div>
                <div className={classes.textBlock}>
                    <div className={classes.subText}>{`${trans_date}`}</div>
                </div>
            </div>
        </li>
    );
};

export default HistoryRow;
