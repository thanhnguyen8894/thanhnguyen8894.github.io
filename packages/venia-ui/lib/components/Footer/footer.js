import React, {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useRef
} from 'react';
import { Link, resourceUrl } from '@magento/venia-ui/lib/drivers';
import { shape, string } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import parse from 'html-react-parser';
import { Form } from 'informed';

//Hooks
import { useLocation } from 'react-router-dom';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useFooter } from '@magento/peregrine/lib/talons/Footer/useFooter';
import { useToasts } from '@magento/peregrine';
import { useSubscribePage } from '@magento/peregrine/lib/talons/SubscribePage/useSubscribePage';
import { useFormError } from '@magento/peregrine/lib/talons/FormError/useFormError';

//Styles
import defaultClasses from './footer.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

//Helper/Constants
import { DEFAULT_LINKS, SOCIAL_ICONS } from './sampleData';
import { isRequired } from '../../util/formValidators';
import { getUIRenderOfFooter } from '@magento/peregrine/lib/util/common';
import { images } from '@magento/venia-ui/lib/constants/images';
import { IS_USE_STATIC_FOOTER } from '@magento/venia-ui/lib/constants/constants';

//Components
import SubscribePage from '../SubscribePage';
import Logo from '../Logo';
import { transparentPlaceholder } from '@magento/peregrine/lib/util/images';
import { Accordion, Section } from '../Accordion';
import Image from '@magento/venia-ui/lib/components/Image';
import Field from '../Field';
import TextInput from '../TextInput';
import { useStoreTrigger } from '@magento/peregrine/lib/talons/Header/useStoreTrigger';

const linkAppStore = '/';
const linkGooglePlay = '/';

const Footer = props => {
    const { links } = props;
    const classes = mergeClasses(defaultClasses, props.classes);

    const formApiRef = useRef();
    const { formatMessage } = useIntl();
    const location = useLocation();
    const [, { addToast }] = useToasts();
    const [{ mobile, tablet }] = useAppContext();
    const { currentStore } = useStoreTrigger({});
    const loginLink = '/login';
    const isStoreSaudiArabia = currentStore.value === 'SA';

    const talonProps = useFooter();
    const {
        copyrightText,
        footerLink,
        socialLink,
        handleLinkClick,
        trackDowloadApp
    } = talonProps;

    // enabled when using dynamic footer
    useEffect(() => {
        if (!IS_USE_STATIC_FOOTER) {
            const accordion = document.getElementsByClassName(
                'section-title_container-1bX'
            );
            for (let i = 0; i < accordion.length; i++) {
                accordion[i].addEventListener('click', () => {
                    const panel = accordion[i].nextElementSibling;
                    if (panel.style.display === 'block') {
                        panel.style.display = 'none';
                    } else {
                        panel.style.display = 'block';
                    }
                });
            }
        }
    }, []);

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

    const subscribePageTalonProps = useSubscribePage({ afterSubmit });
    const { formErrors, handleSubmit, isSubmitting } = subscribePageTalonProps;
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

    document.addEventListener('keydown', function(event) {
        if (event.keyCode == 13) {
            setTimeout(() => {
                handleSubmit;
                event.target.blur();
            }, 300);
        }
    });

    const linkGroups = Array.from(links, ([groupKey, linkProps]) => {
        const linkElements = Array.from(linkProps, ([text, path]) => {
            const itemKey = `text: ${text} path:${path}`;
            const child = path ? (
                typeof path === 'number' ? (
                    <button
                        className={classes.link}
                        onClick={() => handleLinkClick(path)}
                    >
                        <FormattedMessage id={text} defaultMessage={text} />
                    </button>
                ) : typeof path === 'object' ? (
                    !mobile &&
                    !tablet &&
                    isStoreSaudiArabia && (
                        <a
                            href={path.link}
                            target="_blank"
                            className={classes.linkImage}
                        >
                            <Image
                                src={path.logo}
                                width={50}
                                height={70}
                                alt="logo VAT"
                            />
                        </a>
                    )
                ) : path === '/login' ? (
                    <Link className={classes.link} to={resourceUrl(loginLink)}>
                        <FormattedMessage id={text} defaultMessage={text} />
                    </Link>
                ) : (
                    <Link className={classes.link} to={resourceUrl(path)}>
                        <FormattedMessage id={text} defaultMessage={text} />
                    </Link>
                )
            ) : (
                <span className={classes.label}>
                    <FormattedMessage id={text} defaultMessage={text} />
                </span>
            );

            return (
                <li key={itemKey} className={classes.linkItem}>
                    {child}
                </li>
            );
        });

        if (mobile) {
            const headerLink = `footer.${groupKey}`;
            return (
                <Accordion
                    key={headerLink}
                    canOpenMultiple={true}
                    classes={{ root: classes.accordion }}
                >
                    <Section
                        id={headerLink}
                        title={formatMessage({
                            id: headerLink,
                            defaultMessage: headerLink
                        })}
                        mobile={mobile}
                        classes={{
                            title: classes.accordionTitle,
                            contents_container: classes.accordionContents
                        }}
                    >
                        {linkElements}
                    </Section>
                </Accordion>
            );
        }

        return (
            <ul
                key={groupKey}
                className={`${classes.linkGroup} ${
                    groupKey === 'ourCompany' ? classes.linkGroupCustom : ''
                }`}
            >
                {linkElements}
            </ul>
        );
    });

    const storeInformation = () => {
        return (
            <Fragment>
                <div className={classes.calloutBody} onClick={trackDowloadApp}>
                    <a href={linkAppStore} target="_blank">
                        <Image
                            src={images.appStore}
                            alt="App Store"
                            width={138}
                            height={40}
                        />
                    </a>
                    <a href={linkGooglePlay} target="_blank">
                        <Image
                            src={images.googlePlay}
                            alt="Google Play"
                            width={138}
                            height={40}
                        />
                    </a>
                </div>

                <span className={classes.calloutHeading}>
                    <FormattedMessage
                        id={'footer.signUpForUpdates'}
                        defaultMessage={'SIGN UP FOR UPDATES'}
                    />
                </span>

                <span className={classes.contact}>
                    <FormattedMessage
                        id={'footer.subTitleSignUp'}
                        defaultMessage={'subTitleSignUp'}
                    />
                </span>
                <Form
                    getApi={formApi => (formApiRef.current = formApi)}
                    className={classes.form}
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
                </Form>
            </Fragment>
        );
    };

    const isTabletOrMobile = () => {
        return mobile || tablet;
    };

    const heightLogo = () => {
        if (mobile) {
            return 35;
        }
        if (tablet) {
            return 40;
        }
        return 60;
    };
    const widthLogo = () => {
        if (mobile) {
            return 85;
        }
        if (tablet) {
            return 97;
        }
        return 146;
    };

    if (IS_USE_STATIC_FOOTER)
        return (
            <footer
                className={`
            ${classes.root} 
            ${mobile ? classes.rootMobile : ''}
            ${tablet ? classes.rootTablet : ''}
        `}
            >
                <SubscribePage
                    className={classes.subscribePage}
                    theme={getUIRenderOfFooter(location.pathname)}
                />
                <div className={classes.mainFooter}>
                    <div className={classes.links}>
                        {linkGroups}
                        <div className={classes.callout}>
                            {mobile && (
                                <Fragment>
                                    <FormattedMessage
                                        id={'footer.storeInformation'}
                                        defaultMessage={'SHOP APP'}
                                    />
                                    {storeInformation()}
                                </Fragment>
                            )}
                            {!mobile && (
                                <div>
                                    <h3 className={classes.calloutHeading}>
                                        <FormattedMessage
                                            id={'footer.storeInformation'}
                                            defaultMessage={'SHOP APP'}
                                        />
                                    </h3>
                                    {storeInformation()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </footer>
        );

    return (
        <footer
            className={`
            ${classes.root} 
            ${mobile ? classes.rootMobile : ''}
            ${tablet ? classes.rootTablet : ''}
        `}
        >
            <SubscribePage
                className={classes.subscribePage}
                theme={getUIRenderOfFooter(location.pathname)}
            />
            <div className={classes.footerTop}>
                <div className={classes.logoBlock}>
                    <Link to={resourceUrl('/')}>
                        <Logo
                            height={heightLogo()}
                            width={widthLogo()}
                            className={classes.logo}
                            classes={{ logo: classes.logo }}
                        />
                    </Link>
                    <p className={classes.footerTopSubTitle}>
                        <FormattedMessage
                            id={'footer.subLogo'}
                            defaultMessage={
                                'Enjoy Shopping at Arabian Oud  Stores. All you needs in One Place'
                            }
                        />
                    </p>
                </div>
                <div className={classes.getAppBlock}>
                    {/* <Image
                        src={AppQRCode}
                        alt="QR Code"
                        width={90}
                        height={90}
                    /> */}
                    <div onClick={trackDowloadApp}>
                        <a href={linkAppStore} target="_blank">
                            <Image
                                src={images.appStore}
                                alt="App Store"
                                width={136}
                                height={40}
                            />
                        </a>
                        <a href={linkGooglePlay} target="_blank">
                            <Image
                                src={images.googlePlay}
                                alt="Google Play"
                                width={136}
                                height={40}
                            />
                        </a>
                    </div>
                </div>
            </div>
            {isTabletOrMobile() && (
                <div className={classes.socialLinks}> {parse(socialLink)}</div>
            )}
            <div className={classes.links}> {parse(footerLink)}</div>
            <div className={classes.branding}>
                <div className={classes.legal}>
                    <Image
                        classes={{ image: classes.legalPayImage }}
                        alt="Apple pay"
                        src={images.applePayLogoPng}
                    />
                    <Image
                        classes={{ image: classes.legalImage }}
                        alt="COD"
                        src={images.codLogoPng}
                    />
                    <Image
                        classes={{ image: classes.legalVisaImage }}
                        alt="Visa"
                        src={images.visaLogoPng}
                    />
                    <Image
                        classes={{ image: classes.legalAmexImage }}
                        alt="Amex"
                        src={images.amexLogoPng}
                    />
                    <Image
                        classes={{ image: classes.legalImage }}
                        alt="Mastercard"
                        src={images.mastercardLogoPng}
                    />
                    <Image
                        classes={{ image: classes.legalImage }}
                        alt="Mada"
                        src={images.madaLogoPng}
                    />
                </div>

                <div className={classes.copyright}>
                    <p>{copyrightText || null}</p>
                    <ul className={classes.copyrightContent}>
                        <li />
                        <li />
                    </ul>
                </div>

                {!isTabletOrMobile() && (
                    <div className={classes.socialLinks}>
                        {parse(socialLink)}
                    </div>
                )}
            </div>
        </footer>
    );
};

export default Footer;

Footer.defaultProps = {
    links: DEFAULT_LINKS
};

Footer.propTypes = {
    classes: shape({
        root: string
    })
};
