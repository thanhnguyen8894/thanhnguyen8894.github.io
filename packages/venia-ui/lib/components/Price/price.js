import React, { Fragment } from 'react';
import { number, string, shape } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import patches from '@magento/peregrine/lib/util/intlPatches';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { getTranslateCurrency } from '@magento/peregrine/lib/util/common';

/**
 * The **Price** component is used anywhere a price needs to be displayed.
 *
 * Formatting of prices and currency symbol selection is handled entirely by the ECMAScript Internationalization API available in modern browsers.
 *
 * A [polyfill][] is required for any JavaScript runtime that does not have [Intl.NumberFormat.prototype.formatToParts][].
 *
 * [polyfill]: https://www.npmjs.com/package/intl
 * [Intl.NumberFormat.prototype.formatToParts]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts
 */

const Price = props => {
    const [{ rtl }] = useAppContext();
    const { value, currencyCode, classes, decimal = true } = props;
    const parts = patches.toParts.call(
        new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currencyCode || 'SAR',
            maximumFractionDigits: 2
        }),
        value || 0
    );

    const children = parts.map((part, i) => {
        const partClass = classes[part.type];
        const key = `${i}-${part.type}-${part.value}`;
        if (!decimal) {
            if (part.type != 'fraction' && part.type != 'decimal') {
                return (
                    <Fragment key={key}>
                        {part.type != 'currency' && (
                            <span className={partClass}>{part.value}</span>
                        )}
                    </Fragment>
                );
            } else return;
        } else {
            return (
                <Fragment key={key}>
                    {part.type != 'currency' && (
                        <span className={partClass}>{part.value}</span>
                    )}
                </Fragment>
            );
        }
    });

    return (
        <div style={{ direction: rtl ? 'rtl' : 'ltr' }}>
            {children}{' '}
            {<FormattedMessage id={`currency.${currencyCode}`} defaultMessage={`${currencyCode}`} />}
        </div>
    );
};

Price.propTypes = {
    /**
     * Class names to use when styling this component
     */
    classes: shape({
        currency: string,
        integer: string,
        decimal: string,
        fraction: string
    }),
    /**
     * The numeric price
     */
    value: number.isRequired,
    /**
     * A string with any of the currency code supported by Intl.NumberFormat
     */
    currencyCode: string.isRequired
};

Price.defaultProps = {
    classes: {}
};

export default Price;
