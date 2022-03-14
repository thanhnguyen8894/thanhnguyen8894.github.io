import React, { useState } from 'react';
import { Redirect } from '@magento/venia-drivers';
import ReactModal from 'react-modal';

import { fullPageLoadingIndicator } from '../LoadingIndicator';
import SendToFriendPage from './components/sendToFriend';
import InviteFriendPage from './components/inviteFriend';
import BuyCreditPage from './components/buyCredit';
import WithdrawCreditPage from './components/withdrawCredit';
import WalletProfilePage from './components/walletProfile';

import { useMyWallet } from '@magento/peregrine/lib/talons/MyWallet/useMyWallet';
import { useAppContext } from '@magento/peregrine/lib/context/app';
import MyWalletOperations from './myWallet.gql';

import defaultClasses from './myWallet.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';

export const WALLET_MODE = {
    MY_WALLET: 'MY_WALLET',
    SEND_TO_FRIEND: 'SEND_TO_FRIEND',
    INVITE_FRIEND: 'INVITE_FRIEND',
    WITHDRAW_CREDIT: 'WITHDRAW_CREDIT',
    BUY_CREDIT: 'BUY_CREDIT'
};

const MyWalletPage = props => {
    const [{ mobile }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);
    const { getStoreConfig } = props;

    const { storeConfig } = getStoreConfig;
    const {
        walletreward_reward_earn_reward_invited_friend_registration_enable: walletInviteFriend,
        walletreward_wallet_withdraw_allow_withdrawal: walletAllowWithdrawal,
        walletreward_wallet_withdraw_sendtofriend_allow_send_credit: walletAllowSendCredit,
        walletreward_wallet_withdraw_min_withdraw: walletMinWithdraw,
        walletreward_wallet_credit_usages_buy_credite: walletBuyCredit
    } = storeConfig;

    const [currentMode, setCurrentMode] = useState(WALLET_MODE.MY_WALLET);

    const talonProps = useMyWallet({
        ...MyWalletOperations,
        walletMinWithdraw
    });

    const {
        customer,
        isSignedIn,
        isLoading,
        errorMessage,
        succesMessage,
        transHistoryData,
        withdrawHistoryData,
        walletRewardEmailSubsData,
        onCloseErrorModal,
        onCloseSuccessModal,
        onSendWalletRewardCreditToFriend,
        onWalletRewardInviteFriend,
        onWalletRewardWithdrawCredit,
        onWalletRewardBuyCredit,
        onUpdateWalletRewardEmailSubs
    } = talonProps;

    if (!isSignedIn) {
        return <Redirect to="/" />;
    }

    // MY_WALLET
    const myWallet = (
        <WalletProfilePage
            customer={customer}
            walletRewardEmailSubsData={walletRewardEmailSubsData}
            transHistoryData={transHistoryData}
            onActionPress={action => {
                setCurrentMode(action);
            }}
            onUpdateWalletRewardEmailSubs={onUpdateWalletRewardEmailSubs}
            storeConfig={storeConfig}
        />
    );

    // SEND_TO_FRIEND
    const sendToFriend = walletAllowSendCredit === '1' && (
        <SendToFriendPage
            backPress={() => setCurrentMode(WALLET_MODE.MY_WALLET)}
            submitPress={value => {
                onSendWalletRewardCreditToFriend(value);
            }}
        />
    );

    // INVITE_FRIEND
    const inviteFriend = walletInviteFriend === '1' && (
        <InviteFriendPage
            backPress={() => setCurrentMode(WALLET_MODE.MY_WALLET)}
            submitPress={value => {
                onWalletRewardInviteFriend(value);
            }}
        />
    );

    // BUY_CREDIT
    const buyCredit = walletBuyCredit === '1' && (
        <BuyCreditPage
            backPress={() => setCurrentMode(WALLET_MODE.MY_WALLET)}
            submitPress={value => {
                onWalletRewardBuyCredit(value);
            }}
        />
    );

    // WITHDRAW_CREDIT
    const withdrawCredit = walletAllowWithdrawal === '1' && (
        <WithdrawCreditPage
            customer={customer}
            withdrawHistoryData={withdrawHistoryData}
            backPress={() => setCurrentMode(WALLET_MODE.MY_WALLET)}
            submitPress={value => {
                onWalletRewardWithdrawCredit(value);
            }}
        />
    );

    // MESSAGE POPUP
    const customStyles = {
        overlay: {
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
        },
        content: {
            top: '50%',
            left: '50%',
            right: mobile ? '20%' : 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)'
        }
    };

    const successMessageModal = (
        <ReactModal
            isOpen={succesMessage ? true : false}
            style={customStyles}
            shouldCloseOnOverlayClick={true}
            contentLabel=""
            ariaHideApp={false}
            onRequestClose={() => {
                setCurrentMode(WALLET_MODE.MY_WALLET);
                onCloseSuccessModal && onCloseSuccessModal();
            }}
        >
            <span className={classes.successMessage}>
                {succesMessage || ''}
            </span>
        </ReactModal>
    );

    const errorMessageModal = (
        <ReactModal
            isOpen={errorMessage ? true : false}
            style={customStyles}
            shouldCloseOnOverlayClick={true}
            contentLabel=""
            ariaHideApp={false}
            onRequestClose={onCloseErrorModal}
        >
            <span className={classes.errorMessage}>{errorMessage || ''}</span>
        </ReactModal>
    );

    function getLayoutUI() {
        switch (currentMode) {
            case WALLET_MODE.MY_WALLET:
                return myWallet;
            case WALLET_MODE.SEND_TO_FRIEND:
                return sendToFriend;
            case WALLET_MODE.INVITE_FRIEND:
                return inviteFriend;
            case WALLET_MODE.BUY_CREDIT:
                return buyCredit;
            case WALLET_MODE.WITHDRAW_CREDIT:
                return withdrawCredit;
            default:
                return <div />;
        }
    }

    return (
        <div>
            {getLayoutUI()}
            {successMessageModal}
            {errorMessageModal}
            {isLoading && fullPageLoadingIndicator}
        </div>
    );
};

export default MyWalletPage;
