import React, { Fragment, Suspense } from 'react';
import { bool, shape, string } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, Route, resourceUrl } from '@magento/venia-drivers';

import { useHeader } from '@magento/peregrine/lib/talons/Header/useHeader';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

// constant
import { images } from '@magento/venia-ui/lib/constants/images.js';

// styles
import defaultClasses from './middleHeaderBar.css';

// components
import Image from '@magento/venia-ui/lib/components/Image';
import Button from '@magento/venia-ui/lib/components/Button';
import SearchBar from '@magento/venia-ui/lib/components/SearchBar';
import CartTrigger from './cartTrigger';
import NavTrigger from './navTrigger';
import FavoriteTrigger from './favoriteTrigger';
import AccountTrigger from './accountTrigger';
import SearchTrigger from './searchTrigger';

const MiddleHeaderBar = props => {
    const { mobile, tablet, rtl } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const {
        handleSearchTriggerClick,
        hasBeenOffline,
        isOnline,
        isPageLoading,
        isSearchOpen,
        searchRef,
        searchTriggerRef
    } = useHeader();

    

    let rootClasses = `${classes.root} ${tablet ? classes.tablet : ''} ${
        mobile ? classes.mobile : ''
    }`;
    rootClasses += isSearchOpen ? ` ${classes.open}` : ` ${classes.closed}`;

    const searchBarFallback = (
        <div className={classes.searchFallback} ref={searchRef}>
            <div className={classes.input}>
                <div className={classes.loader} />
            </div>
        </div>
    );

    

    const widthLogo = () => {
        if (mobile) {
            return 110;
        }
        if (tablet) {
            return 150;
        }
        return 175;
    };
    const heightLogo = () => {
        if (mobile) {
            return 40;
        }
        if (tablet) {
            return 50;
        }
        return 70;
    };

    const renderContentMobile = () => {
        return (
            <Fragment>
                <div className={classes.middleHeaderColumn}>
                    <NavTrigger />
                    <SearchTrigger
                        ref={searchTriggerRef}
                        onClick={handleSearchTriggerClick}
                    />
                </div>
                <div className={classes.middleHeaderColumn}>
                    <Link to="/" className={classes.imageWrapper}>
                        <Image
                            classes={{ image: classes.LogoImage }}
                            alt="Logo"
                            width={widthLogo()}
                            height={heightLogo()}
                            src={images.logoMobile}
                        />
                    </Link>
                </div>
                <div className={classes.middleHeaderColumnLeft}>
                    <div className={classes.middleHeaderColumn}>
                        <CartTrigger
                            mobile={mobile}
                            tablet={tablet}
                            rtl={rtl}
                        />
                        <AccountTrigger />
                    </div>
                </div>
            </Fragment>
        );
    };

    const renderContentDesktop = () => {
        return (
            <Fragment>
                <div className={classes.middleHeaderColumn}>
                    <Link to="/" className={classes.imageWrapper}>
                        <Image
                            classes={{ image: classes.LogoImage }}
                            alt="Logo"
                            width={widthLogo()}
                            height={heightLogo()}
                            src={images.logoTablet}
                        />
                    </Link>
                </div>
                <div className={classes.middleHeaderColumnLeft}>
                    <Suspense fallback={searchBarFallback}>
                        <Route>
                            <SearchBar
                                ref={searchRef}
                                placeholder={formatMessage({
                                    id: 'middleHeader.searchTextPlaceholder',
                                    defaultMessage: 'What are you looking for'
                                })}
                            />
                        </Route>
                    </Suspense>
                    <div className={classes.middleHeaderColumn}>
                        <AccountTrigger />
                        <FavoriteTrigger tablet={tablet} />
                        <CartTrigger
                            mobile={mobile}
                            tablet={tablet}
                            rtl={rtl}
                        />
                    </div>
                </div>
            </Fragment>
        );
    };

    const renderContentTablet = () => {
        return (
            <Fragment>
                <div className={classes.middleHeaderColumn}>
                    <Link to="/" className={classes.imageWrapper}>
                        <Image
                            classes={{ image: classes.LogoImage }}
                            alt="Logo"
                            width={widthLogo()}
                            height={heightLogo()}
                            src={
                                mobile
                                    ? images.logoMobile
                                    : tablet
                                    ? images.logoTablet
                                    : images.logoSite
                            }
                        />
                    </Link>
                </div>
                <div className={classes.middleHeaderColumnLeft}>
                    <Suspense fallback={searchBarFallback}>
                        <Route>
                            <SearchBar
                                ref={searchRef}
                                placeholder={formatMessage({
                                    id: 'middleHeader.searchTextPlaceholder',
                                    defaultMessage: 'What are you looking for'
                                })}
                            />
                        </Route>
                    </Suspense>
                    <div className={classes.middleHeaderColumn}>
                        <CartTrigger
                            mobile={mobile}
                            tablet={tablet}
                            rtl={rtl}
                        />
                        <FavoriteTrigger tablet={tablet} />
                    </div>
                </div>
            </Fragment>
        );
    };

    return (
        <div className={rootClasses}>
            <div className={classes.content}>
                {mobile
                    ? renderContentMobile()
                    : tablet
                    ? renderContentTablet()
                    : renderContentDesktop()}
            </div>
            {isSearchOpen && mobile && (
                <Suspense fallback={searchBarFallback}>
                    <Route>
                        <SearchBar
                            ref={searchRef}
                            placeholder={formatMessage({
                                id: 'middleHeader.searchTextPlaceholder',
                                defaultMessage: 'What are you looking for'
                            })}
                        />
                    </Route>
                </Suspense>
            )}
        </div>
    );
};

MiddleHeaderBar.propTypes = {
    classes: shape({
        root: string
    }),
    mobile: bool,
    tablet: bool,
    rtl: bool
};

export default MiddleHeaderBar;
