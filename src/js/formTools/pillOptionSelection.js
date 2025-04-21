// Importing the CSS file for styling the pill selection
import '../../css/formTools/pillOptionSelection.css';

import { generateCodes } from '../workingTools/credsAndCodes.js';

// Global storage for pill options data
window.lcsPillOptions = {};

/**
 * Generates a pill-style selection component with support for single/multiple selection and callbacks.
 *
 * @param {Object} data - Configuration object for the pill selection.
 * @param {string} [data.label] - Optional label text for the component.
 * @param {string} data.name - The name of the pill group (used for hidden input and tracking).
 * @param {Array} [data.options=[]] - Array of option objects with `label`, `value`, optional `icon`, `selected`, and `attributes`.
 * @param {boolean} [data.selectMultiple=false] - Whether multiple selections are allowed.
 * @param {number|boolean} [data.maxSelection=0] - Max number of selections (0/falsy: unlimited, true: 1, number: limit).
 * @param {Object} [data.attributes={}] - HTML attributes for the container (e.g., class).
 * @param {Function} [data.selectCallback] - Callback to run when an option is selected.
 * @param {Function} [data.diselectCallback] - Callback to run when an option is deselected.
 * @returns {string} - The generated HTML string for the component.
 */
export function generatePillOptions(data = {}) {
    const defaultData = {
        label: '',
        name: '',
        options: [],
        selectMultiple: false,
        maxSelection: 0,
        attributes: {},
        selectCallback: null,
        diselectCallback: null
    };

    const config = { ...defaultData, ...data };

    // Generate unique tracking ID
    const optionDataTrackingID = generateCodes('mixed', 10);

    // Normalize maxSelection
    const effectiveMaxSelection =
        config.maxSelection === true ? 1 :
        (typeof config.maxSelection === 'number' && config.maxSelection > 0 ? config.maxSelection : 0);

    // Initialize global data
    window.lcsPillOptions[optionDataTrackingID] = {
        selectMultiple: config.selectMultiple,
        maxSelection: effectiveMaxSelection,
        name: config.name,
        values: [],
        selectCallback: config.selectCallback,
        diselectCallback: config.diselectCallback
    };

    // Process options and collect pre-selected values
    let selectedCount = 0;
    config.options.forEach(option => {
        if (!option.label && !option.value) {
            throw new Error("Each option must have at least a 'label' or 'value'.");
        }

        if (!option.label) option.label = option.value;
        if (!option.value) option.value = option.label;

        if (option.selected && (!effectiveMaxSelection || selectedCount < effectiveMaxSelection)) {
            window.lcsPillOptions[optionDataTrackingID].values.push(option.value);
            selectedCount++;
        } else {
            option.selected = false;
        }
    });

    // Container attributes
    const wrapperAttrs = {
        class: `_form_group lcsPillOptionsSelection ${config.attributes.class || ''}`.trim(),
        'data-odt_id': optionDataTrackingID,
        ...config.attributes
    };

    // Generate HTML
    let output = `<div ${generateAttributes(wrapperAttrs)}>`;
    if (config.label) {
        output += `<span class="_label">${config.label}</span>`;
    }
    output += `
        <div class="_pill_options_wrapper">
            <div class="_pill_options" data-pill_options_name="${config.name}">
    `;

    config.options.forEach(option => {
        const {
            label,
            value,
            icon,
            selected = false,
            attributes: optionAttributes = []
        } = option;

        const optionClasses = `_pill_option${selected ? ' _selected' : ''}`;
        const optionAttrs = {
            class: optionClasses,
            'data-pill_option_value': value,
            ...optionAttributes.reduce((acc, { name, value }) => {
                acc[name] = value;
                return acc;
            }, {})
        };

        output += `
            <button type="button" ${generateAttributes(optionAttrs)}>
                ${icon ? `<i class="_option_icon ${icon}"></i>` : ''}
                <span class="_option_label">${label}</span>
            </button>
        `;
    });

    output += `
            </div>
            <input type="hidden" name="${config.name}" value="${JSON.stringify(window.lcsPillOptions[optionDataTrackingID].values)}">
        </div>
    </div>`;

    return output;
}

/**
 * Helper function: Converts an object of attributes into an HTML attribute string.
 *
 * @param {Object} attributes
 * @returns {string}
 */
function generateAttributes(attributes) {
    return Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
}

/**
 * Global event listener for handling click events on the pill options component.
 *
 * This listener manages the selection and deselection of pill options, enforcing
 * selection rules such as single or multiple selection and optional maximum selection limits.
 * It updates the associated hidden input field with the currently selected values
 * in JSON format and maintains component state via `window.lcsPillOptions`.
 *
 * Behavior:
 * - Toggles the selection state of the clicked pill option.
 * - In single-selection mode, ensures only one option is selected at a time.
 * - In multi-selection mode, enforces a maximum number of selections, if defined.
 * - Synchronizes the selection state with the corresponding hidden input element.
 * - Invokes optional `selectCallback` or `diselectCallback` handlers if configured.
 *
 * @param {MouseEvent} event - The click event triggered on the document.
 *
 * @listens document:click
 *
 * @throws {Error} If essential data attributes or structural elements are missing.
 * @throws {Error} If a clicked pill option lacks the `data-pill_option_value` attribute.
 *
 * @example
 * <!-- Example HTML structure -->
 * <div class="lcsPillOptionsSelection" data-odt_id="uniqueID">
 *   <div class="_pill_options" data-pill_options_name="favoriteColor">
 *     <button type="button" class="_pill_option" data-pill_option_value="red">Red</button>
 *     <button type="button" class="_pill_option" data-pill_option_value="blue">Blue</button>
 *   </div>
 *   <input type="hidden" name="favoriteColor" value="[]">
 * </div>
 *
 * // When a pill option is clicked:
 * // - It is visually marked as selected or deselected.
 * // - The hidden input is updated with the current selection(s) in JSON format.
 * // - The selection state is stored in `window.lcsPillOptions`.
 */
document.addEventListener('click', (event) => {
    const pillOptionsArea = event.target.closest('.lcsPillOptionsSelection');
    if (!pillOptionsArea) return;

    const pillOption = event.target.closest('._pill_option');
    if (!pillOption) return;

    const trackingID = pillOptionsArea.dataset.odt_id;
    const data = window.lcsPillOptions[trackingID];
    if (!trackingID || !data) {
        console.error(`No data found for pill options with odt_id: ${trackingID}`);
        return;
    }

    const value = pillOption.getAttribute('data-pill_option_value');
    if (!value) {
        console.error('No data-pill_option_value found on pill option');
        return;
    }

    const hiddenInput = pillOptionsArea.querySelector(`input[name="${data.name}"]`);
    if (!hiddenInput) {
        console.error(`Hidden input for name "${data.name}" not found`);
        return;
    }

    const isSelected = pillOption.classList.contains('_selected');
    const allSelected = pillOptionsArea.querySelectorAll('._pill_option._selected');
    const effectiveMax = data.selectMultiple ? data.maxSelection : 1;

    if (!isSelected && effectiveMax > 0 && allSelected.length >= effectiveMax) {
        console.warn(`Cannot select more than ${effectiveMax} options for ${data.name}`);
        return;
    }

    if (isSelected) {
        pillOption.classList.remove('_selected');
        data.values = data.values.filter(v => v !== value);
        if (typeof data.diselectCallback === 'function') {
            data.diselectCallback(value, data.values, pillOption, data.name);
        }
    } else {
        if (!data.selectMultiple) {
            allSelected.forEach(opt => opt.classList.remove('_selected'));
            data.values = [];
        }
        pillOption.classList.add('_selected');
        data.values.push(value);
        if (typeof data.selectCallback === 'function') {
            data.selectCallback(value, data.values, pillOption, data.name);
        }
    }

    hiddenInput.value = JSON.stringify(data.values);
});

/**
 * Module flag for identifying import
 */
export const lcsPillOptionSelection = true;