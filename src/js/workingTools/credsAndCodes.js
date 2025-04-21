/**
 * Generates a random code based on the specified type and length.
 *
 * @param {string} type - The type of code to generate ('number', 'letters', 'mixed').
 * @param {number} length - The length of the code to generate.
 * @param {boolean} [includeSpecialChars=false] - Whether to include special characters in the code.
 * @returns {string} The generated code.
 * @throws {Error} Throws an error if the type is invalid or length is not a positive number.
 */
export function generateCodes(type = 'mixed', length = 8, includeSpecialChars = false) {
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