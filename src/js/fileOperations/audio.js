import { isDataEmpty } from "../workingTools/dataTypes.js";

/**
 * A utility class for loading and retrieving metadata from audio files.
 * Supports both remote URLs and local `File` objects.
 *
 * This class provides methods to get basic file information (name, type, size)
 * and audio metadata (duration, sample rate, channels) using both the `<audio>`
 * element and the Web Audio API.
 *
 * Note: The Web Audio API is used, which may not be supported in all browsers.
 * Check browser compatibility before using this class.
 *
 * Note: When loading audio from a URL, ensure that the server allows cross-origin
 * requests if necessary, as the fetch operation may be subject to CORS policies.
 *
 * Note: When using a local File object, it's recommended to call `dispose` when
 * the audio loader is no longer needed to free up resources.
 *
 * Usage example:
 * ```javascript
 * const audioLoader = new lcsLoadAudio('https://example.com/audio.mp3');
 * console.log(await audioLoader.getDuration()); // Duration from <audio>
 * console.log(await audioLoader.getSampleRate()); // Sample rate from Web Audio API
 * ```
 *
 * If using a local File object:
 * ```javascript
 * const fileInput = document.querySelector('input[type="file"]');
 * fileInput.addEventListener('change', async (event) => {
 *     const file = event.target.files[0];
 *     const audioLoader = new lcsLoadAudio(file);
 *     console.log(audioLoader.getName()); // Filename
 *     console.log(await audioLoader.getDuration()); // Duration
 *     // ...
 *     audioLoader.dispose(); // Clean up resources
 * });
 * ```
 */
class lcsLoadAudio {
    #file;
    #audioElement;
    #audioContext;
    #audioBuffer;
    #loaded = false;

    /**
     * Constructs a new audio loader instance.
     *
     * @param {string|File|null} [file=null] - The audio file as a URL or File object.
     *                                         If provided, it will be set immediately.
     *                                         Can be set later via `setFile`.
     */
    constructor(file = null) {
        this.#file = !isDataEmpty(file) ? file : null;
        this.#audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    /**
     * Sets or replaces the audio file to load.
     *
     * This method resets the loaded state, so subsequent calls to metadata methods
     * will reload the audio.
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
        this.#audioBuffer = null;
    }

    /**
     * Ensures the audio is loaded and metadata is available.
     * @private
     */
    async #ensureLoaded() {
        if (this.#loaded) return;
        await this.#loadAudioElement();
        await this.#decodeAudioData();
        this.#loaded = true;
    }

    /**
     * Loads the audio file into an <audio> element and waits for metadata.
     * @private
     */
    async #loadAudioElement() {
        this.#audioElement = document.createElement('audio');
        if (typeof this.#file === 'string') {
            this.#audioElement.src = this.#file;
        } else if (this.#file instanceof File) {
            this.#audioElement.src = URL.createObjectURL(this.#file);
        } else {
            throw new Error('Unsupported file type: must be a URL string or File object.');
        }
        await new Promise((resolve, reject) => {
            this.#audioElement.addEventListener('loadedmetadata', resolve);
            this.#audioElement.addEventListener('error', reject);
            this.#audioElement.load();
        });
    }

    /**
     * Decodes the audio data using the Web Audio API.
     * @private
     */
    async #decodeAudioData() {
        let arrayBuffer;
        if (typeof this.#file === 'string') {
            const response = await fetch(this.#file);
            arrayBuffer = await response.arrayBuffer();
        } else if (this.#file instanceof File) {
            arrayBuffer = await this.#file.arrayBuffer();
        }
        this.#audioBuffer = await this.#audioContext.decodeAudioData(arrayBuffer);
    }

    /**
     * Returns the filename of the audio file if it is a File object.
     * Does not require loading the audio.
     *
     * @returns {string|null} - The filename or null if not a File object.
     */
    getName() {
        return this.#file instanceof File ? this.#file.name : null;
    }

    /**
     * Returns the MIME type of the audio file if it is a File object.
     * Does not require loading the audio.
     *
     * @returns {string|null} - The MIME type or null if not a File object.
     */
    getType() {
        return this.#file instanceof File ? this.#file.type : null;
    }

    /**
     * Returns the size of the audio file in bytes if it is a File object.
     * Does not require loading the audio.
     *
     * @returns {number|null} - The size in bytes or null if not a File object.
     */
    getSize() {
        return this.#file instanceof File ? this.#file.size : null;
    }

    /**
     * Returns the duration of the audio file in seconds, obtained from the `<audio>` element.
     * This method will load the audio if it hasn't been loaded yet.
     *
     * @returns {Promise<number>} - The duration in seconds.
     */
    async getDuration() {
        await this.#ensureLoaded();
        return this.#audioElement.duration;
    }

    /**
     * Returns the duration of the audio file in seconds, obtained from the Web Audio API.
     * This method will load and decode the audio if it hasn't been done yet.
     *
     * @returns {Promise<number>} - The duration in seconds.
     */
    async getDurationFromBuffer() {
        await this.#ensureLoaded();
        return this.#audioBuffer.duration;
    }

    /**
     * Returns the sample rate of the audio in Hz.
     * This method will load and decode the audio if it hasn't been done yet.
     *
     * @returns {Promise<number>} - The sample rate.
     */
    async getSampleRate() {
        await this.#ensureLoaded();
        return this.#audioBuffer.sampleRate;
    }

    /**
     * Returns the number of audio channels (mono, stereo, etc.).
     * This method will load and decode the audio if it hasn't been done yet.
     *
     * @returns {Promise<number>} - The number of channels parameters.
     */
    async getChannels() {
        await this.#ensureLoaded();
        return this.#audioBuffer.numberOfChannels;
    }

    /**
     * Renders an audio player into the specified container element.
     * Creates a custom audio player with controls and loads the current audio file.
     * 
     * @param {HTMLElement} container - The DOM element to render the audio player into.
     * @param {boolean} [controls=true] - Whether to show playback controls.
     * @returns {Promise<HTMLAudioElement>} - The created audio player element.
     * @throws {Error} If container is not a valid HTML element or if no file is set.
     */
    async renderPlayer(container, controls = true) {
        if (!(container instanceof HTMLElement)) {
            throw new Error('Container must be a valid HTML element');
        }
        if (!this.#file) {
            throw new Error('No audio file has been set');
        }

        // Clear the container
        container.innerHTML = '';

        // Create audio player with controls
        const player = document.createElement('audio');
        player.controls = controls;
        player.style.width = '100%';

        // Set the source based on file type
        if (typeof this.#file === 'string') {
            player.src = this.#file;
        } else if (this.#file instanceof File) {
            player.src = URL.createObjectURL(this.#file);
        }

        // Add clean up on player removal
        player.addEventListener('remove', () => {
            if (this.#file instanceof File) {
                URL.revokeObjectURL(player.src);
            }
        });

        // Append the player to the container
        container.appendChild(player);

        // Wait for metadata to load
        await new Promise((resolve, reject) => {
            player.addEventListener('loadedmetadata', resolve);
            player.addEventListener('error', reject);
            player.load();
        });

        return player;

    }

    /**
     * Cleans up resources used by the audio loader.
     * Revokes the object URL if a File object was used.
     *
     * Call this method when the audio loader is no longer needed to free up resources.
     */
    dispose() {
        if (this.#audioElement && this.#file instanceof File) {
            URL.revokeObjectURL(this.#audioElement.src);
        }
        // Optionally, close the audio context if not needed elsewhere
        // this.#audioContext.close();
    }
}

/**
 * A singleton instance of lcsLoadAudio for global usage.
 *
 * @module audio
 */
export const audio = new lcsLoadAudio();
export default lcsLoadAudio;