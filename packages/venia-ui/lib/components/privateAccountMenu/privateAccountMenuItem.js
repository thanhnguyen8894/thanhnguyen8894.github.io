import React from 'react';
import { ReactSVG } from 'react-svg';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { useIntl } from 'react-intl';
import defaultClasses from './privateAccountMenuItem.css';
import { useUserContext } from '@magento/peregrine/lib/context/user';

const PrivateAccountMenuItem = props => {
    const [{ currentUser }] = useUserContext();
    const { formatMessage } = useIntl();

    const classes = mergeClasses(defaultClasses, props.classes);
    const { item, showEmail, onChangeMenu } = props;
    const { email, firstname, lastname } = currentUser;

    const onRedirectMenu = item => {
        onChangeMenu(item.id);
    };

    return (
        <div
            className={`${classes.root}
            ${showEmail ? classes.rootHasEmail : ''}
            ${item.active ? classes.active : ''}`}
            onClick={() => onRedirectMenu(item)}
        >
            <div className={classes.image}>
                <ReactSVG
                    src={item.active ? item.iconActive : item.icon}
                    className={classes.icon}
                    alt={'icon'}
                />
            </div>
            <div className={classes.text}>
                <div>
                    {item.id === 1
                        ? firstname + ' ' + lastname
                        : formatMessage({
                              id: `accountInformationPage.${item.key}`,
                              defaultMessage: item.name
                          })}
                </div>
                {showEmail && <div className={classes.email}>{email}</div>}
            </div>
        </div>
    );
};

export default PrivateAccountMenuItem;
