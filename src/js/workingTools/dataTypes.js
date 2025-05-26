/**
 * Determines the type of the given data.
 *
 * @param {*} data - The data to check the type of.
 * @returns {string} - A string representing the type of data, such as 'string', 'array', 'integer', etc.
 */
export function dataType(data) {
    if (data === null) {
        return 'null';
    }
    if (Array.isArray(data)) {
        return 'array';
    }
    if (typeof data === 'object') {
        return 'object';
    }
    if (typeof data === 'number') {
        if (Number.isInteger(data)) {
            return 'integer';
        } else {
            return 'number';
        }
    }
    return typeof data;
}

/**
 * Checks if the given data is a string.
 *
 * @param {*} data - The data to check.
 * @returns {boolean} - True if data is a string, false otherwise.
 */
export function isDataString(data) {
    return typeof data === 'string';
}

/**
 * Checks if the given data is an array.
 *
 * @param {*} data - The data to check.
 * @returns {boolean} - True if data is an array, false otherwise.
 */
export function isDataArray(data) {
    return Array.isArray(data);
}

/**
 * Checks if the given data is an integer number.
 *
 * @param {*} data - The data to check.
 * @returns {boolean} - True if data is an integer number, false otherwise.
 */
export function isDataInt(data) {
    return typeof data === 'number' && Number.isInteger(data);
}

/**
 * Checks if the given data is an integer number.
 *
 * @param {*} data - The data to check.
 * @returns {boolean} - True if data is an integer number, false otherwise.
 */
export function isDataInteger(data) {
    return typeof data === 'number' && Number.isInteger(data);
}

/**
 * Checks if the given data is an object (excluding arrays and null).
 *
 * @param {*} data - The data to check.
 * @returns {boolean} - True if data is an object and not an array or null, false otherwise.
 */
export function isDataObject(data) {
    return typeof data === 'object' && data !== null && !Array.isArray(data);
}

/**
 * Checks if the given data is a number.
 *
 * @param {*} data - The data to check.
 * @returns {boolean} - True if data is a number (including integers, floats, NaN, and Infinity), false otherwise.
 */
export function isDataNumeric(data) {
    return typeof data === 'number';
}

/**
 * Determines whether a value should be considered "empty" for form-validation and data-handling purposes.
 *
 * Returns `true` for:
 * - Falsy primitives (except `0` is handled separately below)
 * - `null` or `undefined`
 * - Empty strings or strings containing only whitespace
 * - Strings representing falsy values: `'false'`, `'null'`, `'undefined'`, `'0'`
 * - Empty objects (no own enumerable keys)
 * - Empty arrays (length === 0)
 * - The number `0` (explicitly considered empty)
 *
 * @param {*} data - The value to evaluate.
 * @returns {boolean} `true` if `data` is considered empty; otherwise `false`.
 *
 * @example
 * isDataEmpty(false);           // → true (falsy primitive)
 * isDataEmpty(0);               // → true (explicit numeric empty)
 * isDataEmpty('');              // → true (empty string)
 * isDataEmpty('   ');           // → true (whitespace only)
 * isDataEmpty('false');         // → true (falsy-like string)
 * isDataEmpty('null');          // → true
 * isDataEmpty('undefined');     // → true
 * isDataEmpty('0');             // → true
 * isDataEmpty('some text');     // → false
 * isDataEmpty([]);              // → true (empty array)
 * isDataEmpty([1, 2]);          // → false
 * isDataEmpty({});              // → true (empty object)
 * isDataEmpty({ key: 'val' });  // → false
 */
export function isDataEmpty(data) {
    // Handle nullish and generic falsy values (except 0)
    if (data == null || data === false) {
        return true;
    }

    // Explicitly treat number 0 as empty
    if (typeof data === 'number') {
        return data === 0;
    }

    // Strings: trim whitespace and normalize
    if (typeof data === 'string') {
        const trimmed = data.trim().toLowerCase();
        return (
            trimmed === '' ||
            trimmed === 'false' ||
            trimmed === 'null' ||
            trimmed === 'undefined' ||
            trimmed === '0'
        );
    }

    // Arrays: empty if length is zero
    if (Array.isArray(data)) {
        return data.length === 0;
    }

    // Objects: empty if no own enumerable properties
    if (typeof data === 'object') {
        if (
            data instanceof File || 
            data instanceof Blob || 
            data instanceof FileList || 
            data instanceof FormData || 
            data instanceof URLSearchParams || 
            data instanceof Map || 
            data instanceof Set || 
            data instanceof HTMLElement || 
            ArrayBuffer.isView(data) || // For TypedArrays
            data instanceof ArrayBuffer
        ) {
            // Handle each by type:
            if (data instanceof File || data instanceof Blob) return data.size === 0;
            if (data instanceof FileList) return data.length === 0;
            if (data instanceof FormData || data instanceof URLSearchParams) return ![...data].length;
            if (data instanceof Map || data instanceof Set) return data.size === 0;
            if (ArrayBuffer.isView(data) || data instanceof ArrayBuffer) return data.byteLength === 0;
            return false;
        }

        // For generic plain objects
        return Object.keys(data).length === 0;
    }

    // Fallback: consider everything else non-empty
    return false;
}