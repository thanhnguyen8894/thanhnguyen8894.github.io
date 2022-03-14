import React, { Fragment, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { gql } from '@apollo/client';
import { AlertCircle as AlertCircleIcon } from 'react-feather';
import { Form } from 'informed';

//Styles
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './creditWallet.css';

//Hooks
import { useToasts } from '@magento/peregrine';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useCreditWallet } from '@magento/peregrine/lib/talons/CartPage/PriceAdjustments/useCreditWallet';

//Helper/Constants
import { deriveErrorMessage } from '@magento/peregrine/lib/util/deriveErrorMessage';
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';

//Component
import Button from '@magento/venia-ui/lib/components/Button';
import Field from '@magento/venia-ui/lib/components/Field';
import Icon from '@magento/venia-ui/lib/components/Icon';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import { AppliedCreditWalletFragment } from './creditWalletFragments';

const errorIcon = (
    <Icon
        src={AlertCircleIcon}
        attrs={{
            width: 18
        }}
    />
);

const GET_APPLIED_CREDIT_WALLET = gql`
    query getAppliedCreditWallet($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...AppliedCreditWalletFragment
        }
    }
    ${AppliedCreditWalletFragment}
`;

const APPLY_CREDIT_WALLET_MUTATION = gql`
    mutation applyWalletCreditToCart($creditWallet: Float!, $cartId: String!) {
        applyWalletCreditToCart(
            input: { credit: $creditWallet, cart_id: $cartId }
        ) @connection(key: "applyWalletCreditToCart") {
            status
            message
        }
    }
`;

const REMOVE_CREDIT_WALLET_MUTATION = gql`
    mutation {
        removeWalletCreditToCart {
            status
            message
        }
    }
`;

const CreditWallet = props => {
    const [{ mobile }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);

    const talonProps = useCreditWallet({
        setIsCartUpdating: props.setIsCartUpdating,
        setUpdateFinish: props.setUpdateFinish,
        mutations: {
            applyCreditWalletMutation: APPLY_CREDIT_WALLET_MUTATION,
            removeCreditWalletMutation: REMOVE_CREDIT_WALLET_MUTATION
        },
        queries: {
            getAppliedCreditWalletQuery: GET_APPLIED_CREDIT_WALLET
        }
    });
    const [, { addToast }] = useToasts();
    const {
        applyingCreditWallet,
        data,
        errors,
        handleApplyCreditWallet,
        handleRemoveCreditWallet,
        removingCreditWallet,
        errorMessageCustom
    } = talonProps;
    const { formatMessage } = useIntl();

    const removeCreditWalletError = deriveErrorMessage([
        errors.get('removeCreditWalletMutation')
    ]);

    useEffect(() => {
        if (removeCreditWalletError) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: removeCreditWalletError,
                dismissable: true,
                timeout: 10000
            });
        }
    }, [addToast, removeCreditWalletError]);

    if (!data) {
        return null;
    }

    if (errors.get('getAppliedCreditWalletQuery')) {
        return (
            <div className={classes.errorContainer}>
                <FormattedMessage
                    id={'creditWallet.errorContainer'}
                    defaultMessage={
                        'Something went wrong. Please refresh and try again.'
                    }
                />
            </div>
        );
    }

    const errorMessage = deriveErrorMessage([
        errors.get('applyCreditWalletMutation')
    ]);

    const formClass = errorMessage ? classes.entryFormError : classes.entryForm;

    if (data.cart.applied_wallet_credit) {
        return (
            <div className={`${formClass} ${mobile ? classes.rootMobile : ''}`}>
                <Fragment key={data.cart.applied_wallet_credit}>
                    <Field>
                        <TextInput
                            field="creditWallet"
                            id={'creditWallet'}
                            placeholder={data.cart.applied_wallet_credit}
                            mask={value => value && value.trim()}
                            maskOnBlur={true}
                            message={errorMessage || errorMessageCustom}
                            isDisabled={true}
                            validate={isRequired}
                        />
                    </Field>
                    <Field>
                        <Button
                            classes={{ root_normalPriority: classes.button }}
                            disabled={removingCreditWallet}
                            priority={'normal'}
                            onClick={() => {
                                handleRemoveCreditWallet();
                            }}
                        >
                            <FormattedMessage
                                id={'creditWallet.removeButton'}
                                defaultMessage={'Remove'}
                            />
                        </Button>
                    </Field>
                </Fragment>
            </div>
        );
    } else {
        return (
            <Form
                className={`${formClass} ${mobile ? classes.rootMobile : ''}`}
                onSubmit={handleApplyCreditWallet}
            >
                <Field>
                    <TextInput
                        field="creditWallet"
                        id={'creditWallet'}
                        placeholder={formatMessage({
                            id: 'creditWallet.applyCreditWallet',
                            defaultMessage: 'APPLY CREDIT WALLET'
                        })}
                        // mask={value => value && value.trim()}
                        // maskOnBlur={true}
                        message={errorMessage || errorMessageCustom}
                        validate={isRequired}
                        type="number"
                    />
                </Field>
                <Field>
                    <Button
                        classes={{ root_normalPriority: classes.button }}
                        disabled={applyingCreditWallet}
                        priority={'normal'}
                        type={'submit'}
                    >
                        {!applyingCreditWallet && (
                            <FormattedMessage
                                id={'creditWallet.apply'}
                                defaultMessage={'Apply'}
                            />
                        )}
                        {applyingCreditWallet && (
                            <FormattedMessage
                                id={'couponCode.submitting'}
                                defaultMessage={'SUBMITTING'}
                            />
                        )}
                    </Button>
                </Field>
            </Form>
        );
    }
};

export default CreditWallet;
