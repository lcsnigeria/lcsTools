/**
 * Evaluates the strength of a given password.
 *
 * @param {string} password - The password to evaluate.
 * @returns {string|boolean} Returns 'short', 'weak', 'medium', 'strong', or false for empty password.
 */
export function passwordStrength(password) {
    const includesDigits = /\d/.test(password);
    const includesUppercase = /[A-Z]/.test(password);
    const includesLowercase = /[a-z]/.test(password);
    const includesSpecialChars = /[\W_]/.test(password);
    const length = password.length;

    if (
        length >= 8 &&
        includesDigits &&
        includesUppercase &&
        includesLowercase &&
        includesSpecialChars
    ) {
        return 'strong';
    } else if (
        (length >= 6 && !includesSpecialChars && includesDigits && includesUppercase && (includesLowercase || (!includesLowercase && includesSpecialChars)))
        ||
        (length >= 6 && (includesLowercase || includesUppercase) && includesSpecialChars && includesDigits)
    ) {
        return 'medium';
    } else if (length > 0 && length <= 5) {
        return 'short';
    } else if (
        (length >= 6 && (!includesDigits || (includesDigits && !includesLowercase && !includesUppercase))) 
        ||
        (length >= 6 && (!includesDigits || (includesDigits && !includesSpecialChars && !includesUppercase)))
    ) {
        return 'weak';
    } else if (length <= 0) {
        return null;
    }
}

/**
 * Generates and returns the outerHTML string for a confirm password field.
 *
 * @returns {string} The outerHTML of the confirm password input group.
 */
export function generateConfirmPasswordField() {
    const wrapper = document.createElement('div');
    wrapper.className = 'formGroup _confirmPassword';
    wrapper.innerHTML = `
        <label for="confirmPassword">Confirm Password</label>
        <div class="formPasswordWrapper">
            <input type="password" class="validatePassword passwordInput" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" required>
            <button type="button" class="showHidePassword">Show</button>
        </div>
    `;
    return wrapper.outerHTML;
}

/**
 * Handles live password validation for forms with class `.lcsForm`.
 * 
 * Validates the password field (with class `.lcsForm .validatePassword`) in real-time.
 * - Ensures password strength.
 * - Dynamically adds a confirm password field if needed.
 * - Ensures confirm password matches the original password.
 */
document.addEventListener('input', (event) => {
    const inputTarget = event.target;

    // Ensure we're inside the correct form and targeting a password validation input
    if (inputTarget.closest('.lcsForm .validatePassword')) {
        const thisForm = inputTarget.closest('.lcsForm');
        const passwordInputElement = inputTarget.closest('.lcsForm .validatePassword');
        const passwordFieldFormGroup = inputTarget.closest('.formGroup._password');

        const confirmPasswordFieldFormGroup = thisForm.querySelector('.formGroup._confirmPassword');

        // If input is the main password field
        if (passwordInputElement.id === 'password') {
            // If the password field wrapper is missing, throw a descriptive error
            if (!passwordFieldFormGroup) {
                throw new Error("Password field group not found. Ensure the password input is wrapped in a '.formGroup._password' container.");
            }

            const enteredPasswordStrength = passwordStrength(passwordInputElement.value);

            // If password is too weak
            if (!['strong', 'medium'].includes(enteredPasswordStrength)) {
                // Remove confirm password field if it exists
                if (confirmPasswordFieldFormGroup) {
                    confirmPasswordFieldFormGroup.remove();
                }

                passwordInputElement.classList.add('_input_error');

                // Show or create an error message
                let passwordErrorElement = passwordFieldFormGroup.querySelector('._error') 
                    || document.createElement('span');

                passwordErrorElement.className = '_error';
                passwordErrorElement.textContent = 'Your password is too weak. Use at least 6 characters with numbers, upper/lowercase letters, and symbols.';

                // Append error if it's newly created
                if (!passwordFieldFormGroup.contains(passwordErrorElement)) {
                    passwordFieldFormGroup.appendChild(passwordErrorElement);
                }

            } else {
                // Password is strong enough
                window.passwordOwnValue = passwordInputElement.value;
                passwordInputElement.classList.remove('_input_error');

                // Remove error message if it exists
                const existingError = passwordFieldFormGroup.querySelector('._error');
                if (existingError) existingError.remove();

                // Add confirm password field if not already added
                if (!confirmPasswordFieldFormGroup) {
                    const confirmPasswordField = generateConfirmPasswordField();
                    passwordFieldFormGroup.insertAdjacentHTML('afterend', confirmPasswordField);
                }
            }

        } else if (passwordInputElement.id === 'confirmPassword') {
            // Confirm password logic

            // If the confirm password field wrapper is missing, throw a descriptive error
            if (!confirmPasswordFieldFormGroup) {
                throw new Error("Confirm password field group not found. Ensure the password input is wrapped in a '.formGroup._confirmPassword' container.");
            }

            // If window.passwordOwnValue is undefined, it means the original password isn't valid or hasn't been entered
            if (window.passwordOwnValue === undefined) {
                throw new Error("Cannot validate confirmation: the original password has not been validated or is missing.");
            }

            const confirmPasswordInputValue = passwordInputElement.value;

            if (confirmPasswordInputValue !== window.passwordOwnValue) {
                passwordInputElement.classList.add('_input_error');

                // Show or create error message for confirm password mismatch
                let confirmPasswordErrorElement = confirmPasswordFieldFormGroup.querySelector('._error')
                    || document.createElement('span');

                confirmPasswordErrorElement.className = '_error';
                confirmPasswordErrorElement.textContent = 'Passwords do not match.';

                if (!confirmPasswordFieldFormGroup.contains(confirmPasswordErrorElement)) {
                    confirmPasswordFieldFormGroup.appendChild(confirmPasswordErrorElement);
                }
            } else {
                // Match is valid
                passwordInputElement.classList.remove('_input_error');
                const existingConfirmError = confirmPasswordFieldFormGroup.querySelector('._error');
                if (existingConfirmError) existingConfirmError.remove();
            }
        }
    }
});

/**
 * Password Visibility Toggle
 * - Toggles the visibility of password input fields between `text` and `password`.
 * - Updates the toggle button text to "Show" or "Hide" accordingly.
 */
document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("click", function (e) {
        const showHidePasswordToggle = e.target.closest(".showHidePassword");
        if (!showHidePasswordToggle) return;

        const passwordInputWrapper = showHidePasswordToggle.closest(".formPasswordWrapper");
        const passwordInput = passwordInputWrapper.querySelector("input.passwordInput");

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            showHidePasswordToggle.textContent = 'Hide';
        } else {
            passwordInput.type = 'password';
            showHidePasswordToggle.textContent = 'Show';
        }
    });
});

/**
 * 
 */
export const lcsShowHidePasswordEvent = true;