import gql from 'graphql-tag';

export const CREATE_CART = gql`
    mutation createCart {
        cartId: createEmptyCart
    }
`;
