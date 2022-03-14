import React, { useRef, useCallback } from 'react';
import { shape, string, array, bool, number } from 'prop-types';
import SlickSlider from 'react-slick';
import { Link } from '@magento/venia-drivers';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
} from 'react-feather';

import Image from '../Image';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './shopByCategories.css';
import Icon from '../Icon';

const ShopByCategories = props => {
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
        centerPadding,
        adaptiveHeight,
        items,
        landingPageId
    } = props;

    const sliderRef = useRef();
    const classes = mergeClasses(defaultClasses, propClasses);

    const [{ mobile, tablet, rtl, baseMediaUrl, subDesktop }] = useAppContext();
    const chevronClasses = { root: classes.chevron };

    const heightImage = () => {
        if (mobile || tablet || subDesktop) {
            return 100;
        }
        return 120;
    };
    const widthImage = () => {
        if (tablet || subDesktop || mobile) {
            return 100;
        }
        return 120;
    };

    const sliderItems = items.map((item, index) => {
        const _banner_url =
            item.banner_url === '/'
                ? item.banner_url
                : `${item.banner_url}.html`;
        return (
            <Link
                key={index}
                to={_banner_url}
                className={classes.brandImageLink}
            >
                <Image
                    alt={item.banner_name || ''}
                    classes={{
                        image: classes.brandImage,
                        root: classes.imageContainer
                    }}
                    src={
                        mobile
                            ? `${baseMediaUrl}${item.banner_image_mobile}`
                            : `${baseMediaUrl}${item.banner_image}`
                    }
                    height={heightImage()}
                    width={widthImage()}
                />
                <div className={classes.label}>{item.banner_name}</div>
            </Link>
        );
    });

    const carouselSettings = {
        slidesToShow: slidesToShow,
        slidesToScroll: slidesToScroll,
        draggable,
        autoplay,
        autoplaySpeed,
        arrows,
        dots: mobile,
        infinite: items.length > 12,
        centerMode,
        centerPadding,
        adaptiveHeight,
        className: 'slick-categories',
        responsive: [
            {
                breakpoint: 1600,
                settings: {
                    centerMode: true,
                    slidesToShow: 12,
                    slidesToScroll: 1,
                    // slidesPerRow: 5,
                    centerPadding: 5,
                    autoplaySpeed: 500
                }
            },
            {
                breakpoint: 1400,
                settings: {
                    centerMode: true,
                    slidesToShow: 9,
                    slidesToScroll: 1,
                    // slidesPerRow: 5,
                    centerPadding: 5,
                    autoplaySpeed: 500
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    centerMode: true,
                    slidesToShow: 6,
                    slidesToScroll: 1,
                    // slidesPerRow: 4,
                    centerPadding: 0,
                    autoplaySpeed: 500
                }
            },
            {
                breakpoint: 640,
                settings: {
                    centerMode: true,
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    rows: 2,
                    // slidesPerRow: 3,
                    centerPadding: 0,
                    autoplaySpeed: 500
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
                    autoplaySpeed: 500
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
            key={landingPageId}
            className={`
            ${classes.root} 
            ${mobile ? classes.rootMobile : ''}
            ${tablet ? classes.rootTablet : ''}
        `}
        >
            {!mobile && (
                <div>
                    <button
                        className={classes.previousButton}
                        onClick={onPreSlider}
                        type="button"
                    >
                        <Icon
                            classes={chevronClasses}
                            src={ChevronLeftIcon}
                            size={60}
                        />
                    </button>
                    <button
                        className={classes.nextButton}
                        onClick={onNextSlider}
                        type="button"
                    >
                        <Icon
                            classes={chevronClasses}
                            src={ChevronRightIcon}
                            size={60}
                        />
                    </button>
                </div>
            )}
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
ShopByCategories.propTypes = {
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

ShopByCategories.defaultProps = {
    slidesToShow: 12,
    slidesToScroll: 1,
    items: [],
    draggable: true,
    autoplay: false,
    autoplaySpeed: 4000,
    arrows: false,
    dots: true,
    centerMode: true,
    adaptiveHeight: true,
    centerPadding: 10
};

export default ShopByCategories;
