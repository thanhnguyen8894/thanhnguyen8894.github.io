import React, { Fragment, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form } from 'informed';

import Field from '@magento/venia-ui/lib/components/Field';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import Button from '@magento/venia-ui/lib/components/Button';

import defaultClasses from './buyCredit.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';

const BuyCreditPage = props => {
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
                    id: 'myWallet.buyCredit',
                    defaultMessage: 'Buy Credit'
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
                            id: 'myWallet.credit',
                            defaultMessage: 'Credit'
                        })}
                        required
                    >
                        <TextInput
                            type={'number'}
                            field="credit"
                            validate={isRequired}
                        />
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
                    id={'myWallet.buyCredit'}
                    defaultMessage={'Buy Credit'}
                />
            </div>
            <div className={classes.rootContainer} ref={formRef}>
                {formComs}
            </div>
        </div>
    );
};

export default BuyCreditPage;
