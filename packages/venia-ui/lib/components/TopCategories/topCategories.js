import React from 'react';
import { useIntl } from 'react-intl';
import defaultClasses from './topCategories.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { array, shape, string, number } from 'prop-types';
import Image from '../Image';
import { Link } from '@magento/venia-drivers';

import { useAppContext } from '@magento/peregrine/lib/context/app';

/**
 * TopCategories component.
 *
 *
 * @typedef TopCategories
 * @kind functional component
 *
 * @param {props} props React component props
 *
 * @returns {React.Element} A React component that wraps {@link Column} components.
 */
const TopCategories = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const { landingPageId, data } = props;
    const [{ mobile, tablet, baseMediaUrl }] = useAppContext();

    const heightImage = () => {
        if (mobile) {
            return 200;
        }
        if (tablet) {
            return 400;
        }
        return 450;
    };

    const renderData = data.map((item, index) => {
        const classSection = () => {
            if (index === 0) {
                return classes.sectionFirst;
            }
            if (index === 1) {
                return classes.sectionSecond;
            }
            if (index === 2) {
                return classes.sectionThree;
            }
            if (index === 3) {
                return classes.sectionFour;
            }
        };
        return (
            <div key={index} className={`${classes.section} ${classSection()}`}>
                <div
                    className={`${classes.sectionText} ${
                        classes.sectionTextFirst
                    }`}
                >
                    {/* <h4>
                        {formatMessage({
                            id: item.banner_name,
                            defaultMessage: item.banner_name
                        })}
                    </h4> */}
                    <Link
                        to={`${item.banner_url}.html`}
                        className={classes.bannerImageLink}
                    >
                        <img
                            src={
                                mobile
                                    ? `${baseMediaUrl}${
                                          item.banner_image_mobile
                                      }`
                                    : `${baseMediaUrl}${item.banner_image}`
                            }
                            alt={item.banner_name}
                        />
                    </Link>
                </div>
            </div>
        );
    });

    return (
        <div
            key={landingPageId}
            className={`${classes.root} ${tablet ? classes.rootTablet : ''} ${
                mobile ? classes.rootMobile : ''
            }`}
        >
            {renderData}
        </div>
    );
};

/**
 * Props for {@link TopCategories}
 *
 * @typedef props
 *
 * @property {Object} classes An object containing the class names for the TopCategories
 * @property {String} classes.root CSS classes for the root container element
 * @property {String} display CSS display property
 * * @property {Array} data Data input
 */
TopCategories.propTypes = {
    landingPageId: number,
    classes: shape({
        root: string
    }),
    display: string,
    data: array
};

TopCategories.defaultProps = {
    data: []
};

export default TopCategories;
