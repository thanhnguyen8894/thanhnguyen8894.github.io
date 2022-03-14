import React, { useCallback } from 'react';
import { shape, string } from 'prop-types';
import { X as Remove } from 'react-feather';

import { mergeClasses } from '../../../classify';
import Icon from '../../Icon';
import Trigger from '../../Trigger';
import defaultClasses from './currentFilter.css';

const CurrentFilter = props => {
    const { group, item, removeItem, onRemove } = props;
    const classes = mergeClasses(defaultClasses, props.classes);

    const handleClick = useCallback(() => {
        removeItem({ group, item });
        if (typeof onRemove === 'function') {
            onRemove(group, item);
        }
    }, [group, item, onRemove, removeItem]);

    return (
        <span className={classes.root}>
            <span className={classes.text}>{item.title}</span>
            <Trigger action={handleClick}>
                <Icon size={14} src={Remove} />
            </Trigger>
        </span>
    );
};

export default CurrentFilter;

CurrentFilter.propTypes = {
    classes: shape({
        root: string
    })
};
