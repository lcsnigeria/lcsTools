/**
 * This module provides utilities for working with CSS colors in general.
 * It exports arrays of standard CSS color names and common aliases,
 * as well as functions to retrieve and validate color names.
 */

// Import the Color.js library
import Color from 'color'; // 'color', 'https://cdn.skypack.dev/color'

/**
 * An array of standard CSS color names.
 * These are the color names recognized by all modern browsers as per the CSS specification.
 * Note: This list is comprehensive but may not include all possible CSS color names, as new ones can be added over time.
 *
 * @type {Array<string>}
 */
export const colorNames = [
    "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black",
    "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse",
    "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue",
    "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkkhaki", "darkmagenta",
    "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen",
    "darkslateblue", "darkslategray", "darkturquoise", "darkviolet", "deeppink",
    "deepskyblue", "dimgray", "dodgerblue", "firebrick", "floralwhite", "forestgreen",
    "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "green",
    "greenyellow", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki",
    "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral",
    "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightpink",
    "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightsteelblue",
    "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine",
    "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue",
    "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream",
    "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab",
    "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise",
    "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue",
    "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown",
    "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue",
    "slateblue", "slategray", "snow", "springgreen", "steelblue", "tan", "teal",
    "thistle", "tomato", "transparent", "turquoise", "violet", "wheat", "white", "whitesmoke",
    "yellow", "yellowgreen"
];

/**
 * An array of color name aliases.
 * These are alternative spellings (e.g., "grey" instead of "gray") that are not part of the standard CSS color names
 * but are commonly used or recognized in some contexts.
 *
 * @type {Array<string>}
 */
export const aliasColorNames = [
    "darkgrey", "dimgrey", "grey", "lightgrey", "lightslategrey", "slategrey", "darkslategrey"
];

/**
 * Notes:
 * - The list of standard CSS color names may need to be updated if new color names are introduced in future CSS specifications.
 * - Users can extend the `colorNames` or `aliasColorNames` arrays if they need to support additional color names specific to their use cases.
 */

/**
 * Retrieves a sorted list of CSS color names, with an option to include aliases.
 *
 * @param {boolean} [includeAliases=false] - If true, includes alias color names in the returned list. Defaults to false.
 * @returns {Array<string>} A sorted array of color names.
 *
 * @example
 * // Get only standard CSS color names
 * const standardColors = getColorNames();
 * console.log(standardColors); // ["aliceblue", "antiquewhite", ..., "yellowgreen"]
 *
 * @example
 * // Get standard CSS color names plus aliases
 * const allColors = getColorNames(true);
 * console.log(allColors); // ["aliceblue", "antiquewhite", ..., "yellowgreen", "darkgrey", "dimgrey", ...]
 */
export function getColorNames(includeAliases = false) {
    const CNs = includeAliases ? [...colorNames, ...aliasColorNames] : colorNames;

    // Apply case-insensitive alphabetical sort
    return CNs.sort((a, b) => {
        return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });
}

/**
 * Checks if a string is a valid CSS color value.
 *
 * This function supports:
 * - Named colors (more than 2 characters, e.g., "blue", "coral", "skyblue")
 * - Hex colors (#RGB, #RRGGBB, #RGBA, #RRGGBBAA)
 * - RGB/RGBA functions (e.g., "rgb(255, 0, 0)", "rgba(255, 255, 0, 0.5)")
 * - HSL/HSLA functions (e.g., "hsl(120, 100%, 50%)", "hsla(240, 100%, 50%, 0.3)")
 *
 * @param {string} str - The color string to validate.
 * @returns {boolean} True if the string is a valid color value, false otherwise.
 *
 * @example
 * isColorValue('red');              // true
 * isColorValue('#f00');             // true
 * isColorValue('#ff0000');          // true
 * isColorValue('rgb(255, 0, 0)');   // true
 * isColorValue('hsl(120, 100%, 50%)'); // true
 * isColorValue('abc');              // false
 */
export function isColorValue(str) {
    if (typeof str !== 'string') return false;

    const trimmed = str.trim();

    // Hex: #RGB, #RRGGBB, #RGBA, #RRGGBBAA
    const hexRegex = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

    // RGB or RGBA: rgb(255, 255, 255) or rgba(255, 255, 255, 0.5)
    const rgbRegex = /^rgba?\(\s*(\d{1,3}%?\s*,\s*){2}\d{1,3}%?(\s*,\s*(0|1|0?\.\d+))?\s*\)$/;

    // HSL or HSLA: hsl(120, 100%, 50%) or hsla(120, 100%, 50%, 0.5)
    const hslRegex = /^hsla?\(\s*\d{1,3}(\.\d+)?\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%(\s*,\s*(0|1|0?\.\d+))?\s*\)$/;

    // CSS named colors (basic check: must be >2 characters and alphabetic)
    const namedColorRegex = /^[a-zA-Z]{3,}$/;

    /**
     *  Check if valid color name
     * @param {*} colorName 
     * @returns {boolean} True or False
     */
    const isNamedColor = (colorName) => {
        return getColorNames(true).includes(colorName);
    }

    return hexRegex.test(trimmed) ||
           rgbRegex.test(trimmed) ||
           hslRegex.test(trimmed) ||
           (namedColorRegex.test(trimmed) && isNamedColor(trimmed.toLowerCase()));
}

/**
 * Converts a given color value to its hexadecimal representation.
 *
 * @param {string} colorValue - The color value to convert (e.g., color name, hex, rgb, etc.).
 * @returns {string|null} The hexadecimal color string in lowercase (e.g., "#ff0000"), or null if the input is invalid.
 *
 * @example
 * getColorHex('red'); // returns '#ff0000'
 * getColorHex('#00ff00'); // returns '#00ff00'
 * getColorHex('invalidColor'); // returns null
 */
export function getColorHex(colorValue) {
    if (!isColorValue(colorValue)) return null;
    try {
        return Color(colorValue).hex().toLowerCase();
    } catch {
        return null;
    }
}