import { gql } from '@apollo/client';

export const SUBMIT_CONTACT_US = gql`
    mutation submitContactUs(
        $name: String!
        $email: String!
        $telephone: String!
        $comment: String!
    ) {
        submitContactUs(
            input: {
                name: $name
                email: $email
                telephone: $telephone
                comment: $comment
            }
        ) @connection(key: "submitContactUs") {
            status
            message
        }
    }
`;
