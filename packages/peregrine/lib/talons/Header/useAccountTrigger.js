import { useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useDropdown } from '@magento/peregrine/lib/hooks/useDropdown';
import { useAppContext } from '@magento/peregrine/lib/context/app';

const DRAWER_NAME = 'account';
/**
 * The useAccountTrigger talon complements the AccountTrigger component.
 *
 * @returns {Object}    talonProps
 * @returns {Boolean}   talonProps.accountMenuIsOpen - Whether the menu that this trigger toggles is open or not.
 * @returns {Function}  talonProps.setAccountMenuIsOpen  - Set the value of accoutMenuIsOpen.
 * @returns {Ref}       talonProps.accountMenuRef - A React ref to the menu that this trigger toggles.
 * @returns {Ref}       talonProps.accountMenuTriggerRef - A React ref to the trigger element itself.
 * @returns {Function}  talonProps.handleTriggerClick - A function for handling when the trigger is clicked.
 */
export const useAccountTrigger = () => {
    const history = useHistory();
    const [{ isSignedIn }, { setAccountMenuActive }] = useUserContext();
    const [
        { mobile, tablet, drawer },
        { closeDrawer, toggleDrawer }
    ] = useAppContext();

    const [isIdActiveMenu, setIsIdActiveMenu] = useState(0);
    const isOpen = drawer === DRAWER_NAME;

    const {
        elementRef: accountMenuRef,
        expanded: accountMenuIsOpen,
        setExpanded: setAccountMenuIsOpen,
        triggerRef: accountMenuTriggerRef
    } = useDropdown();

    const handleTriggerClick = useCallback(() => {
        // Toggle the Account Menu.
        setAccountMenuIsOpen(isOpen => !isOpen);
    }, [setAccountMenuIsOpen]);

    const isTabletMobile = useMemo(() => {
        return mobile || tablet;
    }, [mobile, tablet]);

    const handleLinkClick = useCallback(async () => {
        if (!isSignedIn) {
            history.push('/login');
        } else {
            await setAccountMenuActive(1);
            if (isTabletMobile) {
                toggleDrawer(DRAWER_NAME);
            } else {
                history.push('/account-information');
            }
        }
    }, [
        history,
        isSignedIn,
        isTabletMobile,
        setAccountMenuActive,
        toggleDrawer
    ]);

    const handleClose = useCallback(() => {
        closeDrawer();
    }, [closeDrawer]);

    const onChangeMenu = async id => {
        await setAccountMenuActive(id);
        setIsIdActiveMenu(id);
        history.push('/account-information');
        handleClose();
    };

    return {
        accountMenuIsOpen,
        accountMenuRef,
        accountMenuTriggerRef,
        setAccountMenuIsOpen,
        handleTriggerClick,
        handleLinkClick,
        onChangeMenu,
        isIdActiveMenu,
        isOpen,
        handleClose
    };
};
