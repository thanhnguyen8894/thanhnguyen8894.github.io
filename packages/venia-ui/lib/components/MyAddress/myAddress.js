import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import { useAddressBookPage } from '@magento/peregrine/lib/talons/AddressBookPage/useAddressBookPage';
import MyAddressItem from './myAddressItem';
import { mergeClasses } from '../../classify';
import { fullPageLoadingIndicator } from '@magento/venia-ui/lib/components/LoadingIndicator';
import AddEditDialog from '../AddressBookPage/addEditDialog';

import defaultClasses from './myAddress.css';
import addIcon from '@magento/venia-ui/venia-static/icons/plus.svg';

const MyAddress = (props) => {
    const [{ mobile, tablet }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);

    const talonProps = useAddressBookPage();
    const {
        confirmDeleteAddressId,
        customerAddresses,
        formErrors,
        formProps,
        handleAddAddress,
        handleCancelDeleteAddress,
        handleCancelDialog,
        handleConfirmDeleteAddress,
        handleConfirmDialog,
        handleDeleteAddress,
        handleEditAddress,
        showModalRemove,
        setShowModalRemove,
        isDeletingCustomerAddress,
        isDialogBusy,
        isDialogEditMode,
        isDialogOpen,
        isLoading
    } = talonProps;

    if (isLoading) {
        return fullPageLoadingIndicator;
    }

    const content = Array.from(customerAddresses).map((address) => {
        const boundEdit = () => handleEditAddress(address);
        const boundDelete = () => handleDeleteAddress(address.id);
        const isConfirmingDelete =
                confirmDeleteAddressId === address.id;
        return (
            <MyAddressItem
                key={address.id}
                data={address}
                formErrors={formErrors}
                isConfirmingDelete={isConfirmingDelete}
                isDeletingCustomerAddress={isDeletingCustomerAddress}
                onCancelDelete={handleCancelDeleteAddress}
                onConfirmDelete={handleConfirmDeleteAddress}
                showModal={showModalRemove}
                setShowModal={setShowModalRemove}
                onDelete={boundDelete}
                onEdit={boundEdit}
            />
        );
    });

    return (
        <div className={
            mobile
                ? classes.rootMobile
                : tablet
                    ? classes.rootTablet
                    : classes.root
        }>
            <h2 className={classes.title}>
                <FormattedMessage
                    id={'myAddress.title'}
                    defaultMessage={'MY ADDRESSES'}
                />
            </h2>
            <h4 className={classes.subTitle}>
                <FormattedMessage
                    id={'myAddress.text'}
                    defaultMessage={'You can add and update address here'}
                />
            </h4>
            <div className={classes.main}>
                <div className={classes.contentAddress}>
                    {content}
                    <div className={classes.addNewAddress} onClick={handleAddAddress}>
                        <div className={classes.addImg}>
                            <img src={addIcon} alt="icon add"/>
                        </div>
                        <div className={classes.addText}>
                            <FormattedMessage
                                id={'myAddress.addNew'}
                                defaultMessage={'Add a new address'}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <AddEditDialog
                formErrors={formErrors}
                formProps={formProps}
                isBusy={isDialogBusy}
                isEditMode={isDialogEditMode}
                isOpen={isDialogOpen}
                onCancel={handleCancelDialog}
                onConfirm={handleConfirmDialog}
            />
        </div>
    );
}

export default MyAddress;