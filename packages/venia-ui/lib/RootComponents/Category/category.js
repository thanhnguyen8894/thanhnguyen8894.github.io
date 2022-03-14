import React, { useState, Fragment } from 'react';
import { number, shape, string } from 'prop-types';
import { useCategory } from '@magento/peregrine/lib/talons/RootComponents/Category';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { fullPageLoadingIndicator } from '../../components/LoadingIndicator';
import _ from 'lodash';

import CategoryContent from './categoryContent';
import defaultClasses from './category.css';
import { Meta } from '../../components/Head';
import ErrorView from '@magento/venia-ui/lib/components/ErrorView';
import MetaTag from '@magento/venia-ui/lib/components/MetaTag';

const Category = props => {
    const { id } = props;

    const [categoryId, setCategoryId] = useState(id);

    const talonProps = useCategory({ id, setCategoryId });

    const {
        error,
        loading,
        metaTitle,
        metaDescription,
        categoryData,
        categoryImage,
        pageControl,
        sortProps,
        pageSize,
        products,
        productSearchCalled,
        productSearchLoading,
        subCategories,
        isDESC,
        outOfStockForSaleableQtyZero
    } = talonProps;

    const { currentPage, setPage: setCurrentPage, totalPages } = pageControl;

    const [loadMore, setLoadMore] = useState(false);

    const classes = mergeClasses(defaultClasses, props.classes);

    if (!categoryData || productSearchCalled) {
        // Show the loading indicator until data has been fetched.
        if (!loadMore && (loading || productSearchLoading)) {
            return fullPageLoadingIndicator;
        }

        if (error && currentPage === 1) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(error);
            }

            return <ErrorView />;
        }
    }

    if (_.isNil(categoryData?.category)) {
        return <ErrorView />;
    }

    const callbackFunction = childData => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
        setLoadMore(childData);
    };

    return (
        <Fragment>
            {/* <MetaTag
                title={metaTitle}
                desc={metaDescription}
                image={categoryImage}
            /> */}
            {/* <Meta name="description" content={metaDescription} /> */}
            <CategoryContent
                categoryId={id}
                isDESC={isDESC}
                categoryIdInFilter={categoryId}
                classes={classes}
                data={categoryData}
                image={categoryImage}
                pageControl={pageControl}
                sortProps={sortProps}
                pageSize={pageSize}
                loadMore={loadMore}
                products={products}
                subCategories={subCategories}
                productSearchCalled={productSearchCalled}
                loading={productSearchLoading}
                setCurrentPage={setCurrentPage}
                parentCallback={callbackFunction}
                productOutStock={outOfStockForSaleableQtyZero}
            />
        </Fragment>
    );
};

Category.propTypes = {
    classes: shape({
        gallery: string,
        root: string,
        title: string
    }),
    id: number
};

Category.defaultProps = {
    id: 3
};

export default Category;
