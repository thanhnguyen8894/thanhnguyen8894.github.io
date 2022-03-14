import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { func, shape, string } from 'prop-types';

import { useUserContext } from '@magento/peregrine/lib/context/user';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Button from '@magento/venia-ui/lib/components/Button';
import defaultClasses from './errorView.css';

// constant
import { images } from '@magento/venia-ui/lib/constants/images';

const DEFAULT_HEADER = 'Oop!';
const DEFAULT_HEADER_2 = 'The page your’re looking for was not found';
const DEFAULT_BUTTONHOME = 'Return Home';
const DEFAULT_BUTTONACCOUNT = 'My Account';
const DEFAULT_TITLE_TOP =
    'The page you requested was not found, and we have a fine guess why.';
const DEFAULT_TITLE_BOTTOM = 'What can you do?';
const DEFAULT_MESSAGE_TOP_1 =
    'If you typed the URL directly, please make sure the spelling is correct.';
const DEFAULT_MESSAGE_TOP_2 =
    'If you clicked on a link to get here, the link is outdated.';
const DEFAULT_MESSAGE_BOTTOM_1 =
    'Have no fear, help is near! There are many ways you can get back on track with Arabian Store.';
const DEFAULT_MESSAGE_BOTTOM_2 = 'Go back to the previous page.';
const DEFAULT_MESSAGE_BOTTOM_3 =
    'Use the search bar at the top of the page to search for your products.';
const DEFAULT_MESSAGE_BOTTOM_4 = 'Follow these links to get you back on track!';

const ErrorView = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const history = useHistory();
    const [{ mobile, rtl }] = useAppContext();
    const [{ isSignedIn }] = useUserContext();

    const handleGoHome = useCallback(() => {
        history.push('/');
    }, [history]);

    const handleGoAccount = useCallback(() => {
        if (!isSignedIn) {
            history.push('/login');
        } else {
            history.push('/account-information');
        }
    }, [history, isSignedIn]);

    const {
        header = (
            <>
                <h2 className={classes.mainHeader}>
                    <FormattedMessage
                        id={'errorView.header'}
                        defaultMessage={DEFAULT_HEADER}
                    />
                </h2>
                <h2 className={classes.subHeader}>
                    <FormattedMessage
                        id={'errorView.header2'}
                        defaultMessage={DEFAULT_HEADER_2}
                    />
                </h2>
            </>
        ),
        titleTop = (
            <FormattedMessage
                id={'errorView.titleTop'}
                defaultMessage={DEFAULT_TITLE_TOP}
            />
        ),
        titleBottom = (
            <FormattedMessage
                id={'errorView.titleBottom'}
                defaultMessage={DEFAULT_TITLE_BOTTOM}
            />
        ),
        messageTop1 = (
            <FormattedMessage
                id={'errorView.messageTop1'}
                defaultMessage={DEFAULT_MESSAGE_TOP_1}
            />
        ),
        messageTop2 = (
            <FormattedMessage
                id={'errorView.messageTop2'}
                defaultMessage={DEFAULT_MESSAGE_TOP_2}
            />
        ),
        messageBottom1 = (
            <FormattedMessage
                id={'errorView.messageBottom1'}
                defaultMessage={DEFAULT_MESSAGE_BOTTOM_1}
            />
        ),
        messageBottom2 = (
            <FormattedMessage
                id={'errorView.messageBottom2'}
                defaultMessage={DEFAULT_MESSAGE_BOTTOM_2}
            />
        ),
        messageBottom3 = (
            <FormattedMessage
                id={'errorView.messageBottom3'}
                defaultMessage={DEFAULT_MESSAGE_BOTTOM_3}
            />
        ),
        messageBottom4 = (
            <FormattedMessage
                id={'errorView.messageBottom4'}
                defaultMessage={DEFAULT_MESSAGE_BOTTOM_4}
            />
        ),
        buttonHome = (
            <FormattedMessage
                id={'errorView.homeButton'}
                defaultMessage={DEFAULT_BUTTONHOME}
            />
        ),
        buttonAccount = (
            <FormattedMessage
                id={'errorView.accountButton'}
                defaultMessage={DEFAULT_BUTTONACCOUNT}
            />
        ),
        onClick = handleGoHome
    } = props;

    const handleClick = useCallback(() => {
        onClick && onClick();
    }, [onClick]);

    const style = {
        '--backroundImageUrl': `url("${images.errorBackground}")`,
        '--mobileBackgroundImageUrl': `url("${images.errorBackgroundMobile}")`
    };

    return (
        <div
            className={`${classes.root} ${rtl && classes.rootRtl} ${
                mobile ? classes.rootMobile : ''
            }`}
            style={style}
        >
            <div className={classes.content}>
                <div className={classes.header}>{header}</div>
                <div>
                    <p className={classes.title}>{titleTop}</p>
                    <ul className={classes.list}>
                        <li>{messageTop1}</li>
                        <li>{messageTop2}</li>
                    </ul>
                </div>
                <div>
                    <p className={classes.title}>{titleBottom}</p>
                    <ul className={classes.list}>
                        <li>{messageBottom1}</li>
                        <li>{messageBottom2}</li>
                        <li>{messageBottom3}</li>
                        <li>{messageBottom4}</li>
                    </ul>
                </div>
                {/* <p className={classes.message}>{message}</p> */}
                {/* <div className={classes.actionsContainer}>
                    <Button type="button" onClick={handleClick}>
                        {buttonHome}
                    </Button>
                    <Button type="button" onClick={handleGoAccount}>
                        {buttonAccount}
                    </Button>
                </div> */}
            </div>

            {!mobile && (
                <div className={classes.actionsContainer}>
                    <Button
                        className={classes.btnBackHome}
                        type="button"
                        onClick={handleClick}
                    >
                        {buttonHome}
                    </Button>
                </div>
            )}
        </div>
    );
};

ErrorView.propTypes = {
    header: string,
    message: string,
    buttonPrompt: string,
    onClick: func,
    classes: shape({
        root: string,
        content: string,
        errorCode: string,
        header: string,
        message: string,
        actionsContainer: string
    })
};

export default ErrorView;
