import React, { Fragment, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form } from 'informed';

import Field from '@magento/venia-ui/lib/components/Field';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import TextArea from '@magento/venia-ui/lib/components/TextArea';
import Button from '@magento/venia-ui/lib/components/Button';

import WalletCountPage from './walletCount';
import TransHistoriesPage from './transHistories';
import defaultClasses from './withdrawCredit.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';

const WithdrawCreditPage = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const formRef = useRef(null);
    const { formatMessage } = useIntl();

    const { customer, withdrawHistoryData, backPress, submitPress } =
        props || {};

    const headers = (
        <div className={classes.headerContainer}>
            <h2 className={classes.heading}>
                <FormattedMessage
                    id={'withdrawCredit.title'}
                    defaultMessage={'Withdraw Credit'}
                />
            </h2>
            <h4 className={classes.subHeading}>
                <FormattedMessage
                    id={'myWallet.myWalletSubTitle'}
                    defaultMessage={
                        'You can check and update credit limit here'
                    }
                />
            </h4>
        </div>
    );

    const walletCount = (
        <WalletCountPage
            walletCredit={`${
                customer && customer.wallet_credit ? customer.wallet_credit : 0
            }`}
        />
    );

    const actionButton = (
        <div className={classes.buttonsContainer}>
            <Button
                className={classes.submitButton}
                type={'submit'}
                priority={'high'}
            >
                {formatMessage({
                    id: 'withdrawCredit.withdraw',
                    defaultMessage: 'Withdraw'
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
                            id: 'withdrawCredit.credit',
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
                        id="paypalEmail"
                        isRequired={true}
                        label={formatMessage({
                            id: 'withdrawCredit.paypalEmail',
                            defaultMessage: 'Paypal Email'
                        })}
                        required
                    >
                        <TextInput
                            type="email"
                            field="paypalEmail"
                            validate={isRequired}
                        />
                    </Field>
                </div>

                <div className={classes.field}>
                    <Field
                        id="reason"
                        isRequired={true}
                        label={formatMessage({
                            id: 'withdrawCredit.reason',
                            defaultMessage: 'Reason'
                        })}
                        required
                    >
                        <TextArea field="reason" validate={isRequired} />
                    </Field>
                </div>

                {actionButton}
            </Form>
        </Fragment>
    );

    const formGroup = (
        <div className={classes.fromGroup}>
            <div className={classes.group}>
                <h3 className={classes.groupTitle}>
                    <FormattedMessage
                        id={'withdrawCredit.withdrawForm'}
                        defaultMessage={'Withdraw Form'}
                    />
                </h3>
            </div>
            <div className={classes.formContent}>{formComs}</div>
        </div>
    );

    const transHistories = (
        <div className={classes.transGroup}>
            <div className={classes.group}>
                <h3 className={classes.groupTitle}>
                    <FormattedMessage
                        id={'withdrawCredit.withdrawHistory'}
                        defaultMessage={'Withdraw History'}
                    />
                </h3>
            </div>
            <div className={classes.transContent}>
                <TransHistoriesPage
                    isTransHistory={false}
                    data={withdrawHistoryData}
                />
            </div>
        </div>
    );

    return (
        <div className={classes.root}>
            {headers}
            <div className={classes.rootContainer} ref={formRef}>
                {walletCount}
                {formGroup}
                {transHistories}
            </div>
        </div>
    );
};

export default WithdrawCreditPage;
