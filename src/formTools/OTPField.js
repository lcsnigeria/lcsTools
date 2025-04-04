/**
 * OTP Input Validation with Event Delegation
 */
document.addEventListener("input", function (e) {
    const otpContainer = e.target.closest("._otp_inputs");
    if (!otpContainer) return;

    const hiddenOtpField = otpContainer.closest("._otp_block").querySelector("input[name='otp']");
    if (!hiddenOtpField) return;

    if (e.target.tagName === "INPUT" && e.target.type === "text") {
        const value = e.target.value;
        if (/^\d$/.test(value)) {
            const nextInput = e.target.nextElementSibling;
            if (nextInput && nextInput.tagName === "INPUT") {
                nextInput.focus();
            }
        } else {
            e.target.value = "";
        }
    }

    hiddenOtpField.value = Array.from(otpContainer.querySelectorAll("input"))
        .map(input => input.value)
        .join("");
});
document.addEventListener("keydown", function (e) {
    const otpContainer = e.target.closest("._otp_inputs");
    if (!otpContainer) return;

    if (e.key === "Backspace" && e.target.tagName === "INPUT") {
        const prevInput = e.target.previousElementSibling;
        if (!e.target.value && prevInput && prevInput.tagName === "INPUT") {
            prevInput.focus();
        }
    }
});

export const lcsOTPInputEvent = true;