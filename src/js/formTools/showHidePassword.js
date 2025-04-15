/**
 * Password Visibility Toggle
 * - Toggles the visibility of password input fields between `text` and `password`.
 * - Updates the toggle button text to "Show" or "Hide" accordingly.
 */
document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("click", function (e) {
        const showHidePasswordToggle = e.target.closest("._show_hide_password");
        if (!showHidePasswordToggle) return;

        const passwordInputWrapper = showHidePasswordToggle.closest("._form_password_wrapper");
        const passwordInput = passwordInputWrapper.querySelector("input._password_input");

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            showHidePasswordToggle.textContent = 'Hide';
        } else {
            passwordInput.type = 'password';
            showHidePasswordToggle.textContent = 'Show';
        }
    });
});

export const lcsShowHidePasswordEvent = true;