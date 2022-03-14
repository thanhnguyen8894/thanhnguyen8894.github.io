import React, { Fragment } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { func, shape, string } from 'prop-types';

import { useForgotPassword } from '@magento/peregrine/lib/talons/ForgotPassword/useForgotPassword';

import FormErrors from '../FormError';
import { mergeClasses } from '../../classify';
import ForgotPasswordForm from './ForgotPasswordForm';
import FormSubmissionSuccessful from './FormSubmissionSuccessful';
import { fullPageLoadingIndicator } from '../LoadingIndicator';

import forgotPasswordOperations from './forgotPassword.gql';

import defaultClasses from './forgotPassword.css';

const ForgotPassword = props => {
    const { initialValues, onCancel } = props;

    const { formatMessage } = useIntl();
    const talonProps = useForgotPassword({
        onCancel,
        ...forgotPasswordOperations
    });

    const {
        forgotPasswordEmail,
        formErrors,
        handleCancel,
        handleFormSubmit,
        hasCompleted,
        isResettingPassword
    } = talonProps;

    const classes = mergeClasses(defaultClasses, props.classes);
    const INSTRUCTIONS = formatMessage({
        id: 'forgotPassword.instructions',
        defaultMessage:
            'Please enter the email address associated with this account.'
    });
    const children = hasCompleted ? (
        <FormSubmissionSuccessful email={forgotPasswordEmail} />
    ) : (
        <Fragment>
            <div className={classes.title}>
                <FormattedMessage
                    id={'forgotPassword.recoverPasswordText'}
                    defaultMessage={'Recover Password'}
                />
            </div>
            <p className={classes.instructions}>{INSTRUCTIONS}</p>

            <div className={classes.rootContainer}>
                <div className={classes.registeredCustomerContent}>
                    <ForgotPasswordForm
                        initialValues={initialValues}
                        isResettingPassword={isResettingPassword}
                        onSubmit={handleFormSubmit}
                        onCancel={handleCancel}
                    />
                </div>
            </div>

            <FormErrors errors={formErrors} />
        </Fragment>
    );

    return (
        <div className={classes.root}>
            {children}
            {isResettingPassword && fullPageLoadingIndicator}
        </div>
    );
};

export default ForgotPassword;

ForgotPassword.propTypes = {
    classes: shape({
        instructions: string,
        root: string
    }),
    initialValues: shape({
        email: string
    }),
    onCancel: func
};

ForgotPassword.defaultProps = {
    onCancel: () => {}
};
