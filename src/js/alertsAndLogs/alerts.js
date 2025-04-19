import '../../css/alertsAndLogs/alerts.css';

/**
 * Displays an alert box on the webpage with a specified message and type.
 *
 * @param {string} alertMsg - The message to display in the alert box.
 * @param {string} [alertType='alert'] - The type of alert to display. 
 *     Supported types are:
 *     - 'alert': Default alert with an exclamation circle icon.
 *     - 'info': Informational alert with an info circle icon.
 *     - 'error': Error alert with a times circle icon.
 *     - 'success': Success alert with a check circle icon.
 *     - 'warning': Warning alert with an exclamation triangle icon.
 *     If an invalid type is provided, it defaults to 'alert'.
 *
 * @example
 * // Display a success alert
 * alert('Operation completed successfully!', 'success');
 *
 * @example
 * // Display an error alert
 * alert('An error occurred.', 'error');
 *
 * @example
 * // Display a default alert
 * alert('This is a default alert.');
 */
export function alert(alertMsg, alertType = 'alert') {
    const alertThemeClass = {
        'alert': { class: 'lcs_alert_box_alert', fa_icon: 'fa-exclamation-circle' },
        'info': { class: 'lcs_alert_box_info', fa_icon: 'fa-info-circle' },
        'error': { class: 'lcs_alert_box_error', fa_icon: 'fa-times-circle' },
        'success': { class: 'lcs_alert_box_success', fa_icon: 'fa-check-circle' },
        'warning': { class: 'lcs_alert_box_warn', fa_icon: 'fa-exclamation-triangle' }
    };

    if (!alertThemeClass[alertType]) {
        console.warn(`Invalid alert type: ${alertType}, defaulting to "alert".`);
        alertType = 'alert';
    }

    // Create alert container
    const alertBox = document.createElement('div');
    alertBox.className = `lcs_alert_box ${alertThemeClass[alertType].class}`;

    // Create icon element
    const icon = document.createElement('i');
    icon.className = `fa ${alertThemeClass[alertType].fa_icon} fa-2x`;

    // Create html element
    const alertHTML = document.createElement('span');
    alertHTML.className = 'lcs_alert_content';
    alertHTML.innerHTML = alertMsg;

    // Create close button
    const closeButton = document.createElement('i');
    closeButton.className = 'fa fa-times fa-2x exit_button';
    closeButton.onclick = () => alertBox.remove();

    // Append elements
    alertBox.appendChild(icon);
    alertBox.appendChild(alertHTML);
    alertBox.appendChild(closeButton);

    // Append to body
    document.body.appendChild(alertBox);
}