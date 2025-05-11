const fontAwesomeSource = 'https://kit.fontawesome.com/fe193a5286.js';

/**
 * Dynamically loads the Font Awesome script into the current document.
 * 
 * This function ensures that Font Awesome is added only once unless enforcement is explicitly requested.
 * It also respects an optional meta tag in the document head to disable loading:
 * 
 * ```html
 * <meta name="lcsFontAwesome" content="disable">
 * ```
 * or content can be "false" or "off".
 *
 * @param {boolean} [enforce=false] - If `true`, removes any existing Font Awesome script and forcibly reloads it,
 *                                    unless explicitly disabled via meta tag.
 * 
 * @returns {Promise<boolean>} Resolves to `true` when Font Awesome is successfully loaded. Rejects if loading fails,
 *                             or if enforcement is blocked by meta settings.
 *
 * @throws {Error} If `enforce` is true but loading is disabled via meta tag.
 * 
 * @example
 * // Using async/await:
 * try {
 *   await initializeFontAwesome();
 *   console.log('Font Awesome loaded!');
 * } catch (err) {
 *   console.error(err);
 * }
 * 
 * @example
 * // Using .then/.catch:
 * initializeFontAwesome(true)
 *   .then(() => console.log('Font Awesome forcibly loaded.'))
 *   .catch(err => console.error(err));
 */
export async function initializeFontAwesome(enforce = false) {
    return new Promise((resolve, reject) => {
        const metaSetting = document.querySelector('meta[name="lcsFontAwesome"]');
        const shouldExcludeThisFA = () => {
            return metaSetting &&
                ['disable', 'false', 'off'].includes(metaSetting.content?.trim().toLowerCase());
        };

        const existingFontAwesome = document.querySelector(`script[src="${fontAwesomeSource}"]`);

        // Block enforcement if explicitly disabled
        if (enforce && shouldExcludeThisFA()) {
            reject(new Error("Could not enforce the initialization of Font Awesome because it's set to be excluded from your document."));
            return;
        }

        // Remove existing script if enforcing
        if (enforce && existingFontAwesome) {
            existingFontAwesome.remove();
        }

        // Skip loading if already present and not enforcing
        if (existingFontAwesome && !enforce) {
            resolve(true);
            return;
        }

        // Skip if disabled and not enforcing
        if (!enforce && shouldExcludeThisFA()) {
            resolve(false);
            return;
        }

        // Proceed to load Font Awesome
        const faScript = document.createElement('script');
        faScript.src = fontAwesomeSource;
        faScript.crossOrigin = 'anonymous';
        faScript.async = true;

        faScript.onload = () => {
            resolve(true);
        };

        faScript.onerror = () => {
            reject(new Error("Failed to load Font Awesome."));
        };

        document.head.appendChild(faScript);
    });
}