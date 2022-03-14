import { gql } from '@apollo/client';

import { DiscountSummaryFragment } from './discountSummary.gql';
import { GiftCardSummaryFragment } from './queries/giftCardSummary';
import { ShippingSummaryFragment } from './shippingSummary.gql';
import { TaxSummaryFragment } from './taxSummary.gql';
import { CashOnDeliveryFeeFragment } from './codFeeFragment.gql';

export const GrandTotalFragment = gql`
    fragment GrandTotalFragment on CartPrices {
        grand_total {
            currency
            value
        }
    }
`;

export const PriceSummaryFragment = gql`
    fragment PriceSummaryFragment on Cart {
        id
        items {
            id
            quantity
        }
        ...ShippingSummaryFragment
        prices {
            ...TaxSummaryFragment
            ...DiscountSummaryFragment
            ...GrandTotalFragment
            subtotal_excluding_tax {
                currency
                value
            }
            subtotal_including_tax {
                currency
                value
            }
            ...CashOnDeliveryFeeFragment
        }
        ...GiftCardSummaryFragment
    }
    ${DiscountSummaryFragment}
    ${GiftCardSummaryFragment}
    ${GrandTotalFragment}
    ${ShippingSummaryFragment}
    ${TaxSummaryFragment}
    ${CashOnDeliveryFeeFragment}
`;
