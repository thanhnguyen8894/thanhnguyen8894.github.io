import React, { Fragment, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form } from 'informed';

import Field from '@magento/venia-ui/lib/components/Field';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import TextArea from '@magento/venia-ui/lib/components/TextArea';
import Button from '@magento/venia-ui/lib/components/Button';

import defaultClasses from './sendToFriend.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';

const SendToFriendPage = props => {
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
                    id: 'sendToFriend.sendCredit',
                    defaultMessage: 'Send Credit'
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
                        id="credit"
                        isRequired={true}
                        label={formatMessage({
                            id: 'sendToFriend.credit',
                            defaultMessage: 'Credit'
                        })}
                        required
                    >
                        <TextInput
                            field="credit"
                            validate={isRequired}
                            validateOnBlur
                            type="number"
                        />
                    </Field>
                </div>

                <div className={classes.field}>
                    <Field
                        id="friendFirstName"
                        isRequired={true}
                        label={formatMessage({
                            id: 'sendToFriend.friendFirstName',
                            defaultMessage: 'Friend First Name'
                        })}
                        required
                    >
                        <TextInput
                            field="friendFirstName"
                            validate={isRequired}
                        />
                    </Field>
                </div>

                <div className={classes.field}>
                    <Field
                        id="friendLastName"
                        isRequired={true}
                        label={formatMessage({
                            id: 'sendToFriend.friendLastName',
                            defaultMessage: 'Friend Last Name'
                        })}
                        required
                    >
                        <TextInput
                            field="friendLastName"
                            validate={isRequired}
                        />
                    </Field>
                </div>

                <div className={classes.field}>
                    <Field
                        id="friendEmail"
                        isRequired={true}
                        label={formatMessage({
                            id: 'sendToFriend.friendEmail',
                            defaultMessage: 'Friend Email'
                        })}
                        required
                    >
                        <TextInput
                            type="email"
                            field="friendEmail"
                            validate={isRequired}
                        />
                    </Field>
                </div>

                <div className={classes.field}>
                    <Field
                        id="message"
                        isRequired={true}
                        label={formatMessage({
                            id: 'sendToFriend.message',
                            defaultMessage: 'Message'
                        })}
                        required
                    >
                        <TextArea field="message" validate={isRequired} />
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
                    id={'sendToFriend.title'}
                    defaultMessage={'Send Credit To Friend'}
                />
            </div>
            <div className={classes.rootContainer} ref={formRef}>
                {formComs}
            </div>
        </div>
    );
};

export default SendToFriendPage;
