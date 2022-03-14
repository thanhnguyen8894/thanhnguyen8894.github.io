import React, { useCallback, Suspense, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { array, func, shape, string } from 'prop-types';

import { useMediaQuery } from 'react-responsive';

import { useToasts } from '@magento/peregrine';
import { useApp } from '@magento/peregrine/lib/talons/App/useApp';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { BrowserPersistence } from '@magento/peregrine/lib/util';
import MetaTag from '@magento/venia-ui/lib/components/MetaTag';

import globalCSS from '../../index.css';
import { HeadProvider, StoreTitle } from '../Head';
import Main from '../Main';
import Mask from '../Mask';
import Routes from '../Routes';
import ToastContainer from '../ToastContainer';
import Icon from '../Icon';

import {
    AlertCircle as AlertCircleIcon,
    CloudOff as CloudOffIcon,
    Wifi as WifiIcon
} from 'react-feather';

const Navigation = React.lazy(() => import('../Navigation'));

const OnlineIcon = <Icon src={WifiIcon} attrs={{ width: 18 }} />;
const OfflineIcon = <Icon src={CloudOffIcon} attrs={{ width: 18 }} />;
const ErrorIcon = <Icon src={AlertCircleIcon} attrs={{ width: 18 }} />;

const storage = new BrowserPersistence();
const storeCode = storage.getItem('store_view_code');

const App = props => {
    const { markErrorHandled, renderError, unhandledErrors } = props;
    const { formatMessage } = useIntl();

    // Start to catch devices
    const [
        ,
        {
            actions: { setMobile, setTablet, setSubDesktop, setRtl }
        }
    ] = useAppContext();

    // Mobile mode
    const handleMediaMobileChange = matches => {
        setMobile(matches);
    };
    useMediaQuery({ maxWidth: 767 }, undefined, handleMediaMobileChange);
    // Tablet mode
    const handleMediaTabletChange = matches => {
        setTablet(matches);
    };
    useMediaQuery(
        { minDeviceWidth: 768, maxWidth: 1024 },
        undefined,
        handleMediaTabletChange
    );
    // Sub Desktop mode
    const handleMediaSubDesktopChange = matches => {
        setSubDesktop(matches);
    };
    useMediaQuery(
        { minDeviceWidth: 1025, maxWidth: 1850 },
        undefined,
        handleMediaSubDesktopChange
    );

    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minDeviceWidth: 768, maxWidth: 1024 });
    const isSubDesktop = useMediaQuery({
        minDeviceWidth: 1025,
        maxWidth: 1850
    });
    useEffect(() => {
        setMobile(isMobile);
        setTablet(isTablet);
        setSubDesktop(isSubDesktop);
        const isRtl = storeCode
            ? typeof storeCode === 'string' && storeCode.includes('ar')
            : true;
        setRtl(isRtl);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMobile, isTablet, isSubDesktop]);
    /// end catch devices

    const [, { addToast }] = useToasts();

    const ERROR_MESSAGE = formatMessage({
        id: 'app.errorUnexpected',
        defaultMessage: 'Sorry! An unexpected error occurred.'
    });

    const handleIsOffline = useCallback(() => {
        addToast({
            type: 'error',
            icon: OfflineIcon,
            message: formatMessage({
                id: 'app.errorOffline',
                defaultMessage:
                    'You are offline. Some features may be unavailable.'
            }),
            timeout: 3000
        });
    }, [addToast, formatMessage]);

    const handleIsOnline = useCallback(() => {
        addToast({
            type: 'info',
            icon: OnlineIcon,
            message: formatMessage({
                id: 'app.infoOnline',
                defaultMessage: 'You are online.'
            }),
            timeout: 3000
        });
    }, [addToast, formatMessage]);

    const handleError = useCallback(
        (error, id, loc, handleDismissError) => {
            const errorToastProps = {
                icon: ErrorIcon,
                message: `${ERROR_MESSAGE}\nDebug: ${id} ${loc}`,
                onDismiss: remove => {
                    handleDismissError();
                    remove();
                },
                timeout: 15000,
                type: 'error'
            };

            addToast(errorToastProps);
        },
        [ERROR_MESSAGE, addToast]
    );

    // Font Area
    const newStyle = document.createElement('style');
    const fontName = 'DroidKufi';
    const fontURL = `${
        process.env.MAGENTO_BACKEND_URL
    }media/fonts/DroidKufi-Regular.otf`;
    newStyle.appendChild(
        document.createTextNode(
            '\
    @font-face {\
        font-family: ' +
                fontName +
                ";\
        src: url('" +
                fontURL +
                "') format('opentype');\
    }\
    "
        )
    );
    document.head.appendChild(newStyle);
    // End Font Area

    const talonProps = useApp({
        handleError,
        handleIsOffline,
        handleIsOnline,
        markErrorHandled,
        renderError,
        unhandledErrors
    });

    const { hasOverlay, handleCloseDrawer, toggleLayout } = talonProps;

    toggleLayout();

    if (renderError) {
        return (
            <HeadProvider>
                <StoreTitle />
                <Main isMasked={true} />
                <Mask isActive={true} />
                <ToastContainer />
            </HeadProvider>
        );
    }

    return (
        <HeadProvider>
            <StoreTitle />
            <Main isMasked={hasOverlay}>
                {/* <MetaTag /> */}
                <Routes />
            </Main>
            <Mask isActive={hasOverlay} dismiss={handleCloseDrawer} />
            <Suspense fallback={null}>
                <Navigation />
            </Suspense>
            <ToastContainer />
        </HeadProvider>
    );
};

App.propTypes = {
    markErrorHandled: func.isRequired,
    renderError: shape({
        stack: string
    }),
    unhandledErrors: array
};

App.globalCSS = globalCSS;

export default App;
