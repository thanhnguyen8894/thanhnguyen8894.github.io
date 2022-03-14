import React, { Fragment } from 'react';
import { shape, string } from 'prop-types';

import { useAppContext } from '@magento/peregrine/lib/context/app';

import { useHeader } from '@magento/peregrine/lib/talons/Header/useHeader';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './header.css';
import TopHeaderBar from './topHeaderBar';
import MiddleHeaderBar from './middleHeaderBar';
import MegaMenuWrapper from './megaMenuWrapper';

const Header = props => {
    const { isSearchOpen } = useHeader();

    const [{ mobile, tablet, rtl }] = useAppContext();

    const classes = mergeClasses(defaultClasses, props.classes);
    const rootClass = isSearchOpen ? classes.open : classes.closed;
    const rootClasses = `${rootClass} ${mobile ? classes.rootMobile : ''} ${
        tablet ? classes.rootTablet : ''
    }`;
    return (
        <Fragment>
            <header className={rootClasses}>
                <TopHeaderBar mobile={mobile} rtl={rtl} />
                <MiddleHeaderBar mobile={mobile} tablet={tablet} rtl={rtl} />
                {!mobile && <MegaMenuWrapper tablet={tablet} rtl={rtl} />}
            </header>
        </Fragment>
    );
};

Header.propTypes = {
    classes: shape({
        closed: string,
        logo: string,
        open: string,
        rootMobile: string,
        rootTablet: string
    })
};

export default Header;
