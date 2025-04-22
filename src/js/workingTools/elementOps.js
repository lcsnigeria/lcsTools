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