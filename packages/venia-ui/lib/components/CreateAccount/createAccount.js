import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form } from 'informed';
import { func, shape, string, bool } from 'prop-types';
import { Redirect, Link, resourceUrl } from '@magento/venia-drivers';

//Hooks/Redux
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useCreateAccount } from '@magento/peregrine/lib/talons/CreateAccount/useCreateAccount';
import { useVerifyPhoneNumber } from '@magento/peregrine/lib/talons/VerifyPhoneNumber/useVerifyPhoneNumber';
import { useVerifyEmail } from '@magento/peregrine/lib/talons/VerifyEmail/useVerifyEmail';

//Styles
import { mergeClasses } from '../../classify';
import defaultClasses from './createAccount.css';

//Constants/Helper
import {
    getCountryCodeByCountry,
    getPhoneImgByCountry,
    getPhoneMaskByCountry
} from '@magento/peregrine/lib/util/common';
import { BrowserPersistence } from '@magento/peregrine/lib/util';

//Components
import Button from '../Button';
import Field from '../Field';
import TextInput from '../TextInput';
import FormError from '../FormError';
import SocialSignIn from '../SocialSignIn';
import Checkbox from '../Checkbox';
import LoadingIndicator from '../LoadingIndicator';
import PhoneInputCustom from '../PhoneInputCustom/phoneInputCustom';

const storage = new BrowserPersistence();

const CreateAccount = props => {
    const [{ mobile, tablet }] = useAppContext();
    const { formatMessage } = useIntl();
    const [acpTerm, setAcpTerm] = useState(false);
    const storeCodeTwoLetter =
        storage.getItem('store_view_country')?.toLowerCase() || 'sa';
    const defaultPhoneCode = getCountryCodeByCountry(storeCodeTwoLetter);

    const isPakistanStore = storeCodeTwoLetter === 'pk';
    const talonProps = useCreateAccount({
        initialValues: props.initialValues,
        onSubmit: props.onSubmit,
        onCancel: props.onCancel
    });

    const {
        phone,
        errors,
        isLoading,
        isDisabled,
        isSignedIn,
        isValidPhone,
        handleCancel,
        handleSubmit,
        onChangeData,
        onChangePhone,
        identification,
        messageRefuseSendOTP
    } = talonProps;
    const classes = mergeClasses(defaultClasses, props.classes);
    const { firstname, lastname, email } = identification || {};

    // check Phone existing
    const verifyPhoneNumberTalonProps = useVerifyPhoneNumber({});
    const {
        isSubmitting,
        hasPhone,
        handleSubmit: checkPhoneNumberExist
    } = verifyPhoneNumberTalonProps;

    // check Email existing
    const verifyEmailProps = useVerifyEmail({});
    const {
        isChecking,
        isEmailAvailable,
        handleCheck: checkEmailAvailable
    } = verifyEmailProps;

    const [formValues, setFormValues] = useState();

    useEffect(() => {
        if (hasPhone && hasPhone === 'not-ready' && isEmailAvailable) {
            handleSubmit(formValues);
        }
    }, [hasPhone, isEmailAvailable]); // eslint-disable-line react-hooks/exhaustive-deps

    if (isLoading) {
        return (
            <div className={classes.modal_active}>
                <LoadingIndicator global={true}>
                    <FormattedMessage
                        id={'productFullDetail.loading'}
                        defaultMessage={'Loading'}
                    />
                </LoadingIndicator>
            </div>
        );
    }

    if (isSignedIn) {
        return <Redirect to="/account-information" />;
    }

    if (isPakistanStore) {
        return <Redirect to={resourceUrl('/create-account-by-email')} />;
    }

    const cancelButton = props.isCancelButtonHidden ? null : (
        <Button
            className={classes.cancelButton}
            disabled={isDisabled || isSubmitting || isChecking}
            type="button"
            priority="low"
            onClick={handleCancel}
        >
            <FormattedMessage
                id={'createAccount.cancelText'}
                defaultMessage={'Cancel'}
            />
        </Button>
    );

    const submitButton = (
        <Button
            className={classes.submitButton}
            disabled={isDisabled || isSubmitting || isChecking || !acpTerm}
            type="submit"
            priority="high"
        >
            <FormattedMessage
                id={'createAccount.createAccountText'}
                defaultMessage={'Create an Account'}
            />
        </Button>
    );

    function handleDataChange(e) {
        const { name, value } = e.target;

        if (onChangeData) {
            onChangeData(name, value);
        }
    }

    const onSubmitForm = values => {
        const _phone = `${defaultPhoneCode}${phone}`;
        values.phone = _phone;
        values.eventType = 'customer_signup_otp';
        checkEmailAvailable(values.email);
        setFormValues(values);
        checkPhoneNumberExist({ phone: _phone });
    };

    return (
        <Form
            className={mobile || tablet ? classes.rootMobile : classes.root}
            onSubmit={onSubmitForm}
        >
            <h2 className={classes.title}>
                <FormattedMessage
                    id={'createAccount.createCustomerAccountText'}
                    defaultMessage={'Create an account'}
                />
            </h2>
            <div className={classes.container}>
                <h4 className={classes.subTitle}>
                    <FormattedMessage
                        id={'createAccount.benefitCreateAcountText'}
                        defaultMessage={
                            'Creating an account has many benefits: check out faster, keep more than one address, track orders and more.'
                        }
                    />
                </h4>
                <FormError errors={Array.from(errors.values())} />
                <div>
                    {hasPhone && hasPhone === 'ready' && (
                        <p className={classes.errorText}>
                            <FormattedMessage
                                id={'createAccount.numberPhoneExist'}
                                defaultMessage={
                                    'This phone number already exists'
                                }
                            />
                        </p>
                    )}
                    {isEmailAvailable === false && (
                        <p className={classes.errorText}>
                            <FormattedMessage
                                id={'createAccount.emailExist'}
                                defaultMessage={
                                    'A customer with the same email already exists in an associated website'
                                }
                            />
                        </p>
                    )}
                    {messageRefuseSendOTP !== '' && (
                        <p className={classes.errorText}>
                            {messageRefuseSendOTP}
                        </p>
                    )}
                </div>
                <Field>
                    <TextInput
                        title={formatMessage({
                            id: 'createAccount.firstNameText',
                            defaultMessage: 'First Name'
                        })}
                        value={firstname.value}
                        field="firstname"
                        autoComplete="given-name"
                        validateOnBlur
                        mask={value => value && value.trim()}
                        maskOnBlur={true}
                        placeholder={formatMessage({
                            id: 'createAccount.firstNameText',
                            defaultMessage: 'First Name'
                        })}
                        onChange={handleDataChange}
                    />
                </Field>
                <Field>
                    <TextInput
                        title={formatMessage({
                            id: 'createAccount.lastNameText',
                            defaultMessage: 'Last Name'
                        })}
                        value={lastname.value}
                        field="lastname"
                        autoComplete="family-name"
                        validateOnBlur
                        mask={value => value && value.trim()}
                        maskOnBlur={true}
                        placeholder={formatMessage({
                            id: 'createAccount.lastNameText',
                            defaultMessage: 'Last Name'
                        })}
                        onChange={handleDataChange}
                    />
                </Field>
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
                        onChange={handleDataChange}
                    />
                </Field>
                <PhoneInputCustom
                    countryCode={defaultPhoneCode}
                    countryImg={getPhoneImgByCountry(storeCodeTwoLetter)}
                    mask={getPhoneMaskByCountry(storeCodeTwoLetter)}
                    isValid={isValidPhone}
                    value={phone}
                    onChange={onChangePhone}
                />
                <div className={classes.actions}>
                    {submitButton}
                    {cancelButton}
                </div>
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
                {/* <p className={classes.textContinue}>
                    <FormattedMessage
                        id={'signIn.continueWith'}
                        defaultMessage={'or continue with'}
                    />
                </p>
                <SocialSignIn /> */}
                <div className={classes.textLinkCon}>
                    <Link
                        className={classes.textLink}
                        to={resourceUrl('/create-account-by-email')}
                    >
                        <FormattedMessage
                            id="createAccount.signUpByEmail"
                            defaultMessage="Sign up By Email"
                        />
                    </Link>
                </div>
            </div>
        </Form>
    );
};

CreateAccount.propTypes = {
    classes: shape({
        root: string,
        actions: string,
        textContainer: string,
        subscribe: string,
        title: string,
        subTitle: string,
        phone: string,
        flagButton: string
    }),
    isCancelButtonHidden: bool,
    onSubmit: func,
    onCancel: func
};

CreateAccount.defaultProps = {
    onCancel: () => {},
    isCancelButtonHidden: true
};

export default CreateAccount;
