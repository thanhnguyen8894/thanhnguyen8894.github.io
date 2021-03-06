/**
 * Maps an error to a string message
 *
 * @param {Error} error the error to map
 * @return {String} error message
 */
const toString = error => {
    const { graphQLErrors, message } = error;
    return graphQLErrors && graphQLErrors.length
        ? graphQLErrors.map(
            ({ debugMessage, message }) => debugMessage &&
                debugMessage === "Phar wrapper is not registered. Please review your php.ini settings."
                    ? "Can not send OTP. Please check your number."
                    : debugMessage ? debugMessage : message).join(', ')
        : message
};

/**
 * A function to derive an error string from an array of errors.
 */
export const deriveErrorMessage = errors => {
    const errorCollection = [];
    for (const error of errors) {
        if (error) {
            errorCollection.push(toString(error));
        }
    }

    return errorCollection.join(', ');
};
