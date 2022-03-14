import React, { useCallback } from 'react';
import { ChevronDown as ArrowDown, ChevronUp as ArrowUp } from 'react-feather';
import { shape, string } from 'prop-types';
import { useAccordionContext } from './accordion';
import Icon from '../Icon';

import ArrowDropDown from '@magento/venia-ui/venia-static/icons/arrow_drop_down.png';

import { mergeClasses } from '../../classify';
import defaultClasses from './section.css';

const Section = props => {
    const { children, id, title, mobile } = props;

    const { handleSectionToggle, openSectionIds } = useAccordionContext();

    const handleSectionToggleWithId = useCallback(
        () => handleSectionToggle(id),
        [handleSectionToggle, id]
    );

    const isOpen = openSectionIds.has(id);
    const titleIconSrc = isOpen ? ArrowUp : ArrowDown;
    const titleIcon = <Icon src={titleIconSrc} size={24} />;
    const titleIconMobile = () => {
        return <img src={ArrowDropDown} alt="" />;
    };

    const classes = mergeClasses(defaultClasses, props.classes);
    const contentsContainerClass = isOpen
        ? classes.contents_container
        : classes.contents_container_closed;

    const { otherAddress } = classes || {};

    return (
        <div className={`${classes.root} ${mobile ? classes.rootMobile : ''}`}>
            <button
                className={classes.title_container}
                onClick={handleSectionToggleWithId}
                type="button"
            >
                <span
                    className={`${classes.title_wrapper} ${
                        otherAddress ? classes.sectionOtherAddress : ''
                    } ${isOpen ? classes.open : ''}`}
                >
                    <span className={classes.title}>{title}</span>
                    {mobile ? titleIconMobile() : titleIcon}
                </span>
            </button>
            <div
                className={`${contentsContainerClass} ${
                    otherAddress ? classes.sectionOtherAddressContent : ''
                }`}
            >
                {children}
            </div>
        </div>
    );
};

export default Section;

Section.propTypes = {
    classes: shape({
        root: string,
        rootMobile: string,
        otherAddress: string,
        contents_container: string,
        contents_container_closed: string,
        title_container: string,
        title_wrapper: string,
        title: string,
        sectionOtherAddress: string,
        sectionOtherAddressContent: string
    })
};
