/**
 * @param {Product} Product
 *
 * @returns {Location} Position of Banner
 */
const bannerLocation = product => {
    const { location } = product;
    switch (location) {
        case 1:
            return 'left';
        case 2:
            return 'center';
        case 3:
            return 'right';
        default:
            return null;
    }
};

export default bannerLocation;
