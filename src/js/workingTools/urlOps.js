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

/**
 * Parse URL query parameters with optional selective key extraction.
 *
 * Features:
 * - Uses current URL if urlString is null
 * - Supports comma-separated key string ("a,b,c")
 * - Supports array of keys (['a','b'])
 * - Supports nested bracket notation (?user[name]=John)
 * - Handles repeated keys as arrays
 * - Automatic type casting (true, false, null, numbers)
 * - Configurable null handling
 *
 * @param {string|null} urlString Optional full URL. Defaults to current URL.
 * @param {Object} [options={}]
 * @param {string|array|null} [options.keys=null] Specific key(s) to retrieve
 * @param {'include'|'exclude'} [options.nullHandling='include']
 *        - 'include': keep null values
 *        - 'exclude': remove keys with null values
 *
 * @returns {Object|any|null}
 *
 * @example
 * // URL: ?page=2&active=true&tag=a&tag=b
 *
 * parseUrlQuery();
 * // => { page: 2, active: true, tag: ['a','b'] }
 *
 * parseUrlQuery(null, { keys: 'page' });
 * // => 2
 *
 * parseUrlQuery(null, { keys: 'page,active' });
 * // => { page: 2, active: true }
 *
 * parseUrlQuery(null, { keys: ['page','tag'] });
 * // => { page: 2, tag: ['a','b'] }
 */
export function parseUrlQuery(urlString = null, options = {}) {
    const {
        keys = null,
        nullHandling = 'include'
    } = options;

    const url = urlString
        ? new URL(urlString, window.location.origin)
        : window.location;

    const params = new URLSearchParams(url.search);
    const result = {};

    const castValue = (value) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (value === 'null') return null;

        // safer number casting
        if (/^-?\d+(\.\d+)?$/.test(value)) {
            return Number(value);
        }

        return value;
    };

    const assignNested = (obj, path, value) => {
        const segments = path.replace(/\]/g, '').split('[');
        let current = obj;

        segments.forEach((segment, index) => {
            const isLast = index === segments.length - 1;

            if (isLast) {
                if (current[segment] !== undefined) {
                    current[segment] = Array.isArray(current[segment])
                        ? [...current[segment], value]
                        : [current[segment], value];
                } else {
                    current[segment] = value;
                }
            } else {
                if (!current[segment] || typeof current[segment] !== 'object') {
                    current[segment] = {};
                }
                current = current[segment];
            }
        });
    };

    for (const [rawKey, rawValue] of params.entries()) {
        const decodedKey = decodeURIComponent(rawKey);
        const decodedValue = castValue(decodeURIComponent(rawValue));

        if (nullHandling === 'exclude' && decodedValue === null) {
            continue;
        }

        if (decodedKey.includes('[')) {
            assignNested(result, decodedKey, decodedValue);
        } else {
            if (result[decodedKey] !== undefined) {
                result[decodedKey] = Array.isArray(result[decodedKey])
                    ? [...result[decodedKey], decodedValue]
                    : [result[decodedKey], decodedValue];
            } else {
                result[decodedKey] = decodedValue;
            }
        }
    }

    if (!keys) return result;

    let requestedKeys;

    if (Array.isArray(keys)) {
        requestedKeys = keys;
    } else if (typeof keys === 'string') {
        requestedKeys = keys
            .split(',')
            .map(k => k.trim())
            .filter(Boolean);
    } else {
        return null;
    }

    if (requestedKeys.length === 1) {
        return result[requestedKeys[0]] ?? null;
    }

    const filtered = {};
    requestedKeys.forEach(k => {
        if (k in result) {
            filtered[k] = result[k];
        }
    });

    return filtered;
}

/**
 * Build a URL query string from an object.
 *
 * Supports:
 * - Nested objects -> bracket notation: { user: { name: 'a' } } => user[name]=a
 * - Arrays:
 *   - 'brackets' (default): tags[]=a&tags[]=b
 *   - 'repeat'  : tags=a&tags=b
 *   - 'comma'   : tags=a,b
 * - Optional leading '?' (prefix option)
 * - Optional key sorting for deterministic output (useful for caching/signing)
 * - Configurable handling of null/undefined values
 *
 * @param {Object} obj Plain object to convert (will be traversed recursively)
 * @param {Object} [options]
 * @param {boolean} [options.prefix=true] Add leading '?' when result not empty
 * @param {'brackets'|'repeat'|'comma'} [options.arrayFormat='brackets'] How arrays are serialized
 * @param {boolean} [options.sort=false] Sort keys lexicographically
 * @param {boolean} [options.encode=true] URL-encode keys and values
 * @param {'skip'|'empty'|'literal'} [options.nullHandling='skip']
 *        - 'skip' : omit null/undefined entries (default)
 *        - 'empty': include key= (empty string)
 *        - 'literal': include key=null (string "null")
 * @returns {string} Query string (with or without leading '?', based on options.prefix)
 *
 * @example
 * buildUrlQuery({ page: 2, active: true })
 * // => "?page=2&active=true"
 *
 * @example
 * buildUrlQuery({ tags: ['a','b'] }, { arrayFormat: 'repeat', prefix: false })
 * // => "tags=a&tags=b"
 *
 * @example
 * buildUrlQuery({ user: { name: 'John', age: 30 }, q: null }, { nullHandling: 'empty' })
 * // => "?user[name]=John&user[age]=30&q="
 */
export function buildUrlQuery(obj, options = {}) {
    const {
        prefix = true,
        arrayFormat = 'brackets', // 'brackets' | 'repeat' | 'comma'
        sort = false,
        encode = true,
        nullHandling = 'skip' // 'skip' | 'empty' | 'literal'
    } = options || {};

    if (obj == null || typeof obj !== 'object') {
        return prefix ? '?' : '';
    }

    const encodeKey = (k) => (encode ? encodeURIComponent(k) : k);
    const encodeVal = (v) => (encode ? encodeURIComponent(v) : v);

    const parts = [];

    const add = (key, value) => {
        // value may be string|number|boolean|null
        if (value === undefined) return;
        if (value === null) {
            if (nullHandling === 'skip') return;
            if (nullHandling === 'empty') {
                parts.push(`${encodeKey(key)}=`);
                return;
            }
            // literal
            parts.push(`${encodeKey(key)}=${encodeVal('null')}`);
            return;
        }
        // Dates -> ISO
        if (value instanceof Date) {
            parts.push(`${encodeKey(key)}=${encodeVal(value.toISOString())}`);
            return;
        }
        // boolean/number/string
        parts.push(`${encodeKey(key)}=${encodeVal(String(value))}`);
    };

    const isPlainObject = (v) =>
        v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);

    const build = (prefixKey, value) => {
        if (Array.isArray(value)) {
            if (arrayFormat === 'comma') {
                // join primitives; if nested objects present, fallback to repeated brackets
                const flat = value
                    .filter((it) => it !== undefined && it !== null && (typeof it !== 'object'))
                    .map((it) => (it instanceof Date ? it.toISOString() : String(it)));

                if (flat.length > 0) {
                    add(prefixKey, flat.join(','));
                } else {
                    // fallback to repeated entries for complex items
                    value.forEach((item) => build(prefixKey, item));
                }
            } else if (arrayFormat === 'repeat') {
                value.forEach((item) => {
                    if (isPlainObject(item) || Array.isArray(item)) {
                        // nested structure: use bracketed index syntax
                        build(`${prefixKey}[]`, item);
                    } else if (item === null || item === undefined) {
                        build(prefixKey, item);
                    } else {
                        add(prefixKey, item);
                    }
                });
            } else { // brackets
                value.forEach((item) => {
                    if (isPlainObject(item) || Array.isArray(item)) {
                        build(`${prefixKey}[]`, item);
                    } else if (item === null || item === undefined) {
                        build(`${prefixKey}[]`, item);
                    } else {
                        add(`${prefixKey}[]`, item);
                    }
                });
            }
            return;
        }

        if (isPlainObject(value)) {
            const keys = Object.keys(value);
            const ordered = sort ? keys.sort() : keys;
            ordered.forEach((k) => {
                const nestedKey = `${prefixKey}[${k}]`;
                build(nestedKey, value[k]);
            });
            return;
        }

        // primitive or Date
        add(prefixKey, value);
    };

    // top-level keys
    const topKeys = Object.keys(obj);
    const orderedTopKeys = sort ? topKeys.sort() : topKeys;

    orderedTopKeys.forEach((k) => {
        const v = obj[k];
        build(k, v);
    });

    if (parts.length === 0) return prefix ? '' : '';

    const qs = parts.join('&');
    return prefix ? `?${qs}` : qs;
}