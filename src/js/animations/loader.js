import { isColorValue, getColorHex } from "../workingTools/colorOps.js";
import { isDataString } from "../workingTools/dataTypes.js";
import { isHTMLSelector } from "../workingTools/elementOps/ops.js";
import { changeElementTagName } from "../workingTools/elementOps/ops.js";

/**
 * lcsLoader is a configurable loader/spinner utility for displaying loading animations in web applications.
 *
 * This class supports multiple loader styles (spinner, progress bar, pulse, etc.), sizes, and colors.
 * It can render loaders into any container element or selector, and provides methods to update style, size, and color dynamically.
 *
 * ### Features
 * - Multiple loader styles: spinner, spinner-fade, spinner-fade-smooth, spinner-gear, pulse, progress, progress-infinity, progress-percent.
 * - Configurable size: large, normal, small, mini.
 * - Customizable color (CSS color formats supported).
 * - Flexible container: accepts HTMLElement or CSS selector.
 * - Dynamic updates: change style/size of all rendered loaders.
 * - Progress tracking for XHR requests.
 * - Validates all configuration options and throws descriptive errors.
 *
 * ### Example Usage
 * ```js
 * // Create a loader instance with default options
 * const loader = new lcsLoader();
 * 
 * // Start the loader in the body
 * loader.start();
 * 
 * // Change loader style and size dynamically
 * loader.changeStyle('pulse');
 * loader.changeSize('large');
 * 
 * // Set a custom color
 * loader.setColor('#00FFAA');
 * 
 * // Render loader in a specific container
 * loader.setContainer('#myModal');
 * loader.start();
 * ```
 * 
 * @class lcsLoader
 * @classdesc Configurable loader/spinner utility for web applications.
 *
 * @param {string} [style='spinner'] - Loader style ('spinner', 'spinner-fade', 'spinner-fade-smooth', 'spinner-gear', 'pulse', 'progress', 'progress-infinity', 'progress-percent').
 * @param {string} [size='normal'] - Loader size ('large', 'normal', 'small', 'mini').
 * @param {string} [color='#FC1436'] - Loader color (CSS color value).
 * @param {?HTMLElement|string} [container=null] - Container element or selector for rendering the loader.
 * @param {string} [containerBG='#ffffff'] - Background color of the loader container.
 * @param {string} [containerPosition='fixed'] - CSS position property for the loader container ('fixed' or 'absolute').
 *
 * @throws {Error} If any configuration option is invalid.
 *
 * @method start
 * @description Renders the loader in the configured container with current or overridden options.
 * @param {string} [style] - Loader style.
 * @param {string} [size] - Loader size.
 * @param {string} [color] - Loader color.
 * @param {?HTMLElement|string} [container] - Container element or selector.
 * @param {string} [containerBG] - Loader container background color.
 * @param {string} [containerPosition] - Loader container position.
 * @returns {HTMLElement} The loader container element.
 *
 * @method setStyle
 * @description Sets the loader style. Throws if invalid.
 * @param {string} style - Loader style.
 * @throws {Error} If style is invalid.
 *
 * @method setSize
 * @description Sets the loader size. Throws if invalid.
 * @param {string} size - Loader size.
 * @throws {Error} If size is invalid.
 *
 * @method setColor
 * @description Sets the loader color. Throws if invalid.
 * @param {string} color - Loader color.
 * @throws {Error} If color is invalid.
 *
 * @method setContainer
 * @description Sets the loader container. Throws if invalid.
 * @param {HTMLElement|string} container - Container element or selector.
 * @throws {Error} If container is invalid.
 *
 * @method setRequestInstance
 * @description Sets the XMLHttpRequest instance and progress direction for progress tracking.
 * @param {XMLHttpRequest} XHR - The XMLHttpRequest instance to track.
 * @param {string} [progressToTrack='download'] - Progress type to track: 'download' or 'upload'.
 * @throws {Error} If loader style is not 'progress-request', XHR is invalid, or tracking type is invalid.
 *
 * @method changeStyle
 * @description Updates the style of all active loaders in the DOM or within a specific container.
 * @param {string} style - Loader style.
 * @param {HTMLElement|string|null} [container] - Container element or selector.
 * @throws {Error} If style is invalid.
 *
 * @method changeSize
 * @description Updates the size of all active loaders in the DOM or within a specific container.
 * @param {string} size - Loader size.
 * @param {HTMLElement|string|null} [container] - Container element or selector.
 * @throws {Error} If size is invalid.
 *
 * @method clearLoader
 * @description Removes all loader elements from the DOM or from a specific container.
 * @param {HTMLElement|string|null} [container] - Container element or selector.
 */
class lcsLoader 
{
    #loaderStyle;
    #loaderSize;
    #loaderColor;
    #loaderContainer;
    #loaderContainerBG;
    #loaderContainerPosition;

    #loader;

    #XHR;
    #XHR_TrackingProgress;

    /**
     * Creates a new loader instance with the specified configuration.
     *
     * @param {string} [style='spinner'] - The style of the loader (e.g., 'spinner', 'progress').
     * @param {string} [size='normal'] - The size of the loader (e.g., 'small', 'normal', 'large').
     * @param {string} [color='#FC1436'] - The color of the loader in hex format.
     * @param {?HTMLElement} [container=null] - The container element to render the loader in. If null, a new container is created.
     * @param {string} [containerBG='#ffffff'] - The background color of the loader container.
     * @param {string} [containerPosition='fixed'] - The CSS position property for the loader container.
     */
    constructor(style = 'spinner', size = 'normal', color = '#FC1436', container = null, containerBG = '#ffffff', containerPosition = 'fixed') 
    {
        this.#loaderStyle = style;
        this.#loaderSize = size;
        this.#loaderColor = color;
        this.#loaderContainer = container;
        this.#loaderContainerBG = containerBG;
        this.#loaderContainerPosition = containerPosition;
    }

    /**
     * Starts and renders the loader animation in the specified container.
     *
     * This method initializes the loader's visual representation based on the current or explicitly
     * provided configuration. It dynamically creates and inserts the loader's HTML structure, applies
     * style classes, sets CSS variables for color theming, and attaches the loader to a valid container
     * in the DOM.
     *
     * Supported loader styles include spinners and progress bars. The loader can be positioned using
     * either `absolute` or `fixed` layout depending on the configuration.
     *
     * @param {string} [style=this.#loaderStyle] - The visual style of the loader.
     *        Acceptable values are defined in `#validLoaderStyles()` (e.g., 'spinner', 'pulse', 'progress').
     *
     * @param {string} [size=this.#loaderSize] - The size of the loader.
     *        Acceptable values include 'mini', 'small', 'normal', and 'large'.
     *
     * @param {string} [color=this.#loaderColor] - The color of the loader, in any valid CSS color format
     *        (e.g., named color, hex, rgb(a), hsl(a)). Used to set `--loaderColor` and `--loaderColorFade`.
     *
     * @param {HTMLElement|string|null} [container=this.#loaderContainer] - A DOM element or selector
     *        indicating where to mount the loader. If invalid or not found, it defaults to `document.body`.
     *
     * @param {string} [containerBG=this.#loaderContainerBG] - The background color of the loader's
     *        container (e.g., to dim the background or overlay content).
     *
     * @param {string} [containerPosition=this.#loaderContainerPosition] - The CSS `position` property
     *        for the loader container. Should be either 'fixed' or 'absolute' for proper overlay behavior.
     *
     * @returns {HTMLElement} The created loader container element that wraps the entire loader structure.
     *
     * @throws {Error} If any configuration property is invalid (e.g., unsupported style, invalid size or color,
     *         or an unresolvable container selector).
     *
     * @example
     * loader.start('spinner', 'small', '#3498db', '#modalContent', 'rgba(0,0,0,0.1)', 'absolute');
     */
    start(
        style = this.#loaderStyle, 
        size = this.#loaderSize, 
        color = this.#loaderColor, 
        container = this.#loaderContainer,
        containerBG = this.#loaderContainerBG,
        containerPosition = this.#loaderContainerPosition
    ) {
        // Apply or update the loader configuration
        this.#loaderStyle = style;
        this.#loaderSize = size;
        this.#loaderColor = color;
        this.#loaderContainer = container;
        this.#loaderContainerBG = containerBG;
        this.#loaderContainerPosition = containerPosition;

        // Validate all configuration properties before proceeding
        this.#validateConfigs();

        // Create the outer container for the loader
        const loaderContainer = document.createElement("div");
        loaderContainer.classList.add('lcsLoader', '_loader_container');
        loaderContainer.style.backgroundColor = this.#loaderContainerBG;
        loaderContainer.style.position = this.#loaderContainerPosition;

        // Create a wrapper for centering and positioning the actual loader
        const loaderWrapper = document.createElement("div");
        loaderWrapper.classList.add('_loader_wrapper');
        loaderWrapper.style.position = 'relative';

        // Create the loader element itself, based on style
        const loader = document.createElement(`${ isProgressiveStyle() ? 'progress' : 'div' }`);
        loader.className = this.#loaderClassNames();
        if (this.#isProgressiveStyle()) loader.max = '100';
        if (this.#isProgressiveStyle()) loader.value = '0';

        // Set global CSS variables for loader color theming
        document.documentElement.style.setProperty('--loaderColor', this.#loaderColor);
        document.documentElement.style.setProperty('--loaderColorFade', `${this.#loaderColor}22`);

        // Save reference to loader DOM element (if needed later)
        this.#loader = loader;

        // Append loader into wrapper, then wrapper into container
        loaderWrapper.appendChild(loader);
        loaderContainer.appendChild(loaderWrapper);

        // Append loader container into the target parent container
        this.#loaderContainer.style.position = 'relative';
        this.#loaderContainer.appendChild(loaderContainer);

        // Start loading progress according to XHR if style is progress-request
        if (this.#loaderStyle === 'progress-request') {
            this.#startRequestProgress();
        }

        // Return the full loader container element
        return loaderContainer;
    }

    /**
     * Attaches the progress event handler to the previously stored XHR instance.
     *
     * You must call `setRequestInstance()` before calling this.
     *
     * @throws {Error} If loader is a not progress element, or if XHR/progress type has not been set or is invalid.
     */
    #startRequestProgress() {
        if (!(this.#loader instanceof HTMLProgressElement)) {
            throw new Error(`Loader must be a <progress> element to display request progress.`);
        }

        if (!this.#XHR || !this.#XHR_TrackingProgress) {
            throw new Error(`Missing XHR instance or progress tracking type. Call setRequestInstance() first.`);
        }

        const handleProgress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                this.#loader.value = Math.round(percentComplete);
                this.#loader.max = 100;
            } else {
                // Indeterminate fallback if length is not computable
                this.#loader.removeAttribute('max');
                this.#loader.value = event.loaded || 0;
            }
        };

        if (this.#XHR_TrackingProgress === 'upload') {
            this.#XHR.upload.onprogress = handleProgress;
        } else {
            this.#XHR.onprogress = handleProgress;
        }
    }

    /**
     * Generates a string of CSS class names for the loader element based on its style and size.
     * The class names are formatted by replacing hyphens in the style with underscores,
     * and all class names are converted to lowercase.
     *
     * @private
     * @returns {string} The generated loader class names.
     */
    #loaderClassNames() {
        const styleClass = '_' + this.#loaderStyle.replace(/[\-]+/g, '_').toLowerCase();
        const sizeClass = '_' + this.#loaderSize.toLowerCase();
        return ['_loader', styleClass, sizeClass].join(' ');
    }

    /**
     * Validates the configuration properties for the loader instance.
     * 
     * This method checks the following:
     * - Loader style: Ensures the style is one of the valid loader styles.
     * - Loader size: Ensures the size is one of the valid loader sizes.
     * - Loader color: Converts and validates the color, and sets CSS variables if valid.
     * - Loader container: Ensures the container is a valid HTMLElement or a selector that resolves to one.
     * - Loader container background: Validates the background color value.
     * - Loader container position: Ensures the position is either 'fixed' or 'absolute'.
     * 
     * @private
     * @throws {Error} If any configuration property is invalid.
     */
    #validateConfigs() {
        // Validate style
        if (!this.#validLoaderStyles().includes(this.#loaderStyle)) {
            throw new Error(`Invalid loader style: "${this.#loaderStyle}". Valid styles are: ${this.#validLoaderStyles().join(', ')}.`);
        }

        // Validate size
        if (!this.#validLoaderSizes().includes(this.#loaderSize)) {
            throw new Error(`Invalid loader size: "${this.#loaderSize}". Valid sizes are: ${this.#validLoaderSizes().join(', ')}.`);
        }

        // Validate color
        this.#loaderColor = getColorHex(this.#loaderColor);
        if (isColorValue(this.#loaderColor)) {
            document.documentElement.style.setProperty('--loaderColor', this.#loaderColor);
            document.documentElement.style.setProperty('--loaderColorFade', `${this.#loaderColor}22`);
        } else {
            throw new Error(`Invalid loader color: "${this.#loaderColor}". Please provide a valid CSS color value (color name, hex, rgb(a), or hls(a)).`);
        }

        // Validate container
        if (!(this.#loaderContainer instanceof HTMLElement)) {
            this.#loaderContainer = isHTMLSelector(this.#loaderContainer) && document.querySelector(`${this.#loaderContainer}`) ? 
            document.querySelector(`${this.#loaderContainer}`) : document.body;
        }
        if (!(this.#loaderContainer instanceof HTMLElement)) { // Still not a valid html at this point, throw error
            throw new Error("Loader container must be a valid HTMLElement or a valid selector that resolves to one.");
        }

        // Validate container BG
        if (!isColorValue(this.#loaderContainerBG)) {
            throw new Error(`Invalid loader container background-color: "${this.#loaderContainerBG}". Please provide a valid CSS color value (color name, hex, rgb(a), or hls(a)).`);
        }

        // Validate LC Position
        if (isDataString(this.#loaderContainerPosition) && ['fixed', 'absolute'].includes(this.#loaderContainerPosition.toLowerCase())) {
            this.#loaderContainerPosition = this.#loaderContainerPosition.toLowerCase();
        } else {
            throw new Error(`Invalid loader container position: "${this.#loaderContainerPosition}". Valid positions are: fixed, absolute.`);
        }

    }

    /**
     * Determine if the style is a progress-type loader
     * @returns 
     */
    #isProgressiveStyle(style = null) {
        style = style ? style : this.#loaderStyle;
        return ['progress', 'progress-request'].includes(style);
    }

    /**
     * Set the visual style of the loader.
     *
     * Validates the provided style against a list of allowed loader styles.
     * If the style is invalid, an error is thrown with a list of accepted styles.
     *
     * @param {string} style - The loader style to use (e.g., 'spinner', 'spinner-fade', 'progress').
     * @throws {Error} If the given style is not valid.
     */
    setStyle(style) {
        if (!this.#validLoaderStyles().includes(style)) {
            throw new Error(`Invalid loader style: "${style}". Valid styles are: ${this.#validLoaderStyles().join(', ')}.`);
        }
        this.#loaderStyle = style;
    }

    /**
     * Set the size of the loader.
     *
     * Validates the provided size against a list of allowed loader sizes.
     * If the size is invalid, an error is thrown with a list of accepted sizes.
     *
     * @param {string} size - The loader size to use (e.g., 'large', 'normal', 'small').
     * @throws {Error} If the given size is not valid.
     */
    setSize(size) {
        if (!this.#validLoaderSizes().includes(size)) {
            throw new Error(`Invalid loader size: "${size}". Valid sizes are: ${this.#validLoaderSizes().join(', ')}.`);
        }
        this.#loaderSize = size;
    } 

    /**
     * Set the color of the loader.
     *
     * Accepts any valid CSS color format (e.g., color name, hex, rgb(a), hsl(a)).
     * The primary color and a faded variant are applied to CSS custom properties.
     *
     * @param {string} color - The loader color to apply.
     * @throws {Error} If the color is not valid.
     */
    setColor(color) {
        color = getColorHex(color);
        if (!isColorValue(color)) {
            throw new Error(`Invalid loader color: "${color}". Please provide a valid CSS color value (color name, hex, rgb(a), or hls(a)).`);
        }
        this.#loaderColor = color;
        document.documentElement.style.setProperty('--loaderColor', this.#loaderColor);
        document.documentElement.style.setProperty('--loaderColorFade', `${this.#loaderColor}22`);
    }

    /**
     * Set the container element where the loader will be rendered.
     *
     * Accepts either a DOM element or a valid CSS selector string that resolves to an element.
     * Defaults to `document.body` if the selector is invalid or no match is found.
     *
     * @param {HTMLElement|string} container - The container element or a valid selector.
     * @throws {Error} If the resolved container is not a valid HTMLElement.
     */
    setContainer(container) {
        let resolvedContainer = container;
        if (!(resolvedContainer instanceof HTMLElement)) {
            resolvedContainer = isHTMLSelector(resolvedContainer) && document.querySelector(`${resolvedContainer}`) ?
                document.querySelector(`${resolvedContainer}`) : document.body;
        }
        if (!(resolvedContainer instanceof HTMLElement)) {
            throw new Error("Loader container must be a valid HTMLElement or a valid selector that resolves to one.");
        }
        this.#loaderContainer = resolvedContainer;
    }

    /**
     * Validates and stores the XMLHttpRequest instance and progress direction to track.
     *
     * Does not start progress tracking yet — call `startRequestProgress()` separately.
     *
     * @param {XMLHttpRequest} XHR - The XMLHttpRequest instance to track.
     * @param {string} [progressToTrack='download'] - Progress type to track: 'download' or 'upload'.
     * @throws {Error} If loader style is invalid, XHR is not a valid object, or tracking type is invalid.
     */
    setRequestInstance(XHR, progressToTrack = 'download') {
        if (this.#loaderStyle !== 'progress-request') {
            throw new Error(`Current loader style must be 'progress-request' to use request tracking.`);
        }

        if (!(XHR instanceof XMLHttpRequest)) {
            throw new Error(`XHR must be a valid XMLHttpRequest instance.`);
        }

        const allowedTypes = ['download', 'upload'];
        if (!allowedTypes.includes(progressToTrack)) {
            throw new Error(`Invalid progressToTrack value: "${progressToTrack}". Expected 'download' or 'upload'.`);
        }

        this.#XHR = XHR;
        this.#XHR_TrackingProgress = progressToTrack;
    }

    /**
     * Updates the style of all active loader elements in the DOM, or those within a specific container.
     * Does not affect the instance's configuration, only the rendered loaders.
     * If no container is provided, all loaders in the document are updated.
     * 
     * @param {string} style - The new loader style to apply (must be a valid style).
     * @param {HTMLElement|string|null} container - Optional. The container element or selector to scope the update.
     * @throws {Error} If the style is invalid.
     */
    changeStyle(style, container = null) {
        if (!this.#validLoaderStyles().includes(style)) {
            throw new Error(`Invalid loader style: "${style}". Valid styles are: ${this.#validLoaderStyles().join(', ')}.`);
        }

        const styleClassName = '_' + style.replace(/[\-]+/g, '_');
        let targetContainer = container;

        // Resolve container to HTMLElement
        if (!(targetContainer instanceof HTMLElement)) {
            targetContainer = isHTMLSelector(targetContainer) && document.querySelector(`${targetContainer}`) ?
                document.querySelector(`${targetContainer}`) : document.body;
        }

        // Select all loader elements within the container
        const loaders = targetContainer.classList.contains('lcsLoader')
            ? targetContainer.querySelectorAll('._loader')
            : targetContainer.querySelectorAll('.lcsLoader ._loader');

        loaders.forEach(loaderEl => {
            const tgName = loaderEl.tagName.toLowerCase();
            // Remove all possible style classes
            this.#allStylesClassNames().forEach(styleClass => {
                loaderEl.classList.remove(styleClass);
            });
            // Add the new style class
            loaderEl.classList.add(styleClassName);
            if (this.#isProgressiveStyle(style)) {
                if (tgName !== 'progress') {
                    loaderEl.setAttribute('max', '100');
                    loaderEl.setAttribute('value', '10');
                    changeElementTagName(loaderEl, 'progress');
                }
            } else {
                if (tgName === 'progress') {
                    loaderEl.removeAttribute('max');
                    loaderEl.removeAttribute('value');
                    changeElementTagName(loaderEl, 'div');
                }
            }
        });
    }

    /**
     * Updates the size of all active loader elements in the DOM, or those within a specific container.
     * Does not affect the instance's configuration, only the rendered loaders.
     * If no container is provided, all loaders in the document are updated.
     * 
     * @param {string} size - The new loader size to apply (must be a valid size).
     * @param {HTMLElement|string|null} container - Optional. The container element or selector to scope the update.
     * @throws {Error} If the size is invalid.
     */
    changeSize(size, container = null) {
        if (!this.#validLoaderSizes().includes(size)) {
            throw new Error(`Invalid loader size: "${size}". Valid sizes are: ${this.#validLoaderSizes().join(', ')}.`);
        }

        const sizeClassName = '_' + size;
        let targetContainer = container;

        // Resolve container to HTMLElement
        if (!(targetContainer instanceof HTMLElement)) {
            targetContainer = isHTMLSelector(targetContainer) && document.querySelector(`${targetContainer}`) ?
                document.querySelector(`${targetContainer}`) : document.body;
        }

        // Select all loader elements within the container
        const loaders = targetContainer.classList.contains('lcsLoader')
            ? targetContainer.querySelectorAll('._loader')
            : targetContainer.querySelectorAll('.lcsLoader ._loader');

        loaders.forEach(loaderEl => {
            // Remove all possible size classes
            this.#validLoaderSizes().forEach(validSize => {
                loaderEl.classList.remove('_' + validSize);
            });
            // Add the new size class
            loaderEl.classList.add(sizeClassName);
        });
    }

    /**
     * Returns a list of valid loader style names.
     *
     * These style names correspond to the available visual effects for the loader,
     * and are used to validate input in methods like `setStyle`.
     *
     * @returns {string[]} An array of valid loader style identifiers.
     */
    #validLoaderStyles() {
        return [
            'spinner', 'spinner-fade', 'spinner-fade-smooth', 'spinner-gear',
            'pulse', 'progress', 'progress-infinity', 'progress-percent'
        ];
    }

    /**
     * Returns an array of class name suffixes corresponding to each valid loader style.
     *
     * Each returned item is prefixed with an underscore and hyphens are converted to underscores.
     * Useful when toggling or removing style-related class names on the DOM.
     *
     * @example
     * ['_spinner', '_spinner_fade', '_spinner_fade_smooth', ...]
     *
     * @returns {string[]} Array of normalized loader style class name suffixes.
     */
    #allStylesClassNames() {
        return this.#validLoaderStyles().map(
            style => '_' + style.replace(/[\-]+/g, '_')
        );
    }

    /**
     * Returns a list of valid loader sizes.
     *
     * These represent the predefined size categories that can be applied to the loader's appearance.
     *
     * @returns {string[]} An array of valid size labels: 'large', 'normal', 'small', and 'mini'.
     */
    #validLoaderSizes() {
        return [
            'large', 'normal', 'small', 'mini'
        ];
    }

    /**
     * Removes all loader elements with the class 'lcsLoader' from the specified container.
     *
     * @param {HTMLElement|string|boolean|null} [container=null] - The container from which to remove loader elements.
     *   - If `true`, uses `document.body` as the container.
     *   - If a string, treats it as a CSS selector to find the container.
     *   - If an HTMLElement, uses it directly.
     *   - If `null` or not provided, defaults to the internal loader container or `document.body`.
     *
     * @returns {void}
     *
     * @example
     * // Remove loaders from a specific container
     * clearLoader(document.getElementById('myContainer'));
     *
     * @example
     * // Remove loaders from the body
     * clearLoader(true);
     *
     * @example
     * // Remove loaders using a selector
     * clearLoader('#containerSelector');
     */
    clearLoader(container = null) {
        if (container === true) container = document.body;
        let targetContainer = container ?? this.#loaderContainer;
        
        // Resolve container to HTMLElement
        if (!(targetContainer instanceof HTMLElement)) {
            targetContainer = isHTMLSelector(targetContainer) && document.querySelector(`${targetContainer}`) ?
                document.querySelector(`${targetContainer}`) : document.body;
        }
        // Remove all loader containers within the target container
        const loaderContainers = targetContainer.classList.contains('lcsLoader')
            ? [targetContainer]
            : Array.from(targetContainer.querySelectorAll('.lcsLoader'));
        loaderContainers.forEach(el => el.remove());
    }
}

/**
 * A singleton instance of lcsLoader for easy use throughout the application.
 *
 * @module loader
 */
export const loader = new lcsLoader();
export default lcsLoader;