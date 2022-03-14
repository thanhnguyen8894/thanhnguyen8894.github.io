import React from 'react';
import { number, shape, string } from 'prop-types';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useCategoryBranch } from '@magento/peregrine/lib/talons/CategoryTree';
import Icon from '../Icon';
import { ChevronRight, ChevronLeft } from 'react-feather';

import { mergeClasses } from '../../classify';
import defaultClasses from './categoryBranch.css';

const Branch = props => {
    const [{ rtl }] = useAppContext();
    const {
        category,
        updateCategory,
        setCategoryId,
        updateParentUrl,
        parentUrl
    } = props;
    const { name } = category;
    const classes = mergeClasses(defaultClasses, props.classes);

    const talonProps = useCategoryBranch({
        category,
        updateCategory,
        setCategoryId,
        updateParentUrl,
        parentUrl
    });
    const { exclude, handleClick } = talonProps;

    const iconArrow = rtl ? ChevronLeft : ChevronRight;

    if (exclude) {
        return null;
    }

    return (
        <li className={classes.root}>
            <button
                className={classes.target}
                type="button"
                onClick={handleClick}
            >
                <div className={classes.container}>
                    <span className={classes.text}>{name}</span>
                    <Icon
                        size={24}
                        src={iconArrow}
                    />
                </div>
            </button>
        </li>
    );
};

export default Branch;

Branch.propTypes = {
    category: shape({
        id: number.isRequired,
        include_in_menu: number,
        name: string.isRequired
    }).isRequired,
    classes: shape({
        root: string,
        target: string,
        text: string
    })
};
