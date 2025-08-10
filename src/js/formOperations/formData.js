/**
 * Builds a FormData object from various input data types.
 *
 * - If `data` is already a FormData instance, returns it immediately.
 * - Supports values of type Array, FileList, File, or primitive/string.
 * - Arrays and FileLists are appended using the key with `[]` suffix.
 * - Single Files are appended with the key without `[]` suffix.
 *
 * @param {Object|FormData} data - The source data to convert into FormData.
 * @throws {Error} If `data` is not an object or FormData.
 * @returns {FormData} The constructed or existing FormData instance.
 *
 * @example
 * import { buildFormData } from './buildFormData.js';
 *
 * // Example: mixing strings, a single File, and multiple files
 * const singleFile = new File(["Hello"], "hello.txt", { type: "text/plain" });
 * const multipleFiles = [
 *   new File(["One"], "one.txt", { type: "text/plain" }),
 *   new File(["Two"], "two.txt", { type: "text/plain" })
 * ];
 *
 * const data = {
 *   username: "alice",
 *   avatar: singleFile,     // single File → "avatar"
 *   documents: multipleFiles // array of Files → "documents[]"
 * };
 *
 * const formData = buildFormData(data);
 * 
 * // Send with fetch
 * fetch('/upload', {
 *   method: 'POST',
 *   body: formData
 * });
 */
export function buildFormData(data) {
    // Ensure valid type
    if (data !== Object(data)) {
        throw new Error("Invalid data type: must be an object or FormData.");
    }

    // If already FormData, return as-is
    if (data instanceof FormData) {
        return data;
    }

    const newFormData = new FormData();

    Object.keys(data).forEach(key => {
        const value = data[key];

        if (Array.isArray(value)) {
            // Array → append with []
            const bracketKey = key.replace(/\[\]/g, '') + '[]';
            value.forEach(item => newFormData.append(bracketKey, item));

        } else if (value instanceof FileList) {
            // FileList → append with []
            const bracketKey = key.replace(/\[\]/g, '') + '[]';
            for (let i = 0; i < value.length; i++) {
                newFormData.append(bracketKey, value[i]);
            }

        } else if (value instanceof File) {
            // Single File → append without []
            newFormData.append(key.replace(/\[\]/g, ''), value);

        } else {
            // Primitive/string → append as-is
            newFormData.append(key, value);
        }
    });

    return newFormData;
}