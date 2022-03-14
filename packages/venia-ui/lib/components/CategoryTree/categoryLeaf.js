import React, { useMemo } from 'react';
import { func, shape, string } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useCategoryLeaf } from '@magento/peregrine/lib/talons/CategoryTree';

import { mergeClasses } from '../../classify';
import { Link, resourceUrl } from '../../drivers';
import defaultClasses from './categoryLeaf.css';

const Leaf = props => {
    const { category, onNavigate, parentUrl } = props;
    const { name, url_key, url_suffix, viewAll } = category;
    const classes = mergeClasses(defaultClasses, props.classes);
    const { handleClick } = useCategoryLeaf({ onNavigate });
    const destination = useMemo(() => {
        if (!viewAll) {
            return resourceUrl(`${parentUrl}/${url_key}${url_suffix}`);
        } else if (parentUrl === '') {
            resourceUrl(`${url_key}${url_suffix}`);
        } else return resourceUrl(`${parentUrl}${url_suffix}`);
    }, [viewAll, parentUrl, url_key, url_suffix])

    const leafLabel =
        viewAll ? (
            <FormattedMessage
                id={'categoryLeaf.allLabel'}
                defaultMessage={'All {name}'}
                values={{
                    name: name
                }}
            />
        ) : (
            name
        );

    return (
        <li className={classes.root}>
            <Link
                className={classes.target}
                to={destination}
                onClick={handleClick}
            >
                <span className={classes.text}>{leafLabel}</span>
            </Link>
        </li>
    );
};

export default Leaf;

Leaf.propTypes = {
    category: shape({
        name: string.isRequired,
        url_path: string.isRequired
    }).isRequired,
    classes: shape({
        root: string,
        target: string,
        text: string
    }),
    onNavigate: func.isRequired
};
