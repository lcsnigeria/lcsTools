import { spreadToArray } from "../../arrayOps";

/**
 * Create an overlay wrapper for any element.
 *
 * @param {HTMLElement|string} element - The element to wrap inside the overlay.
 *   Can be a real HTMLElement or a valid HTML string (e.g., "<p>Hi</p>").
 *
 * @param {Object} [data={}] - Options for overlay behavior and attributes.
 * @param {boolean} [data.setDismisser=true] - Whether to add a dismiss button (Font Awesome icon).
 * @param {boolean} [data.removeOnDismiss=false] - If true, removes overlay on dismiss; otherwise just hides it.
 * @param {Object} [data.attributes={}] - Attributes for the outer overlay element (e.g., { id: "overlay1", class: "my-overlay" }).
 * @param {Object} [data.elementAttributes={}] - Attributes for the inner element container.
 * @param {boolean} [data.renderNow=true] - If true, appends the overlay to <body>; if false, returns it for manual handling.
 * @param {boolean} [data.overwriteAttributes=false] - If true, provided attributes fully overwrite defaults; 
 *   if false (default), only classes are merged with defaults.
 * @param {boolean} [data.removeExistingOverlay=false] - If true, removes any existing `.lcsOverlayElement` before creating a new one.
 *
 * @returns {HTMLElement} The constructed overlay element containing the target element.
 *
 * @example
 * // 1. With HTMLElement
 * const box = document.createElement("div");
 * box.textContent = "Hello Overlay!";
 * overlayElement(box, { attributes: { id: "myOverlay", class: "bg-white shadow" } });
 *
 * @example
 * // 2. With HTML string
 * overlayElement("<p>Hello from string!</p>", { renderNow: true });
 *
 * @example
 * // 3. Add multiple classes to overlay
 * overlayElement("<div>Styled overlay</div>", {
 *   attributes: { class: "rounded-lg shadow-lg bg-dark" }
 * });
 *
 * @example
 * // 4. Add attributes to the container instead of overlay
 * overlayElement("<div>Inside container</div>", {
 *   elementAttributes: { class: "p-4 border border-gray-300" }
 * });
 *
 * @example
 * // 5. Disable dismisser and prevent auto-render
 * const overlay = overlayElement("<span>No dismisser</span>", {
 *   setDismisser: false,
 *   renderNow: false
 * });
 * document.querySelector("#customMount").appendChild(overlay);
 *
 * @example
 * // 6. Remove overlay completely when dismissed
 * overlayElement("<div>Closable</div>", { removeOnDismiss: true });
 *
 * @example
 * // 7. Remove any existing overlays before showing a new one
 * overlayElement("<div>Fresh overlay</div>", { removeExistingOverlay: true });
 */
export function overlayElement(element, data = {}) {
  const {
    setDismisser = true,
    removeOnDismiss = false,
    attributes = {},
    elementAttributes = {},
    renderNow = true,
    overwriteAttributes = false,
    removeExistingOverlay = false,
  } = data;

  // --- Convert HTML string to element if necessary ---
  if (typeof element === "string") {
    const template = document.createElement("template");
    template.innerHTML = element.trim();
    element = template.content.firstChild;
  }

  // --- Validate element ---
  if (!(element instanceof HTMLElement)) {
    throw new Error("overlayElement: 'element' must be a valid HTMLElement or HTML string.");
  }

  // Add default class to provided element
  element.classList.add("_overlay_element");

  // Remove existing overlays if requested
  if (removeExistingOverlay) {
    document.querySelectorAll(".lcsOverlayElement").forEach(el => el.remove());
  }

  // Create overlay structure
  const overlay = document.createElement("div");
  const elementContainer = document.createElement("div");

  // Apply default ID (this can be overwritten by attributes provision)
  const allOverlays = document.querySelectorAll(".lcsOverlayElement");
  const allOverlayCount = allOverlays.length;
  overlay.id = `lcsOverlayElement_${allOverlayCount + 1}`;

  // Apply default classes
  overlay.classList.add("lcsOverlayElement");
  elementContainer.classList.add("_overlay_container");

  // Apply overlay attributes
  Object.entries(attributes).forEach(([key, val]) => {
    if (val) {
      if (overwriteAttributes) {
        overlay.setAttribute(key, val);
      } else {
        if (key === 'class') {
          const cnArray = spreadToArray(val).filter(Boolean);
          cnArray.forEach(cn => overlay.classList.add(cn));
        }
      }
    }
  });

  // Apply container attributes
  Object.entries(elementAttributes).forEach(([key, val]) => {
    if (val) {
      if (overwriteAttributes) {
        elementContainer.setAttribute(key, val);
      } else {
        if (key === 'class') {
          const cnArray = spreadToArray(val).filter(Boolean);
          cnArray.forEach(cn => elementContainer.classList.add(cn));
        } 
      }
    }
  });

  // Insert the target element directly
  elementContainer.appendChild(element);

  // Add dismisser if enabled
  if (setDismisser) {
    const elementDismisser = document.createElement("span");
    elementDismisser.classList.add("_overlay_dismisser");
    elementDismisser.innerHTML = `<i class="fas fa-times"></i>`; // Font Awesome
    elementDismisser.addEventListener("click", () => {
      if (removeOnDismiss) {
        overlay.remove();
      } else {
        overlay.classList.add("_hide");
      }
    });
    elementContainer.appendChild(elementDismisser);
  }

  overlay.appendChild(elementContainer);

  if (renderNow) {
    document.body.appendChild(overlay);
  }

  return overlay;
}
