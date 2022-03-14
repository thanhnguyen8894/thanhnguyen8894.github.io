import React, { useRef, useCallback, useMemo } from 'react';
import { arrayOf, bool, number, shape, string } from 'prop-types';
import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon
} from 'react-feather';
import SlickSlider from 'react-slick';
import { css, Styled } from 'react-css-in-js';
import { useWindowSize } from '@magento/peregrine';

import { transparentPlaceholder } from '@magento/peregrine/lib/util/images';
import { useProductImageCarousel } from '@magento/peregrine/lib/talons/ProductImageCarousel/useProductImageCarousel';
import { useAppContext } from '@magento/peregrine/lib/context/app';

import { mergeClasses } from '../../classify';
import Icon from '../Icon';
import Image from '../Image';
import defaultClasses from './carousel.css';
import Thumbnail from './thumbnail';

import parseHTML from 'html-react-parser';
import { modifyImageUrl } from '@magento/peregrine/lib/util/common';

const IMAGE_WIDTH = 488;
const IMAGE_HEIGHT = 518;

/**
 * Carousel component for product images
 * Carousel - Component that holds number of images
 * where typically one image visible, and other
 * images can be navigated through previous and next buttons
 *
 * @typedef ProductImageCarousel
 * @kind functional component
 *
 * @param {props} props
 *
 * @returns {React.Element} React carousel component that displays a product image
 */
const ProductImageCarousel = props => {
    const [{ rtl, mobile, tablet, baseMediaUrl }] = useAppContext();
    const windowSize = useWindowSize();
    const isSubDesktop =
        windowSize.innerWidth >= 1350 && windowSize.innerWidth <= 1500;
    const isTabletOrMobile = () => {
        return mobile || tablet;
    };

    const classes = mergeClasses(defaultClasses, props.classes);

    const { images, productLabel } = props;

    const widthCal = window.innerWidth - 30;

    const heightProductImage = () => {
        if (mobile) {
            return widthCal;
        }
        return 345;
    };
    const widthProductImage = () => {
        if (mobile) {
            return widthCal;
        }
        return IMAGE_WIDTH;
    };

    // PRODUCT LABEL
    const imgPosition = position => {
        let cusCss = {
            position: 'absolute',
            zIndex: 2
        };
        if (position.includes('top')) {
            cusCss = {
                ...cusCss,
                top: 0
            };
        }
        if (position.includes('middle')) {
            cusCss = {
                ...cusCss,
                bottom: '33.3%'
            };
        }
        if (position.includes('bottom')) {
            cusCss = {
                ...cusCss,
                bottom: 0
            };
        }
        if (position.includes('left')) {
            cusCss = {
                ...cusCss,
                left: 0
            };
        }
        if (position.includes('center')) {
            cusCss = {
                ...cusCss,
                right: '33.3%'
            };
        }
        if (position.includes('right')) {
            cusCss = {
                ...cusCss,
                right: 0
            };
        }
        return cusCss;
    };

    const txtPosition = image => {
        let txtCss = {};
        if (image) {
            txtCss = {
                position: 'absolute',
                top: '40%',
                right: '10px',
                left: '10px'
            };
        }
        return txtCss;
    };

    const labelProduct =
        productLabel?.length > 0 &&
        productLabel.map(label => {
            const {
                image,
                name,
                txt = '',
                style,
                size,
                position,
                label_id
            } = label;
            const sizeImage = size
                ? Math.abs((size / 100) * widthProductImage())
                : 'auto';

            return (
                <div key={label_id} style={imgPosition(position)}>
                    {image && (
                        <img
                            src={modifyImageUrl(`/${image}`, baseMediaUrl)}
                            alt={name}
                            width={sizeImage}
                        />
                    )}
                    <Styled>
                        {css`
                            ${style}
                        `}
                        <label style={txtPosition(image)}>
                            {parseHTML(txt)}
                        </label>
                    </Styled>
                </div>
            );
        });
    // END

    const talonProps = useProductImageCarousel({
        images,
        imageWidth: IMAGE_WIDTH
    });

    const {
        currentImage,
        activeItemIndex,
        altText,
        handleNext,
        handlePrevious,
        handleThumbnailClick,
        sortedImages
    } = talonProps;

    // create thumbnail image component for every images in sorted order
    const thumbnails = useMemo(
        () =>
            sortedImages.map((item, index) => (
                <Thumbnail
                    key={`${item.file}--${item.label}`}
                    item={item}
                    itemIndex={index}
                    isActive={activeItemIndex === index}
                    onClickHandler={handleThumbnailClick}
                />
            )),
        [activeItemIndex, handleThumbnailClick, sortedImages]
    );

    let image;
    if (currentImage.file) {
        image = (
            <Image
                alt={altText || ''}
                classes={{
                    image: classes.currentImage,
                    root: classes.imageContainer,
                    loaded: classes.customImage
                }}
                resource={currentImage.file}
                height={heightProductImage()}
                width={widthProductImage()}
                showZoom={true}
            />
        );
    } else {
        image = (
            <Image
                alt={altText || ''}
                classes={{
                    image: classes.currentImage_placeholder,
                    root: classes.imageContainer,
                    loaded: classes.customImage
                }}
                src={transparentPlaceholder}
                height={heightProductImage()}
                width={widthProductImage()}
                showZoom={true}
            />
        );
    }

    const carouselSettings = {
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        draggable: true,
        vertical: true,
        verticalSwiping: true,
        dots: false,
        responsive: [
            {
                breakpoint: 1501,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 1349,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            }
        ]
    };

    const settings = {
        // dots: true,
        infinite: true,
        initialSlide: rtl ? images.length - 1 : 0,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        // appendDots: dots => (
        //     <div>
        //         <ul className={rtl ? classes.buttonBoxRtl : ''}>
        //             {' '}
        //             {!rtl ? dots : dots.reverse()}{' '}
        //         </ul>
        //     </div>
        // ),
        customPaging: i => (
            <div
                style={{
                    width: '20px',
                    height: '3px',
                    borderRadius: '2px',
                    backgroundColor: '#E5E5E5'
                }}
            />
        )
    };

    const imageElement = useMemo(
        () =>
            images.map(img => {
                const { file, label, id } = img;
                if (file) {
                    return (
                        <Image
                            key={id}
                            classes={{
                                image: classes.currentImage,
                                root: classes.imageContainer,
                                loaded: classes.customImage
                            }}
                            alt={label || ''}
                            resource={file}
                            height={heightProductImage()}
                            width={widthProductImage()}
                            showZoom={true}
                        />
                    );
                } else
                    return (
                        <Image
                            key={id}
                            alt={label || ''}
                            classes={{
                                image: classes.currentImage_placeholder,
                                root: classes.imageContainer,
                                loaded: classes.customImage
                            }}
                            src={transparentPlaceholder}
                            height={heightProductImage()}
                            width={widthProductImage()}
                            showZoom={true}
                        />
                    );
            }),
        [images]
    );

    const sliderRef = useRef();

    const onNextSlider = useCallback(() => {
        sliderRef.current.slickNext();
    }, [imageElement]);
    const onPreSlider = useCallback(() => {
        sliderRef.current.slickPrev();
    }, [imageElement]);

    const imageMobile = (
        <div className={classes.sliderImage}>
            <SlickSlider ref={sliderRef} {...settings}>
                {imageElement}
            </SlickSlider>
        </div>
    );

    const lengthThumbnails = 3;
    const chevronClasses = { root: classes.chevron };

    return (
        <div
            className={`${classes.root} ${
                isTabletOrMobile() ? classes.rootMobile : ''
            }`}
        >
            <div className={classes.carouselContainer}>
                <button
                    className={classes.previousButton}
                    onClick={onPreSlider}
                    type="button"
                >
                    <Icon
                        classes={chevronClasses}
                        src={ArrowLeftIcon}
                        size={24}
                    />
                </button>
                {isTabletOrMobile() ? (
                    <div className={classes.mainImgContainer}>
                        {imageMobile}
                        {labelProduct}
                    </div>
                ) : (
                    <div className={classes.mainImgContainer}>
                        {image}
                        {labelProduct}
                    </div>
                )}
                <button
                    className={classes.nextButton}
                    onClick={onNextSlider}
                    type="button"
                >
                    <Icon
                        classes={chevronClasses}
                        src={ArrowRightIcon}
                        size={24}
                    />
                </button>
            </div>
            <div className={classes.thumbnailList}>
                <div className={classes.slider}>
                    {thumbnails.length > lengthThumbnails ? (
                        <SlickSlider ref={sliderRef} {...carouselSettings}>
                            {thumbnails}
                        </SlickSlider>
                    ) : (
                        <>{thumbnails}</>
                    )}
                </div>
                <div className={classes.actionSlider}>
                    <button
                        className={classes.nextSlider}
                        onClick={onNextSlider}
                        disabled={thumbnails.length < lengthThumbnails + 1}
                    />
                    <button
                        className={classes.preSlider}
                        onClick={onPreSlider}
                        disabled={thumbnails.length < lengthThumbnails + 1}
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * Props for {@link ProductImageCarousel}
 *
 * @typedef props
 *
 * @property {Object} classes An object containing the class names for the
 * ProductImageCarousel component
 * @property {string} classes.currentImage classes for visible image
 * @property {string} classes.imageContainer classes for image container
 * @property {string} classes.nextButton classes for next button
 * @property {string} classes.previousButton classes for previous button
 * @property {string} classes.root classes for root container
 * @property {Object[]} images Product images input for Carousel
 * @property {string} images.label label for image
 * @property {string} image.position Position of image in Carousel
 * @property {bool} image.disabled Is image disabled
 * @property {string} image.file filePath of image
 */
ProductImageCarousel.propTypes = {
    classes: shape({
        carouselContainer: string,
        currentImage: string,
        currentImage_placeholder: string,
        imageContainer: string,
        nextButton: string,
        previousButton: string,
        root: string
    }),
    infinite: bool,
    speed: number,
    slidesToShow: number,
    slidesToScroll: number,
    arrows: bool,
    autoplay: bool,
    autoplaySpeed: number,
    draggable: bool,
    vertical: bool,
    images: arrayOf(
        shape({
            label: string,
            position: number,
            disabled: bool,
            file: string.isRequired
        })
    ).isRequired
};

export default ProductImageCarousel;
