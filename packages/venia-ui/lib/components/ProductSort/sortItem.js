import React, { useCallback } from 'react';
import { Check } from 'react-feather';
import { bool, func, shape, string } from 'prop-types';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Icon from '@magento/venia-ui/lib/components/Icon/icon';
import defaultClasses from './sortItem.css';

const SortItem = props => {
    const { active, onClick, sortItem } = props;
    const classes = mergeClasses(defaultClasses, props.classes);

    const handleClick = useCallback(() => {
        onClick(sortItem);
    }, [sortItem, onClick]);

    const activeIcon = active ? <Icon size={20} src={Check} /> : null;

    return (
        <button className={classes.root} onClick={handleClick}>
            <span className={classes.content}>
                <span className={classes.text}>
                    {sortItem.label}
                </span>
                {activeIcon}
            </span>
        </button>
    );
};

SortItem.propTypes = {
    active: bool,
    classes: shape({
        content: string,
        root: string,
        text: string
    }),
    onClick: func
};

export default SortItem;
