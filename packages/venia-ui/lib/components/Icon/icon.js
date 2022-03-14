import React from 'react';
import { any, number, shape, string } from 'prop-types';

import { mergeClasses } from '../../classify';
import defaultClasses from './icon.css';

const Icon = props => {
    // destructure `propClasses` to exclude it from `restProps`
    const {
        attrs,
        classes: propClasses,
        size,
        customColor,
        src: Component,
        ...restProps
    } = props;
    const { width, ...restAttrs } = attrs || {};
    const classes = mergeClasses(defaultClasses, propClasses);

    const classIcon = () => {
        return [`${classes.root} ${customColor}`];
    };

    return (
        <span className={classIcon()} {...restProps}>
            <Component
                className={classes.icon}
                size={size || width}
                {...restAttrs}
            />
        </span>
    );
};

export default Icon;

Icon.propTypes = {
    attrs: shape({}),
    classes: shape({
        icon: string,
        root: string
    }),
    size: number,
    src: any,
    customColor: string
};
