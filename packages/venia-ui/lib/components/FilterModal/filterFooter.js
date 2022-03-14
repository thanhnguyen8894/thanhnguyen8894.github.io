import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { bool, func, shape, string } from 'prop-types';

import _ from 'lodash';

import { mergeClasses } from '../../classify';
import Button from '../Button';
import defaultClasses from './filterFooter.css';

const FilterFooter = props => {
    const {
        handleReset,
        applyFilters,
        filterState,
        orginalFilterState
    } = props;
    const classes = mergeClasses(defaultClasses, props.classes);

    const isChangeFilters = useMemo(() => {
        return _.isEqual(filterState, orginalFilterState);
    }, [filterState, orginalFilterState]);

    const isHadFilter = !!filterState.size;

    return (
        <div className={classes.root}>
            <Button
                disabled={!isHadFilter}
                onClick={handleReset}
                priority="high"
                classes={{ root_highPriority: classes.resetButton }}
            >
                <FormattedMessage
                    id={'filterModal.action'}
                    defaultMessage={'Clear all'}
                />
            </Button>
            <Button
                onClick={applyFilters}
                priority="high"
                disabled={isChangeFilters}
                classes={{ root_highPriority: classes.applyButton }}
            >
                <FormattedMessage
                    id={'filterFooter.results'}
                    defaultMessage={'See Results'}
                />
            </Button>
        </div>
    );
};

FilterFooter.propTypes = {
    applyFilters: func.isRequired,
    classes: shape({
        root: string
    }),
    isOpen: bool
};

export default FilterFooter;
