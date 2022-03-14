import React from 'react';
import { FormattedMessage } from 'react-intl';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import PopupRemoveAddress from './popupRemoveAddress';

import editIcon from '@magento/venia-ui/venia-static/icons/pen.png';
import deleteIcon from '@magento/venia-ui/venia-static/icons/delete.png';

import defaultClasses from './myAddressItem.css';

const MyAddressItem = props => {
    const classes = mergeClasses(defaultClasses, props.classes);

    const {
        data,
        isConfirmingDelete,
        isDeletingCustomerAddress,
        showModal,
        formErrors,
        setShowModal,
        onCancelDelete,
        onConfirmDelete,
        onEdit,
        onDelete
    } = props;

    const {
        firstname,
        middlename = '',
        lastname,
        city,
        region: { region },
        street,
        postcode
    } = data;

    const nameString = [firstname, middlename, lastname]
        .filter(name => !!name)
        .join(' ');

    return (
        <div className={classes.root}>
            <div className={classes.address}>
                <FormattedMessage
                    id={'myAddress.address'}
                    defaultMessage={'Address'}
                />
            </div>
            <p className={classes.userName}>{nameString}</p>
            <div className={classes.inforContainer}>
                <p className={classes.text}>{city}</p>
                <p className={classes.text}>{region}</p>
                <p className={classes.text}>{street[0]}</p>
                <p className={classes.text}>{postcode}</p>
            </div>
            <div className={classes.btnBlock}>
                <div className={classes.btnContent} onClick={onEdit} aria-hidden="true">
                    <img src={editIcon} alt="icon edit" />
                    <span className={classes.btnText}>
                        <FormattedMessage
                            id={'myAddress.edit'}
                            defaultMessage={'Edit'}
                        />
                    </span>
                </div>
                <div className={classes.btnContent} onClick={onDelete} aria-hidden="true">
                    <img src={deleteIcon} alt="icon delete" />
                    <span className={classes.btnText}>
                        <FormattedMessage
                            id={'myAddress.delete'}
                            defaultMessage={'Delete'}
                        />
                    </span>
                </div>
                <PopupRemoveAddress
                    showModal={showModal}
                    formErrors={formErrors}
                    handleCloseModal={() => setShowModal(false)}
                    onCancelDelete={onCancelDelete}
                    onConfirmDelete={onConfirmDelete}
                    isConfirmingDelete={isConfirmingDelete}
                    isDeletingCustomerAddress={isDeletingCustomerAddress}
                />
            </div>
        </div>
    );
};

export default MyAddressItem;
