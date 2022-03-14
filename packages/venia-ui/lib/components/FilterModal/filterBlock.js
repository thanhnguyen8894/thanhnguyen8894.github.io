import React, { useMemo } from 'react';
import { Form } from 'informed';
import { Plus, Minus } from 'react-feather';
import { arrayOf, shape, string } from 'prop-types';
import { useIntl } from 'react-intl';

//Hooks
import { useFilterBlock } from '@magento/peregrine/lib/talons/FilterModal';
import setValidator from '@magento/peregrine/lib/validators/set';

//Style
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './filterBlock.css';

//Components
import FilterList from './FilterList';
import FilterPrice from './FilterPrice/filterPrice';
import Icon from '@magento/venia-ui/lib/components/Icon';

const MIN = 0;
const MAX = 10000;
const TITLE_FILTER_BLOCK = [
    {
        value: 'price',
        label: 'translateFE.filter.price'
    },
    {
        value: 'category',
        label: 'translateFE.filter.category'
    },
    {
        value: 'brand',
        label: 'translateFE.sort.manufacturer'
    }
];

const FilterBlock = props => {
    const { filterApi, filterState, group, items, name } = props;
    const { formatMessage } = useIntl();
    const talonProps = useFilterBlock();
    const { handleClick, isExpanded } = talonProps;
    const iconSrc = isExpanded ? Minus : Plus;
    const classes = mergeClasses(defaultClasses, props.classes);
    const listClass = isExpanded
        ? classes.list_expanded
        : classes.list_collapsed;

    const isPriceBlock = name && (name === 'Price' || name === 'السعر');

    //TODO: should remove later when BE can translate text
    const _name = useMemo(() => {
        return TITLE_FILTER_BLOCK.find(item =>
            item.value.includes(name.toLowerCase())
        )?.label;
    }, [name]);

    const showingName = useMemo(() => {
        return _name
            ? formatMessage({
                  id: _name,
                  defaultMessage: _name
              })
            : name;
    }, [_name, formatMessage, name]);

    const minPrice =
        (isPriceBlock &&
            items &&
            items[0].value &&
            items[0].value.split('_') &&
            items[0].value.split('_')[0]) ||
        MIN;
    const maxPrice =
        (isPriceBlock &&
            items &&
            items[items.length - 1].value &&
            items[items.length - 1].value.split('_') &&
            items[items.length - 1].value.split('_')[1]) ||
        MAX;

    const defaultMinMaxPrice = [parseInt(minPrice), Math.round(parseInt(maxPrice) * 1.15)];

    return (
        <li className={classes.root}>
            <button
                className={classes.trigger}
                onClick={handleClick}
                type="button"
            >
                <span className={classes.header}>
                    <span className={classes.name}>{showingName}</span>
                    <Icon src={iconSrc} />
                </span>
            </button>
            <Form
                className={`${listClass} ${
                    isPriceBlock ? classes.formPrices : ''
                }`}
            >
                {isPriceBlock ? (
                    <FilterPrice
                        group={group}
                        filterApi={filterApi}
                        items={items}
                        filterState={filterState}
                        defaultMinMaxPrice={defaultMinMaxPrice}
                    />
                ) : (
                    <FilterList
                        filterApi={filterApi}
                        filterState={filterState}
                        group={group}
                        items={items}
                    />
                )}
            </Form>
        </li>
    );
};

export default FilterBlock;

FilterBlock.propTypes = {
    classes: shape({
        header: string,
        list_collapsed: string,
        list_expanded: string,
        name: string,
        root: string,
        trigger: string
    }),
    filterApi: shape({}).isRequired,
    filterState: setValidator,
    group: string.isRequired,
    items: arrayOf(shape({})),
    name: string.isRequired
};
