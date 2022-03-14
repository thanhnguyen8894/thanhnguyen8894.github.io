import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FormattedMessage } from 'react-intl';
import { Redirect } from '@magento/venia-drivers';

import { useUpdateUserPhone } from '@magento/peregrine/lib/talons/UpdateUserPhone/useUpdateUserPhone';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useUserContext } from '@magento/peregrine/lib/context/user';

import { fullPageLoadingIndicator } from '../LoadingIndicator';
import Button from '../Button';
import VerifyPhone from '../VerificationPage/verifyPhone';
import CountDown from '../VerificationPage/countdown';
import FormError from '../FormError';

import { mergeClasses } from '../../classify';
import defaultClasses from './updateUserPhone.css';

const timeCountDown = 60;

function UpdateUserPhonePage(props) {
    const classes = mergeClasses(defaultClasses, props.classes);
    const [{ mobile, tablet, rtl }] = useAppContext();
    const [{ isSignedIn }] = useUserContext();

    const [isResend, setIsResend] = useState(false);
    const [time, setTime] = useState(timeCountDown);
    const [countResendOTP, setCountResendOTP] = useState(0);

    const {
        STEP,
        currentStep,
        isValidPhone,
        defaultPhoneCode,
        phone,
        isLoading,
        errorMessage,
        errors,
        onChangePhone,
        onChangeVerifyCode,
        onContinue,
        onResendOtp
    } = useUpdateUserPhone({});

    const onResendOTP = () => {
        if (phone) {
            const countResend = countResendOTP + 1;
            setCountResendOTP(countResend);
            setTime(timeCountDown);
            onResendOtp(countResend);
            setIsResend(false);
        }
    };

    const errorComs = errors && (
        <FormError errors={Array.from(errors.values())} />
    );

    const errorMessageComs = errorMessage && (
        <p className={classes.errorText}>{errorMessage}</p>
    );

    const phoneInput = currentStep === STEP.ENTER_PHONE && (
        <PhoneInput
            country={defaultPhoneCode}
            value={phone}
            onChange={onChangePhone}
            inputClass={classes.phone}
            buttonClass={classes.flagButton}
            inputProps={{ name: 'phone', required: true }}
            masks={{ sa: '... - ... - ...' }}
            placeholder="+966 000 - 000 - 000"
        />
    );

    const verifyInput = currentStep === STEP.VERIFY_PHONE && (
        <VerifyPhone onChange={onChangeVerifyCode} />
    );

    const buttonSubmit = currentStep === STEP.ENTER_PHONE && (
        <div className={classes.action}>
            <Button
                priority="high"
                onClick={onContinue}
                disabled={!isValidPhone && currentStep === STEP.ENTER_PHONE}
                className={classes.submit}
            >
                <FormattedMessage
                    id={'updateUserPhone.continue'}
                    defaultMessage={'Continue'}
                />
            </Button>
        </div>
    );

    const countdownComs = currentStep === STEP.VERIFY_PHONE && !isResend && (
        <div
            className={`${classes.countdown} ${
                rtl ? classes.countdownRtl : ''
            }`}
        >
            <CountDown sec={time} isTimeUp={e => setIsResend(e)} />
        </div>
    );

    const buttonResend = currentStep === STEP.VERIFY_PHONE && isResend && (
        <div className={classes.resendButton}>
            <Button
                priority="high"
                onClick={() => onResendOTP()}
                className={classes.submitButton}
            >
                <FormattedMessage
                    id={'updateUserPhone.resendOTP'}
                    defaultMessage={'Resend OTP'}
                />
            </Button>
        </div>
    );

    if (!isSignedIn) {
        return <Redirect to="/" />;
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
                            id={'updateUserPhone.title'}
                            defaultMessage={'Verification'}
                        />
                    </div>
                    <div className={classes.subTitle}>
                        <FormattedMessage
                            id={'updateUserPhone.subTitleEnterPhone'}
                            defaultMessage={
                                'To sign in, add your mobile number below, and a text message will be sent to verify the number added.'
                            }
                        />
                    </div>
                    {errorComs}
                    {errorMessageComs}
                </div>
                <div className={`${classes.footer}`}>
                    <div className={classes.formAccount}>
                        {phoneInput}
                        {verifyInput}
                        {buttonSubmit}
                    </div>
                </div>
                {countdownComs}
                {buttonResend}
            </div>
            {isLoading && fullPageLoadingIndicator}
        </div>
    );
}

export default UpdateUserPhonePage;
