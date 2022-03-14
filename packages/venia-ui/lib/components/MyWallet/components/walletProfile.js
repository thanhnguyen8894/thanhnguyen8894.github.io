import React, { useState, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Button from './button';
import IconBuyWallet from '@magento/venia-ui/venia-static/icons/account/buy-wallet.svg';
import IconWithDraw from '@magento/venia-ui/venia-static/icons/account/with-draw.svg';
import { useAppContext } from '@magento/peregrine/lib/context/app';

import TransHistoriesPage from './transHistories';
import defaultClasses from './walletProfile.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { WALLET_MODE } from '../myWallet';

const WalletProfilePage = props => {
    const [{ mobile, rtl }] = useAppContext();
    const { formatMessage } = useIntl();
    const classes = mergeClasses(defaultClasses, props.classes);

    const {
        customer,
        walletRewardEmailSubsData,
        transHistoryData,
        onActionPress,
        onUpdateWalletRewardEmailSubs,
        storeConfig
    } = props || {};

    const {
        walletreward_reward_earn_reward_invited_friend_registration_enable: walletInviteFriend,
        walletreward_reward_earn_reward_newsletter_subscribers_enable: walletSubNewsLetter,
        walletreward_wallet_withdraw_allow_withdrawal: walletAllowWithdrawal,
        walletreward_wallet_withdraw_sendtofriend_allow_send_credit: walletAllowSendCredit,
        walletreward_wallet_credit_usages_buy_credite: walletBuyCredit
    } = storeConfig;

    const [isEmailSubs, updateIsEmailSubs] = useState(false);

    const check = useMemo(() => {
        if (walletRewardEmailSubsData) {
            const { subscriber_status } = walletRewardEmailSubsData || {};

            updateIsEmailSubs(subscriber_status);
        }
    }, [walletRewardEmailSubsData]);

    function onEmailSubSave() {
        onUpdateWalletRewardEmailSubs &&
            onUpdateWalletRewardEmailSubs(isEmailSubs);
    }

    // Render Components
    const topButtons = (
        <div className={classes.topButtonsContainer}>
            {walletAllowSendCredit === '1' && (
                <Button
                    title={formatMessage({
                        id: 'myWallet.sentToFriend',
                        defaultMessage: 'Send to friend'
                    })}
                    containerStyle={{
                        maxWidth: '200px',
                        marginRight: !rtl ? '20px' : '0px',
                        marginLeft: rtl ? '20px' : '0px',
                        marginBottom: mobile ? '20px' : 0
                    }}
                    onClick={() => {
                        onActionPress(WALLET_MODE.SEND_TO_FRIEND);
                    }}
                />
            )}
            {walletInviteFriend === '1' && (
                <Button
                    title={formatMessage({
                        id: 'myWallet.inviteFriend',
                        defaultMessage: 'Invite friend'
                    })}
                    containerStyle={{
                        maxWidth: '200px'
                    }}
                    onClick={() => {
                        onActionPress(WALLET_MODE.INVITE_FRIEND);
                    }}
                />
            )}
        </div>
    );

    const headers = (
        <div className={classes.headerContainer}>
            <h2 className={classes.heading}>
                <FormattedMessage
                    id={'myWallet.myWalletTitle'}
                    defaultMessage={'My wallet'}
                />
            </h2>
            <h4 className={classes.subHeading}>
                <FormattedMessage
                    id={'myWallet.myWalletSubTitle'}
                    defaultMessage={
                        'You can check and update credit limit here'
                    }
                />
            </h4>
        </div>
    );

    const profileGroup = (
        <div className={classes.profileGroup}>
            <div className={classes.group}>
                <h3 className={classes.groupTitle}>
                    <FormattedMessage
                        id={'myWallet.wallet'}
                        defaultMessage={'Wallet'}
                    />
                </h3>
            </div>
            <div className={classes.profileContent}>
                <div className={classes.profileContentLeft}>
                    <div className={classes.walletTitle}>
                        <FormattedMessage
                            id={'myWallet.walletCredit'}
                            defaultMessage={'Wallet Credit'}
                        />
                        <h3 className={classes.walletValue}>{`SAR ${
                            customer && customer.wallet_credit
                                ? customer.wallet_credit
                                : 0
                        }`}</h3>
                    </div>
                </div>
                <div className={classes.profileContentRight}>
                    {walletBuyCredit === '1' && (
                        <Button
                            title={formatMessage({
                                id: 'myWallet.buyCredit',
                                defaultMessage: 'Buy Credit'
                            })}
                            icon={IconBuyWallet}
                            containerStyle={{
                                marginRight: !rtl ? '20px' : '0px',
                                marginLeft: rtl ? '20px' : '0px',
                                marginBottom: mobile ? '20px' : 0,
                                width: '200px'
                            }}
                            onClick={() => {
                                onActionPress(WALLET_MODE.BUY_CREDIT);
                            }}
                        />
                    )}
                    {walletAllowWithdrawal === '1' && (
                        <Button
                            title={formatMessage({
                                id: 'myWallet.withdrawCredit',
                                defaultMessage: 'Withdraw Credit'
                            })}
                            icon={IconWithDraw}
                            containerStyle={{
                                width: '200px'
                            }}
                            onClick={() => {
                                onActionPress(WALLET_MODE.WITHDRAW_CREDIT);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );

    const transactionHistory = (
        <div className={classes.transHistoryGroup}>
            <div className={classes.group}>
                <h3 className={classes.groupTitle}>
                    <FormattedMessage
                        id={'myWallet.transactionHistory'}
                        defaultMessage={'Transaction History'}
                    />
                </h3>
            </div>
            <div className={classes.transContent}>
                <TransHistoriesPage
                    isTransHistory={true}
                    data={transHistoryData}
                />
            </div>
        </div>
    );

    const emailSubcription = walletSubNewsLetter === '1' && (
        <div className={classes.emailSubGroup}>
            <div className={classes.group}>
                <h3 className={classes.groupTitle}>
                    <FormattedMessage
                        id={'myWallet.walletEmailSub'}
                        defaultMessage={
                            'Wallet/Reward Transactional Email Subscription'
                        }
                    />
                </h3>
            </div>
            <div className={classes.emailSubContent}>
                <label className={classes.emailSubLabel}>
                    <input
                        field="emailSubs"
                        type="checkbox"
                        value={isEmailSubs}
                        onChange={() => updateIsEmailSubs(!isEmailSubs)}
                        checked={isEmailSubs}
                    />
                    <FormattedMessage
                        id={'myWallet.emailSub'}
                        defaultMessage={'Email Subscription'}
                    />
                </label>

                <Button
                    title={formatMessage({
                        id: 'myWallet.emailSubAction',
                        defaultMessage: 'Save'
                    })}
                    containerStyle={{
                        maxWidth: '200px',
                        marginTop: '20px',
                        marginBottom: '20px'
                    }}
                    onClick={onEmailSubSave}
                />

                <label className={classes.emailSubHint}>
                    <FormattedMessage
                        id={'myWallet.emailSubHint'}
                        defaultMessage={
                            'If checked then you will get wallet/reward transactional email'
                        }
                    />
                </label>
            </div>
        </div>
    );

    return (
        <div className={mobile ? classes.rootMobile : classes.root}>
            {topButtons}
            {headers}
            {profileGroup}
            {transactionHistory}
            {emailSubcription}
        </div>
    );
};

export default WalletProfilePage;
