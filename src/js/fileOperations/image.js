import { isDataEmpty } from "../workingTools/dataTypes";
import { lcsFileOps as fileOps } from "./file";

/**
 * A utility class for loading and retrieving metadata from image files.
 * Supports both remote URLs and local `File` objects.
 */
class lcsLoadImage {
    #file;
    #imageElement;
    #loaded = false;

    /**
     * Constructs a new image loader instance.
     * @param {string|File|null} [file=null] - The image file as a URL or File object.
     */
    constructor(file = null) {
        this.#file = !isDataEmpty(file) ? file : null;
    }

    /**
     * Sets or replaces the image file to load.
     * @param {string|File} file - The file to set (URL or File object)
     */
    setFile(file) {
        if (isDataEmpty(file)) {
            throw new Error("File cannot be empty or null.");
        }
        this.#file = file;
        this.#loaded = false;
    }

    /**
     * Ensures the image is loaded and metadata is available.
     * @private
     */
    async #ensureLoaded() {
        if (this.#loaded) return;
        
        this.#imageElement = new Image();
        if (typeof this.#file === 'string') {
            this.#imageElement.src = this.#file;
        } else if (this.#file instanceof File) {
            this.#imageElement.src = URL.createObjectURL(this.#file);
        } else {
            throw new Error('Unsupported file type: must be a URL string or File object.');
        }

        await new Promise((resolve, reject) => {
            this.#imageElement.onload = resolve;
            this.#imageElement.onerror = reject;
        });

        this.#loaded = true;
    }

    /**
     * Returns the filename of the image file.
     * @returns {string|null} The filename or null if not a File object
     */
    getName() {
        return this.#file instanceof File ? this.#file.name : null;
    }

    /**
     * Returns the MIME type of the image file.
     * @returns {string|null} The MIME type or null if not a File object
     */
    getType() {
        return this.#file instanceof File ? this.#file.type : null;
    }

    /**
     * Returns the size of the image file in bytes.
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
     * Returns the natural width of the image.
     * @returns {Promise<number>} The width in pixels
     */
    async getWidth() {
        await this.#ensureLoaded();
        return this.#imageElement.naturalWidth;
    }

    /**
     * Returns the natural height of the image.
     * @returns {Promise<number>} The height in pixels
     */
    async getHeight() {
        await this.#ensureLoaded();
        return this.#imageElement.naturalHeight;
    }

    /**
     * Calculates the aspect ratio of an image or video file, returning a common,
     * recognizable ratio like 16:9 or 3:2.
     *
     * @param {string|File|null} [file=null] - The image or video file as a URL string or File object. Defaults to null to use instance provided file.
     * @returns {Promise<string>} - A string representing the aspect ratio (e.g., "16:9", "4:3").
     * @throws Will throw an error if the file is invalid, unsupported, or fails to load.
     *
     * Usage example:
     * ```javascript
     * import lcsLoadImage from './image.js';
     *
     * // Using a File object
     * const input = document.querySelector('input[type="file"]');
     * input.addEventListener('change', async () => {
     *     const file = input.files[0];
     *     const imageLoader = new lcsLoadImage(file);
     *     try {
     *         const ratio = await imageLoader.getAspectRatio();
     *         console.log(`Aspect Ratio: ${ratio}`); // e.g., "16:9"
     *     } catch (error) {
     *         console.error('Error calculating aspect ratio:', error);
     *     }
     * });
     *
     * // Using a URL
     * (async () => {
     *     const url = 'https://example.com/image.jpg';
     *     const imageLoader = new lcsLoadImage(url);
     *     try {
     *         const ratio = await imageLoader.getAspectRatio();
     *         console.log(`Aspect Ratio: ${ratio}`); // e.g., "4:3"
     *     } catch (error) {
     *         console.error('Error calculating aspect ratio:', error);
     *     }
     * })();
     * ```
     */
    async getAspectRatio(file = null) {
        return await fileOps.getAspectRatio(file);
    }

    /**
     * Returns the dominant color of the image.
     * @returns {Promise<string>} The dominant color in hex format
     */
    async getDominantColor() {
        await this.#ensureLoaded();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1;
        canvas.height = 1;

        ctx.drawImage(this.#imageElement, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

        return `#${[r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('')}`;
    }

    /**
     * Renders the image into a container element.
     * @param {HTMLElement} container - The DOM element to render into
     * @param {Object} [options] - Rendering options
     * @param {string} [options.alt=''] - Alt text for the image
     * @returns {Promise<HTMLImageElement>} The rendered image element
     */
    async renderImage(container, options = {}) {
        const { alt = '' } = options;

        if (!(container instanceof HTMLElement)) {
            throw new Error('Container must be a valid HTML element');
        }

        await this.#ensureLoaded();

        const img = document.createElement('img');
        img.src = this.#imageElement.src;
        img.alt = alt;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';

        container.appendChild(img);

        return img;
    }

    /**
     * Creates a thumbnail version of the image.
     * @param {number} [maxSize=150] - Maximum width or height of the thumbnail
     * @returns {Promise<string>} Data URL of the thumbnail
     */
    async createThumbnail(maxSize = 150) {
        await this.#ensureLoaded();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const ratio = Math.min(maxSize / this.#imageElement.width, maxSize / this.#imageElement.height);
        canvas.width = this.#imageElement.width * ratio;
        canvas.height = this.#imageElement.height * ratio;

        ctx.drawImage(this.#imageElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL();
    }

    /**
     * Cleans up resources used by the image loader.
     */
    dispose() {
        if (this.#imageElement && this.#file instanceof File) {
            URL.revokeObjectURL(this.#imageElement.src);
        }
    }
}

/**
 * A singleton instance for global image loading usage.
 * @module image
 */
export const image = new lcsLoadImage();
export default lcsLoadImage;