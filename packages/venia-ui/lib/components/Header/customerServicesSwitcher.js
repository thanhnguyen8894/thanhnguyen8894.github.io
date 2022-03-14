import React, { Fragment } from 'react';
import { shape, string } from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { useCustomerServicesSwitcher } from '@magento/peregrine/lib/talons/Header/useCustomerServicesSwitcher';

//Styles
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './customerServicesSwitcher.css';

//Components
import Image from '@magento/venia-ui/lib/components/Image';
import { images } from '../../constants/images';
import { BrowserPersistence } from '@magento/peregrine/lib/util';

const storage = new BrowserPersistence();

const CUSTOMER_SERVICES = new Map()
    .set('phoneNumber', {
        icon: null,
        value: 'phoneNumber',
        link: 'tel:+966559775497'
    })
    .set('callUs', {
        icon: images.phoneHeaderIcon,
        value: 'callUs',
        link: '/contact-us'
    })
    .set('emailUs', {
        icon: images.mailHeaderIcon,
        value: 'emailUs',
        link: 'mailto:wecare@arabianoud.com.sa'
    })
    .set('sendFb', {
        icon: images.sendIcon,
        value: 'sendFb',
        link: '/contact-us'
    });

const PHONE_NUMBER = {
    sa: '920009692',
    ae: '800683',
    kw: '0096551111056',
    bh: '0097335410099',
    om: '0096871488477',
    pk: '920009692',
    qa: '+97477195777'
};

const CustomerServicesSwitcher = props => {
    const { rtl, isBottom } = props;
    const {
        storeMenuRef,
        storeMenuTriggerRef,
        storeMenuIsOpen,
        handleTriggerClick
    } = useCustomerServicesSwitcher();

    const classes = mergeClasses(defaultClasses, props.classes);
    const storeCodeTwoLetter =
        storage.getItem('store_view_country')?.toLowerCase() || 'sa';

    let menuClassName = storeMenuIsOpen ? classes.menu_open : classes.menu;
    if (props.isBottom) {
        menuClassName += ` ${classes.menuBottom}`;
    }

    const groups = [];

    Array.from(CUSTOMER_SERVICES, ([text, values]) => {
        const { icon, link, value } = values;
        const _phonelink =
            value === 'phoneNumber'
                ? `tel:${PHONE_NUMBER[storeCodeTwoLetter]}`
                : link;
        groups.push(
            <ul className={classes.groupList} key={text}>
                {icon && (
                    <Image
                        classes={{ container: classes.imageContainer }}
                        alt={text}
                        src={icon}
                        width={16}
                        height={16}
                    />
                )}
                <a
                    dir="auto"
                    href={_phonelink}
                    key={text}
                    className={classes.menuItem}
                >
                    {value === 'phoneNumber' ? (
                        <Fragment>{PHONE_NUMBER[storeCodeTwoLetter]}</Fragment>
                    ) : (
                        <FormattedMessage
                            id={`topHeader.${value}`}
                            defaultMessage={`topHeader.${value}`}
                        />
                    )}
                </a>
            </ul>
        );
    });

    return (
        <div
            className={`${classes.root} ${rtl ? classes.rootRtl : ''} ${
                isBottom ? classes.rootInBottom : ''
            }`}
        >
            <button
                className={classes.trigger}
                aria-label={`currentStoreName`}
                onClick={handleTriggerClick}
                ref={storeMenuTriggerRef}
            >
                <FormattedMessage
                    id={'topHeader.customerService'}
                    defaultMessage={'Customer Service'}
                />
            </button>
            <div ref={storeMenuRef} className={menuClassName}>
                <div className={classes.groups}>{groups}</div>
            </div>
        </div>
    );
};

export default CustomerServicesSwitcher;

CustomerServicesSwitcher.propTypes = {
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

CustomerServicesSwitcher.defaultProps = {
    rtl: false,
    isBottom: false
};
