import { isDataEmpty } from "../workingTools/dataTypes.js";
import { isURL } from "../workingTools/stringOps.js";
import { allFileExtensions, allFileMimeTypes, textFileExtensions } from "./fileOperationsComponents.js";

/**
 * An object that maps file extensions to their corresponding MIME types.
 * This mapping is used to determine the MIME type of a file based on its extension.
 *
 * @constant
 * @type {Object<string, string>}
 * @example
 * // Example usage:
 * extensionMimeType['jpg']; // Returns 'image/jpeg'
 * extensionMimeType['pdf']; // Returns 'application/pdf'
 */
const extensionMimeType = {
    // Images
    jpg:  'image/jpeg',
    jpeg: 'image/jpeg',
    png:  'image/png',
    gif:  'image/gif',
    webp: 'image/webp',
    bmp:  'image/bmp',
    svg:  'image/svg+xml',
    ico:  'image/x-icon',
    tif:  'image/tiff',
    tiff: 'image/tiff',
  
    // Video
    mp4:  'video/mp4',
    avi:  'video/x-msvideo',
    mkv:  'video/x-matroska',
    mov:  'video/quicktime',
    webm: 'video/webm',
    mpeg: 'video/mpeg',
    '3gp': 'video/3gpp',
    '3g2': 'video/3gpp2',
  
    // Audio
    mp3:  'audio/mpeg',
    wav:  'audio/wav',
    ogg:  'audio/ogg',
    oga:  'audio/ogg',
    flac: 'audio/flac',
    aac:  'audio/aac',
    m4a:  'audio/mp4',
    opus: 'audio/opus',
    amr:  'audio/amr',
  
    // Documents
    pdf:  'application/pdf',
    doc:  'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls:  'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt:  'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt:  'text/plain',
    csv:  'text/csv',
    html: 'text/html',
    css:  'text/css',
    js:   'application/javascript',
    json: 'application/json',
    xml:  'application/xml',
  
    // Developer files (likely empty MIME)
    php:   '',
    py:    '',
    ts:    '',
    tsx:   '',
    vue:   '',
    sh:    '',
    rb:    '',
    pl:    '',
    go:    '',
    c:     '',
    cpp:   '',
    h:     '',
    java:  '',
    cs:    '',
    swift: '',
    kt:    '',
    rs:    '',
    dart:  '',
    sql:   '',
    md:    '',
    yml:   '',
    yaml:  '',
    ini:   '',
    env:   '',

    // Archives and compressed files
    zip:  'application/zip,application/x-zip-compressed',
    rar:  'application/x-rar-compressed',
    tar:  'application/x-tar',
    gz:   'application/gzip',
    targz: 'application/gzip',
    '7z':   'application/x-7z-compressed',
};

/**
 * An object that maps MIME types to their corresponding file extensions.
 * It is generated by reversing the key-value pairs of the `extensionMimeType` object.
 *
 * @constant
 * @type {Object<string, string>}
 * @example
 * // Example usage:
 * mimeTypeExtension['application/json']; // Returns 'json'
 * mimeTypeExtension['text/html']; // Returns 'html'
 */
const mimeTypeExtension = Object.fromEntries(
    Object.entries(extensionMimeType).map(([ext, mime]) => [mime, ext])
);

/**
 * The `lcsFileOps` class provides a set of utilities for handling file operations.
 * It supports initializing with a file (either a URL or a `File` object), retrieving
 * file metadata, validating file properties, and determining file types.
 *
 * ### Features:
 * - Initialize with a file URL or `File` object.
 * - Retrieve file metadata such as name, size, type, and extension.
 * - Validate file size and type against constraints.
 * - Determine if a file is an image, video, or audio based on its MIME type.
 * - Convert files to data URLs for easy embedding.
 * - Format file sizes into human-readable strings.
 *
 * ### Example Usage:
 * ```javascript
 * const fileOps = new lcsFileOps();
 * 
 * // Set a file from a URL
 * fileOps.setFile('https://example.com/image.jpg');
 * console.log(await fileOps.getMimeType()); // 'image/jpeg'
 * 
 * // Set a file from a File object
 * const file = new File(['content'], 'test.txt', { type: 'text/plain' });
 * fileOps.setFile(file);
 * console.log(await fileOps.getFileInfo());
 * // { name: 'test.txt', size: 7, type: 'text/plain', lastModified: ..., extension: 'txt' }
 * 
 * // Validate file size
 * console.log(await fileOps.validateFileSize(null, { maxSize: 100000 })); // true or false
 * 
 * // Check if the file is an image
 * console.log(await fileOps.isImage()); // true or false
 * ```
 */
class lcsFileOps {
    #file = null;
    #fileURL = null;
    #loaded = false;
    #dataURL = null;

    /**
     * Initializes the file operations class with an optional file.
     * @param {string|File|null} file - URL string, File object, or null to initialize without a file
     * @example
     * // Initialize with a URL
     * const fileOps = new lcsFileOps('https://example.com/image.jpg');
     *
     * // Initialize with a File object
     * const file = new File(['content'], 'test.txt', { type: 'text/plain' });
     * const fileOps = new lcsFileOps(file);
     *
     * // Initialize without a file
     * const fileOps = new lcsFileOps();
     */
    constructor(file = null) {
        this.#file = file;
    }

    /**
     * Sets a new file and resets the internal state.
     * Note: Initialization is async and occurs in methods like getMimeType or validateFileSize.
     * @param {string|File} file - URL string or File object to set
     * @throws {Error} If file is neither a string nor a File object
     * @example
     * // Set a file from a URL
     * const fileOps = new lcsFileOps();
     * fileOps.setFile('https://example.com/video.mp4');
     *
     * // Set a file from a File object
     * const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
     * fileOps.setFile(file);
     */
    setFile(file) {
        this.#file = null;
        this.#fileURL = null;
        this.#loaded = false;
        this.#dataURL = null;

        if (typeof file !== 'string' && !(file instanceof File)) {
            throw new Error('Invalid file: must be a URL string or a File object');
        }
        this.#file = file;
    }

    /**
     * Private method to initialize the file and generate data URL from this.#file.
     * @private
     */
    async #initFile() {
        if (this.#loaded) {
            return true;
        }

        this.#dataURL = null;
        this.#fileURL = null;

        if (typeof this.#file === 'string') {
            if (isDataEmpty(this.#file)) {
                throw new Error('URL cannot be empty or null.');
            }
            try {
                const response = await fetch(this.#file);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const blob = await response.blob();
                const filename = this.#file.split('/').pop().split('?')[0] || 'downloaded_file';
                this.#file = new File([blob], filename, { type: blob.type });
                this.#fileURL = this.#file;
                this.#loaded = true;
                const reader = new FileReader();
                this.#dataURL = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(this.#file);
                });

                return true;
            } catch (error) {
                throw new Error(`Failed to load file from URL: ${error.message}`);
            }
        } else if (this.#file instanceof File) {
            this.#loaded = true;
            const reader = new FileReader();
            this.#dataURL = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(this.#file);
            });

            return true;
        } else {
            this.#file = null;
        }

        return false;
    }

    /**
     * Gets the URL of the loaded file if it was loaded from a URL.
     * @returns {string|null} The original URL if set from a string, otherwise null
     * @example
     * const fileOps = new lcsFileOps();
     * fileOps.setFile('https://example.com/image.jpg');
     * console.log(fileOps.getFileURL()); // 'https://example.com/image.jpg'
     *
     * const file = new File(['data'], 'image.png', { type: 'image/png' });
     * fileOps.setFile(file);
     * console.log(fileOps.getFileURL()); // null
     */
    getFileURL() {
        return this.#fileURL || null;
    }

    /**
     * Checks if the current file was loaded from a URL.
     * @returns {boolean} True if the file was set from a URL, false otherwise
     * @example
     * const fileOps = new lcsFileOps();
     * fileOps.setFile('https://example.com/audio.mp3');
     * console.log(fileOps.isURLFile()); // true
     *
     * const file = new File(['data'], 'audio.mp3', { type: 'audio/mpeg' });
     * fileOps.setFile(file);
     * console.log(fileOps.isURLFile()); // false
     */
    isURLFile() {
        return !!this.#fileURL;
    }

    /**
     * Gets the extension from the file name.
     * If a file is provided, sets and initializes it before extracting the extension.
     * @param {string|File|null} [file=null] - Optional file to set and extract extension from
     * @returns {Promise<string>} The extension without the dot, or empty string if none
     * @example
     * const fileOps = new lcsFileOps();
     * fileOps.setFile('https://example.com/document.pdf');
     * console.log(await fileOps.getExtension()); // 'pdf'
     *
     * console.log(await fileOps.getExtension('https://example.com/image.jpg')); // 'jpg'
     * // Internal file is now 'https://example.com/image.jpg'
     */
    async getExtension(file = null) {
        if (!isDataEmpty(file)) {
            this.setFile(file);
        }

        await this.#initFile();

        const filename = this.#file.name;

        if (typeof filename !== 'string') return '';
        const cleanName = filename.split('?')[0];
        return cleanName.split('.').pop().toLowerCase() || '';
    }

    /**
     * Gets the MIME type from a file extension.
     * @param {string} extension - File extension (with or without leading dot)
     * @returns {string|Array} The MIME type or an array of MIME types if multiple types exist
     * @example
     * const fileOps = new lcsFileOps();
     * console.log(fileOps.getExtensionMimeType('jpg')); // 'image/jpeg'
     * console.log(fileOps.getExtensionMimeType('.pdf')); // 'application/pdf'
     * console.log(fileOps.getExtensionMimeType('xyz')); // 'application/octet-stream'
     * console.log(fileOps.getExtensionMimeType('zip')); // ['application/zip', 'application/x-zip-compressed']
     */
    getExtensionMimeType(extension) {
        extension = extension.toLowerCase().replace(/^\./, '');
        const type = extensionMimeType[extension];

        // If type has comma-separated values, split and return as array
        if (type && type.includes(',')) {
            return type.split(',').map(t => t.trim());
        }

        return type === '' ? '' : (type || 'application/octet-stream');
    }

    /**
     * Gets the file extension from a MIME type.
     * @param {string} mimeType - The MIME type to get the extension for
     * @returns {string} The file extension without the dot, or an empty string if unknown
     * @example
     * const fileOps = new lcsFileOps();
     * console.log(fileOps.getMimeTypeExtension('image/jpeg')); // 'jpg'
     * console.log(fileOps.getMimeTypeExtension('application/pdf')); // 'pdf'
     * console.log(fileOps.getMimeTypeExtension('unknown/type')); // ''
     */
    getMimeTypeExtension(mimeType) {
        return mimeTypeExtension[mimeType] || '';
    }

    /**
     * Validates if the given input is a valid MIME type.
     * A valid MIME type follows the pattern "type/subtype" (e.g., "image/jpeg").
     * @param {string} input - The input string to validate as a MIME type.
     * @returns {boolean} True if the input is a valid MIME type, false otherwise.
     * @example
     * const fileOps = new lcsFileOps();
     * console.log(fileOps.isMimeType('image/jpeg')); // true
     * console.log(fileOps.isMimeType('invalid/type/format')); // false
     */
    isMimeType(input) {
        if (typeof input !== 'string' || input.trim() === '') {
            return false;
        }
        const mimeTypePattern = /^[a-zA-Z0-9]+\/[a-zA-Z0-9\-\.\+]+$/;
        return mimeTypePattern.test(input) && allFileMimeTypes.includes(input);
    }

    /**
     * Validates if the given input is a valid file extension.
     * A valid file extension consists of alphanumeric characters and may optionally start with a dot.
     * @param {string} input - The input string to validate as a file extension.
     * @returns {boolean} True if the input is a valid file extension, false otherwise.
     * @example
     * const fileOps = new lcsFileOps();
     * console.log(fileOps.isExtension('.jpg')); // true
     * console.log(fileOps.isExtension('png')); // true
     * console.log(fileOps.isExtension('invalid/extension')); // false
     */
    isExtension(input) {
        if (typeof input !== 'string' || input.trim() === '') {
            return false;
        }
        const extensionPattern = /^\.?[a-zA-Z0-9]+$/;
        // Return false early if pattern not valid
        if (!extensionPattern.test(input)) return false;

        return allFileExtensions.includes(input.replace(/^\./, ''));
    }

    /**
     * Gets the MIME type of the current file.
     * If a file is provided, sets and initializes it before retrieving the MIME type.
     * @param {string|File|null} [file=null] - Optional file to set and get MIME type from
     * @returns {Promise<string>} MIME type, or empty string if unknown
     * @example
     * const fileOps = new lcsFileOps();
     * fileOps.setFile('https://example.com/video.mp4');
     * console.log(await fileOps.getMimeType()); // 'video/mp4'
     *
     * const file = new File(['data'], 'text.txt', { type: 'text/plain' });
     * console.log(await fileOps.getMimeType(file)); // 'text/plain'
     * // Internal file is now the File object
     */
    async getMimeType(file = null) {
        if (!isDataEmpty(file)) {
            this.setFile(file);
        }

        await this.#initFile();
        
        if (this.#file instanceof File) {
            return this.#file.type || this.getExtensionMimeType(await this.getExtension());
        }
        return '';
    }

    /**
     * Checks if the file is of a specific type based on its MIME type.
     * @param {string} type - Type to check (e.g., 'image', 'video', 'audio')
     * @returns {Promise<boolean>} True if the file's MIME type starts with the specified type
     * @example
     * const fileOps = new lcsFileOps();
     * fileOps.setFile('https://example.com/image.png');
     * console.log(await fileOps.isType('image')); // true
     *
     * fileOps.setFile('https://example.com/audio.mp3');
     * console.log(await fileOps.isType('video')); // false
     */
    async #isType(type) {
        const mimeType = await this.getMimeType();
        return mimeType.startsWith(`${type}/`);
    }

    /**
     * Checks if the current file (or an optionally provided one) is an image based on its MIME type.
     *
     * @param {File|string|null} [file=null] - A File object, a URL string, or null to reuse the previously set file.
     * @returns {Promise<boolean>} Resolves to true if the file's MIME type starts with "image/", false otherwise.
     * @example
     * const fileOps = new lcsFileOps();
     * // Check an external URL without altering the instance file state:
     * console.log(await fileOps.isImage('https://example.com/photo.webp')); // true
     *
     * // Reuse the last file set on the instance:
     * fileOps.setFile(localFileObject);
     * console.log(await fileOps.isImage()); // depends on localFileObject.type
     */
    async isImage(file = null) {
        if (!isDataEmpty(file)) {
        this.setFile(file);
        }

        await this.#initFile();

        return this.#isType('image');
    }

    /**
     * Checks if the current file (or an optionally provided one) is a video based on its MIME type.
     *
     * @param {File|string|null} [file=null] - A File object, a URL string, or null to reuse the previously set file.
     * @returns {Promise<boolean>} Resolves to true if the file's MIME type starts with "video/", false otherwise.
     * @example
     * const fileOps = new lcsFileOps();
     * console.log(await fileOps.isVideo('https://example.com/clip.mp4')); // true
     *
     * fileOps.setFile(localFileObject);
     * console.log(await fileOps.isVideo()); // depends on localFileObject.type
     */
    async isVideo(file = null) {
        if (!isDataEmpty(file)) {
        this.setFile(file);
        }

        await this.#initFile();

        return this.#isType('video');
    }

    /**
     * Checks if the current file (or an optionally provided one) is an audio file based on its MIME type.
     *
     * @param {File|string|null} [file=null] - A File object, a URL string, or null to reuse the previously set file.
     * @returns {Promise<boolean>} Resolves to true if the file's MIME type starts with "audio/", false otherwise.
     * @example
     * const fileOps = new lcsFileOps();
     * console.log(await fileOps.isAudio('https://example.com/sound.mp3')); // true
     *
     * fileOps.setFile(localFileObject);
     * console.log(await fileOps.isAudio()); // depends on localFileObject.type
     */
    async isAudio(file = null) {
        if (!isDataEmpty(file)) {
        this.setFile(file);
        }

        await this.#initFile();

        return this.#isType('audio');
    }

    /**
     * Checks if the current file (or an optionally provided one) is any media type (image, video, or audio).
     *
     * @param {File|string|null} [file=null] - A File object, a URL string, or null to reuse the previously set file.
     * @returns {Promise<boolean>} Resolves to true if the file's MIME type starts with "image/", "video/", or "audio/".
     * @example
     * const fileOps = new lcsFileOps();
     * console.log(await fileOps.isMedia('https://example.com/movie.mov')); // true
     *
     * fileOps.setFile(localFileObject);
     * console.log(await fileOps.isMedia()); // depends on localFileObject.type
     */
    async isMedia(file = null) {
        if (!isDataEmpty(file)) {
        this.setFile(file);
        }

        await this.#initFile();

        const mimeType = await this.getMimeType();
        return (
        mimeType.startsWith('image/') ||
        mimeType.startsWith('video/') ||
        mimeType.startsWith('audio/')
        );
    }

    /**
     * Checks if the file matches a wildcard type pattern (e.g., 'image/*').
     * @param {string} type - Wildcard type pattern to check (e.g., 'image/*', 'video/*')
     * @returns {Promise<boolean>} True if the file's MIME type matches the wildcard pattern
     * @example
     * const fileOps = new lcsFileOps();
     * fileOps.setFile('https://example.com/image.jpg');
     * console.log(await fileOps.isAllType('image/*')); // true
     *
     * fileOps.setFile('https://example.com/audio.mp3');
     * console.log(await fileOps.isAllType('image/*')); // false
     */
    async isAllType(type) {
        const mimeType = await this.getMimeType();
        const [mainType, subType] = type.split('/');
        if (subType === '*') {
            return mimeType.startsWith(`${mainType}/`);
        }
        return mimeType === type;
    }

    /**
     * Checks if the file is any type of image based on its MIME type.
     * @returns {Promise<boolean>} True if the file is an image
     * @example
     * const fileOps = new lcsFileOps();
     * fileOps.setFile('https://example.com/image.jpg');
     * console.log(await fileOps.isAllImage()); // true
     *
     * fileOps.setFile('https://example.com/video.mp4');
     * console.log(await fileOps.isAllImage()); // false
     */
    async isAllImage() {
        return this.isAllType('image/*');
    }

    /**
     * Checks if the file is any type of video based on its MIME type.
     * @returns {Promise<boolean>} True if the file is a video
     * @example
     * const fileOps = new lcsFileOps();
     * fileOps.setFile('https://example.com/video.mp4');
     * console.log(await fileOps.isAllVideo()); // true
     *
     * fileOps.setFile('https://example.com/audio.mp3');
     * console.log(await fileOps.isAllVideo()); // false
     */
    async isAllVideo() {
        return this.isAllType('video/*');
    }

    /**
     * Checks if the file is any type of audio based on its MIME type.
     * @returns {Promise<boolean>} True if the file is an audio file
     * @example
     * const fileOps = new lcsFileOps();
     * fileOps.setFile('https://example.com/audio.mp3');
     * console.log(await fileOps.isAllAudio()); // true
     *
     * fileOps.setFile('https://example.com/image.jpg');
     * console.log(await fileOps.isAllAudio()); // false
     */
    async isAllAudio() {
        return this.isAllType('audio/*');
    }

    /**
     * Checks if a file, file name, or extension corresponds to a text-based file format.
     * Supports File objects, URLs, file names (e.g., 'script.js'), extensions (e.g., 'js', '.js'),
     * or null to use the instance's loaded file. Used in file upload validation to identify
     * text-based files (e.g., to skip aspect ratio checks).
     *
     * @param {string|File|null} [input=null] - The input to check:
     *   - String: File name ('script.js'), extension ('js', '.js'), or URL.
     *   - File: File object with a name property.
     *   - Null: Uses the instance's previously loaded file (set via setFile).
     * @returns {Promise<boolean>} Resolves to true if the extension is text-based (e.g., 'js', 'txt'),
     *   false otherwise.
     * @throws {Error} If the input is invalid (non-string, empty, invalid URL, no extension,
     *   no instance file loaded, or fetch fails for URLs).
     *
     * @example
     * // File name
     * console.log(await isExtensionTextDoc('script.js')); // true
     * // Extension
     * console.log(await isExtensionTextDoc('.txt')); // true
     * // Non-text file
     * console.log(await isExtensionTextDoc('image.jpg')); // false
     * // File object
     * const file = new File([''], 'doc.txt', { type: 'text/plain' });
     * console.log(await isExtensionTextDoc(file)); // true
     * // URL (assuming instance handles fetch)
     * console.log(await isExtensionTextDoc('https://example.com/script.js')); // true
     * // Instance file
     * await instance.setFile('script.js'); // Assuming setFile fetches and sets #file
     * console.log(await isExtensionTextDoc(null)); // true
     */
    async isExtensionTextDoc(fileOrFileNameOrExtension = null) {
        let fileNameOrExtension = '';

        if (isURL(fileOrFileNameOrExtension)) {
            this.setFile(fileOrFileNameOrExtension);
            if (!await this.#initFile()) {
                throw new Error("Failed to fetch or process the URL. Ensure it points to a valid file.");
            }
            fileNameOrExtension = this.#file.name;
        } else if (fileOrFileNameOrExtension instanceof File) {
            fileNameOrExtension = fileOrFileNameOrExtension.name;
        } else if (typeof fileOrFileNameOrExtension === 'string' && !isDataEmpty(fileOrFileNameOrExtension)) {
            // Match the extension (optional dot followed by alphanumeric characters)
            const match = fileOrFileNameOrExtension.match(/\.?([A-Za-z0-9]+)$/);
            if (!match) {
                throw new Error('Input lacks a valid extension.');
            }
            fileNameOrExtension = match[1];
        } else if (isDataEmpty(fileOrFileNameOrExtension)) {
            if (!this.#loaded || isDataEmpty(this.#file)) {
                throw new Error("No valid instance file loaded. Provide a file, file name, extension, or URL, or load a file using setFile.");
            }
            fileNameOrExtension = this.#file.name;
        }

        // Extract extension and normalize
        const extension = fileNameOrExtension.toLowerCase();

        // Check if extension is in textFileExtensions
        return textFileExtensions.includes(extension);
    }

    /**
     * Gets basic information about the current file.
     * If a file is provided, sets and initializes it before retrieving info.
     * @param {string|File|null} [file=null] - Optional file to set and get info from
     * @returns {Promise<Object>} Object containing name, size, type, lastModified, and extension
     * @example
     * const fileOps = new lcsFileOps();
     * fileOps.setFile('https://example.com/image.jpg');
     * console.log(await fileOps.getFileInfo());
     * // { name: 'image.jpg', size: 12345, type: 'image/jpeg', lastModified: 1234567890, extension: 'jpg' }
     */
    async getFileInfo(file = null) {
        if (!isDataEmpty(file)) {
            this.setFile(file);
        }

        await this.#initFile();

        return {
            name: this.#file.name,
            size: this.#file.size,
            type: this.#file.type,
            lastModified: this.#file.lastModified,
            extension: await this.getExtension()
        };
    }

    /**
     * Formats a byte size into a human-readable string.
     * @param {number} bytes - Size in bytes to format
     * @param {number} [decimals=2] - Number of decimal places for the result
     * @returns {string} Formatted size (e.g., '1.50 MB')
     * @example
     * const fileOps = new lcsFileOps();
     * console.log(fileOps.formatFileSize(1024)); // '1.00 KB'
     * console.log(fileOps.formatFileSize(1536, 1)); // '1.5 KB'
     * console.log(fileOps.formatFileSize(0)); // '0 Bytes'
     */
    formatFileSize(bytes, decimals = 2) {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
    }

    /**
     * Gets the data URL of the current file.
     * Note: Returns null if called before initialization completes via an async method.
     * @returns {string|null} Data URL of the file, or null if not loaded
     * @example
     * const fileOps = new lcsFileOps();
     * fileOps.setFile('https://example.com/image.jpg');
     * await fileOps.getMimeType(); // Ensure initialization
     * console.log(fileOps.getDataURL()); // 'data:image/jpeg;base64,...'
     */
    getDataURL() {
        return this.#dataURL;
    }

    /**
     * Validates the file size against specified constraints.
     * If a file is provided, sets and initializes it before validation.
     * @param {string|File|null} [file=null] - Optional file to set and validate
     * @param {Object} [options={}] - Validation options
     * @param {number} [options.maxSize] - Maximum allowed size in bytes
     * @param {number} [options.minSize] - Minimum allowed size in bytes
     * @returns {Promise<boolean>} True if size is within constraints, false otherwise
     * @example
     * const fileOps = new lcsFileOps();
     * fileOps.setFile('https://example.com/image.jpg');
     * console.log(await fileOps.validateFileSize(null, { maxSize: 100000 })); // true if size <= 100KB
     *
     * const file = new File([new Uint8Array(200000)], 'large.jpg', { type: 'image/jpeg' });
     * console.log(await fileOps.validateFileSize(file, { maxSize: 100000 })); // false
     */
    async validateFileSize(file = null, { maxSize, minSize } = {}) {
        if (!isDataEmpty(file)) {
            this.setFile(file);
        }

        await this.#initFile();

        if (maxSize && this.#file.size > maxSize) return false;
        if (minSize && this.#file.size < minSize) return false;
        return true;
    }

    /**
     * Validates the file type against a list of allowed types.
     * If a file is provided, sets and initializes it before validation.
     * @param {string|File|null} [file=null] - Optional file to set and validate
     * @param {string[]} [allowedTypes=[]] - Array of allowed MIME types or extensions (e.g., 'image/jpeg', '.png')
     * @returns {Promise<boolean>} True if type or extension matches an allowed type
     * @throws {Error} If file is not initialized and no file is provided
     * @example
     * const fileOps = new lcsFileOps();
     * fileOps.setFile('https://example.com/image.jpg');
     * console.log(await fileOps.validateFileType(null, ['image/jpeg', '.png'])); // true
     *
     * fileOps.setFile('https://example.com/video.mp4');
     * console.log(await fileOps.validateFileType(null, ['image/jpeg'])); // false
     */
    async validateFileType(file = null, allowedTypes = []) {
        if (!isDataEmpty(file)) {
            this.setFile(file);
        }
        
        await this.#initFile();

        const fileType = await this.getMimeType();
        const fileExt = await this.getExtension();
        return allowedTypes.some(type => {
            type = type.toLowerCase();
            return type === fileType || type === fileExt || type === `.${fileExt}`;
        });
    }


    /**
     * Calculates the aspect ratio of an image or video file, returning either
     * a common ratio (e.g. "16:9", "4:3") or the exact simplified ratio if it
     * exactly matches one of the common ones.
     *
     * @param {File|string|null} [file=null]
     *   - Pass a File object or URL string to override the instance file.
     *   - If null, uses whatever file was set by a prior `setFile(...)`.
     * @returns {Promise<string>}
     *   A ratio string like "16:9", "3:2", or exact simplified "1280:720" if it
     *   matches a common value exactly.
     * @throws {Error}
     *   - If no file is provided.
     *   - If the file’s MIME type is neither image nor video.
     *   - If loading fails or dimensions are zero.
     * 
     * @example
     * // File object:
     * const loader = new lcsLoadImage(fileInput.files[0]);
     * console.log(await loader.getAspectRatio()); // "16:9"
     *
     * // URL string (initFile must fetch & convert to Blob internally):
     * const loader2 = new lcsLoadImage();
     * console.log(await loader2.getAspectRatio('https://…/clip.mp4')); // "4:3"
     */
    async getAspectRatio(file = null) {
        // 1) Override instance file if provided:
        if (!isDataEmpty(file)) {
            this.setFile(file);
        }
        // 2) Ensure this.#file is a File/Blob (initFile should fetch & wrap a URL string):
        await this.#initFile();

        const target = this.#file;
        if (!(target instanceof Blob)) {
            throw new Error("No valid File/Blob available. Pass in a File or URL string first.");
        }

        // 3) MIME-type detection only (no extension checks):
        const mime = target.type.toLowerCase();
        const isImage = mime.startsWith("image/");
        const isVideo = mime.startsWith("video/");

        if (!isImage && !isVideo) {
            throw new Error("Unsupported format: only image/* or video/* MIME types are allowed.");
        }

        // 4) Create an object URL for loading:
        let url;
        try {
            url = URL.createObjectURL(target);
        } catch {
            throw new Error("Failed to create object URL for file.");
        }

        // 5) Common aspect ratios, including portrait orientations
        const commonRatios = [
            { ratio: "1:1",  value: 1      },
            { ratio: "4:3",  value: 4/3    },
            { ratio: "3:2",  value: 3/2    },
            { ratio: "16:9", value: 16/9   },
            { ratio: "21:9", value: 21/9   },
            { ratio: "5:4",  value: 5/4    },
            { ratio: "2:1",  value: 2      },
            { ratio: "3:4",  value: 3/4    },
            { ratio: "2:3",  value: 2/3    },
            { ratio: "9:16", value: 9/16   },
            { ratio: "4:5",  value: 4/5    }
        ];

        function gcd(a, b) {
            return b === 0 ? a : gcd(b, a % b);
        }

        function findClosest(width, height) {
            const actual = width / height;
            let closest = commonRatios[0].ratio;
            let bestDiff = Math.abs(actual - commonRatios[0].value);

            for (const { ratio, value } of commonRatios) {
                const diff = Math.abs(actual - value);
                if (diff < bestDiff) {
                    bestDiff = diff;
                    closest = ratio;
                }
            }

            // Exact simplified ratio
            const d  = gcd(width, height),
                w2 = width  / d,
                h2 = height / d,
                exact = `${w2}:${h2}`;

            // If exact matches a common ratio, return it; otherwise return closest
            return commonRatios.some(r => r.ratio === exact) ? exact : closest;
        }

        try {
            let width, height;

            if (isImage) {
                const img = new Image();
                img.src = url;
                await new Promise((res, rej) => {
                    img.onload  = () => res();
                    img.onerror = () => rej(new Error("Failed to load image."));
                });
                width  = img.naturalWidth;
                height = img.naturalHeight;
            } else {
                const vid = document.createElement("video");
                vid.muted = true;
                vid.src   = url;
                vid.load();
                await new Promise((res, rej) => {
                    vid.onloadedmetadata = () => res();
                    vid.onerror          = () => rej(new Error("Failed to load video."));
                });
                width  = vid.videoWidth;
                height = vid.videoHeight;
            }

            if (width <= 0 || height <= 0) {
                throw new Error("Invalid dimensions: width or height is zero.");
            }

            return findClosest(width, height);

        } finally {
            // Clean up
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Checks if the subject's aspect ratio(s) match or are close to the provision's aspect ratio.
     * Used to enforce aspect ratio constraints for image/video uploads in a UI, allowing similar ratios.
     *
     * @param {string} provision - The target aspect ratio (e.g., "4:5").
     * @param {string|string[]} subject - A single ratio (e.g., "2:3") or array of ratios (e.g., ["2:3", "4:5"]).
     * @returns {boolean} True if any subject ratio matches or is close to the provision (within 0.15), false otherwise.
     * @throws {Error} If provision or subject ratios are invalid (not in "w:h" format or non-positive integers).
     *
     * @example
     * console.log(isAspectRatioMatching("4:5", "2:3")); // true (difference 0.1333 ≤ 0.15)
     * console.log(isAspectRatioMatching("4:5", ["2:3", "1:1"])); // true (2:3 matches)
     * console.log(isAspectRatioMatching("4:5", "1:1")); // false (difference 0.2 > 0.15)
     */
    isAspectRatioMatching(provision, subject) {
        // Helper to parse and validate a ratio string
        function parseRatio(ratio) {
            if (typeof ratio !== 'string' || !/^\d+:\d+$/.test(ratio)) {
                throw new Error(`Invalid ratio format: ${ratio}. Expected "w:h" (e.g., "4:5").`);
            }
            const [width, height] = ratio.split(':').map(Number);
            if (width <= 0 || height <= 0) {
                throw new Error(`Ratio ${ratio} must have positive integers.`);
            }
            return width / height;
        }

        // Validate provision
        const provisionRatio = parseRatio(provision);

        // Normalize subject to an array
        const subjectRatios = Array.isArray(subject) ? subject : [subject];

        // Check each subject ratio
        for (const ratio of subjectRatios) {
            const subjectRatio = parseRatio(ratio);
            const difference = Math.abs(provisionRatio - subjectRatio);
            if (difference <= 0.15) {
                return true; // Match found within threshold
            }
        }

        return false; // No matching ratios
    }

  
}

/**
 * A singleton instance for global file loading usage.
 * @module file
 */
export const file = new lcsFileOps();
export default lcsFileOps;