import React, { Fragment, useEffect, useState, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form } from 'informed';
import { Link, resourceUrl } from '@magento/venia-drivers';

import _ from 'lodash';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { useCheckoutRegistrationPage } from '@magento/peregrine/lib/talons/CheckoutRegistrationPage/useCheckoutRegistrationPage';
import { useSignIn } from '@magento/peregrine/lib/talons/SignIn/useSignIn';
import { useVerifyPhoneNumber } from '@magento/peregrine/lib/talons/VerifyPhoneNumber/useVerifyPhoneNumber';
import { useCreateAccount } from '@magento/peregrine/lib/talons/CreateAccount/useCreateAccount';
import { useVerifyEmail } from '@magento/peregrine/lib/talons/VerifyEmail/useVerifyEmail';
import { useSignInByMail } from '@magento/peregrine/lib/talons/SignInByMail/useSignInByMail';

import { useAppContext } from '@magento/peregrine/lib/context/app';

import Field from '../Field';
import TextInput from '../TextInput';
import FormError from '../FormError/formError';

import Button from '../Button';
import defaultClasses from './checkoutRegistrationPage.css';
import LoadingIndicator from '../LoadingIndicator';

import { GET_CART_DETAILS_QUERY } from '../SignIn/signIn.gql';
import {
    getCountryCodeByCountry,
    getPhoneImgByCountry,
    getPhoneMaskByCountry
} from '@magento/peregrine/lib/util/common';
import { BrowserPersistence } from '@magento/peregrine/lib/util';
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import PhoneInputCustom from '../PhoneInputCustom/phoneInputCustom';

const storage = new BrowserPersistence();

function CheckoutRegistrationPage(props) {
    const classes = mergeClasses(defaultClasses, props.classes);
    const { formatMessage } = useIntl();

    //TalonsProps
    const [{ mobile, tablet }] = useAppContext();
    const talonProps = useCheckoutRegistrationPage();
    const { isValidPhone, onChangePhone, phone } = talonProps;
    const storeCodeTwoLetter =
        storage.getItem('store_view_country')?.toLowerCase() || 'sa';
    const isPakistanStore = storeCodeTwoLetter === 'pk';
    const defaultPhoneCode = getCountryCodeByCountry(storeCodeTwoLetter);

    const [formValues, setFormValues] = useState({});
    const [isCheckoutWithEmail, setIsCheckoutWithEmail] = useState(
        isPakistanStore
    );

    const signInTalonProps = useSignIn({
        getCartDetailsQuery: GET_CART_DETAILS_QUERY
    });
    const { handleSubmit: getOTPMessage } = signInTalonProps;

    const verifyPhoneNumberTalonProps = useVerifyPhoneNumber({});
    const {
        isSubmitting,
        hasPhone,
        setHasPhone,
        handleSubmit: checkPhoneNumberExist
    } = verifyPhoneNumberTalonProps;
    const phoneNotReady = hasPhone && hasPhone === 'not-ready';

    // check Email existing
    const verifyEmailProps = useVerifyEmail({});
    const {
        isChecking,
        isEmailAvailable,
        handleCheck: checkEmailAvailable
    } = verifyEmailProps;

    // customer
    const customerTalonProps = useCreateAccount({});
    const {
        isLoading,
        isValidInputText,
        onChangeData,
        identification,
        errors: errorCreateAccount,
        handleSubmit: createAccount
    } = customerTalonProps;

    const emailLoginTalonsProps = useSignInByMail({});
    const {
        errors: errorEmailLogin,
        isDisable: emailLoginButtonDisable,
        onChangeEmail: onChangeEmailLogin,
        onChangePassword: onChangePasswordEmailLogin,
        handleSubmit: handleSubmitEmailLogin,
        isLoading: isLoadingEmailLogin
    } = emailLoginTalonsProps;

    const { firstname, lastname, email } = identification || {};

    function handleDataChange(e) {
        const { name, value } = e.target;

        if (onChangeData) {
            onChangeData(name, value);
        }
    }

    function handleEmailDataChange(e) {
        const { value } = e.target;

        if (onChangeEmailLogin) {
            onChangeEmailLogin(value);
        }
    }

    function handlePasswordDataChange(e) {
        const { value } = e.target;

        if (onChangePasswordEmailLogin) {
            onChangePasswordEmailLogin(value);
        }
    }

    const onSubmitForm = values => {
        if (isCheckoutWithEmail) {
            handleSubmitEmailLogin({ ...values, rootPage: '/checkout' });
        } else {
            if (isValidPhone) {
                const _phone = `${defaultPhoneCode}${phone}`;
                values.firstname = firstname.value;
                values.lastname = lastname.value;
                values.email = email.value;
                values.phone = _phone;
                values.needToNavigate = true;
                setFormValues(values);

                // first case
                if (!hasPhone) {
                    checkPhoneNumberExist({ phone: _phone });
                    return;
                }

                if (values.email) {
                    checkEmailAvailable(values.email);
                    return;
                }
            }
        }
    };

    const currentData = useMemo(() => {
        return { ...formValues };
    }, [formValues]);

    useEffect(() => {
        if (phoneNotReady && !isChecking && isEmailAvailable) {
            const newValues = _.cloneDeep(currentData);
            newValues.eventType = 'customer_signup_otp';
            newValues.rootPage = '/checkout';
            createAccount(newValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasPhone, isEmailAvailable, isChecking, currentData]);

    const handleBack = () => {
        setHasPhone(null);
    };

    useEffect(() => {
        if (hasPhone && hasPhone === 'ready') {
            getOTPMessage({
                phone: `${defaultPhoneCode}${phone}`,
                needToNavigate: true,
                eventType: 'customer_login_otp',
                rootPage: '/checkout'
            });
        }
    }, [hasPhone]); // eslint-disable-line react-hooks/exhaustive-deps

    //* Check condition disable button login to action checkout
    const isDisableButtonLogin = useMemo(() => {
        if (isCheckoutWithEmail) {
            return emailLoginButtonDisable;
        } else return !isValidPhone;
    }, [emailLoginButtonDisable, isCheckoutWithEmail, isValidPhone]);

    const textSwitchOptionCheckout = useMemo(() => {
        if (isCheckoutWithEmail && !isPakistanStore) {
            return (
                <FormattedMessage
                    id={'checkoutPage.withPhone'}
                    defaultMessage={'Checkout with phone'}
                />
            );
        }
        return (
            <FormattedMessage
                id={'checkoutPage.withEmail'}
                defaultMessage={'Checkout with email'}
            />
        );
    }, [isCheckoutWithEmail, isPakistanStore]);

    const phoneInput = useMemo(() => {
        if (!hasPhone) {
            return (
                <PhoneInputCustom
                    countryCode={defaultPhoneCode}
                    countryImg={getPhoneImgByCountry(storeCodeTwoLetter)}
                    mask={getPhoneMaskByCountry(storeCodeTwoLetter)}
                    isValid={isValidPhone}
                    value={phone}
                    onChange={onChangePhone}
                />
            );
        }
    }, [
        defaultPhoneCode,
        hasPhone,
        isValidPhone,
        onChangePhone,
        phone,
        storeCodeTwoLetter
    ]);

    const isError = useMemo(
        () => deriveErrorMessage(Array.from(errorEmailLogin.values())),
        [errorEmailLogin]
    );

    const formCheckoutByEmail = useMemo(() => {
        return (
            <div className={classes.formAccountByEmail}>
                <Fragment>
                    <FormError
                        errors={Array.from(errorEmailLogin.values())}
                        classes={{
                            root: classes.errorError
                        }}
                    />
                    {isError && (
                        <Link
                            to={resourceUrl('/forgot-password')}
                            className={classes.forgotLink}
                        >
                            <FormattedMessage
                                id={'signIn.forgotPasswordText'}
                                defaultMessage={'Forgot password?'}
                            />
                        </Link>
                    )}
                </Fragment>
                <Field>
                    <TextInput
                        title={formatMessage({
                            id: 'forgotPasswordForm.emailAddressText',
                            defaultMessage: 'Email address'
                        })}
                        value={email.value}
                        field="email"
                        autoComplete="email"
                        validateOnBlur
                        mask={value => value && value.trim()}
                        maskOnBlur={true}
                        placeholder={formatMessage({
                            id: 'forgotPasswordForm.emailAddressText',
                            defaultMessage: 'Email address'
                        })}
                        onChange={handleEmailDataChange}
                    />
                </Field>
                <Field>
                    <TextInput
                        id="txtInputPassword"
                        field="password"
                        validateOnBlur
                        mask={value => value && value.trim()}
                        maskOnBlur={true}
                        type={'password'}
                        placeholder={formatMessage({
                            id: 'signInByMail.passwordText',
                            defaultMessage: 'Password'
                        })}
                        onChange={handlePasswordDataChange}
                        title={formatMessage({
                            id: 'createAccount.passwordText',
                            defaultMessage: 'Password'
                        })}
                    />
                </Field>
            </div>
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        classes.errorError,
        classes.formAccountByEmail,
        email.value,
        errorEmailLogin,
        formatMessage
    ]);

    if (isChecking || isLoadingEmailLogin) {
        return (
            <div className={classes.modal_active}>
                <LoadingIndicator global>
                    <FormattedMessage
                        id={'productFullDetail.loading'}
                        defaultMessage={'Loading...'}
                    />
                </LoadingIndicator>
            </div>
        );
    }

    if (isSubmitting || isLoading || isChecking) {
        return (
            <div className={classes.modal_active}>
                <LoadingIndicator global>
                    <FormattedMessage
                        id={'verification.verifyPhone'}
                        defaultMessage={'Verification Phone'}
                    />
                </LoadingIndicator>
            </div>
        );
    }

    return (
        <div className={classes.container}>
            <div
                className={`${classes.root} ${
                    mobile ? classes.rootMobile : ''
                } ${tablet ? classes.rootTablet : ''}`}
            >
                <div className={classes.header}>
                    <div className={classes.title}>
                        <FormattedMessage
                            id={'verification.title'}
                            defaultMessage={'Verification'}
                        />
                    </div>
                    <div className={classes.subTitle}>
                        {!hasPhone && !isCheckoutWithEmail && (
                            <FormattedMessage
                                id={'verification.subTitleEnterPhone'}
                                defaultMessage={
                                    'To sign in, add your mobile number below, and a text message will be sent to verify the number added.'
                                }
                            />
                        )}
                        {isCheckoutWithEmail && (
                            <FormattedMessage
                                id={'verification.subTitleEnterEmail'}
                                defaultMessage={
                                    'To sign in, add your email and password below.'
                                }
                            />
                        )}
                        {phoneNotReady && (
                            <FormattedMessage
                                id={'verification.createNewAccount'}
                                defaultMessage={`To sign in, an account will be create with "${defaultPhoneCode}${phone}" phone`}
                                values={{
                                    phone: `${defaultPhoneCode}${phone}`
                                }}
                            />
                        )}
                    </div>
                </div>
                <div
                    className={`${classes.footer} ${
                        phoneNotReady ? classes.footerForm : ''
                    }`}
                >
                    <Form
                        onSubmit={onSubmitForm}
                        className={classes.formAccount}
                    >
                        <FormError
                            errors={Array.from(errorCreateAccount.values())}
                        />
                        {isCheckoutWithEmail ? (
                            <Fragment>{formCheckoutByEmail}</Fragment>
                        ) : (
                            <Fragment>
                                {isEmailAvailable === false && (
                                    <Fragment>
                                        <p className={classes.errorText}>
                                            <FormattedMessage
                                                id={'createAccount.emailExist'}
                                                defaultMessage={
                                                    'A customer with the same email already exists in an associated website'
                                                }
                                            />
                                        </p>
                                        <Link
                                            className={classes.textLink}
                                            to={resourceUrl('/login-by-email')}
                                        >
                                            <FormattedMessage
                                                id="signIn.loginByEmail"
                                                defaultMessage="Login By Email"
                                            />
                                        </Link>
                                    </Fragment>
                                )}
                                {phoneNotReady && (
                                    <Field>
                                        <TextInput
                                            field="firstname"
                                            value={firstname.value}
                                            autoComplete="given-name"
                                            validateOnBlur
                                            mask={value =>
                                                value && value.trim()
                                            }
                                            maskOnBlur={true}
                                            placeholder={formatMessage({
                                                id: 'global.firstName',
                                                defaultMessage: 'First Name'
                                            })}
                                            onChange={handleDataChange}
                                        />
                                    </Field>
                                )}
                                {phoneNotReady && (
                                    <Field>
                                        <TextInput
                                            field="lastname"
                                            value={lastname.value}
                                            autoComplete="family-name"
                                            validateOnBlur
                                            mask={value =>
                                                value && value.trim()
                                            }
                                            maskOnBlur={true}
                                            placeholder={formatMessage({
                                                id: 'global.lastName',
                                                defaultMessage: 'Last Name'
                                            })}
                                            onChange={handleDataChange}
                                        />
                                    </Field>
                                )}
                                {phoneNotReady && (
                                    <Field>
                                        <TextInput
                                            field="email"
                                            value={email.value}
                                            autoComplete="email"
                                            validateOnBlur
                                            mask={value =>
                                                value && value.trim()
                                            }
                                            maskOnBlur={true}
                                            placeholder={formatMessage({
                                                id:
                                                    'forgotPasswordForm.emailAddressText',
                                                defaultMessage: 'Email address'
                                            })}
                                            onChange={handleDataChange}
                                        />
                                    </Field>
                                )}
                                {phoneInput}
                            </Fragment>
                        )}
                        <div
                            className={
                                phoneNotReady ? classes.actions : classes.action
                            }
                        >
                            {!hasPhone && (
                                <Fragment>
                                    <Button
                                        priority="high"
                                        type="submit"
                                        disabled={isDisableButtonLogin}
                                        className={classes.submit}
                                    >
                                        <FormattedMessage
                                            id={'global.login'}
                                            defaultMessage={'Login'}
                                        />
                                    </Button>
                                    {!isPakistanStore && (
                                        <Button
                                            priority="high"
                                            onClick={() =>
                                                setIsCheckoutWithEmail(
                                                    !isCheckoutWithEmail
                                                )
                                            }
                                            className={classes.loginByEmail}
                                        >
                                            {textSwitchOptionCheckout}
                                        </Button>
                                    )}
                                </Fragment>
                            )}
                            {phoneNotReady && (
                                <Button
                                    priority="high"
                                    type="submit"
                                    disabled={!isValidInputText}
                                    className={classes.submit}
                                >
                                    <FormattedMessage
                                        id={'checkoutPage.createAccount'}
                                        defaultMessage={'CREATE ACCOUNT'}
                                    />
                                </Button>
                            )}
                            {phoneNotReady && (
                                <Button
                                    priority="high"
                                    onClick={handleBack}
                                    className={`${classes.submit} ${
                                        classes.backButton
                                    }`}
                                >
                                    <FormattedMessage
                                        id={'signIn.backButton'}
                                        defaultMessage={'Back'}
                                    />
                                </Button>
                            )}
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default CheckoutRegistrationPage;
