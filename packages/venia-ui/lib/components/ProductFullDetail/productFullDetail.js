import React, {
    Fragment,
    Suspense,
    useCallback,
    useEffect,
    useState
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form } from 'informed';
import { AlertCircle as AlertCircleIcon, CheckCircle } from 'react-feather';
import {
    FacebookShareButton,
    TwitterShareButton,
    LinkedinShareButton,
    EmailShareButton
} from 'react-share';
import { Link } from 'react-router-dom';

import Price from '@magento/venia-ui/lib/components/Price';
import { useProductFullDetail } from '@magento/peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import { isProductConfigurable } from '@magento/peregrine/lib/util/isProductConfigurable';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import StarIcon from '@magento/venia-ui/venia-static/icons/product/star.png';
import StarNoneIcon from '@magento/venia-ui/venia-static/icons/product/star-none.png';
import { useToasts } from '@magento/peregrine';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { resourceUrl } from '@magento/venia-ui/lib/drivers';
import Field from '@magento/venia-ui/lib/components/Field';
import TextInput from '@magento/venia-ui/lib/components/TextInput';

import Breadcrumbs from '../Breadcrumbs';
import Button from '../Button';
import Carousel from '../ProductImageCarousel';
import FormError from '../FormError';
import LoadingIndicator, {
    fullPageLoadingIndicator
} from '../LoadingIndicator';
import { QuantityFields } from '../CartPage/ProductListing/quantity';
import RichText from '../RichText';

import defaultClasses from './productFullDetail.css';
import ProductDetailOperations from './productFullDetail.gql';
import RecommendedProducts from '../RecommendedProducts';
import ReviewModal from './Review/review';
import Icon from '../Icon';
import Popup from '../Popup';
import TabsProductDetail from './Tabs/tabs';
import { Message } from '../Field';

// import FlixMedia from './flixMedia';
import { images } from '@magento/venia-ui/lib/constants/images';

const Options = React.lazy(() => import('../ProductOptions'));

const errorIcon = (
    <Icon
        src={AlertCircleIcon}
        attrs={{
            width: 18
        }}
    />
);

const successIcon = (
    <Icon
        src={CheckCircle}
        attrs={{
            width: 18
        }}
    />
);

const ERROR_MESSAGE_TO_FIELD_MAPPING = {
    'The requested qty is not available': 'quantity',
    'Product that you are trying to add is not available.': 'quantity',
    "The product that was requested doesn't exist.": 'quantity'
};

const ProductFullDetail = props => {
    const { product, productRewardMessage } = props;
    const [{ mobile, tablet }] = useAppContext();
    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();
    const [option, setOption] = useState(0);

    const afterSubmitReview = useCallback(() => {
        addToast({
            type: 'info',
            icon: successIcon,
            message: formatMessage({
                id: 'productFullDetail.reviewSuccess',
                defaultMessage: 'Review product successfully'
            }),
            timeout: 5000
        });
    }, [addToast, formatMessage]);

    const talonProps = useProductFullDetail({
        ...ProductDetailOperations,
        product,
        afterSubmitReview
    });

    const {
        breadcrumbCategoryId,
        mediaGalleryEntries,
        productDetails,
        reviewsData,
        errorMessage,
        errorsMessageToast,
        errorsMessageWishlist,
        rate,

        limit,
        variants,
        labelOption,
        findOptionsFromVariant,
        isFavorite,
        isLoading,
        isAddToCartDisabled,
        modalReview,
        modalAddToCart,
        tabIndex,

        handleSelectReview,
        handleSelectTab,
        handleAddToCart,
        wishlistAction,
        handleSelectionChange,
        handleOpenReview,
        handleCloseReview,
        handleSubmitReview,
        handleViewAllReview,
        handleUpdateOptionSelect,
        onChangeRating,

        titleBlock,
        relatedProducts,
        labelProduct,

        email,
        setEmail
    } = talonProps;

    const ERROR_FIELD_TO_MESSAGE_MAPPING = {
        quantity: formatMessage({
            id: 'productFullDetail.qtyNoAvailable',
            defaultMessage: 'The requested quantity is not available.'
        })
    };

    useEffect(() => {
        if (errorsMessageToast) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: errorsMessageToast,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [addToast, errorsMessageToast]);

    useEffect(() => {
        if (errorsMessageWishlist !== '') {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: errorsMessageWishlist,
                dismissable: true,
                timeout: 7000
            });
        }
    }, [addToast, errorsMessageWishlist]);

    const classes = mergeClasses(defaultClasses, props.classes);
    const isTabletOrMobile = () => {
        return mobile || tablet;
    };

    const {
        name,
        price,
        sku,
        special_price,
        short_description,
        color,
        material,
        dimensions,
        manufacturer,
        mpn,
        ean,
        product_type,
        salable_qty
    } = productDetails;

    const { avg_rating, total_count } = reviewsData || {};

    const radioOptions = () => {
        const optionElement = variants?.map((item, index) => {
            const { product, attributes } = item || {};
            const { price } = product || {};
            const { currency, value } = price.minimalPrice.amount;
            const handlePickVariant = index => {
                setOption(index);
                findOptionsFromVariant(attributes);
            };
            return (
                <div className={classes.optionBlock} key={index}>
                    <div className={classes.pickOption}>
                        <div
                            className={`${classes.blockBtnOption} ${
                                option === index
                                    ? classes.blockBtnOptionSelected
                                    : ''
                            }`}
                        >
                            <button
                                className={`${classes.btnOption} ${
                                    option === index
                                        ? classes.btnOptionSelected
                                        : ''
                                }`}
                                onClick={() => handlePickVariant(index)}
                                type="button"
                            />
                        </div>
                        <div className={classes.nameOption}>
                            <p>{labelOption(attributes)}</p>
                        </div>
                    </div>
                    <div className={classes.priceOption}>
                        <Price currencyCode={currency} value={value} />
                        {/* <div className={classes.productRewardMessage}>
                            {productRewardMessage(value)}
                        </div> */}
                    </div>
                </div>
            );
        });
        return <section>{optionElement}</section>;
    };

    useEffect(() => {
        if (product_type === 'ConfigurableProduct') {
            const { attributes } = variants[0] || {};
            findOptionsFromVariant(attributes);
        }
    }, [variants, product_type]);

    const options = isProductConfigurable(product) ? (
        <Suspense fallback={fullPageLoadingIndicator}>
            <Options
                onSelectionChange={handleSelectionChange}
                options={product.configurable_options}
                selected={e => handleUpdateOptionSelect(e)}
            />
        </Suspense>
    ) : null;

    const breadcrumbs = breadcrumbCategoryId ? (
        <Breadcrumbs categoryId={breadcrumbCategoryId} currentProduct={name} />
    ) : null;

    let rootClass = classes.root;
    if (isTabletOrMobile()) {
        rootClass += ` ${classes.rootMobile}`;
    }
    const regularPriceClassName = special_price
        ? classes.price
        : classes.oldPrice;
    const areaDetailsClass = short_description
        ? classes.areaDetails
        : classes.areaDetailsNonMetaDesc;
    const productDetailClass = breadcrumbs
        ? !isTabletOrMobile()
            ? classes.productDetails
            : classes.productDetailsMobile
        : classes.productDetailsNoBreadcrumbs;
    const reviewBlockClass =
        isTabletOrMobile() && avg_rating
            ? classes.reviewBlockMobile
            : classes.reviewBlock;

    // Fill a map with field/section -> error.
    const errors = new Map();
    if (errorMessage) {
        Object.keys(ERROR_MESSAGE_TO_FIELD_MAPPING).forEach(key => {
            if (errorMessage.includes(key)) {
                const target = ERROR_MESSAGE_TO_FIELD_MAPPING[key];
                const message = ERROR_FIELD_TO_MESSAGE_MAPPING[target];
                errors.set(target, message);
            }
        });

        if (errorMessage.includes('The current user cannot')) {
            errors.set('form', [
                new Error(
                    formatMessage({
                        id: 'productFullDetail.errorToken',
                        defaultMessage:
                            'There was a problem with your cart. Please sign in again and try adding the item once more.'
                    })
                )
            ]);
        }

        if (
            errorMessage.includes('Variable "$cartId" got invalid value null')
        ) {
            errors.set('form', [
                new Error(
                    formatMessage({
                        id: 'productFullDetail.errorCart',
                        defaultMessage:
                            'There was a problem with your cart. Please refresh the page and try adding the item once more.'
                    })
                )
            ]);
        }

        if (!errors.size) {
            errors.set('form', [
                new Error(
                    formatMessage({
                        id: 'productFullDetail.errorUnknown',
                        defaultMessage:
                            'Could not add item to cart. Please check required options and try again.'
                    })
                )
            ]);
        }
    }

    const maybeShowLoading = isLoading && (
        <div className={classes.modal_active}>
            <LoadingIndicator global={true}>
                <FormattedMessage
                    id={'productFullDetail.loading'}
                    defaultMessage={'Loading ...'}
                />
            </LoadingIndicator>
        </div>
    );

    const maybeShowError = errors && errors.get('quantity') && (
        <div className={classes.formErrors}>
            <Message>{errors.get('quantity')}</Message>
        </div>
    );

    const imageStar = (name, active) => {
        return (
            <img
                key={`${Math.random(0, 100)}`}
                alt={name}
                className={classes.starImage}
                src={active ? StarIcon : StarNoneIcon}
                height={15}
                width={15}
            />
        );
    };

    const caculateAvgRating = avgRating => {
        return (avgRating * 5) / 100;
    };

    const totalStar = avgRating => {
        const startList = [];
        const temp = avgRating ? caculateAvgRating(avgRating) : 0;
        for (let i = 1; i <= 5; i++) {
            if (temp.toFixed(0) >= i) {
                startList.push(imageStar('star', true));
            } else {
                startList.push(imageStar('star', false));
            }
        }
        return startList;
    };

    const showTextStar = avgRating => {
        if (avgRating) {
            return <> {caculateAvgRating(avgRating)} / 5 </>;
        } else {
            return <> 0 / 5 </>;
        }
    };

    const optionColor = (
        <span
            style={{ backgroundColor: color }}
            className={classes.optionColor}
        />
    );

    const lineItem = useCallback(
        (item, index) => {
            if (item === '') return;
            switch (item) {
                case 'sku':
                case 'material':
                case 'dimensions':
                case 'manufacturer':
                case 'mpn':
                case 'ean':
                    if (productDetails[item])
                        return (
                            <div key={index} className={classes.lineItems}>
                                <span className={classes.lineItemLabel}>
                                    <FormattedMessage
                                        id={`productFullDetail.${item}`}
                                        defaultMessage={`${item}`}
                                    />
                                </span>
                                <span className={classes.lineItemText}>
                                    {productDetails[item]}
                                </span>
                            </div>
                        );
                case 'color':
                    if (
                        productDetails[item] &&
                        productDetails[item] != 'transparent'
                    )
                        return (
                            <div key={index} className={classes.lineItems}>
                                <span className={classes.lineItemLabel}>
                                    <FormattedMessage
                                        id={`productFullDetail.${item}`}
                                        defaultMessage={`${item}`}
                                    />
                                </span>
                                <span className={classes.lineItemText}>
                                    {options || optionColor}
                                </span>
                            </div>
                        );
                default:
                    break;
            }
        },
        [productDetails]
    );

    const buttonAddToCartOrDisable = isAddToCartDisabled => {
        if (productDetails?.salable_qty <= 0) {
            return (
                <Button
                    disabled
                    priority="high"
                    type="submit"
                    className={classes.buttonHighPriorityOutStock}
                >
                    <FormattedMessage
                        id={'productFullDetail.soldOut'}
                        defaultMessage={'Sold out'}
                    />
                </Button>
            );
        } else {
            return (
                <Button
                    disabled={isAddToCartDisabled}
                    priority="high"
                    type="submit"
                    className={classes.buttonHighPriority}
                >
                    <FormattedMessage
                        id={'productFullDetail.cartAction'}
                        defaultMessage={'Add to Cart'}
                    />
                </Button>
            );
        }
    };

    const socialShare = name => {
        const url_path = window.location.href;
        switch (name) {
            case 'facebook_':
                return (
                    <FacebookShareButton
                        url={url_path}
                        quote={productDetails.name}
                    >
                        <img
                            src={`/venia-static/icons/${name}.svg`}
                            alt={name}
                            width={!mobile ? 30 : 24}
                        />
                    </FacebookShareButton>
                );
            case 'twitter':
                return (
                    <TwitterShareButton
                        url={url_path}
                        title={productDetails.name}
                    >
                        <img
                            src={`/venia-static/icons/${name}.svg`}
                            alt={name}
                            width={!mobile ? 30 : 24}
                        />
                    </TwitterShareButton>
                );
            case 'instagram':
                return (
                    <div
                        aria-hidden="true"
                        onClick={() =>
                            window.open(
                                'https://www.instagram.com/',
                                '_blank',
                                'width: 800'
                            )
                        }
                        style={{ cursor: 'pointer' }}
                    >
                        <img
                            src={`/venia-static/icons/${name}.svg`}
                            alt={name}
                            width={!mobile ? 30 : 24}
                        />
                    </div>
                );
            case 'linkedin':
                return (
                    <LinkedinShareButton url={url_path}>
                        <img
                            src={`/venia-static/icons/${name}.svg`}
                            alt={name}
                            width={!mobile ? 30 : 24}
                        />
                    </LinkedinShareButton>
                );
            case 'email':
                if (isTabletOrMobile()) {
                    return (
                        <EmailShareButton
                            url={url_path}
                            subject={productDetails.name}
                            body="body"
                        >
                            <img
                                src={`/venia-static/icons/${name}.svg`}
                                alt={name}
                                width={!mobile ? 30 : 24}
                            />
                        </EmailShareButton>
                    );
                } else {
                    const link = `https://mail.google.com/mail/u/0/?to&su=${
                        productDetails.name
                    }&body=${url_path}&&bcc&cc&fs=1&tf=cm`;
                    return (
                        <div
                            aria-hidden="true"
                            onClick={() =>
                                window.open(link, '_blank', 'width=800')
                            }
                            style={{ cursor: 'pointer' }}
                        >
                            <img
                                src={`/venia-static/icons/${name}.svg`}
                                alt={name}
                            />
                        </div>
                    );
                }
            default:
                break;
        }
    };

    const renderRelatedProducts = relatedProducts &&
        relatedProducts.length != 0 && (
            <>
                {/* {!isTabletOrMobile() && <div className={classes.lineDivine} />} */}
                <RecommendedProducts
                    classes={{
                        root: mobile
                            ? classes.recommendedProductsMobile
                            : classes.recommendedProducts
                    }}
                    header={titleBlock}
                    items={relatedProducts}
                    customMobileProductDetails={mobile ? true : false}
                />
                {/* <div
                    className={
                        !isTabletOrMobile() ? classes.line70 : classes.line50
                    }
                /> */}
            </>
        );

    function handleDataChange(e) {
        const { value } = e.target;
        if (setEmail) {
            setEmail(value);
        }
    }

    return (
        <Fragment>
            <div className={productDetailClass}>
                {breadcrumbs}
                <div className={rootClass}>
                    <section className={classes.imageCarousel}>
                        <Carousel
                            productLabel={labelProduct || {}}
                            images={mediaGalleryEntries}
                        />
                    </section>
                    <Form
                        className={areaDetailsClass}
                        onSubmit={handleAddToCart}
                    >
                        <section className={classes.title}>
                            <h1 className={classes.productName}>{name}</h1>
                        </section>
                        <section className={classes.reviewContainer}>
                            {avg_rating && avg_rating != 0 ? (
                                <p>{showTextStar(avg_rating)}</p>
                            ) : null}
                            {avg_rating && avg_rating != 0 ? (
                                <div className={classes.starProduct}>
                                    {totalStar(avg_rating)}
                                </div>
                            ) : null}
                            <div className={reviewBlockClass}>
                                <div
                                    aria-hidden="true"
                                    onClick={handleSelectReview}
                                    className={classes.totalReview}
                                >
                                    {/* {formatMessage({
                                        id: 'productFullDetail.countReviews',
                                        defaultMessage: '0 reviews'
                                    }).replace('!@', total_count || 0)} */}
                                    {formatMessage(
                                        {
                                            id:
                                                'productFullDetail.countReviews',
                                            defaultMessage: '0 reviews'
                                        },
                                        {
                                            total_count: total_count || 0
                                        }
                                    )}
                                </div>
                                {/* <section
                                    aria-hidden="true"
                                    className={classes.addReview}
                                    onClick={handleOpenReview}
                                >
                                    <FormattedMessage
                                        id={'productFullDetail.addReviews'}
                                        defaultMessage={'Add your review'}
                                    />
                                </section> */}
                            </div>
                        </section>
                        <section className={classes.productPrice}>
                            {special_price && (
                                <div className={classes.specialPrice}>
                                    <Price
                                        currencyCode={price.currency}
                                        value={special_price}
                                    />
                                </div>
                            )}
                            <div className={regularPriceClassName}>
                                <Price
                                    currencyCode={price.currency}
                                    value={price.value}
                                />
                            </div>
                        </section>

                        {productRewardMessage && (
                            <section className={classes.productRewardMessage}>
                                <div>{productRewardMessage}</div>
                            </section>
                        )}

                        {short_description && short_description.html && (
                            <section className={classes.description}>
                                <RichText content={short_description.html} />
                            </section>
                        )}
                        {variants && (
                            <section className={classes.groupOption}>
                                {radioOptions()}
                            </section>
                        )}
                        {salable_qty !== 0 && (
                            <Fragment>
                                <section className={classes.groupActions}>
                                    <QuantityFields
                                        classes={{
                                            root: classes.quantityRoot,
                                            rootProd: classes.quantityRootProd
                                        }}
                                        min={1}
                                        isProductButton={true}
                                        setIsCartUpdating={() => {}}
                                    />
                                    <div className={classes.groupCFW}>
                                        <div className={classes.cartGroup}>
                                            <section
                                                className={classes.cartActions}
                                            >
                                                {buttonAddToCartOrDisable(
                                                    isAddToCartDisabled
                                                )}
                                            </section>
                                            {/* <section className={classes.findStore}>
                                            <img
                                                src={images.placeIcon}
                                                alt="place"
                                            />
                                            <Link to={resourceUrl('/stores')}>
                                                <span>
                                                    <FormattedMessage
                                                        id={
                                                            'productFullDetail.findStore'
                                                        }
                                                        defaultMessage={
                                                            'Find in store'
                                                        }
                                                    />
                                                </span>
                                            </Link>
                                        </section> */}
                                        </div>
                                        <section onClick={wishlistAction}>
                                            <div className={classes.wishlist}>
                                                {isFavorite ? (
                                                    <img
                                                        src="/venia-static/icons/heart_fill.svg"
                                                        alt="wishlist"
                                                    />
                                                ) : (
                                                    <img
                                                        src="/venia-static/icons/heart.svg"
                                                        alt="wishlist"
                                                    />
                                                )}
                                            </div>
                                        </section>
                                    </div>
                                </section>
                                <section className={classes.miniDetails}>
                                    {Object.keys(productDetails).map(
                                        (item, index) => lineItem(item, index)
                                    )}
                                </section>

                                <section className={classes.shareSocialMedia}>
                                    <span>
                                        <FormattedMessage
                                            id={'productFullDetail.shareSocial'}
                                            defaultMessage={'Share:'}
                                        />
                                    </span>
                                    <Fragment>
                                        {socialShare('facebook_')}
                                        {socialShare('twitter')}
                                        {socialShare('instagram')}
                                        {socialShare('linkedin')}
                                        {/* {socialShare('email')} */}
                                    </Fragment>
                                </section>
                            </Fragment>
                        )}

                        {salable_qty == 0 && (
                            <section className={classes.soldOutBlock}>
                                <h2 className={classes.titleSoldOut}>
                                    <FormattedMessage
                                        id={'productFullDetail.titleSoldOut'}
                                        defaultMessage={'Item sold out'}
                                    />
                                </h2>
                                {/* <p className={classes.subTitleSoldOut}>
                                    <FormattedMessage
                                        id={'productFullDetail.subTitleSoldOut'}
                                        defaultMessage={
                                            'If the item becomes available again, you will receive an email from us.'
                                        }
                                    />
                                </p>
                                <div className={classes.field}>
                                    <Field id={classes.emailInput}>
                                        <TextInput
                                            id={classes.emailInput}
                                            field="email"
                                            value={email}
                                            placeholder={formatMessage({
                                                id:
                                                    'productFullDetail.enterEmail',
                                                defaultMessage: 'Enter email'
                                            })}
                                            onChange={handleDataChange}
                                        />
                                    </Field>
                                    <button
                                        className={classes.btnSendEmail}
                                        // onClick={handleSendEmail}
                                        type="button"
                                    >
                                        <span
                                            className={classes.textBtnSendEmail}
                                        >
                                            <FormattedMessage
                                                id={
                                                    'productFullDetail.sendMeEmail'
                                                }
                                                defaultMessage={'Send me email'}
                                            />
                                        </span>
                                    </button>
                                </div> */}
                            </section>
                        )}

                        <FormError
                            classes={{
                                root: classes.formErrors
                            }}
                            errors={errors.get('form') || []}
                        />
                        {maybeShowError}
                    </Form>
                </div>
            </div>
            <TabsProductDetail
                limit={limit}
                tabIndex={tabIndex}
                reviewsData={reviewsData}
                productDetails={productDetails}
                handleSelectTab={handleSelectTab}
                handleOpenReview={handleOpenReview}
                handleViewAllReview={handleViewAllReview}
            />

            {/* <FlixMedia product={product} /> */}

            <ReviewModal
                rate={rate}
                productDetails={productDetails}
                isLoading={isLoading}
                isClose={handleCloseReview}
                isOpen={modalReview}
                onChangeRating={onChangeRating}
                handleSubmitReview={handleSubmitReview}
            />
            <Popup
                showModal={modalAddToCart}
                handleCloseModal={handleCloseReview}
                productDetails={productDetails}
                product={product}
            />
            {renderRelatedProducts}
            {maybeShowLoading}
        </Fragment>
    );
};

export default ProductFullDetail;
