import React, { Fragment, useState } from 'react';
import { shape, string } from 'prop-types';
import { useCreateAccountPage } from '@magento/peregrine/lib/talons/CreateAccountPage/useCreateAccountPage';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { FormattedMessage } from 'react-intl';

import CreateAccountForm from '../CreateAccount';
import Button from '../Button';
import { mergeClasses } from '../../classify';
import defaultClasses from './createAccountByEmailPage.css';
import { Link, resourceUrl } from '@magento/venia-drivers';
import SocialSignIn from '../SocialSignIn';
import CreateAccountByEmail from '../CreateAccountByEmail';

const CreateAccountByEmailPage = props => {
    const [{ mobile, tablet }] = useAppContext();
    const isSignedUpByEmailState = useState(false);
    const [isSignedUpByEmail, setIsSignedUpByEmail] = isSignedUpByEmailState;
    const talonProps = useCreateAccountPage();
    const { initialValues, handleCreateAccount } = talonProps;
    const classes = mergeClasses(defaultClasses, props.classes);

    return (
        <Fragment>
            <div
                className={
                    mobile
                        ? classes.rootMobile
                        : tablet
                        ? classes.rootTablet
                        : classes.root
                }
            >
                <div className={classes.formSignUp}>
                    <CreateAccountByEmail
                        initialValues={initialValues}
                        isCancelButtonHidden={true}
                        onSubmit={handleCreateAccount}
                        isUseEmail={isSignedUpByEmailState}
                    />
                </div>
                <hr className={classes.line} />
                <div className={classes.redirectSignIn}>
                    <h2 className={classes.title}>
                        <FormattedMessage
                            id={'createAccount.dontHaveAccountText'}
                            defaultMessage={'Do you have an account? '}
                        />
                    </h2>
                    <div className={classes.container}>
                        <p className={classes.subTitle}>
                            <FormattedMessage
                                id={'createAccount.subTitleText'}
                                defaultMessage={
                                    'Add your information for complete identification'
                                }
                            />
                        </p>
                        <Link to={resourceUrl('/login')}>
                            <Button
                                className={classes.submitButton}
                                disabled={false}
                                priority="high"
                            >
                                <FormattedMessage
                                    id={'signIn.titleText'}
                                    defaultMessage={'SIGN IN'}
                                />
                            </Button>
                        </Link>
                        {/* <p className={classes.textContinue}>
                            <FormattedMessage
                                id={'signIn.continueWith'}
                                defaultMessage={'or continue with'}
                            />
                        </p>
                        <SocialSignIn /> */}
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

CreateAccountByEmailPage.propTypes = {
    classes: shape({
        container: string,
        redirectSignIn: string,
        submitButton: string,
        formSignUp: string,
        title: string,
        subTitle: string,
        line: string
    }),
    initialValues: shape({})
};

export default CreateAccountByEmailPage;
