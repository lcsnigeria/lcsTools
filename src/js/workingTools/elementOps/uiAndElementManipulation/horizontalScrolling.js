/**
 * Horizontal Scrolling Utility for Containers
 *
 * Automatically enables left/right navigation buttons for horizontally scrollable containers.
 * Buttons appear or disappear based on scroll position and content width.
 * Smooth scrolling is supported. Button visibility dynamically updates on scroll, resize,
 * and content changes using a `ResizeObserver`.
 *
 * -----------------------
 * 📦 HTML STRUCTURE:
 * -----------------------
 * <div class="lcsHorizontalScrolling">
 *   <button class="_scroll_btn_left">←</button>
 *   <div class="_scroll_content">
 *     <!-- Horizontally overflowing content here -->
 *   </div>
 *   <button class="_scroll_btn_right">→</button>
 * </div>
 *
 * -----------------------
 * 🎯 USAGE:
 * -----------------------
 * 1. Add the class `lcsHorizontalScrolling` to the scrollable wrapper.
 * 2. Inside it, include:
 *    - A `._scroll_btn_left` button for scrolling left
 *    - A `._scroll_btn_right` button for scrolling right
 *    - A `._scroll_content` container that holds overflowed items (e.g., cards, images, etc.)
 *
 * 3. The script handles:
 *    - Showing/hiding buttons depending on scroll position
 *    - Smooth horizontal scrolling when buttons are clicked
 *    - Real-time updates when the container or its contents resize
 *
 * -----------------------
 * 💡 EXAMPLE:
 * -----------------------
 * <div class="lcsHorizontalScrolling">
 *   <button class="_scroll_btn_left">←</button>
 *   <div class="_scroll_content">
 *     <div class="card">Item 1</div>
 *     <div class="card">Item 2</div>
 *     <div class="card">Item 3</div>
 *     ...
 *   </div>
 *   <button class="_scroll_btn_right">→</button>
 * </div>
 *
 * -----------------------
 * ✅ CSS TIP (optional):
 * -----------------------
 * ._scroll_btn_left,
 * ._scroll_btn_right {
 *   display: none;
 *   align-items: center;
 *   justify-content: center;
 *   position: absolute; // e.g., place over scroll content if needed
 *   z-index: 1;
 * }
 *
 * @event _scroll_content:scroll - Triggered when the user scrolls inside the scrollable content.
 * @event window:resize - Triggered when the browser window is resized.
 * @event ResizeObserver - Observes changes in size of the scroll content container.
 */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.lcsHorizontalScrolling')
    .forEach(initializeHorizontalScrolling);
});

/**
 * Initializes horizontal scrolling logic and controls for a given container.
 * @param {Element} container - The .lcsHorizontalScrolling element.
 */
function initializeHorizontalScrolling(container) {
  if (container.dataset._scroll_initialized === "true") return; // Prevent re-init

  const scrollContent = container.querySelector('._scroll_content');
  const leftBtn = container.querySelector('._scroll_btn_left');
  const rightBtn = container.querySelector('._scroll_btn_right');

  if (!scrollContent || !leftBtn || !rightBtn) return;

  // Toggle scroll button visibility
  const toggleButtonVisibility = () => {
    const isScrollable = scrollContent.scrollWidth > scrollContent.clientWidth;
    const isScrolledLeft = scrollContent.scrollLeft === 0;
    const isScrolledRight = scrollContent.scrollLeft + scrollContent.clientWidth >= scrollContent.scrollWidth - 1;

    leftBtn.style.display = isScrollable && !isScrolledLeft ? 'flex' : 'none';
    rightBtn.style.display = isScrollable && !isScrolledRight ? 'flex' : 'none';
  };

  // Scroll behavior
  leftBtn.addEventListener('click', () => {
    scrollContent.scrollBy({ left: -200, behavior: 'smooth' });
  });

  rightBtn.addEventListener('click', () => {
    scrollContent.scrollBy({ left: 200, behavior: 'smooth' });
  });

  scrollContent.addEventListener('scroll', toggleButtonVisibility);

  // Keyboard support
  scrollContent.setAttribute('tabindex', '0'); // Make focusable
  scrollContent.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      scrollContent.scrollBy({ left: -200, behavior: 'smooth' });
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      scrollContent.scrollBy({ left: 200, behavior: 'smooth' });
      e.preventDefault();
    }
  });

  // Observe content resizing
  const resizeObserver = new ResizeObserver(toggleButtonVisibility);
  resizeObserver.observe(scrollContent);

  // Debounced window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(toggleButtonVisibility, 100);
  });

  // Initialize state
  requestAnimationFrame(() => {
    toggleButtonVisibility();
  });

  // Mark as initialized
  container.dataset._scroll_initialized = "true";
}

/**
 * Starts observing for new .lcsHorizontalScrolling elements added to the DOM.
 */
function startObservingForNewHorizontalScrolling() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (!(node instanceof HTMLElement)) return;

        if (node.matches('.lcsHorizontalScrolling')) {
          initializeHorizontalScrolling(node);
        } else {
          // Check descendants
          node.querySelectorAll?.('.lcsHorizontalScrolling').forEach(el => {
            initializeHorizontalScrolling(el);
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also initialize any that already exist at load time
  document.querySelectorAll('.lcsHorizontalScrolling').forEach(initializeHorizontalScrolling);
}

// Start watching
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startObservingForNewHorizontalScrolling);
} else {
  startObservingForNewHorizontalScrolling();
}

export const horizontalScrollingInitialized = true;