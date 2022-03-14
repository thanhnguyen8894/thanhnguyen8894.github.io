import React from 'react';
import { shape, string, bool } from 'prop-types';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './megaMenuWrapper.css';

import MegaMenu from '../MegaMenu';

const MegaMenuWrapper = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const { tablet, rtl } = props;
    return (
        <div className={classes.root}>
            <MegaMenu tablet={tablet} rtl={rtl} />
        </div>
    );
};

MegaMenuWrapper.propTypes = {
    classes: shape({
        root: string
    }),
    tablet: bool,
    rtl: bool
};

export default MegaMenuWrapper;
