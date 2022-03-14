import React from 'react';
import { shape, string } from 'prop-types';
import Image from '../Image';

import { useFavoriteTrigger } from '@magento/peregrine/lib/talons/Header/useFavoriteTrigger';

import { mergeClasses } from '../../classify';
import defaultClasses from './favoriteTrigger.css';
import { images } from '../../constants/images';

const FavoriteTrigger = React.forwardRef((props, ref) => {
    const { active } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const searchClass = active ? classes.open : classes.root;

    const talonProps = useFavoriteTrigger();
    const { handleLinkClick, itemCount } = talonProps;

    const handleClick = () => {
        handleLinkClick();
    };

    const itemCountDisplay = itemCount > 99 ? '99+' : itemCount;
    const maybeShowItemCounter = itemCount ? (
        <span className={classes.counter}>{itemCountDisplay}</span>
    ) : null;

    return (
        <button
            className={searchClass}
            aria-label="Favorite"
            onClick={handleClick}
            ref={ref}
        >
            <Image
                classes={{ image: classes.heartImage }}
                alt="Heart"
                width={20}
                height={20}
                src={images.heartIcon}
            />
            {maybeShowItemCounter}
        </button>
    );
});

FavoriteTrigger.propTypes = {
    classes: shape({
        root: string,
        open: string
    })
};

export default FavoriteTrigger;
