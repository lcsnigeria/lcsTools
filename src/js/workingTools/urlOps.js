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

/**
 * Performs a programmatic hard refresh of the current page.
 * 
 * This method forces the browser to fetch a fresh copy from the server
 * by adding or updating a cache-busting query parameter (`t`) with the
 * current timestamp. It preserves all existing query parameters and hash fragments.
 * 
 * Usage:
 * ```js
 * hardRefresh(); // Refreshes the page immediately
 * ```
 *
 * Key Points:
 * - Existing query parameters are preserved.
 * - If a parameter named 't' already exists, it will be updated.
 * - Any URL hash (e.g., #section1) is preserved.
 * - Works reliably across modern browsers to bypass cache.
 * - Safe for both static pages and dynamic single-page applications.
 * 
 * @example
 * // Hard refresh the current page
 * hardRefresh();
 *
 * @example
 * // Can be called conditionally
 * if (needsFreshData) {
 *     hardRefresh();
 * }
 *
 * @returns {void} This function does not return a value; it reloads the page.
 */
export function hardRefresh() {
    const url = new URL(window.location.href);

    // Add or update the 't' cache-busting parameter with current timestamp
    url.searchParams.set('t', Date.now());

    // Redirect to the updated URL, triggering a full page reload
    window.location.href = url.toString();
}
