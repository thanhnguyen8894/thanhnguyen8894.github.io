import React, { Component, Fragment } from 'react';
import { bool, node, shape, string } from 'prop-types';
import { BasicCheckbox, asField } from 'informed';
import { compose } from 'redux';

import classify from '@magento/venia-ui/lib/classify';
import { images } from '@magento/venia-ui/lib/constants/images';
import { Message } from '@magento/venia-ui/lib/components/Field';
import defaultClasses from './checkbox.css';

/* TODO: change lint config to use `label-has-associated-control` */
/* eslint-disable jsx-a11y/label-has-for */

export class Checkbox extends Component {
    static propTypes = {
        classes: shape({
            icon: string,
            input: string,
            label: string,
            message: string,
            root: string
        }),
        field: string.isRequired,
        fieldState: shape({
            value: bool
        }).isRequired,
        id: string,
        label: node.isRequired,
        message: node,
        isDisable: bool
    };

    render() {
        const { classes, fieldState, id, label, message, isDisable, ...rest } = this.props;
        const { value: checked } = fieldState;
        const checkedIcon = <img alt="checked" src={images.checkedIcon} />;
        const uncheckedIcon = <img alt="unchecked" src={images.uncheckedIcon} />;
        const icon = checked ? checkedIcon : uncheckedIcon;
        const checkboxColor = this.props.group == 'color';
        return (
            <Fragment>
                {checkboxColor ? (
                    <label
                        className={`${classes.rootCheckboxColor}`}
                        htmlFor={id}
                    >
                        <button
                            className={`${
                                classes.inputColor
                            }  ${fieldState.value && classes.isClicked}`}
                            onClick={() => this.props.onClick()}
                            id={id}
                        >
                            <span
                                className={classes.label}
                                style={{ backgroundColor: label }}
                            />
                        </button>
                    </label>
                ) : (
                    <label className={classes.root} htmlFor={id}>
                        <BasicCheckbox
                            {...rest}
                            className={classes.input}
                            fieldState={fieldState}
                            id={id}
                            disabled={isDisable}
                        />
                        <span className={classes.icon}>{icon}</span>
                        <span className={classes.label}>{label}</span>
                    </label>
                )}
                <Message fieldState={fieldState}>{message}</Message>
            </Fragment>
        );
    }
}

/* eslint-enable jsx-a11y/label-has-for */

export default compose(
    classify(defaultClasses),
    asField
)(Checkbox);
