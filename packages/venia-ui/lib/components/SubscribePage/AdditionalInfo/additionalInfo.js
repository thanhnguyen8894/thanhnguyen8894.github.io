import React, { Fragment } from 'react';

//Styles
import defaultClasses from './additionalInfo.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

//Redux
import { useAppContext } from '@magento/peregrine/lib/context/app';

//Constants
import { images } from '@magento/venia-ui/lib/constants/images';
import { FormattedMessage } from 'react-intl';

const AdditionalInfo = props => {
    const [{ mobile, tablet }] = useAppContext();
    const isTabletOrMobile = () => {
        return mobile || tablet;
    };

    const classes = mergeClasses(defaultClasses, props.classes);
    const isShow = false // switch to show or hide component

    return (
        <Fragment>
            {isShow && <section
                id="additionalInfo"
                className={`${classes.root} ${
                    mobile ? classes.rootMobile : ''
                } ${tablet ? classes.rootTablet : ''} ${classes.rootCustom}`}
            >
                <div className={classes.block}>
                    {!isTabletOrMobile() ? (
                        <div className={classes.icon}>
                            <img
                                src={images.supportIcon}
                                alt={'shipping'}
                                className={classes.img}
                            />
                        </div>
                    ) : null}
                    <div className={classes.description}>
                        <div className={classes.title}>
                            <FormattedMessage
                                id={'footer.onlineSupport'}
                                defaultMessage={'Online Support'}
                            />
                        </div>
                        <div className={classes.subTitle}>
                            <FormattedMessage
                                id={'footer.onlineSupportSubtitle'}
                                defaultMessage={
                                    'Contact us 24 hours a day, 7 days a week'
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className={classes.block}>
                    {!isTabletOrMobile() ? (
                        <div className={classes.icon}>
                            <img
                                src={images.calendar}
                                alt={'support'}
                                className={classes.img}
                            />
                        </div>
                    ) : null}
                    <div className={classes.description}>
                        <div className={classes.title}>
                            <FormattedMessage
                                id={'footer.refund'}
                                defaultMessage={'Return within 30 days'}
                            />
                        </div>
                        <div className={classes.subTitle}>
                            <FormattedMessage
                                id={'footer.refundSubtitle'}
                                defaultMessage={
                                    'We offer you free return within 30 days'
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className={classes.block}>
                    {!isTabletOrMobile() ? (
                        <div className={classes.icon}>
                            <img
                                src={images.wallet}
                                alt={'security'}
                                className={classes.img}
                            />
                        </div>
                    ) : null}
                    <div className={classes.description}>
                        <div className={classes.title}>
                            <FormattedMessage
                                id={'footer.paymentSecure'}
                                defaultMessage={'Payment Secure'}
                            />
                        </div>
                        <div className={classes.subTitle}>
                            <FormattedMessage
                                id={'footer.paymentSecureSubtitle'}
                                defaultMessage={
                                    'We ensure secure payment with PEV'
                                }
                            />
                        </div>
                    </div>
                </div>
            </section>}
        </Fragment>
    );
};

export default AdditionalInfo;
