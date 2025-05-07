import { isDataEmpty } from "../workingTools/dataTypes";

const pdfJSCDN = {
    main: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    worker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
};

/**
 * A utility class for loading and rendering PDF files using PDF.js.
 * Supports both remote URLs and local `File` objects.
 */
class lcsLoadPDF {
    #file;
    #pdf = null;
    #loaded = false;

    /**
     * Constructs a new PDF loader instance.
     *
     * @param {string|File|null} file - The PDF file as a URL or File object. Can be set later via `setFile`.
     */
    constructor(file = null) {
        this.#file = !isDataEmpty(file) ? file : null;
    }

    /**
     * Sets or replaces the PDF file to load.
     *
     * @param {string|File} file - The file to set (URL or File object).
     * @throws Will throw an error if the file is empty or invalid.
     */
    setFile(file) {
        if (isDataEmpty(file)) {
            throw new Error("File cannot be empty or null.");
        }
        this.#file = file;
        this.#loaded = false;
    }

    /**
     * Ensures PDF.js library and its worker are loaded into the page.
     *
     * @private
     */
    async #ensurePDFJS() {
        const scriptUrl = pdfJSCDN.main;

        if (!window.pdfjsLib) {
            const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
            if (!existingScript) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = scriptUrl;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            } else if (!existingScript.hasAttribute('data-loaded')) {
                await new Promise(resolve => {
                    existingScript.addEventListener('load', resolve, { once: true });
                });
            }
        }

        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = pdfJSCDN.worker;
        }
    }

    /**
     * Loads the PDF document using PDF.js.
     *
     * @private
     * @throws Will throw if the file type is unsupported.
     */
    async #init() {
        if (this.#loaded) return;
        await this.#ensurePDFJS();

        if (typeof this.#file === 'string') {
            this.#pdf = await pdfjsLib.getDocument(this.#file).promise;
        } else if (this.#file instanceof File) {
            const buffer = await this.#file.arrayBuffer();
            this.#pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
        } else {
            throw new Error('Unsupported file type: must be a URL string or File object.');
        }

        this.#loaded = true;
    }

    /**
     * Gets the list of all page numbers in the PDF.
     *
     * @returns {Promise<number[]>} - An array of page numbers (1-based).
     */
    async getPageNumbers() {
        await this.#init();
        return Array.from({ length: this.#pdf.numPages }, (_, i) => i + 1);
    }

    /**
     * Renders a specific page of the PDF into a container.
     *
     * @param {number} pageNumber - The page number to render (1-based).
     * @param {HTMLElement} container - The DOM element to render the canvas into.
     * @returns {Promise<void>}
     */
    async renderPage(pageNumber, container) {
        await this.#init();

        const page = await this.#pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });

        container.innerHTML = '';

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        container.appendChild(canvas);

        await page.render({ canvasContext: context, viewport }).promise;
    }

    /**
     * Renders the first page of the PDF.
     *
     * @param {HTMLElement} container - The DOM element to render into.
     * @returns {Promise<void>}
     */
    async renderFirstPage(container) {
        return this.renderPage(1, container);
    }

    /**
     * Renders the last page of the PDF.
     *
     * @param {HTMLElement} container - The DOM element to render into.
     * @returns {Promise<void>}
     */
    async renderLastPage(container) {
        await this.#init();
        return this.renderPage(this.#pdf.numPages, container);
    }
}

/**
 * A singleton instance of lcsLoadPDF for global usage.
 *
 * @module pdf
 */
export const pdf = new lcsLoadPDF();
export default lcsLoadPDF;