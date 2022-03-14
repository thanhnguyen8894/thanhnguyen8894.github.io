import React, { useMemo, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { array, arrayOf, shape, string } from 'prop-types';
import { X as CloseIcon } from 'react-feather';
import { useFilterModal } from '@magento/peregrine/lib/talons/FilterModal';

import { mergeClasses } from '../../classify';
import Icon from '../Icon';
import { Portal } from '../Portal';
import CurrentFilters from './CurrentFilters';
import FilterBlock from './filterBlock';
import FilterFooter from './filterFooter';
import defaultClasses from './filterModal.css';
import { useAppContext } from '@magento/peregrine/lib/context/app';

/**
 * A view that displays applicable and applied filters.
 *
 * @param {Object} props.filters - filters to display
 */
const FilterModal = props => {
    const { filters } = props;
    const talonProps = useFilterModal({ filters });
    const [{ rtl }] = useAppContext();
    const {
        filterApi,
        filterItems,
        filterNames,
        filterState,
        orginalFilterState,
        handleApply,
        handleClose,
        handleReset,
        isOpen
    } = talonProps;

    const classes = mergeClasses(defaultClasses, props.classes);
    const rootClass = rtl ? classes.root : classes.rootLtr;
    const rootOpenClass = rtl ? classes.root_open : classes.root_open_Ltr;
    const modalClass = isOpen ? rootOpenClass : rootClass;

    const filtersList = useMemo(
        () =>
            Array.from(filterItems, ([group, items]) => {
                const blockState = filterState.get(group);
                const groupName = filterNames.get(group);
                const hasValues = items && items.length > 0;

                return (
                    <Fragment key={group}>
                        {hasValues && (
                            <FilterBlock
                                filterApi={filterApi}
                                filterState={blockState}
                                group={group}
                                items={items}
                                name={groupName}
                            />
                        )}
                    </Fragment>
                );
            }),
        [filterApi, filterItems, filterNames, filterState]
    );

    return (
        <Portal>
            <aside className={modalClass}>
                <div className={classes.body}>
                    <div className={classes.header}>
                        <h2 className={classes.headerTitle}>
                            <FormattedMessage
                                id={'filterModal.headerTitle'}
                                defaultMessage={'Filters'}
                            />
                        </h2>
                        <button onClick={handleClose}>
                            <Icon src={CloseIcon} />
                        </button>
                    </div>
                    <CurrentFilters
                        filterApi={filterApi}
                        filterNames={filterNames}
                        filterState={filterState}
                    />
                    <ul className={classes.blocks}>{filtersList}</ul>
                </div>
                {/* hasFilters={!!filterState.size} */}
                <FilterFooter
                    handleReset={handleReset}
                    applyFilters={handleApply}
                    filterState={filterState}
                    orginalFilterState={orginalFilterState}
                />
            </aside>
        </Portal>
    );
};

FilterModal.propTypes = {
    classes: shape({
        action: string,
        blocks: string,
        body: string,
        header: string,
        headerTitle: string,
        root: string,
        root_open: string
    }),
    filters: arrayOf(
        shape({
            attribute_code: string,
            items: array
        })
    )
};

export default FilterModal;
