import React, { Fragment, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Price from '@magento/venia-ui/lib/components/Price';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { RATE } from '@magento/peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';
import Dialog from '@magento/venia-ui/lib/components/Dialog';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import Field from '@magento/venia-ui/lib/components/Field';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import TextArea from '@magento/venia-ui/lib/components/TextArea';

import defaultClasses from './review.css';
import RichText from '../../RichText';

const Rating = props => {
    const {
        classes: propClasses,
        rate,
        onRatingChange,
        name,
        countStar
    } = props;
    const classes = mergeClasses(defaultClasses, propClasses);

    const star = rate => {
        const starList = [];
        for (let i = 1; i <= 5; i++) {
            starList.push(
                <div
                    key={`${i}`}
                    onClick={() => {
                        onRatingChange(name, i);
                        countStar(i);
                    }}
                    className={classes.rating}
                >
                    <img
                        className={classes.imgStar}
                        alt="star"
                        src={
                            rate >= i
                                ? '/venia-static/icons/star_fill.png'
                                : '/venia-static/icons/star.png'
                        }
                    />
                </div>
            );
        }
        return <div className={classes.star}>{starList}</div>;
    };

    return <div className={classes.root}>{star(rate)}</div>;
};

const ReviewModal = props => {
    const {
        classes: propClasses,
        isLoading,
        isClose,
        isOpen,
        onChangeRating,
        handleSubmitReview,
        rate,
        productDetails
    } = props;
    const { formatMessage } = useIntl();

    const {
        name,
        price,
        special_price,
        color,
        material,
        dimensions,
        thumbnailImage,
        short_description
    } = productDetails;
    const [{ mobile }] = useAppContext();

    const classes = mergeClasses(defaultClasses, propClasses);
    const regularPriceClassName = special_price
        ? classes.price
        : classes.specialPrice;
    const [starValue, setStarValue] = useState(0);
    const currentRef = useRef();

    const message = (
        <FormattedMessage
            id={'productFullDetail.loading'}
            defaultMessage={'Loading ...'}
        />
    );

    const maybeLoadingIndicator = isLoading && (
        <LoadingIndicator
            classes={{
                root: classes.loading
            }}
        >
            {message}
        </LoadingIndicator>
    );

    useEffect(() => {
        Object.keys(rate).forEach(function(key) {
            if (rate[key].value_id === '') {
                switch (rate[key].id) {
                    case RATE[0].id:
                        setStarValue(0);
                        break;
                    default:
                        break;
                }
            }
        });
    });

    const lineItem = (name, item) => {
        return (
            <div className={classes.lineItems}>
                {/* <span className={classes.lineItemLabel}>
                    <FormattedMessage
                        id={`productFullDetail.${name}`}
                        defaultMessage={`${name}`}
                    />
                </span> */}
                <span className={classes.lineItemText}>{item}</span>
            </div>
        );
    };

    const optionColor = (
        <span
            style={{ backgroundColor: color }}
            className={classes.optionColor}
        />
    );

    const pricePopup = (
        <section className={classes.productPrice}>
            <div className={regularPriceClassName}>
                <Price currencyCode={price.currency} value={price.value} />
            </div>
            {special_price && (
                <div className={classes.specialPrice}>
                    <Price
                        currencyCode={price.currency}
                        value={special_price}
                    />
                </div>
            )}
        </section>
    );

    const reviewContent = (
        <Fragment>
            <div
                ref={currentRef}
                className={`${classes.form} ${
                    mobile ? classes.formMobile : ''
                }`}
            >
                <div className={classes.info}>
                    <img
                        src={thumbnailImage}
                        alt="productimagereview"
                        className={classes.img}
                    />
                    <div className={classes.detail}>
                        <p>{name}</p>
                        <section className={classes.miniDetails}>
                            {lineItem('price', pricePopup)}

                            {short_description && short_description.html && (
                                <section className={classes.description}>
                                    <RichText
                                        content={short_description.html}
                                    />
                                </section>
                            )}
                            {/* {lineItem('material', material || 'none')}
                            {lineItem('dimensions', dimensions || 'none')}
                            {lineItem('color', optionColor)} */}
                        </section>
                    </div>
                </div>
                <section className={classes.formReview}>
                    <div
                        style={{ alignItems: 'center' }}
                        className={classes.item}
                    >
                        <p>
                            <FormattedMessage
                                id={`productFullDetail.overalRating`}
                                defaultMessage={'Overall Rating:'}
                            />
                        </p>
                        <Rating
                            name={RATE[0].id}
                            rate={starValue}
                            onRatingChange={onChangeRating}
                            countStar={setStarValue}
                        />
                    </div>
                    <div style={{ minHeight: '80px' }} className={classes.item}>
                        <p>
                            <FormattedMessage
                                id={`productFullDetail.review`}
                                defaultMessage={'Review:'}
                            />
                        </p>
                        <Field id="text">
                            <TextArea
                                field="text"
                                validate={isRequired}
                                validateOnBlur
                                placeholder={formatMessage({
                                    id: 'productFullDetail.placeholderText',
                                    defaultMessage: 'Tell us your opinion'
                                })}
                                // classes = {{ input: classes.inputCustom }}
                            />
                        </Field>
                    </div>
                    {/* <div className={classes.item}>
                        <p>
                            <FormattedMessage
                                id={`productFullDetail.summary`}
                                defaultMessage={'Summary:'}
                            />
                        </p>
                        <Field id="summary">
                            <TextInput
                                field="summary"
                                validate={isRequired}
                                validateOnBlur
                                placeholder={formatMessage({
                                    id: 'productFullDetail.placeholderSummary',
                                    defaultMessage: 'Summary of review'
                                })}
                            />
                        </Field>
                    </div> */}
                    <div className={classes.item}>
                        <p>
                            <FormattedMessage
                                id={`productFullDetail.customer`}
                                defaultMessage={'Customer:'}
                            />
                        </p>
                        <Field id="nickname">
                            <TextInput
                                field="nickname"
                                validate={isRequired}
                                validateOnBlur
                                placeholder={formatMessage({
                                    id: 'productFullDetail.placeholderNickname',
                                    defaultMessage: 'Name'
                                })}
                            />
                        </Field>
                    </div>
                </section>
            </div>
        </Fragment>
    );

    return (
        <Fragment>
            <Dialog
                classes={{
                    contents: classes.contents
                }}
                confirmText={'POST A REVIEW'}
                confirmTranslationId={'productFullDetail.postReview'}
                isOpen={isOpen}
                onCancel={isClose}
                onConfirm={value => handleSubmitReview(value, currentRef)}
                // shouldDisableAllButtons={false}
                // shouldDisableSubmitButton={falas}
                shouldUnmountOnHide={false}
                title={formatMessage({
                    id: 'productFullDetail.productReview',
                    defaultMessage: 'Product review'
                }).toLocaleUpperCase()}
                isPopup={true}
            >
                {maybeLoadingIndicator}
                {reviewContent}
            </Dialog>
        </Fragment>
    );
};

export default ReviewModal;
