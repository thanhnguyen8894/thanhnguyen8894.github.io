import React, { useEffect, useRef } from 'react';
import { bool, shape, string } from 'prop-types';
import { Form } from 'informed';
import { useLocation } from 'react-router-dom';
import { useSearchBar } from '@magento/peregrine/lib/talons/SearchBar';

import { mergeClasses } from '../../classify';
import Autocomplete from './autocomplete';
import SearchField from './searchField';
import defaultClasses from './searchBar.css';

const SearchBar = React.forwardRef((props, ref) => {
    const { isOpen, placeholder } = props;
    const formApiRef = useRef();
    const { pathname } = useLocation();
    const talonProps = useSearchBar();
    const {
        containerRef,
        handleChange,
        handleFocus,
        handleSubmit,
        initialValues,
        isAutoCompleteOpen,
        setIsAutoCompleteOpen,
        valid
    } = talonProps;

    const classes = mergeClasses(defaultClasses, props.classes);

    useEffect(() => {
        if (pathname !== '/search.html') {
            formApiRef.current.reset();
        }
    }, [formApiRef, pathname]);

    return (
        <div className={classes.root} ref={ref}>
            <div ref={containerRef} className={classes.container}>
                <Form
                    getApi={formApi => (formApiRef.current = formApi)}
                    autoComplete="off"
                    className={classes.form}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                >
                    <div className={classes.autocomplete}>
                        <Autocomplete
                            setVisible={setIsAutoCompleteOpen}
                            valid={valid}
                            visible={isAutoCompleteOpen}
                        />
                    </div>
                    <div className={classes.search}>
                        <SearchField
                            isSearchOpen={isOpen}
                            placeholder={placeholder}
                            onChange={handleChange}
                            onFocus={handleFocus}
                        />
                    </div>
                </Form>
            </div>
        </div>
    );
});

export default SearchBar;

SearchBar.propTypes = {
    classes: shape({
        autocomplete: string,
        container: string,
        form: string,
        root: string,
        root_open: string,
        search: string
    }),
    isOpen: bool,
    placeholder: string
};
