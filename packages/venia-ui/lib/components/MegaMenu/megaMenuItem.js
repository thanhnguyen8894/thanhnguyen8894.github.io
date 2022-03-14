import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, resourceUrl } from '@magento/venia-ui/lib/drivers';

//Styles
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './megaMenuItem.css';

//Components
import Submenu from './submenu';
import Image from '@magento/venia-ui/lib/components/Image';
import { images } from '@magento/venia-ui/lib/constants/images';

/**
 * The MegaMenuItem component displays mega menu item
 *
 * @param {MegaMenuCategory} props.category
 * @param {int} props.activeCategoryId - id of active category
 * @param {int} props.mainNavWidth - width of the main nav. It's used for setting min-width of the submenu
 */
const MegaMenuItem = props => {
    const { activeCategoryId, category, mainNavWidth, rtl } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const categoryUrl = resourceUrl(
        `/${category.url_path}${category.url_suffix || ''}`
    );
    const [focusMenu, setFocusMenu] = useState(false);
    const heightContentState = useState(0);
    const [, setHeightContents] = heightContentState;

    const imgCategory = category?.image_app_url || images.imageMegamenuDefault;

    const children =
        category.children.length && focusMenu ? (
            <Submenu
                items={category.children}
                image={imgCategory}
                mainNavWidth={mainNavWidth}
                setFocusMenu={setFocusMenu}
                heightContentState={heightContentState}
            />
        ) : null;
    const isActive = category.id === activeCategoryId;

    const specialStyle = category.id === 33 ? classes.specialStyle : '';
    const linkClasses = isActive
        ? classes.megaMenuLinkActive
        : classes.megaMenuLink;

    const iconTag = category.id === 33 && (
        <Image
            classes={{ container: classes.tabImage }}
            alt="tag"
            width={20}
            height={20}
            src={images.tagIcon}
        />
    );

    return (
        <div
            className={`${classes.megaMenuItem} ${specialStyle}`}
            onMouseOver={$event => {
                const currentElement = $event.currentTarget;
                setFocusMenu(true);
                setTimeout(() => {
                    if (
                        currentElement &&
                        currentElement.childNodes &&
                        currentElement.childNodes[1]
                    ) {
                        const clientHeight =
                            currentElement.childNodes[1].clientHeight;
                        setHeightContents(clientHeight);
                    }
                }, 200);
            }}
            onMouseLeave={() => {
                setTimeout(() => {
                    setHeightContents(0);
                }, 0);
            }}
            onFocus={() => {}}
        >
            <Link
                onClick={() => setFocusMenu(false)}
                className={linkClasses}
                to={categoryUrl}
            >
                {iconTag}
                {category.name}
            </Link>
            {children}
        </div>
    );
};

export default MegaMenuItem;

MegaMenuItem.propTypes = {
    category: PropTypes.shape({
        children: PropTypes.array,
        id: PropTypes.number.isRequired,
        include_in_menu: PropTypes.number,
        isActive: PropTypes.bool.isRequired,
        name: PropTypes.string.isRequired,
        path: PropTypes.array.isRequired,
        position: PropTypes.number.isRequired,
        url_path: PropTypes.string.isRequired,
        url_suffix: PropTypes.string
    }).isRequired,
    activeCategoryId: PropTypes.number,
    mainNavWidth: PropTypes.number.isRequired
};
