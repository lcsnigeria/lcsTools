import '../../css/fileOperations/csv.css';
import { isDataEmpty } from "../workingTools/dataTypes";

const PAPA_PARSE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js";

/**
 * A utility class for loading and parsing CSV files.
 * Uses PapaParse library for CSV parsing.
 */
class lcsLoadCSV {
    #file;
    #data = null;
    #loaded = false;
    #papa = null;

    /**
     * Creates a new CSV loader instance.
     * @param {string|File|null} [file=null] - The CSV file as a URL or File object.
     */
    constructor(file = null) {
        this.#file = !isDataEmpty(file) ? file : null;
    }

    /**
     * Ensures PapaParse library is loaded.
     * @private
     */
    async #ensurePapaParse() {
        if (window.Papa) {
            this.#papa = window.Papa;
            return;
        }

        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = PAPA_PARSE_CDN;
            script.onload = () => {
                this.#papa = window.Papa;
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load PapaParse'));
            document.head.appendChild(script);
        });
    }

    /**
     * Sets or replaces the CSV file to load.
     * @param {string|File} file - The file to set (URL or File object)
     */
    setFile(file) {
        if (isDataEmpty(file)) {
            throw new Error("File cannot be empty or null.");
        }
        if (file instanceof File && !file.name.toLowerCase().endsWith('.csv')) {
            throw new Error('File must be a CSV file.');
        }
        this.#file = file;
        this.#loaded = false;
        this.#data = null;
    }

    /**
     * Ensures the CSV is loaded and parsed.
     * @private
     */
    async #ensureLoaded() {
        if (this.#loaded) return;

        await this.#ensurePapaParse();

        try {
            if (typeof this.#file === 'string') {
                // Load from URL
                const response = await fetch(this.#file);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const text = await response.text();
                const result = this.#papa.parse(text, { header: true });
                if (result.errors.length > 0) {
                    throw new Error(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
                }
                this.#data = result;
            } else if (this.#file instanceof File) {
                // Load from File object
                this.#data = await new Promise((resolve, reject) => {
                    this.#papa.parse(this.#file, {
                        header: true,
                        worker: true,  // Use Web Worker for large files
                        complete: (result) => {
                            if (result.errors.length > 0) {
                                reject(new Error(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`));
                            } else {
                                resolve(result);
                            }
                        },
                        error: reject
                    });
                });
            } else {
                throw new Error('Unsupported file type: must be a URL string or File object.');
            }

            this.#loaded = true;
        } catch (error) {
            throw new Error(`Failed to load CSV: ${error.message}`);
        }
    }

    /**
     * Returns the filename of the CSV file.
     * @returns {string|null} The filename or null if not a File object
     */
    getName() {
        return this.#file instanceof File ? this.#file.name : null;
    }

    /**
     * Returns the MIME type of the CSV file.
     * @returns {string|null} The MIME type or null if not a File object
     */
    getType() {
        return this.#file instanceof File ? this.#file.type : null;
    }

    /**
     * Returns the size of the CSV file in bytes.
     * @returns {number|null} The size in bytes or null if not a File object
     */
    getSize() {
        return this.#file instanceof File ? this.#file.size : null;
    }

    /**
     * Returns the last modified timestamp of the file.
     * @returns {number|null} Timestamp or null if not a File object
     */
    getLastModified() {
        return this.#file instanceof File ? this.#file.lastModified : null;
    }

    /**
     * Returns the parsed CSV data as an array of objects.
     * @returns {Promise<Array<Object>>} Parsed CSV data
     */
    async getData() {
        await this.#ensureLoaded();
        return this.#data.data;
    }

    /**
     * Returns the column headers from the CSV.
     * @returns {Promise<Array<string>>} Column headers
     */
    async getHeaders() {
        await this.#ensureLoaded();
        return Object.keys(this.#data.data[0] || {});
    }

    /**
     * Returns the number of rows in the CSV.
     * @returns {Promise<number>} Row count
     */
    async getRowCount() {
        await this.#ensureLoaded();
        return this.#data.data.length;
    }

    /**
     * Renders the CSV data as an HTML table.
     * @param {HTMLElement} container - The DOM element to render into
     * @param {Object} [options] - Rendering options
     * @param {boolean} [options.striped=true] - Whether to add striped rows
     * @param {boolean} [options.bordered=true] - Whether to add borders
     * @param {boolean} [options.hover=true] - Whether to add hover effect
     * @returns {Promise<HTMLTableElement>} The rendered table element
     */
    async renderAsTable(container, options = {}) {
        const {
            striped = true,
            bordered = true,
            hover = true
        } = options;

        if (!(container instanceof HTMLElement)) {
            throw new Error('Container must be a valid HTML element');
        }

        await this.#ensureLoaded();

        const table = document.createElement('table');
        table.className = '_csv_table';
        if (striped) table.classList.add('striped');
        if (bordered) table.classList.add('bordered');
        if (hover) table.classList.add('hover');

        // Add headers
        const headers = await this.getHeaders();
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Add data rows
        const tbody = document.createElement('tbody');
        const data = await this.getData();
        data.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = row[header];
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        container.innerHTML = '';
        container.appendChild(table);

        return table;
    }

    /**
     * Exports the CSV data to a downloadable file.
     * @param {string} [filename] - Optional filename for the download
     * @returns {Promise<void>}
     */
    async exportCSV(filename) {
        await this.#ensureLoaded();
        
        const csvString = this.#papa.unparse(this.#data.data);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            link.href = URL.createObjectURL(blob);
            link.download = filename || (this.getName() || 'export.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
    }
}

/**
 * A singleton instance for global CSV loading usage.
 * @module csv
 */
export const csv = new lcsLoadCSV();
export default lcsLoadCSV;