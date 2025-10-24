/**
 * ===============================
 *  COOKIE UTILITIES
 * ===============================
 * Encoded, JSON-safe helpers for storing, retrieving, updating,
 * and clearing cookies. Uses `encodeURIComponent`/`decodeURIComponent`
 * and basic JSON detection for objects/arrays.
 */

/**
 * Sets a cookie with a name, value, and optional expiration time.
 *
 * - Supports strings, numbers, objects, and arrays.
 * - If `value` is `null`, the cookie is removed.
 * - Default expiry is 24 hours (86400 seconds). Set `expires` to 0 to create a session cookie.
 *
 * @param {string} name - Cookie name.
 * @param {any} value - Value to store (string, number, object, array) or `null` to remove.
 * @param {number} [expires=86400] - Expiration in seconds (default: 1 day). 0 → session cookie.
 * @returns {void}
 *
 * @example
 * // Store a string for 1 hour
 * setCookie('authToken', 'xyz123', 3600);
 *
 * // Store an object
 * setCookie('user', { id: 1, name: 'John' });
 *
 * // Store an array
 * setCookie('letters', ['a','b','c']);
 *
 * // Remove a cookie
 * setCookie('authToken', null);
 */
export function setCookie(name, value, expires = 86400) {
    if (value === null) {
        document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        return;
    }

    // Convert objects and arrays to JSON, everything else to string
    const storeValue = (typeof value === 'object') ? JSON.stringify(value) : String(value);

    let expiresString = '';
    if (typeof expires === 'number' && expires > 0) {
        const date = new Date();
        date.setTime(date.getTime() + expires * 1000);
        expiresString = `;expires=${date.toUTCString()}`;
    }

    const secure = window.location.protocol === 'https:' ? ';Secure' : '';
    const sameSite = ';SameSite=Lax'; // default CSRF-safe

    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(storeValue)}${expiresString};path=/${sameSite}${secure}`;
}

/**
 * Appends a value to an existing cookie.
 *
 * - If the cookie stores an array, the new value is pushed onto it.
 * - If the cookie stores an object, the new value becomes a key with `null` as value (or merges if object).
 * - If the cookie stores a primitive, both current and new values are wrapped in an array.
 * - Returns `true` if append succeeded, `false` if the cookie does not exist.
 *
 * @param {string} name - Cookie name.
 * @param {any} newValue - Value to append (primitive, object, or array).
 * @param {number} [expires=86400] - Optional expiration in seconds for the updated cookie.
 * @returns {boolean} `true` if appended, `false` if cookie does not exist.
 *
 * @example
 * // Append to an existing array cookie
 * // existing: ['a','b']
 * appendCookie('letters', 'c'); // -> ['a','b','c']
 *
 * // Append to an existing primitive
 * // existing: 'note1'
 * appendCookie('notes', 'note2'); // -> ['note1','note2']
 *
 * // Append to an existing object
 * // existing: {a:1}
 * appendCookie('settings', 'b'); // -> {a:1, b:null}
 *
 * // Cookie missing -> returns false
 * appendCookie('missingCookie', 123); // -> false
 */
export function appendCookie(name, newValue, expires = 86400) {
    const current = getCookie(name);
    if (current === null) return false;

    let parsed;
    try {
        parsed = JSON.parse(current);
    } catch {
        // treat as primitive string
        parsed = current;
    }

    let result;

    if (Array.isArray(parsed)) {
        result = parsed.slice();
        result.push(newValue);
    } else if (typeof parsed === 'object' && parsed !== null) {
        result = { ...parsed };
        if (typeof newValue === 'object' && !Array.isArray(newValue)) {
            Object.keys(newValue).forEach(k => {
                result[k] = newValue[k];
            });
        } else {
            result[newValue] = null;
        }
    } else {
        // primitive → wrap in array
        result = [parsed, newValue];
    }

    setCookie(name, result, expires);
    return true;
}

/**
 * Retrieve a cookie value by name.
 *
 * - Decodes the cookie and parses JSON when the value begins with `{` or `[` .
 * - Returns `null` if the cookie is missing or its literal value is 'null'.
 *
 * @param {string} name - Cookie name.
 * @returns {any|null} - Parsed value (object/array) or string, or `null` if not found.
 *
 * @example
 * // Get a stored string
 * const token = getCookie('authToken'); // 'xyz123' or null
 *
 * // Get a stored object
 * const user = getCookie('user'); // { id: 1, name: 'John' } or null
 */
export function getCookie(name) {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie ? document.cookie.split(';') : [];

    for (let c of cookies) {
        c = c.trim();
        if (c.startsWith(nameEQ)) {
            const raw = decodeURIComponent(c.substring(nameEQ.length));
            if (raw === 'null') return null;
            try {
                if (raw.startsWith('{') || raw.startsWith('[')) {
                    return JSON.parse(raw);
                }
            } catch (e) {
                // fall through to return raw string if JSON parse fails
                console.error('getCookie: JSON parse failed for', name, e);
            }
            return raw;
        }
    }
    return null;
}

/**
 * Remove a cookie by name.
 *
 * @param {string} name - Cookie name to remove.
 * @returns {boolean} - `true` on success.
 *
 * @example
 * // Remove a session cookie on logout
 * clearCookie('authToken');
 */
export function clearCookie(name) {
    // overwrite with past expiry
    document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    return true;
}