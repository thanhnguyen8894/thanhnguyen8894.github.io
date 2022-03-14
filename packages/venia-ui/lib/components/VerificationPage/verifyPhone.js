import React from 'react';
import { func, shape, string, bool } from 'prop-types';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './verifyPhone.css';

import OtpInput from 'react-otp-input';


import { useAppContext } from '@magento/peregrine/lib/context/app';

/**
 * Verify Phone
 *
 * @typedef VerifyPhone
 * @kind functional component
 *
 * @param {props} props React component props
 * @returns {React.Element} A React component that displays a Verify phone
 * which contains 4 input to fill OTP receive
 */
function VerifyPhone(props) {
    const {
        optCode,
        setOtpCode,
        hasErrorCode
    } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    
    const [{ mobile }] = useAppContext();
    const handleChange = (event) => {
        setOtpCode(event);
    }

    return (
        <div className={`${classes.root} ${mobile ? classes.rootMobile : ''}`}>
            <OtpInput
                value={optCode}
                onChange={handleChange}
                isInputNum={true}
                shouldAutoFocus={true}
                hasErrored={hasErrorCode}
                numInputs={4}
                containerStyle={classes.otpControl}
                inputStyle={{
                    width: '40px',
                    height: '40px',
                    color: '#1F0804',
                    fontSize: '16px',
                    fontWeight: '500',
                    marginRight: '10px',
                    borderRadius: '2px',
                    border: '1px solid #1F0804',
                }}
                focusStyle={{
                    border: '1px solid #202020',
                }}
                errorStyle={{
                    border: '1px solid red',
                }}
            />
        </div>
    );
}

VerifyPhone.propTypes = {
    classes: shape({
        root: string,
        input: string
    }),
    onChange: func,
    hasErrorCode: bool,
};

export default VerifyPhone;
