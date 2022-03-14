import React from 'react';
import { FormattedMessage } from 'react-intl';

import defaultClasses from './walletCount.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

const WalletCountPage = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const { walletCredit = 0 } = props || {};

    return (
        <div className={classes.profileGroup}>
            <div className={classes.group}>
                <h3 className={classes.groupTitle}>
                    <FormattedMessage
                        id={'myWallet.wallet'}
                        defaultMessage={'Wallet'}
                    />
                </h3>
            </div>
            <div className={classes.profileContent}>
                <div className={classes.profileContentLeft}>
                    <div className={classes.walletTitle}>
                        <FormattedMessage
                            id={'myWallet.walletCredit'}
                            defaultMessage={'Wallet Credit'}
                        />
                        <h3
                            className={classes.walletValue}
                        >{`SAR ${walletCredit}`}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletCountPage;
