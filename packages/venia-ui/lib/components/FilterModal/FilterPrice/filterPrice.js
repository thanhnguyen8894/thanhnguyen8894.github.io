import React, {
    useState,
    Fragment,
    useCallback,
    useEffect,
    useMemo
} from 'react';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { useAppContext } from '@magento/peregrine/lib/context/app';

import defaultClasses from './filterPrice.css';
import { getTrackBackground, Range } from 'react-range';
import { useIntl } from 'react-intl';

const FilterPrice = props => {
    const { filterApi, filterState, group, items, defaultMinMaxPrice } = props;
    const { toggleItem } = filterApi;
    const [{ rtl, storeConfig }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    const [values, setValues] = useState(defaultMinMaxPrice);

    const handleToggle = useCallback(
        values => {
            const value = `${values[0]}_${values[1]}`;
            const title = `${values[0]}-${values[1]}`;
            const data = {
                title,
                value
            };
            toggleItem({ group, item: data });
        },
        [toggleItem] // eslint-disable-line react-hooks/exhaustive-deps
    );

    const buttonSelect = props => {
        return (
            <div
                {...props}
                style={{
                    ...props.style
                }}
                className={classes.buttonSelect}
            />
        );
    };

    const rangeTrack = (props, children, values, rtl) => {
        return (
            <div className={classes.track}>
                <div
                    ref={props.ref}
                    className={classes.trackChildren}
                    style={{
                        background: getTrackBackground({
                            values,
                            colors: ['#CCC', '#F77E2E', '#CCC'],
                            min: defaultMinMaxPrice[0],
                            max: defaultMinMaxPrice[1],
                            rtl
                        })
                    }}
                >
                    {children}
                </div>
            </div>
        );
    };

    useEffect(() => {
        if (filterState) {
            const data = filterState.values().next().value;
            if (data && data.value) {
                const currentValue =
                    (typeof data.value === 'string' && data.value.split('_')) ||
                    [];
                setValues([currentValue[0], currentValue[1]]);
            }
        } else {
            setValues(defaultMinMaxPrice);
        }
    }, [filterState]); // eslint-disable-line react-hooks/exhaustive-deps

    const currencyCode = useMemo(() => {
        return formatMessage({
            id: `currency.${storeConfig?.default_display_currency_code ||
                'SAR'}`,
            defaultMessage: `${storeConfig?.default_display_currency_code ||
                'SAR'}`
        });
    }, [storeConfig]);

    return (
        <Fragment>
            <Range
                min={defaultMinMaxPrice[0]}
                max={defaultMinMaxPrice[1]}
                step={1}
                values={values}
                rtl={rtl}
                onChange={values => setValues(values)}
                onFinalChange={values => handleToggle(values)}
                renderThumb={({ props }) => buttonSelect(props)}
                renderTrack={({ props, children }) =>
                    rangeTrack(props, children, values, rtl)
                }
            />
            <div className={classes.priceBlock}>
                <div>{`${values[0]} ${currencyCode}`}</div>
                <div>{`${values[1]} ${currencyCode}`}</div>
            </div>
        </Fragment>
    );
};

export default FilterPrice;
