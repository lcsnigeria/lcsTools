/**
 * DOM Element Interaction Utilities
 * ---------------------------------
 * This module provides helper functions for simulating input, focus,
 * change events and controlling form field states programmatically.
 *
 * Useful for dynamic form control, testing behaviors, and advanced UI logic.
 */


/**
 * Sets the value of an input-like element and triggers the 'input' event manually.
 *
 * Supports <input>, <textarea>, and [contenteditable="true"] elements.
 *
 * @param {HTMLElement} element - The element to update and trigger input on.
 * @param {string} [value=''] - The value to assign before triggering the event.
 *
 * @example
 * // For input
 * triggerInput(document.querySelector('#search'), 'JavaScript');
 *
 * // For contenteditable
 * triggerInput(document.querySelector('[contenteditable]'), 'Hello world');
 */
export function triggerInput(element, value = '') {
    if (!(element instanceof HTMLElement)) return;

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.value = value;
    } else if (element.isContentEditable) {
        element.innerHTML = value;
    } else {
        return; // Not a supported input-like element
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Ensures an element is focusable and sets focus on it.
 *
 * Automatically removes 'disabled' and 'tabindex=-1' if present,
 * and ensures the element is visible before focusing.
 *
 * @param {HTMLElement} element - The element to focus.
 *
 * @example
 * focusElement(document.querySelector('#emailInput'));
 */
export function focusElement(element) {
    if (!element || typeof element.focus !== 'function') return;

    // Make sure it's not disabled
    if ('disabled' in element) {
        element.disabled = false;
    }

    // Make sure it's tabbable
    if (element.hasAttribute('tabindex') && element.getAttribute('tabindex') === '-1') {
        element.setAttribute('tabindex', '0');
    }

    // Ensure it's not hidden
    const style = window.getComputedStyle(element);
    const isHidden = style.display === 'none' || style.visibility === 'hidden';
    if (isHidden) {
        element.style.display = 'block';
        element.style.visibility = 'visible';
    }

    // Now focus
    element.focus();
}


/**
 * Determines whether a given DOM element (or element selected by a CSS selector) is visible in the viewport.
 *
 * Visibility is determined by:
 * - The element exists in the DOM.
 * - The element is not hidden via `display: none`, `visibility: hidden`, or `opacity: 0`.
 * - The element is fully within the current viewport.
 *
 * @param {Element|string} input - The DOM element or a CSS selector string to check for visibility.
 * @returns {boolean} Returns `true` if the element exists, is not hidden, and is fully within the viewport; otherwise, returns `false`.
 *
 * @example
 * // Using a DOM element
 * const myDiv = document.getElementById('myDiv');
 * if (isElementVisible(myDiv)) {
 *   console.log('myDiv is visible!');
 * }
 *
 * @example
 * // Using a CSS selector
 * if (isElementVisible('.my-class')) {
 *   console.log('.my-class element is visible!');
 * }
 *
 * @example
 * // Element does not exist
 * isElementVisible('#nonexistent'); // false
 *
 * @example
 * // Element is hidden with CSS
 * // <div id="hidden" style="display: none;"></div>
 * isElementVisible('#hidden'); // false
 */
export function isElementVisible(input) {
    // Determine if input is a selector string or an element
    const element = typeof input === 'string' ? document.querySelector(input) : input;

    // Check if the element exists
    if (!(element instanceof Element)) {
        return false;
    }

    // Check if the element is hidden via display: none, visibility: hidden, or opacity: 0
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
    }

    // Check if the element is within the viewport
    const rect = element.getBoundingClientRect();
    const inViewport =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth);

    return inViewport;
}

/**
 * Checks if a given string is a syntactically valid simple HTML selector.
 *
 * This function performs a basic pattern match to verify if the provided string
 * looks like a valid CSS selector (ID, class, or tag). It is suitable for simple 
 * selectors like `#id`, `.class-name`, `div`, `input[type="text"]`, etc.
 * 
 * ⚠️ Note: This does not fully validate all complex selectors, but it helps catch
 * obvious errors before passing to `document.querySelector()` to avoid runtime issues.
 * 
 * For full validation, consider wrapping `querySelector` in a `try-catch` block.
 *
 * @param {string} selector - The selector string to validate.
 * @returns {boolean} True if the selector appears valid, false otherwise.
 *
 * @example
 * isHTMLSelector('#loader');           // true
 * isHTMLSelector('.button-primary');   // true
 * isHTMLSelector('input[type="text"]');// true
 * isHTMLSelector('div');               // true
 * isHTMLSelector('');                  // false
 * isHTMLSelector('123invalid');        // false
 * isHTMLSelector(null);                // false
 */
export function isHTMLSelector(selector) {
    return typeof selector === 'string' &&
        /^(#([\w-]+)|\.([\w-]+)|[a-zA-Z][\w-]*([:\[\]=\'\"a-zA-Z0-9_\-\s]*)?)$/.test(selector);
}

/**
 * Changes the tag name of an existing DOM element while preserving attributes, styles, and children.
 * @param {HTMLElement} oldElement The element to change (must be in the DOM for replacement).
 * @param {string} newTagName The new tag name (e.g., 'div', 'span', 'p').
 * @param {boolean} [throwOnError=false] If true, throws errors instead of logging them.
 * @returns {HTMLElement|null} The new element with the updated tag name, or null if inputs are invalid.
 * @throws {Error} If throwOnError is true and inputs are invalid.
 * @note Event listeners on the old element are not preserved.
 * @example
 * // HTML: <div id="myElement" class="box" style="color: red;">Hello <span>World</span></div>
 * const oldElement = document.getElementById('myElement');
 * const newElement = changeElementTagName(oldElement, 'p');
 * // Result: <p id="myElement" class="box" style="color: red;">Hello <span>World</span></p>
 *
 * // With throwOnError enabled
 * try {
 *   changeElementTagName(oldElement, 'invalid tag', true); // Throws error for invalid tag name
 * } catch (error) {
 *   console.error(error.message);
 * }
 */
export function changeElementTagName(oldElement, newTagName, throwOnError = false) {
    // Validate oldElement
    if (!(oldElement instanceof HTMLElement)) {
        const error = new Error('The provided element is not a valid HTMLElement.');
        if (throwOnError) throw error;
        console.error(error.message);
        return null;
    }

    // Validate newTagName
    if (typeof newTagName !== 'string' || newTagName.trim() === '') {
        const error = new Error('newTagName must be a non-empty string.');
        if (throwOnError) throw error;
        console.error(error.message);
        return null;
    }
    newTagName = newTagName.toLowerCase();
    const validTagRegex = /^[a-z][a-z0-9\-]*$/i;
    if (!validTagRegex.test(newTagName)) {
        const error = new Error(`Invalid tag name: "${newTagName}". Must be a valid HTML tag.`);
        if (throwOnError) throw error;
        console.error(error.message);
        return null;
    }

    // Warn about custom elements
    if (newTagName.includes('-') && !customElements.get(newTagName)) {
        console.warn(`"${newTagName}" appears to be a custom element but is not registered.`);
    }

    // Create new element
    const newElement = document.createElement(newTagName);

    // Copy attributes
    oldElement.getAttributeNames().forEach(name => {
        newElement.setAttribute(name, oldElement.getAttribute(name));
    });

    // Copy inline styles
    newElement.style.cssText = oldElement.style.cssText;

    // Move children
    while (oldElement.firstChild) {
        newElement.appendChild(oldElement.firstChild);
    }

    // Replace in DOM
    if (!oldElement.parentNode) {
        console.warn('The element is not attached to the DOM. Returning new element without replacement.');
        return newElement;
    }
    oldElement.parentNode.replaceChild(newElement, oldElement);

    return newElement;
}