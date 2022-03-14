import React from 'react';
import { FormattedMessage } from 'react-intl';
import { bool, node, shape, string } from 'prop-types';
import { useAppContext } from '@magento/peregrine/lib/context/app';

import { mergeClasses } from '../../classify';
import defaultClasses from './field.css';

const Field = props => {
    const [{ mobile, rtl }] = useAppContext();
    const { children, id, label, isRequired, optional } = props;
    const classes = mergeClasses(defaultClasses, props.classes);

    const optionalSymbol = optional ? (
        <span className={classes.optional}>
            <FormattedMessage
                id={'field.optional'}
                defaultMessage={'Optional'}
            />
        </span>
    ) : null;

    return (
        <div
            className={`${mobile ? classes.rootMobile : classes.root} ${
                rtl ? classes.rtl : ''
            }`}
        >
            {label && (
                <label
                    className={`${classes.label} ${
                        isRequired ? classes.required : ''
                    }`}
                    htmlFor={id}
                >
                    {label}
                    {optionalSymbol}
                </label>
            )}
            {children}
        </div>
    );
};

Field.propTypes = {
    children: node,
    classes: shape({
        label: string,
        root: string
    }),
    id: string,
    label: node,
    optional: bool,
    isRequired: bool
};

export default Field;
