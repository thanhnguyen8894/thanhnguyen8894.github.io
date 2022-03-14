import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { object, array } from 'prop-types';

import { CheckCircle, Phone, User, MapPin } from 'react-feather';
import _ from 'lodash';

import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import { Form } from 'informed';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import Image from '@magento/venia-ui/lib/components/Image';
import Button from '@magento/venia-ui/lib/components/Button';
import { Accordion, Section } from '@magento/venia-ui/lib/components/Accordion';

import Field from '../../Field';
import { isRequired } from '@magento/venia-ui/lib/util/formValidators';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './shippingAddress.css';

import GTMAnalytics from '@magento/peregrine/lib/util/GTMAnalytics';

const ShippingAddress = props => {
    const {
        classes: propClasses,
        isEditAddress,
        onSave,
        isSubmitting,
        currentAddress,
        setCurrentAddress,
        isShowAddress,
        setIsShowAddress,
        myAddress,
        shippingAddresses,
        cartItems,
        customerData
    } = props || {};

    //* Handle get default address if addresses avaiable in customer data
    const _defaultAddress = useMemo(() => {
        const { customer } = customerData || {};
        const { customer_mobile, firstname, lastname } = customer || {};
        if (myAddress && myAddress.length) {
            const _defaultAddress = _.filter(
                myAddress,
                d => d.default_shipping === true
            );
            if (_defaultAddress && _defaultAddress.length > 0) {
                const {
                    city,
                    street,
                    postcode,
                    region,
                    country_code
                } = _defaultAddress[0];
                const { region_code } = region || {};
                const fullName = `${firstname} ${lastname}`;
                const phoneNumber = customer_mobile;
                const defaultAddress = {
                    fullName,
                    phoneNumber,
                    city,
                    country: country_code,
                    address: street ? street[0] : null,
                    postCode: postcode,
                    district: region_code || ''
                };
                return defaultAddress;
            }
        }
    }, [customerData, myAddress]);

    function sentTracking() {
        try {
            let itemsCart = cartItems;

            itemsCart = itemsCart.map(item => {
                return {
                    name: item?.product?.name || '',
                    id: item?.product?.id || '',
                    price: item?.prices?.price?.value || '',
                    quantity: item?.quantity || '',
                    sku: item?.product?.sku || ''
                };
            });

            const params = {
                step: 3,
                option: 'Shipping Address',
                products: itemsCart
            };
            GTMAnalytics.default().trackingCheckout(params);
        } catch (error) {
            // TODO
        }
    }

    const classes = mergeClasses(defaultClasses, propClasses);
    const { formatMessage } = useIntl();
    const [{ mobile, storeConfig }] = useAppContext();
    const formApiRef = useRef();

    const [addressSelected, setAddressSelected] = useState();
    const [initialValues, setInitialValues] = useState({});

    const hasValidAddress = useMemo(() => {
        if (currentAddress) {
            const { city, district, address, country, fullName, phoneNumber } =
                currentAddress || {};
            if (
                city &&
                district &&
                address &&
                fullName &&
                phoneNumber &&
                country
            ) {
                return true;
            }
        }
        return false;
    }, [currentAddress]);

    useEffect(() => {
        if (initialValues && initialValues.fullName) {
            // set value on form
            if (formApiRef && formApiRef.current) {
                setTimeout(() => {
                    const { setValue } = formApiRef.current;
                    setValue('fullName', initialValues.fullName);
                    setValue('phoneNumber', initialValues.phoneNumber);
                    setValue('city', initialValues.city);
                    setValue('district', initialValues.district);
                    setValue('address', initialValues.address);
                    setValue('postCode', initialValues.postCode);
                    // setValue('country', value.country);
                    // setValue('estAddress', value.estAddress ? value.city : '');
                }, 0);
            }
        }
    }, [initialValues, formApiRef]); // eslint-disable-line react-hooks/exhaustive-deps

    //* Handle update current address with priority:
    //* 1. Address available in cart
    //* 2. Default address
    //* 3. Current user address
    useEffect(() => {
        if (shippingAddresses && shippingAddresses?.fullName) {
            setInitialValues({ ...shippingAddresses });
            setCurrentAddress({ ...shippingAddresses });
            return;
        } else if (_defaultAddress && _defaultAddress?.fullName) {
            setInitialValues({ ..._defaultAddress });
            setCurrentAddress({ ..._defaultAddress });
            return;
        }
    }, [_defaultAddress, shippingAddresses, setCurrentAddress]);

    //* Handle update current address if dont have 2 option bellow (use user current address)
    useEffect(() => {
        if (
            (!shippingAddresses || !shippingAddresses?.fullName) &&
            (!_defaultAddress || !_defaultAddress?.fullName)
        ) {
            setInitialValues({ ...currentAddress });
            return;
        }
    }, [_defaultAddress, currentAddress, shippingAddresses]);

    const handleSubmit = data => {
        if (typeof data === 'object') {
            data.country =
                data.country ||
                initialValues.country ||
                storeConfig?.default_country_code ||
                'SA';
            data.estAddress = data.estAddress || initialValues.city;
        }
        onSave(data);
    };

    const addressInfoComs = (
        <div
            className={`${classes.info} ${
                hasValidAddress === false ? classes.inValidInfo : ''
            }`}
        >
            <div className={classes.rowView}>
                <div className={classes.rowValue}>{initialValues.fullName}</div>
            </div>
            <div className={classes.rowView}>
                <div className={classes.rowValue}>
                    {initialValues.phoneNumber}
                </div>
            </div>
            <div className={classes.rowView}>
                <div className={classes.rowValue}>{initialValues.address}</div>
            </div>
            <div className={classes.rowView}>
                <div className={classes.rowValue}>{initialValues.district}</div>
            </div>
            <div className={classes.rowView}>
                <div className={classes.rowValue}>{initialValues.city}</div>
            </div>
            <div className={classes.rowView}>
                <div className={classes.rowValue}>{initialValues.country}</div>
            </div>
            <div className={classes.rowView}>
                <div className={classes.rowValue}>{initialValues.postCode}</div>
            </div>
        </div>
    );

    const onToggleAddress = () => {
        setIsShowAddress(!isShowAddress);
    };

    const addressFrom = useMemo(() => {
        return (
            <Fragment>
                <Form
                    initialValues={initialValues}
                    allowEmptyStrings={true}
                    getApi={formApi => (formApiRef.current = formApi)}
                    className={classes.form}
                    onSubmit={val => handleSubmit(val)}
                >
                    <Field
                        label={formatMessage({
                            id: 'global.fullname',
                            defaultMessage: 'Full Name'
                        })}
                    >
                        {/* TODO */}
                        {/* after={<CheckCircle />} */}
                        <TextInput
                            field="fullName"
                            before={<User width="16px" height="16px" />}
                            placeholder={formatMessage({
                                id: 'global.fullname',
                                defaultMessage: 'Full Name'
                            })}
                            validate={isRequired}
                        />
                    </Field>
                    <Field
                        label={formatMessage({
                            id: 'global.phoneNumber',
                            defaultMessage: 'Phone Number'
                        })}
                    >
                        <TextInput
                            field="phoneNumber"
                            before={<Phone width="16px" height="16px" />}
                            placeholder={formatMessage({
                                id: 'global.phoneNumber',
                                defaultMessage: 'Phone Number'
                            })}
                        />
                    </Field>
                    <Field
                        label={formatMessage({
                            id: 'global.address',
                            defaultMessage: 'Address'
                        })}
                    >
                        <TextInput
                            field="address"
                            before={<MapPin width="16px" height="16px" />}
                            placeholder={formatMessage({
                                id: 'global.address',
                                defaultMessage: 'Address'
                            })}
                            validate={isRequired}
                        />
                    </Field>

                    <Field
                        label={formatMessage({
                            id: 'global.district',
                            defaultMessage: 'District'
                        })}
                    >
                        <TextInput
                            field="district"
                            placeholder={formatMessage({
                                id: 'global.district',
                                defaultMessage: 'District'
                            })}
                            validate={isRequired}
                        />
                    </Field>

                    <Field
                        label={formatMessage({
                            id: 'global.city',
                            defaultMessage: 'City'
                        })}
                    >
                        <TextInput
                            field="city"
                            placeholder={formatMessage({
                                id: 'global.city',
                                defaultMessage: 'City'
                            })}
                            validate={isRequired}
                        />
                    </Field>

                    <Field
                        label={formatMessage({
                            id: 'global.postcode',
                            defaultMessage: 'Post Code'
                        })}
                    >
                        <TextInput
                            field="postCode"
                            placeholder={formatMessage({
                                id: 'global.postcode',
                                defaultMessage: 'Post Code'
                            })}
                        />
                    </Field>
                    <div className={classes.buttonsContainer}>
                        <Button
                            type="submit"
                            priority="high"
                            disabled={isSubmitting}
                            className={classes.submit}
                        >
                            {isSubmitting
                                ? formatMessage({
                                      id:
                                          'forgotPasswordForm.submittingButtonText',
                                      defaultMessage: 'Submitting'
                                  })
                                : formatMessage({
                                      id: 'forgotPasswordForm.submitButtonText',
                                      defaultMessage: 'Submit'
                                  })}
                        </Button>
                        <Button
                            className={classes.submit}
                            onClick={() => onToggleAddress()}
                            priority="high"
                            type="button"
                        >
                            <FormattedMessage
                                id={'global.cancelButton'}
                                defaultMessage={'Cancel'}
                            />
                        </Button>
                    </div>
                </Form>
            </Fragment>
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        classes.buttonsContainer,
        classes.form,
        classes.submit,
        formatMessage,
        initialValues,
        isSubmitting,
        onToggleAddress
    ]);

    const getIconSelected = isSelected => {
        if (isSelected) {
            return '/venia-static/icons/radio_on.svg';
        }
        return '/venia-static/icons/radio_off.svg';
    };

    const onAddressSelection = value => {
        sentTracking();
        const {
            firstname,
            lastname,
            region,
            city,
            country_code,
            street,
            telephone,
            postCode
        } = value || {};
        const { region_code } = region || {};
        const { fullName, phoneNumber } = currentAddress || {};
        const onAcceptAddress = () => {
            setAddressSelected(value);
            const requestShippingAddress = {
                fullName: fullName || `${firstname} ${lastname}`,
                phoneNumber: phoneNumber || telephone,
                city,
                country: country_code,
                address: street ? street[0] : '',
                postCode,
                district: region && region_code ? region_code : ''
            };

            setCurrentAddress({ ...requestShippingAddress });

            //* Set initial values for edit and showing address
            setInitialValues({ ...requestShippingAddress });

            // this case will check
            // If the data is ready, we will call to save the Shipping Addres
            // Or we will input by form
            if (
                requestShippingAddress &&
                requestShippingAddress.fullName &&
                requestShippingAddress.phoneNumber &&
                requestShippingAddress.address &&
                requestShippingAddress.city &&
                requestShippingAddress.country &&
                requestShippingAddress.district
                // && requestShippingAddress.postCode
            ) {
                requestShippingAddress.estAddress = requestShippingAddress.city;
                // this case will auto save the Shipping Address
                handleSubmit(value?.id);
                // handleSubmit(requestShippingAddress);
                setIsShowAddress(false);
            } else {
                setIsShowAddress(true);
            }
        };
        const address = street && street.length > 0 ? street[0] : '';
        const district = region ? region_code : '';
        if (
            !lastname ||
            !firstname ||
            !city ||
            // || !postcode
            !telephone ||
            !country_code ||
            !address ||
            !district
        ) {
            Swal.fire({
                title: `${formatMessage({
                    id: 'myAddress.confirmTitle',
                    defaultMessage: 'Are you sure?'
                })}`,
                text: `${formatMessage({
                    id: 'myAddress.subTitleConfirm',
                    defaultMessage:
                        'Your address are missing some informations.'
                })}`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#7367f0',
                cancelButtonColor: 'darkgray',
                confirmButtonText: `${formatMessage({
                    id: 'myAddress.confirmButtonTitle',
                    defaultMessage: 'Yes, I will update'
                })}`,
                cancelButtonText: `${formatMessage({
                    id: 'global.cancelButton',
                    defaultMessage: 'Cancel'
                })}`
            }).then(result => {
                if (result.isConfirmed) {
                    onAcceptAddress();
                }
            });
        } else {
            onAcceptAddress();
        }
    };

    const addressList = useMemo(() => {
        if (myAddress && myAddress.length > 0) {
            return myAddress.map((item, index) => {
                const isSelected = _.isEqual(addressSelected, item);
                return (
                    <li
                        key={index}
                        onClick={() => onAddressSelection(item)}
                        className={isSelected ? 'actived' : ''}
                        aria-hidden="true"
                    >
                        <span>
                            <img
                                alt="Addresses"
                                src={getIconSelected(isSelected)}
                            />
                            {item.default_shipping && (
                                <p className={classes.defaultAddress}>
                                    <FormattedMessage
                                        id={'myAddress.default'}
                                        defaultMessage={'Default'}
                                    />
                                </p>
                            )}
                        </span>
                        <span className={classes.inforContainer}>
                            <p className={classes.text}>{item.city}</p>
                            {item.region && item.region.region_code && (
                                <p className={classes.text}>
                                    {item.region.region_code}
                                </p>
                            )}
                            {item.street && item.street[1] && (
                                <p className={classes.text}>{item.street[1]}</p>
                            )}
                            <p className={classes.text}>{item.street[0]}</p>
                            <p className={classes.text}>{item.postcode}</p>
                        </span>
                    </li>
                );
            });
        }
        return <Fragment />;
    }, [myAddress, getIconSelected]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className={mobile ? classes.rootMobile : classes.root}>
            {addressInfoComs}

            {myAddress && myAddress.length > 0 && (
                <Accordion
                    canOpenMultiple={true}
                    classes={{ root: classes.otherAddress }}
                >
                    <Section
                        classes={{ otherAddress: 'sectionOtherAddress' }}
                        title={formatMessage({
                            id: 'myAddress.addOtherAddress',
                            defaultMessage: 'Ship to address'
                        })}
                    >
                        <ul className={classes.addressList}>{addressList}</ul>
                    </Section>
                </Accordion>
            )}

            <div className={classes.addNew}>
                <div className={classes.title}>
                    <div
                        className={classes.showAddress}
                        aria-hidden="true"
                        onClick={() => onToggleAddress()}
                    >
                        {isEditAddress ? (
                            <FormattedMessage
                                id={'checkoutPage.editAddress'}
                                defaultMessage={'Edit address'}
                            />
                        ) : (
                            <FormattedMessage
                                id={'checkoutPage.addNewAddress'}
                                defaultMessage={'Add new address'}
                            />
                        )}
                        <Button className={classes.button}>
                            <Image
                                style={{ marginInlineStart: '13px' }}
                                className={classes.img}
                                alt=""
                                src={
                                    isShowAddress
                                        ? '/venia-static/icons/remove.svg'
                                        : '/venia-static/icons/plus.svg'
                                }
                            />
                        </Button>
                    </div>
                </div>
                {isShowAddress && addressFrom}
            </div>
        </div>
    );
};

ShippingAddress.propTypes = {
    currentAddress: object,
    myAddress: array
};

ShippingAddress.defaultProps = {
    currentAddress: {
        fullName: '',
        phoneNumber: '',
        country: '',
        city: '',
        district: '',
        address: '',
        postCode: '',
        estAddress: ''
    },
    myAddress: []
};

export default ShippingAddress;
