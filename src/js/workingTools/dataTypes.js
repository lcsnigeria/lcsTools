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