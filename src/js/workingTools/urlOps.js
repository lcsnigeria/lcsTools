/**
 * Updates the browser's history stack and address bar with a new state using the History API.
 *
 * This function allows you to push a new state onto the browser's session history stack.
 * It's useful for SPA (Single Page Application) navigation or dynamic URL updates without reloading the page.
 *
 * @function
 * @param {Object} [state={}] - Optional. A state object associated with the new history entry.
 *                              This object is available in the popstate event.
 * @param {string} title - The title of the new history entry. While currently unused by most browsers,
 *                         it's required by the History API.
 * @param {string} url - The new URL to be shown in the address bar. It must be of the same origin as the current page.
 *
 * @throws {TypeError} If title or url is not a string.
 * @throws {Error} If url is not same-origin as the current location.
 *
 * @example
 * // Push a new state to the browser's history
 * setNewHistory({ page: 2 }, "Page 2", "/section/page-2");
 *
 * @example
 * // Push a new state with no custom state
 * setNewHistory({}, "Home", "/home");
 */
export function setNewHistory(state = {}, title, url) {
    if (typeof title !== 'string' || typeof url !== 'string') {
        throw new TypeError("Both title and url must be strings.");
    }

    // Optional (strict) same-origin check
    const origin = window.location.origin;
    const testURL = new URL(url, origin);
    if (testURL.origin !== origin) {
        throw new Error("URL must be of the same origin as the current page.");
    }

    history.pushState(state, title, url);
}