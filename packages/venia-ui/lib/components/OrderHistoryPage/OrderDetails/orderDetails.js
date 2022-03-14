import React, { useCallback, useMemo } from 'react';
import { shape, string, arrayOf, number } from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { Link, resourceUrl } from '@magento/venia-drivers';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Price from '@magento/venia-ui/lib/components/Price';
import Image from '@magento/venia-ui/lib/components/Image';
import placeholderImage from '@magento/venia-ui/venia-static/icons/placeholderImage.jpg';
import { useCatalogContext } from '@magento/peregrine/lib/context/catalog';

import ShippingInformation from './shippingInformation';

import defaultClasses from './orderDetails.css';

const OrderDetails = props => {
    const {
        classes: propClasses,
        orderData,
        imagesData,
        orderDetailData
    } = props;
    const classes = mergeClasses(defaultClasses, propClasses);
    const [{ mobile, tablet }] = useAppContext();
    const [, { setProductId }] = useCatalogContext();
    const { items, total, shipping_address, history_comments } = orderData;
    const {
        grand_total: grandTotal,
        subtotal: subTotal,
        shipping_handling: shipTotal,
        subtotal_include_tax_order: subTotalIncludeTax,
        cash_on_delivery_fee: deliveryFee,
        discounts,
        total_tax: totalTax
    } = total;

    const { value: discountValue, currency: discountCurrency } =
        discounts[0]?.amount || {};

    const comments = history_comments.map((comment, index) => {
        const { message, date } = comment;
        return (
            <div key={index} className={classes.commentsBlock}>
                <p>{message}</p>
                <span>{date}</span>
            </div>
        );
    });

    const seletedProduct = useCallback(
        id => {
            setProductId(id);
        },
        [setProductId]
    );

    const rowItem = (type, data) => {
        const { quantity_ordered, selected_options } = data || {};
        if (type === 'SimpleProduct' || type === '') {
            return (
                <div className={classes.imageRow}>
                    <div className={classes.imageText}>
                        <FormattedMessage
                            id={'orderDetails.qty'}
                            defaultMessage={'Qty:'}
                        />
                        <span className={classes.subImageText}>
                            {quantity_ordered || 1}
                        </span>
                    </div>
                </div>
            );
        } else {
            return (
                <React.Fragment>
                    <div className={classes.imageRow}>
                        <div className={classes.imageText}>
                            <FormattedMessage
                                id={'orderDetails.color'}
                                defaultMessage={'Color:'}
                            />
                            <span className={classes.subImageText}>
                                {(selected_options[0] &&
                                    selected_options[0].value) ||
                                    'none'}
                            </span>
                        </div>
                        <div className={classes.imageText}>
                            <FormattedMessage
                                id={'orderDetails.size'}
                                defaultMessage={'Size:'}
                            />
                            <span className={classes.subImageText}>
                                {(selected_options[1] &&
                                    selected_options[1].value) ||
                                    'none'}
                            </span>
                        </div>
                    </div>
                    <div className={classes.imageRow}>
                        <div className={classes.imageText}>
                            <FormattedMessage
                                id={'orderDetails.qty'}
                                defaultMessage={'Qty:'}
                            />
                            <span className={classes.subImageText}>
                                {quantity_ordered || 1}
                            </span>
                        </div>
                    </div>
                </React.Fragment>
            );
        }
    };

    const contentImage = useMemo(() => {
        return items.map((item, index) => {
            const productLink = resourceUrl(`/${item.product_url_key}.html`);
            const product = orderDetailData?.products?.items.find(
                element => item.product_url_key === element.url_key
            );
            return (
                <div className={classes.imageBlock} key={index}>
                    <Link
                        onClick={() => seletedProduct(product?.id || undefined)}
                        to={productLink}
                        className={classes.image}
                    >
                        <Image
                            alt={
                                (imagesData[index] &&
                                    imagesData[index].thumbnail &&
                                    imagesData[index].thumbnail.label) ||
                                ''
                            }
                            src={
                                (imagesData[index] &&
                                    imagesData[index].thumbnail &&
                                    imagesData[index].thumbnail.url) ||
                                placeholderImage
                            }
                            width={100}
                            height={100}
                        />
                    </Link>
                    <div className={classes.imageInfo}>
                        <div className={classes.imageHeader}>
                            <Link
                                onClick={() =>
                                    seletedProduct(product?.id || undefined)
                                }
                                to={productLink}
                                className={classes.imageTitle}
                            >
                                <FormattedMessage
                                    id={'orderDetails.imageTitle'}
                                    defaultMessage={
                                        (imagesData[index] &&
                                            imagesData[index].thumbnail &&
                                            imagesData[index].thumbnail
                                                .label) ||
                                        'Default'
                                    }
                                />
                            </Link>
                            <div className={classes.amount}>
                                <Price
                                    currencyCode={
                                        item?.product_price_include_tax?.currency
                                    }
                                    value={item?.product_price_include_tax?.value}
                                />
                            </div>
                        </div>
                        {rowItem(
                            (imagesData[index] &&
                                imagesData[index].__typename) ||
                                '',
                            item
                        )}
                    </div>
                </div>
            );
        });
    }, [imagesData, items, orderDetailData, rowItem, seletedProduct]);

    return (
        <div className={`${classes.root} ${mobile ? classes.rootMobile : ''}`}>
            <div className={classes.product}>
                <FormattedMessage
                    id={'orderDetails.product'}
                    defaultMessage={'Products:'}
                />
            </div>
            {contentImage}
            {!mobile && !tablet && history_comments?.length > 0 && (
                <div className={classes.line} />
            )}
            {comments}
            {!mobile && !tablet && <div className={classes.line} />}
            <div className={classes.total}>
                <div className={classes.totalCost}>
                    <FormattedMessage
                        id={'orderDetails.total'}
                        defaultMessage={'Total cost:'}
                    />
                </div>
                <div className={`${classes.rowTotal} ${classes.highLine}`}>
                    <div className={classes.subTotal}>
                        <FormattedMessage
                            id={'orderDetails.subTotal'}
                            defaultMessage={'Subtotal:'}
                        />
                    </div>
                    <div className={classes.amountTotal}>
                        <Price
                            currencyCode={subTotalIncludeTax?.currency}
                            value={subTotalIncludeTax?.value}
                            decimal
                        />
                    </div>
                </div>
                <div className={classes.rowTotal}>
                    <div className={classes.subTotal}>
                        <FormattedMessage
                            id={'orderDetails.shippingVAT'}
                            defaultMessage={'Shipping (Inc VAT):'}
                        />
                    </div>
                    <div className={classes.amountTotal}>
                        <Price
                            currencyCode={
                                shipTotal?.amount_including_tax?.currency
                            }
                            value={shipTotal?.amount_including_tax?.value}
                            decimal
                        />
                    </div>
                </div>
                {deliveryFee && (
                    <div className={classes.rowTotal}>
                        <div className={classes.subTotal}>
                            <FormattedMessage
                                id={'orderDetails.cod'}
                                defaultMessage={'Cash On Delivery (COD):'}
                            />
                        </div>
                        <div className={classes.amountTotal}>
                            <Price
                                currencyCode={deliveryFee?.amount?.currency}
                                value={deliveryFee?.amount?.value}
                                decimal
                            />
                        </div>
                    </div>
                )}
                <div className={`${classes.rowTotal} ${classes.highLine}`}>
                    <div className={classes.subTotal}>
                        <FormattedMessage
                            id={'orderDetails.grandTotal'}
                            defaultMessage={'Grand Total:'}
                        />
                    </div>
                    <div className={classes.amountTotal}>
                        <Price
                            currencyCode={grandTotal?.currency}
                            value={grandTotal?.value}
                            decimal
                        />
                    </div>
                </div>
                {totalTax && (
                    <div className={classes.rowTotal}>
                        <div className={classes.subTotal}>
                            <FormattedMessage
                                id={'orderDetails.tax'}
                                defaultMessage={'Tax:'}
                            />
                        </div>
                        <div className={classes.amountTotal}>
                            <Price
                                currencyCode={totalTax?.currency}
                                value={totalTax?.value}
                                decimal
                            />
                        </div>
                    </div>
                )}
                {discountValue && discountValue > 0 && (
                    <div className={classes.rowTotal}>
                        <div className={classes.subTotal}>
                            <FormattedMessage
                                id={'orderDetails.discount'}
                                defaultMessage={'Discount:'}
                            />
                        </div>
                        <div className={classes.amountTotal}>
                            {'-'}
                            <Price
                                currencyCode={discountCurrency || 'SAR'}
                                value={discountValue}
                                decimal
                            />
                        </div>
                    </div>
                )}
            </div>
            <div className={classes.delivery}>
                <div className={classes.totalCost}>
                    <FormattedMessage
                        id={'orderDetails.delivery'}
                        defaultMessage={'Delivery address:'}
                    />
                </div>
                <div className={`${classes.amountTotal} ${classes.fontnomal}`}>
                    {/* <FormattedMessage
                        id={'orderDetails.addressInfor'}
                        defaultMessage={'City Name, District Name, Street Address, Post Code'}
                    /> */}
                    <div className={classes.shippingInformationContainer}>
                        <ShippingInformation data={shipping_address} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;

OrderDetails.propTypes = {
    classes: shape({
        root: string,
        shippingInformationContainer: string,
        shippingMethodContainer: string,
        billingInformationContainer: string,
        paymentMethodContainer: string,
        itemsContainer: string,
        orderTotalContainer: string,
        printButton: string,
        printLabel: string,
        image: string,
        title: string
    }),
    imagesData: arrayOf(
        shape({
            id: number,
            sku: string,
            thumbnail: shape({
                url: string
            }),
            url_key: string,
            url_suffix: string
        })
    ),
    orderData: shape({
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
                        carrier: string,
                        number: string
                    })
                )
            })
        ),
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
    })
};
