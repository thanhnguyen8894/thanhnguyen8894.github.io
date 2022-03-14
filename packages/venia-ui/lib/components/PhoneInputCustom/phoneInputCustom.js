import React, { useState } from 'react';
import { useWindowSize } from '@magento/peregrine';
import InputMask from 'react-input-mask';

import { mergeClasses } from '../../classify';
import defaultClasses from './phoneInputCustom.css';
import { getPlaceHolderByPhoneCode } from '@magento/peregrine/lib/util/common';

const PhoneInputCustom = props => {
    const {
        classes: propClasses,
        countryCode = '',
        countryImg = '',
        mask,
        isValid,
        onFocus,
        onBlur,
        onClick,
        onChange,
        ...other
    } = props;

    const isMobile = useWindowSize().innerWidth < 1024;
    const classes = mergeClasses(defaultClasses, propClasses);
    const [isFocus, updateIsFocus] = useState(false);

    let controlClass = classes.control;
    if (isValid) {
        controlClass += ` ${classes.controlValid}`;
    }
    if (isFocus) {
        controlClass += ` ${classes.controlFocus}`;
    }

    function beforeMaskedValueChange(newState, oldState, userInput) {
        var { value } = newState;
        var selection = newState.selection;
        var cursorPosition = selection ? selection.start : null;

        // Remove 0 from the start of the string
        if (value && value.substring(0, 1) === '0') {
            if (value && !value?.includes('_')) {
                value = userInput?.substring(1, userInput.length);

                return {
                    ...newState,
                    value
                };
            }

            return oldState;
        }

        // keep minus if entered by user
        if (
            value.endsWith('-') &&
            userInput !== '-' &&
            !this?.state?.value?.endsWith('-')
        ) {
            if (cursorPosition === value.length) {
                cursorPosition--;
                selection = { start: cursorPosition, end: cursorPosition };
            }
            value = value.slice(0, -1);
        }

        return {
            value,
            selection
        };
    }

    function onChangePhone(e) {
        const { value } = e.target;
        const _value = value?.replaceAll(/[^A-Z0-9]/gi, '');
        onChange(_value);
    }

    return (
        <div className={classes.root}>
            <div
                aria-hidden="true"
                className={controlClass}
                onClick={() => {
                    onClick && onClick();
                }}
            >
                <div className={classes.icon}>
                    <div className={classes.radioButton}>
                        <img height={20} alt={countryCode} src={countryImg} />
                    </div>
                </div>
                <label className={classes.label}>{`+${countryCode}`}</label>
                <InputMask
                    {...other}
                    mask={mask}
                    onChange={onChangePhone}
                    maskChar={null}
                    type="tel"
                    autoComplete="tel"
                    onFocus={() => {
                        updateIsFocus(true);
                        onFocus && onFocus();
                    }}
                    onBlur={() => {
                        updateIsFocus(false);
                        onBlur && onBlur();
                    }}
                    className={isMobile ? classes.inputMobile : classes.input}
                    beforeMaskedValueChange={beforeMaskedValueChange}
                    placeholder={getPlaceHolderByPhoneCode(countryCode)}
                />
            </div>
        </div>
    );
};

export default PhoneInputCustom;
