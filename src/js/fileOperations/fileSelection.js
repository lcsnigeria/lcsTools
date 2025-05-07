import '../../css/fileOperations/fileSelection.css';

import { arrayDifference, filterObjectValuesByKeys } from "../workingTools/arrayOps";
import { isDataArray, isDataEmpty } from "../workingTools/dataTypes";
import { lcsLoadAudio as audio } from "./audio";
import { lcsLoadVideo as video } from "./video";
import { lcsLoadImage as image } from "./image";
import { lcsLoadPDF as pdf } from "./pdf";
import { lcsLoadDocx as docx } from "./docx";
import { lcsLoadTextDoc as textDoc } from "./textDoc";
import { generateCodes } from "../workingTools/credsAndCodes";
import { lcsFileOps as fileOps } from "./file";





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
    text: '.txt,.md',                 // Text & Markdown files
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
 * Initiates a file selection process, validates uploaded files, and generates previews.
 * 
 * This function creates or uses an HTML file input element to allow users to select files.
 * It supports validation for file types, sizes, and aspect ratios (for images and videos),
 * and generates previews for supported file types (media, PDFs, Word documents, text files).
 * Selected files are stored in a global `window.lcsFileSelection.files` object with unique
 * tracking IDs. The function is highly configurable via the `configs` object.
 * 
 * @async
 * @param {HTMLElement} elementInControl - The HTML element controlling the file input (e.g., a button or input element).
 * @param {Object} [configs={}] - Configuration options for file selection and validation.
 * @param {string} [configs.name='files'] - Name attribute for the file input element.
 * @param {boolean} [configs.selectLater=false] - If true, does not trigger the file input dialog immediately.
 * @param {boolean} [configs.multiple=false] - If true, allows multiple file selection.
 * @param {boolean} [configs.useCustomFileTypes=false] - If true, `fileTypes` is treated as a custom string (e.g., '.php,image/*').
 * @param {string[]|string} [configs.fileTypes=[]] - Array of valid file type categories (e.g., ['image', 'pdf']) or a custom string.
 * @param {string[]} [configs.imageAspectRatio=[]] - Array of allowed image aspect ratios (e.g., ['16:9', '4:3']).
 * @param {string[]} [configs.videoAspectRatio=[]] - Array of allowed video aspect ratios (e.g., ['16:9', '4:3']).
 * @param {Function|null} [configs.fileSelectedCallback=null] - Callback invoked with selected file data.
 * @param {Function|null} [configs.noFileSelectedCallback=null] - Callback invoked when no files are selected.
 * @param {boolean} [configs.filePreview=true] - If true, generates previews for selected files.
 * @param {string} [configs.filePreviewPosition='top'] - Position of the preview container ('top' or 'bottom').
 * @param {number} [configs.fileMaxSize=104857600] - Maximum size per file in bytes (default: 100MB).
 * @param {number} [configs.fileMinSize=0] - Minimum size per file in bytes.
 * @param {number} [configs.fileTotalMaxSize=1073741824] - Maximum total size for all files in bytes (default: 1GB).
 * @param {number} [configs.fileTotalMinSize=0] - Minimum total size for all files in bytes.
 * @param {boolean} [configs.playOnPreview=false] - If true, enables playback/interactivity for previews.
 * @throws {Error} If the provided element is invalid, configurations are incorrect, or file validations fail.
 * @example
 * selectFiles(document.querySelector('button'), {
 *   multiple: true,
 *   fileTypes: ['image', 'pdf'],
 *   fileMaxSize: 10 * 1024 * 1024, // 10MB
 *   imageAspectRatio: ['16:9'],
 *   fileSelectedCallback: (files) => console.log('Selected:', files)
 * });
 */
export async function selectFiles(elementInControl, configs = {}) {
    const defaultConfigs = {
        name: 'files',
        selectLater: false,
        multiple: false,
        useCustomFileTypes: false,
        fileTypes: [],
        imageAspectRatio: [],
        videoAspectRatio: [],
        fileSelectedCallback: null,
        noFileSelectedCallback: null,
        filePreview: true,
        filePreviewPosition: 'top',
        fileMaxSize: 1024 * 1024 * 100, // 100MB
        fileMinSize: 0,
        fileTotalMaxSize: 1024 * 1024 * 1000, // 1GB
        fileTotalMinSize: 0,
        playOnPreview: false,
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
    } else {
        inputElementIsNew = true;
        inputElement = document.createElement('input');
        inputElement.type = 'file';
        inputElement.style.display = 'none';
    }

    inputElement.classList.add('lcsFileSelection');

    // Configure input name
    if (!inputElement.hasAttribute('name') || isDataEmpty(inputElement.getAttribute('name'))) {
        if (isDataEmpty(configs.name)) {
            throw new Error('Input name is required and cannot be empty.');
        }
    } else {
        configs.name = inputElement.getAttribute('name');
    }
    let nameSuffixCounter = 1;
    while (document.querySelector(`input.lcsFileSelection[name="${configs.name}"]`)) {
        configs.name = `${configs.name}_${nameSuffixCounter}`;
        nameSuffixCounter++;
    }
    inputElement.name = configs.name;

    // Configure multiple attribute
    if (configs.multiple) {
        inputElement.setAttribute('multiple', '');
    } else {
        inputElement.removeAttribute('multiple');
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
    if (specifiedFileTypes) {
        inputElement.setAttribute('accept', specifiedFileTypes);
    } else {
        inputElement.removeAttribute('accept');
    }
    const specifiedFileTypesArray = specifiedFileTypes.replace(/\./g, '').split(',').filter(Boolean);

    // Validate aspect ratios
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
    window.lcsFileSelection.files[inputName] = window.lcsFileSelection.files[inputName] || {};

    // Handle file selection
    inputElement.addEventListener('change', async (event) => {
        const selectedFiles = configs.multiple ? Array.from(event.target.files) : [event.target.files[0]].filter(Boolean);

        if (selectedFiles.length === 0) {
            if (configs.noFileSelectedCallback) {
                configs.noFileSelectedCallback();
            }
            return;
        }

        // Prepare file data
        let fileData = await Promise.all(
            selectedFiles.map(async (file) => ({
                size: file.size || 0,
                type: file.type || 'unknown',
                name: file.name || 'unknown',
                file,
            }))
        );

        // Filter by allowed MIME types
        fileData = fileData.filter((fd) => {
            const normalizedSFT = specifiedFileTypesArray
                .map((sft) => {
                    if (fileOps.isExtension(fd.file, sft)) return fileOps.getExtensionMimeType(sft);
                    if (fileOps.isMimeType(fd.file, sft)) return sft;
                    return null;
                })
                .filter(Boolean);
            const isAllowed = normalizedSFT.includes(fd.type);
            if (!isAllowed) {
                console.warn(`File "${fd.name}" (type: ${fd.type}) is not an allowed type.`);
            }
            return isAllowed;
        });

        // Validate individual file sizes
        fileData = fileData.filter((fd) => {
            const isValidFileSize = fileOps.validateFileSize(fd.file, {
                maxSize: configs.fileMaxSize,
                minSize: configs.fileMinSize,
            });
            if (!isValidFileSize) {
                console.warn(
                    `File "${fd.name}" (size: ${fd.size} bytes) does not meet size requirements. ` +
                    `Allowed range: ${configs.fileMinSize} to ${configs.fileMaxSize} bytes.`
                );
            }
            return isValidFileSize;
        });

        // Validate total file size
        const totalFileSize = fileData.reduce((sum, fd) => sum + fd.size, 0);
        if (totalFileSize > configs.fileTotalMaxSize || totalFileSize < configs.fileTotalMinSize) {
            throw new Error(
                `Total file size (${fileOps.formatFileSize(totalFileSize)}) must be between ` +
                `${fileOps.formatFileSize(configs.fileTotalMinSize)} and ` +
                `${fileOps.formatFileSize(configs.fileTotalMaxSize)}.`
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
                        console.warn(
                            `Image "${fd.name}" (ratio: ${fRatio}) does not match required aspect ratios: ` +
                            `${configs.imageAspectRatio.join(', ')}.`
                        );
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
                        console.warn(
                            `Video "${fd.name}" (ratio: ${fRatio}) does not match required aspect ratios: ` +
                            `${configs.videoAspectRatio.join(', ')}.`
                        );
                        return null;
                    }
                    return fd;
                })
            ).then((results) => results.filter(Boolean));
        }

        // Store files with tracking IDs
        fileData.forEach((fd) => {
            const trackingID = generateCodes('string', 8);
            fd.tracking_id = trackingID;
            window.lcsFileSelection.files[inputName][trackingID] = fd;
        });

        // Generate previews if enabled
        if (configs.filePreview) {
            let filePreviewContainer = elementInControl.parentElement.querySelector('._file_preview_container');
            if (!filePreviewContainer) {
                filePreviewContainer = document.createElement('div');
                filePreviewContainer.classList.add('_file_preview_container');
                elementInControl.parentElement.insertBefore(
                    filePreviewContainer,
                    configs.filePreviewPosition === 'top' ? elementInControl : elementInControl.nextSibling
                );
            }

            for (const fd of fileData) {
                const thisFile = fd.file;
                const trackingID = fd.tracking_id;
                const isMedia = await fileOps.isMedia(thisFile);
                try {
                    if (isMedia) {
                        await previewMediaFile(thisFile, trackingID, configs.playOnPreview, filePreviewContainer);
                    } else if (isPDFFileType(thisFile)) {
                        await previewPDFFile(thisFile, trackingID, configs.playOnPreview, filePreviewContainer);
                    } else if (isDOCXFileType(thisFile)) {
                        await previewDOCXFile(thisFile, trackingID, configs.playOnPreview, filePreviewContainer);
                    } else if (fileOps.isExtensionTextDoc(fd.name)) {
                        await previewTextDocFile(thisFile, trackingID, configs.playOnPreview, filePreviewContainer);
                    } else {
                        const filePreviewWrapper = document.createElement('div');
                        filePreviewWrapper.className = '_file_preview _unknown_file_preview';
                        filePreviewWrapper.style.overflow = 'hidden';
                        filePreviewWrapper.style.position = 'relative';
                        filePreviewWrapper.dataset.ftid = trackingID;
                        // Escape file name to prevent XSS
                        const escapedName = fd.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        filePreviewWrapper.innerHTML = `<span>${escapedName}</span>`;
                        filePreviewContainer.appendChild(filePreviewWrapper);
                    }
                } catch (error) {
                    console.warn(`Failed to generate preview for "${fd.name}": ${error.message}`);
                }
            }

            // Output above elementInControl
            elementInControl.insertAdjacentHTML('afterbegin', filePreviewContainer.outerHTML);
        }

        // Invoke callback
        if (configs.fileSelectedCallback) {
            configs.fileSelectedCallback(configs.multiple ? fileData : fileData[0]);
        }
    });

    // Append new input element if created
    if (inputElementIsNew) {
        elementInControl.insertAdjacentElement('beforebegin', inputElement);
    }

    // Trigger file selection dialog
    if (!configs.selectLater) {
        inputElement.click();
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

    const filePreviewWrapper = document.createElement('div');
    filePreviewWrapper.className = '_file_preview _media_file_preview';
    filePreviewWrapper.style.overflow = 'hidden';
    filePreviewWrapper.style.position = 'relative';
    filePreviewWrapper.dataset.ftid = trackingID;

    let mediaFileElement;
    if (file.type.startsWith('image/')) {
        image.setFile(file);
        mediaFileElement = await image.renderImage(filePreviewWrapper);
        filePreviewWrapper.classList.add('_image_preview');
        if (playable) {
            filePreviewWrapper.classList.add('_will_expand');
            filePreviewWrapper.insertAdjacentHTML(
                'beforeend',
                `<button type="button" class="_expand_container"><i class="fa-solid fa-expand" title="Expand image"></i></button>`
            );
        }
    } else if (file.type.startsWith('video/')) {
        video.setFile(file);
        mediaFileElement = await video.renderPlayer(filePreviewWrapper, playable, playable);
        filePreviewWrapper.classList.add('_video_preview');
        if (playable) {
            filePreviewWrapper.classList.add('_will_expand');
            filePreviewWrapper.insertAdjacentHTML(
                'beforeend',
                `<button type="button" class="_expand_container"><i class="fa-solid fa-expand" title="Expand video"></i></button>`
            );
        }
    } else if (file.type.startsWith('audio/')) {
        audio.setFile(file);
        mediaFileElement = await audio.renderPlayer(filePreviewWrapper, playable);
        filePreviewWrapper.classList.add('_audio_preview');
    }

    container.appendChild(filePreviewWrapper);
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

    const filePreviewWrapper = document.createElement('div');
    filePreviewWrapper.className = '_file_preview _pdf_preview';
    filePreviewWrapper.style.overflow = 'hidden';
    filePreviewWrapper.style.position = 'relative';
    filePreviewWrapper.dataset.ftid = trackingID;

    pdf.setFile(file);
    await pdf.renderFirstPage(filePreviewWrapper);
    if (playable) {
        filePreviewWrapper.classList.add('_is_interactive');
    }

    container.appendChild(filePreviewWrapper);
    observeFileToEnsurePlayable(filePreviewWrapper, playable);
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

    const filePreviewWrapper = document.createElement('div');
    filePreviewWrapper.className = '_file_preview _doc_preview';
    filePreviewWrapper.style.overflow = 'hidden';
    filePreviewWrapper.style.position = 'relative';
    filePreviewWrapper.dataset.ftid = trackingID;

    docx.setFile(file);
    await docx.renderDOCX(filePreviewWrapper);
    if (playable) {
        filePreviewWrapper.classList.add('_is_interactive');
    }

    container.appendChild(filePreviewWrapper);
    observeFileToEnsurePlayable(filePreviewWrapper, playable);
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

    const filePreviewWrapper = document.createElement('div');
    filePreviewWrapper.className = '_file_preview _text_preview';
    filePreviewWrapper.style.overflow = 'hidden';
    filePreviewWrapper.style.position = 'relative';
    filePreviewWrapper.dataset.ftid = trackingID;

    textDoc.setFile(file);
    await textDoc.renderText(filePreviewWrapper, playable);
    if (playable) {
        filePreviewWrapper.classList.add('_is_editable');
    }

    container.appendChild(filePreviewWrapper);
    observeFileToEnsurePlayable(filePreviewWrapper, playable);
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
                } else if (fileElement.classList.contains('_text_preview') && mutation.attributeName === 'class') {
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