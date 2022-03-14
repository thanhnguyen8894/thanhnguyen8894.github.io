import React, { Fragment, useCallback, useMemo, useRef } from 'react';
import { arrayOf, number, shape, string, bool } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import SlickSlider from 'react-slick';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import Price from '@magento/venia-ui/lib/components/Price';

import { mergeClasses } from '../../classify';
import { useOrderRow } from '@magento/peregrine/lib/talons/OrderHistoryPage/useOrderRow';
import OrderDetails from './OrderDetails';
import defaultClasses from './orderRow.css';
import OrdersItem from './orderItem';

import arrowIcon from '@magento/venia-ui/venia-static/icons/arrow.png';
import { images } from '../../constants/images';

const OrderRow = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const sliderRef = useRef();
    const [{ mobile, tablet, rtl }] = useAppContext();

    const {
        slidesToShow,
        slidesToScroll,
        draggable,
        autoplay,
        autoplaySpeed,
        arrows,
        dots,
        centerMode,
        order
    } = props;

    const {
        items,
        number: orderNumber,
        order_date: orderDate,
        status,
        total
    } = order;

    const statusKey = status.toLowerCase().replace(' ', '');

    const { formatMessage } = useIntl();

    const talonProps = useOrderRow({ items });
    const {
        handleContentToggle,
        isOpen,
        isLoading,
        imagesData,
        orderDetailData
        // onDownloadInvoice
    } = talonProps;

    const isCanDownloadInvoice = useMemo(() => {
        if (
            status === 'Processing' ||
            status === 'Complete' ||
            status === 'المعالجة' ||
            status === 'تكملة'
        ) {
            return true;
        }
        return false;
    }, [status]);

    const { grand_total: grandTotal } = total;
    const { currency, value: orderTotal } = grandTotal;

    const isoFormattedDate = orderDate.replace(' ', 'T');
    const formattedDate = new Date(isoFormattedDate).toLocaleDateString(
        undefined,
        {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }
    );

    const carouselSettings = {
        slidesToShow: slidesToShow,
        slidesToScroll: slidesToScroll,
        infinite: imagesData && imagesData.length > 4 ? true : false,
        draggable,
        autoplay,
        autoplaySpeed,
        arrows,
        dots,
        centerMode
    };

    const onNextSlider = useCallback(() => {
        sliderRef.current.slickNext();
    }, []);
    const onPreSlider = useCallback(() => {
        sliderRef.current.slickPrev();
    }, []);

    const sliderItems =
        imagesData &&
        imagesData.map((item, index) => {
            return <OrdersItem key={index} item={item} />;
        });
    const sliderWrapperClass = isOpen ? classes.contentSlider : '';

    return (
        <li
            className={`${classes.root} ${
                mobile || tablet ? classes.rootMobile : ''
            } ${rtl ? classes.rtl : ''}`}
        >
            <div className={classes.orderDetail}>
                <div className={classes.orderNumber}>
                    <div>
                        <FormattedMessage
                            id={'orderRow.orderNumber'}
                            defaultMessage={'Order number: #'}
                        />
                    </div>
                    <span>{orderNumber}</span>
                </div>
                {mobile || tablet ? (
                    <div
                        className={isOpen ? classes.reverseIcon : ''}
                        onClick={handleContentToggle}
                        aria-hidden="true"
                    >
                        <img src={images.downIcon} alt="icon arrow" />
                    </div>
                ) : (
                    <div
                        className={classes.orderCheckDetail}
                        onClick={handleContentToggle}
                        aria-hidden="true"
                    >
                        <div className={classes.textShow}>
                            {isOpen ? (
                                <FormattedMessage
                                    id={'orderRow.showLess'}
                                    defaultMessage={'Show less'}
                                />
                            ) : (
                                <FormattedMessage
                                    id={'orderRow.checkDetails'}
                                    defaultMessage={'Check details'}
                                />
                            )}
                        </div>
                        <img
                            className={isOpen ? classes.transformIcon : ''}
                            src={arrowIcon}
                            alt="arrow icon"
                        />
                    </div>
                )}
            </div>
            <div className={classes.orderInfor}>
                <div className={classes.textBlock}>
                    <div className={classes.text}>
                        <FormattedMessage
                            id={'orderRow.orderDate'}
                            defaultMessage={'Date of order'}
                        />
                    </div>
                    <div className={classes.subText}>
                        {formattedDate.split('/').join('.')}
                    </div>
                </div>
                <div className={classes.textBlock}>
                    <div className={classes.text}>
                        <FormattedMessage
                            id={'orderRow.orderAmount'}
                            defaultMessage={'Amount'}
                        />
                    </div>
                    <div className={classes.subText}>
                        <Price currencyCode={currency} value={orderTotal} />
                    </div>
                </div>
                <div className={classes.textBlock}>
                    <div className={classes.text}>
                        <FormattedMessage
                            id={'orderRow.orderStatus'}
                            defaultMessage={'Payment status'}
                        />
                    </div>
                    <div className={classes.subText}>
                        {formatMessage({
                            id: `orderRow.${statusKey}`,
                            defaultMessage: status
                        })}
                    </div>
                </div>
                {/* <div
                    className={classes.textBlock}
                    style={{
                        color: isCanDownloadInvoice ? "#008B8B" : "#C4C4C4",
                        cursor: isCanDownloadInvoice ? 'pointer' : 'not-allowed'
                    }}
                    onClick={() => {
                        isCanDownloadInvoice
                            ? onDownloadInvoice(orderNumber)
                            : {};
                    }}
                >
                    <FormattedMessage
                        id={'orderRow.downloadInvoice'}
                        defaultMessage={'Download invoice'}
                    />
                </div> */}
            </div>
            <div className={`${classes.wrapper} ${sliderWrapperClass}`}>
                {imagesData && imagesData.length > 4 && (
                    <Fragment>
                        <button
                            className={classes.preSlider}
                            onClick={onPreSlider}
                        />
                        <button
                            className={classes.nextSlider}
                            onClick={onNextSlider}
                        />
                    </Fragment>
                )}
                <div className={classes.slider}>
                    <SlickSlider ref={sliderRef} {...carouselSettings}>
                        {sliderItems}
                    </SlickSlider>
                </div>
            </div>
            <div style={{ display: !isOpen && 'none' }}>
                {!isLoading && (
                    <OrderDetails
                        orderData={order}
                        imagesData={imagesData}
                        orderDetailData={orderDetailData}
                    />
                )}
            </div>
        </li>
    );
};

export default OrderRow;

OrderRow.propTypes = {
    classes: shape({
        root: string,
        orderDetail: string,
        orderNumber: string,
        orderCheckDetail: string,
        orderInfor: string,
        textBlock: string,
        text: string,
        subText: string,
        wrapper: string,
        preSlider: string,
        slider: string
    }),
    order: shape({
        billing_address: shape({
            city: string,
            country_code: string,
            firstname: string,
            lastname: string,
            postcode: string,
            region_id: string,
            street: arrayOf(string)
        }),
        items: arrayOf(
            shape({
                id: string,
                product_name: string,
                product_sale_price: shape({
                    currency: string,
                    value: number
                }),
                product_sku: string,
                selected_options: arrayOf(
                    shape({
                        label: string,
                        value: string
                    })
                ),
                quantity_ordered: number
            })
        ),
        invoices: arrayOf(
            shape({
                id: string
            })
        ),
        number: string,
        order_date: string,
        payment_methods: arrayOf(
            shape({
                type: string,
                additional_data: arrayOf(
                    shape({
                        name: string,
                        value: string
                    })
                )
            })
        ),
        shipping_address: shape({
            city: string,
            country_code: string,
            firstname: string,
            lastname: string,
            postcode: string,
            region_id: string,
            street: arrayOf(string),
            telephone: string
        }),
        shipping_method: string,
        shipments: arrayOf(
            shape({
                id: string,
                tracking: arrayOf(
                    shape({
                        number: string
                    })
                )
            })
        ),
        status: string,
        total: shape({
            discounts: arrayOf(
                shape({
                    amount: shape({
                        currency: string,
                        value: number
                    })
                })
            ),
            grand_total: shape({
                currency: string,
                value: number
            }),
            subtotal: shape({
                currency: string,
                value: number
            }),
            total_tax: shape({
                currency: string,
                value: number
            }),
            total_shipping: shape({
                currency: string,
                value: number
            })
        })
    }),
    slidesToShow: number,
    slidesToScroll: number,
    draggable: bool,
    autoplay: bool,
    autoplaySpeed: number,
    arrows: bool,
    dots: bool,
    centerMode: bool,
    infinite: bool
};

OrderRow.defaultProps = {
    slidesToShow: 4,
    slidesToScroll: 1,
    order: [],
    draggable: true,
    autoplay: false,
    autoplaySpeed: 4000,
    arrows: false,
    dots: false,
    centerMode: false,
    infinite: false
};
