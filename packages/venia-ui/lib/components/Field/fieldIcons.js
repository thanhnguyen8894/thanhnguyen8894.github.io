import React, { useCallback, useEffect, useRef } from 'react';
import { shape, string } from 'prop-types';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './fieldIcons.css';

//Redux
import { useAppContext } from '@magento/peregrine/lib/context/app';

const FieldIcons = props => {
    const { title, after, before, children } = props;
    const [{ rtl }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);

    const titleClasss = rtl ? classes.titleInputRtl : classes.titleInput;
    const style = {
        '--iconsBefore': before ? 1 : 0,
        '--iconsAfter': after ? 1 : 0
    };

    const refTitle = useRef();
    const refInput = useRef();

    const onClickInput = useCallback(() => {
        if (refTitle && refTitle.current) {
            refTitle.current.className = `${refTitle?.current?.classList[0]} ${
                classes.animTitle
            }`;
        }
    }, []);

    const onBlurInput = event => {
        if (event?.target?.value == (undefined || '') && refTitle.current) {
            refTitle.current.className = `${refTitle?.current?.classList[0]} ${
                classes.animTitleBack
            }`;
        }
    };

    useEffect(() => {
        if (Array.isArray(children)) {
            for (let i = 0; i < children.length; i++) {
                if (!children[i]) return;
                if (children[i].props?.fieldState?.value) onClickInput();
            }
        } else {
            if (
                children?.props?.fieldState?.value ||
                refTitle?.current?.className
            ) {
                onClickInput();
            }
        }
    }, [children, onClickInput]);
    return (
        <span className={classes.root} style={style}>
            {title && (
                <p className={titleClasss} ref={refTitle}>
                    {title}
                </p>
            )}
            <span
                className={classes.input}
                ref={refInput}
                onClick={() => {
                    if (title) {
                        onClickInput();
                    }
                }}
                onBlur={event => {
                    if (title) {
                        onBlurInput(event);
                    }
                }}
            >
                {children}
            </span>
            <span className={classes.before}>{before}</span>
            <span className={`${classes.after} ${classes.afterCutom}`}>
                {after}
            </span>
        </span>
    );
};

FieldIcons.propTypes = {
    classes: shape({
        after: string,
        before: string,
        root: string,
        afterCutom: string
    })
};

export default FieldIcons;
