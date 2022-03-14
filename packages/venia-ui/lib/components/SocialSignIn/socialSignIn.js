import React from 'react';
import { shape, string } from 'prop-types';
import AppleLogin from 'react-apple-login';
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useSignIn } from '@magento/peregrine/lib/talons/SignIn/useSignIn';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

// constant
import { images } from '@magento/venia-ui/lib/constants/images';
import {
    APP_ID,
    CLIENT_ID,
    CLIENT_ID_APPLE,
    URL_REDIRECT
} from '@magento/venia-ui/lib/constants/constants';

// style
import defaultClasses from './socialSignIn.css';

// graphql
import { GET_CART_DETAILS_QUERY } from '../SignIn/signIn.gql';

const SocialSignIn = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const [{ mobile, tablet }] = useAppContext();
    const talonProps = useSignIn({
        getCartDetailsQuery: GET_CART_DETAILS_QUERY
    });

    const { handleLoginSocial } = talonProps;

    const responseFacebook = response => {
        if (response && !response.error) {
            handleLoginSocial({ res: response, social: 'facebook' });
        }
    };

    const responseGoogle = response => {
        if (response && !response.error) {
            handleLoginSocial({ res: response, social: 'google' });
        }
    };

    // const responseApple = () => {
    //     TO DO: To check response after deploy in dev site
    //     axios.post(URL_REDIRECT).then((response) => console.log(response));
    //     if (response && !response.error) {
    //         handleLoginSocial({ res: response, social: 'apple' });
    //     }
    // };

    const rootClassName = mobile
        ? classes.rootMobile
        : tablet
        ? classes.rootTablet
        : classes.root;

    return (
        <div className={rootClassName}>
            <GoogleLogin
                clientId={CLIENT_ID}
                render={renderProps =>
                    mobile || tablet ? (
                        // UI mobile && tablet
                        <div
                            className={classes.socialIcon}
                            onClick={renderProps.onClick}
                        >
                            <img
                                disabled={renderProps.disabled}
                                alt="google"
                                src={images.googleLogin}
                                width={24}
                                height={24}
                            />
                            <span className={classes.socialName}>Google</span>
                        </div>
                    ) : (
                        //UI Desktop
                        <img
                            className={classes.socialIcon}
                            onClick={renderProps.onClick}
                            disabled={renderProps.disabled}
                            alt="google"
                            src={images.googleLogin}
                            width={24}
                            height={24}
                        />
                    )
                }
                buttonText="LOGIN WITH GOOGLE"
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
            />
            <FacebookLogin
                appId={APP_ID}
                render={renderProps =>
                    mobile || tablet ? (
                        // UI mobile && tablet
                        <div
                            className={classes.socialIcon}
                            onClick={renderProps.onClick}
                        >
                            <img
                                disabled={renderProps.disabled}
                                alt="Facebook"
                                src={images.facebookLogin}
                                width={24}
                                height={24}
                            />
                            <span className={classes.socialName}>Facebook</span>
                        </div>
                    ) : (
                        //UI Desktop
                        <img
                            className={classes.socialIcon}
                            onClick={renderProps.onClick}
                            disabled={renderProps.disabled}
                            alt="Facebook"
                            src={images.facebookLogin}
                            width={24}
                            height={24}
                        />
                    )
                }
                fields="name,email,picture"
                callback={responseFacebook}
                disableMobileRedirect={true}
            />
            <AppleLogin
                clientId={CLIENT_ID_APPLE}
                redirectURI={URL_REDIRECT}
                responseType={'code id_token'}
                responseMode={'fragment'}
                render={renderProps =>
                    mobile || tablet ? (
                        // UI mobile && tablet
                        <div
                            className={classes.socialIcon}
                            onClick={renderProps.onClick}
                        >
                            <img
                                alt="Apple"
                                src={images.appleLogin}
                                width={24}
                                height={24}
                            />
                            <span className={classes.socialName}>Apple</span>
                        </div>
                    ) : (
                        // UI Desktop
                        <img
                            className={classes.socialIcon}
                            onClick={renderProps.onClick}
                            alt="Apple"
                            src={images.appleLogin}
                            width={24}
                            height={24}
                        />
                    )
                }
            />
        </div>
    );
};

SocialSignIn.propTypes = {
    classes: shape({
        root: string,
        socialIcon: string
    })
};

export default SocialSignIn;
