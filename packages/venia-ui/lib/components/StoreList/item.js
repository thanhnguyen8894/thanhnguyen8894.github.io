import React from 'react';
import { mergeClasses } from '../../classify';
import defaultClasses from './item.css';
import { FormattedMessage } from 'react-intl';

const ItemMap = props => {
    const { data, index } = props;
    const classes = mergeClasses(defaultClasses, props.classes);

    const {
        name = '',
        address = '',
        latitude,
        longitude,
        phone = '',
        work_time = ''
    } = data || {};

    return (
        <div
            key={`${name}`}
            className={classes.card}
            onClick={() => props.onClick(latitude, longitude)}
        >
            <div className={classes.item_header}>{`${index + 1}. ${name}`}</div>

            <div className={classes.rowView}>
                <span className={classes.labelView}>
                    <FormattedMessage
                        id={'storeList.address'}
                        defaultMessage={'Default'}
                    />
                </span>
                <span className={classes.valueView}>{address}</span>
            </div>

            <div className={classes.rowView}>
                <span className={classes.labelView}>
                    <FormattedMessage
                        id={'storeList.phone'}
                        defaultMessage={'Default'}
                    />
                </span>
                <span className={classes.valueView}>{phone}</span>
            </div>

            <div className={classes.rowView}>
                <span className={classes.labelView}>
                    <FormattedMessage
                        id={'storeList.workingTime'}
                        defaultMessage={'Default'}
                    />
                </span>
                <span className={classes.valueView}>{work_time}</span>
            </div>
        </div>
    );
};
export default ItemMap;
