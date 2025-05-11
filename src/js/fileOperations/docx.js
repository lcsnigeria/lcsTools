/**
 * A utility class for loading and rendering .docx documents in the browser.
 * Uses Mammoth.js to convert .docx files to HTML for display.
 * Supports browser-based rendering and HTML extraction with a singleton instance for global use.
 * 
 * @class
 */
class lcsLoadDOCX {
    /** @private {File|null} The .docx file to process */
    #file = null;
    /** @private {string|null} The converted HTML content */
    #html = null;
    /** @private {boolean} Whether the file has been loaded and converted */
    #loaded = false;
    /** @private {boolean} Whether Mammoth.js has been loaded */
    #mammothLoaded = false;
    /** @private {string} CDN URL for Mammoth.js */
    static #MAMMOTH_CDN = 'https://unpkg.com/mammoth/mammoth.browser.min.js';

    /**
     * Initializes the instance with an optional .docx File object.
     * 
     * @param {File|null} [file=null] - The .docx file to load (browser only).
     * @throws {Error} If the file is provided but invalid.
     * @example
     * const docxLoader = new lcsLoadDOCX(new File([''], 'example.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
     */
    constructor(file = null) {
        if (file) this.setFile(file);
    }

    /**
     * Assigns a .docx File object for processing.
     * 
     * @param {File} file - The .docx file to load.
     * @throws {Error} If the file is not a valid File object or not a .docx file.
     * @example
     * const file = new File([''], 'example.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
     * docxLoader.setFile(file);
     */
    setFile(file) {
        if (!(file instanceof File)) {
            throw new Error('Expected a valid File object.');
        }
        if (!file.name.toLowerCase().endsWith('.docx') && !['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
            throw new Error('File must be a .docx document.');
        }
        this.#file = file;
        this.#loaded = false;
        this.#html = null;
    }

    /**
     * Loads the Mammoth.js library in the browser if not already loaded.
     * 
     * @private
     * @returns {Promise<void>}
     * @throws {Error} If the script fails to load.
     */
    async #loadMammothJS() {
        if (typeof window === 'undefined') {
            throw new Error('Mammoth.js loading is only supported in the browser.');
        }
        if (this.#mammothLoaded || window.mammoth) {
            this.#mammothLoaded = true;
            return;
        }

        const existingScript = document.querySelector(`script[src="${lcsLoadDOCX.#MAMMOTH_CDN}"]`);
        if (!existingScript) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = lcsLoadDOCX.#MAMMOTH_CDN;
                script.onload = () => {
                    this.#mammothLoaded = true;
                    resolve();
                };
                script.onerror = () => reject(new Error('Failed to load Mammoth.js from CDN.'));
                document.head.appendChild(script);
            });
        } else {
            this.#mammothLoaded = true;
        }
    }

    /**
     * Initializes the instance by loading and converting the .docx file to HTML.
     * 
     * @private
     * @returns {Promise<void>}
     * @throws {Error} If no file is set or conversion fails.
     */
    async #initialize() {
        if (this.#loaded) return;
        if (!this.#file) {
            throw new Error('No .docx file set. Call setFile() first.');
        }

        await this.#loadMammothJS();
        const buffer = await this.#file.arrayBuffer();
        const result = await window.mammoth.convertToHtml({ arrayBuffer: buffer });
        this.#html = result.value;
        this.#loaded = true;
    }

    /**
     * Renders the .docx content as HTML into a specified container.
     * 
     * @param {HTMLElement} container - The HTML element to render the content into.
     * @returns {Promise<void>}
     * @throws {Error} If called outside the browser, the container is invalid, or initialization fails.
     * @example
     * const container = document.querySelector('#docx-preview');
     * await docxLoader.renderDOCX(container);
     */
    async renderDOCX(container) {
        if (typeof window === 'undefined') {
            throw new Error('renderDOCX is only available in the browser.');
        }
        if (!(container instanceof HTMLElement)) {
            throw new Error('Container must be a valid HTMLElement.');
        }

        await this.#initialize();
        // Sanitize HTML to prevent XSS
        const div = document.createElement('div');
        div.className = '_docx';
        div.textContent = this.#html; // Text content is safe
        container.innerHTML = div.innerHTML;
    }

    /**
     * Retrieves the HTML content extracted from the .docx file.
     * 
     * @returns {Promise<string>} The HTML string of the .docx content.
     * @throws {Error} If called outside the browser or initialization fails.
     * @example
     * const html = await docxLoader.getHTML();
     * console.log(html);
     */
    async getHTML() {
        if (typeof window === 'undefined') {
            throw new Error('getHTML is only available in the browser.');
        }
        await this.#initialize();
        return this.#html || '';
    }
}

/**
 * A singleton instance of lcsLoadDOCX for global use in the browser.
 * Suitable for handling a single .docx file at a time.
 * 
 * @type {lcsLoadDOCX}
 * @example
 * import { docx } from './lcsLoadDOCX.js';
 * docx.setFile(new File([''], 'example.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
 * await docx.renderDOCX(document.querySelector('#docx-preview'));
 */
export const docx = new lcsLoadDOCX();

/**
 * The lcsLoadDOCX class for creating new instances.
 * 
 * @type {typeof lcsLoadDOCX}
 */
export default lcsLoadDOCX;