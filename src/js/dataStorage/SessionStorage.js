/**
 * ===============================
 *  SESSION STORAGE UTILITIES
 * ===============================
 * Encoded, JSON-safe helpers for storing, retrieving, updating,
 * and clearing values in `sessionStorage`.
 */

/**
 * Stores a value in sessionStorage under the specified key.
 *
 * - Objects and arrays are JSON-stringified.
 * - If `value` is `null`, the key is removed.
 *
 * @param {string} key - Storage key.
 * @param {any} value - Value to store (string, number, object, array) or `null` to remove.
 * @returns {void}
 *
 * @example
 * // Store a primitive
 * setSessionStorage('token', 'abc123');
 *
 * // Store a number
 * setSessionStorage('loginCount', 5);
 *
 * // Store an object
 * setSessionStorage('cart', { items: [1,2,3], total: 4500 });
 *
 * // Store an array
 * setSessionStorage('colors', ['red','green','blue']);
 *
 * // Remove a key
 * setSessionStorage('token', null);
 */
export function setSessionStorage(key, value) {
    if (value === null) {
        sessionStorage.removeItem(key);
        return;
    }

    const val = Array.isArray(value) || typeof value === 'object'
        ? JSON.stringify(value)
        : value;

    sessionStorage.setItem(key, encodeURIComponent(val));
}

/**
 * Appends a value to an existing sessionStorage key.
 *
 * - If the stored value is an array, the new value is pushed onto it.
 * - If the stored value is an object, the new value is added as a key with `null` as value.
 * - If the stored value is a primitive, both the old and new values are wrapped into an array.
 * - Returns `true` if append succeeded, `false` if the key does not exist.
 *
 * @param {string} key - The sessionStorage key to append to.
 * @param {any} newValue - The value to append (primitive, object, or array).
 * @returns {boolean} `true` if append succeeded, `false` if the key does not exist.
 *
 * @example
 * // Append to an existing array
 * // existing: ['a','b']
 * appendSessionStorage('letters', 'c'); // -> ['a','b','c']
 *
 * // Append to an existing primitive
 * // existing: 'note1'
 * appendSessionStorage('notes', 'note2'); // -> ['note1','note2']
 *
 * // Append to an existing object
 * // existing: {a:1}
 * appendSessionStorage('settings', 'b'); // -> {a:1, b:null}
 *
 * // Key missing -> returns false
 * appendSessionStorage('missingKey', 123); // -> false
 */
export function appendSessionStorage(key, newValue) {
    const current = getSessionStorage(key);

    if (current === null) {
        return false; // key doesn't exist
    }

    let result;

    if (Array.isArray(current)) {
        result = current.slice();
        result.push(newValue);
    } else if (typeof current === 'object') {
        result = { ...current };
        if (typeof newValue === 'object' && !Array.isArray(newValue)) {
            // Merge object keys
            Object.keys(newValue).forEach(k => {
                result[k] = newValue[k];
            });
        } else {
            result[newValue] = null;
        }
    } else {
        // Primitive value → wrap into array
        result = [current, newValue];
    }

    setSessionStorage(key, result);
    return true;
}

/**
 * Retrieve a value from sessionStorage.
 *
 * - Decodes stored value and parses JSON if applicable.
 * - Returns `null` when key is missing or parsing fails.
 *
 * @param {string} key - Storage key.
 * @returns {any|null} The stored value (parsed) or `null` if not found/invalid.
 *
 * @example
 * // Get a primitive
 * const token = getSessionStorage('token'); // "abc123" or null
 *
 * // Get an object
 * const cart = getSessionStorage('cart'); // { items: [1,2,3], total: 4500 }
 *
 * // Use fallback when missing
 * const lastStep = getSessionStorage('wizardStep') ?? 1;
 */
export function getSessionStorage(key) {
    const value = sessionStorage.getItem(key);
    if (!value) return null;
    try {
        const decoded = decodeURIComponent(value);
        return decoded.startsWith('{') || decoded.startsWith('[')
            ? JSON.parse(decoded)
            : decoded;
    } catch {
        return null;
    }
}

/**
 * Clear a sessionStorage key or clear the entire sessionStorage.
 *
 * @param {string} [key] - Optional key to remove. If omitted, clears all sessionStorage.
 * @returns {boolean} `true` if operation succeeded.
 *
 * @example
 * // Remove a single key
 * clearSessionStorage('token');
 *
 * // Clear all sessionStorage data (e.g., on logout)
 * clearSessionStorage();
 */
export function clearSessionStorage(key) {
    if (key) {
        sessionStorage.removeItem(key);
    } else {
        sessionStorage.clear();
    }
    return true;
}