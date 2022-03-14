import React from 'react';

import defaultClasses from './button.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

const Button = props => {
    const classes = mergeClasses(defaultClasses, props.classes);

    const { icon, title = '', onClick, containerStyle = {} } = props || {};

    return (
        <div className={classes.root} style={containerStyle} onClick={onClick}>
            {icon ? (
                <img src={icon} className={classes.icon} alt={'icon'} />
            ) : null}
            <div className={classes.title}>{title}</div>
        </div>
    );
};

export default Button;
