import React, { useMemo, useEffect, useState } from 'react';
import { LogOut } from 'react-feather';
import { FormattedMessage } from 'react-intl';

//Hooks
import { usePrivateAccountMenu } from '@magento/peregrine/lib/talons/AccountInformationPage/usePrivateAccountMenu';
import { useAppContext } from '@magento/peregrine/lib/context/app';

//Styles
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './privateAccountMenu.css';

//Helper/Constants
import { images } from '@magento/venia-ui/lib/constants/images';

//Components
import PrivateAccountMenuItem from './privateAccountMenuItem';
import Icon from '../Icon';

const menuListInitial = [
    {
        id: 1,
        name: 'User Name',
        key: 'userName',
        icon: images.iconUser,
        iconActive: images.iconUserActive,
        active: false
    },
    {
        id: 2,
        name: 'My Orders',
        key: 'myOrders',
        icon: images.iconOrder,
        iconActive: images.iconOrderActive,
        active: false
    },
    {
        id: 3,
        name: 'Credits slips',
        key: 'creditsSlips',
        icon: images.iconCredit,
        iconActive: images.iconCreditActive,
        active: false
    },
    {
        id: 4,
        name: 'My Addresses',
        key: 'myAddresses',
        icon: images.iconLocation,
        iconActive: images.iconLocationActive,
        active: false
    },
    {
        id: 5,
        name: 'My Wish List',
        key: 'myWishlist',
        icon: images.iconWishlist,
        iconActive: images.iconWishlistActive,
        active: false
    },
    {
        id: 6,
        name: 'My Wallet',
        key: 'myWallet',
        icon: images.iconWallet,
        iconActive: images.iconWalletActive,
        active: false
    }
];

const PrivateAccountMenu = props => {
    const { onChangeMenu, idActive, onSignOut, getStoreConfig } = props;
    const [{ mobile, tablet }] = useAppContext();

    //Check enable wallet and show tab wallet in account page
    const { storeConfig } = getStoreConfig || {};
    const { walletreward_wallet_status } = storeConfig || {};
    const _menuList = useMemo(() => {
        const _menuList = [...menuListInitial];
        if (!walletreward_wallet_status || walletreward_wallet_status !== '1') {
            return _menuList.filter(item => item.id !== 6);
        }
        return _menuList;
    }, [walletreward_wallet_status]);

    const [menuList, setMenuList] = useState([..._menuList]);

    const { handleSignOut } = usePrivateAccountMenu({ onSignOut });
    const classes = mergeClasses(defaultClasses, props.classes);

    useEffect(() => {
        if (idActive) {
            checkActiveMenu(idActive);
        }
    }, [idActive]);

    const checkActiveMenu = id => {
        const newMenu = [...menuList];
        newMenu.filter(item => {
            if (item.id === id) {
                item.active = true;
            } else {
                item.active = false;
            }
        });
        setMenuList(newMenu);
    };

    const content = useMemo(() => {
        return menuList.map(item => {
            return (
                <PrivateAccountMenuItem
                    item={item}
                    key={item.id}
                    showEmail={item.id === 1}
                    onChangeMenu={onChangeMenu}
                />
            );
        });
    }, [menuList, onChangeMenu]);

    const signOutButton = (
        <button
            className={classes.signOutButton}
            onClick={handleSignOut}
            type="button"
        >
            <Icon src={LogOut} />
            <FormattedMessage
                id={'accountMenu.signOutButtonText'}
                defaultMessage={'Sign Out'}
            />
        </button>
    );

    return (
        <div className={mobile || tablet ? classes.rootMobile : classes.root}>
            {content}
            {signOutButton}
        </div>
    );
};

export default PrivateAccountMenu;
