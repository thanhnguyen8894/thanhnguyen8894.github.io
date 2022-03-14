import React from 'react';
import { shape, string, bool } from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Link } from '@magento/venia-drivers';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

// style
import defaultClasses from './topHeaderBar.css';

// components
import StoreSwitcher from './storeSwitcher';
import StoreTrigger from './storeTrigger';
import CurrencySwitcher from './currencySwitcher';
import CustomerServicesSwitcher from './customerServicesSwitcher';

const TopHeaderBar = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const { mobile, rtl } = props;

    return (
        <div className={`${classes.root} ${mobile ? classes.rootMobile : ''}`}>
            <div className={classes.content}>
                <div className={classes.topHeaderColumn}>
                    <StoreTrigger mobile={mobile} show rtl={rtl} />
                    <CustomerServicesSwitcher rtl={rtl} />
                </div>
                {!mobile && (
                    <div className={classes.topHeaderOneColumn}>
                        <StoreSwitcher rtl={rtl} />
                        {/* <CurrencySwitcher /> */}
                    </div>
                )}
            </div>
        </div>
    );
};

TopHeaderBar.propTypes = {
    classes: shape({
        root: string
    }),
    mobile: bool
};

export default TopHeaderBar;
