import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { Link, resourceUrl, Redirect } from '@magento/venia-drivers';
import { useUserContext } from '@magento/peregrine/lib/context/user';

import Button from '../Button';
import SignInForm from './signInForm';

import { mergeClasses } from '../../classify';
import defaultClasses from './signInByMail.css';

const SignInByMail = props => {
    const [{ mobile, tablet }] = useAppContext();
    const [{ isSignedIn }] = useUserContext();
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
                    <SignInForm />
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
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default SignInByMail;
