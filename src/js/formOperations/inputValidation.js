/**
 * Monitors input events within elements matching the selector '.lcsForm .validateInput'.
 * 
 * Features:
 * 1. Handles numeric input validation:
 *    - Removes all non-numeric characters from the input.
 *    - Enforces minimum and maximum numeric values based on the 'min' and 'max' attributes.
 * 
 * 2. Enforces a maximum character limit for text inputs:
 *    - Trims input to the maximum length specified by the 'data-maxlength' attribute.
 *    - Adds the CSS class 'inputMaxReached' when the input reaches or exceeds the limit.
 *    - Removes the class when the input is below the limit.
 * 
 * 3. Provides character count feedback for inputs with the 'showLengthCount' class:
 *    - Displays the number of characters entered, remaining, or both, depending on additional classes:
 *      - 'remainder': Shows remaining characters or a message when the limit is reached.
 *      - 'analogy': Displays entered and maximum characters in a "current/total" format.
 * 
 * 4. Dynamically creates a feedback element if none exists:
 *    - Ensures the input is wrapped in a container with the class '_form_group'.
 *    - Warns if the '_form_group' container is missing.
 * 
 * Notes:
 * - Numeric inputs are validated against 'min' and 'max' attributes, defaulting to null if not provided.
 * - Character count feedback is displayed in a dynamically created 'inputLengthCount' element.
 * - Proper wrapping of input elements in '_form_group' is required for full functionality.
 * 
 * Example Usage:
 * - Add the 'validateInput' class to inputs for validation.
 * - Use 'numberInput' for numeric validation and 'validateLength' for character limit enforcement.
 * - Add 'showLengthCount', 'remainder', or 'analogy' for character count feedback.
 */
document.addEventListener('input', (event) => {
    const inputTarget = event.target.closest('.lcsForm .validateInput');

    // Exit if the input is not within a .lcsForm .validateInput element
    if (!inputTarget) return;
    
    const formGroup = inputTarget.closest('._form_group');
    const inputLength = inputTarget.value.length;

    /**
     * Handles numeric input validation and constraints.
     * Stripping all non-numeric characters from the input value 
     * - Automatically removes any non-digit characters
     * 
     * Example Usage:
     * ```html
     * <input type="text" class="validateInput numberInput">
     * ```
     */
    if (inputTarget.classList.contains('numberInput')) {
        inputTarget.value = inputTarget.value.replace(/\D/g, ""); // Remove all non-numeric characters
    }

    
    /**
     * Handles character length validation and provides visual feedback.
     * 
     * This block processes inputs with the 'validateLength' class by:
     * 1. Enforcing a maximum character limit from data-maxlength attribute
     * 2. Adding visual indicators when the limit is reached
     * 3. Displaying character count feedback in various formats
     * 
     * Features:
     * - Enforces maximum length by trimming excess characters
     * - Adds 'inputMaxReached' class when limit is reached
     * - Provides character count feedback with several display options:
     *   - Default: Shows "X characters entered"
     *   - 'remainder': Shows "X characters remaining"
     *   - 'analogy': Shows "X of Y characters"
     * 
     * Requirements:
     * - Input must be wrapped in an element with class '_form_group'
     * - Input must have 'data-maxlength' attribute set
     * 
     * Example Usage:
     * ```html
     * <div class="_form_group">
     *   <input type="text" 
     *          class="validateInput validateLength showLengthCount remainder"
     *          data-maxlength="100">
     * </div>
     * ```
     * 
     * Note: The character count display element is automatically created
     * if not present, inserted after the input element.
     */
    if (inputTarget.classList.contains('validateLength')) {
        const maxLength = parseInt(inputTarget.dataset.maxlength || 0, 10);
        // Enforce character limit
        if (maxLength > 0 && inputLength > maxLength) {
            inputTarget.value = inputTarget.value.slice(0, maxLength);
        }

        // Toggle visual class when limit is reached
        if (inputLength >= maxLength) {
            inputTarget.classList.add('inputMaxReached');
        } else {
            inputTarget.classList.remove('inputMaxReached');
        }

        if (inputTarget.classList.contains('showLengthCount')) {
            if (!formGroup) {
            console.warn("Warning: Unable to display length count. Ensure your input element is wrapped in an element with the class '_form_group'.");
            return;
            }

            let inputLengthCountElement = formGroup.querySelector('.inputLengthCount');
            if (!inputLengthCountElement) {
                const html = '<div class="inputLengthCount"></div>';
                inputTarget.insertAdjacentHTML('afterend', html);
                inputLengthCountElement = formGroup.querySelector('.inputLengthCount');
            }

            const inputLengthRemainder = maxLength - inputLength;

            const enteredCharacterLabel = inputLength === 1 ? 'character' : 'characters';
            const remainingCharacterLabel = inputLengthRemainder === 1 ? 'character' : 'characters';
            const maxLengthCharacterLabel = maxLength === 1 ? 'character' : 'characters';

            let inputLengthCountMsg = inputLength > 0 
            ? `<span>${inputLength} ${enteredCharacterLabel} entered.</span>` : '';

            if (inputTarget.classList.contains('remainder')) {
                inputLengthCountMsg = inputLengthRemainder > 0 
                ? `<span>${inputLengthRemainder} ${remainingCharacterLabel} remaining.</span>` 
                : `<span>Maximum input of ${maxLength} ${maxLengthCharacterLabel} reached.</span>`;
            } else if (inputTarget.classList.contains('analogy')) {
                inputLengthCountMsg = inputLength > 0 
                ? `<span>${inputLength} of ${maxLength} ${maxLengthCharacterLabel} entered.</span>` : '';
            }

            inputLengthCountElement.innerHTML = inputLengthCountMsg;
        }
    }


    /**
     * Handles word count validation and provides visual feedback.
     * 
     * This block processes inputs with the 'validateWords' class by:
     * 1. Enforcing a maximum word limit from data-maxwords attribute
     * 2. Adding visual indicators when the word limit is reached
     * 3. Displaying word count feedback in various formats
     * 
     * Features:
     * - Enforces maximum word count by trimming excess words
     * - Adds 'inputMaxReached' class when limit is reached
     * - Provides word count feedback with several display options:
     *   - Default: Shows "X words entered"
     *   - 'remainder': Shows "X words remaining"
     *   - 'analogy': Shows "X of Y words"
     * 
     * Requirements:
     * - Input must be wrapped in an element with class '_form_group'
     * - Input must have 'data-maxwords' attribute set
     * 
     * Example Usage:
     * ```html
     * <div class="_form_group">
     *   <textarea 
     *          class="validateInput validateWords showLengthCount remainder"
     *          data-maxwords="100">
     *   </textarea>
     * </div>
     * ```
     */
    if (inputTarget.classList.contains('validateWords')) {
        const maxWords = parseInt(inputTarget.dataset.maxwords || 0, 10);
        const words = inputTarget.value.trim().split(/\s+/);
        const wordCount = inputTarget.value.trim() === '' ? 0 : words.length;

        // Enforce word limit
        if (maxWords > 0 && wordCount > maxWords) {
            inputTarget.value = words.slice(0, maxWords).join(' ');
        }

        // Toggle visual class when limit is reached
        if (wordCount >= maxWords) {
            inputTarget.classList.add('inputMaxReached');
        } else {
            inputTarget.classList.remove('inputMaxReached');
        }

        if (inputTarget.classList.contains('showLengthCount')) {
            if (!formGroup) {
                console.warn("Warning: Unable to display word count. Ensure your input element is wrapped in an element with the class '_form_group'.");
                return;
            }

            let wordCountElement = formGroup.querySelector('.inputLengthCount');
            if (!wordCountElement) {
                const html = '<div class="inputLengthCount"></div>';
                inputTarget.insertAdjacentHTML('afterend', html);
                wordCountElement = formGroup.querySelector('.inputLengthCount');
            }

            const wordRemainder = maxWords - wordCount;

            const enteredWordLabel = wordCount === 1 ? 'word' : 'words';
            const remainingWordLabel = wordRemainder === 1 ? 'word' : 'words';
            const maxWordLabel = maxWords === 1 ? 'word' : 'words';

            let wordCountMsg = wordCount > 0 
                ? `<span>${wordCount} ${enteredWordLabel} entered.</span>` : '';

            if (inputTarget.classList.contains('remainder')) {
                wordCountMsg = wordRemainder > 0 
                    ? `<span>${wordRemainder} ${remainingWordLabel} remaining.</span>` 
                    : `<span>Maximum input of ${maxWords} ${maxWordLabel} reached.</span>`;
            } else if (inputTarget.classList.contains('analogy')) {
                wordCountMsg = wordCount > 0 
                    ? `<span>${wordCount} of ${maxWords} ${maxWordLabel} entered.</span>` : '';
            }

            wordCountElement.innerHTML = wordCountMsg;
        }
    }
});

/**
 * Handles input validation and constraints on focusout event.
 * 
 * This event listener processes inputs with the 'validateInput' class when they lose focus.
 * It performs final validation and correction of values to ensure they comply
 * with specified constraints.
 * 
 * Features:
 * 1. For numeric inputs ('numberInput' class):
 *    - Removes all non-numeric characters from the input value
 *    - Enforces minimum value constraints based on the 'min' attribute
 *    - Enforces maximum value constraints based on the 'max' attribute
 *    - Provides final validation on blur to ensure values are properly constrained
 * 
 * 2. Additional validation types can be added here for other input formats
 * 
 * Triggering Event:
 * - 'focusout': Fires when the input element loses focus
 * 
 * Requirements:
 * - Input must have the 'validateInput' class
 * - Input should have appropriate validation classes ('numberInput', etc.)
 * - Input should have relevant attributes ('min', 'max', etc.)
 * 
 * Example Usage:
 * ```html
 * <input type="text" 
 *        class="validateInput numberInput"
 *        min="0"
 *        max="100"
 *        placeholder="Enter a number between 0-100">
 * ```
 */
document.addEventListener('focusout', (inputEvent) => {
    const inputTarget = inputEvent.target.closest('.lcsForm .validateInput');

    // Exit if the input is not within a .lcsForm .validateInput element
    if (!inputTarget) return;
    
    /**
     * Handles numeric input validation and constraints.
     * 
     * This block processes inputs with the 'numberInput' class by:
     * 1. Stripping all non-numeric characters from the input value
     * 2. Reading 'min' and 'max' HTML attributes for validation bounds
     * 3. Enforcing minimum and maximum value constraints
     * 
     * Features:
     * - Automatically removes any non-digit characters
     * - Respects HTML min/max attributes for range validation
     * - Corrects values that fall outside the allowed range
     * 
     * Example Usage:
     * ```html
     * <input type="text" 
     *        class="validateInput numberInput"
     *        min="0"
     *        max="100">
     * ```
     * 
     * Note: If min/max attributes are not specified, no range validation 
     * occurs and only numeric character enforcement is applied.
     */
    if (inputTarget.classList.contains('numberInput')) {
        inputTarget.value = inputTarget.value.replace(/\D/g, ""); // Remove all non-numeric characters

        // Retrieve `min` and `max` attributes and set default values if not present
        const setMinValue = inputTarget.getAttribute("min")
            ? parseInt(inputTarget.getAttribute("min"), 10)
            : null;

        const setMaxValue = inputTarget.getAttribute("max")
            ? parseInt(inputTarget.getAttribute("max"), 10)
            : null;

        const inputValue = inputTarget.value.trim();
        const numericValue = inputValue ? parseInt(inputValue, 10) : null;

        // Validate the input value against the `min` and `max` attributes
        if (numericValue !== null) {
            if (setMinValue !== null && numericValue < setMinValue) {
                inputTarget.value = setMinValue;
            } else if (setMaxValue !== null && numericValue > setMaxValue) {
                inputTarget.value = setMaxValue;
            }
        }
    }
}, true);

/**
 * 
 */
export const lcsFormInputValidation = true;