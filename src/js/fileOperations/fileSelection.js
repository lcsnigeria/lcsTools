import { arrayDifference, filterObjectValuesByKeys } from "../workingTools/arrayOps.js";
import { isDataArray, isDataEmpty, isDataString } from "../workingTools/dataTypes.js";
import { audio } from "./audio.js";
import { video } from "./video.js";
import { image } from "./image.js";
import { pdf } from "./pdf.js";
import { docx } from "./docx.js";
import { textDoc } from "./textDoc.js";
import { generateCodes } from "../workingTools/credsAndCodes.js";
import { file as fileOps } from "./file.js";
import { alert as lcsAlert } from '../alertsAndLogs/alerts.js';
import { initializeFontAwesome } from "../initializations/fontAwesome.js";
import { archiveFileExtensions } from "./fileOperationsComponents.js";

/**
 * Load Font Awesome Icons
 */
( async () => {
    await initializeFontAwesome()
}) () ;


/**
 * A comprehensive list of valid file types allowed for file uploads in the system.
 * 
 * This object maps specific categories to their associated file type patterns, which 
 * are used to validate and restrict file uploads in various forms and file input fields.
 * The categories are designed to accommodate a wide range of file types including 
 * common document types, multimedia files, source code files, compressed archives, 
 * and specialized formats such as ebooks and fonts. 
 * 
 * Each key in the object represents a category, and its associated value is a string 
 * containing a comma-separated list of valid file extensions or wildcard patterns. 
 * These patterns are typically used in the `accept` attribute of HTML file input elements
 * to restrict the file types that users can select when uploading files.
 * 
 * @constant {Object} validFileTypeData
 * 
 * @property {string} image - All image file types (e.g., `.jpg`, `.png`, `.gif`).
 * @property {string} video - All video file types (e.g., `.mp4`, `.avi`, `.mkv`).
 * @property {string} audio - All audio file types (e.g., `.mp3`, `.wav`, `.ogg`).
 * @property {string} pdf - PDF file types (e.g., `.pdf`).
 * @property {string} word - Word document files (both legacy `.doc` and newer `.docx`).
 * @property {string} excel - Excel spreadsheet files (both legacy `.xls` and newer `.xlsx`).
 * @property {string} powerpoint - PowerPoint presentation files (both `.ppt` and `.pptx`).
 * @property {string} text - Text files including plain text and markdown (e.g., `.txt`, `.md`).
 * @property {string} archive - Compressed archive files (e.g., `.zip`, `.rar`, `.tar.gz`).
 * @property {string} csv - CSV (Comma-separated values) file type (e.g., `.csv`).
 * @property {string} json - JSON file type (e.g., `.json`).
 * @property {string} xml - XML file type (e.g., `.xml`).
 * @property {string} html - HTML file types (e.g., `.html`, `.htm`).
 * @property {string} css - CSS file types (e.g., `.css`).
 * @property {string} js - JavaScript file types (e.g., `.js`).
 * @property {string} code - Development-related source code files, including HTML, CSS, JS, 
 *                            JSON, XML, TypeScript, React/JSX, Python, PHP, Ruby, Java, C, C++, 
 *                            Shell, Go, and SQL files.
 * @property {string} font - Font file types (e.g., `.ttf`, `.otf`, `.woff`, `.woff2`).
 * @property {string} ebook - Ebook file formats (e.g., `.epub`, `.mobi`, `.azw3`).
 * @property {string} doc - All document types (e.g., Word documents, PDF files, Excel files, etc.)
 * 
 * @example
 * // Example usage:
 * const fileInput = document.createElement('input');
 * fileInput.type = 'file';
 * fileInput.accept = validFileTypeData.image; // Restricts file selection to image files only
 * 
 * // Another example to allow multiple file types:
 * const zipAndPdfFiles = validFileTypeData.archive + ',' + validFileTypeData.pdf;
 * fileInput.accept = zipAndPdfFiles; // Allows ZIP archives and PDF files
 */
const validFileTypeData = {

    // Global media files
    image: 'image/*',                 // All image files
    video: 'video/*',                 // All video files
    audio: 'audio/*',                 // All audio files

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

    // Videos
    mp4:  'video/mp4',
    avi:  'video/x-msvideo',
    mkv:  'video/x-matroska',
    mov:  'video/quicktime',
    webm: 'video/webm',
    mpeg: 'video/mpeg',
    '3gp':  'video/3gpp',
    '3g2':  'video/3gpp2',

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

    pdf: '.pdf',                      // PDF files
    word: '.doc,.docx',               // Word documents
    excel: '.xls,.xlsx',              // Excel spreadsheets
    powerpoint: '.ppt,.pptx',         // PowerPoint presentations
    txt: '.txt,.md',                 // Text & Markdown files
    archive: '.zip,.rar,.7z,.tar,.gz,.tar.gz', // Compressed files
    csv: '.csv',                      // CSV files
    json: '.json',                    // JSON files
    xml: '.xml',                      // XML files
    html: '.html,.htm',               // HTML files
    css: '.css',                      // CSS files
    js: '.js',                        // JavaScript files
    php: '.php',
    python: '.py',
    py: '.py',
    code: '.html,.htm,.css,.js,.json,.xml,.ts,.jsx,.txt,.tsx,.py,.php,.rb,.java,.c,.cpp,.sh,.go,.sql', // Dev files
    font: '.ttf,.otf,.woff,.woff2',   // Font files
    ebook: '.epub,.mobi,.azw3',      // Ebook formats
    doc: '.doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx' // All documents (Word, PDF, Excel, PowerPoint)
};

/**
 * An array of valid file type categories for file input validation.
 * 
 * This array is dynamically generated from the keys of the `validFileTypeData` object,
 * representing various categories of file types that can be uploaded in the system.
 * Each key corresponds to a category, such as images, videos, text files, etc.
 * 
 * @constant {Array<string>} validFileTypes
 * @example
 * // Example output
 * console.log(validFileTypes);
 * // Output: ['image', 'video', 'audio', 'pdf', 'word', 'excel', ...]
 * 
 * @see validFileTypeData
 */
const validFileTypes = Object.keys(validFileTypeData);




/**
 * Checks if a given MIME type corresponds to a Word document (.doc or .docx).
 * 
 * @param {string} mimeType - The MIME type to check.
 * @returns {boolean} True if the MIME type is for a Word document, false otherwise.
 * @example
 * console.log(isMimeTypeDoc('application/msword')); // true
 * console.log(isMimeTypeDoc('application/pdf')); // false
 */
const isMimeTypeDoc = (mimeType) => {
    archiveFileExtensions.forEach(ext => {
        if (mimeType.includes(ext)) {
            return false;
        }
    });

    const wordMimeTypes = [
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];
    
    return wordMimeTypes.includes(mimeType);
};

/**
 * Determines if a file is a PDF based on its MIME type or file extension.
 * 
 * @param {File} file - The file to check.
 * @returns {boolean} True if the file is a PDF, false otherwise.
 * @example
 * const pdfFile = new File([''], 'document.pdf', { type: 'application/pdf' });
 * console.log(isPDFFileType(pdfFile)); // true
 */
const isPDFFileType = (file) => {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
};

/**
 * Determines if a file is a Word document (.docx) based on its MIME type or file extension.
 * 
 * @param {File} file - The file to check.
 * @returns {boolean} True if the file is a .docx document, false otherwise.
 * @example
 * const docxFile = new File([''], 'document.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
 * console.log(isDOCXFileType(docxFile)); // true
 */
const isDOCXFileType = (file) => {
    return isMimeTypeDoc(file.type) || file.name.toLowerCase().endsWith('.docx');
};


/**
 * Checks if a given file extension or MIME type is included in the list of text document extensions.
 * This function iterates through the provided extensions or MIME types,
 * and returns true if any of them match the text document criteria.
 * 
 * @param {string|string[]} extOrTypes - A single file extension or MIME type, or an array of them.
 * @return {boolean} True if any of the provided extensions or MIME types match text document criteria, false otherwise.
 */
const isFileTypesIncludesTextDocExtension = (extOrTypes) => {
    extOrTypes = Array.isArray(extOrTypes) ? extOrTypes : [extOrTypes];
    extOrTypes.forEach(extt => {
        if (fileOps.isExtensionTextDoc(extt)) {
            return true;
        }
    });
}


/**
 * Initiates a file selection process, validates uploaded files, and generates previews for selected files.
 *
 * This function enables users to select files via an HTML file input element, which is either created dynamically
 * or reused from the provided control element. It supports extensive validation for file types, sizes, counts, and
 * aspect ratios (for images and videos). Previews are generated for supported file types, including media (images,
 * videos, audio), PDFs, Word documents, and text files. Selected files are stored in a global
 * `window.lcsFileSelection.files` object, organized by input name with unique tracking IDs. The function is highly
 * configurable to support various use cases, such as single or multiple file selection, custom file type restrictions,
 * and interactive previews.
 *
 * @async
 * @param {HTMLElement} elementInControl - The HTML element controlling the file input (e.g., a button or existing file input).
 * @param {Object} [configs={}] - Configuration options for file selection, validation, and preview generation.
 * @param {string} [configs.name='files'] - Name attribute for the file input element. Automatically adjusted to avoid conflicts.
 * @param {boolean} [configs.multiple=false] - If true, allows multiple file selection; otherwise, restricts to a single file.
 * @param {boolean} [configs.allowDuplicate] - If true, allows duplicate files to be selected (default: true).
 * @param {boolean} [configs.useCustomFileTypes=false] - If true, treats `fileTypes` as a custom string (e.g., '.php,image/*').
 * @param {string[]|string} [configs.fileTypes=[]] - Array of valid file type categories (e.g., ['image', 'pdf']) or a custom string if `useCustomFileTypes` is true.
 * @param {string|string[]} [configs.imageAspectRatio=[]] - Allowed image aspect ratios (e.g., '16:9', ['16:9', '4:3']).
 * @param {string|string[]} [configs.videoAspectRatio=[]] - Allowed video aspect ratios (e.g., '16:9', ['16:9', '4:3']).
 * @param {Function|null} [configs.fileSelectedCallback=null] - Callback invoked with an array of selected file data (or a single file object if `multiple` is false).
 * @param {boolean} [configs.filePreview=true] - If true, generates previews for supported file types.
 * @param {string} [configs.filePreviewPosition='top'] - Position of the preview container relative to the control element ('top' or 'bottom').
 * @param {number} [configs.maxFileSize=104857600] - Maximum size per file in bytes (default: 100MB).
 * @param {number} [configs.minFileSize=0] - Minimum size per file in bytes (default: 0).
 * @param {number} [configs.totalMaxFileSize=1073741824] - Maximum total size for all selected files in bytes (default: 1GB).
 * @param {number} [configs.totalMinFileSize=0] - Minimum total size for all selected files in bytes (default: 0).
 * @param {number} [configs.maxFileCount=10] - Maximum number of files that can be selected (default: 10).
 * @param {HTMLElement|string|null} [configs.fileChooserTrigger=null] - Element or selector (e.g., '#id', '.class') to trigger the file input dialog.
 * @param {boolean} [configs.playOnPreview=false] - If true, enables playback or interactivity for media previews.
 * @param {boolean} [configs.required=false] - If true, marks the file input as required, enforcing selection.
 * @throws {Error} If the control element is invalid, configurations are incorrect, file validations fail, or maximum file count is reached.
 * @example
 * // Basic usage with a button
 * selectFiles(document.querySelector('#uploadButton'), {
 *   multiple: true,
 *   fileTypes: ['image', 'pdf'],
 *   maxFileSize: 10 * 1024 * 1024, // 10MB
 *   maxFileCount: 5,
 *   fileSelectedCallback: (files) => console.log('Selected files:', files),
 *   fileChooserTrigger: '#uploadButton'
 * });
 *
 * @example
 * // Using custom file types and aspect ratio validation
 * selectFiles(document.querySelector('input[type="file"]'), {
 *   useCustomFileTypes: true,
 *   fileTypes: 'image/jpeg,.png',
 *   imageAspectRatio: '4:3',
 *   filePreviewPosition: 'bottom',
 *   required: true
 * });
 */
export async function selectFiles(elementInControl, configs = {}) {
    const defaultConfigs = {
        name: 'files',
        multiple: false,
        allowDuplicate: true,
        useCustomFileTypes: false,
        fileTypes: [],
        imageAspectRatio: [],
        videoAspectRatio: [],
        fileSelectedCallback: null,
        filePreview: true,
        filePreviewPosition: 'top',
        maxFileSize: 1024 * 1024 * 100, // 100MB
        minFileSize: 0,
        totalMaxFileSize: 1024 * 1024 * 1000, // 1GB
        totalMinFileSize: 0,
        maxFileCount: 10,
        fileChooserTrigger: null,
        playOnPreview: false,
        required: false
    };

    configs = { ...defaultConfigs, ...configs };

    // Validate control element
    if (!elementInControl || !(elementInControl instanceof HTMLElement)) {
        throw new Error('Invalid control element. Please provide a valid HTMLElement.');
    }

    // Create or use input element
    let inputElement;
    let inputElementIsNew = false;
    if (elementInControl.tagName.toLowerCase() === 'input' && elementInControl.type === 'file') {
        inputElement = elementInControl;

        if (!inputElement.hasAttribute('name') || isDataEmpty(inputElement.getAttribute('name'))) {
            if (isDataEmpty(configs.name)) {
                throw new Error('Input name is required and cannot be empty.');
            }
        }
    } else {
        if (isDataEmpty(configs.name)) {
            throw new Error('Input name is required and cannot be empty.');
        }

        inputElementIsNew = true;

        inputElement = document.querySelector(`input.lcsFileSelection[name="${configs.name}"]`);
        if (!inputElement) {
            inputElement = document.createElement('input');
            inputElement.setAttribute('name', configs.name);
        }

        inputElement.type = 'file';
        inputElement.style.display = 'none';

        // Only set as trigger if not already provided
        if (!configs.fileChooserTrigger) {
            configs.fileChooserTrigger = elementInControl;
        }
    }

    inputElement.classList.add('lcsFileSelection');

    // Configure input name
    // Clear configs.name off posible square brackets 
    // And set to the inputElement
    // if (!inputElement.hasAttribute('name') || isDataEmpty(inputElement.getAttribute('name'))) {
    //     if (isDataEmpty(configs.name)) {
    //         throw new Error('Input name is required and cannot be empty.');
    //     }
    // } else {
    //     configs.name = inputElement.getAttribute('name');
    // }
    // configs.name = configs.name.replace(/\[\]/g, '');
    // let nameSuffixCounter = 1;
    // while (document.querySelector(`input.lcsFileSelection[name="${configs.name}"]`)) {
    //     configs.name = `${configs.name}_${nameSuffixCounter}`;
    //     nameSuffixCounter++;
    // } 
    // inputElement.name = configs.name;

    // Configure multiple attribute
    if (configs.multiple) {
        inputElement.setAttribute('multiple', '');
    } else {
        inputElement.removeAttribute('multiple');
    }

    // Configure required dataset
    if (configs.required === true) {
        inputElement.dataset.file_select_required = 'true';
    }

    // Validate and set file types
    let specifiedFileTypes = '';
    if (configs.useCustomFileTypes) {
        if (!isDataString(configs.fileTypes) || isDataEmpty(configs.fileTypes)) {
            throw new Error('Custom file types must be a non-empty string (e.g., ".php,image/*").');
        }
        specifiedFileTypes = configs.fileTypes.toLowerCase();
    } else if (!isDataEmpty(configs.fileTypes)) {
        if (!isDataArray(configs.fileTypes)) {
            throw new Error('File types must be an array of valid categories (e.g., ["image", "pdf"]).');
        }
        if (arrayDifference(configs.fileTypes, validFileTypes).length > 0) {
            throw new Error('Invalid file types provided. Use categories from validFileTypes.');
        }
        specifiedFileTypes = filterObjectValuesByKeys(validFileTypeData, configs.fileTypes).join(',').toLowerCase();
    }
    if (!isDataEmpty(specifiedFileTypes)) {
        inputElement.setAttribute('accept', specifiedFileTypes);
    } else {
        inputElement.removeAttribute('accept');
    }
    const specifiedFileTypesArray = specifiedFileTypes.replace(/\./g, '').split(',').filter(Boolean);

    // Validate image aspect ratios
    configs.imageAspectRatio = Array.isArray(configs.imageAspectRatio)
        ? configs.imageAspectRatio
        : configs.imageAspectRatio
        ? [configs.imageAspectRatio]
        : [];
    configs.imageAspectRatio.forEach((ratio) => {
        if (!/^\d+:\d+$/.test(ratio)) {
            throw new Error(`Invalid image aspect ratio "${ratio}". Expected format "width:height" (e.g., "16:9").`);
        }
    });

    // Validate video aspect ratios
    configs.videoAspectRatio = Array.isArray(configs.videoAspectRatio)
        ? configs.videoAspectRatio
        : configs.videoAspectRatio
        ? [configs.videoAspectRatio]
        : [];
    configs.videoAspectRatio.forEach((ratio) => {
        if (!/^\d+:\d+$/.test(ratio)) {
            throw new Error(`Invalid video aspect ratio "${ratio}". Expected format "width:height" (e.g., "16:9").`);
        }
    });

    // Initialize global file storage
    window.lcsFileSelection = window.lcsFileSelection || { files: {} };
    window.lcsFileSelection.files[configs.name] = window.lcsFileSelection.files[configs.name] || {};

    // Function to check if user selected file before
    const alreadySelectedFile = () => {
        return !isDataEmpty(window.lcsFileSelection.files[configs.name]) 
        && Object.keys(window.lcsFileSelection.files[configs.name]).length > 0;
    }

    /**
     * Checks if the maximum file count has been reached based on the current selection and already selected files.
     * @param {Object} fileData - The object of files being selected in this event.
     * @returns {boolean} True if the maximum file count is reached, false otherwise.
     */
    const isMaxFileCountReached = (fileData) => {
        if (!configs.maxFileCount || configs.maxFileCount <= 0) return false; // No limit set
        if (!configs.multiple) configs.maxFileCount = 1; // If not multiple, max count is 1

        // Get already selected files for this input name
        const alreadySelected = window.lcsFileSelection.files[configs.name]
            ? Object.values(window.lcsFileSelection.files[configs.name])
            : [];
        const newFilesCount = fileData && typeof fileData === 'object'
            ? Object.keys(fileData).length
            : 0;
        const totalCount = alreadySelected.length + newFilesCount;

        // Effectiveness: Only count files for this input name
        if (totalCount > configs.maxFileCount) {
            maxFileCountReached = true;
            return true;
        }
        return false;
    }
    let maxFileCountReached = false;

    /**
     * Checks if a file is already present in the files object.
     * @param {File} file - The file to check.
     * @param {Object} filesObj - The object containing file data.
     * @returns {boolean} True if the file is already in the object, false otherwise.
     */
    const fileAlreadyInObject = (file, filesObj) => {
        if (!filesObj || typeof filesObj !== 'object') return false;
        return Object.values(filesObj).some(fd => {
            // Compare by name, size, and type for best match
            return fd.file &&
                fd.file.name === file.name &&
                fd.file.size === file.size &&
                fd.file.type === file.type;
        });
    }

    // Handle file selection
    inputElement.addEventListener('change', async (event) => {
        if (configs.multiple !== true && alreadySelectedFile()) {
            inputElement.value = '';
            lcsAlert.send('You can only select one file.', 'error');
            throw new Error("Multiple file selection is not allowed for this input.");
        }

        // Get and build file data
        const selectedFiles = configs.multiple === true ? Array.from(event.target.files) : [event.target.files[0]].filter(Boolean);

        // Prepare file data
        let fileData = await Promise.all(
            selectedFiles.map(async (file) => ({
                size: file.size || 0,
                type: file.type || 'unknown',
                name: file.name || 'unknown',
                file,
            }))
        );

        // Check if the maximum file count is reached
        if (isMaxFileCountReached(fileData)) {
            maxFileCountReached = true;
            inputElement.value = '';
            lcsAlert.send('You have reached the maximum number of allowed files.', 'error');
            throw new Error("File selection limit reached.");
        }

        // Filter by allowed MIME types
        fileData = fileData.filter((fd) => {
            let normalizedSFT = specifiedFileTypesArray
                .map((sft) => {
                    if (sft === 'image/*') return 'image';
                    if (sft === 'video/*') return 'video';
                    if (sft === 'audio/*') return 'audio';
                    if (fileOps.isExtension(sft)) return fileOps.getExtensionMimeType(sft);
                    if (fileOps.isMimeType(sft)) return sft;
                    return null;
                })
                .filter(Boolean);

            // For each normalizedSFT item, check comma-separated values and split them
            normalizedSFT = normalizedSFT.flatMap((sft) =>
                Array.isArray(sft)
                    ? sft.flatMap((innerSFT) => innerSFT.split(',').map((_type) => _type.trim()))
                    : sft.split(',').map((type) => type.trim())
            );

            const isAllowed = (normalizedSFT.includes('image') && fileOps.isImage(fd.file)) 
            || (normalizedSFT.includes('video') && fileOps.isVideo(fd.file)) 
            || (normalizedSFT.includes('audio') && fileOps.isAudio(fd.file)) 
            || (isDataEmpty(fd.type) && (isFileTypesIncludesTextDocExtension(normalizedSFT) || isDataEmpty(normalizedSFT))) 
            || normalizedSFT.includes(fd.type);

            if (!isAllowed) {
                if (fileData.length <= 1) {
                    throw new Error(`File "${fd.name}" (type: ${fd.type}) is not an allowed type. Allowed types includes: ${normalizedSFT.join(',')}`);
                } else {
                    console.warn(`File "${fd.name}" (type: ${fd.type}) is not an allowed type. Allowed types includes: ${normalizedSFT.join(',')}`);
                }
            }
            return isAllowed;
        });

        // Validate individual file sizes
        fileData = fileData.filter((fd) => {
            const isValidFileSize = fileOps.validateFileSize(fd.file, {
                maxSize: configs.maxFileSize,
                minSize: configs.minFileSize,
            });
            if (!isValidFileSize) {
                if (fileData.length <= 1) {
                    throw new Error(
                    `File "${fd.name}" (size: ${fd.size} bytes) does not meet size requirements. ` +
                    `Allowed range: ${configs.minFileSize} to ${configs.maxFileSize} bytes.`
                    );
                } else {
                    console.warn(
                    `File "${fd.name}" (size: ${fd.size} bytes) does not meet size requirements. ` +
                    `Allowed range: ${configs.minFileSize} to ${configs.maxFileSize} bytes.`
                    );
                }
            }
            return isValidFileSize;
        });

        // Validate total file size
        const totalFileSize = fileData.reduce((sum, fd) => sum + fd.size, 0);
        if (totalFileSize > configs.totalMaxFileSize || totalFileSize < configs.totalMinFileSize) {
            throw new Error(
                `Total file size (${fileOps.formatFileSize(totalFileSize)}) must be between ` +
                `${fileOps.formatFileSize(configs.totalMinFileSize)} and ` +
                `${fileOps.formatFileSize(configs.totalMaxFileSize)}.`
            );
        }

        // Validate image aspect ratios
        if (configs.imageAspectRatio.length > 0) {
            fileData = await Promise.all(
                fileData.map(async (fd) => {
                    const isImg = await fileOps.isImage(fd.file);
                    if (!isImg) return fd;
                    const fRatio = await fileOps.getAspectRatio(fd.file);
                    const aspectRatioMatched = fileOps.isAspectRatioMatching(fRatio, configs.imageAspectRatio);
                    if (!aspectRatioMatched) {
                        const ratioWarningMsg = `Image "${fd.name}" (ratio: ${fRatio}) does not match required aspect ratios: ` + `${configs.imageAspectRatio.join(', ')}.`;
                        if (fileData.length <= 1) {
                            lcsAlert.send(ratioWarningMsg, 'error');
                            throw new Error(ratioWarningMsg);
                        } else {
                            lcsAlert.send(ratioWarningMsg, 'warning');
                            console.warn(ratioWarningMsg);
                        }
                        return null;
                    }
                    return fd;
                })
            ).then((results) => results.filter(Boolean));
        }

        // Validate video aspect ratios
        if (configs.videoAspectRatio.length > 0) {
            fileData = await Promise.all(
                fileData.map(async (fd) => {
                    const isVideo = await fileOps.isVideo(fd.file);
                    if (!isVideo) return fd;
                    const fRatio = await fileOps.getAspectRatio(fd.file);
                    const aspectRatioMatched = fileOps.isAspectRatioMatching(fRatio, configs.videoAspectRatio);
                    if (!aspectRatioMatched) {
                        if (fileData.length <= 1) {
                            throw new Error(
                            `Video "${fd.name}" (ratio: ${fRatio}) does not match required aspect ratios: ` +
                            `${configs.videoAspectRatio.join(', ')}.`
                            );
                        } else {
                            console.warn(
                            `Video "${fd.name}" (ratio: ${fRatio}) does not match required aspect ratios: ` +
                            `${configs.videoAspectRatio.join(', ')}.`
                            );
                        }
                        return null;
                    }
                    return fd;
                })
            ).then((results) => results.filter(Boolean));
        }

        // Store files with tracking IDs
        fileData.forEach((fd) => {
            const trackingID = generateCodes('letters', 8);
            fd.tracking_id = trackingID;

            // Check if the file already exists in the lcsFileSelection files object
            if (!configs.allowDuplicate && fileAlreadyInObject(fd.file, window.lcsFileSelection.files[configs.name])) {
                if (fileData.length <= 1) {
                    throw new Error(`File "${fd.name}" is already selected. Duplicates are not allowed.`);
                } else {
                    console.warn(`File "${fd.name}" is already selected. Duplicates are not allowed.`);
                    return; // Skip adding this file
                }
            }

            // Ensure the files object exists for the current input name
            if (!window.lcsFileSelection.files[configs.name]) {
                window.lcsFileSelection.files[configs.name] = {};
            }

            // Store the file data with the tracking ID
            window.lcsFileSelection.files[configs.name][trackingID] = fd;
        });

        // Generate previews if enabled
        if (configs.filePreview) {

            // The File Preview Container
            let filePreviewContainer = elementInControl.parentElement.querySelector('.lcsFileSelectionPreview._file_preview_container');
            if (!filePreviewContainer) {
                filePreviewContainer = document.createElement('div');
                filePreviewContainer.classList.add('lcsFileSelectionPreview', '_file_preview_container');
                const insertionPosition = configs.filePreviewPosition === 'top' ? 'beforebegin' : 'afterend';
                elementInControl.insertAdjacentElement(insertionPosition, filePreviewContainer);
            }
            filePreviewContainer.classList.add('lcsHorizontalScrolling');
            filePreviewContainer.dataset.ftn = configs.name;

            // Create left navigator icon
            const filePreviewLeftNavigator = filePreviewContainer.querySelector('.fa-chevron-left') 
            ? filePreviewContainer.querySelector('.fa-chevron-left') : document.createElement('i');
            filePreviewLeftNavigator.classList.add('fas', 'fa-chevron-left', '_scroll_btn_left');
            filePreviewLeftNavigator.setAttribute('aria-hidden', 'true');
            filePreviewLeftNavigator.setAttribute('title', 'Scroll left');

            // Create right navigator icon
            const filePreviewRightNavigator = filePreviewContainer.querySelector('.fa-chevron-right') 
            ? filePreviewContainer.querySelector('.fa-chevron-right') : document.createElement('i');
            filePreviewRightNavigator.classList.add('fas', 'fa-chevron-right', '_scroll_btn_right');
            filePreviewRightNavigator.setAttribute('aria-hidden', 'true');
            filePreviewRightNavigator.setAttribute('title', 'Scroll right');

            // The File Preview Wrapper (Scroll Content)
            const filePreviewWrapper = filePreviewContainer.querySelector('._file_preview_wrapper') 
            ? filePreviewContainer.querySelector('._file_preview_wrapper') : document.createElement('div');
            filePreviewWrapper.classList.add('_file_preview_wrapper', '_scroll_content');

            // Display Previews based on file types
            for (const fd of fileData) {
                const thisFile = fd.file;
                const trackingID = fd.tracking_id;
                const isMedia = await fileOps.isMedia(thisFile);
                const isTextDocFile = await fileOps.isExtensionTextDoc(thisFile);
                
                try {
                    if (isMedia) {
                        await previewMediaFile(thisFile, trackingID, configs.playOnPreview, filePreviewWrapper);
                    } else if (isPDFFileType(thisFile)) {
                        await previewPDFFile(thisFile, trackingID, configs.playOnPreview, filePreviewWrapper);
                    } else if (isDOCXFileType(thisFile)) {
                        await previewDOCXFile(thisFile, trackingID, configs.playOnPreview, filePreviewWrapper);
                    } else if (isTextDocFile) {
                        await previewTextDocFile(thisFile, trackingID, configs.playOnPreview, filePreviewWrapper);
                    } else {
                        const filePreview = document.createElement('div');
                        filePreview.className = '_file_preview _unknown_file_preview';
                        filePreview.style.overflow = 'hidden';
                        filePreview.style.position = 'relative';
                        filePreview.dataset.ftid = trackingID;
                        // Escape file name to prevent XSS
                        const escapedName = fd.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        filePreview.innerHTML = `<i class="fa fa-times _remove_file _remove_icon" title="Remove file"></i><span>${escapedName}</span>`;
                        filePreviewWrapper.appendChild(filePreview);
                    }
                } catch (error) {
                    if (fileData.length <= 1) {
                        throw new Error(`Failed to generate preview for "${fd.name}": ${error.message}`);
                    } else {
                        console.warn(`Failed to generate preview for "${fd.name}": ${error.message}`);
                    }
                }
            }

            // Output above respectively and clear inputElement
            filePreviewContainer.innerHTML = filePreviewLeftNavigator.outerHTML + filePreviewWrapper.outerHTML + filePreviewRightNavigator.outerHTML;
            inputElement.value = '';
        }

        // Invoke callback
        if (configs.fileSelectedCallback) {
            configs.fileSelectedCallback(configs.multiple ? fileData : fileData[0]);
        }

        inputElement.value = ''; // Clear input value to allow re-selection...
    });

    // Append new input element if created
    if (inputElementIsNew) {
        elementInControl.insertAdjacentElement('beforebegin', inputElement);
    }

    // Set up file chooser dialog trigger if provided
    if (configs.fileChooserTrigger) {
        if (!(configs.fileChooserTrigger instanceof HTMLElement)) {
            const isClassNameSelector = (typeof configs.fileChooserTrigger === 'string') && configs.fileChooserTrigger.startsWith('.');
            const isIDSelector = (typeof configs.fileChooserTrigger === 'string') && configs.fileChooserTrigger.startsWith('#');

            if (isClassNameSelector || isIDSelector) {
                configs.fileChooserTrigger = document.querySelector(configs.fileChooserTrigger);

                if (!(configs.fileChooserTrigger instanceof HTMLElement)) {
                    throw new Error("The selector did not match any DOM element.");
                }
            } else {
                throw new Error("Invalid fileChooserTrigger: must be an HTMLElement, ID selector (#id), or class selector (.class).");
            }
        }

        configs.fileChooserTrigger.addEventListener('click', () => {
            inputElement.click();
        });
    }

    
    // Hide inputElement if max file count reached
    if (maxFileCountReached || (configs.multiple !== true && alreadySelectedFile())) {
        inputElement.classList.add('_max_file_count_reached');
        inputElement.style.display = 'none';
    }

}




/**
 * Generates a preview for media files (images, videos, or audio) and appends it to a container.
 * 
 * This function creates a preview wrapper for the specified media file, renders the appropriate
 * media element (e.g., `<img>`, `<video>`, `<audio>`), and adds interactivity features like an
 * expand button for images and videos if `playable` is true. The preview is monitored to ensure
 * its playable state is maintained.
 * 
 * @async
 * @param {File} file - The media file to preview.
 * @param {string} trackingID - Unique identifier for tracking the file.
 * @param {boolean} [playable=true] - If true, enables playback or interactivity (e.g., expand buttons).
 * @param {HTMLElement} container - The HTML element to append the preview to.
 * @throws {Error} If the container is not a valid HTMLElement.
 * @example
 * await previewMediaFile(imageFile, 'abc123', true, document.querySelector('._file_preview_container'));
 */
async function previewMediaFile(file, trackingID, playable = true, container) {
    if (!(container instanceof HTMLElement)) {
        throw new Error('Invalid container. Must be a valid HTMLElement.');
    }

    const filePreview = document.createElement('div');
    filePreview.className = '_file_preview _media_file_preview';
    filePreview.style.overflow = 'hidden';
    filePreview.style.position = 'relative';
    filePreview.dataset.ftid = trackingID;

    let mediaFileElement;
    let removeFileLabel = 'Remove file';
    if (file.type.startsWith('image/')) {
        image.setFile(file);
        mediaFileElement = await image.renderImage(filePreview);
        filePreview.classList.add('_image_preview');
        if (playable) {
            filePreview.classList.add('_will_expand');
            filePreview.insertAdjacentHTML(
                'beforeend',
                `<i class="fa-solid fa-expand _expand_container _expand_icon" title="Expand image"></i>`
            );
        }
        removeFileLabel = 'Remove image';
    } else if (file.type.startsWith('video/')) {
        video.setFile(file);
        mediaFileElement = await video.renderPlayer(filePreview, playable, playable);
        filePreview.classList.add('_video_preview');
        if (playable) {
            filePreview.classList.add('_will_expand');
            filePreview.insertAdjacentHTML(
                'beforeend',
                `<i class="fa-solid fa-expand _expand_container _expand_icon" title="Expand video"></i>`
            );
        }
        removeFileLabel = 'Remove video';
    } else if (file.type.startsWith('audio/')) {
        audio.setFile(file);
        mediaFileElement = await audio.renderPlayer(filePreview, playable);
        filePreview.classList.add('_audio_preview');
        removeFileLabel = 'Remove audio';
    }

    filePreview.insertAdjacentHTML(
        'afterbegin',
        `<i class="fa fa-times _remove_file _remove_icon" title="${removeFileLabel}"></i>`
    );

    container.appendChild(filePreview);
    if (mediaFileElement) {
        observeFileToEnsurePlayable(mediaFileElement, playable);
    }
}

/**
 * Generates a preview for a PDF file and appends it to a container.
 * 
 * This function creates a preview wrapper, renders the first page of the PDF, and adds
 * interactivity if `playable` is true. The preview is monitored to ensure its interactive
 * state is maintained.
 * 
 * @async
 * @param {File} file - The PDF file to preview.
 * @param {string} trackingID - Unique identifier for tracking the file.
 * @param {boolean} [playable=true] - If true, enables interactivity for the preview.
 * @param {HTMLElement} container - The HTML element to append the preview to.
 * @throws {Error} If the container is not a valid HTMLElement.
 * @example
 * await previewPDFFile(pdfFile, 'abc123', true, document.querySelector('._file_preview_container'));
 */
async function previewPDFFile(file, trackingID, playable = true, container) {
    if (!(container instanceof HTMLElement)) {
        throw new Error('Invalid container. Must be a valid HTMLElement.');
    }

    const filePreview = document.createElement('div');
    filePreview.className = '_file_preview _pdf_preview';
    filePreview.style.overflow = 'hidden';
    filePreview.style.position = 'relative';
    filePreview.dataset.ftid = trackingID;

    const fileNamePreview = document.createElement('span');
    fileNamePreview.classList.add('_file_name');
    fileNamePreview.textContent = file.name;

    pdf.setFile(file);
    await pdf.renderFirstPage(filePreview);
    if (playable) {
        filePreview.classList.add('_is_interactive');
    }

    filePreview.insertAdjacentHTML(
        'afterbegin',
        `<i class="fa fa-times _remove_file _remove_icon" title="Remove PDF"></i>`
    );

    filePreview.appendChild(fileNamePreview);
    container.appendChild(filePreview);
    observeFileToEnsurePlayable(filePreview, playable);
}

/**
 * Generates a preview for a Word document (DOCX) and appends it to a container.
 * 
 * This function creates a preview wrapper, renders the DOCX content, and adds interactivity
 * if `playable` is true. The preview is monitored to ensure its interactive state is maintained.
 * 
 * @async
 * @param {File} file - The DOCX file to preview.
 * @param {string} trackingID - Unique identifier for tracking the file.
 * @param {boolean} [playable=true] - If true, enables interactivity for the preview.
 * @param {HTMLElement} container - The HTML element to append the preview to.
 * @throws {Error} If the container is not a valid HTMLElement.
 * @example
 * await previewDOCXFile(docxFile, 'abc123', true, document.querySelector('._file_preview_container'));
 */
async function previewDOCXFile(file, trackingID, playable = true, container) {
    if (!(container instanceof HTMLElement)) {
        throw new Error('Invalid container. Must be a valid HTMLElement.');
    }

    const filePreview = document.createElement('div');
    filePreview.className = '_file_preview _doc_preview';
    filePreview.style.overflow = 'hidden';
    filePreview.style.position = 'relative';
    filePreview.dataset.ftid = trackingID;

    const fileNamePreview = document.createElement('span');
    fileNamePreview.classList.add('_file_name');
    fileNamePreview.textContent = file.name;

    docx.setFile(file);
    await docx.renderDOCX(filePreview);
    if (playable) {
        filePreview.classList.add('_is_interactive');
    }

    filePreview.insertAdjacentHTML(
        'afterbegin',
        `<i class="fa fa-times _remove_file _remove_icon" title="Remove file"></i>`
    );

    filePreview.appendChild(fileNamePreview);
    container.appendChild(filePreview);
    observeFileToEnsurePlayable(filePreview, playable);
}

/**
 * Generates a preview for a text document (e.g., TXT, MD) and appends it to a container.
 * 
 * This function creates a preview wrapper, renders the text content, and adds editability
 * if `playable` is true. The preview is monitored to ensure its editable state is maintained.
 * 
 * @async
 * @param {File} file - The text file to preview.
 * @param {string} trackingID - Unique identifier for tracking the file.
 * @param {boolean} [playable=true] - If true, enables editability for the preview.
 * @param {HTMLElement} container - The HTML element to append the preview to.
 * @throws {Error} If the container is not a valid HTMLElement.
 * @example
 * await previewTextDocFile(txtFile, 'abc123', true, document.querySelector('._file_preview_container'));
 */
async function previewTextDocFile(file, trackingID, playable = true, container) {
    if (!(container instanceof HTMLElement)) {
        throw new Error('Invalid container. Must be a valid HTMLElement.');
    }

    const filePreview = document.createElement('div');
    filePreview.className = '_file_preview _text_doc_preview';
    filePreview.style.overflow = 'hidden';
    filePreview.style.position = 'relative';
    filePreview.dataset.ftid = trackingID;

    const fileNamePreview = document.createElement('span');
    fileNamePreview.classList.add('_file_name');
    fileNamePreview.textContent = file.name;

    textDoc.setFile(file);
    await textDoc.renderText(filePreview, playable);
    if (playable) {
        filePreview.classList.add('_is_editable');
    }

    filePreview.insertAdjacentHTML(
        'afterbegin',
        `<i class="fa fa-times _remove_file _remove_icon" title="Remove file"></i>`
    );

    filePreview.appendChild(fileNamePreview);
    container.appendChild(filePreview);
    observeFileToEnsurePlayable(filePreview, playable);
}

/**
 * Monitors a file preview element to ensure its playable or interactive state is maintained.
 * 
 * This function uses a MutationObserver to watch for changes to the element's attributes
 * (e.g., `controls` for media, `class` for interactivity) and enforces the desired state.
 * It ensures that videos and audio maintain their `controls` setting, images maintain their
 * expandability, and PDFs, DOCX, and text previews maintain their interactive or editable states.
 * 
 * @param {HTMLElement} fileElement - The preview element to monitor.
 * @param {boolean} [playableState=true] - The desired playable or interactive state.
 * @example
 * observeFileToEnsurePlayable(videoElement, true);
 */
function observeFileToEnsurePlayable(fileElement, playableState = true) {
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes') {
                const tagName = fileElement.tagName.toLowerCase();

                if (tagName === 'video' && mutation.attributeName === 'controls') {
                    if (fileElement.controls !== playableState) {
                        fileElement.controls = playableState;
                        console.warn(`Video controls were changed and reset to ${playableState}.`);
                    }
                } else if (tagName === 'audio' && mutation.attributeName === 'controls') {
                    if (fileElement.controls !== playableState) {
                        fileElement.controls = playableState;
                        console.warn(`Audio controls were changed and reset to ${playableState}.`);
                    }
                } else if (tagName === 'img' && mutation.attributeName === 'class') {
                    const shouldHaveExpandClass = playableState;
                    const hasExpandClass = fileElement.classList.contains('_will_expand');
                    if (shouldHaveExpandClass && !hasExpandClass) {
                        fileElement.classList.add('_will_expand');
                        console.warn('Image "_will_expand" class was removed and re-added.');
                    } else if (!shouldHaveExpandClass && hasExpandClass) {
                        fileElement.classList.remove('_will_expand');
                        console.warn('Image "_will_expand" class was added and removed.');
                    }
                } else if (fileElement.classList.contains('_pdf_preview') && mutation.attributeName === 'class') {
                    const shouldBeInteractive = playableState;
                    const isInteractive = fileElement.classList.contains('_is_interactive');
                    if (shouldBeInteractive && !isInteractive) {
                        fileElement.classList.add('_is_interactive');
                        console.warn('PDF "_is_interactive" class was removed and re-added.');
                    } else if (!shouldBeInteractive && isInteractive) {
                        fileElement.classList.remove('_is_interactive');
                        console.warn('PDF "_is_interactive" class was added and removed.');
                    }
                } else if (fileElement.classList.contains('_doc_preview') && mutation.attributeName === 'class') {
                    const shouldBeInteractive = playableState;
                    const isInteractive = fileElement.classList.contains('_is_interactive');
                    if (shouldBeInteractive && !isInteractive) {
                        fileElement.classList.add('_is_interactive');
                        console.warn('DOCX "_is_interactive" class was removed and re-added.');
                    } else if (!shouldBeInteractive && isInteractive) {
                        fileElement.classList.remove('_is_interactive');
                        console.warn('DOCX "_is_interactive" class was added and removed.');
                    }
                } else if (fileElement.classList.contains('_text_doc_preview') && mutation.attributeName === 'class') {
                    const shouldBeEditable = playableState;
                    const isEditable = fileElement.classList.contains('_is_editable');
                    if (shouldBeEditable && !isEditable) {
                        fileElement.classList.add('_is_editable');
                        console.warn('Text "_is_editable" class was removed and re-added.');
                    } else if (!shouldBeEditable && isEditable) {
                        fileElement.classList.remove('_is_editable');
                        console.warn('Text "_is_editable" class was added and removed.');
                    }
                }
            }
        }
    });

    observer.observe(fileElement, { attributes: true, attributeOldValue: true, attributeFilter: ['controls', 'class'] });
}

/**
 * Global click event listener to handle file preview removal in the UI.
 * 
 * Listens for any click event on the document. If the clicked element is part of a 
 * `.lcsFileSelectionPreview` container and matches the remove file trigger (`._remove_file`), 
 * it removes the file preview from the DOM and deletes the file entry from 
 * `window.lcsFileSelection.files`.
 * 
 * Dependencies:
 * - `window.lcsFileSelection.files` must exist and follow the format:
 *   { [fileTrackingName]: { [fileTrackingID]: { name: string, ... } } }
 * - `isDataEmpty()` is assumed to be a global utility function that checks if a value is null, undefined, or empty.
 * - `lcsAlert.send()` is assumed to be a class method that shows UI alerts.
 */
document.addEventListener('click', (event) => {
    // Identify the nearest file preview container
    const fileSelectionPreview = event.target.closest('.lcsFileSelectionPreview');
    if (!fileSelectionPreview) return;

    // Check if the click is on a file remove button
    const removeFileButton = event.target.closest('._remove_file');
    if (removeFileButton) {
        // Locate the specific file preview element to remove
        const fileToRemove = removeFileButton.closest('._file_preview');

        if (!fileToRemove) {
            lcsAlert.send('File to remove not found!', 'error');
            return;
        }

        // Extract identifiers for file tracking
        const fileTrackingName = fileSelectionPreview.dataset.ftn;
        const fileTrackingID = fileToRemove.dataset.ftid;

        // Validate and access the file entry in the tracking object
        const fileEntry = window.lcsFileSelection.files[fileTrackingName]?.[fileTrackingID];
        if (isDataEmpty(fileEntry)) {
            lcsAlert.send('File to remove not found! Tracking ID/Tracking Name missing or invalid.', 'error');
            return;
        }

        const fileToRemoveName = fileEntry.name;

        // Delete the file from tracking and remove the preview from the DOM
        if (Object.keys(window.lcsFileSelection.files[fileTrackingName]).length <= 1) {
            // If this is the last file, remove the entire tracking object
            delete window.lcsFileSelection.files[fileTrackingName];
        } else {
            // Otherwise, just remove the specific file entry
            delete window.lcsFileSelection.files[fileTrackingName][fileTrackingID];
        }
        
        fileToRemove.remove();

        // Notify the user of successful removal
        lcsAlert.send(`File <strong>${fileToRemoveName}</strong> removed successfully`);

        // Show inputElement propably hidden when max file count was reached
        if (document.querySelector(`input.lcsFileSelection._max_file_count_reached[name="${fileTrackingName}"]`)) {
            document.querySelector(`input.lcsFileSelection._max_file_count_reached[name="${fileTrackingName}"]`).classList.remove('_max_file_count_reached');
            document.querySelector(`input.lcsFileSelection._max_file_count_reached[name="${fileTrackingName}"]`).style.display = 'block';
        };
    }
});

export const fileSelectionInitialized = true;