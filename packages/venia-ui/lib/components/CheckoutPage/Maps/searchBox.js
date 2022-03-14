import React,  { useEffect, useRef, useCallback } from 'react';
import { object, func, shape, string } from 'prop-types';

const SearchBox = props => {
    const { 
        maps,
        placeholder,
        onPlacesChanged,
        mapsapi
    } = props;
    const searchInput = useRef(null);
    const searchBox = useRef(null);

    const { places } = mapsapi || {};

    const handleOnPlacesChanged = useCallback(() => {
        if (onPlacesChanged) {
            onPlacesChanged(searchBox.current.getPlaces());
        }
    }, [onPlacesChanged, searchBox]);

    useEffect(() => {
        if (!searchBox.current && maps && places) {
            searchBox.current = new places.SearchBox(searchInput.current);
            searchBox.current.addListener('places_changed', handleOnPlacesChanged);
        }

        return () => {
            if (maps && maps.event) {
                searchBox.current = null;
                maps.event.clearInstanceListeners(searchBox);
            }
        };
    }, [maps, searchBox, handleOnPlacesChanged, places]);

    return (
        <input ref={searchInput} 
            placeholder={placeholder} 
            type="text"
            style={{
                boxSizing: `border-box`,
                border: `1px solid transparent`,
                width: `240px`,
                height: `32px`,
                padding: `0 12px`,
                borderRadius: `3px`,
                boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                fontSize: `14px`,
                outline: `none`,
                textOverflow: `ellipses`
            }}/>
    );
};

SearchBox.propTypes = {
    maps: object,
    mapsapi: shape({
        places: shape({
          SearchBox: func,
        }),
        event: shape({
          clearInstanceListeners: func,
        }),
      }).isRequired,
    placeholder: string,
    onPlacesChanged: func,
};

SearchBox.defaultProps = {
    placeholder: 'Search...',
    onPlacesChanged: null,
}

export default SearchBox;
