import React from 'react';
import { shape, string } from 'prop-types';

import { useCurrencySwitcher } from '@magento/peregrine/lib/talons/Header/useCurrencySwitcher';

//Styles
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './currencySwitcher.css';

//Constants
import { images } from '@magento/venia-ui/lib/constants/images';

//Components
import SwitcherItem from './switcherItem';
import CurrencySymbol from '@magento/venia-ui/lib/components/CurrencySymbol';
import Image from '@magento/venia-ui/lib/components/Image';

const CurrencySwitcher = props => {
    const {
        handleSwitchCurrency,
        currentCurrencyCode,
        availableCurrencies,
        currencyMenuRef,
        currencyMenuTriggerRef,
        currencyMenuIsOpen,
        handleTriggerClick
    } = useCurrencySwitcher();

    const { rtl, isBottom } = props;

    const classes = mergeClasses(defaultClasses, props.classes);
    let menuClassName = currencyMenuIsOpen ? classes.menu_open : classes.menu;
    if (isBottom) {
        menuClassName += ` ${classes.menuBottom}`;
    }

    const currencySymbol = {
        currency: classes.symbol
    };

    if (!availableCurrencies || availableCurrencies.length === 1) return null;

    const currencies = availableCurrencies.map(code => {
        return (
            <li key={code} className={classes.menuItem}>
                <SwitcherItem
                    active={code === currentCurrencyCode}
                    onClick={handleSwitchCurrency}
                    option={code}
                >
                    <CurrencySymbol
                        classes={currencySymbol}
                        currencyCode={code}
                        currencyDisplay={'narrowSymbol'}
                    />
                    {code}
                </SwitcherItem>
            </li>
        );
    });

    return (
        <div className={`${classes.root} ${rtl ? classes.rootRtl : ''}`}>
            <button
                className={classes.trigger}
                aria-label={currentCurrencyCode}
                onClick={handleTriggerClick}
                ref={currencyMenuTriggerRef}
            >
                <span className={classes.label}>{currentCurrencyCode}</span>
                <Image
                    alt="icon down"
                    src={images.downIcon}
                    width={15}
                    height={15}
                />
            </button>
            <div ref={currencyMenuRef} className={menuClassName}>
                <ul>{currencies}</ul>
            </div>
        </div>
    );
};

export default CurrencySwitcher;

CurrencySwitcher.propTypes = {
    classes: shape({
        root: string,
        trigger: string,
        menu: string,
        menu_open: string,
        menuItem: string,
        symbol: string
    })
};

CurrencySwitcher.defaultProps = {
    rtl: false,
    isBottom: false
};
