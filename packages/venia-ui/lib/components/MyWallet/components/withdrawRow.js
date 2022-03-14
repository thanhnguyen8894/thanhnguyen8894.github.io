import React from 'react';
import { useAppContext } from '@magento/peregrine/lib/context/app';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './withdrawRow.css';

const HistoryRow = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const [{ mobile, tablet }] = useAppContext();

    const { data } = props || {};

    const {
        withdraw_id,
        customer_id,
        credit,
        paypal_email,
        reason,
        status,
        requested_date,
        updated_date
    } = data || {};

    return (
        <li
            className={`${classes.root} ${
                mobile || tablet ? classes.rootMobile : ''
            }`}
        >
            <div className={classes.rowInfor}>
                <div className={classes.textBlock}>
                    <div className={classes.subText}>{withdraw_id}</div>
                </div>
                <div className={classes.textBlock}>
                    <div className={classes.subText}>{`${paypal_email}`}</div>
                </div>
                <div className={classes.textBlock}>
                    <div className={classes.subText}>{`${credit}`}</div>
                </div>
                <div className={classes.textBlock}>
                    <div className={classes.subText}>{`${reason}`}</div>
                </div>
                <div className={classes.textBlock}>
                    <div className={classes.subText}>{`${status}`}</div>
                </div>
                <div className={classes.textBlock}>
                    <div className={classes.subText}>{`${requested_date}`}</div>
                </div>
            </div>
        </li>
    );
};

export default HistoryRow;
