import { useCallback } from 'react';
import { useDropdown } from '@magento/peregrine/lib/hooks/useDropdown';

/**
 *
 * @param {*} props
 * @returns {{}}
 */
export const useCustomerServicesSwitcher = (props = {}) => {
    const {
        elementRef: storeMenuRef,
        expanded: storeMenuIsOpen,
        setExpanded: setStoreMenuIsOpen,
        triggerRef: storeMenuTriggerRef
    } = useDropdown();

    const handleTriggerClick = useCallback(() => {
        // Toggle Stores Menu.
        setStoreMenuIsOpen(isOpen => !isOpen);
    }, [setStoreMenuIsOpen]);

    return {
        storeMenuRef,
        storeMenuTriggerRef,
        storeMenuIsOpen,
        handleTriggerClick
    };
};
