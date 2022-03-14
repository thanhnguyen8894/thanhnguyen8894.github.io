import { gql } from '@apollo/client';

export const AccountInformationPageFragment = gql`
    fragment AccountInformationPageFragment on Customer {
        id
        firstname
        lastname
        email
        gender
        date_of_birth
        customer_mobile
        addresses {
            id
            firstname
            lastname
            region {
                region
                region_code
            }
            country_code
            street
            telephone
            postcode
            city
            default_shipping
            default_billing
        }
        wallet_email_status
        wallet_credit
    }
`;
