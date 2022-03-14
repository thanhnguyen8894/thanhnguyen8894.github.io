import React, { Fragment, Suspense, useRef, useCallback } from 'react';
import { array, number, object, shape, string } from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FormattedMessage } from 'react-intl';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useFilterModal } from '@magento/peregrine/lib/talons/FilterModal';
import { useCategoryContent } from '@magento/peregrine/lib/talons/RootComponents/Category';

//Constant & Style
import { images } from '@magento/venia-ui/lib/constants/images';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './category.css';

//Components
import NoProductsFound from './NoProductsFound';
import Image from '@magento/venia-ui/lib/components/Image';
import Button from '@magento/venia-ui/lib/components/Button';
import Gallery from '@magento/venia-ui/lib/components/Gallery';
import { StoreTitle } from '@magento/venia-ui/lib/components/Head';
import ProductSort from '@magento/venia-ui/lib/components/ProductSort';
import RichContent from '@magento/venia-ui/lib/components/RichContent';
import Breadcrumbs from '@magento/venia-ui/lib/components/Breadcrumbs';
import FilterModal from '@magento/venia-ui/lib/components/FilterModal';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import RecommendedProducts from '@magento/venia-ui/lib/components/RecommendedProducts';
import CurrentFilters from '@magento/venia-ui/lib/components/FilterModal/CurrentFilters';

const CategoryContent = props => {
    const {
        image,
        data,
        products,
        productSearchCalled,
        loading,
        loadMore,
        pageSize,
        sortProps,
        categoryId,
        categoryIdInFilter,
        pageControl,
        setCurrentPage,
        parentCallback,
        subCategories,
        productOutStock
    } = props;

    const { currentPage, totalPages } = pageControl;
    const { setSort, currentSort } = sortProps;

    const talonProps = useCategoryContent({
        data,
        products,
        pageSize,
        categoryId,
        currentPage,
        setCurrentPage,
        subCategories
    });

    const {
        items,
        filters,
        wishLists,
        totalItems,
        titleBlock,
        categoryName,
        relatedProducts,
        handleLoadFilters,
        handleOpenFilters,
        totalPagesFromData,
        categoryDescription,
        availableSortMethods
    } = talonProps;

    const filterProps = useFilterModal({ filters: filters || [] });
    const { filterApi, filterNames, filterState, handleApply } = filterProps;

    const classes = mergeClasses(defaultClasses, props.classes);

    const [{ rtl, mobile, tablet }] = useAppContext();
    let rootClass = mobile ? classes.rootMobile : classes.root;
    if (rtl) {
        rootClass += ` ${classes.rtl}`;
    }
    const BannerDefault = mobile ? images.bannerMobile : images.bannerDesktop;

    const maybeFilterButtons = filters ? (
        <Button
            priority={'low'}
            classes={{
                root_lowPriority: classes.filterButton,
                content: classes.contentFilterButton
            }}
            onClick={handleOpenFilters}
            onFocus={handleLoadFilters}
            onMouseOver={handleLoadFilters}
            type="button"
        >
            <FormattedMessage
                id={'categoryContent.filter'}
                defaultMessage={'Filter'}
            />
            <Image
                alt="filter icon"
                classes={{
                    image: classes.filterIcon
                }}
                src={images.filterIcon}
                height={20}
                width={20}
            />
        </Button>
    ) : null;

    const maybeSortButton =
        totalPagesFromData && filters ? (
            <div className={classes.sortContainer}>
                <ProductSort
                    sortProps={sortProps}
                    availableSortMethods={availableSortMethods}
                />
                <img
                    alt="sort icon"
                    src={currentSort.isDESC ? images.sortDESC : images.sortASC}
                    onClick={() =>
                        setSort({ ...currentSort, isDESC: !currentSort.isDESC })
                    }
                    width={24}
                    height={24}
                />
            </div>
        ) : null;

    // If you want to defer the loading of the FilterModal until user interaction
    // (hover, focus, click), simply add the talon's `loadFilters` prop as
    // part of the conditional here.
    const modal = filters ? <FilterModal filters={filters} /> : null;

    const categoryDescriptionElement = categoryDescription ? (
        <RichContent html={categoryDescription} />
    ) : null;

    const filterRef = useRef();
    const handleApplyFilter = useCallback(
        (...args) => {
            const filterElement = filterRef.current;
            if (
                filterElement &&
                typeof filterElement.getBoundingClientRect === 'function'
            ) {
                //TODO: Handle scroll after add or remove filter here
                // const filterTop = filterElement.getBoundingClientRect().top;
                // const windowScrollY =
                //     window.scrollY + filterTop - SCROLL_OFFSET;
                // window.scrollTo({
                //     left: 0,
                //     top: windowScrollY,
                //     behavior: 'smooth'
                // });
            }

            handleApply(...args);
        },
        [handleApply, filterRef]
    );

    const headerCategory = (
        <div className={classes.headerCategory}>
            <div className={classes.mainHeader}>
                {!mobile && <h1 className={classes.title}>{categoryName}</h1>}
                <div className={classes.headerButtons}>
                    {maybeFilterButtons}
                    {maybeSortButton}
                </div>
            </div>
            <div className={classes.subHeader}>
                <div ref={filterRef} aria-live="polite" aria-busy="false">
                    <CurrentFilters
                        filterApi={filterApi}
                        filterNames={filterNames}
                        filterState={filterState}
                        onRemove={handleApplyFilter}
                        classes={{ root: classes.filterSelected }}
                    />
                </div>
                {/* {totalItems > 0 && (
                    <span className={classes.countText}>
                        <FormattedMessage
                            id={'categoryContent.showingResult'}
                            defaultMessage={`Showing 1- ${
                                items.length
                            } of ${totalItems} results`}
                            values={{
                                count: items.length,
                                total: totalItems
                            }}
                        />
                    </span>
                )} */}
            </div>
        </div>
    );

    const fetchMoreData = () => {
        if (currentPage < totalPages) {
            parentCallback(true);
        } else parentCallback(false);
    };

    const content =
        totalPagesFromData || loadMore ? (
            <Fragment>
                <InfiniteScroll
                    dataLength={items && items.length}
                    next={fetchMoreData}
                    hasMore={true}
                    style={{ height: 'auto', overflow: 'hidden' }}
                    scrollThreshold={
                        mobile ? '1180px' : tablet ? '1650px' : '1420px'
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
                        {items && (
                            <Gallery
                                items={items}
                                wishLists={wishLists}
                                productOutStock={productOutStock}
                            />
                        )}
                    </section>
                </InfiniteScroll>
                {relatedProducts && (
                    <RecommendedProducts
                        items={relatedProducts}
                        classes={{
                            root: mobile
                                ? classes.recommendedProductsMobile
                                : classes.recommendedProducts
                        }}
                        header={titleBlock}
                    />
                )}
            </Fragment>
        ) : (
            <Fragment>
                {productSearchCalled && (
                    <NoProductsFound categoryId={categoryId} />
                )}
            </Fragment>
        );

    return (
        <Fragment>
            <article className={rootClass}>
                <div className={classes.bannerContainer}>
                    <img
                        alt="Banner"
                        src={image && image.length > 0 ? image : BannerDefault}
                    />
                    <p className={classes.bannerText}>{categoryName}</p>
                </div>
                <div className={classes.bodyContainer}>
                    <Breadcrumbs categoryId={categoryIdInFilter} />
                    <StoreTitle>{categoryName}</StoreTitle>
                    {headerCategory}
                    {/* {categoryDescriptionElement} */}
                    {content}
                    <Suspense fallback={null}>{modal}</Suspense>
                </div>
            </article>
        </Fragment>
    );
};

export default CategoryContent;

CategoryContent.propTypes = {
    classes: shape({
        countText: string,
        sortText: string,
        sortContainer: string,
        gallery: string,
        headerCategory: string,
        headerName: string,
        headerButtons: string,
        bannerContainer: string,
        bannerText: string,
        filterContainer: string,
        filterButton: string,
        filterIcon: string,
        pagination: string,
        root: string,
        rootMobile: string,
        title: string,
        line: string
    }),
    sortProps: object,
    pageSize: number,
    subCategories: array
};
