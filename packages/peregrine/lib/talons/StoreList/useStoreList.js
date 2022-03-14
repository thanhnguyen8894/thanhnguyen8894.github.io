import { useQuery, useLazyQuery } from '@apollo/client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import Geocode from 'react-geocode';
import { GOOGLE_MAP_API_KEY } from '@magento/venia-ui/lib/constants/constants';

Geocode.setApiKey(GOOGLE_MAP_API_KEY);
Geocode.setLanguage('ar');

export const useStoreList = props => {
    const [{ rtl }] = useAppContext();
    const defaultCitySelected = rtl ? 'جميع' : 'All';
    const defaultDistanceSelected = rtl ? 'جميع' : 'All';

    const DISTANCE_DEFAULT_LIST = [
        {
            key: 'All',
            label: rtl ? 'جميع' : 'All'
        },
        {
            key: '5km',
            label: '5 km'
        },
        {
            key: '10km',
            label: '10 km'
        },
        {
            key: '15km',
            label: '15 km'
        },
        {
            key: '20km',
            label: '20 km'
        }
    ];
    // PROPS
    const { getLocator, getLocatorByUserLocation } = props || {};

    // STATE
    const [isSearchDisable, setIsSearchDisable] = useState(false);

    const { data: locatorsData, loading: isLoading } = useQuery(getLocator, {
        fetchPolicy: 'cache-and-network'
    });

    const [
        queryGetLocatorByUserLocation,
        locatorByUserLocationResults
    ] = useLazyQuery(getLocatorByUserLocation, {
        fetchPolicy: 'cache-and-network'
    });

    const isLoadingQuery = locatorByUserLocationResults
        ? locatorByUserLocationResults.loading
        : false;

    // STATE
    useEffect(() => {
        getCurrentLocation();
    }, []);

    const [currentCitySelected, setCurrentCitySelected] = useState(
        defaultCitySelected
    );
    const [currentDistanceSelected, setCurrentDistanceSelected] = useState(
        defaultDistanceSelected
    );

    function getCurrentLocation() {
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions
                .query({ name: 'geolocation' })
                .then(function(result) {
                    if (result.state == 'denied') {
                        alert('Please turn on location on first');
                        setIsSearchDisable(true);
                    } else {
                        _onGetCurrentLocation();
                    }
                });
        } else if (navigator.geolocation) {
            //then Navigation APIs
            _onGetCurrentLocation();
        } else {
            alert('Please turn on location on first');
            setIsSearchDisable(true);
        }
    }

    function _onGetCurrentLocation() {
        navigator.geolocation.getCurrentPosition(function(position) {
            const { coords } = position;
            const { latitude: lat, longitude: lng } = coords;

            queryGetLocatorByUserLocation({
                variables: {
                    longitude: lng,
                    latitude: lat
                }
            });
        });
    }

    // DATA CHANGE
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    function getStoresData() {
        let results = [];

        if (locatorByUserLocationResults && locatorByUserLocationResults.data) {
            const { getListStoreLocator } =
                locatorByUserLocationResults.data || {};

            results = getListStoreLocator;
        } else if (locatorsData && locatorsData.getListStoreLocator) {
            results = locatorsData.getListStoreLocator;
        }

        return results;
    }

    const cityData = useMemo(() => {
        const data = getStoresData();

        if (data) {
            let cityList = [defaultCitySelected];

            data.forEach(element => {
                const { city = '' } = element || {};
                cityList.push(city);
            });

            const uniqueCity = cityList.filter(onlyUnique);

            cityList = uniqueCity.map(city => ({
                key: city,
                label: city
            }));

            return cityList;
        }
    }, [locatorsData, locatorByUserLocationResults]);

    const storesData = useMemo(() => {
        const data = getStoresData();
        let filterData = [];

        if (currentCitySelected) {
            if (currentCitySelected === 'All' || currentCitySelected === 'جميع') {
                filterData = data;
            } else {
                filterData = data.filter(p => p.city === currentCitySelected);
            }
        }

        if (currentDistanceSelected) {
            if (currentDistanceSelected !== 'All' && currentDistanceSelected !== 'جميع') {
                const selectValue = parseFloat(
                    currentDistanceSelected.replace(' km', '')
                );

                filterData = filterData.filter(item => {
                    const { distance } = item || {};
                    if (distance) {
                        const distanceValue = parseFloat(distance);

                        if (distanceValue <= selectValue) {
                            return item;
                        }
                    }
                });
            }
        }

        return filterData;
    }, [
        currentCitySelected,
        currentDistanceSelected,
        locatorsData,
        locatorByUserLocationResults
    ]);

    // ACTIONS
    const onSearchSubmit = useCallback(data => {
        const { city = '', distinct = '' } = data || {};

        setCurrentCitySelected(city);
        setCurrentDistanceSelected(distinct);
    }, []);

    return {
        currentCitySelected,
        currentDistanceSelected,
        cityData,
        distanceData: DISTANCE_DEFAULT_LIST,
        storesData,
        isLoading: isLoading || isLoadingQuery,
        onSearchSubmit,
        getCurrentLocation,
        isSearchDisable
    };
};
