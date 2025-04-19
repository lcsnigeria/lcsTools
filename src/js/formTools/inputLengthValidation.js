/**
 * Monitors all input events within elements matching '.lcsForm .lcsValidateInputLength'.
 * 
 * Enforces a maximum character limit defined by the 'data-maxlength' attribute.
 * If the input exceeds this limit, it is trimmed automatically.
 * When the limit is reached or exceeded, a CSS class '_input_max_reached' is added for styling or feedback.
 * The class is removed when the input is below the limit again.
 */
document.addEventListener('input', (event) => {
    const inputTarget = event.target.closest('.lcsForm .lcsValidateInputLength');
    
    if (inputTarget) {
        const inputLength = inputTarget.value.length;
        const maxLength = parseInt(inputTarget.dataset.maxlength || 0, 10);

        // Enforce character limit
        if (maxLength > 0 && inputLength > maxLength) {
            inputTarget.value = inputTarget.value.slice(0, maxLength);
        }

        // Toggle visual class when limit is reached
        if (inputLength >= maxLength) {
            inputTarget.classList.add('_input_max_reached');
        } else {
            inputTarget.classList.remove('_input_max_reached');
        }
    }
});

/**
 * 
 */
export const lcsFormInputLengthValidation = true;