import { useState, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery } from '@apollo/client';
import {
    checkValidPhoneNumber,
    convertEnglishNumber
} from '@magento/peregrine/lib/util/common';
import DEFAULT_OPERATIONS from './updateUserPhone.gql';
import { useAppContext } from '../../context/app';

const STEP = {
    ENTER_PHONE: 1,
    VERIFY_PHONE: 2
};

export const useUpdateUserPhone = props => {
    // * STATE
    const { formatMessage } = useIntl();
    const { customer, defaultPhoneCode } = props;

    const phoneExistMessage = formatMessage({
        id: 'updateUserPhone.phoneExistMessage',
        defaultMessage: 'This phone number already exists'
    });

    const defaultErrorMessage = formatMessage({
        id: 'updateUserPhone.somethingWentWrong',
        defaultMessage: 'Somethings went wrong'
    });

    const {
        checkMobileExistMutation,
        sendOtpToCustomerMutation,
        updateUserPhoneMutation,
        getCustomerQuery
    } = DEFAULT_OPERATIONS;

    const [phone, updatePhone] = useState('');
    const [isValidPhone, updateIsValidPhone] = useState(false);

    const [currentStep, updateCurrentStep] = useState(STEP.ENTER_PHONE);
    const [isLoading, updateIsLoading] = useState(false);
    const [errorMessage, updateErrorMessage] = useState('');

    useEffect(() => {
        if (customer && defaultPhoneCode) {
            const _phone = customer?.customer_mobile?.replace(
                defaultPhoneCode,
                ''
            );
            const __phone = convertEnglishNumber(_phone);
            updatePhone(__phone);
        }
    }, [customer, defaultPhoneCode]);

    const [{ storeConfig }] = useAppContext();

    // * GRAPHQL
    const [checkMobileExist, { error: checkMobileExistError }] = useMutation(
        checkMobileExistMutation
    );
    const [sendOtpToCustomer, { error: sendOtpToCustomerError }] = useMutation(
        sendOtpToCustomerMutation
    );
    const [updateUserPhone, { error: updateUserPhoneError }] = useMutation(
        updateUserPhoneMutation
    );

    const { data: customerData, loading, error: getCustomerError } = useQuery(
        getCustomerQuery,
        {
            fetchPolicy: 'no-cache'
        }
    );

    // * HANDLE STATE CHANGE
    function onChangePhone(value) {
        const _value = convertEnglishNumber(value);
        updatePhone(_value);
        updateIsValidPhone(checkValidPhoneNumber(_value));
    }

    async function onChangeVerifyCode(code) {
        if (code && code.length === 4) {
            if (currentStep === STEP.VERIFY_PHONE) {
                try {
                    const { customer: cusData } = customerData || {};
                    const { email } = cusData || {};
                    // TODO
                    const _phone = phone?.includes(defaultPhoneCode)
                        ? phone
                        : `${defaultPhoneCode}${phone}`;

                    updateIsLoading(true);
                    const response = await updateUserPhone({
                        variables: {
                            mobile: _phone,
                            otp: code,
                            email: email
                        }
                    });
                    updateIsLoading(false);

                    const { data } = response;
                    const { updateCustomerWithOtp: dataRes } = data || {};
                    const { customer } = dataRes || {};

                    if (customer) {
                        // TODO
                        window.open('/account-information', '_self');
                    }
                } catch (error) {
                    updateIsLoading(false);
                }
            }
        }
    }

    // * HANDLE ACTIONS
    async function onContinue() {
        if (currentStep === STEP.ENTER_PHONE) {
            try {
                const _phone = phone?.includes(defaultPhoneCode)
                    ? phone
                    : `${defaultPhoneCode}${phone}`;
                updateIsLoading(true);
                updateErrorMessage('');
                const { customer: cusData } = customerData || {};
                const { email } = cusData || {};
                const response = await checkMobileExist({
                    variables: {
                        mobile: _phone
                    }
                });
                const { data } = response;
                const resIpAddress = await fetch(
                    'https://geolocation-db.com/json/'
                )
                    .then(res => res.json())
                    .catch(err => console.log(err));
                const { IPv4 } = resIpAddress || {};
                const { checkMobileExist: dataRes } = data || {};
                const { status } = dataRes || {};

                if (!status) {
                    const responseOtp = await sendOtpToCustomer({
                        variables: {
                            mobile: _phone,
                            resend: 0,
                            storeId: storeConfig.id,
                            eventType: 'customer_account_edit_otp',
                            ipAddress: IPv4 || '',
                            email: email || ''
                        }
                    });
                    const { data: dataOtp } = responseOtp || {};
                    const { sendOtpToCustomer: resOtp } = dataOtp || {};
                    const { status: statusOtp } = resOtp || {};

                    if (statusOtp) {
                        updateCurrentStep(STEP.VERIFY_PHONE);
                    } else {
                        updateErrorMessage(defaultErrorMessage);
                    }
                } else {
                    updateErrorMessage(phoneExistMessage);
                }

                updateIsLoading(false);
            } catch (error) {
                updateIsLoading(false);
            }
        } else if (currentStep === STEP.VERIFY_PHONE) {
            // TODO
        }
    }

    async function onResendOtp(count) {
        try {
            updateIsLoading(true);
            await sendOtpToCustomer({
                variables: {
                    mobile: _phone,
                    resend: count,
                    storeId: storeConfig.id,
                    eventType: 'customer_account_edit_otp'
                }
            });
            updateIsLoading(false);
        } catch (error) {
            updateIsLoading(false);
        }
    }

    const errors = useMemo(
        () =>
            new Map([
                ['checkMobileExistMutation', checkMobileExistError],
                ['sendOtpToCustomerMutation', sendOtpToCustomerError],
                ['updateUserPhoneMutation', updateUserPhoneError],
                ['getCustomerQuery', getCustomerError]
            ]),
        [
            checkMobileExistError,
            sendOtpToCustomerError,
            updateUserPhoneError,
            getCustomerError
        ]
    );

    return {
        STEP,
        currentStep,
        isValidPhone,
        phone,
        isLoading: isLoading || loading,
        errorMessage,
        errors,
        onChangePhone,
        onChangeVerifyCode,
        onContinue,
        onResendOtp
    };
};
