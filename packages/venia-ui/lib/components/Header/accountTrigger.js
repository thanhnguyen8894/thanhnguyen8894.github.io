import React, { Fragment, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shape, string } from 'prop-types';
import { AlertCircle as AlertCircleIcon, X as Xicon } from 'react-feather';

import { useToasts } from '@magento/peregrine';
import { useAccountTrigger } from '@magento/peregrine/lib/talons/Header/useAccountTrigger';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { useAccountPrivatePage } from '@magento/peregrine/lib/talons/AccountInformationPage/useAccountPrivatePage';
import { useAppContext } from '@magento/peregrine/lib/context/app';

import AccountInformationPageOperations from '../AccountInformationPage/accountInformationPage.gql.js';
import AccountChip from '../AccountChip';
import PrivateAccountMenu from '../privateAccountMenu';

import defaultClasses from './accountTrigger.css';
import Icon from '../Icon';
import Portal from '../Portal/portal.js';
import LoadingIndicator from '../LoadingIndicator/indicator.js';

/**
 * The AccountTrigger component is the call to action in the site header
 * that toggles the AccountMenu dropdown.
 *
 * @param {Object} props
 * @param {Object} props.classes - CSS classes to override element styles.
 */

const errorIcon = (
    <Icon
        src={AlertCircleIcon}
        attrs={{
            width: 18
        }}
    />
);

const AccountTrigger = props => {
    const talonProps = useAccountTrigger();
    const {
        handleLinkClick,
        onChangeMenu,
        isIdActiveMenu,
        isOpen,
        handleClose
    } = talonProps;

    const [{ rtl, storeConfig }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);

    const rootClass = rtl ? classes.modal : classes.modalRtl;
    const rootOpenClass = rtl ? classes.modal_open : classes.modal_open_rtl;
    const modalClass = isOpen ? rootOpenClass : rootClass;

    const { formatMessage } = useIntl();
    const buttonAriaLabel = formatMessage({
        id: 'accountTrigger.ariaLabel',
        defaultMessage: 'Toggle My Account Menu'
    });

    const { handleSignOut, errorsMessage } = useAccountPrivatePage({
        ...AccountInformationPageOperations
    });
    const [, { addToast }] = useToasts();

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

    const accountContent = (
        <Portal>
            <aside className={modalClass}>
                <div className={classes.body}>
                    <div className={classes.header}>
                        <h2 className={classes.headerTitle}>
                            <FormattedMessage
                                id={'accountMenu.accountMenu'}
                                defaultMessage={'Account menu'}
                            />
                        </h2>
                        <button
                            className={classes.buttonClose}
                            onClick={handleClose}
                        >
                            <Icon
                                src={Xicon}
                                attrs={{
                                    width: 24
                                }}
                            />
                        </button>
                    </div>
                    <PrivateAccountMenu
                        onChangeMenu={onChangeMenu}
                        idActive={isIdActiveMenu}
                        onSignOut={handleSignOut}
                        getStoreConfig={storeConfig}
                    />
                </div>
            </aside>
        </Portal>
    );

    return (
        <Fragment>
            <React.Suspense fallback={<LoadingIndicator />}>
                <button
                    aria-label={buttonAriaLabel}
                    className={classes.link}
                    onClick={handleLinkClick}
                >
                    <AccountChip
                        fallbackText={formatMessage({
                            id: 'accountTrigger.buttonFallback',
                            defaultMessage: 'Sign In'
                        })}
                        shouldIndicateLoading={true}
                        hasLabel={false}
                    />
                </button>
                {accountContent}
            </React.Suspense>
        </Fragment>
    );
};

export default AccountTrigger;

AccountTrigger.propTypes = {
    classes: shape({
        root: string,
        root_open: string,
        trigger: string
    })
};
