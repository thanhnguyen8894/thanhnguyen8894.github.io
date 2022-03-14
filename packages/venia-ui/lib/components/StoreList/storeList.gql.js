import { gql } from '@apollo/client';

export const GET_ALL_LOCATOR = gql`
    query getListStoreLocator {
        getListStoreLocator {
            retailer_id
            name
            longitude
            latitude
            address
            postCode
            image
            city
            street
            phone
            work_time
        }
    }
`;

export const GET_LOCATOR_BY_USER_LOCATION = gql`
    query getListStoreLocator($longitude: Float!, $latitude: Float!) {
        getListStoreLocator(longitude: $longitude, latitude: $latitude) {
            retailer_id
            name
            longitude
            latitude
            address
            postCode
            image
            city
            street
            distance
            phone
            work_time
        }
    }
`;
