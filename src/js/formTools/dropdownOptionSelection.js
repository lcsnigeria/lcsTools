// Importing the CSS file for styling the dropdown selection
import '../../css/formTools/dropdownOptionSelection.css';
import { generateCodes } from '../workingTools/credsAndCodes.js';

// Initialize global storage
window.lcsDropdownOptions = {};

/**
 * Generates a custom dropdown with selectable options and optional search bar.
 *
 * @param {Object} config - Configuration object for the dropdown.
 * @param {string} [config.label] - Optional label text above the dropdown.
 * @param {string} config.name - Name of the dropdown group (used for hidden input).
 * @param {Array} [config.options=[]] - Array of option objects with `label`, `value`, optional `icon`, `selected`, and `attributes`.
 * @param {string} [config.placeholder='Select options'] - Placeholder text if no option is selected.
 * @param {boolean} [config.searchBar=false] - Whether to include a search input.
 * @param {Object} [config.attributes={}] - HTML attributes for the container (e.g., { class: 'custom-class' }).
 * @param {Function} [config.selectCallback] - Callback when an option is selected: (value, optionElement, name).
 * @returns {string} - The HTML markup for the custom dropdown.
 */
export function generateDropdownOptions(config = {}) {
    const defaultConfig = {
        label: '',
        name: '',
        options: [],
        placeholder: 'Select options',
        searchBar: false,
        attributes: {},
        selectCallback: null
    };

    const finalConfig = { ...defaultConfig, ...config };
    const dropdownID = generateCodes('mixed', 10);

    window.lcsDropdownOptions[dropdownID] = {
        name: finalConfig.name,
        selectCallback: finalConfig.selectCallback
    };

    let selectedOption = null;
    finalConfig.options.forEach(option => {
        if (!option.label && !option.value) {
            throw new Error("Each option must have at least a 'label' or 'value'.");
        }
        if (!option.label) option.label = option.value;
        if (!option.value) option.value = option.label;
        if (option.selected && !selectedOption) {
            selectedOption = option;
        } else {
            option.selected = false;
        }
    });

    const displayPlaceholder = selectedOption?.label || finalConfig.placeholder;
    
    const wrapperAttrs = finalConfig.attributes || {};
    if (Object.keys(wrapperAttrs).includes('class')) {
        wrapperAttrs.class = '_form_group ' + wrapperAttrs.class;
    } else {
        wrapperAttrs.class = '_form_group';
    }
    wrapperAttrs['data-dropdown_id'] = dropdownID;

    let output = `<div ${generateAttributes(wrapperAttrs)}>`;
    if (finalConfig.label) {
        output += `<span class="_label">${finalConfig.label}</span>`;
    }
    output += `
        <div class="_dropdown_options_placeholder">
            <span>${displayPlaceholder}</span>
            <i class="fas fa-chevron-down"></i>
        </div>
        <div class="_dropdown_options_wrapper">
            ${finalConfig.searchBar ? `<input type="search" class="_dropdown_search" placeholder="Search...">` : ''}
            <div class="_dropdown_options" data-dropdown_options_name="${finalConfig.name}">
    `;

    finalConfig.options.forEach(option => {
        const { label, value, icon, selected = false, attributes: optionAttributes = [] } = option;
        const optionClasses = `_dropdown_option${selected ? ' _selected' : ''}`;
        const optionAttrs = {
            class: optionClasses,
            'data-dropdown_option_value': value,
            ...optionAttributes.reduce((acc, { name, value }) => {
                acc[name] = value;
                return acc;
            }, {})
        };

        output += `
            <div ${generateAttributes(optionAttrs)}>
                ${icon ? `<i class="${icon}"></i>` : ''}
                <span class="_dropdown_option_label">${label}</span>
            </div>
        `;
    });

    output += `
            </div>
            <input type="hidden" class="_dropdown_options_value" name="${finalConfig.name}" value="${selectedOption?.value || ''}">
        </div>
    </div>`;

    return output;
}

/**
 * Helper: Converts an object of attributes to HTML attribute string.
 */
function generateAttributes(attributes) {
    return Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
}

/**
 * Dropdown behavior for custom dropdowns.
 */
document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", (e) => {
        const placeholder = e.target.closest("._dropdown_options_placeholder");
        const option = e.target.closest("._dropdown_option");

        if (placeholder) {
            const dropdownGroup = placeholder.closest("._form_group");
            dropdownGroup.classList.toggle("_active");
            const icon = placeholder.querySelector("i");
            if (icon) {
                icon.classList.toggle("fa-chevron-down");
                icon.classList.toggle("fa-chevron-up");
            }
            return;
        }

        if (option) {
            const optionsContainer = option.closest("._dropdown_options");
            const allOptions = optionsContainer.querySelectorAll("._dropdown_option");
            const dropdownGroup = option.closest("._form_group");

            const input = dropdownGroup.querySelector("._dropdown_options_value");
            const placeholderText = dropdownGroup.querySelector("._dropdown_options_placeholder span");

            allOptions.forEach(opt => opt.classList.remove("_selected"));
            option.classList.add("_selected");

            placeholderText.textContent = option.querySelector("._dropdown_option_label").textContent;
            input.value = option.getAttribute("data-dropdown_option_value");

            dropdownGroup.classList.remove("_active");
            const icon = dropdownGroup.querySelector("._dropdown_options_placeholder i");
            if (icon) {
                icon.classList.add("fa-chevron-down");
                icon.classList.remove("fa-chevron-up");
            }

            const dropdownID = dropdownGroup.getAttribute('data-dropdown_id');
            const dropdownData = window.lcsDropdownOptions[dropdownID];
            if (dropdownData && typeof dropdownData.selectCallback === 'function') {
                const selectedValue = option.getAttribute("data-dropdown_option_value");
                dropdownData.selectCallback(selectedValue, option, dropdownData.name);
            }

            return;
        }

        const dropdownWrapper = e.target.closest("._dropdown_options_wrapper");
        if (!dropdownWrapper) {
            document.querySelectorAll("._form_group._active").forEach(group => {
                group.classList.remove("_active");
                const icon = group.querySelector("._dropdown_options_placeholder i");
                if (icon) {
                    icon.classList.add("fa-chevron-down");
                    icon.classList.remove("fa-chevron-up");
                }
            });
        }
    });
});

/**
 * Dropdown search filtering logic.
 */
document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("input", (e) => {
        const searchInput = e.target;
        if (!searchInput.closest("._dropdown_options_wrapper") || searchInput.type !== "search") return;

        const wrapper = searchInput.closest("._dropdown_options_wrapper");
        const optionsContainer = wrapper.querySelector("._dropdown_options");
        const filter = searchInput.value.trim().toLowerCase();

        optionsContainer.querySelectorAll("._dropdown_option").forEach(option => {
            const label = option.querySelector("._dropdown_option_label");
            const text = label ? label.textContent.trim().toLowerCase() : "";
            option.style.display = text.includes(filter) ? "" : "none";
        });
    });
});

export const lcsDropdownOptionSelection = true;