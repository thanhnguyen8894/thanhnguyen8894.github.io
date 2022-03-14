import React, { Fragment } from 'react';
import ReactModal from 'react-modal';
import { FormattedMessage } from 'react-intl';

import { useAppContext } from '@magento/peregrine/lib/context/app';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { X as CloseIcon } from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import Image from '@magento/venia-ui/lib/components/Image';
import Price from '@magento/venia-ui/lib/components/Price';
import Button from '@magento/venia-ui/lib/components/Button';
import { fullPageLoadingIndicator } from '@magento/venia-ui/lib/components/LoadingIndicator';
import defaultClasses from './popupFreeGifts.css';

const PopupFreeGifts = props => {
    const [{ mobile, tablet }] = useAppContext();
    const {
        isLoading,
        freeGifts,
        showModal,
        onAddToCart,
        setShowModal,
        resultAddToCart
    } = props;
    const classes = mergeClasses(defaultClasses, props.classes);

    const { message, status } = resultAddToCart || {};

    const handleAdd = uid => {
        onAddToCart(uid);
        setShowModal(!status);
    };

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
            padding: mobile ? '10px' : '30px',
            width: mobile ? '100%' : 'auto',
            transform: 'translate(-50%, -50%)'
        }
    };

    const elementFreeGifts =
        freeGifts.length > 0 &&
        freeGifts?.map((freeGifts, index) => {
            const renderItem = freeGifts?.gifts.map(freeGift => {
                const { item, qty, hidden } = freeGift;
                if(hidden) return;
                const {
                    id,
                    uid,
                    name,
                    price,
                    small_image: { url }
                } = item || {};
                const currencyPrice = price?.regularPrice?.amount?.currency;
                const valuePrice = price?.regularPrice?.amount?.value;
                return (
                    <div key={id} className={classes.itemContainer}>
                        <Image
                            alt={name}
                            classes={{
                                container: classes.containerImage,
                                imageStyle: classes.imageStyle
                            }}
                            width={mobile ? 150 : 200}
                            height={mobile ? 150 : 200}
                            src={url}
                        />
                        <div className={classes.name}>{name}</div>
                        <div className={classes.oldPrice}>
                            <Price
                                value={valuePrice}
                                currencyCode={currencyPrice}
                            />
                        </div>
                        <div className={classes.discountPrice}>
                            <Price value={0} currencyCode={currencyPrice} />
                        </div>
                        <Button
                            priority="high"
                            onClick={() => handleAdd(uid)}
                            disabled={qty == 0}
                        >
                            <FormattedMessage
                                id={'global.addButton'}
                                defaultMessage={'Add'}
                            />
                        </Button>
                    </div>
                );
            });

            return <Fragment key={index}>{renderItem}</Fragment>;
        });

    return (
        <ReactModal
            isOpen={showModal}
            style={customStyles}
            shouldCloseOnOverlayClick={true}
            ariaHideApp={false}
            onRequestClose={() => setShowModal(false)}
        >
            <div
                className={`${classes.root}
                ${mobile && classes.rootMobile}
                ${tablet && classes.rootTablet}`}
            >
                <div className={classes.heading}>
                    <span className={classes.titleModal}>
                        <FormattedMessage
                            id={'cartPage.freeGifts'}
                            defaultMessage={'FREE GIFTS'}
                        />
                    </span>
                    <button
                        className={classes.closeButton}
                        onClick={() => setShowModal(false)}
                    >
                        <Icon src={CloseIcon} />
                    </button>
                </div>
                {!status && <p className={classes.errorMessage}>{message}</p>}
                {elementFreeGifts ? (
                    <div className={classes.container}>{elementFreeGifts}</div>
                ) : (
                    <div className={classes.noFreeGifts}>
                        <FormattedMessage
                            id={'cartPage.notFreeGifts'}
                            defaultMessage={
                                'Sorry! This product does not have any freebies'
                            }
                        />
                    </div>
                )}
            </div>
            {isLoading && fullPageLoadingIndicator}
        </ReactModal>
    );
};

export default PopupFreeGifts;
