import React, { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Redirect } from '@magento/venia-drivers';

//Redux/Context
import { useAccountInformationPage } from '@magento/peregrine/lib/talons/AccountInformationPage/useAccountInformationPage';
import { useUpdateUserPhone } from '@magento/peregrine/lib/talons/UpdateUserPhone/useUpdateUserPhone';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useUpdateUserEmail } from '@magento/peregrine/lib/talons/AccountInformationPage/useUpdateUserEmail';

//Styles
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './accountInformationPage.css';

//GraphQL
import AccountInformationPageOperations from './accountInformationPage.gql.js';

//Helper/Constants
import {
    getCountryCodeByCountry,
    getPhoneImgByCountry,
    getPhoneMaskByCountry
} from '@magento/peregrine/lib/util/common';

//Components
import { fullPageLoadingIndicator } from '../LoadingIndicator';
import OtpInput from 'react-otp-input';
import { Form } from 'informed';
import FormError from '../FormError';
import Field from '../Field';
import Button from '../Button';
import Select from '../Select';
import TextInput from '../TextInput';
import CountDown from '../VerificationPage/countdown';
import editIcon from '@magento/venia-ui/venia-static/icons/pen.png';
import { BrowserPersistence } from '@magento/peregrine/lib/util';
import PhoneInputCustom from '../PhoneInputCustom/phoneInputCustom';

const timeCountDown = 60;
const storage = new BrowserPersistence();

const AccountInformationPage = props => {
    const [{ mobile }] = useAppContext();
    const { formatMessage } = useIntl();
    const classes = mergeClasses(defaultClasses, props.classes);

    const storeCodeTwoLetter =
        storage.getItem('store_view_country')?.toLowerCase() || 'sa';
    const loginLink = '/login';
    const defaultPhoneCode = getCountryCodeByCountry(storeCodeTwoLetter);

    const talonProps = useAccountInformationPage({
        ...AccountInformationPageOperations
    });

    const {
        isBusy,
        customer,
        setIsBusy,
        isSignedIn,
        onEditForm,
        handleSubmit,
        disabledForm,
        initialValues,
        addressDefault,
        setDisabledForm,
        isWalletEnable,
        dob,
        updateDob
    } = talonProps;

    const {
        STEP,
        currentStep,
        isValidPhone,
        phone,
        isLoading,
        errorMessage,
        errors,
        onChangePhone,
        onChangeVerifyCode,
        onContinue,
        onResendOtp
    } = useUpdateUserPhone({ customer, defaultPhoneCode });

    const {
        email,
        isValidEmail,
        isLoading: isLoadingEmail,
        errorMessage: errorMessageEmail,
        errors: errorsEmail,
        onChangeEmail,
        onUpdateEmail
    } = useUpdateUserEmail({ customer });

    const emailNotChange = customer && customer.email === email;

    const [showButtonUpdate, setShowButtonUpdate] = useState(false);
    const [showButtonEmailUpdate, setShowButtonEmailUpdate] = useState(false);
    const [optCode, setOtpCode] = useState();
    const [isResend, setIsResend] = useState(false);
    const [time, setTime] = useState(timeCountDown);
    const [countResendOTP, setCountResendOTP] = useState(0);

    const onResendOTP = () => {
        if (phone) {
            const countResend = countResendOTP + 1;
            setCountResendOTP(countResend);
            setTime(timeCountDown);
            onResendOtp(countResend);
            setIsResend(false);
        }
    };

    const handleChange = event => {
        setOtpCode(event);
        onChangeVerifyCode(event);
    };

    const handleFocus = e => {
        setShowButtonUpdate(true);
    };

    const onCancel = () => {
        const newDisabledForm = { ...disabledForm };
        newDisabledForm['contact'] = true;
        setDisabledForm(newDisabledForm);
        setShowButtonUpdate(false);
        setIsBusy(false);
    };

    const errorComs = errors && (
        <FormError errors={Array.from(errors.values())} />
    );

    const errorEmailComs = errorsEmail && (
        <FormError errors={Array.from(errorsEmail.values())} />
    );

    const errorMessageComs = errorMessage && (
        <p className={classes.errorText}>{errorMessage}</p>
    );

    const _phone = useMemo(() => {
        return phone?.includes(defaultPhoneCode)
            ? phone
            : `${defaultPhoneCode}${phone}`;
    }, [defaultPhoneCode, phone]);

    const phoneNotChange = useMemo(() => {
        return customer?.customer_mobile == _phone;
    }, [_phone, customer]);

    if (!isSignedIn) {
        return <Redirect to={loginLink} />;
    }

    const buttonUpdate = currentStep === STEP.ENTER_PHONE && (
        <Button
            disabled={!isValidPhone}
            priority="high"
            onClick={phoneNotChange ? onCancel : onContinue}
            classes={{ root_highPriority: classes.submitButton }}
        >
            {phoneNotChange ? (
                <FormattedMessage
                    id={'global.cancelButton'}
                    defaultMessage={'Cancel'}
                />
            ) : (
                <FormattedMessage
                    id={'productForm.submit'}
                    defaultMessage={'Update'}
                />
            )}
        </Button>
    );

    const buttonResend = currentStep === STEP.VERIFY_PHONE && isResend && (
        <Button
            disabled={!isValidPhone}
            priority="high"
            onClick={onResendOTP}
            classes={{
                root_highPriority: classes.submitButton,
                content: classes.textButton
            }}
        >
            <FormattedMessage
                id={'updateUserPhone.resendOTP'}
                defaultMessage={'Resend OTP'}
            />
        </Button>
    );

    const countdownComs = currentStep === STEP.VERIFY_PHONE && !isResend && (
        <div className={classes.countdown}>
            <CountDown sec={time} isTimeUp={e => setIsResend(e)} />
        </div>
    );

    const { onTransHistoryPress } = props || {};
    const walletProfile = (
        <div>
            <div className={classes.titleRow}>
                <h3 className={classes.itemTitle}>
                    <FormattedMessage
                        id={'myWallet.walletCreditInfo'}
                        defaultMessage={'Wallet Credit Information'}
                    />
                </h3>
            </div>
            <div className={classes.profileContentLeft}>
                <div className={classes.walletTitle}>
                    <FormattedMessage
                        id={'myWallet.walletCredit'}
                        defaultMessage={'Wallet Credit'}
                    />
                    <h3 className={classes.walletValue}>{`SAR ${
                        customer && customer.wallet_credit
                            ? customer.wallet_credit
                            : 0
                    }`}</h3>
                </div>
            </div>
            <div
                className={classes.textLink}
                onClick={() => {
                    onTransHistoryPress && onTransHistoryPress();
                }}
            >
                <FormattedMessage
                    id={'myWallet.creditTransactionHistory'}
                    defaultMessage={'Credit Transaction History'}
                />
            </div>
        </div>
    );

    return (
        <div className={mobile ? classes.rootMobile : classes.root}>
            <h2 className={classes.heading}>
                <FormattedMessage
                    id={'accountInformationPage.title'}
                    defaultMessage={'PERSONAL INFORMATION'}
                />
            </h2>
            <h4 className={classes.subHeading}>
                <FormattedMessage
                    id={'accountInformationPage.informationText'}
                    defaultMessage={
                        'You can add private information about youself'
                    }
                />
            </h4>
            {customer && (
                <div className={classes.main}>
                    {isWalletEnable && walletProfile}
                    <div className={classes.titleRow}>
                        <h3 className={classes.itemTitle}>
                            <FormattedMessage
                                id={'accountInformationPage.informationPrivate'}
                                defaultMessage={'Private information'}
                            />
                        </h3>
                        <div
                            className={`${classes.editBlock} ${
                                isBusy ? classes.busy : ''
                            }`}
                            onClick={() => onEditForm('informationPrivate')}
                        >
                            <img src={editIcon} alt="edit" />
                            <div className={classes.editText}>
                                <FormattedMessage
                                    id={'accountInformationPage.edit'}
                                    defaultMessage={'Edit'}
                                />
                            </div>
                        </div>
                    </div>
                    <Form initialValues={initialValues} onSubmit={handleSubmit}>
                        <div className={classes.group}>
                            <Field>
                                <TextInput
                                    field="customer.firstname"
                                    validateOnBlur
                                    maskOnBlur={true}
                                    placeholder={formatMessage({
                                        id: 'global.firstName',
                                        defaultMessage: 'First Name'
                                    })}
                                    isDisabled={disabledForm.informationPrivate}
                                />
                            </Field>
                            <Field>
                                <TextInput
                                    field="customer.lastname"
                                    validateOnBlur
                                    maskOnBlur={true}
                                    placeholder={formatMessage({
                                        id: 'global.lastName',
                                        defaultMessage: 'Last Name'
                                    })}
                                    isDisabled={disabledForm.informationPrivate}
                                />
                            </Field>
                            <div className={classes.dobBlock}>
                                <input
                                    className={classes.inputDob}
                                    type="date"
                                    value={dob || 'YYYY-MM-DD'}
                                    disabled={disabledForm.informationPrivate}
                                    onChange={event => {
                                        updateDob(event.target.value);
                                    }}
                                    placeholder="yyyy-mm-dd"
                                />
                            </div>
                            <Field>
                                <Select
                                    field="customer.gender"
                                    initialLabel={formatMessage({
                                        id: 'global.man',
                                        defaultMessage: 'Man'
                                    })}
                                    isHideInitialOption
                                    disabled={disabledForm.informationPrivate}
                                    items={[
                                        {
                                            value: 0,
                                            label: formatMessage({
                                                id: 'global.man',
                                                defaultMessage: 'Man'
                                            })
                                        },
                                        {
                                            value: 1,
                                            label: formatMessage({
                                                id: 'global.woman',
                                                defaultMessage: 'Woman'
                                            })
                                        },
                                        {
                                            value: 2,
                                            label: formatMessage({
                                                id: 'global.other',
                                                defaultMessage: 'Other'
                                            })
                                        }
                                    ]}
                                />
                            </Field>
                        </div>
                        {!disabledForm.informationPrivate && (
                            <div className={classes.containerButton}>
                                <Button
                                    priority="high"
                                    type="submit"
                                    classes={{
                                        root_highPriority: classes.submitButton
                                    }}
                                >
                                    <FormattedMessage
                                        id={'productForm.submit'}
                                        defaultMessage={'Update'}
                                    />
                                </Button>
                            </div>
                        )}
                    </Form>
                    <div className={classes.titleRow}>
                        <h3 className={classes.itemTitle}>
                            <FormattedMessage
                                id={'accountInformationPage.contact'}
                                defaultMessage={'Contact'}
                            />
                        </h3>
                        <div
                            className={`${classes.editBlock} ${
                                isBusy ? classes.busy : ''
                            }`}
                            onClick={() => onEditForm('contact')}
                        >
                            <img src={editIcon} alt="edit" />
                            <div className={classes.editText}>
                                <FormattedMessage
                                    id={'accountInformationPage.edit'}
                                    defaultMessage={'Edit'}
                                />
                            </div>
                        </div>
                    </div>
                    <Form className={classes.group}>
                        <div>
                            <PhoneInputCustom
                                countryCode={defaultPhoneCode}
                                countryImg={getPhoneImgByCountry(
                                    storeCodeTwoLetter
                                )}
                                mask={getPhoneMaskByCountry(storeCodeTwoLetter)}
                                isValid={isValidPhone}
                                value={phone}
                                disabled={
                                    disabledForm.contact ||
                                    currentStep === STEP.VERIFY_PHONE
                                }
                                onChange={onChangePhone}
                                onFocus={handleFocus}
                            />
                            {showButtonUpdate && (
                                <div className={classes.containerOTP}>
                                    {currentStep === STEP.VERIFY_PHONE ? (
                                        <OtpInput
                                            value={optCode}
                                            onChange={handleChange}
                                            isInputNum={true}
                                            shouldAutoFocus={true}
                                            // hasErrored={hasErrorCode}
                                            numInputs={4}
                                            containerStyle={classes.otpControl}
                                            inputStyle={{
                                                width: '40px',
                                                height: '40px',
                                                margin: '0 10px 0 0',
                                                fontSize: '14px',
                                                border:
                                                    '1px solid var(--venia-black-color)',
                                                color:
                                                    'var(--venia-black-color)'
                                            }}
                                            focusStyle={{
                                                border: '1px solid #202020'
                                            }}
                                            errorStyle={{
                                                border: '1px solid red'
                                            }}
                                        />
                                    ) : (
                                        <div />
                                    )}
                                    {buttonUpdate}
                                    {buttonResend}
                                    {countdownComs}
                                </div>
                            )}
                            {isLoading && fullPageLoadingIndicator}
                            {errorComs}
                            {errorMessageComs}
                        </div>
                        <div>
                            <Field>
                                <TextInput
                                    field="customer.email"
                                    validateOnBlur
                                    maskOnBlur={true}
                                    placeholder={formatMessage({
                                        id:
                                            'forgotPasswordForm.emailAddressText',
                                        defaultMessage: 'Email address'
                                    })}
                                    initialValue={customer.email}
                                    value={email}
                                    isDisabled={disabledForm.contact}
                                    onFocus={() =>
                                        setShowButtonEmailUpdate(true)
                                    }
                                    onValueChange={value => {
                                        onChangeEmail(value);
                                    }}
                                />
                            </Field>
                            {showButtonEmailUpdate && !emailNotChange && (
                                <div className={classes.containerEmail}>
                                    <Button
                                        disabled={
                                            !isValidEmail && !emailNotChange
                                        }
                                        priority="high"
                                        onClick={() => {
                                            // if (emailNotChange) {
                                            //     setShowButtonEmailUpdate(false);
                                            // } else {
                                            //     onUpdateEmail();
                                            // }
                                            onUpdateEmail();
                                        }}
                                        classes={{
                                            root_highPriority:
                                                classes.submitButton
                                        }}
                                    >
                                        <FormattedMessage
                                            id={'productForm.submit'}
                                            defaultMessage={'Update'}
                                        />
                                    </Button>
                                </div>
                            )}
                            {errorEmailComs}
                            {isLoadingEmail && fullPageLoadingIndicator}
                        </div>
                    </Form>
                    <div className={classes.titleRow}>
                        <h3 className={classes.itemTitle}>
                            <FormattedMessage
                                id={'accountInformationPage.address'}
                                defaultMessage={'Address'}
                            />
                        </h3>
                        <div
                            className={`${classes.editBlock} ${
                                isBusy ? classes.busy : ''
                            }`}
                            onClick={() => onEditForm('address')}
                        >
                            <img src={editIcon} alt="edit" />
                            <div className={classes.editText}>
                                <FormattedMessage
                                    id={'accountInformationPage.edit'}
                                    defaultMessage={'Edit'}
                                />
                            </div>
                        </div>
                    </div>
                    <Form
                        initialValues={addressDefault}
                        onSubmit={handleSubmit}
                    >
                        <div className={classes.group}>
                            <Field>
                                <TextInput
                                    field="address_default[0].city"
                                    validateOnBlur
                                    maskOnBlur={true}
                                    placeholder={formatMessage({
                                        id: 'accountInformationPage.cityName',
                                        defaultMessage: 'City Name'
                                    })}
                                    isDisabled={disabledForm.address}
                                />
                            </Field>
                            <Field>
                                <TextInput
                                    field="address_default[0].region.region"
                                    validateOnBlur
                                    maskOnBlur={true}
                                    placeholder={formatMessage({
                                        id:
                                            'accountInformationPage.districtName',
                                        defaultMessage: 'District Name'
                                    })}
                                    isDisabled={disabledForm.address}
                                />
                            </Field>
                            <Field>
                                <TextInput
                                    field="address_default[0].street[0]"
                                    validateOnBlur
                                    maskOnBlur={true}
                                    placeholder={formatMessage({
                                        id: 'accountInformationPage.streetName',
                                        defaultMessage: 'Street Name'
                                    })}
                                    isDisabled={disabledForm.address}
                                />
                            </Field>
                            <Field>
                                <TextInput
                                    field="address_default[0].postcode"
                                    validateOnBlur
                                    maskOnBlur={true}
                                    placeholder={formatMessage({
                                        id:
                                            'accountInformationPage.addressNumber',
                                        defaultMessage: 'Address Number'
                                    })}
                                    isDisabled={disabledForm.address}
                                />
                            </Field>
                        </div>
                        {!disabledForm.address && (
                            <div className={classes.containerButton}>
                                <Button
                                    priority="high"
                                    type="submit"
                                    classes={{
                                        root_highPriority: classes.submitButton
                                    }}
                                >
                                    <FormattedMessage
                                        id={'productForm.submit'}
                                        defaultMessage={'Update'}
                                    />
                                </Button>
                            </div>
                        )}
                    </Form>
                </div>
            )}
        </div>
    );
};

export default AccountInformationPage;
