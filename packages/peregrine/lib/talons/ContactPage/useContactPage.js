import { useCallback, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useIntl } from 'react-intl';

export const useContactPage = props => {
    const { submitContactUs } = props;
    const { formatMessage } = useIntl();

    const [errorMessage, setErrorMessage] = useState('');
    const [isConfirmReCaptcha, setIsConfirmReCaptcha] = useState(null);

    function onDisplayDefaultError() {
        const message = formatMessage({
            id: 'checkoutPage.errorSubmit',
            defaultMessage:
                'Oops! An error occurred while submitting. Please try again.'
        });
        setErrorMessage(message);
    }

    function onCloseErrorModal() {
        setErrorMessage('');
    }

    function onChange(value) {
        setIsConfirmReCaptcha(value);
    }

    const isDisabledSubmit = useMemo(() => {
        return isConfirmReCaptcha === null;
    }, [isConfirmReCaptcha]);

    function onExpired() {
        setIsConfirmReCaptcha(null);
    }

    const recaptchaProps = useMemo(() => {
        return {
            onChange,
            onExpired
        };
    }, []);

    const [callSubmitContactUs, { loading }] = useMutation(submitContactUs, {
        fetchPolicy: 'no-cache'
    });

    const handleSubmitForm = useCallback(async (value, formRef) => {
        try {
            const { name, email, phonenumber, note } = value || {};
            const response = await callSubmitContactUs({
                variables: {
                    name: name,
                    email: email,
                    telephone: phonenumber,
                    comment: note
                }
            });
            const { data } = response || {};

            const { submitContactUs } = data || {};
            const { status, message } = submitContactUs || {};
            const { current } = formRef || {};

            if (status && current) {
                const form = current.children[0];
                form.reset();
            }

            setErrorMessage(message);
        } catch (error) {
            onDisplayDefaultError();
        }
    }, []);

    return {
        errorMessage,
        loading,
        onCloseErrorModal,
        handleSubmitForm,
        recaptchaProps,
        isDisabledSubmit
    };
};
