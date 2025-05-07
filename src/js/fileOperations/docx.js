// Only include the Node-specific code if running in a Node environment
let mammoth, fs;
if (typeof window === "undefined") {
    mammoth = require('mammoth');
    fs = require('fs').promises;
}

/**
 * Supported input formats for conversion
 * @type {Object}
 */
const SUPPORTED_FORMATS = {
    DOC: '.doc',
    DOCX: '.docx',
    RTF: '.rtf',
    ODT: '.odt'
};

const mammothCDN = "https://unpkg.com/mammoth/mammoth.browser.min.js";

/**
 * lcsLoadDOCX - A cross-environment utility for loading and rendering .docx documents.
 * Supports browser-based viewing and server-side conversions.
 */
class lcsLoadDOCX {
    #file;
    #html = null;
    #loaded = false;

    /**
     * Initialize with optional File object (browser only).
     * @param {File|null} file 
     */
    constructor(file = null) {
        if (file) this.setFile(file);
    }

    /**
     * Assign a .docx File object (browser only).
     * @param {File} file 
     */
    setFile(file) {
        if (!(file instanceof File)) {
            throw new Error("Expected a File object (browser environment only).");
        }
        this.#file = file;
        this.#loaded = false;
    }

    /**
     * Ensures the mammoth.js library is loaded in the browser.
     * @private
     */
    async #ensureMammothJS() {
        if (typeof window === "undefined") return;

        if (!window.mammoth) {
            const existingScript = document.querySelector(`script[src="${mammothCDN}"]`);
            if (!existingScript) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement("script");
                    script.src = mammothCDN;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
        }
    }

    /**
     * Internal initializer that loads and converts the file to HTML.
     * @private
     */
    async #init() {
        if (this.#loaded) return;

        await this.#ensureMammothJS();

        const buffer = await this.#file.arrayBuffer();
        const result = await window.mammoth.convertToHtml({ arrayBuffer: buffer });
        this.#html = result.value;
        this.#loaded = true;
    }

    /**
     * Renders the DOCX HTML content into a given container (browser only).
     * @param {HTMLElement} container 
     */
    async renderDOCX(container) {
        if (typeof window === "undefined") {
            throw new Error("renderDOCX() can only be used in the browser.");
        }
        if (!(container instanceof HTMLElement)) {
            throw new Error("Container must be a valid HTMLElement.");
        }

        await this.#init();
        container.innerHTML = this.#html;
    }

    /**
     * Converts supported file types to DOCX (Node.js only).
     * @param {string} inputPath - Path to the input file.
     * @param {string} [outputPath] - Optional output path for the converted DOCX file.
     * @returns {Promise<string>} Path to the saved DOCX file.
     */
    async convertToDocx(inputPath, outputPath) {
        if (typeof window !== "undefined") {
            throw new Error("convertToDocx() is only available in Node.js.");
        }

        try {
            const ext = inputPath.toLowerCase().slice(inputPath.lastIndexOf('.'));
            if (!Object.values(SUPPORTED_FORMATS).includes(ext)) {
                throw new Error(`Unsupported input format: ${ext}`);
            }

            if (!outputPath) {
                outputPath = inputPath.replace(/\.[^.]+$/, '.docx');
            }

            const buffer = await fs.readFile(inputPath);
            const result = await mammoth.convertToHtml({ buffer });
            const docxBuffer = await mammoth.convertHtmlToDocx(result.value);

            await fs.writeFile(outputPath, docxBuffer);
            return outputPath;
        } catch (error) {
            throw new Error(`Conversion failed: ${error.message}`);
        }
    }

    /**
     * Returns the extracted HTML string from the DOCX file (browser only).
     * @returns {Promise<string>}
     */
    async getHTML() {
        if (typeof window === "undefined") {
            throw new Error("getHTML() is only available in the browser.");
        }
        await this.#init();
        return this.#html;
    }
}

/**
 * A singleton instance for global DOCX loading usage in the browser.
 * Use this only when dealing with a single file at a time.
 * 
 * @module docx
 */
export const docx = typeof window !== "undefined" ? new lcsLoadDOCX() : null;
export default lcsLoadDOCX;