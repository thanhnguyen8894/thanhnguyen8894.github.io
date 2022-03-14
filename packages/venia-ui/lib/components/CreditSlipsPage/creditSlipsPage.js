import React from 'react';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { FormattedMessage } from 'react-intl';
import { mergeClasses } from '../../classify';

import defaultClasses from './creditSlipsPage.css';

const CreditSlipsPage = (props) => {
    const [{ mobile, tablet }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);

    const CARD_PATMENTS = [
        {
            title: "DEBIT/CREDIT CARD",
            subTitle: "Visa, MasterCard, AMEX, MADA",
            images: [
                {
                    label: "Mastercard"
                },
                {
                    label: "Visa"
                },
                {
                    label: "mada"
                }
            ]
        },
        {
            title: "Cash on delivery",
            subTitle: "Charge Additional Commission For Payment",
            images: [
                {
                    label: "cod"
                }
            ]
        },
        {
            title: "Tamara",
            subTitle: "",
            images: [
                {
                    label: "tamara"
                }
            ]
        },
        {
            title: "STC Pay",
            subTitle: "",
            images: [
                {
                    label: "stcPay"
                }
            ]
        }
    ]

    const cardPayments = CARD_PATMENTS.map((item, index) => {
        const { title, subTitle, images } = item;
        const imageCard = images.map((image, i) => {
            const { label } = image;
            return (
                <img
                    key={i}
                    alt={label}
                    src={`/venia-static/icons/payment/${label}.svg`}
                    width={40}
                    height={30}
                />
            );
        });
        return (
            <div className={classes.group} key={index}>
                <div>
                    <h3 className={classes.title}>{title}</h3>
                    <p className={classes.subTitle}>{subTitle}</p>
                </div>
                <div className={classes.imageCard}>
                    {imageCard}
                </div>
            </div>
        );
    });

    return (
        <div className={mobile ? classes.rootMobile : classes.root}>
            <h2 className={classes.heading}>
                <FormattedMessage
                    id={'accountInformationPage.creditSlips'}
                    defaultMessage={'CREDIT SLIPS'}
                />
            </h2>
            <p className={classes.subHeading}>
                {/* <FormattedMessage
                    id={'accountInformationPage.subTileCreditSlips'}
                    defaultMessage={'You can add and update cards here'}
                /> */}
            </p>
            <div className={classes.containerPayment}>
                {cardPayments}
            </div>
        </div>
    );
}

export default CreditSlipsPage;