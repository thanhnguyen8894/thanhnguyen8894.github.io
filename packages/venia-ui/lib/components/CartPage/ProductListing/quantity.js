import React, { Fragment } from 'react';
import { useIntl } from 'react-intl';
import { Form } from 'informed';
import { func, number, string } from 'prop-types';
import { Minus as MinusIcon, Plus as PlusIcon } from 'react-feather';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useQuantity } from '@magento/peregrine/lib/talons/CartPage/ProductListing/useQuantity';

import { mergeClasses } from '../../../classify';
import Icon from '../../Icon';
import TextInput from '../../TextInput';
import { Message } from '../../Field';
import defaultClasses from './quantity.css';

export const QuantityFields = props => {
    const [{ mobile, tablet }] = useAppContext();
    const {
        min,
        label,
        itemId,
        message,
        fromCart,
        onChange,
        qtySalable,
        isFreeGift,
        setShowError,
        initialValue,
        isProductButton,
        setIsCartUpdating
    } = props;
    const { formatMessage } = useIntl();
    const classes = mergeClasses(defaultClasses, props.classes);
    const iconClasses = { root: classes.icon };

    const isTabletOrMobile = () => {
        return mobile || tablet;
    };

    const talonProps = useQuantity({
        min,
        onChange,
        qtySalable,
        setShowError,
        initialValue,
        setIsCartUpdating
    });

    const {
        maskInput,
        handleBlur,
        handleFocus,
        handleDecrement,
        handleIncrement,
        isDecrementDisabled,
        isIncrementDisabled
    } = talonProps;

    const errorMessage = message ? <Message>{message}</Message> : null;

    return (
        <Fragment>
            <div
                className={`${
                    isTabletOrMobile() ? classes.rootMobile : classes.root
                } ${isProductButton ? classes.rootProd : ''} ${
                    fromCart ? classes.rootCart : ''
                }`}
            >
                <label className={classes.label} htmlFor={itemId}>
                    {label}
                </label>
                <button
                    aria-label={formatMessage({
                        id: 'quantity.buttonIncrement',
                        defaultMessage: 'Increase Quantity'
                    })}
                    className={
                        isProductButton
                            ? classes.buttonProd
                            : classes.button_increment
                    }
                    disabled={isIncrementDisabled || isFreeGift}
                    onClick={handleIncrement}
                    type="button"
                >
                    <Icon
                        classes={iconClasses}
                        src={PlusIcon}
                        size={isProductButton ? 24 : 20}
                    />
                </button>
                <div
                    className={isProductButton ? classes.quantityInProd : null}
                >
                    <TextInput
                        aria-label={formatMessage({
                            id: 'quantity.input',
                            defaultMessage: 'Item Quantity'
                        })}
                        classes={{
                            input: isProductButton
                                ? classes.inputProd
                                : classes.input
                        }}
                        field="quantity"
                        id={itemId}
                        inputMode="numeric"
                        mask={maskInput}
                        min={min}
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                        pattern="[0-9]*"
                        isDisabled={isFreeGift}
                    />
                </div>
                <button
                    aria-label={formatMessage({
                        id: 'quantity.buttonDecrement',
                        defaultMessage: 'Decrease Quantity'
                    })}
                    className={
                        isProductButton
                            ? classes.buttonProd
                            : classes.button_decrement
                    }
                    disabled={isDecrementDisabled || isFreeGift}
                    onClick={handleDecrement}
                    type="button"
                >
                    <Icon
                        classes={iconClasses}
                        src={MinusIcon}
                        size={isProductButton ? 24 : 20}
                    />
                </button>
            </div>
            {errorMessage}
        </Fragment>
    );
};

const Quantity = props => {
    return (
        <Form
            initialValues={{
                quantity: props.initialValue
            }}
        >
            <QuantityFields {...props} isProductButton={false} />
        </Form>
    );
};

Quantity.propTypes = {
    initialValue: number,
    itemId: string,
    label: string,
    min: number,
    onChange: func,
    message: string
};

Quantity.defaultProps = {
    label: 'Quantity',
    min: 0,
    initialValue: 1,
    onChange: () => {},
    fromCart: false
};

QuantityFields.defaultProps = {
    min: 0,
    initialValue: 1,
    onChange: () => {},
    fromCart: false
};

export default Quantity;
