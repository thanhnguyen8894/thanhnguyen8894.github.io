import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { useSignIn } from '@magento/peregrine/lib/talons/SignIn/useSignIn';
import { useCreateAccount } from '@magento/peregrine/lib/talons/CreateAccount/useCreateAccount';
import { useAppContext } from '@magento/peregrine/lib/context/app';

import defaultClasses from './verificationPage.css';
import VerifyPhone from './verifyPhone';
import CountDown from './countdown';
import FormError from '../FormError/formError';
import Button from '../Button';

import { GET_CART_DETAILS_QUERY } from '../SignIn/signIn.gql';
import LoadingIndicator from '../LoadingIndicator';

const timeCountDown = 60;

const VerificationPage = props => {
    const { state } = useLocation();

    const classes = mergeClasses(defaultClasses, props.classes);
    const [{ mobile, tablet, rtl }] = useAppContext();

    const signInTalonProps = useSignIn({
        getCartDetailsQuery: GET_CART_DETAILS_QUERY
    });
    const {
        handleSubmit,
        handleAfterLogin,
        isBusy,
        errors,
        sentOTP,
        hasError
    } = signInTalonProps;

    // customer
    const customerTalonProps = useCreateAccount({});
    const {
        handleCreateAccountOTP,
        isLoading,
        errors: errorCreateAccount,
        hasError: hasErrorCreateAccount
    } = customerTalonProps;

    const [isResend, setIsResend] = useState(false);
    const [time] = useState(timeCountDown);
    const [phone, setPhone] = useState(null);
    const [eventTypeOTP, setEventTypeOTP] = useState('customer_login_otp');
    const [countResendOTP, setCountResendOTP] = useState(0);

    const [actionType, setActionType] = useState();
    const [firstname, setFirstname] = useState();
    const [lastname, setLastname] = useState();
    const [email, setEmail] = useState();
    const [rootPage, setRootPage] = useState();

    const [errorMessage, setErrorMessage] = useState();
    // show error input on OTP
    const [optCode, setOtpCode] = useState();
    const [hasErrorCode, setHasErrorCode] = useState(false);

    useEffect(() => {
        if (state && state.phoneNumber) {
            setPhone(state.phoneNumber);
        }
        if (state && state.eventTypeOTP) {
            setEventTypeOTP(state.eventTypeOTP);
        }
        if (state && state.rootPage) {
            setRootPage(state.rootPage);
        }

        // Customer
        if (state && state.firstname) {
            setFirstname(state.firstname);
        }
        if (state && state.lastname) {
            setLastname(state.lastname);
        }
        if (state && state.email) {
            setEmail(state.email);
        }

        if (state && state.actionType) {
            setActionType(state.actionType);
        }
    }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (sentOTP && state.phoneNumber) {
            setIsResend(false);
        }
    }, [sentOTP]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (errors) {
            setErrorMessage(Array.from(errors.values()));
            setHasErrorCode(hasError);
            setOtpCode(null);
        }
    }, [errors, hasError]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (errorCreateAccount) {
            setErrorMessage(Array.from(errorCreateAccount.values()));
            setHasErrorCode(hasErrorCreateAccount);
            setOtpCode(null);
        }
    }, [errorCreateAccount, hasErrorCreateAccount]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (optCode && optCode.length === 4 && phone) {
            if (actionType === 'create_customer') {
                handleCreateAccountOTP({
                    otp: optCode,
                    phoneNumber: phone,
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    rootPage
                });
            }
            if (actionType === 'signin') {
                handleAfterLogin({
                    otp: optCode,
                    phoneNumber: phone,
                    rootPage
                });
            }
        }
    }, [optCode, phone]); // eslint-disable-line react-hooks/exhaustive-deps

    const onResendOTP = () => {
        if (phone) {
            const countResend = countResendOTP + 1;
            setCountResendOTP(countResend);
            setErrorMessage(null);
            setHasErrorCode(false);
            handleSubmit({
                phone,
                needToNavigate: false,
                resend: countResend,
                eventType: eventTypeOTP
            });
        }
    };

    if (isBusy || isLoading) {
        return (
            <div className={classes.modal_active}>
                <LoadingIndicator global={true}>
                    <FormattedMessage
                        id={'verification.title'}
                        defaultMessage={'Verification code'}
                    />
                </LoadingIndicator>
            </div>
        );
    }

    return (
        <div className={classes.container}>
            <div
                className={`${classes.root} ${classes.verify} ${
                    mobile ? classes.rootMobile : ''
                } ${tablet ? classes.rootTablet : ''}`}
            >
                <div className={classes.header}>
                    <div className={classes.title}>
                        <FormattedMessage
                            id={'verification.title'}
                            defaultMessage={'Verification code'}
                        />
                    </div>
                    <div className={classes.subTitle}>
                        <FormattedMessage
                            id={'verification.subTitleEnterCode'}
                            defaultMessage={
                                'We have to sent the code verification to your mobile phone and your email'
                            }
                        />
                    </div>
                </div>
                <div className={classes.footer}>
                    <VerifyPhone
                        optCode={optCode}
                        setOtpCode={setOtpCode}
                        hasErrorCode={hasErrorCode}
                    />
                    {errorMessage && (
                        <FormError
                            className={classes.formError}
                            errors={errorMessage}
                        />
                    )}
                </div>
                <div
                    className={`${classes.countdown} ${
                        rtl ? classes.countdownRtl : ''
                    }`}
                >
                    <div className={classes.miniTitle}>
                        <FormattedMessage
                            id={'verification.expired'}
                            defaultMessage={'Expired '}
                        />
                        <CountDown
                            sec={time}
                            isTimeUp={e => setIsResend(e)}
                            classes={{
                                inputCountdown: classes.inputCountdown
                            }}
                        />
                    </div>
                    {isResend ? (
                        <Button
                            className={classes.miniTitle}
                            onClick={() => onResendOTP()}
                        >
                            <FormattedMessage
                                id={'verification.resendCode'}
                                defaultMessage={'Resent code '}
                            />
                        </Button>
                    ) : (
                        <div />
                    )}
                </div>
                {/* {isResend && (
                    <div className={classes.resendButton}>
                        <Button
                            priority="high"
                            onClick={() => onResendOTP()}
                            className={classes.submitButton}
                        >
                            <FormattedMessage
                                id={'verification.verifyAccount'}
                                defaultMessage={'Verify Account'}
                            />
                        </Button>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default VerificationPage;
