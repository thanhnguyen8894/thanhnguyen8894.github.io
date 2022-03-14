import React, { useMemo, useCallback } from 'react';
import { shape, string, object } from 'prop-types';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useDropdown } from '@magento/peregrine/lib/hooks/useDropdown';
import ArrowDropdown from '@magento/venia-ui/venia-static/icons/arrow_drop_down.png';

import { mergeClasses } from '../../classify';
import SortItem from './sortItem';
import defaultClasses from './productSort.css';
import Button from '../Button';
import Image from '../Image';

const ProductSort = props => {
    const [{ mobile }] = useAppContext();
    const classes = mergeClasses(defaultClasses);
    const { availableSortMethods, sortProps } = props;
    const { currentSort, setSort } = sortProps;
    const { elementRef, expanded, setExpanded } = useDropdown();

    // click event for menu items
    const handleItemClick = useCallback(
        sortAttribute => {
            setSort({
                ...currentSort,
                sortText: sortAttribute.label,
                sortAttribute: sortAttribute.value,
            });
            setExpanded(false);
        },
        [setExpanded, setSort]
    );

    const sortElements = useMemo(() => {
        // should be not render item in collapsed mode.
        if (!expanded) {
            return null;
        }
        
        const itemElements = availableSortMethods.map( sortItem => {
            const { label, value } = sortItem;
            const isActive = currentSort.sortAttribute === value;
            return (
                <li key={label} className={classes.menuItem}>
                    <SortItem
                        sortItem={sortItem}
                        active={isActive}
                        onClick={handleItemClick}
                    />
                </li>
            );
        });

        return (
            <div className={classes.menu}>
                <ul>{itemElements}</ul>
            </div>
        );
    }, [
        availableSortMethods,
        classes.menu,
        classes.menuItem,
        currentSort.sortAttribute,
        expanded,
        handleItemClick
    ]);

    // expand or collapse on click
    const handleSortClick = () => {
        setExpanded(!expanded);
    };

    return (
        <div
            ref={elementRef}
            className={mobile ? classes.rootMobile : classes.root}
        >
            <Button
                priority={'low'}
                classes={{
                    root_lowPriority: classes.sortButton,
                    content: classes.contentButton
                }}
                onClick={handleSortClick}
            >
                {currentSort.sortText}
                <Image
                    alt="arrow drop down"
                    classes={{
                        image: classes.arrowDropdown,
                    }}
                    src={ArrowDropdown}
                    height={20}
                    width={20}
                />
            </Button>
            {sortElements}
        </div>
    );
};

ProductSort.propTypes = {
    classes: shape({
        menuItem: string,
        menu: string,
        root: string,
        rootMobile: string,
        sortButton: string,
        arrowDropdown: string
    }),
    sortProps: object
};

export default ProductSort;
