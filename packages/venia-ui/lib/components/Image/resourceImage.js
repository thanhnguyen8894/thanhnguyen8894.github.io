import React from 'react';
import ReactImageMagnify from 'react-image-magnify';
import { func, instanceOf, number, oneOfType, string } from 'prop-types';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useResourceImage } from '@magento/peregrine/lib/talons/Image/useResourceImage';
import {
    generateSrcsetWithBaseUrl,
    generateSrcset,
    generateUrl
} from '@magento/peregrine/lib/util/imageUtils';
import { modifyImageUrl } from '@magento/peregrine/lib/util/common';

/**
 * Renders a Magento resource image.
 *
 * @param {string}   props.alt the alt attribute to apply to the image.
 * @param {string}   props.className the class to apply to this image.
 * @param {Func}     props.handleError the function to call if the image fails to load.
 * @param {Func}     props.handleLoad the function to call if the image successfully loads.
 * @param {number}   props.height the height to request for the fallback image for browsers that don't support srcset / sizes.
 * @param {string}   props.resource the Magento path to the image ex: /v/d/vd12-rn_main_2.jpg
 * @param {string}   props.type the Magento image type ("image-category" / "image-product"). Used to build the resource URL.
 * @param {number}   props.width the intrinsic width of the image & the width to request for the fallback image for browsers that don't support srcset / sizes.
 * @param {Map}      props.widths a map of breakpoints to possible widths used to create the img's sizes attribute.
 * @param {number}   props.ratio is the image width to height ratio. Defaults to 4/5.
 */
const ResourceImage = props => {
    const [{ rtl, baseMediaUrl }] = useAppContext();
    const {
        alt,
        showZoom,
        className,
        handleError,
        handleLoad,
        height,
        resource,
        type,
        width,
        widths,
        ratio,
        ...rest
    } = props;

    const talonProps = useResourceImage({
        generateSrcsetWithBaseUrl,
        generateSrcset,
        generateUrl,
        height,
        resource,
        type,
        width,
        widths,
        ratio
    });

    const { sizes, src, srcSet } = talonProps;
    const _src = modifyImageUrl(src, baseMediaUrl);

    const imageZoom = (
        <ReactImageMagnify
            {...{
                smallImage: {
                    alt: alt,
                    isFluidWidth: true,
                    src: _src
                },
                largeImage: {
                    src: _src,
                    width: 1200,
                    height: 1200
                },
                style: {
                    zIndex: 2
                },
                enlargedImageContainerStyle: rtl
                    ? {
                          right: '100%',
                          left: 0,
                          zIndex: 2,
                          marginRight: '10px',
                          direction: 'ltr'
                      }
                    : {}
            }}
        />
    );

    // Note: Attributes that are allowed to be overridden must appear before the spread of `rest`.
    return showZoom ? (
        imageZoom
    ) : (
        <img
            loading="lazy"
            {...rest}
            alt={alt}
            className={className}
            onError={handleError}
            onLoad={handleLoad}
            sizes={sizes}
            src={modifyImageUrl(src, baseMediaUrl)}
            srcSet={srcSet}
            width={width}
        />
    );
};

ResourceImage.propTypes = {
    alt: string.isRequired,
    className: string,
    handleError: func,
    handleLoad: func,
    resource: string.isRequired,
    height: oneOfType([number, string]),
    type: string,
    width: oneOfType([number, string]),
    widths: instanceOf(Map)
};

ResourceImage.defaultProps = {
    showZoom: false,
    type: 'image-product'
};

export default ResourceImage;
