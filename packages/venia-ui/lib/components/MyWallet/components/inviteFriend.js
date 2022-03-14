import React, { Fragment, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form } from 'informed';

import Field from '@magento/venia-ui/lib/components/Field';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import TextArea from '@magento/venia-ui/lib/components/TextArea';
import Button from '@magento/venia-ui/lib/components/Button';

import defaultClasses from './inviteFriend.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';

const InviteFriendPage = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const formRef = useRef(null);
    const { formatMessage } = useIntl();

    const { backPress, submitPress } = props || {};

    const actionButton = (
        <div className={classes.buttonsContainer}>
            <Button
                className={classes.submitButton}
                type="submit"
                priority="high"
            >
                {formatMessage({
                    id: 'inviteFriend.inviteFriends',
                    defaultMessage: 'Invite Friends'
                })}
            </Button>

            <Button
                className={classes.backButton}
                type="button"
                priority="high"
                onClick={() => {
                    backPress && backPress();
                }}
            >
                {formatMessage({
                    id: 'myWallet.back',
                    defaultMessage: 'Back'
                })}
            </Button>
        </div>
    );

    const formComs = (
        <Fragment>
            <Form
                className={classes.rootContent}
                onSubmit={value => {
                    submitPress(value, formRef);
                }}
            >
                <div className={classes.field}>
                    <Field
                        id="firstName"
                        isRequired={true}
                        label={formatMessage({
                            id: 'inviteFriend.firstName',
                            defaultMessage: 'First Name'
                        })}
                        required
                    >
                        <TextInput field="firstName" validate={isRequired} />
                    </Field>
                </div>

                <div className={classes.field}>
                    <Field
                        id="lastName"
                        isRequired={true}
                        label={formatMessage({
                            id: 'inviteFriend.lastName',
                            defaultMessage: 'Last Name'
                        })}
                        required
                    >
                        <TextInput field="lastName" validate={isRequired} />
                    </Field>
                </div>

                <div className={classes.field}>
                    <Field
                        id="email"
                        isRequired={true}
                        label={formatMessage({
                            id: 'inviteFriend.email',
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

                <div className={classes.field}>
                    <Field
                        id="yourMessage"
                        isRequired={true}
                        label={formatMessage({
                            id: 'inviteFriend.yourMessage',
                            defaultMessage: 'Your Message'
                        })}
                        required
                    >
                        <TextArea field="yourMessage" validate={isRequired} />
                    </Field>
                </div>

                {actionButton}
            </Form>
        </Fragment>
    );

    return (
        <div className={classes.root}>
            <div className={classes.heading}>
                <FormattedMessage
                    id={'inviteFriend.title'}
                    defaultMessage={'Invite Friends'}
                />
            </div>
            <div className={classes.rootContainer} ref={formRef}>
                {formComs}
            </div>
        </div>
    );
};

export default InviteFriendPage;
