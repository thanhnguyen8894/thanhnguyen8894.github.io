import React, { Fragment, useCallback, useEffect, useMemo, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { oneOf, shape, string } from 'prop-types';
import { Form } from 'informed';
import { useToasts } from '@magento/peregrine';

//Hooks/Redux
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useSubscribePage } from '@magento/peregrine/lib/talons/SubscribePage/useSubscribePage';

//Helper/Constants
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';
import { images } from '@magento/venia-ui/lib/constants/images';
import { SOCIAL_ICONS, SOCIAL_ICONS_BLACK } from '../Footer/sampleData';

//Styles
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './subscribePage.css';

//Components
import Button from '../Button';
import Field from '../Field';
import FormError from '../FormError';
import Image from '../Image';
import AdditionalInfo from './AdditionalInfo/additionalInfo';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import { useFormError } from '@magento/peregrine/lib/talons/FormError/useFormError';

const SubscribePage = props => {
    const { theme } = props;
    const { formatMessage } = useIntl();
    const classes = mergeClasses(defaultClasses, props.classes);
    const [, { addToast }] = useToasts();
    const formApiRef = useRef();

    const afterSubmit = useCallback(() => {
        formApiRef.current.reset();
        addToast({
            type: 'info',
            message: formatMessage({
                id: 'subscribe.preferencesText',
                defaultMessage: 'Your preferences have been updated.'
            }),
            timeout: 5000
        });
    }, [addToast, formatMessage, formApiRef]);

    const [{ mobile, tablet }] = useAppContext();
    const isTabletOrMobile = () => {
        return mobile || tablet;
    };

    const talonProps = useSubscribePage({ afterSubmit });

    const { formErrors, handleSubmit, isSubmitting } = talonProps;
    const { errorMessage } = useFormError({ errors: formErrors });

    useEffect(() => {
        if (errorMessage) {
            addToast({
                type: 'error',
                message: errorMessage,
                timeout: 5000
            });
        }
    }, [addToast, errorMessage]);

    const listSocialIons = listIc => {
        const IconElement = Array.from(listIc, ([text, value]) => {
            const { logo, link } = value;
            return (
                <a key={text} href={link} target="_blank">
                    <Image
                        classes={{ container: classes.imgPay }}
                        alt={text}
                        src={logo}
                        width={mobile ? 30 : 24}
                        height={mobile ? 30 : 24}
                    />
                </a>
            );
        });
        return <div className={classes.social}>{IconElement}</div>;
    };

    const style = {
        '--backgroundImage': `url("${images.footerImageUrl}")`,
        '--backgroundImageMobile': `url("${images.footerImageMobileUrl}")`
    };

    const renderDefaultTheme = useMemo(() => {
        return (
            <div
                className={`
                    ${classes.root}
                    ${mobile ? classes.rootMobile : ''}
                    ${tablet ? classes.rootTablet : ''}
                `}
                style={style}
            >
                {!isTabletOrMobile() && (
                    <Image
                        src={images.footerImageUrl}
                        alt={'Subscribe to our newsletter'}
                    />
                )}
                <div className={classes.container} style={style}>
                    <Form
                        getApi={formApi => (formApiRef.current = formApi)}
                        className={classes.form}
                        onSubmit={handleSubmit}
                    >
                        <Fragment>
                            <div className={classes.titleRight}>
                                <h2>
                                    <FormattedMessage
                                        id={'subscribe.title1'}
                                        defaultMessage={
                                            'Want product news and updates? '
                                        }
                                    />
                                </h2>
                                <h2>
                                    <FormattedMessage
                                        id={'subscribe.title2'}
                                        defaultMessage={
                                            'Sign up for our newsletter '
                                        }
                                    />
                                </h2>
                            </div>
                            <div className={classes.subscribeInput}>
                                <Field id={classes.email}>
                                    <TextInput
                                        id={classes.email}
                                        field="email"
                                        placeholder={formatMessage({
                                            id: 'subscribe.email',
                                            defaultMessage: 'Enter email address'
                                        })}
                                        validate={isRequired}
                                    />
                                </Field>
                                <div className={classes.buttonsContainer}>
                                    <Button
                                        disabled={isSubmitting}
                                        type="submit"
                                        priority="high"
                                    >
                                        {isSubmitting
                                            ? formatMessage({
                                                  id: 'subscribe.submitting',
                                                  defaultMessage:
                                                      'Subscribing...'
                                              })
                                            : formatMessage({
                                                  id: 'subscribe.submit',
                                                  defaultMessage: 'Subscribe'
                                              })}
                                    </Button>
                                </div>
                            </div>
                            {listSocialIons(SOCIAL_ICONS)}
                        </Fragment>
                    </Form>
                </div>
            </div>
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        classes.buttonsContainer,
        classes.container,
        classes.email,
        classes.form,
        classes.root,
        classes.rootMobile,
        classes.rootTablet,
        classes.subscribeInput,
        classes.titleRight,
        formErrors,
        formatMessage,
        handleSubmit,
        isSubmitting,
        mobile,
        style,
        tablet
    ]);

    const renderOtherTheme = useMemo(() => {
        return (
            <AdditionalInfo
                classes={{
                    rootCustom: !mobile
                        ? classes.rootCustomOther
                        : classes.rootCustomMobileOther
                }}
            />
        );
    }, [mobile]);

    const renderSubInAuthenticationPage = useMemo(() => {
        return (
            <div
                className={`${classes.containerSubsInAuth} ${
                    isTabletOrMobile() ? classes.containerSubsInAuthMobile : ''
                }`}
            >
                {isTabletOrMobile() ? (
                    <div />
                ) : (
                    <Fragment>
                        <div className={classes.titleRight}>
                            <h1>
                                <FormattedMessage
                                    id={'subscribe.title11'}
                                    defaultMessage={'Follow us on'}
                                />
                            </h1>
                            {/* <h2>
                                <FormattedMessage
                                    id={'subscribe.title21'}
                                    defaultMessage={
                                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Felis elementum enim'
                                    }
                                />
                            </h2> */}
                            {listSocialIons(SOCIAL_ICONS_BLACK)}
                        </div>
                        <div className={classes.line} />
                    </Fragment>
                )}
                <div className={classes.subscribeInputRight}>
                    <h1>
                        <FormattedMessage
                            id={'subscribe.title3'}
                            defaultMessage={`Let's stay in touch`}
                        />
                    </h1>
                    <h2>
                        <FormattedMessage
                            id={'subscribe.title4'}
                            defaultMessage={
                                'We will shout you 10% off your first order'
                            }
                        />
                    </h2>
                    <Form
                        getApi={formApi => (formApiRef.current = formApi)}
                        className={classes.subscribeInput}
                        onSubmit={handleSubmit}
                    >
                        <Field id={classes.email}>
                            <TextInput
                                id={classes.email}
                                field="email"
                                placeholder={formatMessage({
                                    id: 'subscribe.email',
                                    defaultMessage: 'Enter email ddress'
                                })}
                                validate={isRequired}
                            />
                        </Field>
                        <div className={classes.buttonsContainer}>
                            <Button
                                disabled={isSubmitting}
                                type="submit"
                                priority="high"
                            >
                                {isSubmitting
                                    ? formatMessage({
                                          id: 'subscribe.submitting',
                                          defaultMessage: 'Subscribing...'
                                      })
                                    : formatMessage({
                                          id: 'subscribe.submit',
                                          defaultMessage: 'Subscribe'
                                      })}
                            </Button>
                        </div>
                    </Form>
                    {isTabletOrMobile() && listSocialIons(SOCIAL_ICONS_BLACK)}
                </div>
            </div>
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        classes.buttonsContainer,
        classes.containerSubsInAuth,
        classes.containerSubsInAuthMobile,
        classes.email,
        classes.line,
        classes.subscribeInput,
        classes.subscribeInputRight,
        classes.titleRight,
        formatMessage,
        isSubmitting,
        mobile
    ]);

    const renderSubscribePage = useMemo(() => {
        switch (theme) {
            case 'default':
                return (
                    <Fragment>
                        <AdditionalInfo
                            classes={{
                                rootCustom: !mobile
                                    ? classes.rootCustomDefault
                                    : classes.rootCustomMobileDefault
                            }}
                        />
                        {renderDefaultTheme}
                    </Fragment>
                );
            case 'other':
                return <Fragment>{renderOtherTheme}</Fragment>;
            case 'auth':
                return <Fragment>{renderSubInAuthenticationPage}</Fragment>;
            default:
                return <Fragment>{renderOtherTheme}</Fragment>;
        }
    }, [
        classes.rootCustomDefault,
        classes.rootCustomMobileDefault,
        mobile,
        renderDefaultTheme,
        renderOtherTheme,
        renderSubInAuthenticationPage,
        theme
    ]);

    return renderSubscribePage;
};

SubscribePage.propTypes = {
    classes: shape({
        email: string
    }),
    theme: oneOf(['default', 'auth', 'other'])
};

SubscribePage.defaultProps = {
    theme: 'default'
};

export default SubscribePage;
