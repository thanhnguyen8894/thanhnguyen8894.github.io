import { useMemo } from 'react';

export const useStockStatusMessage = props => {
    const { cartItems } = props;

    const hasOutOfStockItem = useMemo(() => {
        if (cartItems) {
            const isOutOfStock = cartItems?.filter(Boolean)?.find(cartItem => {
                const { product } = cartItem;
                const {
                    stock_status: stockStatus,
                    qty_salable: qtySalable
                } = product;

                return stockStatus === 'OUT_OF_STOCK' || qtySalable <= 0;
            });

            return !!isOutOfStock;
        }
    }, [cartItems]);

    return { hasOutOfStockItem };
};
