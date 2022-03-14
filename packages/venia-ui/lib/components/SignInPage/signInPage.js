import React, { Fragment } from 'react';
import { shape, string } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { Link, resourceUrl, Redirect } from '@magento/venia-drivers';
import { useUserContext } from '@magento/peregrine/lib/context/user';

import Button from '../Button';
import { mergeClasses } from '../../classify';
import defaultClasses from './signInPage.css';
import SignIn from '../SignIn';
import SocialSignIn from '../SocialSignIn';

const SignInPage = props => {
    const [{ isSignedIn }] = useUserContext();
    const [{ mobile, tablet }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);

    if (isSignedIn) {
        return <Redirect to="/account-information" />;
    }

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
                    <SignIn />
                </div>
                <hr className={classes.line} />
                <div className={classes.redirectSignUp}>
                    <h2 className={classes.title}>
                        <FormattedMessage
                            id={'signIn.dontHaveAccountText'}
                            defaultMessage={'Don’t have an account?'}
                        />
                    </h2>
                    <div className={classes.container}>
                        <p className={classes.subTitle}>
                            <FormattedMessage
                                id={'createAccount.benefitText'}
                                defaultMessage={
                                    'Creating an account has many benefits: check out faster, keep more than one address, track orders and more.'
                                }
                            />
                        </p>
                        <Link to={resourceUrl('/create-account')}>
                            <Button
                                className={classes.submitButton}
                                disabled={false}
                                priority="high"
                            >
                                <FormattedMessage
                                    id={'createAccount.titleText'}
                                    defaultMessage={'Create an account'}
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

SignInPage.propTypes = {
    classes: shape({
        container: string,
        redirectSignIn: string,
        submitButton: string,
        formSignUp: string,
        title: string,
        subTitle: string,
        line: string
    })
};

export default SignInPage;
