import React, {
    Fragment,
    useCallback,
    useState,
    useRef,
    useMemo,
    useEffect
} from 'react';
import { useIntl } from 'react-intl';
import { ChevronRight, Menu as MenuIcon } from 'react-feather';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { Link, resourceUrl } from '@magento/venia-drivers';

import styled from 'styled-components';
import _ from 'lodash';

import { useMegaMenu } from '@magento/peregrine/lib/talons/MegaMenu/useMegaMenu';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Icon from '@magento/venia-ui/lib/components/Icon';
import defaultClasses from './categoryMenu.css';

const WrapperMenu = styled.ul`
    min-height: ${props => `${props.minHeight || 360}px`};
    ul {
        min-height: ${props => `${props.minHeight || 360}px`};
    }
`;

const WrapperSubMenu = styled.ul`
    min-height: ${props => `${props.minHeight || 360}px`};
`;

/**
 * The CategoryMenu component displays menu with categories on desktop devices
 */
const CategoryMenu = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const { setActiveCategories } = props;

    const { megaMenuData } = useMegaMenu();
    const { formatMessage } = useIntl();
    const [{ rtl }] = useAppContext();
    const mainNavRef = useRef(null);

    const [dynamicStyles] = useState({
        maxHeight: window.innerHeight / 1.5
    });

    const [heightContents, setHeightContents] = useState([]);
    const [minHeight, setMinHeight] = useState(360);

    const buildMenu = (menuData, parent) => {
        return menuData.map((child, index) => {
            if (parent) {
                child.url = parent.url + '/' + child.url_key;
            } else {
                child.url = child.url_key;
            }

            const categoryUrl = resourceUrl(`/${child.url}${child.url_suffix}`);
            const hasChild = child.children && child.children.length > 0;
            const hasMoreItems = child.children && child.children.length > 14;

            return (
                <li
                    key={child.id}
                    className={`${hasChild ? classes.hasChild : classes.noChild}`}
                    onMouseOver={$event => {
                        const currentElement = $event.currentTarget;
                        setTimeout(() => {
                            if (
                                currentElement &&
                                currentElement.childNodes &&
                                currentElement.childNodes[1]
                            ) {
                                const clientHeight =
                                    currentElement.childNodes[1].clientHeight;
                                setHeightContents(old => [
                                    ...old,
                                    clientHeight
                                ]);
                            }
                        }, 200);
                    }}
                    onFocus={() => {}}
                    onMouseLeave={() => {
                        setTimeout(() => {
                            setHeightContents([]);
                        }, 0);
                    }}
                >
                    <Link to={categoryUrl}>
                        {child.name}
                        {hasChild && (
                            <Icon
                                classes={{
                                    icon: classes.leftArrow
                                }}
                                size={24}
                                src={ChevronRight}
                            />
                        )}
                    </Link>
                    {hasChild && (
                        <WrapperSubMenu
                            key={child.id + index}
                            minHeight={minHeight}
                            maxHeight={dynamicStyles.maxHeight}
                            className={`${classes.levelTwo} ${
                                hasMoreItems ? classes.hasMoreItems : ''
                            }`}
                        >
                            {buildMenu(child.children, child)}
                        </WrapperSubMenu>
                    )}
                </li>
            );
        });
    };

    const renderMenu = useMemo(() => {
        if (megaMenuData && megaMenuData.children) {
            return buildMenu(megaMenuData.children, null);
        }
        return <Fragment />;
    }, [megaMenuData]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleHoverState = useCallback(() => {
        setActiveCategories(true);
    }, [setActiveCategories]);

    const handleLeaveState = useCallback(() => {
        setActiveCategories(false);
    }, [setActiveCategories]);

    useEffect(() => {
        const maxHeights = _.max(heightContents) || 360;
        setMinHeight(maxHeights);
    }, [heightContents, minHeight]);

    return (
        <div className={`${classes.menuWrap} ${rtl ? classes.rtl : ''}`}>
            <nav ref={mainNavRef} role="navigation">
                <ul className={classes.root}>
                    <li
                        className={`${classes.hasChild} ${classes.rootTitle}`}
                        onMouseLeave={handleLeaveState}
                        onFocus={handleHoverState}
                        onMouseOver={handleHoverState}
                    >
                        <Icon src={MenuIcon} />
                        <Link to={resourceUrl('/')} className={classes.title}>
                            {formatMessage({
                                id: 'navHeader.categories',
                                defaultMessage: 'CATEGORIES'
                            })}
                        </Link>
                        <WrapperMenu
                            key={megaMenuData.id}
                            minHeight={minHeight}
                            maxHeight={dynamicStyles.maxHeight}
                            className={`${classes.body} ${classes.levelOne}`}
                        >
                            {renderMenu}
                        </WrapperMenu>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default CategoryMenu;
