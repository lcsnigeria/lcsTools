/**
 * Intercepts and handles form submissions for elements with the class `.lcsForm`.
 *
 * This script prevents the default form submission behavior to allow for custom
 * validation, data extraction, and optional callback execution. It ensures that
 * all required fields are filled, collects form data, and optionally invokes a
 * user-defined callback function specified via the `data-onsubmit_callback` attribute.
 *
 * @event submit
 * @param {SubmitEvent} event - The native submit event object.
 * @target HTMLFormElement - Any form element with the class `lcsForm`.
 *
 * @fires lcsTools.alert - (UNUSED) Displays an error alert when required fields are missing.
 * @callback onsubmit_callback - An optional globally defined function specified via the
 *                                `data-onsubmit_callback` attribute, executed after validation
 *                                and data extraction.
 *
 * @global
 * @property {HTMLFormElement} window.lcsForm.form - The form element being submitted.
 * @property {boolean} window.lcsForm.isValid - Indicates whether all required fields are filled.
 * @property {Object} window.lcsForm.data - A key-value store of form inputs and their values.
 *
 * @example <caption>Basic usage</caption>
 * <form class="lcsForm" data-onsubmit_callback="myCustomHandler">
 *     <input type="text" name="username" required>
 *     <textarea name="bio" required></textarea>
 *     <input type="checkbox" name="terms" required>
 *     <input type="file" name="attachments[]" multiple>
 *     <button type="submit">Submit</button>
 * </form>
 *
 * @example <caption>Callback definition</caption>
 * <script>
 * function myCustomHandler() {
 *     if (window.lcsForm.isValid) {
 *         console.log("Form is valid:", window.lcsForm.data);
 *         // Proceed with AJAX request or further logic
 *     }
 * }
 * </script>
 */
document.addEventListener("submit", (event) => {

    // Only proceed if the submitted form has the class `lcsForm`
    const formTarget = event.target.closest('.lcsForm');
    if (!formTarget) return;

    // Prevent native form submission
    event.preventDefault();

    /**
     * Global form state manager used to initialize or reset the form tracking object.
     *
     * @name lcsForm
     * @type {Object}
     * @global
     * @property {HTMLFormElement} form   - The form element being tracked.
     * @property {boolean}           isValid - Indicates if the form passed validation.
     * @property {Object<string, any>} data    - A key–value map of collected form data.
     */
    window.lcsForm = {
        form: event.target.closest('.lcsForm'),
        isValid: false,
        data: {}
    };

    // STEP 1: CLEAR PREVIOUS VALIDATION FEEDBACK

    // Remove all previous error messages
    formTarget.querySelectorAll("._required_field_error").forEach(el => el.remove());

    // Remove error highlight classes
    formTarget.querySelectorAll("._input_error").forEach(el => el.classList.remove("_input_error"));

    // STEP 2: VALIDATE REQUIRED FIELDS

    /** 
     * Collect all input and textarea elements marked as required
     * @type {HTMLElement[]}
     */
    const requiredFields = Array.from(formTarget.querySelectorAll('input[required], select[required], input._required, textarea[required]'));

    /** 
     * Stores the list of unfilled required fields
     * @type {HTMLElement[]}
     */
    const unfilled = [];

    // Loop through required fields to detect which ones are empty
    requiredFields.forEach((field) => {
        const isEmpty = field.value.trim().length === 0;
        if (isEmpty) {
            unfilled.push(field);

            // Attempt to highlight the parent group if present
            const formGroup = field.closest("._form_group");
            if (formGroup) {
                field.classList.add("_input_error");

                // Append an error message below the field if not already added
                if (!formGroup.querySelector("._required_field_error")) {
                    field.insertAdjacentHTML(
                        "afterend",
                        `<span class="_required_field_error">This field is required.</span>`
                    );
                }
            }
        }
    });

    // STEP 3: HALT ON VALIDATION FAILURE

    if (unfilled.length > 0) {
        // Display a notification to the user
        // lcsTools.alert("Please fill in all required fields marked in red.", "error", 8);

        // Scroll to the first unfilled input to bring it into view
        scrollTo(unfilled[0]);
        return; // Stop execution
    }

    // Mark the form as valid
    window.lcsForm.isValid = true;

    // STEP 4: COLLECT FORM DATA

    /**
     * Collect all input and textarea elements with a name attribute
     * Excludes input[type="submit"]
     */
    const allFields = Array.from(
        formTarget.querySelectorAll('input[name]:not([type="submit"]), select[name], textarea[name]')
    );

    // Loop through each form element and extract its value
    allFields.forEach((field) => {
        const { type, name } = field;
        let value = null;

        // Handle file inputs separately
        if (type === 'file') {
            if (field.files.length > 0) {
                value = field.files;
            }
        }
        // Convert checkbox value to boolean-like 1 or 0
        else if (type === 'checkbox') {
            value = field.checked ? 1 : 0;
        }
        // Handle standard input and textarea values
        else {
            const trimmed = field.value.trim();
            if (trimmed.length > 0) value = trimmed;
        }

        // Only save if the field has a value
        if (value !== null) {
            // Convert field name for file arrays (e.g. `images[]` to `images_files`)
            const key = (type === 'file') ? name.replace(/\[\]/g, '_files') : name;
            window.lcsForm.data[key] = value;
        }
    });

    // STEP 5: EXECUTE OPTIONAL CALLBACK

    /**
     * Execute a named callback function after data is collected
     * The name is provided as a data attribute: `data-onsubmit_callback`
     */
    const callbackName = formTarget.dataset.onsubmit_callback;

    if (callbackName) {
        const callbackFn = window[callbackName];

        // Ensure the callback exists and is a function
        if (typeof callbackFn === "function") {
            try {
                callbackFn(); // Invoke the user-defined callback
            } catch (err) {
                console.error(`Error executing callback "${callbackName}":`, err);
            }
        } else {
            console.warn(`Callback function "${callbackName}" is not defined or not a function.`);
        }
    }
});

/**
 * 
 */
export const lcsFormSubmission = true;