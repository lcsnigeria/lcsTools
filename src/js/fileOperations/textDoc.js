import { isDataEmpty } from "../workingTools/dataTypes.js";

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
        this.#loaded = true;
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
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsText(this.#file);
                });
            } else if (typeof this.#file === 'string') {
                const response = await fetch(this.#file);
                if (!response.ok) {
                    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
                }
                this.#text = await response.text();
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
        const languageMap = {
            'txt': 'plaintext',
            'json': 'json',
            'js': 'javascript',
            'css': 'css',
            'html': 'html',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'cs': 'csharp',
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'ts': 'typescript',
            'sql': 'sql',
            'md': 'markdown',
            'yaml': 'yaml',
            'xml': 'xml'
        };

        // Get text from binary code if provided
        if (this.#usesBinaryCode) {
            this.#text = this.decodeBinary();
        }

        if (!this.#text) {
            throw new Error('No text content available to render as code.');
        }

        const detectedLanguage = language || languageMap[extension] || 'plaintext';
        const editorOptions = {
            value: this.#text,
            language: detectedLanguage,
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