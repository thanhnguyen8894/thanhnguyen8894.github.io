import React from 'react';
import { shape, string } from 'prop-types';

import { useStoreSwitcher } from '@magento/peregrine/lib/talons/Header/useStoreSwitcher';

//Icons
import { Globe } from 'react-feather';

//Styles
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './storeSwitcher.css';

//Components
import SwitcherItem from './switcherItem';
import Image from '@magento/venia-ui/lib/components/Image';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { images } from '../../constants/images';

const StoreSwitcher = props => {
    const { rtl, isBottom } = props;
    const {
        availableStores,
        currentGroupName,
        currentStoreName,
        handleSwitchStore,
        storeGroups,
        storeMenuRef,
        storeMenuTriggerRef,
        storeMenuIsOpen,
        handleTriggerClick,
        nextStoreCode,
        nextStoreName
    } = useStoreSwitcher();

    const classes = mergeClasses(defaultClasses, props.classes);
    let menuClassName = storeMenuIsOpen ? classes.menu_open : classes.menu;
    if (rtl) {
        menuClassName += ` ${classes.rtl}`;
    }
    if (isBottom) {
        menuClassName += ` ${classes.menuBottom}`;
    }

    if (!availableStores || availableStores.size <= 1) return null;

    const groups = [];
    const hasOnlyOneGroup = storeGroups.size === 1;

    storeGroups.forEach((group, key) => {
        const stores = [];
        group.forEach(({ storeGroupName, storeName, isCurrent, code }) => {
            let label;
            if (hasOnlyOneGroup) {
                label = `${storeName}`;
            } else {
                label = `${storeGroupName} - ${storeName}`;
            }
            stores.push(
                <li key={code} className={classes.menuItem}>
                    <SwitcherItem
                        active={isCurrent}
                        onClick={handleSwitchStore}
                        option={code}
                    >
                        {label}
                    </SwitcherItem>
                </li>
            );
        });

        groups.push(
            <ul className={classes.groupList} key={key}>
                {stores}
            </ul>
        );
    });

    let triggerLabel;
    if (hasOnlyOneGroup) {
        triggerLabel = `${currentStoreName}`;
    } else {
        triggerLabel = `${currentGroupName} - ${currentStoreName}`;
    }

    return (
        <div className={`${classes.root} ${rtl ? classes.rootRtl : ''}`}>
            <button
                className={classes.trigger}
                aria-label={currentStoreName}
                onClick={() => handleSwitchStore(nextStoreCode)}
                // onClick={handleTriggerClick}
                ref={storeMenuTriggerRef}
            >
                <Icon src={Globe} size={15} />
                {nextStoreName || triggerLabel}
            </button>
            {/* <div ref={storeMenuRef} className={menuClassName}>
                <div className={classes.groups}>{groups}</div>
            </div> */}
        </div>
    );
};

export default StoreSwitcher;

StoreSwitcher.propTypes = {
    classes: shape({
        groupList: string,
        groups: string,
        menu: string,
        menu_open: string,
        menuItem: string,
        root: string,
        trigger: string
    })
};
