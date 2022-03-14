import React from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { mergeClasses } from '../../classify';
import Image from '../Image';
// import logo from './logo.png';
import logo from '@magento/venia-ui/venia-static/icons/app/oudLogo.png';
import { images } from '@magento/venia-ui/lib/constants/images';

/**
 * A component that renders a logo in the header.
 *
 * @typedef Logo
 * @kind functional component
 *
 * @param {props} props React component props
 *
 * @returns {React.Element} A React component that displays a logo.
 */
const Logo = props => {
    const { height, width } = props;
    const classes = mergeClasses({}, props.classes);
    const { formatMessage } = useIntl();

    const title = formatMessage({
        id: 'logo.title',
        defaultMessage: 'Arabian Oud Online Store'
    });

    return (
        <Image
            alt={title}
            classes={{ image: classes.logo }}
            height={height}
            src={images.logoSite}
            title={title}
            width={width}
        />
    );
};

/**
 * Props for {@link Logo}
 *
 * @typedef props
 *
 * @property {Object} classes An object containing the class names for the
 * Logo component.
 * @property {string} classes.logo classes for logo
 * @property {number} height the height of the logo.
 */
Logo.propTypes = {
    classes: PropTypes.shape({
        logo: PropTypes.string
    }),
    height: PropTypes.number,
    width: PropTypes.number
};

Logo.defaultProps = {
    height: 60,
    width: 146
};

export default Logo;
