import { hooks } from '../hooks.js';
import { decodeURLQuery, encodeURLQuery } from '../workingTools/arrayOps.js';
import { isDataEmpty, isDataObject } from '../workingTools/dataTypes.js';

// ============================================================================
// GLOBAL STATE & INITIALIZATION
// ============================================================================

/**
 * Retrieve AJAX configuration from meta tag injected by server.
 * Expected format: { ajaxurl: string, nonce: string }
 */
const lcs_ajax_object_meta = document.querySelector('meta[name="lcs_ajax_object"]');
let lcs_ajax_object = lcs_ajax_object_meta ? JSON.parse(lcs_ajax_object_meta.content) : {};

/**
 * Global lock to prevent concurrent AJAX requests.
 * Only one request can be active at a time to avoid race conditions.
 */
let isRunningAjax = false;

// ============================================================================
// AJAX REQUEST CLASS
// ============================================================================

/**
 * A robust AJAX request handler with nonce validation, offline handling,
 * and support for both Fetch API and XMLHttpRequest.
 *
 * Key Features:
 * - CSRF protection via automatic nonce validation
 * - Offline detection with automatic retry on reconnection
 * - Support for JSON and FormData payloads
 * - Configurable timeouts and headers
 * - Hook system for request lifecycle events
 * - Single concurrent request enforcement
 *
 * @example
 * // Basic JSON request
 * const ajax = new ajaxRequest('https://api.example.com/endpoint', 'POST');
 * ajax.setData({ userId: 123, action: 'update' });
 * const result = await ajax.send();
 *
 * @example
 * // FormData upload with custom timeout
 * const formData = new FormData();
 * formData.append('file', fileInput.files[0]);
 * const ajax = new ajaxRequest('/upload', 'POST');
 * ajax.setModel('fetch');
 * ajax.setTimeout(30000);
 * ajax.setData(formData);
 * await ajax.send();
 */
export class ajaxRequest {
    // ========================================================================
    // PRIVATE PROPERTIES
    // ========================================================================

    /** @type {string} Target URL for the request */
    #url;

    /** @type {Object|FormData} Request payload */
    #data = {};

    /** @type {string} HTTP method (GET or POST) */
    #method;

    /** @type {Object} Custom request headers */
    #headers = {};

    /** @type {string} Transport model: 'fetch' or 'xhr' */
    #model = 'xhr';

    /** @type {string} URL for nonce validation endpoint */
    #nonce_url;

    /** @type {boolean} Whether request should be async (XHR only) */
    #isRequestAsync = true;

    /** @type {boolean} Tracks if request was interrupted due to offline state */
    #isAjaxInterrupted = false;

    /** @type {boolean} Whether to wait for reconnection when offline */
    #waitOffline = false;

    /** @type {XMLHttpRequest|null} XHR instance for 'xhr' model */
    #requestInstance = null;

    /** @type {string} Unique identifier for hook events */
    #hooksID = '';

    // ========================================================================
    // PUBLIC PROPERTIES
    // ========================================================================

    /**
     * Maximum time (ms) to wait for internet reconnection.
     * @type {number}
     * @default 30000
     */
    maxWaitTime = 30000;

    /**
     * Polling interval (ms) to check for reconnection.
     * @type {number}
     * @default 100
     */
    pollInterval = 100;

    /**
     * Request timeout duration (ms).
     * @type {number}
     * @default 10000
     */
    timeout = 10000;

    // ========================================================================
    // CONSTRUCTOR
    // ========================================================================

    /**
     * Creates a new AJAX request instance.
     *
     * @param {string} url - Target URL for the request
     * @param {string} method - HTTP method ('GET' or 'POST')
     * @param {Object} [headers={}] - Additional headers to include
     * @throws {Error} If url is empty or method is invalid
     */
    constructor(url, method, headers = {}) {
        // Validate and set URL
        if (typeof url !== 'string' || url.trim() === '') {
            throw new Error('Constructor error: URL must be a non-empty string.');
        }
        this.#url = url;

        // Validate and set method
        const validMethods = ['GET', 'POST'];
        if (!validMethods.includes(method)) {
            throw new Error(`Constructor error: Method must be one of ${validMethods.join(', ')}.`);
        }
        this.#method = method;

        // Validate and set headers
        if (!isDataEmpty(headers) && !isDataObject(headers)) {
            throw new Error('Constructor error: Headers must be a plain object.');
        }
        this.#headers = headers;

        // Default nonce URL to request URL
        this.#nonce_url = url;
    }

    // ========================================================================
    // CORE REQUEST METHODS
    // ========================================================================

    /**
     * Sends the AJAX request with optional parameter overrides.
     *
     * Flow:
     * 1. Validate and prepare data (add SECURE flag if needed)
     * 2. Validate nonce for secure requests
     * 3. Execute request via fetch()
     * 4. Return standardized response
     *
     * @param {Object|FormData} [data] - Data to send (uses instance data if omitted)
     * @param {string} [url] - Target URL (uses instance URL if omitted)
     * @param {string} [method] - HTTP method (uses instance method if omitted)
     * @param {Object} [headers] - Headers (uses instance headers if omitted)
     * @returns {Promise<Object>} Response object with { success, data, message, error? }
     * @throws {Error} Never throws - all errors are returned in response object
     */
    async send(data = this.#data, url = this.#url, method = this.#method, headers = this.#headers) {
        try {
            // Update instance properties with provided values
            this.#data = data;
            this.#url = url;
            this.#method = method;
            this.#headers = headers;

            const isFormData = this.isFormData();
            let isSecureRequest = true;

            // Ensure SECURE flag exists in payload
            if (isFormData) {
                if (!this.#data.has('SECURE')) {
                    this.#data.append('SECURE', 'true');
                }
                // Check if explicitly set to false (string or boolean)
                const secureValue = this.#data.get('SECURE');
                if (secureValue === 'false' || secureValue === false || secureValue === 'False') {
                    isSecureRequest = false;
                }
            } else {
                // Ensure data is an object
                this.#data = this.#data || {};
                if (!('SECURE' in this.#data)) {
                    this.#data.SECURE = true;
                }
                if (this.#data.SECURE === false || this.#data.SECURE === 'false') {
                    isSecureRequest = false;
                }
            }

            // Validate nonce for secure requests
            if (isSecureRequest) {
                const isNonceValid = await this.#validateNonce();
                if (!isNonceValid) {
                    return {
                        success: false,
                        data: null,
                        message: 'Security validation failed. Your session may have expired.',
                        error: new Error('Nonce verification failed')
                    };
                }

                // Mark nonce as verified in payload
                if (isFormData) {
                    if (this.#data.set) {
                        this.#data.set('NONCE_VERIFIED', 'true');
                    } else {
                        this.#data.append('NONCE_VERIFIED', 'true');
                    }
                } else {
                    this.#data.NONCE_VERIFIED = true;
                }
            }

            // Execute the actual request
            return await this.fetch();

        } catch (error) {
            // Catch any unexpected errors and return standardized response
            console.error('AJAX send() error:', error);
            return {
                success: false,
                data: null,
                message: error.message || 'An unexpected error occurred while sending the request.',
                error: error
            };
        }
    }

    /**
     * Executes the AJAX request using configured transport (fetch or xhr).
     *
     * This method handles:
     * - Offline detection and reconnection waiting
     * - Request queuing (one request at a time)
     * - Timeout management
     * - Response parsing (JSON or text)
     * - Error standardization
     * - Hook triggers for all lifecycle events
     *
     * @private
     * @returns {Promise<Object>} Standardized response: { success, data, message, error? }
     */
    async fetch() {
        // Validate all configuration before proceeding
        this.#validateConfigs();

        // ====================================================================
        // OFFLINE HANDLING
        // ====================================================================
        if (!navigator.onLine) {
            if (!this.#waitOffline) {
                // Immediate failure if not waiting for reconnection
                this.#triggerHooks('ajaxRequestFailedOnOffline');
                return {
                    success: false,
                    data: null,
                    message: 'No internet connection. Please check your network and try again.',
                    error: new Error('Offline: No connection detected')
                };
            }

            // Wait for reconnection with timeout
            this.#isAjaxInterrupted = true;
            this.#triggerHooks('ajaxRequestIsInterrupted');

            try {
                await this.#waitForOnline();
            } catch (error) {
                this.#triggerHooks('ajaxRequestFailedOnOffline');
                return {
                    success: false,
                    data: null,
                    message: `No internet connection restored within ${this.maxWaitTime / 1000} seconds.`,
                    error: error
                };
            }
        }

        // Trigger resume hook if we just reconnected
        if (navigator.onLine && this.#isAjaxInterrupted) {
            this.#triggerHooks('ajaxRequestResumed');
            this.#isAjaxInterrupted = false;
        }

        // ====================================================================
        // REQUEST QUEUING
        // ====================================================================
        // Wait if another request is already running
        while (isRunningAjax) {
            this.#triggerHooks('ajaxRequestIsBusy');
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Acquire lock
        isRunningAjax = true;

        try {
            // ================================================================
            // EXECUTE REQUEST
            // ================================================================
            if (this.#model === 'fetch') {
                return await this.#executeFetchRequest();
            } else if (this.#model === 'xhr') {
                return await this.#executeXHRRequest();
            } else {
                const error = new Error(`Invalid request model: ${this.#model}`);
                this.#triggerHooks('ajaxRequestFailedOnInvalidModel', error);
                return {
                    success: false,
                    data: null,
                    message: 'Internal error: Invalid transport model configured.',
                    error: error
                };
            }
        } finally {
            // Always release lock and trigger completion hook
            isRunningAjax = false;
            this.#triggerHooks('ajaxRequestCompleted');
        }
    }

    // ========================================================================
    // TRANSPORT IMPLEMENTATIONS
    // ========================================================================

    /**
     * Executes request using Fetch API.
     *
     * @private
     * @returns {Promise<Object>} Standardized response object
     */
    async #executeFetchRequest() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const options = {
                method: this.#method,
                headers: this.#headers,
                signal: controller.signal,
            };

            // Add body for POST requests
            if (this.#method !== 'GET') {
                options.body = this.isFormData() 
                    ? this.#data 
                    : JSON.stringify(this.#data);
            }

            const response = await fetch(this.#url, options);
            clearTimeout(timeoutId);

            // Parse response based on content type
            const contentType = response.headers.get('content-type');
            let responseData;

            if (contentType?.includes('application/json')) {
                try {
                    responseData = await response.json();
                } catch (parseError) {
                    // JSON parsing failed - treat as error
                    const error = new Error('Server returned invalid JSON response.');
                    this.#triggerHooks('ajaxRequestFailedOnError', error);
                    const textData = await response.text();
                    return {
                        success: false,
                        data: null,
                        textData,
                        message: 'Failed to parse server response.',
                        error: error
                    };
                }
            } else {
                // Non-JSON response (HTML, text, etc.)
                const textData = await response.text();
                responseData = {
                    success: response.ok,
                    data: null,
                    textData,
                    message: response.ok ? 'Request completed' : `HTTP error ${response.status}`
                };
            }

            // Handle HTTP errors
            if (!response.ok) {
                const error = new Error(responseData?.message || `HTTP ${response.status}: ${response.statusText}`);
                this.#triggerHooks('ajaxRequestFailedOnError', error);
                
                const realData = responseData?.data || null;
                return {
                    success: false,
                    data: responseData?.data || null,
                    textData: JSON.stringify(realData),
                    message: responseData?.message || `Server returned error ${response.status}`,
                    error: error
                };
            }

            // Success!
            this.#triggerHooks('ajaxRequestSucceeded', responseData);
            
            // Ensure response has expected structure
            if (typeof responseData !== 'object' || responseData === null) {
                return {
                    success: true,
                    data: responseData,
                    textData: typeof responseData === 'string' ? responseData : JSON.stringify(responseData),
                    message: 'Request completed successfully'
                };
            }

            // Return parsed response (already has success, data, message)
            return {
                success: responseData.success !== false, // Default to true if not specified
                data: responseData.data,
                textData: JSON.stringify(responseData.data),
                message: responseData.message || 'Request completed successfully',
                ...responseData // Include any additional fields
            };

        } catch (error) {
            clearTimeout(timeoutId);

            // Handle timeout specifically
            if (error.name === 'AbortError') {
                const timeoutError = new Error(`Request timed out after ${this.timeout / 1000} seconds.`);
                this.#triggerHooks('ajaxRequestFailedOnTimeout', timeoutError);
                return {
                    success: false,
                    data: null,
                    textData: null,
                    message: 'Request timed out. Please try again.',
                    error: timeoutError
                };
            }

            // Handle network errors
            this.#triggerHooks('ajaxRequestFailedOnError', error);
            return {
                success: false,
                data: null,
                textData: null,
                message: error.message || 'Network error occurred. Please check your connection.',
                error: error
            };
        }
    }

    /**
     * Executes request using XMLHttpRequest.
     *
     * @private
     * @returns {Promise<Object>} Standardized response object
     */
    async #executeXHRRequest() {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            this.#requestInstance = xhr;

            xhr.open(this.#method, this.#url, this.#isRequestAsync);

            // Set headers
            for (const key in this.#headers) {
                xhr.setRequestHeader(key, this.#headers[key]);
            }

            xhr.timeout = this.timeout;

            // Handle response
            xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) return;

                const contentType = xhr.getResponseHeader('content-type');
                let responseData;

                // Parse response based on content type
                if (contentType?.includes('application/json')) {
                    try {
                        responseData = JSON.parse(xhr.responseText);
                    } catch (parseError) {
                        // JSON parsing failed
                        const error = new Error('Server returned invalid JSON response.');
                        this.#triggerHooks('ajaxRequestFailedOnError', error);
                        resolve({
                            success: false,
                            data: null,
                            textData: xhr.responseText,
                            message: 'Failed to parse server response.',
                            error: error
                        });
                        return;
                    }
                } else {
                    // Non-JSON response
                    responseData = {
                        success: xhr.status >= 200 && xhr.status < 300,
                        data: xhr.responseText,
                        textData: xhr.responseText,
                        message: `HTTP ${xhr.status}`
                    };
                }

                // Handle success
                if (xhr.status >= 200 && xhr.status < 300) {
                    this.#triggerHooks('ajaxRequestSucceeded', responseData);
                    
                    // Ensure response has expected structure
                    if (typeof responseData !== 'object' || responseData === null) {
                        resolve({
                            success: true,
                            data: responseData,
                            textData: typeof responseData === 'string' ? responseData : JSON.stringify(responseData),
                            message: 'Request completed successfully'
                        });
                        return;
                    }

                    resolve({
                        success: responseData.success !== false,
                        data: responseData.data,
                        textData: JSON.stringify(responseData.data),
                        message: responseData.message || 'Request completed successfully',
                        ...responseData
                    });
                    return;
                }

                // Handle HTTP errors
                const error = new Error(responseData?.message || `HTTP ${xhr.status}: ${xhr.statusText}`);
                this.#triggerHooks('ajaxRequestFailedOnError', error);
                resolve({
                    success: false,
                    data: responseData?.data || null,
                    textData: JSON.stringify(responseData?.data || null),
                    message: responseData?.message || `Server returned error ${xhr.status}`,
                    error: error
                });
            };

            // Handle network error
            xhr.onerror = () => {
                const error = new Error('Network error during XHR request.');
                this.#triggerHooks('ajaxRequestFailedOnError', error);
                resolve({
                    success: false,
                    data: null,
                    textData: null,
                    message: 'Network error occurred. Please check your connection.',
                    error: error
                });
            };

            // Handle timeout
            xhr.ontimeout = () => {
                const error = new Error(`Request timed out after ${this.timeout / 1000} seconds.`);
                this.#triggerHooks('ajaxRequestFailedOnTimeout', error);
                resolve({
                    success: false,
                    data: null,
                    textData: null,
                    message: 'Request timed out. Please try again.',
                    error: error
                });
            };

            // Send request
            if (this.#method === 'GET') {
                xhr.send();
            } else if (this.isFormData()) {
                xhr.send(this.#data);
            } else {
                xhr.send(JSON.stringify(this.#data));
            }
        });
    }

    // ========================================================================
    // VALIDATION & SECURITY
    // ========================================================================

    /**
     * Validates all configuration before sending request.
     * Also prepares URL for GET requests by appending query parameters.
     *
     * @private
     * @throws {Error} If any configuration is invalid
     */
    #validateConfigs() {
        // Validate URL
        if (typeof this.#url !== 'string' || this.#url.trim() === '') {
            throw new Error('Configuration error: URL must be a non-empty string.');
        }

        // Validate method
        const validMethods = ['GET', 'POST'];
        if (!validMethods.includes(this.#method)) {
            throw new Error(`Configuration error: Method must be one of ${validMethods.join(', ')}.`);
        }

        // Validate headers
        if (typeof this.#headers !== 'object' || Array.isArray(this.#headers)) {
            throw new Error('Configuration error: Headers must be a plain object.');
        }

        // Merge with default headers
        this.#headers = { ...this.defaultHeaders(), ...this.#headers };

        // Remove Content-Type for FormData (browser sets it automatically)
        Object.keys(this.#headers).forEach(key => {
            if (key.toLowerCase() === 'content-type' && this.isFormData()) {
                delete this.#headers[key];
            }
        });

        // Validate data
        if (typeof this.#data !== 'object') {
            throw new Error('Configuration error: Data must be an object or FormData.');
        }

        // Validate model
        const validModels = ['fetch', 'xhr'];
        if (!validModels.includes(this.#model)) {
            throw new Error(`Configuration error: Model must be one of ${validModels.join(', ')}.`);
        }

        // For GET requests, append data as query parameters
        if (this.#method === 'GET' && !isDataEmpty(this.#data)) {
            const existingParams = decodeURLQuery(this.#url);
            let allParams = {};

            // Extract params from FormData or object
            if (this.isFormData()) {
                for (const [key, value] of this.#data.entries()) {
                    allParams[key] = value;
                }
            } else {
                allParams = { ...this.#data };
            }

            // Merge with existing URL params
            allParams = { ...existingParams, ...allParams };

            // Rebuild URL with query string
            this.#url = this.#url.split('?')[0] + '?' + encodeURLQuery(allParams);
        }
    }

    /**
     * Validates nonce with server and updates global nonce.
     *
     * Flow:
     * 1. Send current nonce to server
     * 2. Server verifies and returns new nonce
     * 3. Update global nonce with new value
     * 4. Return validation result
     *
     * @private
     * @returns {Promise<boolean>} True if validation succeeded
     */
    async #validateNonce() {
        try {
            lcs_ajax_object = lcs_ajax_object || {};

            const currentNonce = lcs_ajax_object.nonce;
            if (!currentNonce) {
                console.error('Nonce validation error: No nonce found in lcs_ajax_object');
                this.#triggerHooks('ajaxRequestFailedOnNonceValidation');
                return false;
            }

            // Prepare nonce validation request
            const payload = JSON.stringify({
                NONCE: currentNonce,
                SECURE: this.isFormData() 
                    ? (this.#data.get('SECURE') || 'true') 
                    : (this.#data.SECURE || true)
            });

            const headers = {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };

            // Remove query parameters from nonce URL
            const nonceUrl = this.#nonce_url.split('?')[0];

            // Send validation request using fetch
            const response = await fetch(nonceUrl, { 
                method: 'POST', 
                headers, 
                body: payload 
            });

            if (!response.ok) {
                console.error(`Nonce validation error: HTTP ${response.status}: ${response.statusText}`);
                this.#triggerHooks('ajaxRequestFailedOnNonceValidation');
                return false;
            }

            const responseData = await response.json();

            // Validate response structure
            if (!responseData || typeof responseData !== 'object') {
                this.#triggerHooks('ajaxRequestFailedOnNonceValidation');
                console.error('Nonce validation error: Invalid response format', responseData);
                return false;
            }

            const newNonce = responseData.data;

            // Ensure new nonce was provided
            if (!newNonce || typeof newNonce !== 'string' || isDataEmpty(newNonce)) {
                this.#triggerHooks('ajaxRequestFailedOnNonceValidation');
                console.error('Nonce validation error: Server did not return a new nonce', responseData);
                return false;
            }

            // Update global nonce
            lcs_ajax_object.nonce = newNonce;

            // Return validation result
            return true;

        } catch (error) {
            this.#triggerHooks('ajaxRequestFailedOnNonceValidation');
            console.error('Nonce validation error:', error);
            return false;
        }
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    /**
     * Waits for internet connection to be restored.
     *
     * @private
     * @returns {Promise<void>} Resolves when online or timeout reached
     * @throws {Error} If maximum wait time exceeded
     */
    async #waitForOnline() {
        let timeWaited = 0;

        return new Promise((resolve, reject) => {
            // Listen for online event
            const onlineHandler = () => {
                window.removeEventListener('online', onlineHandler);
                resolve();
            };
            window.addEventListener('online', onlineHandler);

            // Poll for connection
            const checkOnline = () => {
                if (navigator.onLine) {
                    window.removeEventListener('online', onlineHandler);
                    resolve();
                } else if (timeWaited >= this.maxWaitTime) {
                    window.removeEventListener('online', onlineHandler);
                    reject(new Error('Maximum wait time for reconnection exceeded'));
                } else {
                    timeWaited += this.pollInterval;
                    setTimeout(checkOnline, this.pollInterval);
                }
            };

            checkOnline();
        });
    }

    /**
     * Triggers hook actions for request lifecycle events.
     *
     * @private
     * @param {string} hookName - Name of the hook to trigger
     * @param {*} [data] - Optional data to pass to hook
     */
    #triggerHooks(hookName, data) {
        // Trigger instance-specific hook if ID is set
        if (!isDataEmpty(this.#hooksID)) {
            hooks.doAction(`${hookName}_${this.#hooksID}`, data);
        }
        // Always trigger global hook
        hooks.doAction(hookName, data);
    }

    // ========================================================================
    // PUBLIC UTILITY METHODS
    // ========================================================================

    /**
     * Checks if the current data payload is FormData.
     *
     * @returns {boolean} True if data is FormData instance
     */
    isFormData() {
        return this.#data instanceof FormData;
    }

    /**
     * Provides default headers based on data type.
     *
     * @returns {Object} Default headers object
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
     * Converts an object to FormData, intelligently handling arrays, files, and primitives.
     *
     * Rules:
     * - Arrays → appended with [] suffix (e.g., 'tags[]')
     * - FileList → each file appended with [] suffix
     * - Single File → appended without [] suffix
     * - Primitives → appended as-is
     *
     * @param {Object|FormData|null} [data=null] - Data to convert (uses instance data if null)
     * @returns {FormData} Constructed FormData instance
     * @throws {Error} If data is not an object or FormData
     */
    buildFormData(data = null) {
        data = data === null ? this.#data : data;

        // Validate data type
        if (data !== Object(data)) {
            throw new Error('buildFormData error: Data must be an object or FormData.');
        }

        // Return existing FormData as-is
        if (data instanceof FormData) {
            this.#data = data;
            return data;
        }

        const formData = new FormData();

        // Convert object to FormData
        Object.keys(data).forEach(key => {
            const value = data[key];

            if (Array.isArray(value)) {
                // Array → append each item with [] suffix
                const arrayKey = key.replace(/\[\]$/g, '') + '[]';
                value.forEach(item => formData.append(arrayKey, item));

            } else if (value instanceof FileList) {
                // FileList → append each file with [] suffix
                const fileKey = key.replace(/\[\]$/g, '') + '[]';
                for (let i = 0; i < value.length; i++) {
                    formData.append(fileKey, value[i]);
                }

            } else if (value instanceof File) {
                // Single file → append without [] suffix
                formData.append(key.replace(/\[\]$/g, ''), value);

            } else {
                // Primitive value → append as-is
                formData.append(key, value);
            }
        });

        this.#data = formData;
        return formData;
    }

    // ========================================================================
    // SETTERS
    // ========================================================================

    /**
     * Sets the request payload.
     *
     * @param {Object|FormData} data - Data to send with request
     * @throws {Error} If data is not an object or FormData
     */
    setData(data) {
        if (typeof data !== 'object') {
            throw new Error('setData error: Data must be an object or FormData.');
        }
        this.#data = data;
    }

    /**
     * Sets the target URL.
     *
     * @param {string} url - Target URL
     * @throws {Error} If URL is empty
     */
    setUrl(url) {
        if (typeof url !== 'string' || url.trim() === '') {
            throw new Error('setUrl error: URL must be a non-empty string.');
        }
        this.#url = url;
    }

    /**
     * Sets the nonce validation endpoint URL.
     *
     * @param {string} url - Nonce validation URL
     * @throws {Error} If URL is empty
     */
    setNonceUrl(url) {
        if (typeof url !== 'string' || url.trim() === '') {
            throw new Error('setNonceUrl error: URL must be a non-empty string.');
        }
        this.#nonce_url = url;
    }

    /**
     * Sets the HTTP method.
     *
     * @param {string} method - HTTP method ('GET' or 'POST')
     * @throws {Error} If method is invalid
     */
    setMethod(method) {
        const validMethods = ['GET', 'POST'];
        if (!validMethods.includes(method)) {
            throw new Error(`setMethod error: Method must be one of ${validMethods.join(', ')}.`);
        }
        this.#method = method;
    }

    /**
     * Sets custom request headers.
     *
     * @param {Object} headers - Headers object
     * @throws {Error} If headers is not a plain object
     */
    setHeaders(headers) {
        if (typeof headers !== 'object' || Array.isArray(headers)) {
            throw new Error('setHeaders error: Headers must be a plain object.');
        }
        this.#headers = headers;
    }

    /**
     * Sets the transport model.
     *
     * @param {string} model - Transport model ('fetch' or 'xhr')
     * @throws {Error} If model is invalid
     */
    setModel(model) {
        const validModels = ['fetch', 'xhr'];
        if (!validModels.includes(model)) {
            throw new Error(`setModel error: Model must be one of ${validModels.join(', ')}.`);
        }
        this.#model = model;
    }

    /**
     * Sets the request timeout.
     *
     * @param {number} timeout - Timeout in milliseconds
     * @throws {Error} If timeout is not a positive number
     */
    setTimeout(timeout) {
        if (typeof timeout !== 'number' || timeout <= 0) {
            throw new Error('setTimeout error: Timeout must be a positive number.');
        }
        this.timeout = timeout;
    }

    /**
     * Sets whether request should be asynchronous (XHR only).
     *
     * @param {boolean} [active=true] - True for async, false for sync
     */
    setAsync(active = true) {
        this.#isRequestAsync = !!active;
    }

    /**
     * Sets a unique hooks ID for lifecycle events.
     * Prevents duplicate IDs from being registered.
     *
     * @param {string} hid - Hooks identifier
     * @throws {Error} If hooks ID is empty
     */
    setHooksId(hid) {
        if (isDataEmpty(hid)) {
            throw new Error('setHooksId error: Hooks ID cannot be empty.');
        }

        // Initialize global registry if needed
        window.lcsAjaxRequest = window.lcsAjaxRequest || {};
        window.lcsAjaxRequest.HIDs = window.lcsAjaxRequest.HIDs || [];

        // Register ID if not already registered
        if (!window.lcsAjaxRequest.HIDs.includes(hid)) {
            window.lcsAjaxRequest.HIDs.push(hid);
        }

        this.#hooksID = hid;
    }

    /**
     * Sets whether to wait for reconnection when offline.
     *
     * @param {boolean} [active=true] - True to wait for reconnection
     */
    waitOffline(active = true) {
        this.#waitOffline = !!active;
    }

    // ========================================================================
    // GETTERS
    // ========================================================================

    /**
     * Gets the current request payload.
     * @returns {Object|FormData} Current data
     */
    getData() {
        return this.#data;
    }

    /**
     * Gets the target URL.
     * @returns {string} Current URL
     */
    getUrl() {
        return this.#url;
    }

    /**
     * Gets the HTTP method.
     * @returns {string} Current method
     */
    getMethod() {
        return this.#method;
    }

    /**
     * Gets the request headers (copy to prevent external mutation).
     * @returns {Object} Current headers
     */
    getHeaders() {
        return { ...this.#headers };
    }

    /**
     * Gets the transport model.
     * @returns {string} Current model ('fetch' or 'xhr')
     */
    getModel() {
        return this.#model;
    }

    /**
     * Gets the nonce validation URL.
     * @returns {string} Nonce URL
     */
    getNonceUrl() {
        return this.#nonce_url;
    }

    /**
     * Checks if a request is currently in progress (global lock).
     * @returns {boolean} True if request is running
     */
    isRunning() {
        return isRunningAjax;
    }

    /**
     * Checks if request is configured as asynchronous.
     * @returns {boolean} True if async
     */
    isAsync() {
        return this.#isRequestAsync;
    }

    /**
     * Checks if request was interrupted due to offline state.
     * @returns {boolean} True if interrupted
     */
    isInterrupted() {
        return this.#isAjaxInterrupted;
    }

    /**
     * Checks if request is configured to wait when offline.
     * @returns {boolean} True if waiting for reconnection
     */
    isWaitingOffline() {
        return this.#waitOffline;
    }

    /**
     * Gets the hooks identifier for this instance.
     * @returns {string} Hooks ID
     */
    getHooksId() {
        return this.#hooksID;
    }

    /**
     * Gets the XHR instance (only for 'xhr' model after request is sent).
     *
     * @returns {XMLHttpRequest} XHR instance
     * @throws {Error} If model is not 'xhr' or request hasn't been sent
     */
    getRequestInstance() {
        if (this.#model !== 'xhr') {
            throw new Error("getRequestInstance error: Only available for 'xhr' transport model.");
        }
        if (!this.#requestInstance || !(this.#requestInstance instanceof XMLHttpRequest)) {
            throw new Error('getRequestInstance error: No XHR instance available. Request may not have been sent yet.');
        }
        return this.#requestInstance;
    }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Pre-configured singleton instance for convenience.
 * Uses server-provided AJAX URL and POST method by default.
 *
 * @example
 * import { ajax } from './ajaxRequest.js';
 * ajax.setData({ action: 'save', value: 123 });
 * const result = await ajax.send();
 */
export const ajax = new ajaxRequest(lcs_ajax_object.ajaxurl || '', 'POST');