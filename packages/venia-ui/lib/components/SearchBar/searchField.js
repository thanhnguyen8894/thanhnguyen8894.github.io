import React from 'react';
import { func, string } from 'prop-types';
import { X as ClearIcon } from 'react-feather';
import { useSearchField } from '@magento/peregrine/lib/talons/SearchBar';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

// constant
import { images } from '@magento/venia-ui/lib/constants/images';

// style
import defaultClasses from './searchBar.css';

// components
import Icon from '@magento/venia-ui/lib/components/Icon';
import Image from '@magento/venia-ui/lib/components/Image';
import Trigger from '@magento/venia-ui/lib/components/Trigger';
import TextInput from '@magento/venia-ui/lib/components/TextInput';

const clearIcon = <Icon src={ClearIcon} size={24} />;

const SearchField = props => {
    const { isSearchOpen, onChange, onFocus, placeholder } = props;
    const { inputRef, resetForm, value } = useSearchField({ isSearchOpen });

    const classes = mergeClasses(defaultClasses, props.classes);

    const resetButton = value ? (
        <Trigger action={resetForm}>{clearIcon}</Trigger>
    ) : null;

    const searchIcon = (
        <Image
            classes={{ root: classes.IconImage }}
            alt="Search products"
            width={18}
            height={18}
            src={images.searchIcon}
        />
    );

    return (
        // after={resetButton}
        <TextInput
            after={searchIcon}
            field="search_query"
            onFocus={onFocus}
            onValueChange={onChange}
            forwardedRef={inputRef}
            placeholder={placeholder}
            classes={{
                input: classes.inputSearchBar,
                after: classes.afterIcon
            }}
        />
    );
};

export default SearchField;

SearchField.propTypes = {
    onChange: func,
    onFocus: func,
    placeholder: string
};
