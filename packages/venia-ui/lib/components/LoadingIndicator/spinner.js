import React from 'react';
import { shape, string } from 'prop-types';
import defaultClasses from './spinner.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { Loader as LoaderIcon } from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';

const Spinner = props => {
    const classes = mergeClasses(defaultClasses, props.classes);

    return (
        <div className={`${classes.root} ${classes.rootExtend}`}>
            <Icon
                src={LoaderIcon}
                size={24}
                classes={{ root: classes.indicator }}
            />
        </div>
    );
};

Spinner.propTypes = {
    classes: shape({
        rootExtend: string
    }),
};

export default Spinner;

