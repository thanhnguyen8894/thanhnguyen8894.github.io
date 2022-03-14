import React, { useEffect, useState } from 'react';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './verifyPhone.css';

function CountDown(props) {
    const classes = mergeClasses(defaultClasses, props.classes);
    const { min, sec, isTimeUp } = props;
    const [seconds, setSeconds] = useState(sec || 0);
    const [minutes, setMinutes] = useState(min || 0);
    const [timeUp, setTimeUp] = useState(false);

    function updateTime() {
        if (minutes == 0 && seconds == 0) {
            //TODO
            setTimeUp(true);
        } else {
            if (seconds == 0) {
                setMinutes(minutes => minutes - 1);
                setSeconds(59);
            } else {
                setSeconds(seconds => seconds - 1);
            }
        }
    }

    useEffect(() => {
        const token = setTimeout(updateTime, 1000);

        return function cleanUp() {
            clearTimeout(token);
        };
    });

    useEffect(() => {
        isTimeUp(timeUp);
    });

    function formatTimeShowing(time) {
        return `${new Date(time * 1000).toISOString().substr(14, 5)}`;
    }

    return (
        <div className={classes.inputCountdown}>
            {formatTimeShowing(seconds)}
        </div>
    );
}

export default CountDown;
