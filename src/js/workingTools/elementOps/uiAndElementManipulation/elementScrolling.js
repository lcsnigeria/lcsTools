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
 * Smoothly scrolls the page or nearest scrollable container
 * to a target element using native browser behavior.
 *
 * This method is intent-based and lets the browser decide
 * which container(s) should scroll.
 *
 * @param {string|Element} target
 * @param {Object} [options]
 * @param {'start'|'center'|'end'|'nearest'} [options.block='center']
 * @param {'start'|'center'|'end'|'nearest'} [options.inline='center']
 * @param {'smooth'|'auto'} [options.behavior='smooth']
 *
 * @example
 * scrollTo('#section');
 * scrollTo('.tab.active', { inline: 'start' });
 */
export function scrollTo(target, options = {}) {
    const element =
        typeof target === 'string' ? document.querySelector(target) : target;

    if (!(element instanceof Element)) {
        throw new Error('Target element not found or invalid.');
    }

    const {
        block = 'center',
        inline = 'center',
        behavior = 'smooth'
    } = options;

    element.scrollIntoView({
        block,
        inline,
        behavior
    });
}

/**
 * Scrolls a container to position a child element.
 * Designed for precision-controlled scrolling.
 *
 * @param {HTMLElement|string} container
 * @param {HTMLElement|string} target
 * @param {'x'|'y'|'both'} [axis='x']
 * @param {'smooth'|'auto'} [behavior='smooth']
 *
 * @example
 * scrollToChild('.tabs', '.tab.active');
 * scrollToChild('.list', '.item.active', 'y');
 * scrollToChild('.grid', '.cell.active', 'both', 'auto');
 */
export function scrollToChild(container, target, axis = 'x', behavior = 'smooth') {
    const containerEl =
        typeof container === 'string' ? document.querySelector(container) : container;

    const targetEl =
        typeof target === 'string' ? document.querySelector(target) : target;

    if (!(containerEl instanceof Element) || !(targetEl instanceof Element)) {
        throw new Error('Invalid container or target element for scrolling.');
    }

    const containerRect = containerEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const options = { behavior };

    if (axis === 'x' || axis === 'both') {
        const rawLeft =
            targetRect.left
            - containerRect.left
            + containerEl.scrollLeft
            - (containerEl.clientWidth / 2)
            + (targetEl.clientWidth / 2);

        options.left = Math.max(
            0,
            Math.min(rawLeft, containerEl.scrollWidth - containerEl.clientWidth)
        );
    }

    if (axis === 'y' || axis === 'both') {
        const rawTop =
            targetRect.top
            - containerRect.top
            + containerEl.scrollTop
            - (containerEl.clientHeight / 2)
            + (targetEl.clientHeight / 2);

        options.top = Math.max(
            0,
            Math.min(rawTop, containerEl.scrollHeight - containerEl.clientHeight)
        );
    }

    containerEl.scrollTo(options);
}