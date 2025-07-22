import { hooks } from '../hooks.js';
import { isDataEmpty } from '../workingTools/dataTypes.js';
import { alert as lcsAlert } from '../alertsAndLogs/alerts.js';

/**
 * Centralized handler for `<form class="lcsForm">` submissions.
 *
 * This listener intercepts native form submissions to enable rich data processing, custom validation,
 * and extensible hook-based behavior before and after submission. It is especially useful in modular
 * or AJAX-driven apps.
 *
 * ## Features
 * - Prevents default submission to allow programmatic handling.
 * - Validates required fields with custom UI feedback.
 * - Extracts and structures form data (including file inputs and custom pill fields).
 * - Supports multiple response strategies: hook listeners, named callback functions, and form-specific hooks.
 * - Fires extensible lifecycle hooks to integrate with your app logic.
 *
 * ## Global State (`window.lcsForm`)
 * - `form`  – The form element currently being submitted.
 * - `isValid` – Boolean flag indicating validation status.
 * - `data`  – An object of name-value pairs representing the submitted inputs.
 *
 * ## Hook Lifecycle Events
 * @fires hooks#doAction('buildingFormData')        – Before fields are processed.
 * @fires hooks#doAction('errorBuildingFormData')   – If file fields required but missing.
 * @fires hooks#doAction('warningBuildingFormData') – If pill/dropdown fields contain bad JSON.
 * @fires hooks#doAction('doneBuildingFormData')    – After data extraction finishes.
 * @fires hooks#doAction('formSubmitted')           – Final hook; fires for all `.lcsForm` elements.
 * @fires hooks#doAction('formSubmitted_formID')    – Targeted hook if form has an ID.
 *
 * ## Data Extraction Notes
 * - Automatically supports `input`, `textarea`, `select`, and `.lcsFileSelection`, `._pill_options_value`.
 * - File inputs support both native `FileList` and external selections from `window.lcsFileSelection`.
 * - Selects and pills are flattened into usable JS arrays.
 * - Invalid required fields are visually highlighted and scrolled into view.
 *
 * ## Usage Options
 *
 * ### 1. Using `data-onsubmit_callback` attribute (simple declarative)
 * ```html
 * <form class="lcsForm" data-onsubmit_callback="handleMyForm">
 *   <input type="text" name="email" required />
 *   <button>Submit</button>
 * </form>
 * <script>
 *   function handleMyForm(data) {
 *     console.log('Form data:', data);
 *   }
 * </script>
 * ```
 *
 * ### 2. Using `formSubmitted` global hook (for any form)
 * ```js
 * hooks.addAction('formSubmitted', (formEl, formData) => {
 *   if (formEl.id !== 'my_target_form') return; // Always verify the form ID
 *   console.log('Handling my_target_form submission:', formData);
 * });
 * ```
 *
 * ⚠️ **Note:** The global `'formSubmitted'` hook fires for **all** `.lcsForm` submissions.
 * If you only want to handle a specific form, you **must** check the form's `id` to avoid
 * processing unintended submissions. For form-specific logic without manual checks,
 * prefer `formSubmitted_<formID>` instead.
 *
 * ### 3. Using `formSubmitted_<formID>` hook (targeted)
 * ```js
 * hooks.addAction('formSubmitted_job_creator_form', (form, data) => {
 *   // Only called when this form ID is submitted
 *   console.log('Handling job creator form', data);
 * });
 * ```
 *
 * ### 4. Combined strategy
 * You can freely combine `data-onsubmit_callback`, `formSubmitted`, and `formSubmitted_<formID>`
 * depending on how modular or specific your needs are. All methods receive the same structured data.
 *
 * @event submit
 * @param {SubmitEvent} event - The captured form submit event.
 * @target HTMLFormElement with class `lcsForm`
 *
 * @example <caption>Minimal HTML Example</caption>
 * <form class="lcsForm" data-onsubmit_callback="handleLogin">
 *   <input name="username" required>
 *   <input name="password" required>
 *   <button type="submit">Login</button>
 * </form>
 *
 * @example <caption>Hook-based Handler Example</caption>
 * hooks.addAction('formSubmitted_loginForm', (form, data) => {
 *   fetch('/api/login', { method: 'POST', body: JSON.stringify(data) });
 * });
 */
document.addEventListener("submit", async (event) => {
  // Identify nearest `.lcsForm`; ignore other forms
  const formTarget = event.target.closest('.lcsForm');
  if (!formTarget) return;

  // Prevent default navigation submission
  event.preventDefault();

  // Initialize global form state
  window.lcsForm = {
    form: formTarget,
    isValid: false,
    data: {}
  };

  // STEP 1: CLEAR PREVIOUS VALIDATION FEEDBACK
  // Remove all error messages and highlight classes
  formTarget.querySelectorAll('._required_field_error').forEach(el => el.remove());
  formTarget.querySelectorAll('._input_error').forEach(el => el.classList.remove('_input_error'));

  // STEP 2: VALIDATE REQUIRED FIELDS
  /** @type {HTMLElement[]} */
  const requiredFields = Array.from(
    formTarget.querySelectorAll('input[required], select[required], input._required, textarea[required]')
  );
  const unfilled = [];

  requiredFields.forEach(field => {
    const lcTag = field.tagName.toLowerCase();
    const isEmpty = field.value.trim().length === 0
      || (lcTag === 'select' && field.selectedOptions.length === 0);

    if (isEmpty) {
      unfilled.push(field);
      field.classList.add('_input_error');
      // Insert error message below the field if missing
      if (!field.closest('._form_group').querySelector('._required_field_error')) {
        field.insertAdjacentHTML('afterend',
          '<span class="_required_field_error">This field is required.</span>'
        );
      }
    }
  });

  // STEP 3: HALT ON VALIDATION FAILURE
  if (unfilled.length > 0) {
    // Scroll first invalid into view
    unfilled[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    return; // stop further execution
  }
  window.lcsForm.isValid = true;

  // STEP 4: COLLECT FORM DATA
  /**
   * Extracts values from inputs, selects, textareas, and custom pill options.
   * Fires hooks before and after processing.
   * @returns {Promise<boolean>} Always resolves true on success
   */
  const BuildFormData = async () => {
    // Notify hook: starting extraction
    hooks.doAction('buildingFormData');

    const allFields = Array.from(
      formTarget.querySelectorAll(
        'input[name]:not([type="submit"]), select[name], textarea[name], ._pill_options_input[name]'
      )
    );

    allFields.forEach(field => {
      const { type, name, tagName } = field;
      const lcTag = tagName.toLowerCase();
      let value = null;

      // FILE inputs: support lcsFileSelection
      if (type === 'file') {
        if (field.classList.contains('lcsFileSelection')) {
          const sel = window.lcsFileSelection.files[name] || null;
          const req = field.dataset.file_select_required;
          if (!isDataEmpty(sel)) {
            value = Object.values(sel).map(f => f.file);
          } else if (req === 'true') {
            window.lcsForm.isValid = false;
            lcsAlert.send('Please fill all required fields.', 'error');
            hooks.doAction('errorBuildingFormData', 'Missing files for ' + name);
            throw new Error('File selection required but missing for: ' + name);
          }
        } else if (field.files.length) {
          value = field.files;
        }
      }

      // CHECKBOX
      else if (type === 'checkbox') {
        value = field.checked ? 1 : 0;
      }

      // SELECT (multiple support)
      else if (lcTag === 'select' && field.selectedOptions.length) {
        value = Array.from(field.selectedOptions, opt => opt.value);
        if (Array.isArray(value) && value.length === 1) {
          value = value[0];
        }
      }

      // PILL/DROPDOWN JSON
      else if (
        field.classList.contains('_pill_options_value') ||
        field.classList.contains('_dropdown_options_value')
      ) {
        const raw = field.value.trim();
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) {
            value = parsed;
          }
        } catch {
          console.warn('Invalid JSON in pill field:', name);
          hooks.doAction('warningBuildingFormData', 'JSON parse error: ' + name);
        }
      }

      // DEFAULT INPUT / TEXTAREA
      else if (lcTag === 'textarea' || lcTag === 'input') {
        const txt = field.value.trim();
        if (txt) value = txt;
      }

      // STORE if valid
      if (value !== null && (!Array.isArray(value) || value.length)) {
        const key = (type === 'file' || lcTag === 'select')
          ? name.replace(/\[\]/g, '')
          : name;
        window.lcsForm.data[key] = value;
      }
    });

    // Notify hook: extraction done
    hooks.doAction('doneBuildingFormData', window.lcsForm.data);
    return true;
  };

  // Await data build before proceeding
  await BuildFormData();

  /**
   * STEP 5: EXECUTE OPTIONAL CALLBACK
   * 
   * Execute a named callback function after data is collected
   * The name is provided as a data attribute: `data-onsubmit_callback`
   */
  const callbackName = formTarget.dataset.onsubmit_callback;

  if (callbackName) {
    const callbackFn = window[callbackName];

    // Ensure the callback exists and is a function
    if (typeof callbackFn === "function") {
        try {
          callbackFn(window.lcsForm.data); // Invoke the user-defined callback
        } catch (err) {
          console.error(`Error executing callback "${callbackName}":`, err);
        }
    } else {
        console.warn(`Callback function "${callbackName}" is not defined or not a function.`);
    }
  }

  // STEP 6: Final hook after successful submission handling
  if (!isDataEmpty(formTarget.id)) {
    hooks.doAction(`formSubmitted_${formTarget.id}`, formTarget, window.lcsForm.data);
  }
  hooks.doAction('formSubmitted', formTarget, window.lcsForm.data);
});

/**
 * Flag indicating that the form submission handler has been initialized.
 * @type {boolean}
 */
export const formSubmissionInitialized = true;