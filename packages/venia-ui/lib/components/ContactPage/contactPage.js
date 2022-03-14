import React, { createRef, Fragment, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form } from 'informed';
import ReactModal from 'react-modal';
import ReCAPTCHA from 'react-google-recaptcha';

import Field from '../Field';
import TextInput from '../TextInput';
import TextArea from '../TextArea';
import Button from '../Button';
import { fullPageLoadingIndicator } from '../LoadingIndicator';

import defaultClasses from './contactPage.css';
import { mergeClasses } from '../../classify';

import { isRequired } from '../../util/formValidators';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useContactPage } from '@magento/peregrine/lib/talons/ContactPage/useContactPage';
import { SUBMIT_CONTACT_US } from './contactPage.gql';
import { SITE_KEY_RECAPTCHA } from '@magento/venia-ui/lib/constants/constants';

const ContactPage = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const formRef = useRef(null);
    const [{ mobile, rtl }] = useAppContext();
    const { formatMessage } = useIntl();
    const recaptchaRef = createRef();

    const talonProps = useContactPage({
        submitContactUs: SUBMIT_CONTACT_US
    });

    const {
        errorMessage,
        loading,
        handleSubmitForm,
        onCloseErrorModal,
        recaptchaProps,
        isDisabledSubmit
    } = talonProps;

    const actionButton = (
        <div className={classes.buttonsNewCus}>
            <Button
                className={classes.submitButton}
                type="submit"
                priority="high"
                disabled={isDisabledSubmit}
            >
                {formatMessage({
                    id: 'contactPage.submit',
                    defaultMessage: 'Submit'
                })}
            </Button>
        </div>
    );

    const formComs = (
        <Fragment>
            <Form
                className={classes.rootContent}
                onSubmit={value => {
                    handleSubmitForm(value, formRef);
                }}
            >
                <div className={classes.email}>
                    <Field
                        id="Name"
                        isRequired={true}
                        label={formatMessage({
                            id: 'contactPage.name',
                            defaultMessage: 'Name'
                        })}
                        required
                    >
                        <TextInput field="name" validate={isRequired} />
                    </Field>
                </div>
                <div className={classes.email}>
                    <Field
                        id="EmailContact"
                        isRequired={true}
                        label={formatMessage({
                            id: 'contactPage.email',
                            defaultMessage: 'Email'
                        })}
                        required
                    >
                        <TextInput
                            type="email"
                            field="email"
                            validate={isRequired}
                        />
                    </Field>
                </div>
                <div className={classes.mobile}>
                    <Field
                        id="Mobile"
                        isRequired={true}
                        label={formatMessage({
                            id: 'contactPage.phoneNumber',
                            defaultMessage: 'Phone Number'
                        })}
                        required
                    >
                        <TextInput
                            type={'phone'}
                            field="phonenumber"
                            validate={isRequired}
                        />
                    </Field>
                </div>
                <div className={classes.note}>
                    <Field
                        id="note"
                        isRequired={true}
                        label={formatMessage({
                            id: 'contactPage.content',
                            defaultMessage: 'Content'
                        })}
                        required
                    >
                        <TextArea field="note" validate={isRequired} />
                    </Field>
                </div>
                <div className={classes.textRequired}>
                    <FormattedMessage
                        id={'contactPage.allFiledRequired'}
                        defaultMessage={'* All fields are required'}
                    />
                </div>
                {actionButton}
            </Form>
        </Fragment>
    );

    const customStyles = {
        overlay: {
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
        },
        content: {
            top: '50%',
            left: '50%',
            right: mobile ? '20%' : 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)'
        }
    };

    const contentModal = (
        <ReactModal
            isOpen={errorMessage ? true : false}
            style={customStyles}
            shouldCloseOnOverlayClick={true}
            contentLabel=""
            ariaHideApp={false}
            onRequestClose={onCloseErrorModal}
        >
            <span className={classes.errorMessage}>{errorMessage || ''}</span>
        </ReactModal>
    );

    return (
        <div className={classes.root}>
            <div className={classes.heading}>
                <FormattedMessage
                    id={'contactPage.title'}
                    defaultMessage={'Contact Us'}
                />
            </div>
            <div className={classes.rootContainer}>
                <div
                    ref={formRef}
                    className={classes.registeredCustomerContent}
                >
                    {formComs}
                    <ReCAPTCHA
                        {...recaptchaProps}
                        ref={recaptchaRef}
                        sitekey={SITE_KEY_RECAPTCHA}
                        hl={rtl ? 'ar' : 'en'}
                    />
                </div>
            </div>
            {contentModal}
            {loading && fullPageLoadingIndicator}
        </div>
    );
};

export default ContactPage;
