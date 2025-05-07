/**
 * Capitalizes each word in a string (e.g., "united states" → "United States").
 *
 * @param {string} str - The input string to capitalize.
 * @returns {string|boolean} The capitalized string or false if invalid input.
 */
export function capitalizeWords(str) {
    if (!str || !/^[A-Za-z\s]+$/.test(str)) return false;
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Capitalizes each word in a string (e.g., "united states" → "United States").
 *
 * @param {string} str - The input string to capitalize.
 * @returns {string|boolean} The capitalized string, or false if input is invalid.
 *
 * @example
 * capitalize("united states"); // "United States"
 */
export function capitalize(str) {
    if (!str || !/^[A-Za-z\s]+$/.test(str)) return false;
    return str
        .split(' ')
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1).toLowerCase()
        )
        .join(' ');
}

/**
 * Truncates a string to a specified maximum length, appending a custom ellipsis if truncated.
 *
 * @param {string} str - The input string to truncate.
 * @param {number} maxLength - The maximum allowed length of the result (including ellipsis).
 * @param {string} [ellipsis='…'] - The string to append when truncation occurs.
 * @returns {string} The original string if shorter than maxLength, otherwise a truncated version.
 *
 * @example
 * truncateString("JavaScript is awesome", 10, "..."); // "JavaScri..."
 * truncateString("Hello", 10, '---');                 // "Hello"
 */
export function truncateString(str, maxLength, ellipsis = '…') {
    if (typeof str !== 'string' || typeof maxLength !== 'number' || maxLength <= 0) {
        return '';
    }
    if (str.length <= maxLength) return str;
    const sliceLength = maxLength - ellipsis.length;
    return sliceLength > 0
        ? str.slice(0, sliceLength) + ellipsis
        : ellipsis.slice(0, maxLength);
}

/**
 * Converts a string into a URL-friendly slug, using the specified separator.
 *
 * @param {string} str - The input string.
 * @param {string} [separator='-'] - The character(s) to use between words in the slug.
 * @returns {string} The slugified version of the string.
 *
 * @example
 * slugify("Hello World!", "_");    // "hello_world"
 * slugify("Clean-Up THIS -- text"); // "clean-up-this-text"
 */
export function slugify(str, separator = '-') {
    if (typeof str !== 'string') return '';
    // remove invalid chars, collapse whitespace/sep, trim separators
    const sepEsc = separator.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s.-]/g, '')                // remove non-word chars except dot & hyphen
        .replace(/[\s_.-]+/g, separator)          // collapse spaces/dots/hyphens to sep
        .replace(new RegExp(`^${sepEsc}+|${sepEsc}+$`, 'g'), ''); // trim leading/trailing sep
}

/**
 * Reverses the characters in a string.
 *
 * @param {string} str - The input string.
 * @returns {string} The reversed string.
 *
 * @example
 * reverseString("abc"); // "cba"
 */
export function reverseString(str) {
    return str.split('').reverse().join('');
}

/**
 * Removes extra spaces from a string (e.g., "  Hello   World  " → "Hello World").
 *
 * @param {string} str - The input string.
 * @returns {string} A trimmed and cleaned-up string.
 *
 * @example
 * removeExtraSpaces("  Hello   World  "); // "Hello World"
 */
export function removeExtraSpaces(str) {
    return str.replace(/\s+/g, ' ').trim();
}

/**
 * Counts the number of words in a string (words delimited by whitespace).
 *
 * @param {string} str - The input string.
 * @returns {number} The word count.
 *
 * @example
 * countWords("Hello world from JS"); // 4
 */
export function countWords(str) {
    if (typeof str !== 'string') return 0;
    const trimmed = str.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
}

/**
 * Counts the number of vowels (a, e, i, o, u) in a string.
 *
 * @param {string} str - The input string.
 * @returns {number} The total vowel count.
 *
 * @example
 * countVowels("Hello"); // 2
 */
export function countVowels(str) {
    if (typeof str !== 'string') return 0;
    const matches = str.match(/[aeiou]/gi);
    return matches ? matches.length : 0;
}

/**
 * Counts the number of consonants (alphabetic characters that are not vowels) in a string.
 *
 * @param {string} str - The input string to analyze.
 * @returns {number} The total consonant count.
 *
 * @example
 * countConsonants("Hello, World!"); // 7  ("H", "l", "l", "W", "r", "l", "d")
 * countConsonants("AEIOU");         // 0
 */
export function countConsonants(str) {
    if (typeof str !== 'string') return 0;
    const matches = str.match(/([b-df-hj-np-tv-z])/gi);
    return matches ? matches.length : 0;
}

/**
 * Validates whether a string is a well-formed email address.
 *
 * @param {string} str - The email string to validate.
 * @returns {boolean} True if valid email; otherwise false.
 *
 * @example
 * isEmail("test@example.com"); // true
 * isEmail("not-an-email");     // false
 */
export function isEmail(str) {
    if (typeof str !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
}

/**
 * Validates whether a string is a properly formed URL.
 *
 * @param {string} str - The string to validate.
 * @returns {boolean} True if the string is a valid URL, otherwise false.
 *
 * @example
 * isURL("https://example.com");         // true
 * isURL("ftp://example.com/file.txt");  // true
 * isURL("not-a-url");                   // false
 */
export function isURL(str) {
    if (typeof str !== 'string') return false;
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

/**
 * Checks if a string contains only alphabetic characters (A–Z, a–z).
 *
 * @param {string} str - The string to test.
 * @returns {boolean} True if only letters; otherwise false.
 *
 * @example
 * isAlpha("Hello");   // true
 * isAlpha("Hello123"); // false
 */
export function isAlpha(str) {
    if (typeof str !== 'string') return false;
    return /^[A-Za-z]+$/.test(str);
}

/**
 * Checks if a string contains only alphabetic characters (A–Z, a–z).
 *
 * @param {string} str - The string to test.
 * @returns {boolean} True if only letters; otherwise false.
 *
 * @example
 * isLetters("Hello");   // true
 * isLetters("Hello123"); // false
 */
export function isLetters(str) {
    if (typeof str !== 'string') return false;
    return /^[A-Za-z]+$/.test(str);
}

/**
 * Removes a specified character from a string.
 * If a `position` (based on the character’s occurrence index) is provided, only the N-th
 * occurrence of the character is removed. Otherwise, all occurrences are removed.
 *
 * @function
 * @param {string} character - The character to remove.
 * @param {string} string - The string from which to remove the character.
 * @param {number} [position] - Optional zero-based index of the character’s occurrence to remove.
 * If not specified, all instances of the character will be removed.
 * @returns {string} The modified string with the character removed.
 *
 * @example
 * stripCharacter('-', '12-34-56'); // "123456" — removes all hyphens
 *
 * @example
 * stripCharacter('-', '12-34-56', 1); // "12-3456" — removes the 2nd hyphen only (occurrence index 1)
 *
 * @example
 * stripCharacter(':', '10:20:30:40', 2); // "10:20:3040" — removes the 3rd colon
 *
 * @example
 * stripCharacter('x', 'abxcxdx', 5); // "abxcxdx" — nothing removed, as 'x' doesn’t occur 6 times
 */
export function stripCharacter(character, string, position) {
    const escapeRegExp = (str) => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    if (typeof position === 'number') {
        let count = 0;
        let chars = string.split('');
        for (let i = 0; i < chars.length; i++) {
            if (chars[i] === character) {
                if (count === position) {
                    chars[i] = ''; // Remove the N-th occurrence
                    break;
                }
                count++;
            }
        }
        return chars.join('');
    } else {
        const escapedCharacter = escapeRegExp(character);
        const regex = new RegExp(escapedCharacter, 'g');
        return string.replace(regex, '');
    }
}