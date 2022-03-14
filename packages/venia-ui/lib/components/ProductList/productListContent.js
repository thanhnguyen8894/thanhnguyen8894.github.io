import React, { Fragment, useState, useEffect } from 'react';
import { number, shape, string, func, bool } from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FormattedMessage } from 'react-intl';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useProductList } from '@magento/peregrine/lib/talons/ProductList';
import { Link } from '@magento/venia-drivers';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

// Image
import Banner from '@magento/venia-ui/venia-static/icons/category/bannerCateDesktop.png';

// style
import defaultClasses from './productList.css';

// components
import Image from '@magento/venia-ui/lib/components/Image';
import Gallery from '@magento/venia-ui/lib/components/Gallery';
import { StoreTitle } from '@magento/venia-ui/lib/components/Head';
import ErrorView from '@magento/venia-ui/lib/components/ErrorView';
import LoadingIndicator, { fullPageLoadingIndicator } from '@magento/venia-ui/lib/components/LoadingIndicator';
import NoProductsFound from '@magento/venia-ui/lib/RootComponents/Category/NoProductsFound';

const DELIMITER = '>';
const ProductListContent = props => {
    const {
        productTitle,
        productListId,
        currentPage,
        pageSize,
        hasLoadMore,
        parentCallback
    } = props;

    const classes = mergeClasses(defaultClasses, props.classes);
    const [{ mobile, tablet }] = useAppContext();
    const [products, setProducts] = useState([]);

    const talonProps = useProductList({
        pageSize,
        productListId,
        currentPage
    });

    const {
        items,
        error,
        loading,
        totalPages,
        loadProductListCalled,
        outOfStockForSaleableQtyZero: productOutStock,
    } = talonProps;

    const loadMore = () => {
        if (currentPage < totalPages) {
            parentCallback(true);
        }
    };

    // set product data
    useEffect(() => {
        if (!items) {
            return;
        }
        if (hasLoadMore) {
            const found = products.some(r => items.includes(r));
            if (!found && items.length > 0) {
                const newProducts = products.concat(items);
                setProducts(newProducts);
            }

            return;
        }
        if (!hasLoadMore) {
            setProducts(items);
        }
    }, [items, hasLoadMore, products]);

    if (!products || loadProductListCalled) {
        if (!hasLoadMore && loading) {
            return fullPageLoadingIndicator;
        }
        if (error && currentPage === 1) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(error);
            }

            return <ErrorView />;
        }
    }

    return (
        <Fragment>
            <article
                className={
                    mobile
                        ? classes.rootMobile
                        : tablet
                        ? classes.rootTablet
                        : classes.root
                }
            >
                <div className={classes.bannerContainer}>
                    <Image
                        alt="Banner"
                        src={Banner}
                        height={mobile ? 150 : tablet ? 280 : 320}
                        width={'100%'}
                    />
                    <p className={classes.bannerText}>{productTitle}</p>
                </div>
                <div className={classes.breadcrumbs}>
                    <Link className={classes.link} to="/">
                        <FormattedMessage id={'global.home'} defaultMessage={'Home'} />
                    </Link>
                    <span className={classes.divider}>{DELIMITER}</span>
                    <span className={classes.text}>{productTitle}</span>
                </div>
                <StoreTitle>{productTitle}</StoreTitle>
                <h1 className={classes.title}>{productTitle}</h1>

                <Fragment>
                    {products.length > 0 ? (
                        <InfiniteScroll
                            dataLength={products.length}
                            next={loadMore}
                            hasMore={true}
                            style={{ height: 'auto', overflow: 'hidden' }}
                            scrollThreshold={
                                mobile ? '700px' : tablet ? '1050px' : '820px'
                            }
                            loader={
                                loading && (
                                    <LoadingIndicator>
                                        <FormattedMessage
                                            id={'product.loading'}
                                            defaultMessage={'Loading'}
                                        />
                                    </LoadingIndicator>
                                )
                            }
                        >
                            <section className={classes.gallery}>
                                <Gallery
                                    items={products}
                                    productOutStock={productOutStock}
                                />
                            </section>
                        </InfiniteScroll>
                    ) : (
                        <NoProductsFound categoryId={2} />
                    )}
                </Fragment>
            </article>
        </Fragment>
    );
};

export default ProductListContent;

ProductListContent.propTypes = {
    classes: shape({
        gallery: string,
        bannerContainer: string,
        bannerText: string,
        root: string,
        rootMobile: string,
        rootTablet: string,
        title: string
    }),
    pageSize: number,
    productListId: number,
    currentPage: number,
    productTitle: string,
    hasLoadMore: bool,
    parentCallback: func
};
