import React, { useCallback, useEffect } from 'react';
import { mergeClasses } from '../../../classify';
import { useAccordionContext } from '../../Accordion/accordion';

import defaultClasses from './section.css';

const SectionTabs = props => {
    const { children, id, title, mobile } = props;

    const { handleSectionToggle, openSectionIds } = useAccordionContext();

    const handleSectionToggleWithId = useCallback(
        () => handleSectionToggle(id),
        [handleSectionToggle, id]
    );

    const isOpen = openSectionIds.has(id);

    const classes = mergeClasses(defaultClasses, props.classes);
    const contentsContainerClass = isOpen
        ? classes.contents_container
        : classes.contents_container_closed;

    return (
        <div className={`${classes.root} ${mobile ? classes.rootMobile : ''}`}>
            <button
                id={id}
                className={classes.title_container}
                onClick={handleSectionToggleWithId}
                type="button"
            >
                <span
                    className={`${classes.title_wrapper} ${
                        isOpen ? 'open' : ''
                    }`}
                >
                    <span className={classes.title}>{title}</span>
                </span>
            </button>
            <div className={contentsContainerClass}>{children}</div>
        </div>
    );
};

export default SectionTabs;
