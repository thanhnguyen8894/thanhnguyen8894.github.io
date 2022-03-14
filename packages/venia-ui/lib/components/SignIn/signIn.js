import React, { useState, useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { func, shape, string } from 'prop-types';
import { Form } from 'informed';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { Redirect, Link, resourceUrl } from '@magento/venia-drivers';
import _ from 'lodash';

//Redux/Hooks
import { useSignIn } from '@magento/peregrine/lib/talons/SignIn/useSignIn';
import { useVerifyPhoneNumber } from '@magento/peregrine/lib/talons/VerifyPhoneNumber/useVerifyPhoneNumber';
import { useCreateAccount } from '@magento/peregrine/lib/talons/CreateAccount/useCreateAccount';
import { useVerifyEmail } from '@magento/peregrine/lib/talons/VerifyEmail/useVerifyEmail';

//GraphQL
import { mergeClasses } from '../../classify';
import defaultClasses from './signIn.css';
import { GET_CART_DETAILS_QUERY } from './signIn.gql';

//Helper/Constants
import {
    getCountryCodeByCountry,
    getPhoneImgByCountry,
    getPhoneMaskByCountry
} from '@magento/peregrine/lib/util/common';
import { BrowserPersistence } from '@magento/peregrine/lib/util';

//Components
import Field from '../Field';
import Button from '../Button';
import TextInput from '../TextInput';
import PhoneInputCustom from '../PhoneInputCustom/phoneInputCustom';
import FormError from '../FormError/formError';
import Checkbox from '@magento/venia-ui/lib/components/Checkbox';
import LoadingIndicator from '../LoadingIndicator';
import SocialSignIn from '../SocialSignIn';

const storage = new BrowserPersistence();

const SignIn = props => {
    const [{ mobile, tablet }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);
    const { setDefaultUsername, showCreateAccount, showForgotPassword } = props;
    const [formValues, setFormValues] = useState();
    const [acpTerm, setAcpTerm] = useState(false);
    const { formatMessage } = useIntl();
    const storeCodeTwoLetter =
        storage.getItem('store_view_country')?.toLowerCase() || 'sa';
    const isPakistanStore = storeCodeTwoLetter === 'pk';
    const defaultPhoneCode = getCountryCodeByCountry(storeCodeTwoLetter);

    const talonProps = useSignIn({
        getCartDetailsQuery: GET_CART_DETAILS_QUERY,
        setDefaultUsername,
        showCreateAccount,
        showForgotPassword
    });

    const {
        errors,
        isBusy,
        handleSubmit,
        refuseSendOTP,
        messageRefuseSendOTP
    } = talonProps;

    // customer
    const customerTalonProps = useCreateAccount({});
    const {
        phone,
        isLoading,
        isDisabled,
        isValidPhone,
        onChangeData,
        onChangePhone,
        identification,
        errors: errorCreateAccount,
        handleSubmit: createAccount
    } = customerTalonProps;

    const { firstname, lastname, email } = identification || {};

    // check Email existing
    const verifyEmailProps = useVerifyEmail({});
    const {
        isChecking,
        isEmailAvailable,
        handleCheck: checkEmailAvailable
    } = verifyEmailProps;

    // check Phone existing
    const verifyPhoneNumberTalonProps = useVerifyPhoneNumber({});
    const {
        isSubmitting,
        hasPhone,
        setHasPhone,
        handleSubmit: checkPhoneNumberExist
    } = verifyPhoneNumberTalonProps;

    const phoneNotReady = hasPhone && hasPhone === 'not-ready';

    const onSubmitForm = values => {
        const _phone = `${defaultPhoneCode}${phone}`;
        values.firstname = firstname.value;
        values.lastname = lastname.value;
        values.email = email.value;
        values.phone = _phone;
        values.needToNavigate = true;
        setFormValues(values);

        // first case
        if (!hasPhone || refuseSendOTP) {
            checkPhoneNumberExist({ phone: _phone });
            return;
        }

        // this case used to verify the email
        if (values.email && phoneNotReady) {
            checkEmailAvailable(values.email);
        }
    };

    const currentData = useMemo(() => {
        return formValues;
    }, [formValues]);

    useEffect(() => {
        if (phoneNotReady && !isChecking && isEmailAvailable) {
            const newValues = _.cloneDeep(currentData);
            newValues.eventType = 'customer_signup_otp';
            createAccount(newValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasPhone, isEmailAvailable, isChecking]);

    const handleBack = () => {
        setHasPhone(null);
        if (onChangeData) {
            onChangeData('email', '');
        }
    };

    function handleDataChange(e) {
        const { name, value } = e.target;

        if (onChangeData) {
            onChangeData(name, value);
        }
    }

    useEffect(() => {
        if (hasPhone && hasPhone === 'ready') {
            formValues.eventType = 'customer_login_otp';
            handleSubmit(formValues);
        }
    }, [hasPhone]); // eslint-disable-line react-hooks/exhaustive-deps

    const phoneInputComs = useMemo(() => {
        if (refuseSendOTP || !hasPhone) {
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
        refuseSendOTP,
        storeCodeTwoLetter
    ]);

    if (isPakistanStore) {
        return <Redirect to={resourceUrl('/login-by-email')} />;
    }

    if (isBusy || isSubmitting || isLoading) {
        return (
            <div className={classes.modal_active}>
                <LoadingIndicator>
                    <FormattedMessage
                        id={'signIn.loadingText'}
                        defaultMessage={'Signing In'}
                    />
                </LoadingIndicator>
            </div>
        );
    }

    return (
        <Form
            onSubmit={onSubmitForm}
            className={
                mobile
                    ? classes.rootMobile
                    : tablet
                    ? classes.rootTablet
                    : classes.root
            }
        >
            <h2 className={classes.title}>
                <FormattedMessage
                    id={'signIn.titleText'}
                    defaultMessage={'SIGN IN'}
                />
            </h2>
            <div className={classes.container}>
                {(refuseSendOTP || !hasPhone) && (
                    <h4 className={classes.subTitle}>
                        <FormattedMessage
                            id={'signIn.benefitText'}
                            defaultMessage={
                                'Add your mobile number below a text message will be sent to verify the number added.'
                            }
                        />
                    </h4>
                )}
                {phoneNotReady && (
                    <h4 className={classes.subTitle}>
                        <FormattedMessage
                            id={'signIn.createNewAccount'}
                            defaultMessage={`An account will be create with "${defaultPhoneCode}${phone}" phone`}
                            values={{
                                phone: `${defaultPhoneCode}${phone}`
                            }}
                        />
                    </h4>
                )}

                <FormError
                    errors={
                        errorCreateAccount
                            ? Array.from(errorCreateAccount.values())
                            : Array.from(errors.values())
                    }
                />
                {hasPhone && hasPhone === 'ready' && (
                    <p className={classes.errorText}>
                        <FormattedMessage
                            id={'createAccount.numberPhoneExist'}
                            defaultMessage={'This phone number already exists'}
                        />
                    </p>
                )}
                {isEmailAvailable === false && email.value !== '' && (
                    <p className={classes.errorText}>
                        <FormattedMessage
                            id={'createAccount.emailExist'}
                            defaultMessage={
                                'A customer with the same email already exists in an associated website'
                            }
                        />
                    </p>
                )}

                {refuseSendOTP && (
                    <p className={classes.errorText}>{messageRefuseSendOTP}</p>
                )}

                {phoneNotReady && (
                    <Field>
                        <TextInput
                            field="firstname"
                            value={firstname.value}
                            autoComplete="given-name"
                            validateOnBlur
                            mask={value => value && value.trim()}
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
                            mask={value => value && value.trim()}
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
                            mask={value => value && value.trim()}
                            maskOnBlur={true}
                            placeholder={formatMessage({
                                id: 'forgotPasswordForm.emailAddressText',
                                defaultMessage: 'Email Address'
                            })}
                            onChange={handleDataChange}
                        />
                    </Field>
                )}
                {phoneInputComs}
                <Checkbox
                    field="acpTerms"
                    label={formatMessage({
                        id: 'signIn.acpTerms',
                        defaultMessage: `I've read and accepted Terms of Services & Privacy Policy.`
                    })}
                    classes={{
                        label: classes.checkboxLabel,
                        root: classes.checkboxRoot
                    }}
                    onClick={() => {
                        setAcpTerm(!acpTerm);
                    }}
                    fieldState={{
                        value: acpTerm
                    }}
                />
                <div className={phoneNotReady ? classes.actions : ''}>
                    {(refuseSendOTP || !hasPhone) && (
                        <Button
                            priority="high"
                            type="submit"
                            disabled={!isValidPhone || !acpTerm}
                            className={classes.submitButton}
                        >
                            <FormattedMessage
                                id={'signIn.signInText'}
                                defaultMessage={'Sign In'}
                            />
                        </Button>
                    )}
                    {(refuseSendOTP || !hasPhone) && (
                        <div className={classes.textLinkCon}>
                            <Link
                                className={classes.textLink}
                                to={resourceUrl('/login-by-email')}
                            >
                                <FormattedMessage
                                    id="signInByMail.loginByEmail"
                                    defaultMessage="Sign in By Email"
                                />
                            </Link>
                        </div>
                    )}
                    {phoneNotReady && (
                        <Button
                            priority="high"
                            type="submit"
                            disabled={isDisabled || !acpTerm}
                            className={classes.submitButton}
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
                            className={`${classes.submitButton} ${
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
                {/* <p className={classes.textContinue}>
                    <FormattedMessage
                        id={'signIn.continueWith'}
                        defaultMessage={'or continue with'}
                    />
                </p>
                <SocialSignIn /> */}
            </div>
        </Form>
    );
};

export default SignIn;
SignIn.propTypes = {
    classes: shape({
        root: string,
        textContainer: string,
        buttonsContainer: string,
        title: string,
        subtitle: string,
        phone: string,
        flagButton: string
    }),
    setDefaultUsername: func,
    showCreateAccount: func,
    showForgotPassword: func
};
SignIn.defaultProps = {
    setDefaultUsername: () => {},
    showCreateAccount: () => {},
    showForgotPassword: () => {}
};
