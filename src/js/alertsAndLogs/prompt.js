/**
 * Displays a modal prompt dialog and waits for user input.
 *
 * This function creates a temporary overlay containing a styled prompt box
 * with a text input and two buttons: "Confirm" and "Cancel".  
 * The function returns a Promise that resolves only after the user completes
 * an action.
 *
 * **Return values:**
 * - Resolves with the text entered by the user when "Confirm" or Enter is pressed.
 * - Resolves with `null` when "Cancel", Escape, or clicking outside the modal.
 *
 * **User Actions That Resolve the Promise:**
 * - Clicking **Confirm**
 * - Clicking **Cancel**
 * - Pressing **Enter** (equivalent to Confirm)
 * - Pressing **Escape** (equivalent to Cancel)
 * - Clicking outside the prompt box (equivalent to Cancel)
 *
 * This function behaves similarly to the traditional `window.prompt()` but
 * does not block the entire JS thread — instead, it uses a Promise that can
 * be awaited.
 *
 * ---
 * @example
 * // Basic usage with async/await
 * const value = await lcsTools.prompt("Your Name", "Type here...");
 * console.log("User entered:", value);
 *
 * ---
 * @example
 * // Using .then()
 * lcsTools.prompt("Enter age", "e.g. 25").then((age) => {
 *     if (age !== null) {
 *         console.log("Age received:", age);
 *     } else {
 *         console.log("Prompt cancelled");
 *     }
 * });
 *
 * ---
 * @example
 * // Prompt with default value pre-filled
 * const username = await lcsTools.prompt("Edit Username", "", "john_doe");
 * console.log("Updated username:", username);
 *
 * @param {string} [title="Enter a value"] - The heading displayed at the top of the prompt.
 * @param {string} [placeholder=""] - Placeholder text for the input field.
 * @param {string} [defaultValue=""] - Initial value pre-filled in the input field.
 * @returns {Promise<string|null>} Promise resolved with the user input or null on cancel.
 */
export function prompt(title = "Enter a value", placeholder = "", defaultValue = "") {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'prompt-overlay';
        
        const box = document.createElement('div');
        box.className = 'prompt-box';
        
        box.innerHTML = `
            <div class="prompt-header">
                <h2 class="prompt-title">${title}</h2>
            </div>
            <div class="prompt-body">
                <input 
                    type="text" 
                    class="prompt-input" 
                    placeholder="${placeholder}"
                    value="${defaultValue}"
                    autofocus
                />
            </div>
            <div class="prompt-footer">
                <button class="prompt-btn prompt-btn-cancel">Cancel</button>
                <button class="prompt-btn prompt-btn-confirm">Confirm</button>
            </div>
        `;
        
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        
        const input = box.querySelector('.prompt-input');
        const cancelBtn = box.querySelector('.prompt-btn-cancel');
        const confirmBtn = box.querySelector('.prompt-btn-confirm');
        
        // Ensure input gets focus after DOM paint
        setTimeout(() => input.focus(), 100);
        
        const close = (value) => {
            overlay.style.animation = 'fadeIn 0.2s reverse';
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(value);
            }, 200);
        };
        
        confirmBtn.addEventListener('click', () => close(input.value));
        cancelBtn.addEventListener('click', () => close(null));
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') close(input.value);
            if (e.key === 'Escape') close(null);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close(null);
        });
    });
}