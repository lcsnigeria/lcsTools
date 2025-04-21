// Importing the CSS file for styling the dropdown selection
import '../../css/formTools/dropdownOptionSelection.css';

/**
 * Generates a custom dropdown with selectable options and optional search bar.
 *
 * @param {string} name - The name of the dropdown group (used as the name attribute of the hidden input).
 * @param {Array} options - An array of option objects with `label`, `value`, optional `icon`, `selected`, and `attributes`.
 * @param {string} [placeholder='Select options'] - Default placeholder text if no option is selected.
 * @param {boolean} [searchBar=false] - Whether to include a search input.
 * @param {Object} [attributes={}] - Optional attributes, supports:
 *   - class: Additional class for the container
 * @returns {string} - The HTML markup for the custom dropdown.
 */
export function generateDropdownOptions(name, options = [], placeholder = 'Select options', searchBar = false, attributes = {}) {
    // Determine the selected option (if any)
    let selectedOption = null;
    let selectedFound = false;

    options.forEach(option => {
        if (!option.label && !option.value) {
            throw new Error("Each option must have at least a 'label' or 'value'.");
        }

        if (!option.label) option.label = option.value;
        if (!option.value) option.value = option.label;

        if (option.selected && !selectedFound) {
            selectedOption = option;
            selectedFound = true;
        } else {
            option.selected = false;
        }
    });

    const displayPlaceholder = selectedOption?.label || placeholder;

    const wrapperAttrs = {
        class: `_form_group ${attributes.class || ''}`.trim(),
        ...attributes
    };

    let output = `<div ${generateAttributes(wrapperAttrs)}>`;
    output += `
        <div class="_dropdown_options_placeholder">
            <span>${displayPlaceholder}</span>
            <i class="fas fa-chevron-down"></i>
        </div>
        <div class="_dropdown_options_wrapper">
            ${searchBar ? `<input type="search" class="_dropdown_search" placeholder="Search...">` : ''}
            <div class="_dropdown_options" data-dropdown_options_name="${name}">
    `;

    options.forEach(option => {
        const {
            label,
            value,
            icon,
            selected = false,
            attributes: optionAttributes = []
        } = option;

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
            <input type="hidden" class="_dropdown_options_value" name="${name}" value="${selectedOption?.value || ''}" required>
        </div>
    </div>`;

    return output;
}

/**
 * Helper: Converts an object of attributes to HTML attribute string.
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
 * Dropdown behavior for custom dropdowns created by generateDropdownOptions().
 * Handles toggling options, updating input/placeholder, and icon switching.
 */
document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", (e) => {
        const placeholder = e.target.closest("._dropdown_options_placeholder");
        const option = e.target.closest("._dropdown_option");

        // Clicked inside a placeholder — toggle options
        if (placeholder) {
            const dropdownGroup = placeholder.closest("._form_group");

            // Toggle active state
            dropdownGroup.classList.toggle("_active");

            // Swap chevron icon
            const icon = placeholder.querySelector("i");
            if (icon) {
                icon.classList.toggle("fa-chevron-down");
                icon.classList.toggle("fa-chevron-up");
            }

            return; // stop here for placeholder clicks
        }

        // Clicked on an option
        if (option) {
            const optionsContainer = option.closest("._dropdown_options");
            const allOptions = optionsContainer.querySelectorAll("._dropdown_option");
            const dropdownGroup = option.closest("._form_group");

            const input = dropdownGroup.querySelector("._dropdown_options_value");
            const placeholderText = dropdownGroup.querySelector("._dropdown_options_placeholder span");

            // Remove _selected from all
            allOptions.forEach(opt => opt.classList.remove("_selected"));

            // Mark this one as selected
            option.classList.add("_selected");

            // Update placeholder text and input value
            placeholderText.textContent = option.querySelector("._dropdown_option_label").textContent;
            input.value = option.getAttribute("data-dropdown_option_value");

            // Close the dropdown
            dropdownGroup.classList.remove("_active");

            // Reset chevron icon
            const icon = dropdownGroup.querySelector("._dropdown_options_placeholder i");
            if (icon) {
                icon.classList.add("fa-chevron-down");
                icon.classList.remove("fa-chevron-up");
            }

            return;
        }

        // Clicked outside dropdown — close any open ones
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
 * Filters visible options as user types into the search input.
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

            if (text.includes(filter)) {
                option.style.display = "";
            } else {
                option.style.display = "none";
            }
        });
    });
});

/**
 * 
 */
export const lcsDropdownOptionSelection = true;