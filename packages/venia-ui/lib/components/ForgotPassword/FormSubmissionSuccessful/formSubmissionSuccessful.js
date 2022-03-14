import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shape, string } from 'prop-types';

import { mergeClasses } from '../../../classify';
import defaultClasses from './formSubmissionSuccessful.css';

const FormSubmissionSuccessful = props => {
    const { email } = props;
    const { formatMessage } = useIntl();
    const classes = mergeClasses(defaultClasses, props.classes);

    const textMessage = formatMessage(
        {
            id: 'formSubmissionSuccessful.textMessage',
            defaultMessage:
                'If there is an account associated with your email address, you will receive an email with a link to change your password.'
        },
        { email }
    );

    return (
        <div className={classes.root}>
            <div className={classes.title}>
                <FormattedMessage
                    id={'formSubmissionSuccessful.recoverPasswordText'}
                    defaultMessage={'Recover Password'}
                />
            </div>
            <p className={classes.text}>{textMessage}</p>
        </div>
    );
};

export default FormSubmissionSuccessful;

FormSubmissionSuccessful.propTypes = {
    classes: shape({
        root: string,
        text: string
    }),
    email: string
};
