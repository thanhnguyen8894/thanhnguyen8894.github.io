import React, { useState } from 'react';
import { ReactSVG } from 'react-svg';
import { mergeClasses } from '../../classify';
import defaultClasses from './customInput.css';

const CustomInput = props => {
    const {
        classes: propClasses,
        label,
        isValid,
        onFocus,
        onBlur,
        onClick,
        ...other
    } = props;
    const classes = mergeClasses(defaultClasses, propClasses);
    const [isFocus, updateIsFocus] = useState(false);

    let controlClass = classes.control;
    if (isValid) {
        controlClass += ` ${classes.controlValid}`;
    }
    if (isFocus) {
        controlClass += ` ${classes.controlFocus}`;
    }

    return (
        <div className={classes.root}>
            <label className={classes.label}>{label}</label>
            <div
                aria-hidden="true"
                className={controlClass}
                onClick={onClick ? onClick : null}
            >
                <div className={classes.icon}>
                    <div className={classes.radioButton}>
                        <ReactSVG
                            src="/venia-static/icons/check.svg"
                            className={classes.check}
                        />
                    </div>
                </div>
                <input
                    {...other}
                    onFocus={() => updateIsFocus(true)}
                    onBlur={() => updateIsFocus(false)}
                    className={classes.input}
                />
            </div>
        </div>
    );
};

export default CustomInput;
