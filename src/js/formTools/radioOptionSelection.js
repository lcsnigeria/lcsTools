/**
 * Switch/Selecting between radio options
 */
document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("click", function (e) {
        const option = e.target.closest("._radio_option");
        if (!option) return;

        const optionsContainer = option.closest("._radio_options");
        const radioOptionsInput = optionsContainer.querySelector("._radio_options_value");

        // Remove _selected from all options
        optionsContainer.querySelectorAll("._radio_option").forEach(opt => opt.classList.remove("_selected"));

        // Add _selected to the clicked option
        option.classList.add("_selected");

        // Set the hidden input value
        radioOptionsInput.value = option.getAttribute("data-radio_option_value");
    });
});

export const lcsRadioSelectionEvent = true;