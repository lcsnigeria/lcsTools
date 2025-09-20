/**
 * Generates a random code string based on the specified parameters.
 *
 * @param {number} [length=8] - The length of the generated code. Must be a positive number.
 * @param {'number'|'letters'|'mixed'} [type='mixed'] - The type of characters to include in the code:
 *   - 'number': Only numeric digits (0-9).
 *   - 'letters': Only alphabetic characters (a-z, A-Z).
 *   - 'mixed': Both numbers and letters.
 * @param {boolean} [includeSpecialChars=false] - Whether to include special characters in the code.
 * @returns {string} The generated random code.
 * @throws {Error} If an invalid type is provided or length is not a positive number.
 *
 * @example
 * // Generate an 8-character mixed code (numbers and letters)
 * const code1 = generateCodes();
 * // Example output: 'a8B3kL2z'
 *
 * @example
 * // Generate a 12-character code with only numbers
 * const code2 = generateCodes(12, 'number');
 * // Example output: '839201746582'
 *
 * @example
 * // Generate a 10-character code with letters and special characters
 * const code3 = generateCodes(10, 'letters', true);
 * // Example output: 'aB!c@De#Fg'
 */
export function generateCodes(length = 8, type = 'mixed', includeSpecialChars = false) {
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
 * Generates a random password with customizable options.
 *
 * @param {number} length - The length of the password to generate.
 * @param {Object} [options] - Options for password generation.
 * @param {boolean} [options.uppercase=true] - Include uppercase letters.
 * @param {boolean} [options.lowercase=true] - Include lowercase letters.
 * @param {boolean} [options.numbers=true] - Include numbers.
 * @param {boolean} [options.specialChars=true] - Include special characters.
 * @returns {string} The generated password.
 * @throws {Error} Throws an error if no character types are selected or length is not a positive number.
 *
 * @example
 * // Generate a 12-character password with all character types
 * const password = generatePassword(12);
 * // Generate a 10-character password with only lowercase and numbers
 * const password2 = generatePassword(10, { uppercase: false, specialChars: false });
 */
export function generatePassword(length = 12, options = {}) {
    if (typeof length !== 'number' || length <= 0) {
        throw new Error('Length must be a positive number.');
    }

    const {
        uppercase = true,
        lowercase = true,
        numbers = true,
        specialChars = true
    } = options;

    let characters = '';
    if (uppercase) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) characters += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) characters += '0123456789';
    if (specialChars) characters += '!@#$%^&*()_+[]{}|;:,.<>?';

    if (!characters) {
        throw new Error('At least one character type must be selected.');
    }

    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
}