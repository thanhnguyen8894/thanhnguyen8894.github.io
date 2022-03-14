import { gql } from '@apollo/client';

export const CHECK_EMAIL_AVAILABLE = gql`
    query checkEmailAvailable($email: String!) {
        isEmailAvailable(email: $email) {
            is_email_available
        }
    }
`;

export default {
    checkEmailAvailableQuery: CHECK_EMAIL_AVAILABLE
}