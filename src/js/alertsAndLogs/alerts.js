import { isDataEmpty } from '../workingTools/dataTypes.js';

/**
 * A customizable alert system for displaying styled notifications dynamically on a webpage.
 * 
 * This class allows you to configure and dispatch alerts of various types (e.g., info, success, error),
 * themes, timeout durations, and positions. Alerts can be positioned using keywords like 'top-right' 
 * or attached to custom DOM elements. Multiple themes and flexible positioning make it suitable for 
 * any UI design system.
 *
 * @class
 */
class lcsAlert {
    #alertType;
    #alertTheme;
    #alertPosition;
    #alertMessage;
    #alertTimeout;

    /**
     * Creates a new instance of the lcsAlert class with default or specified configurations.
     *
     * @param {string} [alertType='alert'] - The type of the alert to display. Supported types include:
     *     - 'alert' (generic warning),
     *     - 'info' (informational message),
     *     - 'error' (indicates a failure or problem),
     *     - 'success' (indicates a successful operation),
     *     - 'warning' (caution or attention needed).
     * 
     * @param {string|HTMLElement} [alertPosition='top-right'] - Specifies where the alert should appear.
     *     Accepts either a position keyword string (e.g., 'bottom-left', 'center') or a DOM element
     *     where the alert container will be injected.
     * 
     * @param {number} [alertTimeout=5] - Duration (in seconds) before the alert auto-dismisses.
     *     Set to `0` to make the alert persistent until manually closed.
     * 
     * @param {string} [alertTheme='default'] - Visual theme to apply to the alert. Currently supports:
     *     - 'default' (base look-and-feel).
     *     Additional themes can be integrated by extending the class.
     */
    constructor(alertType = 'alert', alertPosition = 'top-right', alertTimeout = 5, alertTheme = 'default') {
        this.#alertType = alertType;
        this.#alertPosition = alertPosition;
        this.#alertTimeout = alertTimeout;
        this.#alertTheme = alertTheme;

        this.#validateConfigs();
    }

    /**
     * Sends and displays an alert with a given message and optional overrides for type, position,
     * timeout, and theme.
     *
     * @param {string} alertMsg - The main text message or HTML to show inside the alert.
     * @param {string} alertType - Optional override for the alert type. Uses 'alert' if falsy
     * @param {string|HTMLElement} [alertPosition=this.#alertPosition] - Optional override for alert position.
     * @param {number} [alertTimeout=this.#alertTimeout] - Optional override for how long the alert stays visible.
     * @param {string} [alertTheme=this.#alertTheme] - Optional override for the theme used to render the alert.
     */
    send(
        alertMsg, 
        alertType, 
        alertPosition = this.#alertPosition, 
        alertTimeout = this.#alertTimeout, 
        alertTheme = this.#alertTheme
    ) {
        this.#alertMessage = alertMsg;
        this.#alertType = isDataEmpty(alertType) ? 'alert' : alertType;
        this.#alertPosition = alertPosition;
        this.#alertTimeout = alertTimeout;
        this.#alertTheme = alertTheme;

        this.#validateConfigs();

        this.#getAlertTheme();
    }

    /**
     * Updates the default alert type for the instance.
     *
     * @param {string} alertType - The new default type for alerts. Must be one of:
     *     'alert', 'info', 'error', 'success', 'warning'.
     *     Invalid values will throw an error during validation.
     */
    setType(alertType) {
        this.#alertType = alertType;
        this.#validateConfigs();
    }

    /**
     * Sets the default position where alerts will be shown.
     *
     * @param {string|HTMLElement} alertPosition - Defines the positioning context:
     *     - If a string, should match a recognized position like 'top-right', 'bottom-center', etc.
     *     - If an HTMLElement, alerts will be injected into this DOM element instead of a global location.
     */
    setPosition(alertPosition) {
        this.#alertPosition = alertPosition;
        this.#validateConfigs();
    }

    /**
     * Sets the default timeout duration for alerts.
     *
     * @param {number} alertTimeout - Duration in seconds before the alert auto-dismisses.
     *     Use `0` to keep the alert persistent until manually closed.
     */
    setTimeout(alertTimeout) {
        this.#alertTimeout = alertTimeout;
        this.#validateConfigs();
    }

    /**
     * Updates the visual theme used for displaying alerts.
     *
     * @param {string} alertTheme - The name of the theme to apply. Must be supported by the internal logic.
     *     Only 'default' is supported currently, but this can be extended.
     */
    setTheme(alertTheme) {
        this.#alertTheme = alertTheme;
        this.#validateConfigs();
    }

    /**
     * Creates or retrieves the alert container element, depending on whether the alert is positioned globally
     * or within a custom DOM node.
     *
     * Ensures only one container exists per position or element.
     *
     * @private
     * @returns {HTMLElement} The alert container where alerts will be inserted.
     */
    #alertContainer() {
        let container;
        if (typeof this.#alertPosition === 'string') {
            const positionClass = this.#alertPositionClassName();
            container = document.querySelector(`.lcsAlertContainer.${positionClass}`);
            if (!container) {
                container = document.createElement('div');
                container.className = `lcsAlertContainer ${positionClass}`;
                document.body.appendChild(container);
            }
        } else if (this.#alertPosition instanceof HTMLElement) {
            container = this.#alertPosition.querySelector('.lcsAlertContainer._in_element');
            if (!container) {
                container = document.createElement('div');
                container.className = 'lcsAlertContainer _in_element';
                this.#alertPosition.appendChild(container);
            }
        } else {
            throw new Error('Invalid alert position');
        }
        return container;
    }

    /**
     * Creates and returns the alert DOM element. If the element for the current alert type and theme
     * doesn't exist, it will be created and appended to the container.
     *
     * @private
     * @returns {HTMLElement} The alert element used for displaying the notification.
     */
    #alertElement() {
        this.#alertContainer(); // Ensure container is set up

        // Create alert Element
        let alertElement = document.querySelector(`.lcsAlert.${this.#alertTypeClassName()}.${this.#alertTheme}`);
        if (!alertElement) {
            alertElement = document.createElement('div');
            alertElement.className = `lcsAlert ${this.#alertTypeClassName()} ${this.#alertTheme}`;
            this.#alertContainer().appendChild(alertElement);
        }
        return alertElement;
    }

    /**
     * Dispatches the appropriate method for rendering the alert based on the selected theme.
     *
     * @private
     * @throws {Error} If the specified theme is not implemented.
     */
    #getAlertTheme() {
        switch (this.#alertTheme) {
            case 'default':
                this.#defaultTheme();
                break;
            // Add more themes here in the future
            default:
                throw new Error(`Theme not implemented: ${this.#alertTheme}`);
        }
    }

    /**
     * Constructs the layout and visual components of the alert for the "default" theme.
     * 
     * Includes:
     *  - An icon based on the alert type
     *  - A close button for manual dismissal
     *  - A wrapper container for message content
     * 
     * Automatically removes the alert after the configured timeout period, or keeps it visible if timeout is 0.
     *
     * @private
     */
    #defaultTheme() {
        // Create close button if not exist and attach event listener...
        let closeButton = this.#alertElement().querySelector('._close_alert');
        if (!closeButton) {
            closeButton = document.createElement('i');
            closeButton.className = 'fa fa-times _close_alert';
            closeButton.addEventListener('click', () => {
                const alertToClose = closeButton.closest(`.lcsAlert`);
                const allAlerts = document.querySelectorAll('.lcsAlert');
                if (allAlerts.length <= 1) {
                    this.#alertContainer().remove();
                } else {
                    if (alertToClose) {
                        alertToClose.remove();
                    }
                }
            });
            this.#alertElement().appendChild(closeButton);
        }

        // Create wrapper for alert content
        const wrapper = document.createElement('div');
        wrapper.className = '_alert_wrapper';

        // Create and append icon
        const icon = this.#alertIcon();
        wrapper.appendChild(icon);

        // Create and append content
        const content = document.createElement('span');
        content.className = '_alert_content';
        content.innerHTML = this.#alertMessage;
        wrapper.appendChild(content);

        // Append wrapper to alert element
        this.#alertElement().appendChild(wrapper);

        // Remove wrapper based on timeout
        if (this.#alertTimeout > 0) {
            setTimeout(() => {
                const allWrappers = this.#alertElement().querySelectorAll('._alert_wrapper');
                if (allWrappers.length <= 1) {
                    this.#alertElement().remove();
                } else {
                    wrapper.remove();
                }
            }, (this.#alertTimeout * 1000))
        }
    }

    /**
     * Resolves and returns the CSS class suffix based on the current alert type.
     * 
     * Used to determine styling and iconography per alert type.
     *
     * @private
     * @returns {string} The class name corresponding to the alert type.
     */
    #alertTypeClassName() {
        const classNames = {
            'alert': '_alert',
            'info': '_info',
            'error': '_error',
            'success': '_success',
            'warning': '_warning'
        };
        return classNames[this.#alertType];
    }

    /**
     * Creates and returns an icon element associated with the current alert type.
     *
     * Uses Font Awesome icon classes to visually represent the alert category.
     *
     * @private
     * @returns {HTMLElement} A configured <i> element for the alert icon.
     */
    #alertIcon() {
        const iconClassNames = {
            'alert': 'fas fa-exclamation-circle',
            'info': 'fas fa-info-circle',
            'error': 'fas fa-times-circle',
            'success': 'fas fa-check-circle',
            'warning': 'fas fa-exclamation-triangle'
        };
        const iconElement = document.createElement('i');
        iconElement.className = iconClassNames[this.#alertType];
        return iconElement;
    }

    /**
     * Maps the current alert position (if a string) to its corresponding class name,
     * which determines how the container is positioned via CSS.
     *
     * @private
     * @returns {string} The class name representing the alert container's position.
     */
    #alertPositionClassName() {
        if (this.#alertPosition instanceof HTMLElement) return '_in_element';
        const classNames = {
            'top': '_top',
            'top-left': '_top_left',
            'top-center': '_top_center',
            'top-right': '_top_right',
            'center': '_center',
            'bottom': '_bottom',
            'bottom-left': '_bottom_left',
            'bottom-center': '_bottom_center',
            'bottom-right': '_bottom_right'
        };
        return classNames[this.#alertPosition];
    }

    /**
     * Validates all internal alert configurations to ensure compatibility and prevent misbehavior.
     * 
     * This includes checking:
     *  - Alert type is among supported values
     *  - Alert position is valid as a keyword or a DOM element
     *  - Theme is one of the supported options
     *  - Timeout is a valid number (converted to integer if needed)
     *
     * @private
     * @throws {Error} If any configuration value is invalid.
     */
    #validateConfigs() {
        const validTypes = ['alert', 'info', 'error', 'success', 'warning'];
        if (!validTypes.includes(this.#alertType)) {
            throw new Error(`Invalid alert type: ${this.#alertType}`);
        }

        if (typeof this.#alertPosition === 'string') {
            const validPositions = ['top', 'top-left', 'top-center', 'top-right', 'center', 'bottom', 'bottom-left', 'bottom-center', 'bottom-right'];
            if (!validPositions.includes(this.#alertPosition)) {
                throw new Error(`Invalid alert position: ${this.#alertPosition}`);
            }
        } else if (!(this.#alertPosition instanceof HTMLElement)) {
            throw new Error('Alert position must be a string or an HTMLElement');
        }

        const validThemes = ['default'];
        if (!validThemes.includes(this.#alertTheme)) {
            throw new Error(`Invalid alert theme: ${this.#alertTheme}`);
        }

        if (/\d+/.test(this.#alertTimeout)) {
            this.#alertTimeout = parseInt(this.#alertTimeout, 10);
        } else {
            throw new Error('Alert timeout must be a numeric/interger; Provided: ' + this.#alertTimeout);
        }
    }
}

/**
 * Singleton instance of lcsAlert for application-wide use.
 *
 * @type {lcsAlert}
 */
export const alert = new lcsAlert();
export default lcsAlert;