const lcs_ajax_object_meta = document.querySelector('meta[name="lcs_ajax_object"]'); // Get the AJAX object meta tag.
const lcs_ajax_object = lcs_ajax_object_meta ? JSON.parse(lcs_ajax_object_meta.content) : {}; // Parse the AJAX object from the meta tag.
let isRunningAjax = false; // A flag to ensure only one AJAX request runs at a time.

/**
 * Sends an AJAX request with JSON data or FormData for file uploads.
 *
 * This function prevents multiple concurrent AJAX requests by checking the `isRunningAjax` flag. 
 * It supports both JSON data and FormData (for file uploads), automatically managing headers 
 * and ensuring secure communication with the server using a nonce (if applicable).
 * 
 * The function dynamically detects whether `data` is a plain object or `FormData`, 
 * applying the appropriate `Content-Type` header. If a nonce is provided in `lcs_ajax_object`, 
 * it is included in the request for security.
 *
 * @param {Record<string, any> | FormData} data - The data to send in the request body. Use `FormData` for file uploads.
 * @param {string} [url=lcs_ajax_object.ajaxurl || ''] - The request URL. Defaults to the AJAX endpoint from `lcs_ajax_object.ajaxurl`, if available.
 * @param {string} [method='POST'] - The HTTP method to use (e.g., 'GET', 'POST'). Defaults to 'POST'.
 * @param {Record<string, string>} [headers={}] - Additional headers to include, merged with default headers based on the data type.
 * @returns {Promise<Record<string, any>>} - A promise that resolves with the response data (JSON object) or rejects with an error message.
 */
export async function sendAjaxRequest(data, url = lcs_ajax_object.ajaxurl || '', method = 'POST', headers = {}) {
    return new Promise(async (resolve, reject) => {
        /**
         * Ensure only one AJAX request runs at a time.
         * If another request is already running (`isRunningAjax` is true), wait until it finishes.
         */
        while (isRunningAjax) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        isRunningAjax = true; // Block further requests until the current one is finished.

        method = method.toUpperCase(); // Normalize the HTTP method to uppercase.
        const isFormData = data instanceof FormData; // Check if the data is FormData (for file uploads).

        /**
         * Set default headers:
         * - For JSON data: Set 'Content-Type' to 'application/json' and 'X-Requested-With' to 'XMLHttpRequest'.
         * - For FormData: Skip 'Content-Type' since it is automatically handled by the browser.
         */
        const defaultHeaders = isFormData
            ? { 'X-Requested-With': 'XMLHttpRequest' }
            : {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            };

        // Merge user-specified headers with the default headers.
        const requestHeaders = {
            ...defaultHeaders,
            ...headers
        };

        let isSecureRequest = true;
        if (isFormData) {
            // Append a flag to indicate if the request is secured.
            data.append('isNonceRetrieval', true);
        
            // Initialize data.secure if not set.
            if (!data.has('secure')) {
                data.append('secure', true);
            }
        
            // If secure is explicitly set to false, mark the request as secured.
            if (data.get('secure') === false) {
                isSecureRequest = false;
                data.append('isNonceRetrieval', false);
            }
        } else {
            // Append a flag to indicate if the request is secured.
            data.isNonceRetrieval = true;
        
            // Initialize data.secure if not set.
            if (!data.hasOwnProperty('secure')) {
                data.secure = true;
            }
        
            // If secure is explicitly set to false, mark the request as secured.
            if (data.secure === false) {
                isSecureRequest = false;
                data.isNonceRetrieval = false;
            }
        }        

        /**
         * Attach a nonce for security verification if required.
         * The nonce is added to the request to prevent CSRF attacks.
         * If nonce retrieval fails, the request is aborted.
         */
        if (isSecureRequest) {
            try {
                // Default nonce name
                let nonce_name = 'lcs_ajax_nonce';
                const nonce_data = {};
                // Determine the nonce name based on the data structure.
                if (isFormData) {
                    if (data.has('nonce_name')) {
                        nonce_name = data.get('nonce_name');
                    }
                } else {
                    if (data.hasOwnProperty('nonce_name')) {
                        nonce_name = data.nonce_name;
                    }
                }
                nonce_data.nonce_name = nonce_name;
                nonce_data.isNonceRetrieval = true;

                // Fetch the nonce from the server.
                const nonce = await lcsGetNonce(nonce_data, url);
                
                if (isFormData) {
                    data.append('nonce', nonce); // Append nonce for FormData.
                    data.append('nonce_name', nonce_name); // Append nonce_name
                    data.delete('isNonceRetrieval');
                } else {
                    data.nonce = nonce; // Add nonce for JSON data.
                    data.nonce_name = nonce_name; // Add nonce_name
                    delete data.isNonceRetrieval;
                }
                
            } catch (error) { 
                console.error("Error occurred while fetching nonce:", error.message);
                isRunningAjax = false; // Reset flag
                return reject(new Error("Failed to fetch nonce, aborting request."));
            }
        }

        /**
         * Prepare the fetch request options:
         * - Headers are skipped for FormData since it is handled by the browser automatically.
         * - If the method is 'GET', no body is included.
         */
        const options = {
            method,
            headers: isFormData ? undefined : requestHeaders,
            body: method === 'GET' ? undefined : isFormData ? data : JSON.stringify(data)
        };

        try {
            // Perform the AJAX request using the Fetch API.
            const response = await fetch(url, options);

            // Validate if the response is JSON.
            const contentType = response.headers.get('Content-Type') || '';
            if (!contentType.includes('application/json')) {
                const textResponse = await response.text();
                throw new Error(`Expected JSON but received: ${contentType}. Response: ${textResponse}`);
            }

            const responseData = await response.json();
            resolve(responseData);
        } catch (error) {
            console.error('Request failed:', error);
            reject(new Error('Request failed due to server error!'));
        } finally {
            isRunningAjax = false; // Ensure the flag is reset, even if an error occurs.
        }
    });
}


/**
 * Fetches a nonce from the server for AJAX requests.
 * 
 * The function sends a request to the server to fetch a nonce, which can be used for 
 * securing AJAX requests. The nonce is stored in a global object and returned once fetched.
 * 
 * @param {object} nonceData The object data containing name of the nonce to fetch and flag indicating it is a request to fetch none. 
 * 
 * @returns {Promise<string>} A Promise that resolves with the fetched nonce string.
 * @throws {Error} Throws an error if the request fails or the server responds with an error.
 */
async function lcsGetNonce(nonceData, url) {
    // Return a new Promise to handle asynchronous behavior
    return new Promise((resolve, reject) => {

        /**
         * Define the request payload for fetching the nonce.
         */
        const requestData = {
            nonce_name: nonceData.nonce_name, // Specify the nonce name.
            isNonceRetrieval: nonceData.isNonceRetrieval
        };

        // Make the request using the Fetch API
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest' // Standard header for AJAX requests
            },
            body: JSON.stringify(requestData) // Send the request data as JSON
        })
        .then((response) => {
            // Parse the response JSON once the request is successful
            response.json().then((responseData) => {
                if (!response.ok) {
                    // Reject the promise if the server responded with an error status
                    reject(new Error(`Nonce fetch failed with status: ${response.status}`));
                }

                // Update the global nonce object with the fetched nonce
                lcs_ajax_object.nonce = responseData.data;
                
                // Resolve the promise with the fetched nonce
                resolve(lcs_ajax_object.nonce);
            });
        })
        .catch((error) => {
            // Reject the promise if there was a network error or fetch failure
            reject(new Error(`Nonce request failed: ${error.message}`));
        });
    });
}

export const lcsAjaxRequest = true;