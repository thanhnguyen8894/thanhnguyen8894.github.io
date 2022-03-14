import { gql } from '@apollo/client';

import { CartPageFragment } from '../CartPage/cartPageFragments.gql';

export const GET_CART_DETAILS_QUERY = gql`
    query GetCartDetailsAfterSignIn($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...CartPageFragment
        }
    }
    ${CartPageFragment}
`;
