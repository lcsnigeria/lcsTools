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

/**
 * Find the parent key of an item in a nested object.
 *
 * - "key" mode:   Returns the parent key that contains the searched key.
 * - "value" mode: Returns the actual child key that directly holds the searched value.
 * - "both" mode:  Searches for both key and value matches and returns the first match found.
 *
 * @param {Object} obj The object to search.
 * @param {string|number} item The key name or value to find.
 * @param {'both'|'key'|'value'} [mode='both'] Search mode.
 * @returns {string|null} The matching key (parent or child depending on mode), or null if not found.
 *
 * @example
 * const data = {
 *   parent1: { child: 42 },
 *   parent2: { child: 'hello' }
 * };
 *
 * // Search by key → returns the parent
 * console.log(getObjectItemParent(data, 'child', 'key'));   // "parent1"
 *
 * // Search by value → returns the child key
 * console.log(getObjectItemParent(data, 42, 'value'));      // "child"
 *
 * console.log(getObjectItemParent(data, 'hello', 'value')); // "child"
 *
 * // Not found
 * console.log(getObjectItemParent(data, 'missing', 'both')) // null
 */
export function getObjectItemParent(obj, item, mode = 'both') {
  if (obj == null || typeof obj !== 'object') return null;

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const value = obj[key];

    if (value != null && typeof value === 'object') {
      // Case 1: search keys → return parent key
      if ((mode === 'both' || mode === 'key') && Object.prototype.hasOwnProperty.call(value, item)) {
        return key;
      }

      // Case 2: search values → return the matching child key
      if (mode === 'both' || mode === 'value') {
        for (const childKey in value) {
          if (!Object.prototype.hasOwnProperty.call(value, childKey)) continue;
          if (value[childKey] === item) {
            return childKey;
          }
        }
      }

      // Search deeper recursively
      const parent = getObjectItemParent(value, item, mode);
      if (parent !== null) return parent;
    }
  }

  return null;
}

/**
 * Find the parent key of an item in a nested object, limited to a given ancestor subtree.
 *
 * This function searches for a given key or value only within the subtree under
 * a specified ancestor key.
 *
 * - "key":   Returns the parent key that contains the searched key.
 * - "value": Returns the child key that holds the searched value.
 * - "both":  Searches for both key and value matches, returning the first found.
 *
 * @param {Object} obj The object to search within.
 * @param {string|number} item The key name or value to search for.
 * @param {string|number} ancestorKey The ancestor key that defines the subtree to limit the search.
 * @param {'both'|'key'|'value'} [mode='both'] Search mode.
 * @returns {string|null} The matching key depending on mode, or null if not found.
 *
 * @example
 * const data = {
 *   root: {
 *     ancestor: {
 *       parent1: { child: 42 },
 *       parent2: { child: 'hello' }
 *     }
 *   }
 * };
 *
 * console.log(getObjectItemParentByAncestor(data, 'child', 'ancestor', 'key'));   // "parent1"
 * console.log(getObjectItemParentByAncestor(data, 42, 'ancestor', 'value'));      // "child"
 * console.log(getObjectItemParentByAncestor(data, 'hello', 'ancestor', 'value'));// "child"
 * console.log(getObjectItemParentByAncestor(data, 'missing', 'ancestor', 'both'));// null
 */
export function getObjectItemParentByAncestor(obj, item, ancestorKey, mode = 'both') {
  if (obj == null || typeof obj !== 'object') return null;

  // Step 1: find ancestor subtree (DFS)
  function findAncestor(current) {
    if (current == null || typeof current !== 'object') return null;
    for (const k in current) {
      if (!Object.prototype.hasOwnProperty.call(current, k)) continue;
      const v = current[k];
      if (k === ancestorKey && v != null && typeof v === 'object') {
        return v;
      }
      if (v != null && typeof v === 'object') {
        const found = findAncestor(v);
        if (found !== null) return found;
      }
    }
    return null;
  }

  const ancestorObj = findAncestor(obj);
  if (ancestorObj === null) return null;

  // Step 2: search inside ancestor (DFS)
  function search(sub) {
    if (sub == null || typeof sub !== 'object') return null;
    for (const k in sub) {
      if (!Object.prototype.hasOwnProperty.call(sub, k)) continue;
      const v = sub[k];

      if (v != null && typeof v === 'object') {
        // key match → return parent key
        if ((mode === 'both' || mode === 'key') && Object.prototype.hasOwnProperty.call(v, item)) {
          return k;
        }

        // value match → return child key
        if (mode === 'both' || mode === 'value') {
          for (const childKey in v) {
            if (!Object.prototype.hasOwnProperty.call(v, childKey)) continue;
            if (v[childKey] === item) {
              return childKey;
            }
          }
        }

        const deeper = search(v);
        if (deeper !== null) return deeper;
      }
    }
    return null;
  }

  return search(ancestorObj);
}


/**
 * Retrieves the children of an object or a specific item's children within a nested object.
 *
 * - If no `item` is provided, returns the top-level keys of the object.
 * - If `item` is provided, searches for the item recursively and returns its children:
 *   - If the item's value is an object, returns its keys.
 *   - If the item's value is an array, returns the array itself.
 *   - If the item is not found, returns `null`.
 *
 * @param {Object} obj - The object to search within.
 * @param {string|null} [item=null] - The key to search for. If `null`, returns top-level keys.
 * @returns {string[]|any[]|null} The children of the found item, top-level keys, or `null` if not found.
 *
 * @example
 * const data = {
 *   a: { x: 1, y: 2 },
 *   b: [10, 20, 30],
 *   c: { d: { z: 5 } }
 * };
 *
 * getObjectChildren(data); // Returns ['a', 'b', 'c']
 * getObjectChildren(data, 'a'); // Returns ['x', 'y']
 * getObjectChildren(data, 'b'); // Returns [10, 20, 30]
 * getObjectChildren(data, 'd'); // Returns ['z']
 * getObjectChildren(data, 'notFound'); // Returns null
 */
export function getObjectChildren(obj, item = null) {
    // Case 1: No item provided, return top-level keys
    if (item === null) {
        return Object.keys(obj);
    }

    // Case 2: Item provided, find it
    for (const [key, value] of Object.entries(obj)) {
        // Direct find
        if (key === item && typeof value === 'object' && value !== null) {
            return Array.isArray(value) ? value : Object.keys(value);
        }
        // Recursive search
        if (typeof value === 'object' && value !== null) {
            const children = getObjectChildren(value, item);
            if (children !== null) {
                return children;
            }
        }
    }

    return null;
}


/**
 * Retrieves the children of a specified item within an ancestor subtree of an object.
 *
 * This function first searches for the ancestor key within the object recursively.
 * Once found, it looks for the item key directly within the ancestor object.
 * If the item's value is an object, it returns its keys (or the array itself if it's an array).
 *
 * @param {Object} obj - The object to search within.
 * @param {string} item - The key of the item whose children are to be retrieved.
 * @param {string} ancestor - The key of the ancestor to locate first.
 * @returns {Array<string>|Array| null} - The children of the item as an array of keys, the array itself, or null if not found.
 *
 * @example
 * const data = {
 *   root: {
 *     parent: {
 *       ancestor: {
 *         item: { child1: {}, child2: {} }
 *       }
 *     }
 *   }
 * };
 * // Returns ['child1', 'child2']
 * getObjectChildrenByAncestor(data, 'item', 'ancestor');
 *
 * @example
 * const data = {
 *   ancestor: {
 *     item: [1, 2, 3]
 *   }
 * };
 * // Returns [1, 2, 3]
 * getObjectChildrenByAncestor(data, 'item', 'ancestor');
 */
export function getObjectChildrenByAncestor(obj, item, ancestor) {
    // Step 1: Find the ancestor subtree recursively
    const findAncestor = (currentObj) => {
        for (const [key, value] of Object.entries(currentObj)) {
            if (key === ancestor && typeof value === 'object' && value !== null) {
                return value;
            }
            if (typeof value === 'object' && value !== null) {
                const found = findAncestor(value);
                if (found) return found;
            }
        }
        return null;
    };

    const ancestorObject = findAncestor(obj);
    if (!ancestorObject) {
        return null;
    }

    // Step 2: Perform a direct lookup for the item in the ancestor
    if (ancestorObject.hasOwnProperty(item) && typeof ancestorObject[item] === 'object' && ancestorObject[item] !== null) {
        const value = ancestorObject[item];
        return Array.isArray(value) ? value : Object.keys(value);
    }
    
    return null;
}

/**
 * Extend an object by turning the current value at a position into a key
 * and appending new data as its value. The function can also drill into
 * nested objects until it finds a scalar value or an empty object, depending
 * on the `drillPosition` option.
 *
 * ---
 * 🚀 Purpose:
 * This utility lets you build progressively nested object structures where
 * each "leaf value" becomes the key for the next nested object. In other words,
 * it keeps extending the structure deeper every time you call it, instead of
 * overwriting values.
 *
 * ---
 * 📌 Rules:
 * 1. **Scalars** (string, number, boolean)  
 *    - When the target value is a scalar, it is replaced with an object where
 *      the old scalar becomes the key and the new data becomes the value.  
 *      Example: `{ a: "apple" }` + `"X"` → `{ a: { "apple": "X" } }`.
 *
 * 2. **Objects**  
 *    - If the target value is an object, the function drills into it.  
 *    - The key chosen inside that object depends on `drillPosition`:
 *        - `"start"` → use the first key.
 *        - `"end"`   → use the last key.  
 *    - This process repeats until a scalar or empty object is found.
 *
 * 3. **Empty objects `{}`**  
 *    - If the entire `obj` is empty at the top level → ❌ error (no keys to work with).  
 *    - If an empty object is the value of a key (e.g. `{ a: {} }`) → ✅ valid:  
 *      the new data is placed directly inside it as `{ a: data }`.  
 *      This makes empty objects valid containers when they are nested.
 *
 * 4. **Null / undefined values**  
 *    - If the target value is `null` or `undefined`, it is replaced directly with the new data.
 *
 * 5. **Arrays**  
 *    - Arrays are **not supported**. They cannot be extended or drilled into.
 *
 * ---
 * @param {object} obj
 *   The object to extend. Must be a non-null plain object.
 *
 * @param {*} data
 *   The new data to append at the resolved position.
 *
 * @param {number|string|null} [position=null]
 *   Which top-level key to operate on:
 *   - `null` → defaults to first key if `drillPosition="start"`, or last key if `"end"`.
 *   - `number` → index in `Object.keys(obj)` (supports negative indices).
 *   - `string` → exact object key name.
 *
 * @param {"start"|"end"} [drillPosition="start"]
 *   Determines which nested key to drill into if the target is an object:
 *   - `"start"` → drill into the first key.
 *   - `"end"`   → drill into the last key.
 *
 * @returns {object}
 *   The modified object (same reference, mutated).
 *
 * @throws {Error}
 *   - If `obj` is not a non-null object.
 *   - If `obj` is empty at the top level.
 *   - If `position` is invalid or points to a missing key.
 *
 * ---
 * 🧪 ___Examples___
 *```javascript
 * // Example 1: Default usage (extends first key by default)
 * let obj1 = { a: "apple", b: "banana" };
 * extendObjectValue(obj1, "X");
 * // → { a: { "apple": "X" }, b: "banana" }
 *
 * // Example 2: Extend the last key explicitly
 * let obj2 = { a: "apple", b: "banana", c: "cherry" };
 * extendObjectValue(obj2, "Y", -1);
 * // → { a: "apple", b: "banana", c: { "cherry": "Y" } }
 *
 * // Example 3: Drill into nested object (first key)
 * let obj3 = { a: "apple", b: { k1: "banana1", k2: "banana2" } };
 * extendObjectValue(obj3, "Z", "b", "start");
 * // → { a: "apple", b: { k1: { "banana1": "Z" }, k2: "banana2" } }
 *
 * // Example 4: Drill into nested object (last key)
 * let obj4 = { a: "apple", b: { k1: "banana1", k2: "banana2" } };
 * extendObjectValue(obj4, "Q", "b", "end");
 * // → { a: "apple", b: { k1: "banana1", k2: { "banana2": "Q" } } }
 *
 * // Example 5: Multi-level drilling until a scalar
 * let obj5 = { a: { sub1: { sub2: "deep" } } };
 * extendObjectValue(obj5, "D", "a", "start");
 * // → { a: { sub1: { sub2: { "deep": "D" } } } }
 *
 * // Example 6: Extending an empty nested object
 * let obj6 = { a: {} };
 * extendObjectValue(obj6, "X", "a");
 * // → { a: "X" }
 *
 * // Example 7: Handling null / undefined
 * let obj7 = { a: null };
 * extendObjectValue(obj7, "Hello", "a");
 * // → { a: "Hello" }
 *
 * // Example 8: Error case: top-level empty object
 * extendObjectValue({}, "oops");
 * // ❌ Error: Cannot operate on empty object.
 * ```
 */
export function extendObjectValue(obj, data, position = null, drillPosition = "start") {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
        throw new Error("extendObjectValue: Target must be a non-null object.");
    }

    const keys = Object.keys(obj);
    if (keys.length === 0) {
        throw new Error("extendObjectValue: Cannot operate on empty object.");
    }

    // Resolve the initial top-level key based on position
    let targetKey;
    if (position === null) {
        targetKey = drillPosition === "end" ? keys[keys.length - 1] : keys[0];
    } else if (typeof position === "number") {
        targetKey = keys[position < 0 ? keys.length + position : position];
    } else if (typeof position === "string") {
        if (!obj.hasOwnProperty(position)) {
            throw new Error(`extendObjectValue: Key "${position}" not found.`);
        }
        targetKey = position;
    } else {
        throw new Error("extendObjectValue: Invalid position type.");
    }

    if (!targetKey) {
        throw new Error("extendObjectValue: Invalid resolved target key.");
    }

    // Start drilling
    let parent = obj;
    let key = targetKey;

    while (true) {
        const currentValue = parent[key];

        // If value is null or undefined, just set data and break
        if (currentValue === null || currentValue === undefined) {
            parent[key] = data;
            break;
        }

        // If value is scalar, wrap into object and append new data
        if (typeof currentValue !== "object" || Array.isArray(currentValue)) {
            parent[key] = { [currentValue]: data };
            break;
        }

        // value is an object
        const nestedKeys = Object.keys(currentValue);

        // Empty object → just insert data
        if (nestedKeys.length === 0) {
            parent[key] = data;
            break;
        }

        // Drill into nested object according to drillPosition
        key = drillPosition === "end" ? nestedKeys[nestedKeys.length - 1] : nestedKeys[0];
        parent = currentValue;
    }

    return obj;
}