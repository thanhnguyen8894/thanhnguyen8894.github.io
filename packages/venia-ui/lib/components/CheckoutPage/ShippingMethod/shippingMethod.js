import React, { Fragment, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useAppContext } from '@magento/peregrine/lib/context/app';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './shippingMethod.css';

import { images } from '@magento/venia-ui/lib/constants/images';
import Image from '@magento/venia-ui/lib/components/Image';
import Price from '@magento/venia-ui/lib/components/Price';

const ShippingMethod = props => {
    const [{ mobile, tablet }] = useAppContext();
    const {
        classes: propClasses,
        shippingMethods = [],
        shippingMethodSelected,
        onChangeShippingMethod
    } = props;
    const classes = mergeClasses(defaultClasses, propClasses);

    const shippingMethodList = useMemo(() => {
        if (shippingMethods && shippingMethods.length) {
            return shippingMethods.filter(d => d.method_title !== 'SMSA');
        }
        return [];
    }, [shippingMethods]);

    const renderElement = (item, index, hasActive) => {
        const itemClasses = `${classes.shippingMethodItem} ${
            hasActive ? classes.active : ''
        }`;
        return (
            <li
                onClick={() => onChangeShippingMethod(item)}
                className={itemClasses}
                key={index}
            >
                <span className={`${classes.leftColumn}`}>
                    {/* ${!item.image ? classes.oneColumnLeft : ''} */}
                    {/* <Image
                        alt="icon"
                        classes={{
                            container: classes.methodIcon
                        }}
                        src={item.image ? item.image : images.upsIcon}
                        height={index === 1 ? 13 : 30}
                        width={25}
                    /> */}
                    <span>
                        <h4 className={classes.title}>{item.method_title}</h4>
                        {item.carrier_title && (
                            <h6 className={classes.subtitle}>
                                {item.carrier_title}
                            </h6>
                        )}
                    </span>
                </span>
                {/* ${!item.price ? classes.oneColumnRight : ''} */}
                <span className={`${classes.rightColumn}`}>
                    {item.amount && (
                        <span className={classes.price}>
                            <Price
                                value={item.amount.value}
                                currencyCode={item.amount.currency}
                                decimal
                            />
                        </span>
                    )}
                </span>
            </li>
        );
    };

    const renderElements =
        shippingMethodList && shippingMethodList.length > 0
            ? shippingMethodList.map((item, index) => {
                    const { carrier_code: carrier_code_selected } =
                        shippingMethodSelected || {};
                    const hasActive = item.carrier_code === carrier_code_selected;
                    return renderElement(item, index, hasActive);
                })
            : null;

    if (shippingMethodList && shippingMethodList.length === 0) {
        return <Fragment />;
    }

    return (
        <div className={`${classes.root} ${mobile ? classes.rootMobile : ''}`}>
            <div className={classes.titleView}>
                <span className={classes.titleModal}>
                    <FormattedMessage
                        id={'checkoutPage.shippingMethod'}
                        defaultMessage={'Shipping Method'}
                    />
                </span>
            </div>
            <ul className={classes.shippingMethodBody}>{renderElements}</ul>
        </div>
    );
};

export default ShippingMethod;
