import { isDataEmpty } from "../workingTools/dataTypes.js";
import { file as fileOps } from "./file.js";

/**
 * A utility class for loading and retrieving metadata from video files.
 * Supports both remote URLs and local `File` objects.
 */
class lcsLoadVideo {
    #file;
    #videoElement;
    #loaded = false;

    /**
     * Constructs a new video loader instance.
     * @param {string|File|null} [file=null] - The video file as a URL or File object.
     */
    constructor(file = null) {
        this.#file = !isDataEmpty(file) ? file : null;
    }

    /**
     * Sets or replaces the video file to load.
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
     * Ensures the video is loaded and metadata is available.
     * @private
     */
    async #ensureLoaded() {
        if (this.#loaded) return;
        
        this.#videoElement = document.createElement('video');
        if (typeof this.#file === 'string') {
            this.#videoElement.src = this.#file;
        } else if (this.#file instanceof File) {
            this.#videoElement.src = URL.createObjectURL(this.#file);
        } else {
            throw new Error('Unsupported file type: must be a URL string or File object.');
        }

        await new Promise((resolve, reject) => {
            this.#videoElement.addEventListener('loadedmetadata', resolve);
            this.#videoElement.addEventListener('error', reject);
            this.#videoElement.load();
        });

        this.#loaded = true;
    }

    /**
     * Returns the filename of the video file.
     * @returns {string|null} The filename or null if not a File object
     */
    getName() {
        return this.#file instanceof File ? this.#file.name : null;
    }

    /**
     * Returns the MIME type of the video file.
     * @returns {string|null} The MIME type or null if not a File object
     */
    getType() {
        return this.#file instanceof File ? this.#file.type : null;
    }

    /**
     * Returns the size of the video file in bytes.
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
     * Returns the duration of the video in seconds.
     * @returns {Promise<number>} The duration in seconds
     */
    async getDuration() {
        await this.#ensureLoaded();
        return this.#videoElement.duration;
    }

    /**
     * Returns the intrinsic width of the video.
     * @returns {Promise<number>} The width in pixels
     */
    async getVideoWidth() {
        await this.#ensureLoaded();
        return this.#videoElement.videoWidth;
    }

    /**
     * Returns the intrinsic height of the video.
     * @returns {Promise<number>} The height in pixels
     */
    async getVideoHeight() {
        await this.#ensureLoaded();
        return this.#videoElement.videoHeight;
    }

    /**
     * Calculates the aspect ratio of an image or video file, returning either
     * a common ratio (e.g. "16:9", "4:3") or the exact simplified ratio if it
     * exactly matches one of the common ones.
     *
     * @param {string|File|null} [file=null]
     *   - Pass a File object or URL string to override the instance file.
     *   - If null, uses the file previously set on this instance.
     * @returns {Promise<string>}
     *   A ratio string like "16:9", "3:2", or exact simplified "1280:720" if it
     *   matches a common value exactly.
     * @throws {Error}
     *   - If no file is provided.
     *   - If the format isn’t recognized as image or supported video.
     *   - If loading fails or dimensions are zero.
     *
     * @example
     * // Using a File object
     * const loader = new lcsLoadImage(fileInput.files[0]);
     * console.log(await loader.getAspectRatio()); // "16:9"
     *
     * // Using a URL override
     * console.log(await loader.getAspectRatio('https://…/clip.mp4')); // "4:3"
     */
    async getAspectRatio(file = null) {
        return await fileOps.getAspectRatio(file);
    }

    /**
     * Returns the number of audio channels if available.
     * @returns {Promise<number|null>} The number of audio channels or null
     */
    async getAudioChannels() {
        await this.#ensureLoaded();
        const audioTracks = this.#videoElement.audioTracks;
        return audioTracks ? audioTracks.length : null;
    }

    /**
     * Renders a video player into the specified container.
     * @param {HTMLElement} container - The DOM element to render the video player into.
     * @param {boolean} [controls=true] - Whether to display video controls.
     * @param {boolean} [PiP=true] - Whether to enable Picture-in-Picture mode.
     * @returns {Promise<HTMLVideoElement>} - The created video player element.
     */
    async renderPlayer(container, controls = true, PiP = true) {
        if (!(container instanceof HTMLElement)) {
            throw new Error('Container must be a valid HTML element');
        }

        await this.#ensureLoaded();
        
        const player = document.createElement('video');
        player.controls = controls;
        player.disablePictureInPicture = (PiP === false);
        if (!controls) {
            player.addEventListener('contextmenu', (event) => {
                event.preventDefault();
            });
        }
        player.style.maxWidth = '100%';
        player.src = this.#videoElement.src;

        container.innerHTML = '';
        container.appendChild(player);

        return player;
    }

    /**
     * Cleans up resources used by the video loader.
     */
    dispose() {
        if (this.#videoElement && this.#file instanceof File) {
            URL.revokeObjectURL(this.#videoElement.src);
        }
    }
}

/**
 * A singleton instance for global video loading usage.
 * @module video
 */
export const video = new lcsLoadVideo();
export default lcsLoadVideo;