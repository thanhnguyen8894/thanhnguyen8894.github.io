/**
 *  Fuctions to check if config product had all variants are out of stock
 * @param {*} product items need to check out of stock with all variants
 * @returns {boolean} true if all variants are out of stock
 */
export const isOutOfStockAllVariants = product => {
    return (
        product?.variants?.every(({ product }) => product?.salable_qty <= 0) ||
        product?.stock_status === 'OUT_OF_STOCK' ||
        false
    );
};
