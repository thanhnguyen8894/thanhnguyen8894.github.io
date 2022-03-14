import React, { useRef, useCallback } from 'react';
import { shape, string, array, bool, number } from 'prop-types';
import SlickSlider from 'react-slick';
import { Link } from '@magento/venia-drivers';
import { useAppContext } from '@magento/peregrine/lib/context/app';

import Image from '../Image';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './shopByBrands.css';

const ShopByBrands = props => {
    const { classes: propClasses,
            header,
            slidesToShow,
            slidesToScroll,
            draggable,
            autoplay,
            autoplaySpeed,
            arrows,
            dots,
            centerMode,
            centerPadding,
            adaptiveHeight,
            items,
            landingPageId
        } = props;

    const sliderRef = useRef();
    const classes = mergeClasses(defaultClasses, propClasses);

    const [{ mobile, tablet, rtl }] = useAppContext();

    const preSliderClass = rtl ? classes.preSliderRtl : classes.preSlider;
    const nextSliderClass = rtl ? classes.nextSliderRtl : classes.nextSlider;

    const heightImage = () => {
        if (mobile) {
            return 60;
        }
        if (tablet) {
            return 120;
        }
        return 150;
    };
    const widthImage = () => {
        if (mobile) {
            return 100;
        }
        if (tablet) {
            return '100%';
        }
        return 250;
    };

    const sliderItems = items.map((item, index) => {
        return (
        <Link key={index} to={item.banner_url || '/'} className={classes.brandImageLink}>
            <Image
                alt={item.label || ''}
                classes={{
                    image: classes.brandImage,
                    root: classes.imageContainer
                }}
                src={item.swatch_data ? item.swatch_data.thumbnail : item.label}
                resource={item.swatch_data ? item.swatch_data.thumbnail : item.label}
                height={heightImage()}
                width={widthImage()}
            />
        </Link>);
    });

    const carouselSettings = {
        slidesToShow: slidesToShow,
        slidesToScroll: slidesToScroll,
        draggable,
        autoplay,
        autoplaySpeed,
        arrows,
        dots,
        centerMode,
        centerPadding,
        adaptiveHeight,
        responsive: [
            {
                breakpoint: 1600,
                settings: {
                    centerMode: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    slidesPerRow: 5,
                    centerPadding: 0,
                    autoplaySpeed: 500,
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    centerMode: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    slidesPerRow: 4,
                    centerPadding: 0,
                    autoplaySpeed: 500,
                }
            },
            {
                breakpoint: 640,
                settings: {
                    centerMode: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    rows: 2,
                    slidesPerRow: 3,
                    centerPadding: 0,
                    autoplaySpeed: 500,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    centerMode: true,
                    centerPadding: 0,
                    slidesToShow: 1,
                    rows: 2,
                    slidesPerRow: 3,
                    autoplaySpeed: 500,
                }
            }
        ]
    };

    const onNextSlider = useCallback(
        () => {
            sliderRef.current.slickNext();
        },
    []);
    const onPreSlider = useCallback(
        () => {
            sliderRef.current.slickPrev();
        },
    []);

    return (
        <div key={landingPageId} className={`
            ${classes.root} 
            ${mobile ? classes.rootMobile : ''}
            ${tablet ? classes.rootTablet : ''}
        `}>
            <div className={classes.containerHeading}>
                <h2 className={classes.heading}>{header}</h2>
                <div>
                    <button className={preSliderClass} onClick={rtl ? onNextSlider : onPreSlider}></button>
                    <button className={nextSliderClass} onClick={rtl ? onPreSlider : onNextSlider}></button>
                </div>
            </div>
            <div className={classes.wrapper}>
                <div className={classes.slider}>
                    <SlickSlider ref={sliderRef} {...carouselSettings}>{sliderItems}</SlickSlider>
                </div>
            </div>
        </div>
    );
};
ShopByBrands.propTypes = {
    landingPageId: number,
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
    centerPadding: number,
    adaptiveHeight: bool
};

ShopByBrands.defaultProps = {
    slidesToShow: 6,
    slidesToScroll: 1,
    items: [],
    draggable: true,
    autoplay: false,
    autoplaySpeed: 4000,
    arrows: false,
    dots: false,
    centerMode: true,
    adaptiveHeight: true,
    centerPadding: 0
}

export default ShopByBrands;