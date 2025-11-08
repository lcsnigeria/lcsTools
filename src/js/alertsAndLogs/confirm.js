import { blackColor, dimmedBlackColor, lightGreyColor, primaryColor, whiteColor } from "../initializations/loadCSS";

/**
 * Displays a customizable confirmation dialog.
 *
 * This function creates a modal-style confirmation dialog with optional notes,
 * customizable button labels, and optional callbacks that trigger based on user interaction.
 * It returns a Promise that resolves to `true` if the user approves, and `false` otherwise.
 *
 * @param {string} message - The main confirmation message to display.
 * @param {string|null} [notes=null] - Additional optional notes or HTML content shown below the message.
 * @param {Object} [options={}] - Configuration options for customizing the dialog behavior and appearance.
 * @param {string} [options.approvalLabel='Ok'] - Label text for the approval (confirmation) button.
 * @param {string} [options.disapprovalLabel='Cancel'] - Label text for the disapproval (cancel) button.
 * @param {Function|null} [options.approvalCallback=null] - Function to execute when the user confirms.
 * @param {Function|null} [options.disapprovalCallback=null] - Function to execute when the user cancels.
 * @returns {Promise<boolean>} A Promise that resolves to `true` if the user clicks the approval button,
 *                             or `false` if they click the disapproval button.
 *
 * @example
 * confirm('Are you sure you want to delete this item?', 'This action cannot be undone.', {
 *   approvalLabel: 'Yes, delete',
 *   disapprovalLabel: 'No, cancel',
 *   approvalCallback: () => console.log('Item deleted.'),
 *   disapprovalCallback: () => console.log('Deletion cancelled.')
 * }).then((approved) => {
 *   if (approved) {
 *     // Proceed with deletion
 *   } else {
 *     // Abort action
 *   }
 * });
 */
export async function confirm(message, notes = null, options = {}) {
    return new Promise((resolve) => {
      const {
        approvalLabel = 'Ok',
        disapprovalLabel = 'Cancel',
        approvalCallback = null,
        disapprovalCallback = null,
      } = options;
  
      // Create the confirmation dialog container
      const confirmContainer = document.createElement('div');
      confirmContainer.style.position = 'fixed';
      confirmContainer.style.top = '0';
      confirmContainer.style.left = '0';
      confirmContainer.style.width = '100%';
      confirmContainer.style.height = '100%';
      confirmContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      confirmContainer.style.display = 'flex';
      confirmContainer.style.alignItems = 'center';
      confirmContainer.style.justifyContent = 'center';
      confirmContainer.style.zIndex = '1000';
  
      // Create the dialog box
      const dialogBox = document.createElement('div');
      dialogBox.style.backgroundColor = whiteColor;
      dialogBox.style.display = 'flex';
      dialogBox.style.flexDirection = 'column';
      dialogBox.style.alignItems = 'start';
      dialogBox.style.textAlign = 'left';
      dialogBox.style.gap = '10px';
      dialogBox.style.padding = '20px';
      dialogBox.style.borderRadius = '10px';
      dialogBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
      dialogBox.style.maxWidth = '300px';
      dialogBox.style.width = '100%';
  
      // Message content
      const messageElement = document.createElement('p');
      messageElement.style.fontSize = '20px';
      messageElement.style.color = blackColor;
      messageElement.style.fontWeight = '600';
      messageElement.textContent = message;
      dialogBox.appendChild(messageElement);
  
      // Notes content (optional)
      if (notes) {
        const notesElement = document.createElement('small');
        notesElement.innerHTML = notes;
        notesElement.style.display = 'block';
        notesElement.style.fontSize = '1rem';
        notesElement.style.color = dimmedBlackColor;
        dialogBox.appendChild(notesElement);
      }
  
      // Buttons container
      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.marginTop = '10px';
      buttonsContainer.style.display = 'flex';
      buttonsContainer.style.flexDirection = 'column';
      buttonsContainer.style.justifyContent = 'center';
      buttonsContainer.style.gap = '10px';
      buttonsContainer.style.width = '100%';
  
      // Approval button
      const approveButton = document.createElement('button');
      approveButton.textContent = approvalLabel;
      approveButton.style.display = 'flex';
      approveButton.style.alignItems = 'center';
      approveButton.style.justifyContent = 'center';
      approveButton.style.whiteSpace = 'nowrap';
      approveButton.style.height = '45px';
      approveButton.style.padding = '10px 20px';
      approveButton.style.backgroundColor = primaryColor;
      approveButton.style.color = whiteColor;
      approveButton.style.fontWeight = 'bold';
      approveButton.style.border = 'none';
      approveButton.style.borderRadius = '50px';
      approveButton.style.cursor = 'pointer';
  
      approveButton.addEventListener('click', () => {
        if (approvalCallback) approvalCallback();
        document.body.removeChild(confirmContainer);
        resolve(true);
      });
  
      // Disapproval button
      const disapproveButton = document.createElement('button');
      disapproveButton.textContent = disapprovalLabel;
      disapproveButton.style.display = 'flex';
      disapproveButton.style.alignItems = 'center';
      disapproveButton.style.justifyContent = 'center';
      disapproveButton.style.whiteSpace = 'nowrap';
      disapproveButton.style.height = '45px';
      disapproveButton.style.padding = '10px 20px';
      disapproveButton.style.backgroundColor = lightGreyColor;
      disapproveButton.style.color = blackColor;
      disapproveButton.style.fontWeight = 'bold';
      disapproveButton.style.border = 'none';
      disapproveButton.style.borderRadius = '50px';
      disapproveButton.style.cursor = 'pointer';
  
      disapproveButton.addEventListener('click', () => {
        if (disapprovalCallback) disapprovalCallback();
        document.body.removeChild(confirmContainer);
        resolve(false);
      });
  
      // Append buttons to the container
      buttonsContainer.appendChild(approveButton);
      buttonsContainer.appendChild(disapproveButton);
  
      // Append everything to the dialog box
      dialogBox.appendChild(buttonsContainer);
      confirmContainer.appendChild(dialogBox);
  
      // Append the confirmation dialog to the body
      document.body.appendChild(confirmContainer);
    });
}