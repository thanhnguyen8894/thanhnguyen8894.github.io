import React, { Component, Fragment } from 'react';
import { bool, node, number, oneOfType, shape, string } from 'prop-types';
import { BasicText, asField } from 'informed';
import { compose } from 'redux';

import classify from '../../classify';
import { FieldIcons, Message } from '../Field';
import defaultClasses from './textInput.css';
import { images } from '@magento/venia-ui/lib/constants/images';

export class TextInput extends Component {
    static propTypes = {
        after: node,
        before: node,
        classes: shape({
            input: string,
            input_error: string,
            disable: string,
            iconArrow: string,
            iconArrowRtl: string,
            after: string
        }),
        fieldState: shape({
            value: oneOfType([string, number])
        }),
        message: node,
        isDisabled: bool,
        iconDown: bool
    };

    render() {
        const {
            after,
            before,
            title,
            classes,
            fieldState,
            message,
            isDisabled,
            iconDown,
            rtl,
            ...rest
        } = this.props;
        const inputClass = `${
            fieldState.error ? classes.input_error : classes.input
        } ${isDisabled ? classes.disable : ''}`;
        return (
            <Fragment>
                <FieldIcons
                    after={after}
                    classes={{ after: classes.after }}
                    before={before}
                    title={title}
                    rtl={rtl}
                >
                    <BasicText
                        {...rest}
                        fieldState={fieldState}
                        className={inputClass}
                        disabled={isDisabled}
                    />
                    {iconDown && (
                        <img
                            src={images.downIcon}
                            className={
                                rtl ? classes.iconArrowRtl : classes.iconArrow
                            }
                            alt="icon arrow"
                        />
                    )}
                </FieldIcons>
                <Message fieldState={fieldState}>{message}</Message>
            </Fragment>
        );
    }
}

export default compose(
    classify(defaultClasses),
    asField
)(TextInput);
