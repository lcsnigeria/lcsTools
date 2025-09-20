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
 * Remove an item from an array or object.
 *
 * Behavior:
 * - If `bucket` is an array, the item is interpreted as a numeric index.
 *   The element at that index is removed using `splice`, shifting subsequent elements.
 * - If `bucket` is an object, the item is interpreted as a property key.
 *   The property is removed using the `delete` operator.
 * - If `bucket` is neither an object nor an array, an error is thrown.
 *
 * Rules:
 * - For arrays:
 *   - Only valid numeric indices are accepted (0 ≤ index < array.length).
 *   - Removal shifts elements to close the gap (no empty holes).
 * - For objects:
 *   - Only own properties can be removed (not inherited ones).
 *   - If the key does not exist, the function returns `false`.
 *
 * @param {Object|Array} bucket - The target object or array.
 * @param {string|number} item - Key (for object) or index (for array).
 * @returns {boolean} - Returns `true` if the removal was successful, otherwise `false`.
 *
 * @example
 * // Example with an object
 * let user = { id: 1, name: "Alice", age: 25 };
 * unsetItem(user, "age");
 * console.log(user);
 * // → { id: 1, name: "Alice" }
 *
 * @example
 * // Example with an array
 * let numbers = [10, 20, 30, 40];
 * unsetItem(numbers, 2);
 * console.log(numbers);
 * // → [10, 20, 40]
 *
 * @example
 * // Example with invalid array index
 * let items = ["a", "b", "c"];
 * console.log(unsetItem(items, 10));
 * // → false (no change to items)
 *
 * @example
 * // Example with missing object key
 * let settings = { theme: "dark" };
 * console.log(unsetItem(settings, "lang"));
 * // → false (no change to settings)
 */
export function unsetItem(bucket, item) {
    if (Array.isArray(bucket)) {
        if (typeof item === "number" && item >= 0 && item < bucket.length) {
            bucket.splice(item, 1);
            return true;
        }
        return false;
    } 
    
    if (bucket !== null && typeof bucket === "object") {
        if (Object.prototype.hasOwnProperty.call(bucket, item)) {
            delete bucket[item];
            return true;
        }
        return false;
    }

    throw new Error("unsetItem: bucket must be an object or an array.");
}