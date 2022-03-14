import React, { useRef, useCallback, useState, useMemo } from 'react';
import { shape, string, array, bool, number } from 'prop-types';
import SlickSlider from 'react-slick';

import { useAppContext } from '@magento/peregrine/lib/context/app';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './recommendedProducts.css';
import BaseProduct from '@magento/venia-ui/lib/components/Product/baseProduct';
import { images } from '@magento/venia-ui/lib/constants/images';
import { useWishlistAction } from '@magento/peregrine/lib/talons/Wishlist/useWishlistAction';
import { useCommonToasts } from '@magento/peregrine/lib/talons/Wishlist/useCommonToasts';

const RecommendedProducts = props => {
    const {
        classes: propClasses,
        header,
        infinite,
        slidesToShow,
        slidesToScroll,
        draggable,
        autoplay,
        autoplaySpeed,
        arrows,
        dots,
        centerMode,
        items,
        customMobileProductDetails,
        productOutStock
    } = props;

    const {
        loading,
        successToastProps,
        wishlistAction,
        errorToastProps,
        derivedWishlists
    } = useWishlistAction({});
    useCommonToasts({ successToastProps, errorToastProps });

    const sliderRef = useRef();
    const classes = mergeClasses(defaultClasses, propClasses);
    const [{ mobile, tablet, rtl }] = useAppContext();

    const preSliderClass = rtl ? classes.preSliderRtl : classes.preSlider;
    const nextSliderClass = rtl ? classes.nextSliderRtl : classes.nextSlider;

    const sliderItems = useMemo(() => {
        return items.map((item, index) => {
            const { salable_qty } = item;
            if (salable_qty > 0 || (salable_qty <= 0 && !productOutStock)) {
                return (
                    <BaseProduct
                        key={index}
                        showTime={false}
                        item={item}
                        isLoading={loading}
                        classes={{ addToCart: classes.addToCart }}
                        customMobileProductDetails={customMobileProductDetails}
                        productOutStock={productOutStock}
                        derivedWishlists={derivedWishlists}
                        onHandleWishlist={wishlistAction}
                    />
                );
            } else return;
        });
    }, [
        classes.addToCart,
        customMobileProductDetails,
        derivedWishlists,
        items,
        loading,
        productOutStock,
        wishlistAction
    ]);

    const carouselSettings = {
        slidesToShow: slidesToShow,
        slidesToScroll: slidesToScroll,
        draggable,
        autoplay,
        autoplaySpeed,
        arrows,
        dots,
        centerMode,
        infinite:
            sliderItems && sliderItems.length > slidesToShow ? true : false,
        responsive: [
            {
                breakpoint: 1230,
                settings: {
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    infinite:
                        sliderItems && sliderItems.length > 3 ? true : false,
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 600,
                settings: {
                    infinite:
                        sliderItems && sliderItems.length > 2 ? true : false,
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 350,
                settings: {
                    slidesToShow: 1,
                    infinite:
                        sliderItems && sliderItems.length > 1 ? true : false
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

    return (
        <div
            className={`
            ${classes.root} 
            ${mobile ? classes.rootMobile : ''}
            ${tablet ? classes.rootTablet : ''}
            ${
                customMobileProductDetails
                    ? classes.customMobileProductDetails
                    : ''
            }
        `}
        >
            <div className={classes.containerHeading}>
                <h2 className={classes.heading}>{header}</h2>
                {/* <div style={{ display: 'flex' }}>
                    <button
                        className={preSliderClass}
                        onClick={rtl ? onNextSlider : onPreSlider}
                    />
                    <button
                        className={nextSliderClass}
                        onClick={rtl ? onPreSlider : onNextSlider}
                    />
                </div> */}
                <div>
                    <button onClick={rtl ? onNextSlider : onPreSlider}>
                        <img
                            className={preSliderClass}
                            src={images.arrowPrev}
                            width={14}
                            height={14}
                            alt="previous"
                        />
                    </button>
                    <button onClick={rtl ? onPreSlider : onNextSlider}>
                        <img
                            className={nextSliderClass}
                            alt="next"
                            src={images.arrowNext}
                            width={14}
                            height={14}
                        />
                    </button>
                </div>
            </div>
            <div className={classes.wrapper}>
                <div className={classes.slider}>
                    <SlickSlider ref={sliderRef} {...carouselSettings}>
                        {sliderItems}
                    </SlickSlider>
                </div>
            </div>
        </div>
    );
};
RecommendedProducts.propTypes = {
    classes: shape({
        root: string
    }),
    header: string,
    items: array,
    slidesToShow: number,
    slidesToScroll: number,
    draggable: bool,
    autoplay: bool,
    autoplaySpeed: number,
    arrows: bool,
    dots: bool,
    centerMode: bool,
    infinite: bool,
    customMobileProductDetails: bool
};

RecommendedProducts.defaultProps = {
    infinite: false,
    slidesToShow: 4,
    slidesToScroll: 1,
    items: [],
    draggable: true,
    autoplay: false,
    autoplaySpeed: 4000,
    arrows: false,
    dots: false,
    centerMode: false,
    centerPadding: 0,
    customMobileProductDetails: false
};

export default RecommendedProducts;
