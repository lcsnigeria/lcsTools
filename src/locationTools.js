let lcsLocationToolsByClassName = false;

/**
 * Handles click events on elements with the class "lcsGetCurrentLocation" to retrieve and set the user's current location.
 * 
 * Uses the lcsGetCurrentLocation function
 * 
 * Usage Example:
 * ```html
 * <input type="text" id="locationInput" placeholder="Your location will appear here">
 * <button class="lcsGetCurrentLocation" data-get_value="locationInput">Get Location</button>
 * ```
 *
 * @fires ClickEvent - Listens for clicks on elements with the class "lcsGetCurrentLocation".
 * @listens ClickEvent
 */
document.addEventListener("click", async (event) => {
    // Check if the clicked element is a button with the class "lcsGetCurrentLocation"
    const triggerButton = event.target.closest(".lcsGetCurrentLocation");
    if (!triggerButton) return;

    // Get the input element ID from the button's data attribute
    const inputElementID = triggerButton.dataset.get_value;
    const inputElement = document.getElementById(inputElementID);
    lcsLocationToolsByClassName = true;
    await lcsGetCurrentLocation(inputElement);
    lcsLocationToolsByClassName = false;
});

/**
 * Retrieves the user's current location and optionally updates an input element with the address.
 *
 * This function uses the browser's geolocation API to fetch the user's coordinates and performs reverse geocoding
 * via OpenStreetMap's Nominatim API to convert them into a human-readable address. It provides a modal-based
 * user interface for feedback, permission requests, and error handling.
 *
 * Features:
 * - Creates a styled modal for user interaction and error reporting.
 * - Validates geolocation support and input element integrity.
 * - Manages geolocation permission states (prompt, granted, denied).
 * - Fetches and processes location data asynchronously.
 * - Restores original input value on failure.
 *
 * Process Flow:
 * 1. Validates browser geolocation support and input element (if provided).
 * 2. Displays a modal if permission needs to be requested or an error occurs.
 * 3. Queries geolocation permission status and retrieves coordinates if granted.
 * 4. Performs reverse geocoding using the Nominatim API.
 * 5. Updates the input element (if provided) with the address or returns it.
 * 6. Handles errors by showing a modal and restoring the input element's original value.
 *
 * Requirements:
 * - Browser must support `navigator.geolocation` and `navigator.permissions`.
 * - User must grant location access.
 * - Internet connection required for API calls.
 *
 * Error Handling:
 * - No geolocation support: Displays an error modal.
 * - Invalid input element: Shows a specific error message based on context.
 * - Permission denied: Informs user to enable access manually.
 * - API or geolocation failure: Restores original input value and shows error.
 *
 * Usage Example:
 * ```javascript
 * // With an input element
 * const input = document.getElementById("locationInput");
 * await lcsGetCurrentLocation(input); // Updates input with address
 *
 * // Without an input element
 * const address = await lcsGetCurrentLocation(false); // Returns address
 * ```
 *
 * @param {HTMLElement|false} [inputElement=false] - The HTML element to update with the address, or `false` if no update is needed.
 * @returns {Promise<string|null>} A promise that resolves to the retrieved address string or `null` if the process fails silently.
 * @throws {Error} Throws an error internally (caught and handled) if geolocation or API calls fail.
 */
export async function lcsGetCurrentLocation(inputElement = false) {
    // Create Alert Modal
    const LGCL_Alert_Modal = document.createElement("div");
    Object.assign(LGCL_Alert_Modal.style, {
        width: "300px",
        height: "200px",
        borderRadius: "10px",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#ffffff",
        padding: "20px",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        zIndex: "9999"
    });

    // Alert text
    const LGCL_Alert = document.createElement("p");
    Object.assign(LGCL_Alert.style, {
        color: "#444",
        fontSize: "17px"
    });

    // Wrapper for alert buttons
    const LGCL_Alert_Button_Wrapper = document.createElement("div");
    Object.assign(LGCL_Alert_Button_Wrapper.style, {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginTop: "10px",
        width: "100%"
    });

    // Cancel button
    const LGCL_Alert_Exit_Button = document.createElement("button");
    LGCL_Alert_Exit_Button.type = "button";
    LGCL_Alert_Exit_Button.textContent = "Cancel";
    Object.assign(LGCL_Alert_Exit_Button.style, {
        padding: "16px",
        width: "100%",
        fontSize: "15px",
        fontWeight: "600",
        backgroundColor: "#f44336",
        color: "#fff",
        border: "none",
        borderRadius: "50px",
        cursor: "pointer"
    });

    // Variables to track issues and permission status
    let LGCL_Alert_Has_Issue = false;
    let LGCL_Alert_Will_Ask_Permission = false;
    let LGCL_Alert_Has_InputElement_Issue = false;

    // Check if Geolocation is supported
    if (!("geolocation" in navigator)) {
        LGCL_Alert_Has_Issue = true;
        LGCL_Alert.textContent = "Geolocation is not supported by this browser.";
    }

    // Validate if the input element exists
    if (inputElement !== false) {
        if (!(inputElement instanceof HTMLElement)) {
            LGCL_Alert_Has_InputElement_Issue = true;
            LGCL_Alert_Has_Issue = true;
            if (lcsLocationToolsByClassName) {
                LGCL_Alert.textContent = "Invalid input field ID. Please check your button's data-get_value attribute. Use 'false' if you don't intend to output the result into an element.";
            } else {
                LGCL_Alert.textContent = "Invalid input element provided. Use 'false' if you don't intend to output the result into an element.";
            }
            LGCL_Alert_Exit_Button.textContent = "Okay";
        }
    }

    // Function to check geolocation permission and request access if needed
    const checkAndAllowAccess = () => {
        return new Promise((resolve, reject) => {
            navigator.permissions.query({ name: "geolocation" }).then((result) => {
                if (result.state === "prompt") {
                    LGCL_Alert_Has_Issue = true;
                    LGCL_Alert_Will_Ask_Permission = true;
                    LGCL_Alert.textContent = "Please allow location access to continue.";

                    const LGCL_Alert_Proceed_Button = document.createElement("button");
                    LGCL_Alert_Proceed_Button.type = "button";
                    LGCL_Alert_Proceed_Button.textContent = "Proceed";
                    Object.assign(LGCL_Alert_Proceed_Button.style, {
                        padding: "16px",
                        width: "100%",
                        fontSize: "15px",
                        fontWeight: "600",
                        backgroundColor: "#4CAF50",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50px",
                        cursor: "pointer"
                    });

                    LGCL_Alert_Proceed_Button.addEventListener("click", async () => {
                        navigator.geolocation.getCurrentPosition(async (position) => {
                            await fetchTheLocation(position);
                        }, reject);
                        LGCL_Alert_Modal.remove();
                    });

                    LGCL_Alert_Button_Wrapper.prepend(LGCL_Alert_Proceed_Button);
                    resolve(true);
                } else if (result.state === "denied") {
                    LGCL_Alert_Has_Issue = true;
                    LGCL_Alert.textContent =
                        "Oops! It seems you previously denied location access for this service. Please allow or reset manually and try again.";
                    LGCL_Alert_Exit_Button.textContent = "Okay";
                    resolve(true);
                } else {
                    LGCL_Alert_Will_Ask_Permission = false;
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                }
            });
        });
    };

    let LGCL_Location = null;
    const fetchTheLocation = async (positionData) => {
        const { latitude, longitude } = positionData.coords;
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await response.json();
        if (inputElement.contentEditable === "true") {
            inputElement.textContent = data.display_name;
        } else {
            inputElement.value = data.display_name;
        }
        LGCL_Alert_Has_Issue = false;
        LGCL_Location = data.display_name;
    };

    // Store initial input field value before processing
    let initialInputElementValue = "";
    if (!LGCL_Alert_Has_InputElement_Issue) {
        if (inputElement.contentEditable === "true") {
            initialInputElementValue = inputElement.textContent;
            inputElement.textContent = "Processing...";
        } else {
            initialInputElementValue = inputElement.value;
            inputElement.value = "Processing...";
        }
    }

    try {
        const positionData = await checkAndAllowAccess();
        if (!LGCL_Alert_Will_Ask_Permission && !LGCL_Alert_Has_Issue) {
            await fetchTheLocation(positionData);
        } else {
            LGCL_Alert_Has_Issue = true;
        }
    } catch (error) {
        LGCL_Alert_Has_Issue = true;
        LGCL_Alert.textContent = "Error getting location: " + error.message;
    }

    // If there was an issue, show the modal with an alert
    if (LGCL_Alert_Has_Issue) {
        LGCL_Alert_Exit_Button.addEventListener("click", () => {
            LGCL_Alert_Modal.remove();
            if (!LGCL_Alert_Has_InputElement_Issue) {
                if (inputElement.contentEditable === "true") {
                    inputElement.textContent = initialInputElementValue;
                } else {
                    inputElement.value = initialInputElementValue;
                }
            }
        });

        LGCL_Alert_Button_Wrapper.appendChild(LGCL_Alert_Exit_Button);
        LGCL_Alert_Modal.appendChild(LGCL_Alert);
        LGCL_Alert_Modal.appendChild(LGCL_Alert_Button_Wrapper);
        document.body.appendChild(LGCL_Alert_Modal);
        return;
    }

    return LGCL_Location;
}

export const lcsLocationTools = true;