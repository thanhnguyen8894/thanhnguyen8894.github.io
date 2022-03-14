import { useCallback } from 'react';

/**
 * Returns props necessary to render a CategoryBranch component.
 *
 * @param {object} props
 * @param {object} props.category - category data
 * @param {string} props.category.id - category id
 * @param {boolean} props.category.include_in_menu - whether to show category
 * @param {function} props.setCategoryId - callback that updates categoryId
 * @return {{ exclude: boolean, handleClick: function }}
 */
export const useCategoryBranch = props => {
    const {
        category,
        updateCategory,
        setCategoryId,
        updateParentUrl,
        parentUrl
    } = props;
    const { id, include_in_menu, children, url_key } = category;

    const parentCategory = {
        ...category,
        children: [],
        viewAll: true,
        position: -1
    };
    const newCategory = children.concat(parentCategory);

    // `include_in_menu` is undefined when Magento <= 2.3.1
    const exclude = include_in_menu === 0;
    const url = `${parentUrl}/${url_key}`;

    const handleClick = useCallback(() => {
        updateParentUrl(url);
        updateCategory(newCategory);
        setCategoryId(id);
    }, [id, updateCategory, setCategoryId, updateParentUrl]);

    return { exclude, handleClick };
};
