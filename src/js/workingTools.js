/**
 * Capitalizes each word in a string (e.g., "united states" → "United States").
 *
 * @param {string} str - The input string to capitalize.
 * @returns {string|boolean} The capitalized string or false if invalid input.
 */
export function lcsCapitalizeWords (str) {
    if (!str || !/^[A-Za-z\s]+$/.test(str)) return false;
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Generates a random code based on the specified type and length.
 *
 * @param {string} type - The type of code to generate ('number', 'letters', 'mixed').
 * @param {number} length - The length of the code to generate.
 * @param {boolean} [includeSpecialChars=false] - Whether to include special characters in the code.
 * @returns {string} The generated code.
 * @throws {Error} Throws an error if the type is invalid or length is not a positive number.
 */
export function lcsGenerateCodes (type = 'mixed', length = 8, includeSpecialChars = false) {
    if (!['number', 'letters', 'mixed'].includes(type)) {
        throw new Error("Invalid type. Allowed values are 'number', 'letters', or 'mixed'.");
    }
    if (typeof length !== 'number' || length <= 0) {
        throw new Error('Length must be a positive number.');
    }

    const numbers = '0123456789';
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';

    let characters = '';
    if (type === 'number') {
        characters = numbers;
    } else if (type === 'letters') {
        characters = letters;
    } else if (type === 'mixed') {
        characters = numbers + letters;
    }

    if (includeSpecialChars) {
        characters += specialChars;
    }

    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
};

/**
 * Checks if any item in the given ItemsParam is partially matched in ArrayParam (case-insensitive).
 *
 * @param {string[]} ArrayParam - The array to search in.
 * @param {string|string[]} ItemsParam - The item(s) to check for similarity.
 * @returns {boolean} True if at least one similar item is found, false otherwise.
 */
export function lcsArrayHasSimilarItems (ArrayParam, ItemsParam) {
    if (!Array.isArray(ItemsParam)) {
        ItemsParam = [ItemsParam];
    }

    const normalizedItems = ItemsParam.map(item => lcsCapitalizeWords(item).toLowerCase());

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
export function lcsFilterArraySimilarItems (
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
        String(lcsCapitalizeWords(item)).toLowerCase()
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