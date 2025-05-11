import { capitalizeWords } from "./stringOps.js";

/**
 * Checks if any item in the given ItemsParam is partially matched in ArrayParam (case-insensitive).
 *
 * @param {string[]} ArrayParam - The array to search in.
 * @param {string|string[]} ItemsParam - The item(s) to check for similarity.
 * @returns {boolean} True if at least one similar item is found, false otherwise.
 */
export function arrayHasSimilarItems(ArrayParam, ItemsParam) {
    if (!Array.isArray(ItemsParam)) {
        ItemsParam = [ItemsParam];
    }

    const normalizedItems = ItemsParam.map(item => capitalizeWords(item).toLowerCase());

    return ArrayParam.some(aItem =>
        normalizedItems.some(nItem => aItem.toLowerCase().includes(nItem))
    );
};

/**
 * Filters items from ArrayParam that are partially similar to items in ItemsParam.
 *
 * @param {Array} ArrayParam - The array to filter (should ideally contain strings).
 * @param {string|string[]} ItemsParam - The item(s) to compare against.
 * @param {boolean} [returnSingleIfComparationIsSingle=false] - If true and a single item is passed, return the first match directly.
 * @param {boolean} [returnPrimaryItemsIfNoMatch=false] - If true and no matches are found, return the original ArrayParam instead.
 * @returns {string[]|string|undefined} Filtered matching items, the first match if comparation is single, or the full list if no match and fallback is enabled.
 */
export function filterArraySimilarItems(
    ArrayParam,
    ItemsParam,
    returnSingleIfComparationIsSingle = false,
    returnPrimaryItemsIfNoMatch = false
) {
    let comparationIsSingle = false;
    if (!Array.isArray(ItemsParam)) {
        comparationIsSingle = true;
        ItemsParam = [ItemsParam];
    }

    const normalizedItems = ItemsParam.map(item =>
        String(capitalizeWords(item)).toLowerCase()
    );

    const itemsResult = ArrayParam.filter(aItem => {
        if (typeof aItem !== 'string') return false;
        const aItemStr = aItem.toLowerCase();
        return normalizedItems.some(nItem => aItemStr.includes(nItem));
    });

    // If no match and fallback is requested
    const result = itemsResult.length > 0 ? itemsResult : (returnPrimaryItemsIfNoMatch ? ArrayParam : []);

    if (comparationIsSingle && returnSingleIfComparationIsSingle) {
        return result[0]; // returns first match, or first item of ArrayParam if fallback
    }

    return result;
};

/**
 * Remove duplicate values from an array while preserving the original order.
 *
 * Uses a `Set` under the hood to track seen values.  
 * If the input is not an array, returns an empty array.
 *
 * @param {Array} array - The array from which to remove duplicates.
 * @returns {Array} A new array containing only the first occurrence of each value.
 *
 * @example
 * removeArrayDuplicates([1, 2, 2, 3, 4, 4]);
 * // → [1, 2, 3, 4]
 *
 * @example
 * removeArrayDuplicates(['a','b','a','c']);
 * // → ['a', 'b', 'c']
 */
export function removeArrayDuplicates(array) {
    return Array.isArray(array) ? [...new Set(array)] : [];
}

/**
 * Flatten a nested array by exactly one level.
 *
 * This is useful when you have arrays of arrays but only want to collapse a single layer.
 * If the input is not an array, returns an empty array.
 *
 * @param {Array} array - The array to shallow-flatten.
 * @returns {Array} A new array with one level of nesting removed.
 *
 * @example
 * flattenArray([[1], [2, 3], 4]);
 * // → [1, 2, 3, 4]
 *
 * @example
 * flattenArray([1, [2, [3, 4]], 5]);
 * // → [1, 2, [3, 4], 5]
 */
export function flattenArray(array) {
    return Array.isArray(array) ? array.flat() : [];
}

/**
 * Deep-flatten a nested array into a single-level array.
 *
 * Recursively collapses all levels of nested arrays (using `Infinity` depth).  
 * If the input is not an array, returns an empty array.
 *
 * @param {Array} array - The deeply nested array to flatten.
 * @returns {Array} A new, fully flattened array.
 *
 * @example
 * deepFlattenArray([1, [2, [3, 4]], 5]);
 * // → [1, 2, 3, 4, 5]
 *
 * @example
 * deepFlattenArray([['a'], [['b'], ['c', ['d']]]]);
 * // → ['a', 'b', 'c', 'd']
 */
export function deepFlattenArray(array) {
    return Array.isArray(array) ? array.flat(Infinity) : [];
}

/**
 * Split an array into chunks of a specified size.
 *
 * Returns an array of sub-arrays, each of length `size`, except possibly the last one.
 * If the input is not an array, or `size` is not a positive integer, returns an empty array.
 *
 * @param {Array} array - The array to split into chunks.
 * @param {number} size - The maximum size of each chunk (must be > 0).
 * @returns {Array[]} An array of chunked sub-arrays.
 *
 * @example
 * chunkArray([1, 2, 3, 4, 5], 2);
 * // → [[1, 2], [3, 4], [5]]
 *
 * @example
 * chunkArray(['a','b','c','d'], 3);
 * // → [['a','b','c'], ['d']]
 */
export function chunkArray(array, size) {
    if (!Array.isArray(array) || typeof size !== 'number' || size <= 0) return [];
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

/**
 * Remove all “falsy” values from an array.
 *
 * Falsy values include: `false`, `0`, `''` (empty string), `null`, `undefined`, and `NaN`.  
 * If the input is not an array, returns an empty array.
 *
 * @param {Array} array - The array to clean.
 * @returns {Array} A new array containing only truthy values.
 *
 * @example
 * removeFalsyItems([0, 1, false, 2, '', 3, null]);
 * // → [1, 2, 3]
 */
export function removeFalsyItems(array) {
    return Array.isArray(array) ? array.filter(Boolean) : [];
}

/**
 * Compute the difference between two arrays: items present in the first array but not in the second.
 *
 * Uses a `Set` for O(1) lookups when checking membership in `arr2`.  
 * Comparison is by strict equality.
 *
 * @param {Array} arr1 - The array from which to subtract values.
 * @param {Array} arr2 - The array containing values to exclude from `arr1`.
 * @returns {Array} A new array of items in `arr1` that are not found in `arr2`.
 *
 * @example
 * arrayDifference([1, 2, 3], [2, 4]);
 * // → [1, 3]
 *
 * @example
 * arrayDifference(['a','b','c'], ['c','d']);
 * // → ['a','b']
 */
export function arrayDifference(arr1, arr2) {
    const exclude = new Set(arr2);
    return Array.isArray(arr1)
        ? arr1.filter(item => !exclude.has(item))
        : [];
}

/**
 * Compute the intersection of two arrays, returning values present in both.
 *
 * This function preserves the order of items as they appear in the first array.
 * Internally, it builds a `Set` from the second array for efficient O(1) lookups.
 * If either argument is not a valid array, it returns an empty array.
 *
 * @param {Array} arr1 - The “source” array whose items will be tested for inclusion.
 * @param {Array} arr2 - The “filter” array whose items define the intersection set.
 * @returns {Array} A new array containing only the items found in both `arr1` and `arr2`.
 *
 * @example
 * arrayIntersect([1, 2, 3], [2, 3, 4]);
 * // → [2, 3]
 *
 * @example
 * // Strings and mixed types
 * arrayIntersect(['a', 'b', 'c'], ['c', 'd', 'a']);
 * // → ['a', 'c']
 *
 * @example
 * // If arr1 is not an array, returns []
 * arrayIntersect(null, [1, 2, 3]);
 * // → []
 *
 * @example
 * // Preserves duplicates in arr1 if they also appear in arr2
 * arrayIntersect([1, 2, 2, 3], [2, 3]);
 * // → [2, 2, 3]
 */
export function arrayIntersect(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
        return [];
    }
    const lookup = new Set(arr2);
    return arr1.filter(item => lookup.has(item));
}

/**
 * Returns a new object containing only the properties from `source`
 * whose keys are listed in `keys`.
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