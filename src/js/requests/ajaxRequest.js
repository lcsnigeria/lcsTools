import { hooks } from '../hooks.js';
import { isDataEmpty, isDataObject } from '../workingTools/dataTypes.js';

const lcs_ajax_object_meta = document.querySelector('meta[name="lcs_ajax_object"]'); // Get the AJAX object meta tag.
let lcs_ajax_object = lcs_ajax_object_meta ? JSON.parse(lcs_ajax_object_meta.content) : {}; // Parse the AJAX object from the meta tag.

/**
 * A utility class for making AJAX requests with support for Fetch API and XMLHttpRequest (XHR).
 * It provides secure request handling with nonce validation to prevent CSRF attacks and supports
 * both JSON and FormData payloads. The class ensures that only one request runs at a time and
 * offers flexible configuration through setters.
 *
 * @example
 * // Basic usage with JSON data
 * const ajax = new lcsAjaxRequest('https://example.com/api', 'POST', {});
 * ajax.setData({ key: 'value' });
 * ajax.send().then(response => console.log(response)).catch(error => console.error(error));
 *
 * @example
 * // Using FormData with Fetch model
 * const formData = new FormData();
 * formData.append('file', someFile);
 * const ajax = new lcsAjaxRequest('https://example.com/upload', 'POST', {});
 * ajax.setModel('fetch');
 * ajax.setData(formData);
 * ajax.send();
 */
class lcsAjaxRequest {
    /**
     * PRIVATE PROPERTIES
     */
    #url;                   // The target URL for the request
    #data;                  // The data payload (object or FormData)
    #method;                // HTTP method ('GET' or 'POST')
    #headers = {};          // Custom headers for the request
    #model = 'xhr';         // Request model ('fetch' or 'xhr')

    #nonce_url;             // URL for nonce retrieval, defaults to #url
    #nonce_name = 'lcs_ajax_nonce'; // Name of the nonce field
    #isNonceRetrieval = true; // Whether to fetch a new nonce

    #isRunningAjax = false; // Flag to prevent concurrent requests
    #isRequestAsync = true; // Whether the request is asynchronous
    #isAjaxInterrupted = false; // Tracks if AJAX was interrupted due to offline

    #waitOffline = false; // If true, waits for reconnection before retrying AJAX

    #requestInstance;       // Stores the XHR instance for 'xhr' model

    #hooksID = '';

    /**
     * PUBLIC PROPERTIES
     */

    /**
     * @property {number} maxWaitTime
     * The maximum time in milliseconds to wait for internet reconnection before failing the AJAX request.
     * Default is 30000 (30 seconds).
     */
    maxWaitTime = 30000;

    /**
     * @property {number} pollInterval
     * The interval in milliseconds to poll for internet reconnection when offline.
     * Default is 100 ms.
     */
    pollInterval = 100;

    /**
     * @property {number} timeout
     * The maximum time in milliseconds before the AJAX request times out.
     * Default is 10000 (10 seconds).
     */
    timeout = 10000;

    /**
     * Creates an instance of lcsAjaxRequest with initial configuration.
     *
     * @param {string} url - The URL to send the request to.
     * @param {string} method - The HTTP method ('GET' or 'POST').
     * @param {object} headers - Custom headers to include in the request.
     */
    constructor(url, method, headers = {}) {
        // URL
        this.#url = url;

        // METHOD
        this.#method = method;

        // HEADERS
        this.#headers = !isDataEmpty(headers) && isDataObject(headers) ? headers : {};

        // NONCE URL
        this.#nonce_url = url; // Nonce URL defaults to the request URL
    }

    /**
     * Validates all configuration properties before sending a request.
     * Ensures URL, method, headers, data, and model are correctly set.
     * @private
     */
    #validateConfigs() {
        if (typeof this.#url !== 'string' || this.#url.trim() === '') {
            throw new Error('Invalid URL: must be a non-empty string.');
        }

        const validMethods = ['GET', 'POST'];
        if (!validMethods.includes(this.#method)) {
            throw new Error(`Invalid method: must be one of ${validMethods.join(', ')}.`);
        }

        if (typeof this.#headers !== 'object' || Array.isArray(this.#headers)) {
            throw new Error('Invalid headers: must be an object.');
        }
        this.#headers = { ...this.defaultHeaders(), ...this.#headers };
        
        Object.keys(this.#headers).forEach(hk => {
            if (hk.toLowerCase() === 'content-type' && this.isFormData()) {
                delete this.#headers[hk]; // Browser sets Content-Type for FormData
            }
        });

        if (this.#data !== undefined && this.#data !== null) {
            if (typeof this.#data !== 'object' || Array.isArray(this.#data)) {
                throw new Error('Invalid data: must be an object or FormData.');
            }
        }

        const validModels = ['fetch', 'xhr'];
        if (!validModels.includes(this.#model)) {
            throw new Error(`Invalid model: must be one of ${validModels.join(', ')}.`);
        }
    }

    /**
     * Determines if the data payload is an instance of FormData.
     *
     * @returns {boolean} True if data is FormData, false otherwise.
     */
    isFormData() {
        return this.#data instanceof FormData;
    }

    /**
     * Provides default headers based on the data type.
     * - For FormData: Only 'X-Requested-With' is set, as 'Content-Type' is handled by the browser.
     * - For JSON: Sets 'Content-Type' to 'application/json' and 'X-Requested-With'.
     *
     * @returns {object} The default headers object.
     */
    defaultHeaders() {
        return this.isFormData()
            ? { 'X-Requested-With': 'XMLHttpRequest' }
            : {
                  'Content-Type': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest',
              };
    }

    /**
     * Sends an AJAX request with the specified or stored configurations.
     * Handles nonce retrieval for secure requests and returns the response.
     *
     * @param {object|FormData} [data=this.#data] - Data to send with the request.
     * @param {string} [url=this.#url] - Target URL for the request.
     * @param {string} [method=this.#method] - HTTP method to use.
     * @param {object} [headers=this.#headers] - Headers to include.
     * @returns {Promise<any>} Resolves with the response data or rejects with an error.
     */
    async send(data = this.#data, url = this.#url, method = this.#method, headers = this.#headers) {
        try {
            this.#data = data;
            this.#url = url;
            this.#method = method;
            this.#headers = headers;

            this.#validateConfigs();

            const isFormData = this.isFormData();
            let isSecureRequest = true;

            if (isFormData) {
                if (!this.#data.has('secure')) {
                    this.#data.append('secure', true);
                }
                if (this.#data.get('secure') === false) {
                    isSecureRequest = false;
                }
            } else {
                this.#data = this.#data || {}; // Ensure data is an object if unset
                if (!('secure' in this.#data)) {
                    this.#data.secure = true;
                }
                if (this.#data.secure === false) {
                    isSecureRequest = false;
                }
            }

            if (isSecureRequest) {
                this.#isNonceRetrieval = true;
                await this.validateNonce();
            } else {
                this.#isNonceRetrieval = false;
            }

            return await this.fetch();
        } catch (error) {
            console.error('Request failed:', error);
            throw new Error(error.message || 'Request failed due to server error!');
        }
    }

    /**
     * Executes an AJAX request using the configured transport model (`fetch` or `xhr`).
     * 
     * - Ensures only one request is processed at a time by using an internal locking mechanism.
     * - Handles automatic retry or waiting if the client is offline, with configurable timeout and hooks for interruption/resume.
     * - Triggers custom hooks for various request states: busy, succeeded, failed, completed, interrupted, and resumed.
     * - Supports both asynchronous and synchronous requests (for XHR; note: synchronous requests block the main thread).
     * - Handles JSON and non-JSON responses, and automatically parses JSON if the response content-type indicates it.
     * - Throws detailed errors for network issues, HTTP errors, timeouts, and invalid configurations.
     * 
     * @async
     * @private
     * @throws {Error} If the request fails due to network issues, HTTP errors, or invalid configuration.
     * @returns {Promise<any>} Resolves with the parsed response data (object or string), or rejects with an error.
     * 
     * @example
     * // Usage within the class
     * try {
     *   const response = await this.fetch();
     *   // Handle response
     * } catch (error) {
     *   // Handle error
     * }
     */
    async fetch() {
        this.#validateConfigs();

        // Check for internet connectivity
        if (!navigator.onLine) {
            if (!this.#waitOffline) {
                hooks.doAction(`ajaxRequestFailedOnOffline_${this.#hooksID}`);
                hooks.doAction(`ajaxRequestFailedOnOffline`);
                throw new Error('No internet connection detected.');
            }

            this.#isAjaxInterrupted = true;
            hooks.doAction(`ajaxRequestIsInterrupted_${this.#hooksID}`);
            hooks.doAction(`ajaxRequestIsInterrupted`);

            // Wait for connection with a timeout and online event listener
            let timeWaited = 0;
            await new Promise((resolve, reject) => {
                const onlineHandler = () => {
                    window.removeEventListener('online', onlineHandler);
                    resolve();
                };
                window.addEventListener('online', onlineHandler);

                const checkOnline = () => {
                    if (navigator.onLine) {
                        window.removeEventListener('online', onlineHandler);
                        resolve();
                    } else if (timeWaited >= this.maxWaitTime) {
                        window.removeEventListener('online', onlineHandler);
                        hooks.doAction(`ajaxRequestFailedOnOffline_${this.#hooksID}`);
                        hooks.doAction(`ajaxRequestFailedOnOffline`);
                        reject(new Error('No internet connection after waiting.'));
                    } else {
                        timeWaited += this.pollInterval;
                        setTimeout(checkOnline, this.pollInterval);
                    }
                };
                checkOnline();
            });
        }

        // Trigger resume hook if connection was interrupted
        if (navigator.onLine && this.#isAjaxInterrupted) {
            hooks.doAction(`ajaxRequestResumed_${this.#hooksID}`);
            hooks.doAction(`ajaxRequestResumed`);
            this.#isAjaxInterrupted = false;
        }

        while (this.#isRunningAjax) {
            hooks.doAction(`ajaxRequestIsBusy_${this.#hooksID}`);
            hooks.doAction(`ajaxRequestIsBusy`);
            await new Promise(resolve => setTimeout(resolve, 100)); // Simple throttling
        }
        this.#isRunningAjax = true;

        try {
            if (this.#model === 'fetch') {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                try {
                    const options = {
                        method: this.#method,
                        headers: this.#headers,
                        body: this.#method === 'GET' ? undefined : (this.isFormData() ? this.#data : JSON.stringify(this.#data)),
                        signal: controller.signal,
                    };

                    const response = await fetch(this.#url, options);
                    clearTimeout(timeoutId);

                    const contentType = response.headers.get('content-type');
                    let responseData = contentType?.includes('application/json') ? await response.json() : await response.text();

                    if (!response.ok) {
                        const error = new Error(responseData?.message || responseData?.data || `HTTP error: ${response.status}`);
                        hooks.doAction(`ajaxRequestFailedOnError_${this.#hooksID}`, error);
                        hooks.doAction(`ajaxRequestFailedOnError`);
                        throw error;
                    }

                    hooks.doAction(`ajaxRequestSucceeded_${this.#hooksID}`, responseData);
                    hooks.doAction(`ajaxRequestSucceeded`);
                    return responseData;
                } catch (error) {
                    clearTimeout(timeoutId);
                    if (error.name === 'AbortError') {
                        const timeoutError = new Error('Request timed out.');
                        hooks.doAction(`ajaxRequestFailedOnTimeout_${this.#hooksID}`, timeoutError);
                        hooks.doAction(`ajaxRequestFailedOnTimeout`);
                        throw timeoutError;
                    }
                    hooks.doAction(`ajaxRequestFailedOnError_${this.#hooksID}`, error);
                    hooks.doAction(`ajaxRequestFailedOnError`);
                    throw error;
                }
            } else if (this.#model === 'xhr') {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    this.#requestInstance = xhr;

                    xhr.open(this.#method, this.#url, this.#isRequestAsync);

                    for (const key in this.#headers) {
                        xhr.setRequestHeader(key, this.#headers[key]);
                    }

                    xhr.timeout = this.timeout;

                    xhr.onreadystatechange = () => {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            const contentType = xhr.getResponseHeader('content-type');
                            let responseData = xhr.responseText;
                            if (contentType?.includes('application/json')) {
                                try {
                                    responseData = JSON.parse(xhr.responseText);
                                } catch (e) {
                                    // Fallback to text if JSON parsing fails
                                }
                            }
                            if (xhr.status >= 200 && xhr.status < 300) {
                                hooks.doAction(`ajaxRequestSucceeded_${this.#hooksID}`, responseData);
                                hooks.doAction(`ajaxRequestSucceeded`);
                                resolve(responseData);
                            } else {
                                const error = new Error(responseData?.message || responseData?.data || `XHR error: ${xhr.status}`);
                                hooks.doAction(`ajaxRequestFailedOnError_${this.#hooksID}`, error);
                                hooks.doAction(`ajaxRequestFailedOnError`);
                                reject(error);
                            }
                        }
                    };

                    xhr.onerror = () => {
                        const error = new Error('Network error during XHR request.');
                        hooks.doAction(`ajaxRequestFailedOnError_${this.#hooksID}`, error);
                        hooks.doAction(`ajaxRequestFailedOnError`);
                        reject(error);
                    };

                    xhr.ontimeout = () => {
                        const error = new Error('Request timed out.');
                        hooks.doAction(`ajaxRequestFailedOnTimeout_${this.#hooksID}`, error);
                        hooks.doAction(`ajaxRequestFailedOnTimeout`);
                        reject(error);
                    };

                    if (this.#method === 'GET') {
                        xhr.send();
                    } else if (this.isFormData()) {
                        xhr.send(this.#data);
                    } else {
                        xhr.send(JSON.stringify(this.#data));
                    }
                });
            } else {
                const error = new Error(`Unknown request model: ${this.#model}`);
                hooks.doAction(`ajaxRequestFailedOnInvalidModel_${this.#hooksID}`, error);
                hooks.doAction(`ajaxRequestFailedOnInvalidModel`);
                throw error;
            }
        } finally {
            this.#isRunningAjax = false;
            hooks.doAction(`ajaxRequestCompleted_${this.#hooksID}`);
            hooks.doAction(`ajaxRequestCompleted`);
        }
    }

    /**
     * Sets the data payload for the request.
     *
     * @param {object|FormData} data - The data to send.
     */
    setData(data) {
        if (data !== null && typeof data !== 'object') {
            throw new Error('Invalid data type: must be an object or FormData.');
        }
        this.#data = data;
    }

    /**
     * Sets the target URL for the request.
     *
     * @param {string} url - The URL to set.
     */
    setUrl(url) {
        this.#url = url;
    }

    /**
     * Sets the HTTP method for the request.
     *
     * @param {string} method - The method ('GET' or 'POST').
     */
    setMethod(method) {
        const validMethods = ['GET', 'POST'];
        if (!validMethods.includes(method)) {
            throw new Error(`Invalid method: must be one of ${validMethods.join(', ')}.`);
        }
        this.#method = method;
    }

    /**
     * Sets custom headers for the request.
     *
     * @param {object} headers - The headers object.
     */
    setHeaders(headers) {
        if (typeof headers !== 'object' || Array.isArray(headers)) {
            throw new Error('Invalid headers: must be an object.');
        }
        this.#headers = headers;
    }

    /**
     * Sets the request model (Fetch API or XHR).
     *
     * @param {string} model - The model ('fetch' or 'xhr').
     */
    setModel(model) {
        const validModels = ['fetch', 'xhr'];
        if (!validModels.includes(model)) {
            throw new Error(`Invalid model: must be one of ${validModels.join(', ')}.`);
        }
        this.#model = model;
    }

    /**
     * Sets whether the request should be asynchronous (applies to XHR only).
     *
     * @param {boolean} [active=true] - True for async, false for sync.
     */
    setAsync(active = true) {
        this.#isRequestAsync = !!active;
    }

    /**
     * Sets a unique hooks ID for this AJAX request instance.
     * Ensures the ID is not empty and not already registered globally.
     *
     * @param {string} hid - The hooks ID to set.
     * @throws {Error} If the hooks ID is empty or already exists.
     */
    setHID(hid) {
        if (isDataEmpty(hid)) {
            throw new Error('Hooks ID cannot be empty.');
        }

        // Ensure global bucket exists
        window.lcsAjaxRequest = window.lcsAjaxRequest || {};
        window.lcsAjaxRequest.HIDs = window.lcsAjaxRequest.HIDs || [];

        if (window.lcsAjaxRequest.HIDs.includes(hid)) {
            throw new Error('Hooks ID already exists.');
        }

        window.lcsAjaxRequest.HIDs.push(hid);
        this.#hooksID = hid;
    }

    /**
     * Sets whether the request should wait for internet reconnection if offline.
     *
     * @param {boolean} [active=true] - True to wait for reconnection, false to fail immediately.
     */
    waitOffline(active = true) {
        this.#waitOffline = !!active;
    }

    /**
     * Fetches or validates a nonce for secure requests to prevent CSRF attacks.
     * Appends the nonce to the request data and stores it globally in `lcs_ajax_object.nonce`.
     *
     * @param {string} [nonceName=this.#nonce_name] - The name of the nonce field.
     * @param {string} [url=this.#nonce_url] - The URL to fetch the nonce from.
     * @param {boolean} [isNonceRetrieval=this.#isNonceRetrieval] - True to fetch a new nonce.
     * @returns {Promise<string>} Resolves with the nonce value.
     */
    async validateNonce(nonceName = this.#nonce_name, url = this.#nonce_url, isNonceRetrieval = this.#isNonceRetrieval) {
        return new Promise((resolve, reject) => {
            if (this.isFormData() && this.#data.has('nonce_name')) {
                nonceName = this.#data.get('nonce_name');
            } else if (!this.isFormData() && this.#data && 'nonce_name' in this.#data) {
                nonceName = this.#data.nonce_name;
            }

            this.#nonce_name = nonceName;
            this.#nonce_url = url;
            this.#isNonceRetrieval = isNonceRetrieval;

            const requestData = {
                nonce_name: this.#nonce_name,
                isNonceRetrieval: this.#isNonceRetrieval,
            };

            const handleResponse = (responseData) => {
                if (responseData.success) {
                    const nonce = responseData.data;
                    if (this.isFormData()) {
                        this.#data.append('nonce', nonce);
                        this.#data.append('nonce_name', this.#nonce_name);
                    } else {
                        this.#data.nonce = nonce;
                        this.#data.nonce_name = this.#nonce_name;
                    }
                    lcs_ajax_object = lcs_ajax_object || {};
                    lcs_ajax_object.nonce = nonce;
                    resolve(nonce);
                } else {
                    reject(new Error(responseData.message || 'Nonce retrieval failed.'));
                }
            };

            if (this.#model === 'fetch') {
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify(requestData),
                })
                    .then(response => response.json())
                    .then(handleResponse)
                    .catch(error => reject(new Error(`Nonce request failed: ${error.message}`)));
            } else {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const responseData = JSON.parse(xhr.responseText);
                            handleResponse(responseData);
                        } catch (e) {
                            reject(new Error('Failed to parse nonce response.'));
                        }
                    } else {
                        reject(new Error(`Nonce XHR failed: ${xhr.status} ${xhr.statusText}`));
                    }
                };

                xhr.onerror = () => reject(new Error('Network error during nonce request.'));
                xhr.send(JSON.stringify(requestData));
            }
        });
    }

    /**
     * Returns the XHR instance for the request, if using 'xhr' model.
     *
     * @returns {XMLHttpRequest} The XHR instance.
     * @throws {Error} If model is not 'xhr' or no instance exists.
     */
    getRequestInstance() {
        if (this.#model !== 'xhr') {
            throw new Error("Request instance is only available for 'xhr' model.");
        }
        if (!this.#requestInstance || !(this.#requestInstance instanceof XMLHttpRequest)) {
            throw new Error('No valid request instance available. Ensure the request has been sent.');
        }
        return this.#requestInstance;
    }

    /**
     * Builds a FormData object from various input data types.
     *
     * - If `data` is null, uses the instance's existing `#data`.
     * - If `data` is already a FormData instance, returns it immediately.
     * - Supports values of type Array, FileList, File, or primitive/string.
     * - Arrays and FileLists are appended using the key with `[]` suffix.
     * - Single Files are appended with the key without `[]` suffix.
     *
     * @param {Object|FormData|null} [data=null] - The source data to convert into FormData.
     * @throws {Error} If `data` is not an object or FormData.
     * @returns {FormData} The constructed or existing FormData instance.
     */
    buildFormData(data = null) {
        // Use provided data or fallback to existing instance data
        data = data === null ? this.#data : data;

        // Ensure data is an object or FormData
        if (data !== Object(data)) {
            throw new Error("Invalid data type: must be an object or FormData.");
        }

        // If already FormData, reuse it
        if (data instanceof FormData) {
            this.#data = data;
            return data;
        }

        const newFormData = new FormData();

        // Iterate over keys in the data object
        Object.keys(data).forEach(key => {
            const value = data[key];

            if (Array.isArray(value)) {
                // Array → append with []
                const bracketKey = key.replace(/\[\]/g, '') + '[]';
                value.forEach(item => newFormData.append(bracketKey, item));

            } else if (value instanceof FileList) {
                // FileList → append with []
                const bracketKey = key.replace(/\[\]/g, '') + '[]';
                for (let i = 0; i < value.length; i++) {
                    newFormData.append(bracketKey, value[i]);
                }

            } else if (value instanceof File) {
                // Single File → append without []
                newFormData.append(key.replace(/\[\]/g, ''), value);

            } else {
                // Primitives/strings → append as-is
                newFormData.append(key, value);
            }
        });

        // Store and return the new FormData
        this.#data = newFormData;
        return newFormData;
    }

}

/**
 * A singleton instance of lcsAjaxRequest for easy use throughout the application.
 *
 * @module ajaxRequest
 */
export const ajaxRequest = new lcsAjaxRequest(lcs_ajax_object.ajaxurl, 'POST');
export default lcsAjaxRequest;