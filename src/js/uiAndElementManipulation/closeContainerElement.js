/**
 * Handles the closing or hiding of containers based on click events.
 *
 * When a user clicks an element with the `_close_container` class,
 * this script checks if its closest parent has the `_container_will_close` class.
 * 
 * - If the clicked element has the `_hide` class, the container is hidden via CSS (`display: none`).
 * - Otherwise, the container element is removed from the DOM entirely.
 *
 * This provides a flexible way to either temporarily hide or completely remove UI components.
 *
 * @event click
 * @target Element with class `_close_container` inside a parent `_container_will_close`
 */
document.addEventListener('click', (event) => {
    const clickTarget = event.target;

    if (clickTarget.closest('._close_container')) {
        const closestContainer = clickTarget.closest('._container_will_close');
        const closeTrigger = clickTarget.closest('._close_container');

        if (closeTrigger.classList.contains('_hide')) {
            closestContainer.style.display = 'none';
        } else {
            closestContainer.remove();
        }
    }
});

/**
 * Export this file's codes
 */
export const lcsCloseContainerElement = true;