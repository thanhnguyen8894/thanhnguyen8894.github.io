import React, { Fragment, useMemo } from 'react';
import { number, shape, string } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import LoadingIndicator, {
    fullPageLoadingIndicator
} from '@magento/venia-ui/lib/components/LoadingIndicator';
import { useCmsPage } from '@magento/peregrine/lib/talons/Cms/useCmsPage';
// import CategoryList from '@magento/venia-ui/lib/components/CategoryList';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { Meta, StoreTitle } from '@magento/venia-ui/lib/components/Head';
import RichContent from '@magento/venia-ui/lib/components/RichContent';
import MetaTag from '@magento/venia-ui/lib/components/MetaTag';

import _ from 'lodash';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useHomePage } from '@magento/peregrine/lib/talons/HomePage/useHomePage';

import ProductBlock from '@magento/venia-ui/lib/components/ProductBlock';
// import ShopByBrands from '@magento/venia-ui/lib/components/ShopByBrands';
import RecommendedProducts from '@magento/venia-ui/lib/components/RecommendedProducts';
import ShopByCategories from '@magento/venia-ui/lib/components/ShopByCategories';

// add new components
import BannerSlider from '@magento/venia-ui/lib/components/BannerSlider';
import TopCategories from '@magento/venia-ui/lib/components/TopCategories';
import ColumnBanner from '@magento/venia-ui/lib/components/ColumnBanner';

import defaultClasses from './cms.css';
import { LandingType } from './constants';

const CMSPage = props => {
    const { id, relativeUrl } = props;
    const [{ mobile, tablet, isPageLoading }] = useAppContext();
    const { formatMessage } = useIntl();
    const classes = mergeClasses(defaultClasses, props.classes);

    const cmsPageProps = useCmsPage({ id, relativeUrl });
    const {
        cmsPage,
        hasContent,
        rootCategoryId,
        shouldShowLoadingIndicator: loading
    } = cmsPageProps;

    const isTabletMobile = () => {
        return mobile || tablet;
    };

    // load data on home page
    // set 999999 to load data home page

    const talonHomeProps = useHomePage({ landingCategoryId: 999999 });
    // const { homePage, shouldShowLoadingIndicator } = talonHomeProps;
    const {
        homePage,
        shouldShowLoadingIndicator,
        brands,
        outOfStockForSaleableQtyZero: productOutStock
    } = talonHomeProps;

    const shopBrands = useMemo(() => {
        if (
            brands &&
            brands.customAttributeMetadata &&
            brands.customAttributeMetadata.items &&
            brands.customAttributeMetadata.items.length > 0
        ) {
            const brandList = brands.customAttributeMetadata.items[0];
            const { attribute_options } = brandList;
            return attribute_options || [];
        }
        return [];
    }, [brands]);

    const horizontalLine = type => {
        if (!isTabletMobile()) {
            if (type == 1) {
                return <div className={classes.line20} />;
            }
            if (type == 2) {
                return <div className={classes.line70} />;
            }
            if (type == 3) {
                return <div className={classes.line30} />;
            }
        }

        if (isTabletMobile()) {
            if (type == 1) {
                return <div className={classes.line20} />;
            }
            if (type == 2) {
                return <div className={classes.line30} />;
            }
        }
        return <div className={classes.line30} />;
    };

    if (shouldShowLoadingIndicator && loading) {
        return fullPageLoadingIndicator;
    }

    if (hasContent) {
        const {
            content_heading,
            title,
            meta_title,
            meta_description,
            content
        } = cmsPage;

        const headingElement =
            content_heading !== '' ? (
                <h1 className={classes.heading}>{content_heading}</h1>
            ) : null;

        const pageTitle = meta_title || title;

        return (
            <React.Fragment>
                <StoreTitle>{pageTitle}</StoreTitle>
                <Meta name="title" content={pageTitle} />
                <Meta name="description" content={meta_description} />
                {headingElement}
                <RichContent html={content} />
            </React.Fragment>
        );
    } else if (
        relativeUrl &&
        relativeUrl === 'home' &&
        !shouldShowLoadingIndicator
    ) {
        const { title, meta_title, meta_description } = cmsPage || {};
        const pageTitle = meta_title || title;

        return (
            <React.Fragment>
                {/* <MetaTag
                    title={pageTitle}
                    desc={meta_description}
                    image={'/venia-static/icons/app/oudLogo.png'}
                /> */}
                {isPageLoading && (
                    <div className={classes.modal_active}>
                        <LoadingIndicator global={true}>
                            <FormattedMessage
                                id={'productFullDetail.loading'}
                                defaultMessage={'Loading ...'}
                            />
                        </LoadingIndicator>
                    </div>
                )}
                {_.map(homePage, (page, index) => {
                    const landingType = page.landing_page[0].landing_type;
                    const banner = page.landing_page[0].banner;
                    const products = page.landing_page[0].product_list;
                    const keyPage = `${index}${page.landing_page_id}`;

                    switch (landingType) {
                        case LandingType.sliders:
                            return (
                                <Fragment key={keyPage}>
                                    <BannerSlider
                                        key={keyPage}
                                        landingPageId={page.landing_page_id}
                                        data={banner}
                                    />
                                    {!isTabletMobile() &&
                                        horizontalLine(landingType)}
                                </Fragment>
                            );
                        case LandingType.category:
                            return (
                                <ShopByCategories
                                    items={banner}
                                    key={keyPage}
                                    landingPageId={page.landing_page_id}
                                />
                            );
                        case LandingType.banners:
                            if (banner.length <= 3) {
                                return (
                                    <React.Fragment key={index}>
                                        {horizontalLine(landingType)}
                                        <ColumnBanner
                                            key={keyPage}
                                            landingPageId={page.landing_page_id}
                                            items={banner}
                                            hasThreeColumns={
                                                banner.length === 3
                                            }
                                        />
                                    </React.Fragment>
                                );
                            }
                            if (banner.length === 4) {
                                return (
                                    <React.Fragment key={index}>
                                        {/* {page.landing_page_id !== 9 &&
                                            horizontalLine(index)} */}
                                        <TopCategories
                                            key={keyPage}
                                            landingPageId={page.landing_page_id}
                                            data={banner}
                                        />
                                    </React.Fragment>
                                );
                            }
                            {
                                /*
                             return (
                                <React.Fragment key={index}>
                                    <div></div>
                                     {horizontalLine(index)} 
                                     <ShopByBrands
                                        key={keyPage}
                                        landingPageId={page.landing_page_id}
                                        items={shopBrands}
                                        header={formatMessage({
                                            id: 'home.shopByBrands',
                                            defaultMessage: 'SHOP BY BRANDS'
                                        })}
                                    /> 
                                </React.Fragment>
                            ); */
                            }

                            return <React.Fragment key={index} />;
                        case LandingType.products:
                            if (
                                products &&
                                products[0].list_title ===
                                    'RECOMMENDED PRODUCTS'
                            ) {
                                return (
                                    <React.Fragment key={index}>
                                        {/* {horizontalLine(index)} */}
                                        <RecommendedProducts
                                            key={keyPage}
                                            items={
                                                products[0].products.items || []
                                            }
                                            slidesToShow={
                                                products[0].location === 0
                                                    ? 5
                                                    : 4
                                            }
                                            header={products[0].list_title}
                                            productOutStock={productOutStock}
                                        />
                                    </React.Fragment>
                                );
                            } else
                                return (
                                    <React.Fragment key={index}>
                                        {horizontalLine(landingType)}
                                        <ProductBlock
                                            key={keyPage}
                                            data={products[0] || {}}
                                            items={
                                                products[0].products.items || []
                                            }
                                            header={products[0].list_title}
                                            productOutStock={productOutStock}
                                        />
                                    </React.Fragment>
                                );
                    }
                })}
            </React.Fragment>
        );
    }
    return <div />;
};

CMSPage.propTypes = {
    id: number,
    classes: shape({
        heading: string
    })
};

export default CMSPage;
