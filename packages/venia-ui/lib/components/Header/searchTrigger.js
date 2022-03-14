import React from 'react';
import { shape, string } from 'prop-types';
import { useIntl } from 'react-intl';

import Image from '../Image';

import { mergeClasses } from '../../classify';
import defaultClasses from './searchTrigger.css';
import { useSearchTrigger } from '@magento/peregrine/lib/talons/Header/useSearchTrigger';
import { images } from '../../constants/images';

const SearchTrigger = React.forwardRef((props, ref) => {
    const { active, onClick, hasLabel } = props;

    const talonProps = useSearchTrigger({
        onClick
    });
    const { handleClick } = talonProps;
    const { formatMessage } = useIntl();

    const classes = mergeClasses(defaultClasses, props.classes);

    const searchClass = active ? classes.open : classes.root;

    const searchText = formatMessage({
        id: 'searchTrigger.search',
        defaultMessage: 'Search'
    });

    return (
        <button
            className={searchClass}
            aria-label={searchText}
            onClick={handleClick}
            ref={ref}
        >
            <Image
                classes={{ image: classes.searchImage }}
                alt="Search"
                width={18}
                height={18}
                src={images.searchIcon}
            />

            {/* {hasLabel && <span className={classes.label}>{searchText}</span>} */}
        </button>
    );
});

SearchTrigger.propTypes = {
    classes: shape({
        root: string,
        open: string
    })
};

export default SearchTrigger;

SearchTrigger.defaultProps = {
    hasLabel: true
};
