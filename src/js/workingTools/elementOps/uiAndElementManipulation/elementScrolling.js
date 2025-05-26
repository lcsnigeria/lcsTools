/**
 * Smoothly scrolls the page to the specified target element or selector.
 *
 * @param {string|Element} target - The selector (string) or DOM element to scroll to.
 * @returns {void}
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