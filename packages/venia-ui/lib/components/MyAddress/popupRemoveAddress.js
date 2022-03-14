import React from 'react';
import ReactModal from 'react-modal';
import { FormattedMessage } from 'react-intl';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import Button from '@magento/venia-ui/lib/components/Button/button';
import FormError from '../FormError';

import defaultClasses from './myAddressItem.css';

const Popup = props => {
    const {
        showModal,
        formErrors,
        handleCloseModal,
        onConfirmDelete,
        isDeletingCustomerAddress
    } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const [{ mobile, tablet }] = useAppContext();

    const customStyles = {
        overlay: {
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
        },
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: mobile ? '15px' : '30px',
            maxHeight: '215px',
            width: mobile || tablet ? '100%' : 'auto',
            height: mobile ? '100%' : 'auto'
        }
    };

    return (
        <ReactModal
            isOpen={showModal}
            style={customStyles}
            shouldCloseOnOverlayClick={true}
            contentLabel="Remove Address Popup"
            ariaHideApp={false}
            onRequestClose={handleCloseModal}
            overlayClassName={classes.overlay}
        >
            <div className={classes.confirmDeleteContainer}>
                <h4 className={classes.titlePopup}>
                    <FormattedMessage
                        id={'accountInformationPage.addressDeleteTitle'}
                        defaultMessage={
                            'Are you sure you want to delete this address from the list?'
                        }
                    />
                </h4>
                <FormError
                    classes={{ root: classes.errorContainer }}
                    errors={Array.from(formErrors.values())}
                />
                <div className={classes.btnAction}>
                    <Button
                        classes={{
                            root_normalPriorityNegative: classes.btnDelete
                        }}
                        disabled={isDeletingCustomerAddress}
                        priority="normal"
                        type="button"
                        negative={true}
                        onClick={onConfirmDelete}
                    >
                        <FormattedMessage
                            id={'global.deleteButton'}
                            defaultMessage={'Delete'}
                        />
                    </Button>
                    <Button
                        classes={{ root_lowPriority: classes.btnCancel }}
                        disabled={isDeletingCustomerAddress}
                        priority="low"
                        type="button"
                        onClick={handleCloseModal}
                    >
                        <FormattedMessage
                            id={'global.cancelButton'}
                            defaultMessage={'Cancel'}
                        />
                    </Button>
                </div>
            </div>
        </ReactModal>
    );
};

export default Popup;
