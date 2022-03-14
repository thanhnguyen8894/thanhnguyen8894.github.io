import React from 'react';
import { func, number, shape, string } from 'prop-types';

import { mergeClasses } from '../../classify';
import Branch from './categoryBranch';
import Leaf from './categoryLeaf';
import defaultClasses from './categoryTree.css';
import _ from 'lodash';

const Tree = props => {
    const {
        onNavigate,
        updateCategories,
        categories,
        setCategoryId,
        parentUrl,
        updateParentUrl
    } = props;
    const classes = mergeClasses(defaultClasses, props.classes);

    let menuData = _.cloneDeep(categories);
    menuData = [...menuData].sort((a, b) => (a.position > b.position ? 1 : -1))

    const branches = Array.from(menuData, childCategory => {
        const {id, children} = childCategory;
        return children.length <= 0 ? (
            <Leaf
                key={id}
                parentUrl={parentUrl}
                category={childCategory}
                onNavigate={onNavigate}
            />
        ) : (
            <Branch
                key={id}
                category={childCategory}
                setCategoryId={setCategoryId}
                parentUrl={parentUrl}
                updateParentUrl={updateParentUrl}
                updateCategory={updateCategories}
            />
        );
    });

    return (
        <div className={classes.root}>
            <ul className={classes.tree}>{branches}</ul>
        </div>
    );
};

export default Tree;

Tree.propTypes = {
    categoryId: number,
    classes: shape({
        root: string,
        tree: string
    }),
    onNavigate: func.isRequired,
    updateCategories: func.isRequired
};
