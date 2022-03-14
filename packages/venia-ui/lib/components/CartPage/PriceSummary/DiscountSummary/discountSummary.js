import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import Price from '@magento/venia-ui/lib/components/Price';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

const MINUS_SYMBOL = '-';

const DEFAULT_AMOUNT = {
    currency: 'USD',
    value: 0
};

/**
 * Reduces discounts array into a single amount.
 *
 * @param {Array} discounts
 */
const getDiscount = (discounts = []) => {
    // discounts from data can be null
    if (!discounts || !discounts.length) {
        return DEFAULT_AMOUNT;
    } else {
        return {
            currency: discounts[0].amount.currency,
            value: discounts.reduce(
                (acc, discount) => acc + discount.amount.value,
                0
            )
        };
    }
};

/**
 * A component that renders the discount summary line item.
 *
 * @param {Object} props.classes
 * @param {Object} props.data fragment response data
 */
const DiscountSummary = props => {
    const classes = mergeClasses({}, props.classes);
    const discount = getDiscount(props.data);

    return discount.value ? (
        <Fragment>
            {props.data.map((item, index) => {
                return (
                    <Fragment key={index}>
                        <span className={classes.lineItemLabel}>
                            <div>{item?.label}</div>
                        </span>
                        <span className={classes.price}>
                            {'-'}
                            <Price
                                value={item?.amount?.value}
                                currencyCode={item?.amount?.currency || 'SAR'}
                                decimal
                            />
                        </span>
                    </Fragment>
                );
            })}
        </Fragment>
    ) : null;
};

export default DiscountSummary;
