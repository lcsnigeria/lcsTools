/**
 * Copies data (text, number, object, etc.) to the system clipboard.
 *
 * Converts non-string values (objects, arrays, numbers) to a string
 * using `JSON.stringify` before copying. Works with modern browsers
 * that support the `navigator.clipboard` API.
 *
 * @param {*} data - The data to copy to the clipboard. Objects and arrays are serialized.
 * @returns {Promise<boolean>} - Resolves to `true` if the copy succeeded, or `false` if it failed.
 *
 * @example
 * // Example 1: Copy a simple string
 * const success = await copyToClipboard("Hello world");
 * if (success) console.log("Copied!");
 *
 * // Example 2: Copy an object
 * const data = { id: 1, name: "John" };
 * const copied = await copyToClipboard(data);
 * console.log(copied ? "Data copied!" : "Copy failed!");
 */
export async function copyToClipboard(data) {
    try {
        const textToCopy = typeof data === 'string'
            ? data
            : JSON.stringify(data, null, 2);

        await navigator.clipboard.writeText(textToCopy);
        return true;
    } catch (error) {
        console.error('Clipboard copy failed:', error);
        return false;
    }
}