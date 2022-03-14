import React, { useMemo } from 'react';
import Select, { components } from 'react-select';
import Image from '@magento/venia-ui/lib/components/Image';
import { useAppContext } from '@magento/peregrine/lib/context/app';

// * STYLES
import defaultClasses from './donation.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

//Constants
import { images } from '@magento/venia-ui/lib/constants/images';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';

const donationDefault = {
    value: 'Select Donation',
    label: (
        <FormattedMessage
            id={'checkoutPage.selectDonation'}
            defaultMessage={'Select Donation'}
        />
    )
};

const Donation = props => {
    const {
        classes: propClasses,
        donationList: donationListData,
        valueDonation,
        setValueDonation,
        warningDonation
    } = props;
    const classes = mergeClasses(defaultClasses, propClasses);
    const [{ rtl, mobile, tablet }] = useAppContext();

    const dropDownIndicator = (
        <Image alt="icon down" src={images.downIcon} width={15} height={15} />
    );
    const DropdownIndicator = props => {
        return (
            <components.DropdownIndicator {...props}>
                {dropDownIndicator}
            </components.DropdownIndicator>
        );
    };

    const selectStyles = {
        indicatorSeparator: provided => ({
            ...provided,
            display: 'none',
            color: '#000000'
        }),
        control: provided => ({
            ...provided,
            border: 'none',
            backgroundColor: '#FAFAFA',
            borderRadius: 0,
            minHeight: 'unset',
            borderColor: '#FAFAFA',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#FFFFFF'
            },
            width: 200,
            direction: rtl ? 'rtl' : 'ltr'
        }),
        singleValue: styles => ({
            ...styles,
            color: '#000000',
            minHeight: 17,
            justifyContent: 'flex-start',
            alignItems: 'center',
            display: 'flex'
        }),
        input: styles => ({
            ...styles,
            margin: 0,
            padding: 0
        }),
        option: (provided, state) => ({
            ...provided,
            borderBottom: '1px solid #FAFAFA',
            color: state.isDisabled ? '#CDCDCD' : '#000000',
            padding: 0,
            paddingTop: 20,
            paddingBottom: 20,
            height: 10,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            fontSize: 14,
            fontWeight: '400',
            backgroundColor: state.isFocused ? 'rgb(244 245 245)' : '#FFFFFF',
            cursor: state.isDisabled ? 'not-allowed' : 'pointer'
        }),
        valueContainer: styles => ({
            ...styles,
            padding: 10,
            paddingTop: 15,
            paddingBottom: 15,
            fontSize: 14,
            fontWeight: '400',
            color: '#000000',
            gridTemplateColumns: 'min-content'
        }),
        menu: (provided, state) => ({
            ...provided,
            boxShadow: '0px 15px 30px #E5E5E5',
            border: '1px solid #E5E5E5'
        }),
        menuList: styles => ({
            ...styles,
            paddingTop: 16,
            paddingBottom: 16,
            '::-webkit-scrollbar': {
                width: 6,
                height: 150
            },
            '::-webkit-scrollbar-corner': {
                backgroundColor: 'transparent'
            },
            '::-webkit-scrollbar-track': {
                backgroundColor: 'transparent'
            },
            '::-webkit-scrollbar-thumb:horizontal': {
                background: '#C4C4C4',
                boxShadow: '0 0 6px rgba(0,0,0,0.3)',
                borderRadius: 12
            },
            '::-webkit-scrollbar-thumb:vertical': {
                background: '#C4C4C4',
                boxShadow: '0 0 6px rgba(0,0,0,0.3)',
                borderRadius: 12
            }
        }),
        indicatorsContainer: styles => ({
            ...styles,
            padding: 10
        }),
        dropdownIndicator: styles => ({
            ...styles,
            padding: 0
        })
    };

    const donationList = useMemo(() => {
        if (donationListData && donationListData.length > 0) {
            const newList = _.cloneDeep(donationListData);
            for (let i = 0; i < donationListData.length; i++) {
                newList[i].label = (
                    <FormattedMessage
                        id={`checkoutPage.${donationListData[i].label}`}
                        defaultMessage={`${donationListData[i].label}`}
                    />
                );
            }
            return newList;
        }
        return null;
    }, [donationListData]);

    return (
        <div
            className={`${classes.root} ${tablet ? classes.rootTablet : ''} ${
                mobile ? classes.rootMobile : ''
            }`}
        >
            <h1 className={classes.title}>
                <FormattedMessage
                    id={'checkoutPage.donation'}
                    defaultMessage={'4. Donation'}
                />
            </h1>
            <h2 className={classes.subTitle}>
                <FormattedMessage
                    id={'checkoutPage.donationSubTitle'}
                    defaultMessage={
                        'The Al-Jasser Humanitarian Foundation and the Arabian Oud Company, its strategic partner, are honored to launch the first “Endowment for Arabian Oud Customers” programs by donating 2 SAR for each product purchased by the customer from perfumes or gift bags.'
                    }
                />
            </h2>
            <div className={classes.inputBlock}>
                <div>
                    {warningDonation && (
                        <p className={classes.textWarning}>
                            <FormattedMessage
                                id={'checkoutPage.donationTextWarning'}
                                defaultMessage={'This is required field'}
                            />
                        </p>
                    )}
                </div>
                <div>
                    <Select
                        value={valueDonation || []}
                        onChange={value => {
                            setValueDonation(value);
                        }}
                        options={donationList}
                        styles={selectStyles}
                        components={{ DropdownIndicator }}
                        placeholder={
                            !rtl ? 'Select Donation' : 'قم بأختيار جهة التبرع'
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default Donation;
