import React, { useRef, useCallback } from 'react';
import { arrayOf, array, bool, number, shape, string } from 'prop-types';
import SlickSlider from 'react-slick';
import defaultClasses from './bannerSlider.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { jarallax } from 'jarallax';
import { Link } from '@magento/venia-drivers';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
} from 'react-feather';

import { useAppContext } from '@magento/peregrine/lib/context/app';

import Image from '../Image';
import Icon from '../Icon';
// import ShopByCategories from '../ShopByCategories/shopByCategories';

/**
 * BannerSlider component.
 *
 *
 * @typedef BannerSlider
 * @kind functional component
 *
 * @param {props} props React component props
 *
 * @returns {React.Element} A React component that displays a BannerSlider which contains slides.
 */
const BannerSlider = props => {
    const sliderRef = useRef();
    const classes = mergeClasses(defaultClasses, props.classes);
    const [{ mobile, tablet, rtl, baseMediaUrl, subDesktop }] = useAppContext();

    const preSliderClass = rtl ? classes.preSliderRtl : classes.preSlider;
    const nextSliderClass = rtl ? classes.nextSliderRtl : classes.nextSlider;

    const {
        autoplay,
        autoplaySpeed,
        fade,
        infinite,
        showArrows,
        showDots,
        data,
        landingPageId
    } = props;

    const jarallaxInstances = {};
    const chevronClasses = { root: classes.chevron };
    const sliderSettings = {
        dots: showDots,
        arrows: showArrows,
        afterChange: () => {
            Object.keys(jarallaxInstances).map(key => {
                jarallax(jarallaxInstances[key].element, 'onScroll');
            });
        },
        infinite,
        autoplay: true,
        autoplaySpeed,
        fade,
        loop: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    initialSlide: 1
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ],
        customPaging: () => {
            return <button />;
        }
    };

    const heightBanner = () => {
        if (mobile) {
            return 550;
        }
        if (tablet) {
            return 600;
        }
        if (subDesktop) {
            return 475;
        }
        return 650;
    };

    const onNextSlider = useCallback(() => {
        sliderRef.current.slickNext();
    }, []);
    const onPreSlider = useCallback(() => {
        sliderRef.current.slickPrev();
    }, []);

    const sliderItems = data.map((item, index) => {
        const _banner_url =
            item.banner_url === '/'
                ? item.banner_url
                : `${item.banner_url}.html`;

        return (
            <div
                key={index}
                className={`${classes.classRootSection} ${item.classSection}`}
            >
                <Link
                    to={_banner_url}
                    className={classes.bannerImageLink}
                    onClick={() =>
                        setTimeout(() => {
                            window.location.reload();
                        }, 500)
                    }
                >
                    <img
                        src={
                            mobile
                                ? `${baseMediaUrl}${item.banner_image_mobile}`
                                : `${baseMediaUrl}${item.banner_image}`
                        }
                        alt={item.banner_name}
                        height={tablet ? 'auto' : heightBanner()}
                        width={'100%'}
                    />
                </Link>
            </div>
        );
    });

    return (
        <div
            key={landingPageId}
            className={`${classes.root} ${mobile ? classes.rootMobile : ''} ${
                tablet ? classes.rootTablet : ''
            }`}
        >
            {/* <div className={classes.actionSlider}>
                <button className={classes.preSlider} onClick={onPreSlider} />
                <button className={classes.nextSlider} onClick={onNextSlider} />
            </div> */}
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
                            size={75}
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
                            size={75}
                        />
                    </button>
                </div>
            )}
            <SlickSlider ref={sliderRef} {...sliderSettings}>
                {sliderItems}
            </SlickSlider>
            {/* <ShopByCategories items={DUMP_DATA} /> */}
        </div>
    );
};

BannerSlider.propTypes = {
    landingPageId: number,
    classes: shape({
        root: string
    }),
    cssClasses: arrayOf(string),
    showDots: bool,
    showArrows: bool,
    autoplay: bool,
    autoplaySpeed: number,
    infinite: bool,
    fade: bool,
    slidesToShow: number,
    slidesToScroll: number,
    data: array
};

BannerSlider.defaultProps = {
    showDots: false,
    showArrows: false,
    autoplay: true,
    autoplaySpeed: 4000,
    infinite: true,
    fade: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    cssClasses: [],
    data: []
};

export default BannerSlider;
