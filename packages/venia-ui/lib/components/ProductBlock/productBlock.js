import React, { useRef, useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import { shape, string, array, bool, number, object } from 'prop-types';
import { Link } from '@magento/venia-drivers';
import SlickSlider from 'react-slick';

import { useAppContext } from '@magento/peregrine/lib/context/app';

import Image from '../Image';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './productBlock.css';
import BaseProduct from '@magento/venia-ui/lib/components/Product/baseProduct';
import bannerLocation from '@magento/venia-ui/lib/util/bannerLocation';
import { images } from '@magento/venia-ui/lib/constants/images';
import { useWishlistAction } from '@magento/peregrine/lib/talons/Wishlist/useWishlistAction';
import { useCommonToasts } from '@magento/peregrine/lib/talons/Wishlist/useCommonToasts';

const Wrapper = styled.div`
    grid-template-areas: ${props =>
        props.locationBanner === 'left'
            ? "'banner slider'"
            : "'slider banner'"};
    grid-template-columns: ${props =>
        !props.locationBanner
            ? '100%'
            : props.locationBanner === 'left'
            ? 'auto calc(100% - 310px)'
            : props.locationBanner === 'right' && 'calc(100% - 310px) auto'};
`;

const ProductBlock = props => {
    const {
        classes: propClasses,
        header,
        slidesToShow,
        slidesToScroll,
        draggable,
        autoplay,
        autoplaySpeed,
        arrows,
        dots,
        centerMode,
        infinite,
        items,
        data,
        productOutStock,
    } = props;

    const sliderRef = useRef();
    const [{ mobile, tablet, subDesktop, rtl, baseMediaUrl }] = useAppContext();
    const classes = mergeClasses(defaultClasses, propClasses);
    const [banner, setBanner] = useState(null);
    const [bannerPosition, setBannerPosition] = useState();
    const [bannerLink, setBannerLink] = useState('/');

    const {
        loading,
        successToastProps,
        wishlistAction,
        errorToastProps,
        derivedWishlists
    } = useWishlistAction({});
    useCommonToasts({ successToastProps, errorToastProps });

    const preSliderClass = rtl ? classes.preSliderRtl : classes.preSlider;
    const nextSliderClass = rtl ? classes.nextSliderRtl : classes.nextSlider;

    const isTabletOrMobile = () => {
        return mobile || tablet;
    };

    const sliderItems = items.map((item, index) => {
        const { salable_qty } = item;
        if (salable_qty > 0 || (salable_qty <= 0 && !productOutStock)) {
            return (
                <BaseProduct
                    key={index}
                    item={item}
                    isLoading={loading}
                    classes={{
                        rootMobile: classes.customBaseProductMobile,
                        rootTablet: classes.customBaseProductTablet
                    }}
                    productOutStock={productOutStock}
                    derivedWishlists={derivedWishlists}
                    onHandleWishlist={wishlistAction}
                />
            );
        } else return;
    });

    const carouselSettings = {
        slidesToShow: banner ? 3 : 4,
        slidesToScroll: slidesToScroll,
        draggable,
        autoplay,
        autoplaySpeed,
        arrows,
        dots,
        infinite,
        centerMode,
        slidesPerRow: (!isTabletOrMobile() && (data && data.slider_rows)) || 1,
        responsive: [
            {
                breakpoint: 1230,
                settings: {
                    slidesToShow: banner ? 2 : 3
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 2
                    // rows: 2
                    // slidesPerRow: 2
                }
            },
            {
                breakpoint: 350,
                settings: {
                    centerMode: true,
                    centerPadding: 0,
                    slidesToShow: 1,
                    rows: 1
                    // slidesPerRow: 2
                }
            }
        ]
    };

    const onNextSlider = useCallback(() => {
        sliderRef.current.slickNext();
    }, []);
    const onPreSlider = useCallback(() => {
        sliderRef.current.slickPrev();
    }, []);

    useEffect(() => {
        if (!data.list_image) {
            return null;
        }
        setBanner(`${baseMediaUrl}${data.list_image}`);
        if (isTabletOrMobile()) {
            const imageURL = `${baseMediaUrl}${data.list_image_tablet}`;
            setBanner(imageURL);
        }
        // check position of Banner
        setBannerPosition(bannerLocation(data));

        // handle to link on banner
        let renderBannerLink = `/products/${data.productlist_id}?name=${
            data.list_title
        }`;
        setBannerLink(renderBannerLink);
        if (data.list_type === 6 && data.banner_url) {
            setBannerLink(data.banner_url);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    return (
        <div
            className={`${classes.root} ${mobile ? classes.rootMobile : ''} ${
                tablet ? classes.rootTablet : ''
            }`}
        >
            {isTabletOrMobile() && (
                <div className={classes.banner}>
                    {banner && (
                        <>
                            <Link
                                to={bannerLink}
                                className={classes.bannerImageLink}
                            >
                                <img
                                    alt={''}
                                    classes={{
                                        image: classes.bannerImage,
                                        root: classes.imageContainer
                                    }}
                                    src={banner}
                                />
                            </Link>
                            <div className={classes.line30} />
                        </>
                    )}
                    {/* <div className={classes.bannerContent}>
                    <h5 className={classes.headerBannerContent}>
                        {formatMessage({
                            id: 'home.newCatalogue',
                            defaultMessage: 'NEW CATALOGUE'
                        })}
                    </h5>
                    <h2 className={classes.title}>
                        {formatMessage({
                            id: 'home.flashDeals',
                            defaultMessage: 'FLASH DEALS'
                        })}
                    </h2>
                </div> */}
                </div>
            )}
            <div className={classes.containerTitle}>
                <h2 className={classes.heading}>{header}</h2>
                <div>
                    <img
                        className={preSliderClass}
                        onClick={rtl ? onNextSlider : onPreSlider}
                        src={images.arrowPrev}
                        width={14}
                        height={14}
                    />
                    <img
                        className={nextSliderClass}
                        onClick={rtl ? onPreSlider : onNextSlider}
                        src={images.arrowNext}
                        width={14}
                        height={14}
                    />
                </div>
                {/* <div>
                    <button
                        className={preSliderClass}
                        onClick={rtl ? onNextSlider : onPreSlider}
                    />
                    <button
                        className={nextSliderClass}
                        onClick={rtl ? onPreSlider : onNextSlider}
                    />
                </div> */}
            </div>
            <Wrapper
                className={classes.wrapper}
                locationBanner={bannerPosition}
                subDesktop={subDesktop}
            >
                <div className={classes.slider}>
                    <SlickSlider ref={sliderRef} {...carouselSettings}>
                        {sliderItems}
                    </SlickSlider>
                </div>

                {!isTabletOrMobile() && bannerPosition && (
                    <div className={classes.banner}>
                        <Link
                            to={bannerLink}
                            className={classes.bannerImageLink}
                        >
                            {banner && (
                                <Image
                                    alt={''}
                                    classes={{
                                        image: classes.bannerImage,
                                        root: classes.imageContainer
                                    }}
                                    src={banner}
                                    height={data.slider_rows === 1 ? 480 : 930}
                                    width={280}
                                />
                            )}
                        </Link>
                        {/* <div className={classes.bannerContent}>
                            <h5 className={classes.headerBannerContent}>
                                {formatMessage({
                                    id: 'home.newCatalogue',
                                    defaultMessage: 'NEW CATALOGUE'
                                })}
                            </h5>
                            <h2 className={classes.title}>
                                {formatMessage({
                                    id: 'home.flashDeals',
                                    defaultMessage: 'FLASH DEALS'
                                })}
                            </h2>
                        </div> */}
                    </div>
                )}
            </Wrapper>
        </div>
    );
};
ProductBlock.propTypes = {
    classes: shape({
        root: string
    }),
    header: string,
    slidesToShow: number,
    slidesToScroll: number,
    draggable: bool,
    autoplay: bool,
    autoplaySpeed: number,
    arrows: bool,
    dots: bool,
    infinite: bool,
    centerMode: bool,
    centerPadding: number,
    items: array,
    data: object,
    bannerPosition: string
};

ProductBlock.defaultProps = {
    slidesToShow: 4,
    slidesToScroll: 1,
    draggable: true,
    autoplay: false,
    autoplaySpeed: 4000,
    arrows: false,
    dots: false,
    infinite: true,
    centerMode: false,
    centerPadding: 0,
    items: [],
    data: {},
    bannerPosition: ''
};

export default ProductBlock;
