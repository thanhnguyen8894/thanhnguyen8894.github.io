import React from 'react';
import PropTypes from 'prop-types';

//Styles
import defaultClasses from './submenu.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

//Components
import SubmenuColumn from './submenuColumn';
import Image from '../Image';
import { images } from '../../constants/images';

/**
 * The Submenu component displays submenu in mega menu
 *
 * @param {array} props.items - categories to display
 * @param {int} props.mainNavWidth - width of the main nav. It's used for setting min-width of the submenu
 */
const Submenu = props => {
    const {
        items,
        image,
        mainNavWidth,
        rtl,
        setFocusMenu,
        heightContentState
    } = props;
    const PADDING_OFFSET = 20;
    const classes = mergeClasses(defaultClasses, props.classes);
    const [heightContents] = heightContentState;
    const hasMoreItem = window.innerHeight - 300 <= heightContents;

    const lessThanThreeItems = items && items.length < 3;
    let submenuItemsWrapperClass = classes.submenuItemsWrapper;
    if (hasMoreItem) {
        submenuItemsWrapperClass += ` ${classes.hasMoreItem}`;
    }
    if (lessThanThreeItems) {
        submenuItemsWrapperClass += ` ${
            classes.submenuItemsWrapperLessThanThree
        }`;
    }
    const subMenuItemsClass = lessThanThreeItems
        ? classes.subMenuItemsLess
        : classes.submenuItems;

    const subMenus = items.map(category => {
        return (
            <SubmenuColumn
                category={category}
                key={category.id}
                setFocusMenu={setFocusMenu}
            />
        );
    });

    return (
        <div className={`${classes.submenu} ${rtl ? classes.rtl : ''}`}>
            <div
                className={classes.submenuItemsWrapper}
                style={{
                    minWidth: mainNavWidth - PADDING_OFFSET,
                    maxWidth: mainNavWidth - PADDING_OFFSET
                }}
            >
                <div className={classes.submenuItems}>{subMenus}</div>
                <div className={classes.recommendations}>
                    <img
                        src={image}
                        alt="image megamenu"
                    />
                </div>
                {/* {lessThanThreeItems && (
                    <div className={classes.recommendations}>
                        <img
                            src={images.imageMegamenuDefault}
                            alt="image megamenu"
                        />
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default Submenu;

Submenu.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            children: PropTypes.array.isRequired,
            id: PropTypes.number.isRequired,
            include_in_menu: PropTypes.number.isRequired,
            isActive: PropTypes.bool.isRequired,
            name: PropTypes.string.isRequired,
            path: PropTypes.array.isRequired,
            position: PropTypes.number.isRequired,
            url_path: PropTypes.string.isRequired,
            url_suffix: PropTypes.string
        })
    ).isRequired,
    mainNavWidth: PropTypes.number.isRequired
};
