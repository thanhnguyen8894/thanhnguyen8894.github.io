import Geocode from 'react-geocode';
import { GOOGLE_MAP_API_KEY } from '@magento/venia-ui/lib/constants/constants';

Geocode.setApiKey(GOOGLE_MAP_API_KEY);

export const toLatLng = async address => {
    const response = await Geocode.fromAddress(address);

    if (response && response.results && response.results.length > 0) {
        const { lat, lng } = response.results[0].geometry.location;

        return {
            lat,
            lng
        };
    }

    return {
        lat: 0,
        lng: 0
    };
};

const cityCondition = ['locality', 'political'];
const districtCondition = ['political', 'sublocality', 'sublocality_level_1'];

function arraysEqual(a1, a2) {
    /* WARNING: arrays must not contain {objects} or behavior may be undefined */
    return JSON.stringify(a1) === JSON.stringify(a2);
}

export const toAddress = async ({ lat, lng }) => {
    const response = await Geocode.fromLatLng(`${lat}`, `${lng}`);

    if (response && response.results && response.results.length > 0) {
        const result = response.results[0];

        if (result) {
            const addressComponents = result.address_components;
            const address = result.formatted_address;
            let administrativeArea1 = '';
            let administrativeArea2 = '';
            let locality = '';
            let postCode = '';
            let country = '';

            let street_number = '';
            let route = '';

            for (const item of addressComponents) {
                if (arraysEqual(item.types, cityCondition)) {
                    administrativeArea1 = item.long_name;
                } else if (arraysEqual(item.types, districtCondition)) {
                    administrativeArea2 = item.long_name;
                } else if (item.types.includes('locality')) {
                    locality = item.long_name;
                } else if (item.types.includes('postal_code')) {
                    postCode = item.long_name;
                } else if (item.types.includes('country')) {
                    country = item.short_name;
                } else if (item.types.includes('street_number')) {
                    street_number = item.long_name;
                } else if (item.types.includes('route')) {
                    route = item.long_name;
                }
            }

            const _address = `${street_number} ${route}`.trim();

            return {
                country: country,
                address: _address || administrativeArea2,
                city: administrativeArea1,
                district: administrativeArea2,
                estAddress: locality,
                postCode: postCode
            };
        }
    }
};

export const flattenData = data => {
    if (!data) return {};

    const { cart } = data || {};
    const { prices, applied_gift_cards, shipping_addresses } = cart || {};
    const {
        subtotal_including_tax,
        subtotal_excluding_tax,
        grand_total,
        discounts,
        applied_taxes,
        cash_on_delivery_fee
    } = prices || {};

    return {
        subtotal: subtotal_including_tax,
        subtotalEx: subtotal_excluding_tax,
        total: grand_total,
        discounts: discounts,
        giftCards: applied_gift_cards,
        taxes: applied_taxes,
        shipping: shipping_addresses,
        codFee: cash_on_delivery_fee
    };
};

export const splitFullname = fullname => {
    if (!fullname) return { firstname: '', lastname: '' };
    const lastname = fullname
        .trim()
        .split(' ')
        .slice(-1)
        .join(' ');
    const firstname =
        fullname
            .trim()
            .split(' ')
            .slice(0, -1)
            .join(' ') || lastname;
    return { firstname, lastname };
};
