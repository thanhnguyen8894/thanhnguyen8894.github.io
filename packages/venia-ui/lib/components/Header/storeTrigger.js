import React from 'react';
import Select, { components } from 'react-select';
import { useStoreTrigger } from '@magento/peregrine/lib/talons/Header/useStoreTrigger';

//Constants
import {
    STORE_VIEWS,
    STORE_VIEWS_AR
} from '@magento/peregrine/lib/util/common';
import { images } from '@magento/venia-ui/lib/constants/images';

//Styles
import defaultClasses from './storeTrigger.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { BrowserPersistence } from '@magento/peregrine/lib/util';
import Image from '@magento/venia-ui/lib/components/Image';
const storage = new BrowserPersistence();
const storeCode = storage.getItem('store_view_code');

const StoreTrigger = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const { show, rtl } = props;

    const talonProps = useStoreTrigger({});

    const { currentStore, handleStoreChange } = talonProps || {};
    const isArStore = !storeCode || storeCode.includes('ar') ? true : false;

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
            width: 110
        }),
        singleValue: styles => ({
            ...styles,
            color: '#000000',
            minHeight: 17,
            justifyContent: 'flex-start',
            alignItems: 'center',
            display: 'flex',
            paddingInlineStart: 5
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
            fontSize: 12,
            fontWeight: '400',
            backgroundColor: state.isFocused ? 'rgb(244 245 245)' : '#FFFFFF',
            cursor: state.isDisabled ? 'not-allowed' : 'pointer'
        }),
        valueContainer: styles => ({
            ...styles,
            padding: 0,
            fontSize: 12,
            fontWeight: '400',
            color: '#000000',
            gridTemplateColumns: 'min-content'
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
            padding: 0
        }),
        dropdownIndicator: styles => ({
            ...styles,
            padding: 0
        })
    };

    if (show) {
        return (
            <div>
                <Select
                    value={currentStore}
                    isSearchable={false}
                    onChange={value => {
                        handleStoreChange && handleStoreChange(value);
                    }}
                    options={isArStore ? STORE_VIEWS_AR : STORE_VIEWS}
                    styles={selectStyles}
                    components={{ DropdownIndicator }}
                    isOptionDisabled={option =>
                        option.value == currentStore.value
                    }
                />
            </div>
        );
    }

    return <div />;
};

export default StoreTrigger;
