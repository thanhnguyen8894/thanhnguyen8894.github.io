import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useUserContext } from '../../context/user';
import { useAppContext } from '../../context/app';

export const useAccountInformationPage = props => {
    const {
        mutations: {
            setCustomerInformationMutation,
            changeCustomerPasswordMutation,
            createCustomerAddressMutation,
            updateCustomerAddressMutation
        },
        queries: { getCustomerInformationQuery, getStoreConfigData }
    } = props;

    const [{ isSignedIn }] = useUserContext();
    const [{ storeConfig }] = useAppContext();

    const [shouldShowNewPassword, setShouldShowNewPassword] = useState(false);
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [disabledForm, setDisabledForm] = useState({
        informationPrivate: true,
        contact: true,
        address: true
    });

    const [dob, updateDob] = useState();
    // Use local state to determine whether to display errors or not.
    // Could be replaced by a "reset mutation" function from apollo client.
    // https://github.com/apollographql/apollo-feature-requests/issues/170
    const [displayError, setDisplayError] = useState(false);

    const { data: accountInformationData, error: loadDataError } = useQuery(
        getCustomerInformationQuery,
        {
            skip: !isSignedIn,
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first'
        }
    );

    const { data: getStoreConfig, error: getStoreConfigError } = useQuery(
        getStoreConfigData,
        {
            skip: !isSignedIn,
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first'
        }
    );

    const [
        setCustomerInformation,
        {
            error: customerInformationUpdateError,
            loading: isUpdatingCustomerInformation
        }
    ] = useMutation(setCustomerInformationMutation);

    const [
        changeCustomerPassword,
        {
            error: customerPasswordChangeError,
            loading: isChangingCustomerPassword
        }
    ] = useMutation(changeCustomerPasswordMutation);

    const [
        createCustomerAddress,
        {
            error: createCustomerAddressError,
            loading: createCustomerAddressLoading
        }
    ] = useMutation(createCustomerAddressMutation);

    const [
        updateCustomerAddress,
        {
            error: updateCustomerAddressError,
            loading: isUpdatingCustomerAddress
        }
    ] = useMutation(updateCustomerAddressMutation);

    const initialValues = useMemo(() => {
        if (accountInformationData) {
            return { customer: accountInformationData.customer };
        }
    }, [accountInformationData]);

    //Check wallet feature is enable or not
    const isWalletEnable = useMemo(() => {
        const { storeConfig } = getStoreConfig || {};
        const { walletreward_wallet_status } = storeConfig || {};
        if (walletreward_wallet_status && walletreward_wallet_status === '1') {
            return true;
        }
        return false;
    }, [getStoreConfig]);

    const countryCode = useMemo(() => {
        return storeConfig?.default_country_code || 'SA';
    }, [storeConfig]);

    useEffect(() => {
        updateDob(initialValues?.customer?.date_of_birth)
    }, [initialValues])
    
    const customer = initialValues && initialValues.customer;
    const addresses = customer && customer.addresses;
    const filterAddress =
        addresses &&
        addresses.filter(({ default_shipping }) => default_shipping === true);

    const addressDefault = useMemo(() => {
        if (filterAddress) {
            return { address_default: filterAddress };
        }
    }, [filterAddress]);

    const handleChangePassword = useCallback(() => {
        setShouldShowNewPassword(true);
    }, [setShouldShowNewPassword]);

    const handleCancel = useCallback(() => {
        setIsUpdateMode(false);
        setShouldShowNewPassword(false);
    }, [setIsUpdateMode]);

    const showUpdateMode = useCallback(() => {
        setIsUpdateMode(true);

        // If there were errors from removing/updating info, hide them
        // when we open the modal.
        setDisplayError(false);
    }, [setIsUpdateMode]);

    const onEditForm = useCallback(
        nameEdit => {
            if (!isBusy) {
                const newDisabledForm = { ...disabledForm };
                newDisabledForm[nameEdit] = false;
                setDisabledForm(newDisabledForm);
                setIsBusy(true);
            }
        },
        [disabledForm, setDisabledForm, isBusy]
    );

    const handleSubmit = useCallback(
        async formData => {
            try {
                setIsBusy(false);
                const { customer, address_default } = formData;
                const { firstname, lastname, gender, date_of_birth } =
                    customer || {};
                if (address_default) {
                    const {
                        city,
                        region: { region },
                        street,
                        postcode
                    } = address_default[0];
                    if (filterAddress.length === 0) {
                        createCustomerAddress({
                            variables: {
                                firstname:
                                    accountInformationData.customer.firstname,
                                lastname:
                                    accountInformationData.customer.lastname,
                                city: city,
                                region: region,
                                regionCode: region,
                                countryCode,
                                street: street[0],
                                telephone:
                                    accountInformationData.customer
                                        .customer_mobile,
                                postcode: postcode,
                                defaultShipping: true,
                                defaultBilling: true
                            },
                            refetchQueries: [
                                { query: getCustomerInformationQuery }
                            ]
                        });
                    } else {
                        await updateCustomerAddress({
                            variables: {
                                id: addressDefault.address_default[0].id,
                                city: city,
                                firstname: firstname,
                                lastname: lastname,
                                region: region,
                                regionCode: region,
                                countryCode,
                                street: street[0],
                                telephone:
                                    accountInformationData.customer
                                        .customer_mobile,
                                postcode: postcode
                            }
                        });
                    }
                } else {
                    await setCustomerInformation({
                        variables: {
                            customerInput: {
                                firstname,
                                lastname,
                                gender,
                                date_of_birth: dob
                            }
                        }
                    });
                }
                setDisabledForm({
                    informationPrivate: true,
                    contact: true,
                    address: true
                });
            } catch {
                // Make sure any errors from the mutation are displayed.
                setDisplayError(true);

                // we have an onError link that logs errors, and FormError
                // already renders this error, so just return to avoid
                // triggering the success callback
                return;
            }
        },
        [
            dob,
            initialValues,
            accountInformationData,
            setCustomerInformation,
            updateCustomerAddress,
            createCustomerAddress
        ]
    );

    const errors = displayError
        ? [
              customerInformationUpdateError,
              customerPasswordChangeError,
              createCustomerAddressError,
              updateCustomerAddressError,
              getStoreConfigError
          ]
        : [];

    return {
        isBusy,
        isWalletEnable,
        customer,
        setIsBusy,
        isSignedIn,
        onEditForm,
        isUpdateMode,
        disabledForm,
        handleCancel,
        handleSubmit,
        loadDataError,
        initialValues,
        addressDefault,
        showUpdateMode,
        setDisabledForm,
        formErrors: errors,
        handleChangePassword,
        shouldShowNewPassword,
        isDisabled:
            isUpdatingCustomerInformation ||
            isChangingCustomerPassword ||
            createCustomerAddressLoading ||
            isUpdatingCustomerAddress,
        dob,
        updateDob
    };
};
