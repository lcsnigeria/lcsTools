import { isDataEmpty } from "../workingTools/dataTypes.js";
import { validateCodeLanguage } from "./codes.js";

/**
 * Validates and constructs TinyMCE configuration objects for plugins, toolbar, and menubar.
 * Allows dynamic addition and removal of plugins, toolbar items, and menubar entries based on options.
 * 
 * @param {boolean} editable - Whether the editor should be editable (affects toolbar/menubar).
 * @param {Object} options - Configuration options for customizing TinyMCE.
 * @param {string} [options.add_plugins] - Space-separated list of plugins to add.
 * @param {string} [options.remove_plugins] - Space-separated list of plugins to remove.
 * @param {string} [options.add_toolbar] - Space-separated list of toolbar items to add (use "|" for separators).
 * @param {string} [options.remove_toolbar] - Space-separated list of toolbar items to remove.
 * @param {string} [options.add_menubar] - Space-separated list of menubar items to add.
 * @param {string} [options.remove_menubar] - Space-separated list of menubar items to remove.
 * @returns {Object} Object containing options, setPlugins, setToolbar, and setMenubar strings for TinyMCE config.
 * 
 * @example
 * const config = validateTRTRConfigs(true, {
 *   add_plugins: 'spellchecker',
 *   remove_toolbar: 'underline',
 *   add_menubar: 'help'
 * });
 * // config.setPlugins, config.setToolbar, config.setMenubar
 */
function validateTRTRConfigs(editable, options) {
    // Default TinyMCE plugins (space-separated string)
    const tinymceDefaultPlugins = `a11ychecker advlist autolink lists link image editimage charmap preview anchor 
    searchreplace visualblocks code fullscreen insertdatetime media 
    table advtable wordcount importword exportword exportpdf powerpaste`;

    // Default TinyMCE toolbar (string, "|" is separator)
    const tinymceDefaultToolbar = `undo redo | formatselect | bold italic underline | 
            alignleft aligncenter alignright alignjustify | 
            bullist numlist outdent indent | link image table | removeformat | 
            importword exportword | exportpdf | a11ycheck`;

    // Default TinyMCE menubar (string, space-separated)
    const tinymceDefaultMenubar = 'file edit insert view format table tools';

    // Initialize config variables
    let setPlugins = tinymceDefaultPlugins;
    let setToolbar = false;
    let setMenubar = false;

    // -------------------- Plugins: Add --------------------
    // If add_plugins is provided, add each plugin if not already present
    if (!isDataEmpty(options.add_plugins)) {
        let additionalPlugins = options.add_plugins;
        delete options.add_plugins; // Remove from options to avoid side effects

        // Split plugins by space, filter out empty entries
        const apArray = additionalPlugins.split(' ').filter(api => !isDataEmpty(api));
        apArray.forEach(api => {
            // Only add if not already present
            if (!setPlugins.includes(api)) {
                setPlugins = setPlugins + ' ' + api;
            }
        });
        // Normalize whitespace
        setPlugins = setPlugins.replace(/\s+/, ' ');
    }

    // -------------------- Plugins: Remove --------------------
    // If remove_plugins is provided, remove each plugin from the string
    if (!isDataEmpty(options.remove_plugins)) {
        let omittingPlugins = options.remove_plugins;
        delete options.remove_plugins;

        // Split plugins by space, filter out empty entries
        const rpArray = omittingPlugins.split(' ').filter(rpi => !isDataEmpty(rpi));
        rpArray.forEach(rpi => {
            // Remove all occurrences using word boundary regex
            setPlugins = setPlugins.replace(new RegExp(`\\b${rpi}\\b`, 'g'), '');
        });
        // Normalize whitespace
        setPlugins = setPlugins.replace(/\s+/, ' ');
    }

    // Only set toolbar/menubar if editable
    if (editable) {
        setToolbar = tinymceDefaultToolbar;
        setMenubar = tinymceDefaultMenubar;

        // -------------------- Toolbar: Add --------------------
        // If add_toolbar is provided, add each item if not already present
        if (!isDataEmpty(options.add_toolbar)) {
            let additionalToolbar = options.add_toolbar;
            delete options.add_toolbar;

            // Replace "|" with a placeholder to avoid splitting on it
            additionalToolbar = additionalToolbar.replace(/\|/g, 'demarc_stroke');
            // Split toolbar items by space, filter out empty entries
            const atArray = additionalToolbar.split(' ').filter(ati => !isDataEmpty(ati));
            atArray.forEach(ati => {
                // Restore "|" if needed
                const item = ati.replace(/demarc_stroke/g, '|');
                // Only add if not already present
                if (!setToolbar.includes(item)) {
                    setToolbar += ' ' + item;
                }
            });
            // Clean up toolbar string:
            // - Normalize whitespace
            // - Restore "|" from placeholder
            // - Remove duplicate or leading/trailing separators
            setToolbar = setToolbar
                .replace(/\s+/g, ' ')
                .replace(/demarc_stroke/g, '|')
                .replace(/\|\s*\|+/g, '|')
                .replace(/^\|/, '')
                .replace(/\|$/, '')
                .trim();
        }

        // -------------------- Toolbar: Remove --------------------
        // If remove_toolbar is provided, remove each item from the toolbar string
        if (!isDataEmpty(options.remove_toolbar)) {
            let omittingToolbar = options.remove_toolbar;
            delete options.remove_toolbar;

            // Remove "|" from removal list (not a toolbar item)
            omittingToolbar = omittingToolbar.replace(/\|/g, '');
            // Split toolbar items by space, filter out empty entries
            const rtArray = omittingToolbar.split(' ').filter(rti => !isDataEmpty(rti));
            rtArray.forEach(rti => {
                // Remove all occurrences using word boundary regex
                const regex = new RegExp(`\\b${rti}\\b`, 'g');
                setToolbar = setToolbar.replace(regex, '');
            });
            // Clean up toolbar string:
            // - Normalize whitespace
            // - Remove duplicate or leading/trailing separators
            setToolbar = setToolbar
                .replace(/\s+/g, ' ')
                .replace(/\|\s*\|+/g, '|')
                .replace(/^\|/, '')
                .replace(/\|$/, '')
                .trim();
        }

        // -------------------- Menubar: Add --------------------
        // If add_menubar is provided, add each item if not already present
        if (!isDataEmpty(options.add_menubar)) {
            let amArray = options.add_menubar.split(' ').filter(ami => !isDataEmpty(ami));
            amArray.forEach(ami => {
            if (!setMenubar.includes(ami)) {
                setMenubar += ' ' + ami;
            }
            });
            // Normalize whitespace
            setMenubar = setMenubar.replace(/\s+/g, ' ').trim();
            delete options.add_menubar;
        }

        // -------------------- Menubar: Remove --------------------
        // If remove_menubar is provided, remove each item from the menubar string
        if (!isDataEmpty(options.remove_menubar)) {
            let rmArray = options.remove_menubar.split(' ').filter(rmi => !isDataEmpty(rmi));
            rmArray.forEach(rmi => {
            // Remove all occurrences using word boundary regex
            const regex = new RegExp(`\\b${rmi}\\b`, 'g');
            setMenubar = setMenubar.replace(regex, '');
            });
            // Normalize whitespace
            setMenubar = setMenubar.replace(/\s+/g, ' ').trim();
            delete options.remove_menubar;
        }
    }

    // Return the constructed config strings
    return {
        options,
        setPlugins,   // Final plugins string for TinyMCE config
        setToolbar,   // Final toolbar string for TinyMCE config (or false if not editable)
        setMenubar    // Final menubar string for TinyMCE config (or false if
    };
}

/**
 * A class for loading and rendering text-based files.
 * Supports loading from URLs or File objects and rendering as plain text or code with syntax highlighting using Monaco Editor.
 */
class lcsLoadTextDoc {
    #file;

    #loaded = false;
    #usesBinaryCode = false;
    #usesText = false;

    #binaryCode = null;
    #text = null;

    /**
     * Creates an instance of lcsLoadTextDoc.
     * @param {string|File|null} [file=null] - The file to load, either as a URL string or a File object.
     * @example
     * const textDoc = new lcsLoadTextDoc();
     * const textDocWithFile = new lcsLoadTextDoc('https://example.com/file.txt');
     * const textDocWithFileObj = new lcsLoadTextDoc(fileInput.files[0]);
     */
    constructor(file = null) {
        this.#file = !isDataEmpty(file) ? file : null;
    }

    /**
     * Sets the file to be loaded.
     * @param {string|File} file - The file to set, either as a URL string or a File object.
     * @throws {Error} If the file is empty or null.
     * @example
     * textDoc.setFile('https://example.com/file.txt');
     * textDoc.setFile(fileInput.files[0]);
     */
    setFile(file) {
        if (isDataEmpty(file)) {
            throw new Error("File cannot be empty or null.");
        }
        this.#file = file;
        this.#loaded = false;
        this.#text = null;
        this.#usesBinaryCode = false;
        this.#usesText = false;
    }

    /**
     * Sets the file content directly, supporting text or binary data.
     * Clears any previous file reference.
     * @param {string|ArrayBuffer|Uint8Array} content - The content to set.
     * @example
     * textDoc.setFileContent('console.log("Hello!");');
     * textDoc.setFileContent(new Uint8Array([0x01, 0x02]));
     */
    setFileContent(content) {
        this.#file = null;
        if (
            content instanceof ArrayBuffer ||
            content instanceof Uint8Array
        ) {
            this.#usesBinaryCode = true;
            this.#usesText = false;
            this.#binaryCode = content;
            this.#text = null;
        } else if (typeof content === 'string') {
            this.#usesText = true;
            this.#usesBinaryCode = false;
            this.#text = content;
            this.#binaryCode = null;
        } else {
            throw new Error('Content must be a string or binary (ArrayBuffer/Uint8Array).');
        }
        this.#loaded = true;
    }

    /**
     * Decodes binary code to text using UTF-8.
     * If no argument is provided, uses the class property.
     * Throws error if not binary code.
     * @param {ArrayBuffer|Uint8Array|null} binaryCode - The binary code to decode.
     * @returns {string} The decoded text.
     * @throws {Error} If no binary code is available.
     * @example
     * const text = textDoc.decodeBinary();
     * const text2 = textDoc.decodeBinary(someUint8Array);
     */
    decodeBinary(binaryCode = null) {
        const code = binaryCode ?? this.#binaryCode;
        if (!(code instanceof ArrayBuffer || code instanceof Uint8Array)) {
            throw new Error('No binary code to decode.');
        }
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(code);
    }

    /**
     * Loads the file content.
     * @private
     * @throws {Error} If no file is set or loading fails.
     */
    async #loadFile() {
        if (this.#loaded) return;
        if (!this.#file) {
            throw new Error('No file set');
        }
        try {
            if (this.#file instanceof File) {
                if (this.#file.size > 10 * 1024 * 1024) { // 10MB
                    console.warn('Large file detected. Loading may be slow.');
                }
                this.#text = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        resolve(event.target.result);
                    };
                    reader.onerror = function() {
                        reject(new Error('Failed to read file'));
                    };
                    reader.readAsText(this.#file);
                });
            } else if (typeof this.#file === 'string') {
                const response = await fetch(this.#file);
                if (!response.ok) {
                    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
                }
                const blob = await response.blob();
                const filename = new URL(this.#file).pathname.split('/').pop() || 'downloaded_file.txt';
                this.#file = new File([blob], filename, { type: blob.type, lastModified: Date.now() });
                this.#text = await blob.text();
            } else {
                throw new Error('Unsupported file type: must be a URL string or File object.');
            }
            this.#loaded = true;
        } catch (error) {
            throw new Error(`Failed to load file: ${error.message}`);
        }
    }

    /**
     * Renders the text content in the specified container.
     * @param {HTMLElement} container - The container element to render into.
     * @param {boolean} [editable=false] - Whether to render as an editable textarea.
     * @returns {HTMLElement} The rendered element (pre or textarea).
     * @throws {Error} If the container is not a valid HTML element.
     * @example
     * await textDoc.renderText(container, false); // Non-editable plain text
     * await textDoc.renderText(container, true); // Editable text
     */
    async renderText(container, editable = false) {
        if (!(container instanceof HTMLElement)) {
            throw new Error('Container must be a valid HTML element');
        }
        await this.#loadFile();
        container.innerHTML = '';
        if (editable) {
            const textarea = document.createElement('textarea');
            textarea.className = '_text_doc _text_doc_textarea';
            textarea.value = this.#text;
            container.appendChild(textarea);
            return textarea;
        } else {
            const pre = document.createElement('pre');
            pre.className = '_text_doc _text_doc_pre';
            pre.textContent = this.#text;
            container.appendChild(pre);
            return pre;
        }
    }

    async #ensureMonaco() {
        if (window.monaco && window.monaco.editor) {
            return;
        }
    
        // Load AMD loader
        await new Promise((resolve, reject) => {
            if (window.require) return resolve(); // Already loaded
    
            const loaderScript = document.createElement('script');
            loaderScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs/loader.min.js';
            loaderScript.onload = resolve;
            loaderScript.onerror = () => reject(new Error('Failed to load Monaco loader script'));
            document.head.appendChild(loaderScript);
        });
    
        // Configure require
        window.require.config({
            paths: {
                vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs'
            }
        });
    
        // Load Monaco editor main module
        await new Promise((resolve, reject) => {
            window.require(['vs/editor/editor.main'], () => {
                if (window.monaco && window.monaco.editor) {
                    resolve();
                } else {
                    reject(new Error('Monaco failed to initialize.'));
                }
            });
        });
    }

    /**
     * Ensures that the TinyMCE editor script is loaded on the page.
     * Loads the TinyMCE script from CDN if not already present, using an API key if provided in options.
     * @private
     * @param {Object} [options={}] - Options object that may contain an apiKey for TinyMCE.
     * @returns {Promise<void>} Resolves when TinyMCE is loaded.
     * @throws {Error} If the script fails to load.
     */
    async #ensureTinyMCE(options = {}) {
        if (window.tinymce) {
            return;
        }
        const apiKey = options.apiKey || 'no-api-key';
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://cdn.tiny.cloud/1/${apiKey}/tinymce/7/tinymce.min.js`;
            script.referrerPolicy = 'origin';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load TinyMCE script'));
            document.head.appendChild(script);
        });
    }

    /**
     * Ensures that the CKEditor 5 script & styles are loaded on the page.
     * Loads the CKEditor 5 UMD build and CSS from the official CDN if not already present.
     * @private
     * @returns {Promise<void>} Resolves when CKEditor 5 is ready.
     * @throws {Error} If the script fails to load.
     */
    async #ensureCKEditor() {
        if (window.CKEDITOR) {
            return;
        }

        // Load CSS if not already present
        if (!document.querySelector('link[href="https://cdn.ckeditor.com/ckeditor5/46.0.2/ckeditor5.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.ckeditor.com/ckeditor5/46.0.2/ckeditor5.css';
            document.head.appendChild(link);
        }

        // Load JS
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.ckeditor.com/ckeditor5/46.0.2/ckeditor5.umd.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load CKEditor 5 script'));
            document.head.appendChild(script);
        });
    }

    /**
     * Gets the file extension from the file name.
     * @private
     * @returns {string|null} The file extension or null if not determinable.
     */
    #getExtension() {
        let filename;
        if (typeof this.#file === 'string') {
            try {
                filename = new URL(this.#file).pathname.split('/').pop();
            } catch {
                return null;
            }
        } else if (this.#file instanceof File) {
            filename = this.#file.name;
        } else {
            return null;
        }
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : null;
    }

    /**
     * Renders the text content as code with syntax highlighting using Monaco Editor.
     * @param {HTMLElement} container - The container element to render into.
     * @param {boolean} [editable=false] - Whether the editor should be editable.
     * @param {string} [language=null] - The language to use for syntax highlighting. If null, it will be auto-detected based on file extension.
     * @param {Object} [options={}] - Additional options for the Monaco Editor.
     * @returns {monaco.editor.IStandaloneCodeEditor} The created Monaco editor instance.
     * @throws {Error} If the container is not a valid HTML element.
     * @example
     * await textDoc.renderAsCode(container, false); // Non-editable code with auto-detected language
     * await textDoc.renderAsCode(container, true, 'javascript', { theme: 'vs-light' }); // Editable JavaScript code with light theme
     */
    async renderAsCode(container, editable = false, language = null, options = {}) {
        if (!(container instanceof HTMLElement)) {
            throw new Error('Container must be a valid HTML element');
        }
        
        // Load file if not using either text or binary code
        if (!this.#usesText && !this.#usesBinaryCode) {
            await this.#loadFile();
        }

        await this.#ensureMonaco();
        container.innerHTML = '';
        const extension = this.#getExtension();

        // Get text from binary code if provided
        if (this.#usesBinaryCode) {
            this.#text = this.decodeBinary();
        }

        if (!this.#text) {
            throw new Error('No text content available to render as code.');
        }

        const editorOptions = {
            value: this.#text,
            language: validateCodeLanguage(language || extension),
            readOnly: !editable,
            automaticLayout: true,
            theme: 'vs-dark', // Default theme
            fontSize: 14,
            ...options
        };

        // Create container for monaco
        const monacoContainer = document.createElement('div');
        monacoContainer.classList.add('_text_doc', '_text_doc_monaco_editor');

        const editor = monaco.editor.create(monacoContainer, editorOptions);

        container.appendChild(monacoContainer);
        return editor;
    }

    /**
     * Renders the text content as rich text using TinyMCE or CKEditor 5.
     * @param {string} [editorType='tinymce'] - The editor to use ('tinymce' or 'ckeditor').
     * @param {HTMLElement} container - The container element to render into.
     * @param {boolean} [editable=true] - Whether the editor should be editable.
     * @param {Object} [options={}] - Additional options to override or extend the default editor configuration. Properties in options take precedence over defaults.
     * @returns {Promise<Object>} The editor instance (TinyMCE or CKEditor 5).
     * @throws {Error} If the container is invalid, editor fails to initialize, or editorType is invalid.
     * @example
     * await textDoc.renderAsRichText('tinymce', container, true, {
     *   apiKey: 'your-api-key', // Set TinyMCE API key
     *   toolbar: 'bold italic | link' // Override toolbar
     * }); // Editable TinyMCE with custom API key and toolbar
     * await textDoc.renderAsRichText('ckeditor', container, false, {
     *   contentStyles: [{ name: 'body', styles: { 'font-size': '16px' } }]
     * }); // Non-editable CKEditor with custom styles
     */
    async renderAsRichText(editorType = 'tinymce', container, editable = true, options = {}) {
        if (!(container instanceof HTMLElement)) {
            throw new Error('Container must be a valid HTML element');
        }

        // Ensure content is loaded
        if (!this.#usesText && !this.#usesBinaryCode) {
            await this.#loadFile();
        }
        if (this.#usesBinaryCode) {
            this.#text = this.decodeBinary();
        }
        if (!this.#text) {
            throw new Error('No text content available to render as rich text.');
        }

        // Cleanup old editors if any
        if (window.tinymce) {
            window.tinymce.remove();
        }
        if (container._ckeditorInstance) {
            await container._ckeditorInstance.destroy();
            container._ckeditorInstance = null;
        }

        container.innerHTML = '';
        const content = this.#text;

        // -------------------- TinyMCE --------------------
        if (editorType.toLowerCase() === 'tinymce') {
            await this.#ensureTinyMCE(options);

            const editorContainer = document.createElement('div');
            editorContainer.classList.add('_text_doc', '_text_doc_tinymce');
            container.appendChild(editorContainer);

            const editorId = `tinymce_${Math.random().toString(36).substr(2, 9)}`;
            editorContainer.id = editorId;

            const VRTRConfigs = validateTRTRConfigs(editable, options);
            options = VRTRConfigs.options;

            await window.tinymce.init({...{
                target: editorContainer,
                inline: false,
                readonly: !editable,
                plugins: VRTRConfigs.setPlugins,
                toolbar: VRTRConfigs.setToolbar,
                menubar: VRTRConfigs.setMenubar,
                content_style: 'body { font-family: Arial, sans-serif; font-size: 14px }',
                setup: (editor) => {
                    editor.on('init', () => {
                        editor.setContent(content);   // ✅ proper way to load text
                    });
                }
            }, ...options});

            return window.tinymce.get(editorId);
        }

        // -------------------- CKEditor --------------------
        else if (editorType.toLowerCase() === 'ckeditor') {
            await this.#ensureCKEditor();

            const editorContainer = document.createElement('div');
            editorContainer.classList.add('_text_doc', '_text_doc_ckeditor');
            container.appendChild(editorContainer);

            const {
                ClassicEditor,
                Essentials,
                Bold,
                Italic,
                Underline,
                Strikethrough,
                Paragraph,
                Heading,
                Link,
                List,
                Table,
                Image,
                ImageToolbar,
                ImageUpload,
                MediaEmbed,
                Undo,
                Font
            } = window.CKEDITOR;

            const licenseKey = options.apiKey || '<YOUR_LICENSE_KEY>'; // required by new builds
            delete options.apiKey;

            const editor = await ClassicEditor.create(editorContainer, {...{
                licenseKey,
                plugins: [
                    Essentials, Bold, Italic, Underline, Strikethrough,
                    Paragraph, Heading, Link, List, Table,
                    Image, ImageToolbar, ImageUpload, MediaEmbed,
                    Undo, Font
                ],
                toolbar: editable
                    ? [
                        'undo', 'redo', '|',
                        'heading', '|',
                        'bold', 'italic', 'underline', 'strikethrough', '|',
                        'link', 'bulletedList', 'numberedList', '|',
                        'insertTable', 'uploadImage', 'mediaEmbed', '|',
                        'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
                    ]
                    : [],
                initialData: content,
                readOnly: !editable
            },  ...options});

            container._ckeditorInstance = editor;
            return editor;
        }

        // -------------------- Invalid --------------------
        else {
            throw new Error("Invalid editorType. Use 'tinymce' or 'ckeditor'.");
        }
    }

    /**
     * Gets the loaded text content.
     * @returns {Promise<string>} The text content.
     * @throws {Error} If the file is not loaded or loading fails.
     * @example
     * const text = await textDoc.getText();
     * console.log(text);
     */
    async getText() {
        await this.#loadFile();
        return this.#text;
    }

    /**
     * Gets the filename of the loaded file.
     * @returns {string|null} The filename or null if not a File object or determinable.
     * @example
     * const name = textDoc.getName();
     * console.log(name);
     */
    getName() {
        if (this.#file instanceof File) {
            return this.#file.name;
        } else if (typeof this.#file === 'string') {
            try {
                return new URL(this.#file).pathname.split('/').pop();
            } catch {
                return null;
            }
        }
        return null;
    }

    /**
     * Gets the MIME type of the loaded file.
     * @returns {string|null} The MIME type or null if not a File object.
     * @example
     * const type = textDoc.getType();
     * console.log(type);
     */
    getType() {
        return this.#file instanceof File ? this.#file.type : null;
    }

    /**
     * Gets the size of the loaded file in bytes.
     * @returns {number|null} The size in bytes or null if not a File object.
     * @example
     * const size = textDoc.getSize();
     * console.log(size);
     */
    getSize() {
        return this.#file instanceof File ? this.#file.size : null;
    }

    /**
     * Gets the last modified timestamp of the loaded file.
     * @returns {number|null} The timestamp or null if not a File object.
     * @example
     * const modified = textDoc.getLastModified();
     * console.log(modified);
     */
    getLastModified() {
        return this.#file instanceof File ? this.#file.lastModified : null;
    }
}

/**
 * A singleton instance for global text-based docs loading usage.
 * @module textDoc
 */
export const textDoc = new lcsLoadTextDoc();
export default lcsLoadTextDoc;