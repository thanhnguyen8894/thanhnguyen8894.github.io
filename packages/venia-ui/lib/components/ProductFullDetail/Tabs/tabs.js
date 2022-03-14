import React, { Fragment, useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import Tabs from '@magento/pagebuilder/lib/ContentTypes/Tabs/tabs';
import TabItem from '@magento/pagebuilder/lib/ContentTypes/TabItem/tabItem';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import StarIcon from '@magento/venia-ui/venia-static/icons/product/star.png';
import StarNoneIcon from '@magento/venia-ui/venia-static/icons/product/star-none.png';

import defaultClasses from './tabs.css';
import RichText from '../../RichText';
import { Accordion } from '../../Accordion';
import SectionTabs from './sectionTabs';

const DEMO_LIMIT = 120;
const TabsProductDetail = props => {
    const classes = mergeClasses(defaultClasses, props.classes);

    const {
        tabIndex,
        handleSelectTab,
        productDetails,
        reviewsData,
        handleOpenReview,
        handleViewAllReview,
        limit
    } = props;
    const [{ mobile, tablet }] = useAppContext();
    const { formatMessage } = useIntl();

    const {
        description,
        short_description,
        dynamicAttributes
    } = productDetails;
    const { avg_rating, items, total_count } = reviewsData || {};

    const isTabletOrMobile = () => {
        return mobile || tablet;
    };

    const showTextStar = avgRating => {
        if (avgRating) {
            return <> {(avgRating * 5) / 100} / 5 </>;
        } else {
            return <> 0 / 5 </>;
        }
    };

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

    const totalStar = avgRating => {
        const startList = [];
        const temp = avgRating ? (avgRating * 5) / 100 : 0;
        for (let i = 1; i <= 5; i++) {
            if (temp.toFixed(0) >= i) {
                startList.push(imageStar('star', true));
            } else {
                startList.push(imageStar('star', false));
            }
        }
        return startList;
    };

    const formatDate = date => {
        const isoFormattedDate = date.replace(' ', 'T');
        return new Date(isoFormattedDate).toLocaleDateString('en-GB');
    };

    const reviewContent = (item, index) => {
        const { detail, nickname, created_at } = item;
        return (
            <section key={index} className={classes.reviewContent}>
                <div className={classes.reviewUser}>
                    <h2 className={classes.userName}>
                        <FormattedMessage
                            id={`productFullDetail.${nickname}`}
                            defaultMessage={nickname}
                        />
                    </h2>
                    <p className={classes.date}>{formatDate(created_at)}</p>
                </div>
                <p className={classes.reviewComment}>{detail}</p>
            </section>
        );
    };

    const lineAttr = useCallback(
        (item, index) => {
            if (item === '') return;
            switch (item) {
                case 'size':
                case 'origins':
                case 'fragrance':
                case 'type':
                    if (dynamicAttributes[item])
                        return (
                            <div key={index} className={classes.lineItems}>
                                <span className={classes.lineItemLabel}>
                                    <FormattedMessage
                                        id={`productFullDetail.${item}`}
                                        defaultMessage={`${item}`}
                                    />
                                </span>
                                <span className={classes.lineItemText}>
                                    {dynamicAttributes[item]}
                                </span>
                            </div>
                        );
                    break;
                default:
                    break;
            }
        },
        [dynamicAttributes]
    );

    const renderTabsDesktop = (
        <section
            id="bottomTab"
            className={`${classes.bottomTabs} ${
                isTabletOrMobile() ? classes.bottomTabsMobile : ''
            }`}
        >
            <Tabs
                headers={[
                    formatMessage({
                        id: 'productFullDetail.description',
                        defaultMessage: 'Description'
                    }),

                    formatMessage({
                        id: 'productFullDetail.additionalInfo',
                        defaultMessage: 'Additional information'
                    }),
                    // formatMessage({
                    //     id: 'productFullDetail.ingredients',
                    //     defaultMessage: 'Ingredients'
                    // }),
                    formatMessage({
                        id: 'productFullDetail.reviews',
                        defaultMessage: 'Reviews'
                    })
                ]}
                selectedIndex={tabIndex}
                onSelect={index => handleSelectTab(index)}
            >
                <TabItem>
                    <section className={classes.detailsDescription}>
                        <h2 className={classes.detailsDescriptionTitle}>
                            <FormattedMessage
                                id={'productFullDetail.productDescription'}
                                defaultMessage={'Product Description'}
                            />
                        </h2>
                        <div className={classes.line30} />
                        {description ? (
                            <RichText content={description} />
                        ) : short_description ? (
                            <RichText content={short_description.html} />
                        ) : (
                            <p>
                                <FormattedMessage
                                    id={'productFullDetail.noDescription'}
                                    defaultMessage={'No description'}
                                />
                            </p>
                        )}
                    </section>
                </TabItem>
                <TabItem>
                    <section className={classes.reviewsDescriptionHeader}>
                        <h2 className={classes.detailsDescriptionTitle}>
                            <FormattedMessage
                                id={'productFullDetail.additionalInfo'}
                                defaultMessage={'Additional information'}
                            />
                        </h2>
                    </section>

                    <div className={classes.additionalContainer}>
                        {dynamicAttributes &&
                            Object.keys(dynamicAttributes).map((item, index) =>
                                lineAttr(item, index)
                            )}
                    </div>
                </TabItem>
                {/* <TabItem>
                    <section className={classes.reviewsDescriptionHeader}>
                        <h2 className={classes.detailsDescriptionTitle}>
                            <FormattedMessage
                                id={'productFullDetail.ingredients'}
                                defaultMessage={'Ingredients'}
                            />
                        </h2>
                    </section>
                </TabItem> */}
                <TabItem>
                    <section className={classes.reviewsDescriptionHeader}>
                        <h2 className={classes.detailsDescriptionTitle}>
                            <FormattedMessage
                                id={'productFullDetail.reviews'}
                                defaultMessage={'Reviews'}
                            />
                        </h2>
                        <button
                            className={classes.addReview}
                            onClick={handleOpenReview}
                        >
                            <FormattedMessage
                                id={'productFullDetail.addReviews'}
                                defaultMessage={'Add your review'}
                            />
                        </button>
                    </section>
                    <div className={classes.reviewsDescriptionLeft}>
                        <p className={classes.reviewsDescriptionRate}>
                            {showTextStar(avg_rating)}
                        </p>
                        <div className={classes.starProduct}>
                            {totalStar(avg_rating)}
                        </div>
                        <h2 className={classes.reviewsDescriptionTitle}>
                            {formatMessage(
                                {
                                    id: 'productFullDetail.countReviews',
                                    defaultMessage: '0 reviews'
                                },
                                {
                                    total_count: total_count || 0
                                }
                            )}
                        </h2>
                    </div>
                    {items &&
                        items.length > 0 &&
                        items.map((item, index) => {
                            return reviewContent(item, index);
                        })}
                    <div className={classes.checkAllReviews}>
                        {total_count > 3 && limit !== DEMO_LIMIT && (
                            <button
                                onClick={() => handleViewAllReview(DEMO_LIMIT)}
                                className={classes.btnCheckAllReviews}
                            >
                                <span style={{ color: '#FFFFFF' }}>
                                    <FormattedMessage
                                        id={'productFullDetail.checkAllReviews'}
                                        defaultMessage={'Check all reviews'}
                                    />
                                </span>
                            </button>
                        )}
                    </div>
                </TabItem>
            </Tabs>
        </section>
    );

    // const renderTabsMobile = (
    //     <section id="bottomTab">
    //         <Accordion
    //             classes={{ root: classes.accordion }}
    //             canOpenMultiple={true}
    //         >
    //             <SectionTabs
    //                 id="description"
    //                 title={formatMessage({
    //                     id: 'productFullDetail.detail',
    //                     defaultMessage: 'Details'
    //                 })}
    //             >
    //                 {description ? (
    //                     <RichText content={description} />
    //                 ) : short_description ? (
    //                     <RichText content={short_description.html} />
    //                 ) : (
    //                     <p>
    //                         <FormattedMessage
    //                             id={'productFullDetail.noDescription'}
    //                             defaultMessage={'No description'}
    //                         />
    //                     </p>
    //                 )}
    //             </SectionTabs>

    //             <SectionTabs
    //                 id="Delivery policy"
    //                 title={formatMessage({
    //                     id: 'productFullDetail.deliveryPolicy',
    //                     defaultMessage: 'Delivery policy'
    //                 })}
    //             >
    //                 Delivery policy
    //             </SectionTabs>
    //             <SectionTabs
    //                 id="Return policy"
    //                 title={formatMessage({
    //                     id: 'productFullDetail.returnPolicy',
    //                     defaultMessage: 'Return policy'
    //                 })}
    //             >
    //                 Return policy
    //             </SectionTabs>
    //             <SectionTabs
    //                 id="review"
    //                 title={formatMessage({
    //                     id: 'productFullDetail.reviews',
    //                     defaultMessage: 'Reviews'
    //                 })}
    //             >
    //                 <section className={classes.reviewsDescriptionHeaderMobile}>
    //                     <div className={classes.reviewsDescriptionLeftMobile}>
    //                         <h2
    //                             className={classes.reviewsDescriptionRateMobile}
    //                         >
    //                             {formatMessage(
    //                                 {
    //                                     id: 'productFullDetail.countReviews',
    //                                     defaultMessage: '0 reviews'
    //                                 },
    //                                 {
    //                                     total_count: total_count || 0
    //                                 }
    //                             )}
    //                         </h2>
    //                         <p className={classes.reviewsDescriptionRateMobile}>
    //                             {showTextStar(avg_rating)}
    //                         </p>
    //                         <div className={classes.starProductMobile}>
    //                             {totalStar(avg_rating)}
    //                         </div>
    //                     </div>
    //                     <button
    //                         className={classes.addReviewMobile}
    //                         onClick={handleOpenReview}
    //                     >
    //                         <FormattedMessage
    //                             id={'productFullDetail.addReviews'}
    //                             defaultMessage={'Add your review'}
    //                         />
    //                     </button>
    //                 </section>
    //                 {items &&
    //                     items.length > 0 &&
    //                     items.map((item, index) => {
    //                         return reviewContent(item, index);
    //                     })}
    //                 <div className={classes.checkAllReviewsMobile}>
    //                     {total_count > 3 && limit !== DEMO_LIMIT && (
    //                         <button
    //                             onClick={() => handleViewAllReview(DEMO_LIMIT)}
    //                         >
    //                             <span style={{ color: '#D1752F' }}>
    //                                 <FormattedMessage
    //                                     id={'productFullDetail.checkAllReviews'}
    //                                     defaultMessage={'Check all reviews'}
    //                                 />
    //                             </span>
    //                         </button>
    //                     )}
    //                 </div>
    //             </SectionTabs>
    //         </Accordion>
    //     </section>
    // );

    return (
        <Fragment>
            {/* {isTabletOrMobile() ? renderTabsMobile : renderTabsDesktop} */}
            {renderTabsDesktop}
        </Fragment>
    );
};
export default TabsProductDetail;
