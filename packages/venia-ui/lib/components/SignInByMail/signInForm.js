import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form } from 'informed';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useSignInByMail } from '@magento/peregrine/lib/talons/SignInByMail/useSignInByMail';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

import Field from '../Field';
import Button from '../Button';
import TextInput from '../TextInput';
import { fullPageLoadingIndicator } from '../LoadingIndicator';

import defaultClasses from './signInForm.css';
import FormError from '../FormError';
import Checkbox from '../Checkbox';
import { BrowserPersistence } from '@magento/peregrine/lib/util';
import { Link, resourceUrl } from '@magento/venia-drivers';

const storage = new BrowserPersistence();
const storeCodeTwoLetter =
    storage.getItem('store_view_country')?.toLowerCase() || 'sa';
const isPakistanStore = storeCodeTwoLetter === 'pk';

const SignInForm = props => {
    const [{ mobile, tablet }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const [acpTerm, setAcpTerm] = useState(false);

    const talonProps = useSignInByMail({});

    const {
        errorMessage,
        signInError,
        errors,
        isDisable,
        isLoading,
        email,
        password,
        onChangeEmail,
        onChangePassword,
        handleSubmit
    } = talonProps;

    function handleEmailDataChange(e) {
        const { value } = e.target;

        if (onChangeEmail) {
            onChangeEmail(value);
        }
    }

    function handlePasswordDataChange(e) {
        const { value } = e.target;

        if (onChangePassword) {
            onChangePassword(value);
        }
    }

    const errorComs = errors && (
        <FormError errors={Array.from(errors.values())} />
    );

    const errorMessageComs = errorMessage && (
        <p className={classes.errorText}>{errorMessage}</p>
    );

    const emailComs = (
        <Field>
            <TextInput
                id="txtInputEmail"
                field="email"
                value={email}
                autoComplete="email"
                validateOnBlur
                mask={value => value && value.trim()}
                maskOnBlur={true}
                placeholder={formatMessage({
                    id: 'signInByMail.emailAddressText',
                    defaultMessage: 'Email Address'
                })}
                onChange={handleEmailDataChange}
                title={formatMessage({
                    id: 'forgotPasswordForm.emailAddressText',
                    defaultMessage: 'Email Address'
                })}
            />
        </Field>
    );

    const passwordComs = (
        <Field>
            <TextInput
                id="txtInputPassword"
                field="password"
                value={password}
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
    );

    const checkboxComs = (
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
    );

    const buttonComs = (
        <div>
            <div className={classes.forgotCon}>
                <Link
                    className={classes.forgotLink}
                    to={resourceUrl('/forgot-password')}
                >
                    <FormattedMessage
                        id="signInByMail.forgotPassword"
                        defaultMessage="Forgot password"
                    />
                </Link>
            </div>

            <Button
                priority="high"
                type="submit"
                disabled={isDisable || !acpTerm}
                className={classes.submitButton}
            >
                <FormattedMessage
                    id={'signInByMail.signInText'}
                    defaultMessage={'Sign In'}
                />
            </Button>

            {!isPakistanStore && (
                <div className={classes.textLinkCon}>
                    <Link
                        className={classes.textLink}
                        to={resourceUrl('/login')}
                    >
                        <FormattedMessage
                            id="signInByMail.loginByPhone"
                            defaultMessage="Login By Phone"
                        />
                    </Link>
                </div>
            )}
        </div>
    );

    return (
        <Form
            onSubmit={handleSubmit}
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
                    id={'signInByMail.titleText'}
                    defaultMessage={'SIGN IN'}
                />
            </h2>
            <div className={classes.container}>
                <h4 className={classes.subTitle}>
                    <FormattedMessage
                        id={'signInByMail.benefitText'}
                        defaultMessage={
                            'Add your mobile number below a text message will be sent to verify the number added.'
                        }
                    />
                </h4>
                {errorComs}
                {errorMessageComs}
                {emailComs}
                {passwordComs}
                {checkboxComs}
                {buttonComs}
            </div>
            {isLoading && fullPageLoadingIndicator}
        </Form>
    );
};

export default SignInForm;
