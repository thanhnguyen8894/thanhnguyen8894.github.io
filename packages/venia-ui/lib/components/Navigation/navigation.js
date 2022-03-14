import React, { Suspense } from 'react';
import { shape, string } from 'prop-types';

//Hooks
import { useNavigation } from '@magento/peregrine/lib/talons/Navigation/useNavigation';
import { useAppContext } from '@magento/peregrine/lib/context/app';

//Storage
import { BrowserPersistence } from '@magento/peregrine/lib/util';

//Styles
import { mergeClasses } from '../../classify';
import defaultClasses from './navigation.css';

//Component
import AuthBar from '../AuthBar';
import CategoryTree from '../CategoryTree';
import CurrencySwitcher from '../Header/currencySwitcher';
import StoreSwitcher from '../Header/storeSwitcher';
import LoadingIndicator from '../LoadingIndicator';
import NavHeader from './navHeader';
import CustomerServicesSwitcher from '../Header/customerServicesSwitcher';

const AuthModal = React.lazy(() => import('../AuthModal'));
const storage = new BrowserPersistence();

const Navigation = props => {
    const {
        parentUrl,
        updateParentUrl,
        categories,
        updateCategories,
        categoryId,
        handleBack,
        handleClose,
        hasModal,
        isOpen,
        isTopLevel,
        setCategoryId,
        showCreateAccount,
        showForgotPassword,
        showMainMenu,
        showMyAccount,
        showSignIn,
        view
    } = useNavigation();

    const [{ rtl }] = useAppContext();

    const [{ mobile }] = useAppContext();
    const classes = mergeClasses(defaultClasses, props.classes);
    const storeCodeTwoLetter =
        storage.getItem('store_view_country')?.toLowerCase() || 'sa';
    const isPakistanStore = storeCodeTwoLetter === 'pk';
    let rootClassName = isOpen ? classes.root_open : classes.root;
    rootClassName += rtl ? ` ${classes.rtl}` : '';

    const modalClassName = hasModal ? classes.modal_open : classes.modal;
    const bodyClassName = hasModal ? classes.body_masked : classes.body;

    // Lazy load the auth modal because it may not be needed.
    const authModal = hasModal ? (
        <Suspense fallback={<LoadingIndicator />}>
            <AuthModal
                closeDrawer={handleClose}
                showCreateAccount={showCreateAccount}
                showForgotPassword={showForgotPassword}
                showMainMenu={showMainMenu}
                showMyAccount={showMyAccount}
                showSignIn={showSignIn}
                view={view}
            />
        </Suspense>
    ) : null;

    return (
        <aside
            style={{ overflowY: mobile ? 'scroll' : 'hidden' }}
            className={rootClassName}
        >
            <header className={classes.header}>
                <NavHeader
                    isTopLevel={isTopLevel}
                    onBack={handleBack}
                    view={view}
                />
            </header>
            <div className={bodyClassName}>
                <CategoryTree
                    onNavigate={handleClose}
                    categories={categories}
                    setCategoryId={setCategoryId}
                    parentUrl={parentUrl}
                    updateParentUrl={updateParentUrl}
                    updateCategories={updateCategories}
                />
                <div
                    className={`${classes.switchers} ${
                        isPakistanStore ? classes.pkStore : ''
                    }`}
                >
                    <CustomerServicesSwitcher rtl={rtl} isBottom={true} />
                    <StoreSwitcher
                        rtl={rtl}
                        isBottom={true}
                        classes={{
                            root: classes.storeSwitcherRoot
                        }}
                    />
                    {/* <CurrencySwitcher rtl={rtl} isBottom={true} classes={{
                        root: classes.currencySwitcherRoot
                    }} /> */}
                </div>
            </div>
            <div className={classes.footer}>
                <div className={classes.switchers}>
                    {/* <StoreSwitcher isBottom={true} rtl={rtl} /> */}
                </div>
                {/* <AuthBar
                    disabled={hasModal}
                    showMyAccount={showMyAccount}
                    showSignIn={showSignIn}
                /> */}
            </div>
            <div className={modalClassName}>{authModal}</div>
        </aside>
    );
};

export default Navigation;

Navigation.propTypes = {
    classes: shape({
        body: string,
        form_closed: string,
        form_open: string,
        footer: string,
        header: string,
        root: string,
        root_open: string,
        signIn_closed: string,
        signIn_open: string
    })
};
