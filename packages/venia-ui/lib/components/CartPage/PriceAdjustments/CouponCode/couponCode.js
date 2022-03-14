import React, { Fragment, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { gql } from '@apollo/client';
import { AlertCircle as AlertCircleIcon } from 'react-feather';
import { useToasts } from '@magento/peregrine';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import { useCouponCode } from '@magento/peregrine/lib/talons/CartPage/PriceAdjustments/useCouponCode';
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { mergeClasses } from '../../../../classify';

import Button from '../../../Button';
import { Form } from 'informed';
import Field from '../../../Field';
import Icon from '../../../Icon';
import TextInput from '../../../TextInput';

import { CartPageFragment } from '../../cartPageFragments.gql';
import { AppliedCouponsFragment } from './couponCodeFragments';

import defaultClasses from './couponCode.css';

const errorIcon = (
    <Icon
        src={AlertCircleIcon}
        attrs={{
            width: 18
        }}
    />
);

const GET_APPLIED_COUPONS = gql`
    query getAppliedCoupons($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...AppliedCouponsFragment
        }
    }
    ${AppliedCouponsFragment}
`;

const APPLY_COUPON_MUTATION = gql`
    mutation applyCouponToCart($cartId: String!, $couponCode: String!) {
        applyCouponToCart(
            input: { cart_id: $cartId, coupon_code: $couponCode }
        ) @connection(key: "applyCouponToCart") {
            cart {
                id
                ...CartPageFragment
                # If this mutation causes "free" to become available we need to know.
                available_payment_methods {
                    code
                    title
                }
            }
        }
    }
    ${CartPageFragment}
`;

const REMOVE_COUPON_MUTATION = gql`
    mutation removeCouponFromCart($cartId: String!) {
        removeCouponFromCart(input: { cart_id: $cartId })
            @connection(key: "removeCouponFromCart") {
            cart {
                id
                ...CartPageFragment
                # If this mutation causes "free" to become available we need to know.
                available_payment_methods {
                    code
                    title
                }
            }
        }
    }
    ${CartPageFragment}
`;

/**
 * A child component of the PriceAdjustments component.
 * This component renders a form for addingg a coupon code to the cart.
 *
 * @param {Object} props
 * @param {Function} props.setIsCartUpdating Function for setting the updating state for the cart.
 * @param {Object} props.classes CSS className overrides.
 * See [couponCode.css]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/PriceAdjustments/CouponCode/couponCode.css}
 * for a list of classes you can override.
 *
 * @returns {React.Element}
 *
 * @example <caption>Importing into your project</caption>
 * import CouponCode from "@magento/venia-ui/lib/components/CartPage/PriceAdjustments/CouponCode";
 */
const CouponCode = props => {
    const [{ mobile, rtl }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);

    const talonProps = useCouponCode({
        setIsCartUpdating: props.setIsCartUpdating,
        setUpdateFinish: props.setUpdateFinish,
        mutations: {
            applyCouponMutation: APPLY_COUPON_MUTATION,
            removeCouponMutation: REMOVE_COUPON_MUTATION
        },
        queries: {
            getAppliedCouponsQuery: GET_APPLIED_COUPONS
        }
    });
    const [, { addToast }] = useToasts();
    const {
        applyingCoupon,
        data,
        errors,
        handleApplyCoupon,
        handleRemoveCoupon,
        removingCoupon
    } = talonProps;
    const { formatMessage } = useIntl();

    const removeCouponError = deriveErrorMessage([
        errors.get('removeCouponMutation')
    ]);

    useEffect(() => {
        if (removeCouponError) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: removeCouponError,
                dismissable: true,
                timeout: 10000
            });
        }
    }, [addToast, removeCouponError]);

    if (!data) {
        return null;
    }

    if (errors.get('getAppliedCouponsQuery')) {
        return (
            <div className={classes.errorContainer}>
                <FormattedMessage
                    id={'couponCode.errorContainer'}
                    defaultMessage={
                        'Something went wrong. Please refresh and try again.'
                    }
                />
            </div>
        );
    }

    const errorMessage = deriveErrorMessage([
        errors.get('applyCouponMutation')
    ]);

    const formClass = errorMessage ? classes.entryFormError : classes.entryForm;

    if (data.cart.applied_coupons) {
        const codes = data.cart.applied_coupons.map(({ code }) => {
            return (
                <Fragment key={code}>
                    <Field>
                        <TextInput
                            field="couponCode"
                            id={'couponCode'}
                            placeholder={code}
                            mask={value => value && value.trim()}
                            maskOnBlur={true}
                            message={errorMessage}
                            isDisabled={true}
                            validate={isRequired}
                            classes={{
                                input: classes.couponCodeInput
                            }}
                        />
                    </Field>
                    <Field>
                        <Button
                            classes={{ root_normalPriority: classes.button }}
                            disabled={removingCoupon}
                            priority={'normal'}
                            onClick={() => {
                                handleRemoveCoupon(code);
                            }}
                        >
                            <FormattedMessage
                                id={'couponCode.removeButton'}
                                defaultMessage={'Remove'}
                            />
                        </Button>
                    </Field>
                </Fragment>
            );
        });
        return (
            <div className={`${formClass} ${mobile ? classes.rootMobile : ''}`}>
                {codes}
            </div>
        );
    } else {
        return (
            <Form
                className={`${formClass} ${mobile ? classes.rootMobile : ''}`}
                onSubmit={handleApplyCoupon}
            >
                <Field>
                    <TextInput
                        field="couponCode"
                        id={'couponCode'}
                        placeholder={formatMessage({
                            id: 'couponCode.applyDiscountCode',
                            defaultMessage: 'Apply Discount Code'
                        })}
                        mask={value => value && value.trim()}
                        maskOnBlur={true}
                        message={errorMessage}
                        validate={isRequired}
                        rtl={rtl}
                    />
                </Field>

                <Field>
                    <Button
                        classes={{ root_normalPriority: classes.button }}
                        disabled={applyingCoupon}
                        priority={'normal'}
                        type={'submit'}
                    >
                        {!applyingCoupon && (
                            <FormattedMessage
                                id={'couponCode.apply'}
                                defaultMessage={'Apply'}
                            />
                        )}
                        {applyingCoupon && (
                            <FormattedMessage
                                id={'forgotPasswordForm.submittingButtonText'}
                                defaultMessage={'SUBMITTING'}
                            />
                        )}
                    </Button>
                </Field>
            </Form>
        );
    }
};

export default CouponCode;
