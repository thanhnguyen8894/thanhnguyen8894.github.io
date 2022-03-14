import React, { useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';
export { default as HeadProvider } from './headProvider';
import { Helmet } from 'react-helmet-async';
import { useAppContext } from '@magento/peregrine/lib/context/app';
Helmet.defaultProps.defer = false;

export const Link = props => {
    const { children, ...tagProps } = props;
    return (
        <Helmet>
            <link {...tagProps}>{children}</link>
        </Helmet>
    );
};

export const Meta = props => {
    const { children, ...tagProps } = props;
    return (
        <Helmet>
            <meta {...tagProps}>{children}</meta>
        </Helmet>
    );
};

export const Style = props => {
    const { children, ...tagProps } = props;
    return (
        <Helmet>
            <style {...tagProps}>{children}</style>
        </Helmet>
    );
};

export const Title = props => {
    const { children, ...tagProps } = props;
    return (
        <Helmet>
            <title {...tagProps}>{children}</title>
        </Helmet>
    );
};

export const StoreTitle = props => {
    const { children, ...tagProps } = props;
    const [{ storeConfig }] = useAppContext();

    const storeName = useMemo(() => {
        return storeConfig ? storeConfig.store_name : STORE_NAME;
    }, [storeConfig]);

    let titleText;
    if (children) {
        titleText = `${children} - ARABIAN OUD`;
    } else {
        titleText = 'ARABIAN OUD';
    }

    return (
        <Helmet>
            <title {...tagProps}>{titleText}</title>
        </Helmet>
    );
};
