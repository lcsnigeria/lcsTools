/**
 * ===============================
 *  LOCAL STORAGE UTILITIES
 * ===============================
 * Provides simple, encoded JSON-safe methods for storing,
 * retrieving, updating, and clearing data in `localStorage`.
 */

/**
 * Stores a value in local storage under the specified key.
 *
 * Automatically serializes objects and arrays into JSON strings.
 * If `value` is `null`, the key is removed instead.
 *
 * @param {string} key - The key name.
 * @param {any} value - The value to store (string, number, object, or array).
 * @returns {void} - Does not return a value.
 *
 * @example
 * // Store a simple value
 * setLocalStorage('theme', 'dark');
 *
 * // Store a number
 * setLocalStorage('loginCount', 5);
 *
 * // Store an object
 * setLocalStorage('user', { id: 1, name: 'Jane Doe' });
 *
 * // Store an array
 * setLocalStorage('colors', ['red', 'green', 'blue']);
 *
 * // Remove a key
 * setLocalStorage('theme', null);
 */
export function setLocalStorage(key, value) {
    if (value === null) {
        localStorage.removeItem(key);
        return;
    }

    // Arrays and objects are JSON-stringified
    const val = Array.isArray(value) || typeof value === 'object'
        ? JSON.stringify(value)
        : value;

    localStorage.setItem(key, encodeURIComponent(val));
}

/**
 * Retrieves a value from local storage by key.
 *
 * Automatically decodes and parses stored JSON values.
 * Returns `null` if the key doesn't exist or decoding fails.
 *
 * @param {string} key - The key name.
 * @returns {any|null} - The stored value, parsed if JSON, or `null` if not found or invalid.
 *
 * @example
 * // Retrieve a simple value
 * const theme = getLocalStorage('theme'); // "dark"
 *
 * // Retrieve a stored object
 * const user = getLocalStorage('user'); // { id: 1, name: 'Jane Doe' }
 *
 * // Handle missing keys safely
 * const role = getLocalStorage('role') || 'guest';
 */
export function getLocalStorage(key) {
    const value = localStorage.getItem(key);
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
 * Append a value to an existing localStorage key.
 *
 * Behavior:
 * - If the stored value is an array, the new value is pushed onto it.
 * - If the stored value is an object, the new value is added as a key with `null` as value.
 * - Otherwise, the stored value and the new value are put into a new array: [currentValue, newValue].
 *
 * If the key does not exist, the function returns `false` and does nothing.
 *
 * @param {string} key - The localStorage key to append to.
 * @param {any} newValue - The value to append (can be object, array, primitive).
 * @returns {boolean} - `true` if append succeeded, `false` if the key did not exist.
 *
 * @example
 * // 1) Append to an existing array
 * // existing: ['a', 'b']
 * appendLocalStorage('letters', 'c'); // -> ['a','b','c']
 *
 * // 2) Merge into existing object
 * // existing: { a: 1 }
 * appendLocalStorage('settings', 'dark'); // -> { a: 1, dark: null }
 *
 * // 3) Append to existing primitive
 * // existing: 'note1'
 * appendLocalStorage('notes', 'note2'); // -> ['note1','note2']
 *
 * // 4) Key missing -> no-op
 * appendLocalStorage('missingKey', 123); // returns false
 */
export function appendLocalStorage(key, newValue) {
    const current = getLocalStorage(key);

    if (current === null) return false;

    let result;

    if (Array.isArray(current)) {
        result = current.slice();
        result.push(newValue);
    } else if (current && typeof current === 'object' && !Array.isArray(current)) {
        result = { ...current };
        result[newValue] = null;
    } else {
        result = [current, newValue];
    }

    setLocalStorage(key, result);
    return true;
}

/**
 * Clears one or all local storage keys.
 *
 * If a `key` is provided, only that item is removed.
 * If omitted, the entire local storage is cleared.
 *
 * @param {string} [key] - Optional key name to remove.
 * @returns {boolean} - `true` if operation succeeded.
 *
 * @example
 * // Remove a specific key
 * clearLocalStorage('theme');
 *
 * // Clear all local storage data
 * clearLocalStorage();
 */
export function clearLocalStorage(key) {
    if (key) {
        localStorage.removeItem(key);
    } else {
        localStorage.clear();
    }
    return true;
}