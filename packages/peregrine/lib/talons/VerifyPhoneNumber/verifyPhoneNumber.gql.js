import { gql } from '@apollo/client';

export const CHECK_MOBILE_EXIST = gql`
    mutation checkMobileExist($mobile: String!) {
        checkMobileExist(
            mobile: $mobile
        ) {
            status
        }
    }
`;

export default {
    checkMobileExistMutation: CHECK_MOBILE_EXIST
};
