import React, {
    useState,
    Fragment,
    Suspense,
    useCallback,
    useRef
} from 'react';
import { FormattedMessage } from 'react-intl';
import { shape, string } from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';

import { useSearchPage } from '@magento/peregrine/lib/talons/SearchPage/useSearchPage';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import LoadingIndicator from '../../components/LoadingIndicator';

import { mergeClasses } from '../../classify';
import Gallery from '../Gallery';
import { fullPageLoadingIndicator } from '../LoadingIndicator';
import ProductSort from '../ProductSort';
import Button from '../Button';
import Image from '../Image';
import defaultClasses from './searchPage.css';

import { images } from '../../constants/images';
import CurrentFilters from '../FilterModal/CurrentFilters';
import { useFilterModal } from '@magento/peregrine/lib/talons/FilterModal';

const FilterModal = React.lazy(() => import('../FilterModal'));

const SearchPage = props => {
    const [loadMore, setLoadMore] = useState(false);
    const classes = mergeClasses(defaultClasses, props.classes);

    const [{ mobile, tablet }] = useAppContext();

    const talonProps = useSearchPage();

    const {
        data,
        items,
        error,
        filters,
        loading,
        sortProps,
        wishLists,
        totalCount,
        openDrawer,
        searchTerm,
        pageControl,
        searchCategory,
        availableSortMethods,
        outOfStockForSaleableQtyZero: productOutStock
    } = talonProps;

    const { currentPage, setPage: setCurrentPage, totalPages } = pageControl;

    const { setSort, currentSort } = sortProps;
    const filterProps = useFilterModal({ filters: filters || [] });
    const { filterApi, filterNames, filterState, handleApply } = filterProps;

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

    if (!data) {
        if (loading && !loadMore) return fullPageLoadingIndicator;
        else if (error) {
            return (
                <div className={classes.noResult}>
                    <FormattedMessage
                        id={'searchPage.noResult'}
                        defaultMessage={
                            'No results found. The search term may be missing or invalid.'
                        }
                    />
                </div>
            );
        }
    }

    const fetchMoreData = () => {
        if (currentPage < totalPages) {
            setLoadMore(true);
            setCurrentPage(currentPage + 1);
        }
    };

    let content;
    if (items.length === 0) {
        content = (
            <div className={classes.noResult}>
                <FormattedMessage
                    id={'searchPage.noResultImportant'}
                    defaultMessage={'No results found!'}
                />
            </div>
        );
    } else {
        content = (
            <Fragment>
                <InfiniteScroll
                    dataLength={items.length}
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
                        <Gallery
                            items={items}
                            productOutStock={productOutStock}
                            wishLists={wishLists}
                        />
                    </section>
                </InfiniteScroll>
            </Fragment>
        );
    }

    const maybeFilterButtons = filters ? (
        <Button
            priority={'low'}
            classes={{
                root_lowPriority: classes.filterButton,
                content: classes.contentFilterButton
            }}
            onClick={openDrawer}
            type="button"
        >
            <Image
                alt="filter icon"
                classes={{
                    image: classes.filterIcon
                }}
                src={images.filterIcon}
                height={20}
                width={20}
            />
            <FormattedMessage
                id={'categoryContent.filter'}
                defaultMessage={'Filter'}
            />
        </Button>
    ) : null;

    const maybeFilterModal =
        filters && filters.length ? <FilterModal filters={filters} /> : null;

    const maybeSortButton =
        totalCount && filters ? (
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

    const searchResultsHeading = searchTerm ? (
        <FormattedMessage
            id={'searchPage.searchTerm'}
            values={{
                highlight: chunks => (
                    <span className={classes.headingHighlight}>{chunks}</span>
                ),
                category: searchCategory,
                term: searchTerm
            }}
            defaultMessage={'Showing results:'}
        />
    ) : (
        <FormattedMessage
            id={'searchPage.searchTermEmpty'}
            defaultMessage={'Showing all results:'}
        />
    );

    const headerCategory = (
        <div className={classes.headerCategory}>
            {mobile && (
                <h1 className={classes.heading}>{searchResultsHeading}</h1>
            )}
            <div className={classes.mainHeader}>
                {!mobile && (
                    <h1 className={classes.heading}>{searchResultsHeading}</h1>
                )}
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
                {totalCount > 0 && (
                    <span className={classes.countText}>
                        <FormattedMessage
                            id={'categoryContent.showingResult'}
                            defaultMessage={`Showing 1- ${
                                items.length
                            } of ${totalCount} results`}
                            values={{
                                count: items.length,
                                total: totalCount
                            }}
                        />
                    </span>
                )}
            </div>
        </div>
    );

    const headerCategoryMobile = (
        <div className={classes.headerCategory}>
            <div className={classes.headerName}>
                <h1 className={classes.heading}>{searchResultsHeading}</h1>
                <span className={classes.countText}>
                    <FormattedMessage
                        id={'product.products'}
                        defaultMessage={'Products'}
                    />
                    : {totalCount}
                </span>
            </div>
            {totalCount ? (
                <div className={classes.headerButtons}>
                    {maybeSortButton}
                    <hr className={classes.line} />
                    <div className={classes.filterContainer}>
                        {maybeFilterButtons}
                    </div>
                </div>
            ) : null}
        </div>
    );

    return (
        <article
            className={mobile || tablet ? classes.rootMobile : classes.root}
        >
            {headerCategory}
            {content}
            <Suspense fallback={null}>{maybeFilterModal}</Suspense>
        </article>
    );
};

export default SearchPage;

SearchPage.propTypes = {
    classes: shape({
        noResult: string,
        root: string,
        rootMobile: string
    })
};
