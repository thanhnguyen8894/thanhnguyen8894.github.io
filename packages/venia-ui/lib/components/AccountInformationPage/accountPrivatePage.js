import React, { useEffect, useState } from 'react';
import { AlertCircle as AlertCircleIcon } from 'react-feather';
import { mergeClasses } from '../../classify';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useUserContext } from '@magento/peregrine/lib/context/user';

import { useAccountPrivatePage } from '@magento/peregrine/lib/talons/AccountInformationPage/useAccountPrivatePage';
import { useToasts } from '@magento/peregrine';

import PrivateAccountMenu from '../privateAccountMenu';
import AccountInformationPage from './accountInformationPage';
import OrderHistoryPage from '../OrderHistoryPage';
import MyAddress from '../MyAddress';
import WishlistPage from '../WishlistPage';
import AccountInformationPageOperations from './accountInformationPage.gql.js';
import CreditSlipsPage from '../CreditSlipsPage';
import MyWalletPage from '../MyWallet';

import defaultClasses from './accountPrivatePage.css';
import Icon from '../Icon';

const errorIcon = (
    <Icon
        src={AlertCircleIcon}
        attrs={{
            width: 18
        }}
    />
);

const AccountPrivatePage = props => {
    const [{ mobile, tablet }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);
    const {
        handleSignOut,
        errorsMessage,
        getStoreConfig
    } = useAccountPrivatePage({
        ...AccountInformationPageOperations
    });
    const [{ idAccountActiveMenuPrivate }] = useUserContext();
    const [, { addToast }] = useToasts();
    const [idActive, setIdActive] = useState(1);

    useEffect(() => {
        if (errorsMessage) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: errorsMessage,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [addToast, errorsMessage]);

    useEffect(() => {
        if (idAccountActiveMenuPrivate) {
            setIdActive(idAccountActiveMenuPrivate);
        }
    }, [idAccountActiveMenuPrivate]);

    const onChangeMenu = id => {
        setIdActive(id);
    };

    return (
        <div className={mobile || tablet ? classes.rootMobile : classes.root}>
            <div className={mobile || tablet ? classes.privateMenuMobile : ''}>
                <PrivateAccountMenu
                    onChangeMenu={onChangeMenu}
                    idActive={idActive}
                    onSignOut={handleSignOut}
                    getStoreConfig={getStoreConfig}
                />
            </div>
            <div className={classes.contentAccount}>
                {idActive === 1 && (
                    <AccountInformationPage
                        onTransHistoryPress={() => onChangeMenu(6)}
                    />
                )}
                {idActive === 2 && <OrderHistoryPage />}
                {idActive === 3 && <CreditSlipsPage />}
                {idActive === 4 && <MyAddress />}
                {idActive === 5 && <WishlistPage />}
                {idActive === 6 && (
                    <MyWalletPage getStoreConfig={getStoreConfig} />
                )}
            </div>
        </div>
    );
};

export default AccountPrivatePage;
