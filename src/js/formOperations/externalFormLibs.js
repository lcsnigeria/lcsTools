import { hooks } from "../hooks.js";

/**
 * Reads the <meta> tag named "lcs_external_libs_cdn" to determine which CDN provider
 * to use for loading external libraries. If not present, all configured providers
 * will be loaded.
 *
 * @constant {HTMLMetaElement|null}
 */
const metaConfig = document.querySelector('meta[name="lcs_external_libs_cdn"]');

/**
 * The provider key (e.g. "choices") extracted from the meta tag content.
 * If the meta tag is absent or empty, this will be null.
 *
 * @constant {string|null}
 */
const metaConfigProvider = metaConfig ? metaConfig.content.trim() : null;

/**
 * Configuration object mapping provider keys to their resource URLs and initialization callbacks.
 * 
 * Structure:
 * {
 *   [providerKey]: {
 *     js:    string[],          // Array of JavaScript URLs to load
 *     css:   string[],          // Array of CSS URLs to load
 *     init_callback: Function   // Callback to invoke after scripts have loaded
 *   },
 *   // ...additional providers can be added here
 * }
 *
 * @type {Object.<string, {js: string[], css: string[], init_callback: Function}>}
 */
const externalLibsCDN = {
  choices: {
    js: [
      'https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js'
    ],
    css: [
      'https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css'
    ]
  },
  
};

let externalLibsCDNLoaded = false;
let externalLibsCDNProviders = [];

/**
 * Loads external library assets (CSS & JS) based on the configuration in externalLibsCDN.
 * 
 * - If metaConfigProvider is specified, only that provider’s assets are loaded.
 * - If metaConfigProvider is null, assets for all providers listed in externalLibsCDN are loaded.
 * - CSS files are appended to <head> immediately.
 * - JS files are appended to <head> with defer, and a Promise is tracked for each.
 * - Once all JS Promises resolve, each provider’s init_callback is invoked (if provided).
 *
 * @throws {Error} If any script fails to load, an error is logged but execution continues.
 */
async function loadExternalLibsCDN() {
  // Determine which providers to load
  const providers = metaConfigProvider
    ? { [metaConfigProvider]: externalLibsCDN[metaConfigProvider] }
    : externalLibsCDN;

  /** @type {Promise<string>[]} Promises for each JS file load. */
  const promises = [];

  // Iterate each provider’s resources
  for (const providerKey in providers) {
    const resources = providers[providerKey];
    externalLibsCDNProviders.push(providerKey);

    // --- Load CSS files ---
    if (Array.isArray(resources.css)) {
      resources.css.forEach(cssUrl => {
        if (!document.querySelector(`link[href="${cssUrl}"]`)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = cssUrl;
          document.head.prepend(link);
        }
      });
    }

    // --- Load JS files ---
    if (Array.isArray(resources.js)) {
      resources.js.forEach(jsUrl => {
        const promise = new Promise((resolve, reject) => {
          if (!document.querySelector(`script[src="${jsUrl}"]`)) {
            const script = document.createElement('script');
            script.src = jsUrl;
            script.defer = true;
            script.onload = () => resolve(jsUrl);
            script.onerror = () => reject(new Error(`Failed to load script: ${jsUrl}`));
            document.head.prepend(script);
          }
        });
        promises.push(promise);
      });
    }
  }

  // Once all JS assets are loaded, invoke each provider’s init_callback if present
  Promise.all(promises)
    .then(() => {
      externalLibsCDNLoaded = true;
      console.info('All external libraries loaded successfully.');
      for (const providerKey in providers) {
        const resources = providers[providerKey];
        if (typeof resources.init_callback === 'function') {
          try {
            resources.init_callback();
          } catch (e) {
            console.error(`Error in init_callback for provider "${providerKey}":`, e);
          }
        }
      }
    })
    .catch(error => {
      console.error('Error loading external libraries:', error);
    });
}

let loadedChoicesElements = [];
/**
 * Builds a configuration object for the Choices.js library based on dataset attributes.
 * The configuration object defines various behaviors and visual aspects of the Choices.js 
 * instance, such as item selection, search functionality, rendering options, and more.
 * 
 * This function reads specific data attributes from the element's `dataset` and transforms 
 * them into a usable configuration format for the Choices.js library. It allows for easy 
 * customization of the select element's behavior based on the dataset values, providing 
 * flexibility and control over how choices and items are rendered and interacted with.
 * 
 * This config object can be passed directly to a new Choices.js instance to apply the 
 * desired settings to the element.
 */
export async function loadChoicesLibs() {
  await loadExternalLibsCDN();

  if (externalLibsCDNLoaded && externalLibsCDNProviders.includes('choices')) {
    const allSelectFormElements = document.querySelectorAll('.lcsForm ._select_by_choices, .lcsForm ._input_by_choices');
    
    allSelectFormElements.forEach(selectElement => {
      const selectElementTagName = selectElement.tagName.toLowerCase();

      if (!['select', 'input'].includes(selectElementTagName)) {
        console.error(`Invalid element type: Expected 'select' or 'input', but got '${selectElementTagName}'.`);
        return false;
      }

      if (selectElementTagName === 'input' && selectElement.type !== 'text') {
        console.error(`Invalid input type: Expected 'text', but got '${selectElement.type}'.`);
        return false;
      }

      if (selectElement.id) {
        const selectElementID = selectElement.id;
        const dataset = selectElement.dataset;

        // Start with the common config, leaving out optional settings
        const config = {
          silent: dataset.silent === 'true', // Whether the Choices instance operates in silent mode, triggering no events (default: false)
          renderChoiceLimit: dataset.render_choice_limit ? parseInt(dataset.render_choice_limit, 10) : -1, // Maximum number of choices to render (default: -1 for no limit)
          maxItemCount: dataset.max_item_count ? parseInt(dataset.max_item_count, 10) : -1, // Maximum number of items allowed in the selection (default: -1 for no limit)
          addItems: dataset.add_items !== 'false', // If new items can be added (default: true)
          removeItems: dataset.remove_items !== 'false', // If items can be removed (default: true)
          removeItemButton: dataset.remove_item_button === 'true', // If the removal button for items is enabled (default: false)
          editItems: dataset.edit_items === 'true', // If items can be edited (default: false)
          duplicateItemsAllowed: dataset.duplicate_items_allowed !== 'false', // If duplicates are allowed in the selection (default: true)
          delimiter: dataset.delimiter || ',', // Delimiter used when splitting item values (default: ',')
          paste: dataset.paste !== 'false', // Whether pasting items is allowed (default: true)
          searchEnabled: dataset.search_enabled === 'true', // If the search feature is enabled (default: false)
          searchChoices: dataset.search_choices !== 'false', // Whether choices are searchable (default: true)
          searchFloor: dataset.search_floor ? parseInt(dataset.search_floor, 10) : 1, // Minimum number of characters before triggering search (default: 1)
          searchResultLimit: dataset.search_result_limit ? parseInt(dataset.search_result_limit, 10) : 4, // Limit to the number of search results (default: 4)
          position: dataset.position || 'auto', // The position of the dropdown relative to the input (default: 'auto')
          resetScrollPosition: dataset.reset_scroll_position !== 'false', // Whether to reset the scroll position after each selection (default: true)
          shouldSort: dataset.should_sort !== 'false', // If items should be sorted (default: true)
          shouldSortItems: dataset.should_sort_items === 'true', // If selected items should be sorted (default: false)
          placeholder: dataset.placeholder !== 'false', // Whether to display a placeholder (default: true)
          placeholderValue: dataset.placeholder_value || '', // The placeholder text (default: '')
          searchPlaceholderValue: dataset.search_placeholder_value || '', // The placeholder text in the search input (default: '')
          prependValue: dataset.prepend_value || '', // Value to prepend to the selected item (default: '')
          appendValue: dataset.append_value || '', // Value to append to the selected item (default: '')
          renderSelectedChoices: dataset.render_selected_choices || 'auto', // How selected choices should be rendered (default: 'auto')
          loadingText: dataset.loading_text || 'Loading...', // Text displayed when options are being loaded (default: 'Loading...')
          noResultsText: dataset.no_results_text || 'No results found', // Text displayed when no results are found (default: 'No results found')
          noChoicesText: dataset.no_choices_text || 'No choices to choose from', // Text displayed when there are no choices available (default: 'No choices to choose from')
          itemSelectText: dataset.item_select_text || '', // Text displayed when an item is selected (default: '')
          allowHTML: dataset.allow_html === 'true', // Whether HTML is allowed in choices (default: false)
        };                

        // Add items and choices only if the dataset values are provided
        if (dataset.items) config.items = dataset.items.split(',').map(item => item.trim());
        if (dataset.choices) config.choices = dataset.choices.split(',').map(choice => choice.trim());
        if (dataset.search_fields) config.searchFields = dataset.search_fields.split(',').map(field => field.trim());
        if (dataset.fuse_options) {
          config.fuseOptions = dataset.fuse_options.split(',').reduce((acc, val) => {
            const [key, value] = val.split(':').map(v => v.trim());
            acc[key] = value;
            return acc;
          }, {});
        }
        if (dataset.class_names) {
          config.classNames = dataset.class_names.split(',').reduce((acc, val) => {
            const [key, value] = val.split(':').map(v => v.trim());
            acc[key] = value;
            return acc;
          }, {});
        }

        // If data-options is present, dynamically populate the select with <option>
        if (dataset.options) {
          const optionsArray = dataset.options.split(',').map(opt => opt.trim()).filter(Boolean);

          // Avoid duplication on rerun
          if (!selectElement.dataset._choicesPopulated) {
            optionsArray.forEach(option => {
              const opt = document.createElement('option');
              opt.value = option;
              opt.textContent = option;
              selectElement.appendChild(opt);
            });
            selectElement.dataset._choicesPopulated = 'true'; // mark as populated
          }
        }

        if (!loadedChoicesElements.includes(`#${selectElementID}`)) {
          new Choices(`#${selectElementID}`, config);
        }
        loadedChoicesElements.push(`#${selectElementID}`);
      }
    });
  }

  return true;
}

/**
 * Initialization routine for the Choices.js library.
 * This function is called automatically after Choices.js is loaded.
 * It attempts to load the library multiple times in case of failure.
 *
 * @example
 * // After loadExternalLibsCDN() completes, this will run automatically:
 * // Initializes the Choices.js dropdown for work mode selection.
 */
async function initializeChoices() {
  console.info('Initializing Choices.js...');

  try {
    // Attempt initial load
    await loadChoicesLibs();
  } catch (error) {
    console.warn('Initial Choices.js load failed, will retry...', error);
  }

  let repeatChoiceLoadCount = 0;

  const retryLoad = async () => {
    try {
      await loadChoicesLibs();
    } catch (error) {
      console.warn(`Retry #${repeatChoiceLoadCount + 1} failed:`, error);
    }

    repeatChoiceLoadCount++;
    if (repeatChoiceLoadCount >= 3) {
      clearInterval(repeatChoiceLoad);
    }
  };

  const repeatChoiceLoad = setInterval(retryLoad, 200);
}

// Kick off the dynamic loading process immediately
(async() => {
    await loadExternalLibsCDN();
    document.addEventListener('DOMContentLoaded', initializeChoices);
    hooks.addAction('lcsAjaxRequest', loadChoicesLibs);
})();