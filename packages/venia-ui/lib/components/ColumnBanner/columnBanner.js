import React from 'react';
// import { useIntl } from 'react-intl';
import defaultClasses from './columnBanner.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { shape, string, array, bool, number } from 'prop-types';
import Image from '../Image';
import { Link } from '@magento/venia-drivers';
import { useAppContext } from '@magento/peregrine/lib/context/app';

/**
 * ColumnBanner component.
 *
 *
 * @typedef ColumnBanner
 * @kind functional component
 *
 * @param {props} props React component props
 *
 * @returns {React.Element} A React component that wraps {@link Column} components.
 */
const ColumnBanner = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    // const { formatMessage } = useIntl();
    const { landingPageId, hasThreeColumns, items } = props;

    const [{ mobile, tablet, baseMediaUrl }] = useAppContext();

    let classRootTwoColumns = `${items.length == 2 ? classes.rootTwo : ''}`;

    let classRootOneColumns = items.length == 1 ? `${classes.rootOne}` : '';

    const children = items.map((item, index) => {
        if (
            !item.banner_image ||
            ((mobile || tablet) && !item.banner_image_mobile)
        )
            return;

        if (
            items.length == 2 &&
            item &&
            item.banner_image_mobile &&
            index == 1
        ) {
            classRootTwoColumns += ` ${classes.rootTwoReverse}`;
        }

        return (
            <div key={item.banner_id} className={`${classes.section}`}>
                <Link
                    to={`${item.banner_url}.html`}
                    className={classes.bannerImageLink}
                >
                    <img
                        src={
                            mobile || tablet
                                ? `${baseMediaUrl}${item.banner_image_mobile}`
                                : `${baseMediaUrl}${item.banner_image}`
                        }
                        alt={item.banner_name}
                        classes={{ image: `${classes.sectionImage}` }}
                    />
                </Link>
            </div>
        );
    });

    return (
        <div
            key={landingPageId}
            className={`${hasThreeColumns ? classes.rootThree : classes.root} ${
                mobile ? classes.rootMobile : ''
            } ${
                tablet ? classes.rootTablet : ''
            } ${classRootTwoColumns} ${classRootOneColumns}`}
        >
            {children}
        </div>
    );
};

/**
 * Props for {@link ColumnBanner}
 *
 * @typedef props
 *
 * @property {Object} classes An object containing the class names for the ColumnBanner
 * @property {String} classes.root CSS classes for the root container element
 * @property {Array} display CSS display property
 */
ColumnBanner.propTypes = {
    landingPageId: number,
    classes: shape({
        root: string
    }),
    hasThreeColumns: bool,
    items: array
};

ColumnBanner.defaultProps = {
    classes: {},
    items: []
};

export default ColumnBanner;
