import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/app';

export const useCurrentLink = props => {
    const location = useLocation();
    const { url = location.pathname, tabIndex = 0 } = props;
    const [{ currentLink }, { setCurrentLink }] = useAppContext();

    useEffect(() => {
        setCurrentLink({ url, tabIndex });
    }, [setCurrentLink, tabIndex, url]);
    return {
        currentLink
    };
};
