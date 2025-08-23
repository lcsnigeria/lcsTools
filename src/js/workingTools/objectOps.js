/**
 * Gets an object key by either index or value.
 *
 * @param {Object} obj - The object to search within.
 * @param {number|string} indexOrValue - If number, get the key at that index.
 *                                      If string, find the key by its value.
 * @returns {string|null} - The key found, or null if not found.
 *
 * @example
 * const ppData = {
 *   package: 'platform_package_editor_pp',
 *   plugin: 'platform_package_editor_pplugin'
 * };
 *
 * console.log(getObjectKey(ppData, 0)); // "package"
 * console.log(getObjectKey(ppData, 'platform_package_editor_pplugin')); // "plugin"
 */
export function getObjectKey(obj, indexOrValue) {
  const keys = Object.keys(obj);
  if (typeof indexOrValue === 'number') {
    return keys[indexOrValue] ?? null;
  }
  if (typeof indexOrValue === 'string') {
    return keys.find(key => obj[key] === indexOrValue) ?? null;
  }
  return null;
}

/**
 * Flips the keys and values of an object.
 * Optionally sanitizes values to ensure valid identifier-style keys.
 *
 * @param {Object} obj - The object to flip.
 * @param {boolean} [sanitize=false] - Whether to sanitize keys (replace spaces with underscores).
 * @param {boolean} [slugifySpecialChars=false] - Whether to replace non-alphanumeric/underscore chars with underscores instead of removing them.
 * @returns {Object} - The flipped object with values as keys.
 *
 * @example
 * const person = { name: "Chinonso Justice", age: 30, role: "Dev#1" };
 *
 * console.log(flipObject(person));
 * // { "Chinonso Justice": "name", "30": "age", "Dev#1": "role" }
 *
 * console.log(flipObject(person, true));
 * // { "Chinonso_Justice": "name", "30": "age", "Dev1": "role" }
 *
 * console.log(flipObject(person, true, true));
 * // { "Chinonso_Justice": "name", "30": "age", "Dev_1": "role" }
 */
export function flipObject(obj, sanitize = false, slugifySpecialChars = false) {
  const flipped = {};
  for (const [key, value] of Object.entries(obj)) {
    let newKey = String(value);
    if (sanitize) {
      // Replace spaces with underscores
      newKey = newKey.replace(/\s+/g, "_");
      // Handle non-alphanumeric/underscore chars
      if (slugifySpecialChars) {
        // Replace special chars with underscores
        newKey = newKey.replace(/[^\w]/g, "_");
      } else {
        // Remove special chars entirely
        newKey = newKey.replace(/[^\w]/g, "");
      }
    }
    flipped[newKey] = key;
  }
  return flipped;
}

/**
 * Returns a new object containing only the properties from `source`
 * whose keys are listed in `keys`.
 *
 * 🔄 Do not confuse with `filterObjectKeysByKeys` and `filterObjectKeys`:
 * - `filterObjectByKeys` returns an object with matched key–value pairs.
 * - `filterObjectKeysByKeys` returns an array of matched keys only (empty if none match).
 * - `filterObjectKeys` returns an array of matched keys, or all keys if none match.
 *
 * @param {Object} source - The object to filter.
 * @param {string|string[]} keys - A key or array of keys to keep.
 * @returns {Object} A new object containing only the picked key–value pairs.
 *
 * @example
 * const user = { id: 1, name: "Alice", email: "alice@example.com" };
 *
 * // Single key
 * filterObjectByKeys(user, "name");
 * // → { name: "Alice" }
 *
 * // Multiple keys
 * filterObjectByKeys(user, ["id", "email"]);
 * // → { id: 1, email: "alice@example.com" }
 *
 * // Non‑existent keys are ignored
 * filterObjectByKeys(user, ["foo", "email"]);
 * // → { email: "alice@example.com" }
 */
export function filterObjectByKeys(source, keys) {
    // Normalize single string to array
    const keyArr = typeof keys === "string" ? [keys] : Array.isArray(keys) ? keys : [];
  
    const result = {};
    for (const key of keyArr) {
      if (key in source) {
        result[key] = source[key];
      }
    }
    return result;
}

/**
 * Filters the values of an object based on a given array of keys.
 *
 * Returns an array of values corresponding to the specified keys.
 * If a key does not exist in the object, it is ignored.
 *
 * @param {Object} source - The object to filter values from.
 * @param {string|string[]} keys - A key or array of keys to extract values for.
 * @returns {Array} An array of values corresponding to the specified keys.
 *
 * @example
 * const user = { id: 1, name: "Alice", email: "alice@example.com" };
 *
 * // Single key
 * filterObjectValuesByKeys(user, "name");
 * // → ["Alice"]
 *
 * // Multiple keys
 * filterObjectValuesByKeys(user, ["id", "email"]);
 * // → [1, "alice@example.com"]
 *
 * // Non‑existent keys are ignored
 * filterObjectValuesByKeys(user, ["foo", "email"]);
 * // → ["alice@example.com"]
 */
export function filterObjectValuesByKeys(source, keys) {
    // Normalize single string to array
    const keyArr = typeof keys === "string" ? [keys] : Array.isArray(keys) ? keys : [];
  
    return keyArr.reduce((values, key) => {
        if (key in source) {
            values.push(source[key]);
        }
        return values;
    }, []);
}

/**
 * Filters the keys of an object based on a given array of keys.
 *
 * Returns an array of keys that exist in both the object and the specified keys array.
 *
 * @param {Object} source - The object to filter keys from.
 * @param {string|string[]} keys - A key or array of keys to check against.
 * @returns {string[]} An array of keys that exist in the object and match the specified keys.
 *
 * @example
 * const user = { id: 1, name: "Alice", email: "alice@example.com" };
 *
 * // Single key
 * filterObjectKeysByKeys(user, "name");
 * // → ["name"]
 *
 * // Multiple keys
 * filterObjectKeysByKeys(user, ["id", "email"]);
 * // → ["id", "email"]
 *
 * // Non‑existent keys are ignored
 * filterObjectKeysByKeys(user, ["foo", "email"]);
 * // → ["email"]
 */
export function filterObjectKeysByKeys(source, keys) {
    // Normalize single string to array
    const keyArr = typeof keys === "string" ? [keys] : Array.isArray(keys) ? keys : [];
  
    return keyArr.filter(key => key in source);
}

/**
 * Filters the values of an object based on a given key or array of keys.
 *
 * If the specified keys exist in the object, their corresponding values are returned.
 * If none of the keys exist, or if the keys argument is null, empty, or invalid,
 * all values in the object are returned instead.
 *
 * 🔄 Do not confuse with `filterObjectValuesByKeys`, which returns only matched values
 * and returns an empty array when no keys match.
 *
 * @param {Object} source - The object to filter values from.
 * @param {string|string[]} keys - A key or array of keys to extract values for.
 * @returns {Array} An array of matched or all values from the object.
 *
 * @example
 * const user = { id: 1, name: "Alice", email: "alice@example.com" };
 *
 * // Valid key(s)
 * filterObjectValues(user, "name");
 * // → ["Alice"]
 *
 * filterObjectValues(user, ["id", "email"]);
 * // → [1, "alice@example.com"]
 *
 * // Invalid key(s) fallback
 * filterObjectValues(user, ["foo", "bar"]);
 * // → [1, "Alice", "alice@example.com"]
 *
 * // Null or empty
 * filterObjectValues(user, null);
 * // → [1, "Alice", "alice@example.com"]
 */
export function filterObjectValues(source, keys) {
    let keyArr = [];

    if (typeof keys === "string") {
        keyArr = [keys];
    } else if (Array.isArray(keys)) {
        keyArr = keys;
    }

    const values = keyArr.reduce((arr, key) => {
        if (key in source) arr.push(source[key]);
        return arr;
    }, []);

    return values.length ? values : Object.values(source);
}

/**
 * Filters the keys of an object based on a given key or array of keys.
 *
 * If the specified keys exist in the object, only those keys are returned.
 * If none of the keys exist, or if the keys argument is null, empty, or invalid,
 * all keys in the object are returned instead.
 *
 * 🔄 Do not confuse with `filterObjectKeysByKeys`, which returns only matched keys
 * and returns an empty array when no keys match.
 *
 * @param {Object} source - The object to filter keys from.
 * @param {string|string[]} keys - A key or array of keys to check for.
 * @returns {string[]} An array of matched or all keys from the object.
 *
 * @example
 * const user = { id: 1, name: "Alice", email: "alice@example.com" };
 *
 * // Valid key(s)
 * filterObjectKeys(user, "name");
 * // → ["name"]
 *
 * filterObjectKeys(user, ["id", "email"]);
 * // → ["id", "email"]
 *
 * // Invalid key(s) fallback
 * filterObjectKeys(user, ["foo", "bar"]);
 * // → ["id", "name", "email"]
 *
 * // Null or empty
 * filterObjectKeys(user, null);
 * // → ["id", "name", "email"]
 */
export function filterObjectKeys(source, keys) {
    let keyArr = [];

    if (typeof keys === "string") {
        keyArr = [keys];
    } else if (Array.isArray(keys)) {
        keyArr = keys;
    }

    const foundKeys = keyArr.filter(key => key in source);

    return foundKeys.length ? foundKeys : Object.keys(source);
}

/**
 * Checks if all items in the array are keys in the given object.
 *
 * @param {Object} targetObject - Object to check against.
 * @param {string[]} keysArray - Array of keys to check.
 * @returns {boolean} True if all keys exist in the object, false otherwise.
 *
 * @example
 * const obj = { name: "John", age: 30, job: "Engineer" };
 * const keys = ["name", "age"];
 * objectHasArrayItemsAsKeys(obj, keys); // true
 */
export function objectHasArrayItemsAsKeys(targetObject, keysArray) {
    return keysArray.every(key => key in targetObject);
}