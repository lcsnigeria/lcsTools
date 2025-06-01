/**
 * Enables or disables smooth scrolling on the page by dynamically inserting 
 * or removing a CSS rule for `scroll-behavior: smooth`. It also includes an 
 * automatic smooth scroll feature when the page is loaded with a URL hash (e.g., `#section`).
 *
 * @function setSmoothScrolling
 * @param {boolean} [active=true] - Determines whether smooth scrolling is enabled or disabled.
 *                                  If `true`, smooth scrolling is enabled.
 *                                  If `false`, the smooth scrolling style is removed.
 *
 * @example
 * // Enable smooth scrolling:
 * setSmoothScrolling(true);
 *
 * @example
 * // Disable smooth scrolling:
 * setSmoothScrolling(false);
 *
 * @description
 * - When `active` is `true`, a `<style>` element is created with the ID 
 *   `smoothScrollStyleElement`, which applies the `scroll-behavior: smooth` 
 *   CSS rule to the `html` element, if it does not already exist.
 * - If smooth scrolling is disabled (`active === false`), the function removes
 *   the existing `<style>` element to restore normal scrolling behavior.
 * - This function also automatically detects if the page is loaded with a URL 
 *   fragment (e.g., `#section`) and smoothly scrolls to the target element if it exists.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior
 */
export function setSmoothScrolling(active = true) {

    let sssElement = document.getElementById("smoothScrollStyleElement");

    // Disable smooth scrolling if 'active' is false
    if (active === false) {
        if (sssElement) {
            // Clear existing css rules
            const styleSheet = sssElement.sheet;
            while (styleSheet.cssRules.length > 0) {
                styleSheet.deleteRule(0);
            }
            sssElement.remove();
        }
        return;
    }

    // Check if the <style> element already exists
    if (!sssElement) {
        // Create a new <style> element if it doesn't exist
        sssElement = document.createElement("style");
        sssElement.id = 'smoothScrollStyleElement';
        
        // Insert the <style> element into the <head> to apply the smooth scroll behavior
        document.head.appendChild(sssElement);
    }

    // Clear existing rules in case this is a reset
    const styleSheet = sssElement.sheet;
    while (styleSheet.cssRules.length > 0) {
        styleSheet.deleteRule(0);
    }

    // Assign the smooth scroll CSS rule to the <style> element
    const cssRule = `html { scroll-behavior: smooth; }`;
    styleSheet.insertRule(cssRule, styleSheet.cssRules.length);

    // Automatically scroll to a target element if a hash is present in the URL
    document.addEventListener('DOMContentLoaded', function() {
        const hash = window.location.hash;
        if (hash) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}


/**
 * Smoothly scrolls the page to the specified target element or selector.
 *
 * This function uses `scrollIntoView` with smooth behavior to animate scrolling
 * to a particular DOM element, either by CSS selector or direct element reference.
 * If the target is not found or invalid, a warning is logged.
 *
 * @param {string|Element} target - The selector (string) or DOM element to scroll to.
 * @returns {void}
 *
 * @example
 * // Scroll to an element by selector
 * scrollTo('#contactSection');
 *
 * // Scroll to a DOM element reference
 * const header = document.querySelector('header');
 * scrollTo(header);
 */
export function scrollTo(target) {
    let element;

    if (typeof target === 'string') {
        element = document.querySelector(target);
    } else if (target instanceof Element) {
        element = target;
    }

    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    } else {
        console.warn('Target element not found or invalid.');
    }
}