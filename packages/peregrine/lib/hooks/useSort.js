import { useEffect, useMemo, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useIntl } from 'react-intl';

//Redux
import { useAppContext } from '@magento/peregrine/lib/context/app';

const GET_DEFAULT_SORT_CATEGORY = gql`
    query getDefaultSortCategory($id: Int!) {
        category(id: $id) {
            id
            default_sort_by
            default_sort_direction
        }
    }
`;

const DEFAULT_SORT = 'price';

const SORT_ATTRIBUTE = [
    {
        value: 'position',
        label: 'translateFE.sort.position'
    },
    {
        value: 'name',
        label: 'translateFE.sort.name'
    },
    {
        value: 'price',
        label: 'translateFE.sort.price'
    },
    {
        value: 'manufacturer',
        label: 'translateFE.sort.manufacturer'
    },
    {
        value: 'newest',
        label: 'translateFE.sort.newest'
    },
    {
        value: 'discount',
        label: 'translateFE.sort.discount'
    }
];

export const useSort = props => {
    const { idCategory } = props;
    const [{ storeConfig }] = useAppContext();
    const { formatMessage } = useIntl();
    const { data: filterCategory } = useQuery(GET_DEFAULT_SORT_CATEGORY, {
        variables: { id: idCategory },
        fetchPolicy: 'no-cache'
    });

    const { catalog_default_sort_by } = storeConfig || {};
    const { default_sort_by, default_sort_direction } =
        filterCategory?.category || {};

    //*priority: sort in category -> sort in config store -> default sort
    const attribute =
        default_sort_by || catalog_default_sort_by || DEFAULT_SORT;

    //TODO: should remove later when BE can translate text
    const _sortText = useMemo(() => {
        return SORT_ATTRIBUTE.find(item => item.value.includes(attribute))
            ?.label;
    }, [attribute]);

    const defaultSort = useMemo(() => {
        return {
            sortText: _sortText
                ? formatMessage({
                      id: _sortText,
                      defaultMessage: _sortText
                  })
                : attribute,
            sortAttribute: attribute,
            isDESC: default_sort_direction?.includes('desc')
        };
    }, [_sortText, attribute, default_sort_direction, formatMessage]);

    const [currentSort, setSort] = useState(defaultSort);

    useEffect(() => {
        if (
            default_sort_by !== DEFAULT_SORT ||
            catalog_default_sort_by !== DEFAULT_SORT
        ) {
            setSort(defaultSort);
        }
    }, [catalog_default_sort_by, defaultSort, default_sort_by]);

    return {
        setSort,
        currentSort
    };
};
