import React, { useEffect, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { object } from 'prop-types';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './maps.css';

import { GOOGLE_MAP_API_KEY } from '@magento/venia-ui/lib/constants/constants';
import SearchBox from './searchBox';

const DEFAULT_VALUE = {
    lat: 24.774265,
    lng: 46.738586
};

const Marker = () => {
    return <img alt="" src="/venia-static/icons/marker.svg" />;
};

const Maps = props => {
    const {
        classes: propClasses,
        currentLocation,
        customerData,
        onChangeLatLng,
        onClickCurrentLocation
    } = props;
    const classes = mergeClasses(defaultClasses, propClasses);
    const [lat, setLat] = useState(
        currentLocation ? currentLocation.tempLatLng.lat : DEFAULT_VALUE.lat
    );
    const [lng, setLng] = useState(
        currentLocation ? currentLocation.tempLatLng.lng : DEFAULT_VALUE.lng
    );
    const [mapInstance, setMapInstance] = useState();
    const [mapsapi, setMapsapi] = useState();

    useEffect(() => {
        if (currentLocation && currentLocation.tempLatLng) {
            const { lat, lng } = currentLocation.tempLatLng || {};
            setLat(lat);
            setLng(lng);
        }
    }, [currentLocation]); // eslint-disable-line react-hooks/exhaustive-deps

    const createMapOptions = map => {
        return {
            zoomControlOptions: {
                position: map.ControlPosition.RIGHT_BOTTOM, // as long as this is not set it works
                style: map.ZoomControlStyle.SMALL
            },
            panControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            scrollwheel: true,
            fullscreenControl: true
        };
    };

    const setCurrentLocation = position => {
        const { customer } = customerData || {};
        const { firstname = '', lastname = '', customer_mobile = '' } =
            customer || {};

        const fullName = `${firstname} ${lastname}`;
        const phoneNumber = customer_mobile;
        if (onChangeLatLng) {
            onChangeLatLng({
                fullName,
                phoneNumber,
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
        }
    };

    const handleApiLoaded = (map, maps) => {
        // use map and maps objects
        if (!map || !maps) {
            return;
        }

        setMapInstance(map);
        setMapsapi(maps);

        const infoWindow = new google.maps.InfoWindow();
        const locationButton = document.createElement('button');
        locationButton.style = `
            color: #000;
            background-image: url(/venia-static/icons/checkout/current-location.png);
            background-size: cover;
            background-repeat: no-repeat;
            background-size: 50% 50%;
            border-radius: 50%;
            background-color: white;
            padding: 18px;
            margin-right: 12px;
            width: 30px;
            height: 30px;
            background-position: center;
        `;
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
            locationButton
        );

        function storeCoordinates(position) {
            const { coords } = position;
            const { latitude, longitude } = coords || {};
            setLat(latitude);
            setLng(longitude);
        }
        function errorHandler(error) {
            console.warn(error);
        }

        function handleLocationError(browserHasGeolocation, infoWindow, pos) {
            infoWindow.setPosition(pos);
            infoWindow.setContent(
                browserHasGeolocation
                    ? 'Error: The Geolocation service failed.'
                    : `Error: Your browser doesn't support geolocation.`
            );
            infoWindow.open(map);
        }
        // laod current postion on browser
        navigator.geolocation.getCurrentPosition(
            storeCoordinates,
            errorHandler,
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
        );

        locationButton.addEventListener('click', () => {
            if (navigator.geolocation) {
                onClickCurrentLocation();
                navigator.geolocation.getCurrentPosition(
                    position => {
                        // set current location
                        storeCoordinates(position);
                        setCurrentLocation(position);

                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        infoWindow.setPosition(pos);
                        infoWindow.setContent('Your location found.');
                        infoWindow.open(map);
                        map.setCenter(pos);
                    },
                    () => {
                        handleLocationError(true, infoWindow, map.getCenter());
                        onClickCurrentLocation(false);
                    }
                );
            } else {
                // Browser doesn't support Geolocation
                handleLocationError(false, infoWindow, map.getCenter());
            }
        });
    };

    return (
        <div className={classes.root}>
            <GoogleMapReact
                options={createMapOptions}
                bootstrapURLKeys={{
                    key: GOOGLE_MAP_API_KEY,
                    libraries: ['places', 'geometry']
                }}
                center={{ lat, lng }}
                defaultZoom={16}
                yesIWantToUseGoogleMapApiInternals={true}
                onGoogleApiLoaded={({ map, maps }) =>
                    handleApiLoaded(map, maps)
                }
                onClick={onChangeLatLng}
            >
                <Marker lat={lat} lng={lng} />

                {/* {mapInstance && mapsapi && <SearchBox maps={mapInstance} mapsapi={mapsapi} ></SearchBox>} */}
            </GoogleMapReact>
        </div>
    );
};

Maps.propTypes = {
    currentLocation: object,
    customerData: object
};

export default Maps;
