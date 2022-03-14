import { useStoreList } from '@magento/peregrine/lib/talons/StoreList/useStoreList';
import React, { useCallback, useEffect } from 'react';
import { number, shape } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { Form } from 'informed';

import ItemMap from './item';
import Button from '@magento/venia-ui/lib/components/Button';
import Select from '@magento/venia-ui/lib/components/Select';
import Field from '@magento/venia-ui/lib/components/Field';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { GET_ALL_LOCATOR, GET_LOCATOR_BY_USER_LOCATION } from './storeList.gql';

import { mergeClasses } from '../../classify';
import defaultClasses from './storeList.css';
import { GOOGLE_MAP_API_KEY } from '@magento/venia-ui/lib/constants/constants';

const StoreList = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    const [{ mobile }] = useAppContext();
    const { formatMessage } = useIntl();

    const talonProps = useStoreList({
        getLocator: GET_ALL_LOCATOR,
        getLocatorByUserLocation: GET_LOCATOR_BY_USER_LOCATION
    });

    const {
        storesData,
        isLoading,
        currentCitySelected,
        currentDistanceSelected,
        cityData,
        distanceData,
        onSearchSubmit,
        getCurrentLocation,
        isSearchDisable
    } = talonProps;

    const isRtl = false;
    const global_markers = [];

    useEffect(() => {
        const language = isRtl
            ? `&language=ar_SA&country=SA`
            : `&language=en_US&country=US`;

        if (!window.google) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src =
                `https://maps.googleapis.com/maps/api/js?key=` +
                GOOGLE_MAP_API_KEY +
                `&libraries=geometry,places` +
                language;
            script.id = 'googleMaps';
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
            script.addEventListener('load', () => {
                renderMap();
            });
        } else {
            renderMap();
        }
    }, [storesData, currentCitySelected, currentDistanceSelected, isRtl]);

    const codeAddress = useCallback(
        (latlng, add, index, map) => {
            var infowindow = new google.maps.InfoWindow({});
            //! search by lat and lng
            if (!map) {
                var mapNew;
                mapNew = new google.maps.Map(document.getElementById('map'), {
                    ...props,
                    center: {
                        lat: parseFloat(latlng.latitude),
                        lng: parseFloat(latlng.longitude)
                    },
                    streetViewControl: false
                });
                mapNew.setCenter(
                    parseFloat(latlng.latitude),
                    parseFloat(latlng.longitude)
                );
            }

            var trailhead_name = storesData[index].name;
            var trailBody_city = storesData[index].city;
            var trailBody_postCode = storesData[index].postCode;
            var trailBody_address = storesData[index].street;

            var viewOnGoogleMaps = isRtl
                ? `<a id="linkToGoogleMap" target="_blank" href='https://maps.google.com/maps/dir//${
                      latlng.latitude
                  },${latlng.longitude}'>هرض على خرائط جوجل</a></div>`
                : `<a id="linkToGoogleMap" target="_blank" href='https://maps.google.com/maps/dir//${
                      latlng.latitude
                  },${latlng.longitude}'>View on Google maps</a></div>`;

            var contentString =
                `<div class="store-locator-popup"><div style="margin: 0 auto;text-align: center;font-weight: bold;font-size: 20px;">` +
                trailhead_name +
                `</div><div style="font-size: 15px">` +
                trailBody_city +
                `</div><div style="font-size: 15px">` +
                trailBody_postCode +
                `</div><div style="font-size: 15px; margin-bottom: 10px">` +
                trailBody_address +
                `</div>` +
                viewOnGoogleMaps;

            const marker = new google.maps.Marker({
                map: map ? map : mapNew,
                position: {
                    lat: parseFloat(latlng.latitude),
                    lng: parseFloat(latlng.longitude)
                },
                title:
                    'Coordinates: ' +
                    latlng.latitude +
                    ' , ' +
                    latlng.longitude +
                    ' | Trailhead name: ' +
                    trailhead_name
            });

            marker['infowindow'] = contentString;

            global_markers[index] = marker;

            google.maps.event.addListener(
                global_markers[index],
                'click',
                function() {
                    infowindow.setContent(this['infowindow']);
                    infowindow.open(map, this);
                }
            );
            return marker;
        },
        [global_markers, isRtl, props, storesData]
    );

    const onClick = useCallback(
        (lat, lng) => {
            const el = document.getElementById('map');
            if (el) {
                var map = new google.maps.Map(el, {
                    ...props,
                    center: {
                        lat: parseFloat(lat),
                        lng: parseFloat(lng)
                    },
                    zoom: 15,
                    streetViewControl: false
                });
                const markers = storesData.map((marker, index) => {
                    return codeAddress(marker, '', index, map);
                });
                new MarkerClusterer(map, markers, {
                    imagePath:
                        'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
                });
                return map;
            } else {
                return null;
            }
        },
        [codeAddress, props, storesData]
    );

    const renderSearchBar = (
        <div className={classes.searchContainer}>
            <span className={classes.title}>
                <FormattedMessage
                    id={'storeList.title'}
                    defaultMessage={'Store locator'}
                />
            </span>
            <span className={classes.subTitle}>
                <FormattedMessage
                    id={'storeList.subTile'}
                    defaultMessage={
                        'You can add your place and find the store you need'
                    }
                />
            </span>

            <Form onSubmit={onSearchSubmit}>
                <div className={classes.rowView}>
                    <Field
                        classes={
                            mobile
                                ? { rootMobile: classes.fieldItem }
                                : { root: classes.fieldItem }
                        }
                    >
                        <Select
                            field="city"
                            classes={{ input: classes.selectStyle }}
                            initialValue={currentCitySelected}
                            items={cityData}
                            disabled={isSearchDisable}
                        />
                    </Field>
                    <Field
                        classes={
                            mobile
                                ? { rootMobile: classes.fieldItem }
                                : { root: classes.fieldItem }
                        }
                    >
                        <Select
                            field="distinct"
                            classes={{ input: classes.selectStyle }}
                            initialValue={currentDistanceSelected}
                            items={distanceData}
                            disabled={isSearchDisable}
                        />
                    </Field>
                    <Button
                        classes={{ root_highPriority: classes.buttonSearch }}
                        disabled={false}
                        type="submit"
                        priority="high"
                        disabled={isSearchDisable}
                    >
                        <FormattedMessage
                            id={'storeList.search'}
                            defaultMessage={'Default'}
                        />
                    </Button>
                </div>
            </Form>
            <a className={classes.textLink} onClick={getCurrentLocation}>
                <FormattedMessage
                    id={'storeList.myLocation'}
                    defaultMessage={'Default'}
                />
            </a>
        </div>
    );

    const renderMap = useCallback(() => {
        const el = document.getElementById('map');
        if (el) {
            var map = new google.maps.Map(el, {
                ...props,
                zoom: mobile ? 5 : 6,
                streetViewControl: false
            });
            const markers = storesData.map((marker, index) => {
                return codeAddress(marker, '', index, map);
            });
            new MarkerClusterer(map, markers, {
                imagePath:
                    'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
            });
            return map;
        } else {
            return null;
        }
    }, [codeAddress, mobile, props, storesData]);

    const idHeaderPanel =
        currentCitySelected !== 'All' && currentDistanceSelected !== 'All'
            ? 'storeList.hintDistance'
            : currentCitySelected !== 'All'
            ? 'storeList.hintDistanceCityOnly'
            : currentDistanceSelected !== 'All'
            ? 'storeList.hintDistanceOnly'
            : 'storeList.hintAllStore';

    const headerPanel = formatMessage(
        {
            id: idHeaderPanel,
            defaultMessage: 'All store'
        },
        {
            cityName: currentCitySelected,
            distance: currentDistanceSelected
        }
    );

    return (
        <>
            <div className={classes.root}>
                {renderSearchBar}
                <div className={classes.content}>
                    <span className={classes.headerPanel}>{headerPanel}</span>
                    <div className={classes.storesContainer}>
                        <div id="panel" className={classes.panel}>
                            {storesData &&
                                storesData.map((marker, index) => {
                                    return (
                                        <ItemMap
                                            key={index}
                                            index={index}
                                            data={marker}
                                            onClick={() =>
                                                onClick(
                                                    marker.latitude,
                                                    marker.longitude
                                                )
                                            }
                                        />
                                    );
                                })}
                        </div>
                        <div id="map" className={classes.map} />
                    </div>
                </div>
                {isLoading && (
                    <div className={classes.modal_active}>
                        <LoadingIndicator global={true}>
                            <FormattedMessage
                                id={'productFullDetail.loading'}
                                defaultMessage={'Loading ...'}
                            />
                        </LoadingIndicator>
                    </div>
                )}
            </div>
        </>
    );
};

export default StoreList;

StoreList.propTypes = {
    center: shape({
        lat: number,
        lng: number
    }),
    zoom: number
};

StoreList.defaultProps = {
    center: {
        lat: 24.507333,
        lng: 45.923007
    },
    zoom: 10
};
