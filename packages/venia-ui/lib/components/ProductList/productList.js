import React, { useState, Fragment, useEffect } from 'react';
import { number, shape, string } from 'prop-types';
import { mergeClasses } from '../../classify';

import { useLocation } from 'react-router-dom';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import ProductListContent from './productListContent';
import defaultClasses from './productList.css';
import { Meta } from '../../components/Head';
import ErrorView from '@magento/venia-ui/lib/components/ErrorView';


const ProductList = props => {
    const [{ mobile, tablet }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasLoadMore, setHasLoadMore] = useState(false);
    const [productListId, setProductListId] = useState();
    const [title, setTitle] = useState();

    // TODO
    const pageSize = mobile ? 10 : tablet ? 12 : 15;

    const location = useLocation();

    useEffect(() => {
        if (location) {
            const isNumeric = (value) => {
                return ((typeof value === 'number' || typeof value === 'string') && !isNaN(Number(value)));
            }
            const pathName = location.pathname;
            if (pathName) {
                const param = pathName.substr(pathName.lastIndexOf('/') + 1, pathName.length);
                if (isNumeric(param)) {
                    setProductListId(Number(param));
                }
            }
            const searchParams = location.search;
            const getParameterByName = (name, url = window.location.href ) => {
                name = name.replace(/[\[\]]/g, '\\$&');
                const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
                const results = regex.exec(url);
                if (!results) return null;
                if (!results[2]) return '';
                return decodeURIComponent(results[2].replace(/\+/g, ' '));
            }
            if (searchParams) {
                const header = getParameterByName('name');
                if(header) {
                    setTitle(header);
                }
            }
    
        }
    }, [location]);

    const callbackFunction = (hasLoadMore) => {
        setHasLoadMore(hasLoadMore);
        if(hasLoadMore) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <Fragment>
            {title && <Meta name="description" content={title} />}
            {productListId && <ProductListContent
                classes={classes}
                productListId={productListId}
                productTitle={title}
                currentPage={currentPage}
                pageSize={pageSize}
                hasLoadMore={hasLoadMore}
                parentCallback={callbackFunction}
            />}
            {!productListId && <ErrorView />}
        </Fragment>
    );
};

ProductList.propTypes = {
    classes: shape({
        gallery: string,
        root: string,
        title: string
    }),
    id: number
};

export default ProductList;
