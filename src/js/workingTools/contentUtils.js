/**
 * Copies data (text, number, object, etc.) to the system clipboard.
 *
 * Converts non-string values (objects, arrays, numbers) to a string
 * using `JSON.stringify` before copying. Works with modern browsers
 * that support the `navigator.clipboard` API.
 *
 * @param {*} data - The data to copy to the clipboard. Objects and arrays are serialized.
 * @returns {Promise<boolean>} - Resolves to `true` if the copy succeeded, or `false` if it failed.
 *
 * @example
 * // Example 1: Copy a simple string
 * const success = await copyToClipboard("Hello world");
 * if (success) console.log("Copied!");
 *
 * // Example 2: Copy an object
 * const data = { id: 1, name: "John" };
 * const copied = await copyToClipboard(data);
 * console.log(copied ? "Data copied!" : "Copy failed!");
 */
export async function copyToClipboard(data) {
    try {
        const textToCopy = typeof data === 'string'
            ? data
            : JSON.stringify(data, null, 2);

        await navigator.clipboard.writeText(textToCopy);
        return true;
    } catch (error) {
        console.error('Clipboard copy failed:', error);
        return false;
    }
}

/**
 * Sanitizes pasted HTML content, stripping all tags and attributes except
 * structural block elements (rendered as `<div>`) and `<br>` line breaks.
 *
 * ## What is preserved
 * - `<br>` — kept as-is.
 * - Block-level elements (`<div>`, `<p>`, `<h1>`–`<h6>`, `<li>`,
 *   `<blockquote>`, `<tr>`) — wrapped as `<div>…</div>` so paragraph
 *   boundaries survive without carrying over foreign attributes or styles.
 * - Plain text nodes — kept verbatim.
 *
 * ## What is stripped
 * - All inline tags (`<span>`, `<a>`, `<strong>`, `<em>`, etc.) — text
 *   content is preserved, tags are discarded.
 * - All HTML attributes on every element (class, style, id, data-*, …).
 * - `&nbsp;` entities — normalised to a regular space.
 * - Runs of two or more whitespace characters — collapsed to a single space.
 *
 * @param {string} clipboardData - Raw HTML string obtained from the clipboard event.
 * @returns {string} Sanitized markup containing only `<div>` and `<br>` tags.
 */
export function sanitizePastedContent(clipboardData) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = clipboardData;

    // Block-level elements whose line-break semantics we want to honour.
    // Each becomes a plain <div> wrapper — no attributes carried over.
    const BLOCK_TAGS = new Set([
        'div', 'p',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'li', 'blockquote', 'tr',
    ]);

    /**
     * Recursively walks a DOM node, returning sanitized HTML.
     *
     * @param {Node} node - The node to process.
     * @returns {string}
     */
    function walk(node) {
        let output = '';

        node.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                output += child.textContent;

            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const tag = child.nodeName.toLowerCase();

                if (tag === 'br') {
                    output += '<br>';
                } else if (BLOCK_TAGS.has(tag)) {
                    // Re-wrap as a clean <div> — attributes intentionally omitted
                    output += '<div>' + walk(child) + '</div>';
                } else {
                    // Inline or unknown element — discard the tag, keep the text
                    output += walk(child);
                }
            }
        });

        return output;
    }

    return walk(tempDiv)
        .replace(/&nbsp;/g, ' ')   // convert non-breaking spaces to regular spaces
        .replace(/\s{2,}/g, ' ')   // collapse repeated whitespace
        .trim();
}


/**
 * Global paste handler using event delegation.
 *
 * This listener intercepts paste events anywhere in the document and
 * processes them only when the paste target is inside an element with
 * the `.sanitizePastedContent` class.
 *
 * ## Behaviour
 * - Prevents the browser's default paste action.
 * - Retrieves clipboard content (HTML preferred, plain text fallback).
 * - Passes the content through `sanitizePastedContent()` to strip
 *   unwanted tags, attributes, and formatting.
 * - Inserts the cleaned markup at the current cursor position using
 *   the Selection and Range APIs.
 *
 * ## Why event delegation?
 * Attaching the listener to `document` ensures that dynamically created
 * editors or nested editable elements automatically inherit the same
 * paste sanitisation behaviour without needing individual listeners.
 *
 * @param {ClipboardEvent} event - The paste event fired by the browser.
 */
document.addEventListener("paste", function (event) {

    /**
     * Locate the closest editor element that requires paste sanitization.
     * If the paste occurs outside such an element, the handler exits and
     * the browser performs the default paste.
     */
    const CONTENT_EDITOR = event.target.closest(".sanitizePastedContent");

    if (CONTENT_EDITOR) {
        // Prevent the browser from inserting the raw clipboard content
        event.preventDefault();

        /**
         * Retrieve clipboard data.
         * - Prefer HTML content when available.
         * - Fallback to plain text if HTML is absent.
         */
        const clipboardData = event.clipboardData || window.clipboardData;
        const pastedData = clipboardData.getData("text/html") || clipboardData.getData("text/plain");

        // Sanitize pasted content
        const sanitizedContent = sanitizePastedContent(pastedData);

        /**
         * Insert sanitized content using Selection and Range APIs.
         * This allows precise insertion at the current cursor location
         * inside the editable area.
         */
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        // Remove any currently selected content before inserting new content
        range.deleteContents();

        /**
         * Use a DocumentFragment to safely and efficiently insert nodes.
         * This avoids repeated DOM reflows and ensures valid node insertion.
         */
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = sanitizedContent;

        let node;
        while ((node = tempDiv.firstChild)) {
            fragment.appendChild(node);
        }

        // Insert the sanitized fragment into the document
        range.insertNode(fragment);

        /**
         * Move the caret to the end of the inserted content so the user
         * can continue typing naturally after the paste operation.
         */
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

});