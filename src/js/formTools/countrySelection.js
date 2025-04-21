// Importing the CSS file for styling the country selection tool
import '../../css/formTools/countrySelection.css';

// Importing utility functions for string manipulation and code generation
import { capitalizeWords } from '../workingTools/stringOps.js';
import { filterArraySimilarItems } from '../workingTools/arrayOps.js';
import { generateCodes } from '../workingTools/credsAndCodes.js';

// Importing functions for interacting with the local database
import { getLocalDatabaseData, updateLocalDatabaseData } from '../dataStorage/localDatabase.js';

/**
 * Retrieves the local country database from local database.
 * @returns {Object} The parsed country database object.
 */
export async function getCountriesLocalDatabase () {
    let DB = await getLocalDatabaseData('lcsCountrySelectionLocalDataBase');
    if (!DB) {
        DB = JSON.stringify({});
        await updateLocalDatabaseData('lcsCountrySelectionLocalDataBase', DB);
    }
    return JSON.parse(DB);
};


/**
 * Stores one or more countries in the local database.
 * @param {string|string[]} Countries - A single country or array of countries to store.
 */
async function lcsStoreCountriesInLocalDatabase (Countries) {
    Countries = Array.isArray(Countries) ? Countries : [Countries];
    const countriesLocalDB = await getCountriesLocalDatabase();
    const storedCountries = Object.keys(countriesLocalDB);

    Countries.forEach(c => {
        if (!storedCountries.includes(c)) {
            countriesLocalDB[c] = {};
        }
    });

    await updateLocalDatabaseData('lcsCountrySelectionLocalDataBase', JSON.stringify(countriesLocalDB));
};

/**
 * Stores the official name of a country in the local database.
 *
 * @param {string} commonName - The common name of the country to store the official name for.
 * @param {string} officialName - The official name of the country.
 */
function lcsStoreCountryOfficialNameInLocalDatabase (commonName, officialName) {
    const countriesLocalDB = getCountriesLocalDatabase();

    if (!countriesLocalDB[commonName]) {
        countriesLocalDB[commonName] = {};
    }

    countriesLocalDB[commonName].officialName = officialName;

    updateLocalDatabaseData('lcsCountrySelectionLocalDataBase', JSON.stringify(countriesLocalDB));
};

/**
 * Stores one or more states for a country in the local database.
 * @param {string} Country - The country to store states for.
 * @param {string|string[]} States - A single state or array of states to store.
 */
async function lcsStoreStatesInLocalDatabase (Country, States) {
    States = Array.isArray(States) ? States : [States];
    const countriesLocalDB = await getCountriesLocalDatabase();

    if (!countriesLocalDB[Country]) {
        countriesLocalDB[Country] = {};
    }

    countriesLocalDB[Country].states = [...new Set([...(countriesLocalDB[Country].states || []), ...States])];

    await updateLocalDatabaseData('lcsCountrySelectionLocalDataBase', JSON.stringify(countriesLocalDB));
};

/**
 * Stores one or more cities for a state in a country in the local database.
 * @param {string} Country - The country to store cities for.
 * @param {string} State - The state to store cities for.
 * @param {string|string[]} Cities - A single city or array of cities to store.
 */
async function lcsStoreCitiesInLocalDatabase (Country, State, Cities) {
    Cities = Array.isArray(Cities) ? Cities : [Cities];
    const countriesLocalDB = await getCountriesLocalDatabase();

    if (!countriesLocalDB[Country]) {
        countriesLocalDB[Country] = {};
    }

    if (!countriesLocalDB[Country].cities) {
        countriesLocalDB[Country].cities = {};
    }

    if (!countriesLocalDB[Country].cities[State]) {
        countriesLocalDB[Country].cities[State] = [];
    }

    countriesLocalDB[Country].cities[State] = [...new Set([...(countriesLocalDB[Country].cities[State] || []), ...Cities])];

    await updateLocalDatabaseData('lcsCountrySelectionLocalDataBase', JSON.stringify(countriesLocalDB));
};

/**
 * Stores a flag URL for a country in the local database.
 * @param {string} Country - The country to store the flag for.
 * @param {string} FlagUrl - The URL of the country flag.
 */
async function lcsStoreCountryFlagInLocalDatabase (Country, FlagUrl) {
    const countriesLocalDB = await getCountriesLocalDatabase();

    if (!countriesLocalDB[Country]) {
        countriesLocalDB[Country] = {};
    }

    countriesLocalDB[Country].flag = FlagUrl;

    await updateLocalDatabaseData('lcsCountrySelectionLocalDataBase', JSON.stringify(countriesLocalDB));
};

/**
 * Stores a calling code for a country in the local database.
 * @param {string} Country - The country to store the calling code for.
 * @param {string} CallingCode - The calling code to store.
 */
async function lcsStoreCountryCallingCodeInLocalDatabase (Country, CallingCode) {
    const countriesLocalDB = await getCountriesLocalDatabase();

    if (!countriesLocalDB[Country]) {
        countriesLocalDB[Country] = {};
    }

    countriesLocalDB[Country].callingCode = CallingCode;

    await updateLocalDatabaseData('lcsCountrySelectionLocalDataBase', JSON.stringify(countriesLocalDB));
};

/**
 * Stores a currency code for a country in the local database.
 * @param {string} Country - The country to store the currency code for.
 * @param {string} CurrencyCode - The currency code to store.
 */
async function lcsStoreCountryCurrencyCodeInLocalDatabase (Country, CurrencyCode) {
    const countriesLocalDB = await getCountriesLocalDatabase();

    if (!countriesLocalDB[Country]) {
        countriesLocalDB[Country] = {};
    }

    countriesLocalDB[Country].currencyCode = CurrencyCode;

    await updateLocalDatabaseData('lcsCountrySelectionLocalDataBase', JSON.stringify(countriesLocalDB));
};

/**
 * Stores the ISO country code in the local database.
 *
 * @param {string} countryName - The name of the country to store the ISO code for.
 * @param {Object} isoCodes - An object containing the ISO codes (e.g., { alpha2: 'NG', alpha3: 'NGA' }).
 */
function lcsStoreCountryISOCodeInLocalDatabase(countryName, isoCodes) {
    const countriesLocalDB = getCountriesLocalDatabase();

    if (!countriesLocalDB[countryName]) {
        countriesLocalDB[countryName] = {};
    }

    countriesLocalDB[countryName].isoCodes = {
        ...countriesLocalDB[countryName].isoCodes,
        ...isoCodes
    };

    updateLocalDatabaseData('lcsCountrySelectionLocalDataBase', JSON.stringify(countriesLocalDB));
};

/**
 * Retrieves all countries from the local database.
 * @returns {string[]} Array of country names.
 */
function lcsGetCountriesFromLocalDatabase() {
    const countriesLocalDB = getCountriesLocalDatabase();
    return Object.keys(countriesLocalDB);
};

/**
 * Retrieves the official name of a country from the local database using its common name.
 *
 * @param {string} commonName - The common name of the country to retrieve the official name for.
 * @returns {string|null} The official name or null if not found.
 */
function lcsGetCountryOfficialNameFromLocalDatabase(commonName) {
    const countriesLocalDB = getCountriesLocalDatabase();
    return countriesLocalDB[commonName]?.officialName || null;
};

/**
 * Retrieves all states for a given country from the local database.
 * @param {string} Country - The country to retrieve states for.
 * @returns {string[]} Array of state names or empty array if none exist.
 */
function lcsGetStatesFromLocalDatabase(Country) {
    const countriesLocalDB = getCountriesLocalDatabase();
    return countriesLocalDB[Country]?.states || [];
};

/**
 * Retrieves all cities for a given state in a country from the local database.
 * @param {string} Country - The country to retrieve cities for.
 * @param {string} State - The state to retrieve cities for.
 * @returns {string[]} Array of city names or empty array if none exist.
 */
function lcsGetCitiesFromLocalDatabase(Country, State) {
    const countriesLocalDB = getCountriesLocalDatabase();
    return countriesLocalDB[Country]?.cities?.[State] || [];
};

/**
 * Retrieves the flag URL for a given country from the local database.
 * @param {string} Country - The country to retrieve the flag for.
 * @returns {string|null} The flag URL or null if not found.
 */
function lcsGetCountryFlagFromLocalDatabase(Country) {
    const countriesLocalDB = getCountriesLocalDatabase();
    return countriesLocalDB[Country]?.flag || null;
};

/**
 * Retrieves the calling code for a given country from the local database.
 * @param {string} Country - The country to retrieve the calling code for.
 * @returns {string|null} The calling code or null if not found.
 */
function lcsGetCountryCallingCodeFromLocalDatabase(Country) {
    const countriesLocalDB = getCountriesLocalDatabase();
    return countriesLocalDB[Country]?.callingCode || null;
};

/**
 * Retrieves the currency code for a given country from the local database.
 * @param {string} Country - The country to retrieve the currency code for.
 * @returns {string|null} The currency code or null if not found.
 */
function lcsGetCountryCurrencyCodeFromLocalDatabase(Country) {
    const countriesLocalDB = getCountriesLocalDatabase();
    return countriesLocalDB[Country]?.currencyCode || null;
};

/**
 * Retrieves the ISO country code from the local database.
 *
 * @param {string} countryName - The name of the country to retrieve the ISO code for.
 * @param {string} codeType - The type of ISO code to retrieve ('alpha2' or 'alpha3').
 * @returns {string|null} The ISO code or null if not found.
 */
function lcsGetCountryISOCodeFromLocalDatabase(countryName, codeType) {
    const countriesLocalDB = getCountriesLocalDatabase();
    return countriesLocalDB[countryName]?.isoCodes?.[codeType] || null;
};

/**
 * Displays a full-screen fixed light overlay with a spinner.
 *
 */
function lcsShowSpinnerOverlay(selectionContainer) {
    // Prevent multiple spinners
    if (selectionContainer.querySelector('._spinner_overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = '_spinner_overlay';
    overlay.style.cssText = `
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.8);
        z-index: 200;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: opacity 0.3s ease;
    `;

    const spinner = document.createElement('div');
    spinner.className = '_spinner_loader';
    spinner.style.cssText = `
        width: 20px;
        height: 20px;
        min-height: 20px;
        border: 3px solid #cccccc;
        border-top-color: #555555;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;

    overlay.appendChild(spinner);
    selectionContainer.appendChild(overlay);

    // Inject keyframes only once
    if (!document.querySelector('#_spinner_keyframes')) {
        const style = document.createElement('style');
        style.id = '_spinner_keyframes';
        style.textContent = `
            @keyframes spin {
                0%   { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Hides and removes the spinner overlay if present.
 */
function lcsHideSpinnerOverlay(selectionContainer) {
    const overlay = selectionContainer.querySelector('._spinner_overlay');
    if (overlay) {
        overlay.style.opacity = 0;
        setTimeout(() => overlay.remove(), 300);
    }
}

/**
 * Fetches all countries from the selected API provider or local database.
 *
 * @param {string} serviceProviderData - The selected API provider data.
 * @param {string[]} [neededCountries] - Optional list of countries to filter the results.
 * @returns {Promise<string[]>} A promise resolving to a list of capitalized country names.
 */
export async function getAllCountries (serviceProviderData, neededCountries = []) {
    return new Promise(async (resolve, reject) => {
        // Check local database first
        let LDB_items = lcsGetCountriesFromLocalDatabase();
        if (LDB_items.length > 0) {
            const considerNeeded = Array.isArray(neededCountries) && neededCountries.length > 0;
            if (considerNeeded) {
                LDB_items = filterArraySimilarItems(LDB_items, neededCountries, false, true);
            }
            resolve(LDB_items);
        }

        let serviceProvider = serviceProviderData.provider;

        // Use geoNames if provider is set to restCountries
        if (serviceProvider === 'restCountries') {
            serviceProvider = 'geoNames';
            serviceProviderData = {
                provider: serviceProvider,
                apiKey: 'lcsnigeria'
            };
        }

        let countriesResult = [];
        const countriesRequestData = {
            'countriesNow': {
                url: 'https://countriesnow.space/api/v0.1/countries/positions',
                data: {}
            },
            'countryStateCity': {
                url: 'https://api.countrystatecity.in/v1/countries',
                data: {
                    method: 'GET',
                    headers: { 'X-CSCAPI-KEY': serviceProviderData.apiKey }
                }
            },
            'geoNames': {
                url: 'https://secure.geonames.org/countryInfoJSON',
                data: {
                    method: 'GET',
                    query: { username: serviceProviderData.apiKey }
                }
            }
        };

        // Validate service provider
        if (!countriesRequestData[serviceProvider]) {
            return reject(new Error('Unsupported provider'));
        }

        try {
            const response = await lcsFetchCountrySelectionData(
                countriesRequestData[serviceProvider].url,
                countriesRequestData[serviceProvider].data
            );

            switch (serviceProvider) {
                case 'countriesNow':
                    countriesResult = response.data
                        .map(country => capitalizeWords(country.name))
                        .filter(Boolean);
                    break;
                case 'countryStateCity':
                    countriesResult = response
                        .map(country => capitalizeWords(country.name))
                        .filter(Boolean);
                    break;
                case 'geoNames':
                    countriesResult = (response.geonames || [])
                        .map(country => capitalizeWords(country.countryName))
                        .filter(Boolean);
                    break;
                default:
                    return reject(new Error('Failed to fetch countries or unsupported provider'));
            }

            // Store fetched countries in local database
            lcsStoreCountriesInLocalDatabase(countriesResult);

            const considerNeeded = Array.isArray(neededCountries) && neededCountries.length > 0;
            if (considerNeeded) {
                countriesResult = filterArraySimilarItems(countriesResult, neededCountries, false, true);
            }

            resolve(countriesResult);
        } catch (error) {
            reject(new Error(error.message || 'Failed to fetch countries'));
        }
    });
};

/**
 * Fetches the official name of a country using its common name from the selected API provider or local database.
 *
 * @param {Object} serviceProviderData - The selected API provider data.
 * @param {string} commonName - The common name of the country to find the official name for.
 * @returns {Promise<string|null>} A promise resolving to the official name or null if not found.
 */
export async function getCountryOfficialName (serviceProviderData, commonName) {
    // Check local database first
    const LDB_officialName = lcsGetCountryOfficialNameFromLocalDatabase(commonName);
    if (LDB_officialName) {
        return LDB_officialName;
    }

    let officialNameResult = null;
    let serviceProvider = serviceProviderData.provider;

    const officialNameRequestData = {
        'restCountries': {
            url: `https://restcountries.com/v3.1/name/${encodeURIComponent(commonName)}?fields=name`,
            data: {}
        },
        'geoNames': {
            url: 'https://secure.geonames.org/countryInfoJSON',
            data: {
                method: 'GET',
                query: { username: serviceProviderData.apiKey }
            }
        },
        'countriesNow': {
            url: 'https://countriesnow.space/api/v0.1/countries/positions',
            data: {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: commonName })
            }
        }
    };

    if (!officialNameRequestData[serviceProvider]) {
        throw new Error(`Unsupported provider for official name: ${serviceProvider}`);
    }

    try {
        const response = await lcsFetchCountrySelectionData(
            officialNameRequestData[serviceProvider].url,
            officialNameRequestData[serviceProvider].data
        );

        switch (serviceProvider) {
            case 'restCountries':
                const countryRest = Array.isArray(response) ? response.find(c => capitalizeWords(c.name.common) === commonName) : null;
                if (countryRest && countryRest.name?.official) {
                    officialNameResult = countryRest.name.official;
                }
                break;

            case 'geoNames':
                const countryGeo = (response.geonames || []).find(c => capitalizeWords(c.countryName) === commonName);
                if (countryGeo && countryGeo.countryName) {
                    officialNameResult = countryGeo.countryName;
                }
                break;

            case 'countriesNow':
                if (!response || !response.data) {
                    throw new Error(`No data returned from countriesNow for ${commonName}`);
                }
                if (typeof response.data === 'object' && response.data.name) {
                    if (capitalizeWords(response.data.name) === commonName) {
                        officialNameResult = response.data.name;
                    } else {
                        throw new Error(`Country ${commonName} not found in countriesNow response`);
                    }
                } else {
                    throw new Error(`Invalid response from countriesNow for ${commonName}: Expected an object with a name property`);
                }
                break;

            default:
                throw new Error(`Unsupported provider for official name: ${serviceProvider}`);
        }

        if (officialNameResult) {
            lcsStoreCountryOfficialNameInLocalDatabase(commonName, officialNameResult);
        }

        return officialNameResult;
    } catch (error) {
        throw new Error(`Failed to fetch official name for ${commonName}: ${error.message}`);
    }
};

/**
 * Fetches all states for a specific country from the selected API provider or local database.
 *
 * @param {Object} serviceProviderData - The selected API provider data.
 * @param {string} Country - The name of the country to get states for.
 * @param {string[]} [neededStates] - Optional list of states to filter the results.
 * @returns {Promise<string[]>} A promise resolving to a list of capitalized state names.
 */
export async function getAllStates (serviceProviderData, Country, neededStates = []) {
    return new Promise(async (resolve, reject) => {
        try {
            // Check local database first
            let LDB_states = lcsGetStatesFromLocalDatabase(Country);
            if (LDB_states.length > 0) {
                if (Array.isArray(neededStates) && neededStates.length > 0) {
                    LDB_states = filterArraySimilarItems(LDB_states, neededStates, false, true);
                }
                resolve(LDB_states);
            }

            let serviceProvider = serviceProviderData.provider;

            // Use geoNames if provider is set to restCountries
            if (serviceProvider === 'restCountries') {
                serviceProvider = 'geoNames';
                serviceProviderData = {
                    provider: serviceProvider,
                    apiKey: 'lcsnigeria'
                };
            }

            let statesResult = [];

            const countryISOCode = await getCountryISOCode(serviceProviderData, Country, 'alpha2');

            // Define request data for each provider
            const statesRequestData = {
                'countriesNow': {
                    url: 'https://countriesnow.space/api/v0.1/countries/states',
                    data: {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ country: Country })
                    }
                },
                'countryStateCity': {
                    url: 'https://api.countrystatecity.in/v1/states',
                    data: {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSCAPI-KEY': serviceProviderData.apiKey
                        }
                    }
                },
                'geoNames': {
                    url: `https://secure.geonames.org/searchJSON?country=${countryISOCode}&featureCode=ADM1&username=${serviceProviderData.apiKey}&maxRows=100&style=FULL&type=json`,
                    data: {
                        method: 'GET'
                    }
                }
            };

            // Validate the service provider
            if (!statesRequestData[serviceProvider]) {
                return reject(new Error(`Unsupported provider: ${serviceProvider}`));
            }

            // Fetch data from the selected provider
            const stateResponse = await lcsFetchCountrySelectionData(
                statesRequestData[serviceProvider].url,
                statesRequestData[serviceProvider].data
            );

            // Process the response based on the provider
            switch (serviceProvider) {
                case 'countriesNow':
                    if (stateResponse?.data?.states && Array.isArray(stateResponse.data.states)) {
                        statesResult = stateResponse.data.states
                            .map(s => capitalizeWords(s.name))
                            .filter(Boolean);
                    } else {
                        console.warn('Unexpected structure from countriesNow:', stateResponse);
                    }
                    break;

                case 'countryStateCity':
                    if (Array.isArray(stateResponse)) {
                        statesResult = stateResponse
                            .map(s => capitalizeWords(s.name))
                            .filter(Boolean)
                            .sort();
                    } else {
                        console.warn('Unexpected structure from countryStateCity:', stateResponse);
                    }
                    break;

                case 'geoNames':
                    if (stateResponse?.geonames && Array.isArray(stateResponse.geonames)) {
                        statesResult = stateResponse.geonames
                            .map(geo => capitalizeWords(geo.name))
                            .filter(Boolean)
                            .sort();
                    } else {
                        console.warn('Unexpected structure from geoNames:', stateResponse);
                    }
                    break;

                default:
                    return reject(new Error(`Unsupported provider: ${serviceProvider}`));
            }

            // Store fetched states in local database
            lcsStoreStatesInLocalDatabase(Country, statesResult);

            // Filter states if neededStates is provided
            if (Array.isArray(neededStates) && neededStates.length > 0) {
                statesResult = filterArraySimilarItems(statesResult, neededStates, false, true);
            }

            resolve(statesResult);
        } catch (err) {
            console.error('Failed to fetch states:', err);
            reject(new Error(`Failed to fetch states: ${err.message}`));
        }
    });
};

/**
 * Fetches all cities for a specific country and state from the selected API provider or local database.
 *
 * @param {Object} serviceProviderData - The selected API provider data.
 * @param {string} Country - The name of the country.
 * @param {string} State - The name of the state.
 * @param {string[]} [neededCities] - Optional list of cities to filter the results.
 * @returns {Promise<string[]>} A promise resolving to a list of city names.
 */
export async function getAllCities (serviceProviderData, Country, State, neededCities = []) {
    return new Promise(async (resolve, reject) => {
        try {
            // Check local database first
            let LDB_cities = lcsGetCitiesFromLocalDatabase(Country, State);
            if (LDB_cities.length > 0) {
                if (Array.isArray(neededCities) && neededCities.length > 0) {
                    LDB_cities = filterArraySimilarItems(LDB_cities, neededCities, false, true);
                }
                resolve(LDB_cities);
            }

            let serviceProvider = serviceProviderData.provider;

            // Use geoNames if provider is set to restCountries
            if (serviceProvider === 'restCountries') {
                serviceProvider = 'geoNames';
                serviceProviderData = {
                    provider: serviceProvider,
                    apiKey: 'lcsnigeria'
                };
            }

            let citiesResult = [];

            const countryISOCode = await getCountryISOCode(serviceProviderData, Country, 'alpha2');

            // Define request data for each provider
            const citiesRequestData = {
                'countriesNow': {
                    url: 'https://countriesnow.space/api/v0.1/countries/state/cities',
                    data: {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ country: Country, state: State })
                    }
                },
                'countryStateCity': {
                    url: `https://api.countrystatecity.in/v1/countries/${countryISOCode}/states/${State}/cities`,
                    data: {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSCAPI-KEY': serviceProviderData.apiKey
                        }
                    }
                },
                'geoNames': {
                    url: `https://secure.geonames.org/searchJSON?country=${countryISOCode}&featureClass=P&maxRows=1000&username=${serviceProviderData.apiKey}`,
                    data: {
                        method: 'GET'
                    }
                }
            };

            // Validate the service provider
            if (!citiesRequestData[serviceProvider]) {
                return reject(new Error(`Unsupported provider: ${serviceProvider}`));
            }

            // Fetch data from the selected provider
            const cityResponse = await lcsFetchCountrySelectionData(
                citiesRequestData[serviceProvider].url,
                citiesRequestData[serviceProvider].data
            );

            // Process the response based on the provider
            switch (serviceProvider) {
                case 'countriesNow':
                    if (cityResponse?.data && Array.isArray(cityResponse.data)) {
                        citiesResult = cityResponse.data
                            .map(c => capitalizeWords(c))
                            .filter(Boolean);
                    } else {
                        console.warn('Unexpected structure from countriesNow:', cityResponse);
                    }
                    break;

                case 'countryStateCity':
                    if (Array.isArray(cityResponse)) {
                        citiesResult = cityResponse
                            .map(c => capitalizeWords(c.name))
                            .filter(Boolean)
                            .sort();
                    } else {
                        console.warn('Unexpected structure from countryStateCity:', cityResponse);
                    }
                    break;
                case 'geoNames':
                    if (cityResponse?.geonames && Array.isArray(cityResponse.geonames)) {
                        citiesResult = cityResponse.geonames
                            .filter(geo => geo.adminName1 === State)
                            .map(geo => capitalizeWords(geo.name))
                            .filter(Boolean)
                            .sort();
                    } else {
                        console.warn('Unexpected structure from geoNames:', cityResponse);
                    }
                    break;                    
                default:
                    return reject(new Error(`Unsupported provider: ${serviceProvider}`));
            }

            // Store fetched cities in local database
            lcsStoreCitiesInLocalDatabase(Country, State, citiesResult);

            // Filter cities if neededCities is provided
            if (Array.isArray(neededCities) && neededCities.length > 0) {
                citiesResult = filterArraySimilarItems(citiesResult, neededCities, false, true);
            }

            resolve(citiesResult);
        } catch (error) {
            console.error('Failed to fetch cities:', error);
            reject(new Error(`Failed to fetch cities: ${error.message}`));
        }
    });
};

/**
 * Fetches the ISO country code (alpha-2 or alpha-3) for a given country name using the selected API provider or local database.
 *
 * @param {Object} serviceProviderData - The selected API provider data.
 * @param {string} countryName - The name of the country to find the ISO code for.
 * @param {string} [codeType='alpha2'] - The type of ISO code to return ('alpha2' or 'alpha3').
 * @returns {Promise<string|null>} A promise resolving to the ISO code or null if not found.
 */
export async function getCountryISOCode (serviceProviderData, countryName, codeType = 'alpha2') {
    const validCodeTypes = ['alpha2', 'alpha3'];
    if (!validCodeTypes.includes(codeType)) {
        throw new Error(`Invalid codeType. Allowed values are: ${validCodeTypes.join(', ')}`);
    }

    // Check local database first
    const LDB_isoCode = lcsGetCountryISOCodeFromLocalDatabase(countryName, codeType);
    if (LDB_isoCode) {
        return LDB_isoCode;
    }

    let isoCodeResult = null;
    let serviceProvider = serviceProviderData.provider;

    const countryOfficialName = await getCountryOfficialName(serviceProviderData, countryName);

    const isoCodeRequestData = {
        'restCountries': {
            url: `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=name,cca2,cca3`,
            data: {}
        },
        'geoNames': {
            url: 'https://secure.geonames.org/countryInfoJSON',
            data: {
                method: 'GET',
                query: { username: serviceProviderData.apiKey }
            }
        },
        'countriesNow': {
            url: 'https://countriesnow.space/api/v0.1/countries/iso',
            data: {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: countryOfficialName })
            }
        }
    };

    // Validate service provider
    if (!isoCodeRequestData[serviceProvider]) {
        throw new Error(`Unsupported provider for ISO code: ${serviceProvider}`);
    }

    try {
        const response = await lcsFetchCountrySelectionData(
            isoCodeRequestData[serviceProvider].url,
            isoCodeRequestData[serviceProvider].data
        );

        switch (serviceProvider) {
            case 'restCountries':
                const countryRest = Array.isArray(response) ? response.find(c => capitalizeWords(c.name.common) === countryName) : null;
                if (countryRest) {
                    isoCodeResult = codeType === 'alpha2' ? countryRest.cca2 : countryRest.cca3;
                }
                break;

            case 'geoNames':
                const countryGeo = (response.geonames || []).find(c => capitalizeWords(c.countryName) === countryName);
                if (countryGeo) {
                    isoCodeResult = codeType === 'alpha2' ? countryGeo.countryCode : null; // geoNames only provides alpha-2 codes
                }
                break;

            case 'countriesNow':
                if (response?.data?.Iso2 && response?.data?.Iso3) {
                    isoCodeResult = codeType === 'alpha2' ? response.data.Iso2 : response.data.Iso3;
                }
                break;

            default:
                throw new Error(`Unsupported provider for ISO code: ${serviceProvider}`);
        }

        // Store the ISO code in the local database
        if (isoCodeResult) {
            lcsStoreCountryISOCodeInLocalDatabase(countryName, {
                alpha2: codeType === 'alpha2' ? isoCodeResult : null,
                alpha3: codeType === 'alpha3' ? isoCodeResult : null
            });
        }

        return isoCodeResult;
    } catch (error) {
        throw new Error(`Failed to fetch ISO code for ${countryName}: ${error.message}`);
    }
};

/**
 * Fetches the calling code (dial code) of a country from the local database or API.
 *
 * @param {string} serviceProviderData - The selected API provider data.
 * @param {string} countryName - The country to get the calling code for.
 * @returns {Promise<string>} The calling code string (e.g., '+234').
 */
export async function getCountryCallingCode(serviceProviderData, countryName) {
    return new Promise(async (resolve, reject) => {
        // Check local database first
        const LDB_callingCode = lcsGetCountryCallingCodeFromLocalDatabase(countryName);
        if (LDB_callingCode) {
            resolve(LDB_callingCode);
        }

        let countryCCDResult = '';
        let serviceProvider = serviceProviderData.provider;

        const callingCodeRequestData = {
            'countriesNow': {
                url: 'https://countriesnow.space/api/v0.1/countries/codes',
                data: {}
            },
            'restCountries': {
                url: `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=name,idd`,
                data: {}
            },
            'countryStateCity': {
                url: 'https://api.countrystatecity.in/v1/countries',
                data: {
                    method: 'GET',
                    headers: { 'X-CSCAPI-KEY': serviceProviderData.apiKey }
                }
            },
            'geoNames': {
                url: 'https://secure.geonames.org/countryInfoJSON',
                data: {
                    method: 'GET',
                    query: { username: serviceProviderData.apiKey }
                }
            }
        };

        // Validate service provider
        if (!callingCodeRequestData[serviceProvider]) {
            return reject(new Error('Unsupported provider for calling code'));
        }

        try {
            const response = await lcsFetchCountrySelectionData(
                callingCodeRequestData[serviceProvider].url,
                callingCodeRequestData[serviceProvider].data
            );

            switch (serviceProvider) {
                case 'countriesNow':
                    const countryNow = response.data.find(c => capitalizeWords(c.name) === countryName);
                    if (countryNow && countryNow.dial_code) {
                        countryCCDResult = countryNow.dial_code;
                    }
                    break;
                case 'restCountries':
                    const countryRest = Array.isArray(response) ? response.find(c => capitalizeWords(c.name.common) === countryName) : null;
                    if (countryRest && countryRest.idd?.root && countryRest.idd?.suffixes?.length) {
                        countryCCDResult = countryRest.idd.root + countryRest.idd.suffixes[0];
                    }
                    break;
                case 'countryStateCity':
                    const countryCSC = response.find(c => capitalizeWords(c.name) === countryName);
                    if (countryCSC && countryCSC.phonecode) {
                        countryCCDResult = countryCSC.phonecode.startsWith('+') ? countryCSC.phonecode : `+${countryCSC.phonecode}`;
                    }
                    break;
                case 'geoNames':
                    const countryGeo = (response.geonames || []).find(c => capitalizeWords(c.countryName) === countryName);
                    if (countryGeo && countryGeo.phone) {
                        countryCCDResult = countryGeo.phone.startsWith('+') ? countryGeo.phone : `+${countryGeo.phone}`;
                    }
                    break;
                default:
                    reject(new Error('Unsupported provider for calling code'));
            }

            lcsStoreCountryCallingCodeInLocalDatabase(countryName, countryCCDResult);
            resolve(countryCCDResult);
        } catch (error) {
            reject(new Error(`Failed to fetch calling code: ${error.message}`));
        }
    });
};

/**
 * Fetches the currency code of a country from the local database or API.
 *
 * @param {string} serviceProviderData - The selected API provider data.
 * @param {string} countryName - The country to get the currency code for.
 * @returns {Promise<string>} The currency code (e.g., 'NGN').
 */
export async function getCountryCurrencyCode(serviceProviderData, countryName) {
    return new Promise(async (resolve, reject) => {
        // Check local database first
        const LDB_currencyCode = lcsGetCountryCurrencyCodeFromLocalDatabase(countryName);
        if (LDB_currencyCode) {
            resolve(LDB_currencyCode);
        }

        let countryCCResult = '';
        let serviceProvider = serviceProviderData.provider;

        const currencyCodeRequestData = {
            'countriesNow': {
                url: 'https://countriesnow.space/api/v0.1/countries/currency',
                data: {}
            },
            'restCountries': {
                url: `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=name,currencies`,
                data: {}
            },
            'countryStateCity': {
                url: 'https://api.countrystatecity.in/v1/countries',
                data: {
                    method: 'GET',
                    headers: { 'X-CSCAPI-KEY': serviceProviderData.apiKey }
                }
            },
            'geoNames': {
                url: 'https://secure.geonames.org/countryInfoJSON',
                data: {
                    method: 'GET',
                    query: { username: serviceProviderData.apiKey }
                }
            }
        };

        // Validate service provider
        if (!currencyCodeRequestData[serviceProvider]) {
            return reject(new Error('Unsupported provider for currency code'));
        }

        try {
            const response = await lcsFetchCountrySelectionData(
                currencyCodeRequestData[serviceProvider].url,
                currencyCodeRequestData[serviceProvider].data
            );

            switch (serviceProvider) {
                case 'countriesNow':
                    const countryNow = response.data.find(c => capitalizeWords(c.name) === countryName);
                    if (countryNow && countryNow.currency) {
                        countryCCResult = countryNow.currency;
                    }
                    break;
                case 'restCountries':
                    const countryRest = Array.isArray(response) ? response.find(c => capitalizeWords(c.name.common) === countryName) : null;
                    if (countryRest && countryRest.currencies) {
                        const currencyCode = Object.keys(countryRest.currencies)[0];
                        if (currencyCode) {
                            countryCCResult = currencyCode;
                        }
                    }
                    break;
                case 'countryStateCity':
                    const countryCSC = response.find(c => capitalizeWords(c.name) === countryName);
                    if (countryCSC && countryCSC.currency) {
                        countryCCResult = countryCSC.currency;
                    }
                    break;
                case 'geoNames':
                    const countryGeo = (response.geonames || []).find(c => capitalizeWords(c.countryName) === countryName);
                    if (countryGeo && countryGeo.currencyCode) {
                        countryCCResult = countryGeo.currencyCode;
                    }
                    break;
                default:
                    reject(new Error('Unsupported provider for currency code'));
            }

            lcsStoreCountryCurrencyCodeInLocalDatabase(countryName, countryCCResult);
            resolve(countryCCResult);
        } catch (error) {
            reject(new Error(`Failed to fetch currency code: ${error.message}`));
        }
    });
};

/**
 * Fetches the country flag image URL from the local database or API using the ISO country code for reliability.
 *
 * @param {Object} serviceProviderData - The selected API provider data.
 * @param {string} countryName - The country to get the flag for.
 * @returns {Promise<string>} The image URL of the country flag.
 */
export async function getCountryFlag(serviceProviderData, countryName) {
    return new Promise(async (resolve, reject) => {
        try {
            // Check local database first
            const LDB_flag = lcsGetCountryFlagFromLocalDatabase(countryName);
            if (LDB_flag) {
                resolve(LDB_flag);
            }

            let countryFlagResult = '';
            let serviceProvider = serviceProviderData.provider;

            // Fetch the ISO country code
            const countryISOCode = await getCountryISOCode(serviceProviderData, countryName, 'alpha2');
            if (!countryISOCode) {
                console.warn(`Could not find ISO code for country: ${countryName}`);
                resolve(undefined);
            }

            // Use restCountries if provider is set to geoNames
            if (serviceProvider === 'geoNames') {
                serviceProvider = 'restCountries';
                serviceProviderData = {
                    provider: serviceProvider
                };
            }

            const countryFlagRequestData = {
                'countriesNow': {
                    url: 'https://countriesnow.space/api/v0.1/countries/flag/images',
                    data: {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ iso2: countryISOCode })
                    }
                },
                'restCountries': {
                    url: `https://restcountries.com/v3.1/alpha/${countryISOCode}?fields=flags`,
                    data: {}
                },
                'countryStateCity': {
                    url: `https://api.countrystatecity.in/v1/countries/${countryISOCode}`,
                    data: {
                        method: 'GET',
                        headers: { 'X-CSCAPI-KEY': serviceProviderData.apiKey }
                    }
                }
            };

            // Validate service provider
            if (!countryFlagRequestData[serviceProvider]) {
                reject(new Error('Unsupported provider for country flag'));
            }

            // Fetch the flag data
            const response = await lcsFetchCountrySelectionData(
                countryFlagRequestData[serviceProvider].url,
                countryFlagRequestData[serviceProvider].data
            );

            // Process the response based on the provider
            switch (serviceProvider) {
                case 'countriesNow':
                    if (response?.data?.flag) {
                        countryFlagResult = response.data.flag;
                    }
                    break;
                case 'restCountries':
                    if (response?.flags?.png) {
                        countryFlagResult = response.flags.png;
                    }
                    break;
                case 'countryStateCity':
                    if (response?.flag) {
                        countryFlagResult = response.flag;
                    }
                    break;
                default:
                    throw new Error('Unsupported provider for country flag');
            }

            if (!countryFlagResult) {
                throw new Error(`Flag not found for country: ${countryName}`);
            }

            // Store the flag in the local database
            lcsStoreCountryFlagInLocalDatabase(countryName, countryFlagResult);
            resolve(countryFlagResult);
        } catch (error) {
            console.warn(`Failed to fetch ${countryName}'s flag: ${error.message}`);
            resolve(undefined);
        }
    });
};

let numberOfCountryInputElement = 0;
let numberOfStateInputElement = 0;
let numberOfCityInputElement = 0;

/**
 * Creates a country selection UI block with flag support and dataset bindings.
 *
 * @param {Object.<string, *>} serviceProviderData - Object of service provider data
 * @param {string[]} Countries - Array of country names.
 * @param {string} selectedCountry - The currently selected country (optional).
 * @param {boolean} showFlag - Whether to display flags (default: true).
 * @param {string[]} dataSets - Optional dataset keys (e.g., ['name', 'calling_code']).
 * @param {string} inputName - Name for the hidden input (default: 'country').
 * @returns {Promise<string>} A promise resolving to the complete country options HTML.
 */
const createCountryOptions = async (serviceProviderData, Countries, selectedCountry, showFlag = true, dataSets = [], inputName = 'country') => {
    selectedCountry = selectedCountry || Countries[0];
    selectedCountry = filterArraySimilarItems(Countries, selectedCountry, true, true);
    if (Array.isArray(selectedCountry)) selectedCountry = selectedCountry[0];

    dataSets = [...dataSets, 'name'];

    const countryContainer = document.createElement('div');
    countryContainer.className = '_country_container';

    ++numberOfCountryInputElement;
    const countryInputElement = document.createElement('input');
    countryInputElement.type = 'hidden';
    countryInputElement.className = '_input_element';
    countryInputElement.id = `country_${numberOfCountryInputElement}`;
    countryInputElement.name = inputName;
    countryInputElement.value = selectedCountry;

    const countryOptionsLabel = document.createElement('span');
    countryOptionsLabel.className = '_label';
    countryOptionsLabel.textContent = 'Country';

    const countryOptionsPlaceholderContainer = document.createElement('div');
    countryOptionsPlaceholderContainer.className = '_options_placeholder_container';

    const countryOptionsPlaceholder = document.createElement('span');
    countryOptionsPlaceholder.className = '_options_placeholder';
    countryOptionsPlaceholder.innerHTML = selectedCountry;

    const countryOptions = document.createElement('div');
    countryOptions.className = '_options';

    for (const country of Countries) {
        const countryOption = document.createElement('div');
        countryOption.className = '_country';
        countryOption.textContent = country;
        if (country === selectedCountry) countryOption.classList.add('_selected');

        const datasets = {};
        if (dataSets.includes('name')) datasets.country_name = country;
        if (dataSets.includes('calling_code')) datasets.country_calling_code = await getCountryCallingCode(serviceProviderData, country);
        if (dataSets.includes('currency_code')) datasets.country_currency_code = await getCountryCurrencyCode(serviceProviderData, country);

        Object.entries(datasets).forEach(([key, value]) => {
            countryOption.dataset[key] = value;
        });

        if (Countries.length < 10 && showFlag === true) {
            const flagUrl = await getCountryFlag(serviceProviderData, country);
            if (flagUrl) {
                const flagImg = document.createElement('img');
                flagImg.src = flagUrl;
                flagImg.className = '_flag';
                flagImg.alt = `${country} flag`;
                flagImg.loading = 'lazy';
                countryOption.prepend(flagImg);
            }
        }

        countryOptions.appendChild(countryOption);
    }

    countryOptionsPlaceholderContainer.append(countryOptionsPlaceholder, countryOptions);
    countryContainer.append(countryOptionsLabel, countryOptionsPlaceholderContainer, countryInputElement);

    return countryContainer.outerHTML;
};

/**
 * Creates a state selection UI block with dataset bindings.
 *
 * @param {string[]} States - Array of state names.
 * @param {string} selectedState - The currently selected state (optional).
 * @param {string} belongingCountry - The country these states belong to.
 * @param {string[]} dataSets - Optional dataset keys (e.g., ['name']).
 * @param {string} inputName - Name for the hidden input (default: 'state').
 * @returns {Promise<string>} A promise resolving to the complete state options HTML.
 */
const createStateOptions = async (States, selectedState, belongingCountry, dataSets = [], inputName = 'state') => {
    if (States.length <= 0) {
        console.warn("Could not create options html! No states were found or provided. Please check the input or data source.");
        return '';
    }  

    selectedState = selectedState || States[0];
    selectedState = filterArraySimilarItems(States, selectedState, true, true);
    if (Array.isArray(selectedState)) selectedState = selectedState[0];

    dataSets = [...dataSets, 'name'];

    const stateContainer = document.createElement('div');
    stateContainer.className = '_state_container';

    ++numberOfStateInputElement;
    const stateInputElement = document.createElement('input');
    stateInputElement.type = 'hidden';
    stateInputElement.className = '_input_element';
    stateInputElement.id = `state_${numberOfStateInputElement}`;
    stateInputElement.name = inputName;
    stateInputElement.value = selectedState;

    const stateOptionsLabel = document.createElement('span');
    stateOptionsLabel.className = '_label';
    stateOptionsLabel.textContent = 'State';

    const stateOptionsPlaceholderContainer = document.createElement('div');
    stateOptionsPlaceholderContainer.className = '_options_placeholder_container';

    const stateOptionsPlaceholder = document.createElement('span');
    stateOptionsPlaceholder.className = '_options_placeholder';
    stateOptionsPlaceholder.innerHTML = capitalizeWords(selectedState);

    const stateOptions = document.createElement('div');
    stateOptions.className = '_options';

    for (const state of States) {
        const stateOption = document.createElement('div');
        stateOption.className = '_state';
        stateOption.textContent = state;
        if (state === capitalizeWords(selectedState)) stateOption.classList.add('_selected');

        const datasets = {};
        if (dataSets.includes('name')) datasets.name = state;
        datasets.country_name = belongingCountry;

        Object.entries(datasets).forEach(([key, value]) => {
            stateOption.dataset[key] = value;
        });

        stateOptions.appendChild(stateOption);
    }

    stateOptionsPlaceholderContainer.append(stateOptionsPlaceholder, stateOptions);
    stateContainer.append(stateOptionsLabel, stateOptionsPlaceholderContainer, stateInputElement);

    return stateContainer.outerHTML;
};

/**
 * Creates a city selection UI block with dataset bindings.
 *
 * @param {string[]} Cities - Array of city names.
 * @param {string} selectedCity - The currently selected city (optional).
 * @param {string[]} dataSets - Optional dataset keys (e.g., ['name']).
 * @param {string} inputName - Name for the hidden input (default: 'city').
 * @returns {Promise<string>} A promise resolving to the complete city options HTML.
 */
const createCityOptions = async (Cities, selectedCity, dataSets = [], inputName = 'city') => {
    if (Cities.length <= 0) {
        console.warn("Could not create options html! No cities were found or provided. Please check the input or data source.");
        return '';
    }    

    selectedCity = selectedCity || Cities[0];
    selectedCity = filterArraySimilarItems(Cities, selectedCity, true, true);
    if (Array.isArray(selectedCity)) selectedCity = selectedCity[0];

    dataSets = [...dataSets, 'name'];

    const cityContainer = document.createElement('div');
    cityContainer.className = '_city_container';

    ++numberOfCityInputElement;
    const cityInputElement = document.createElement('input');
    cityInputElement.type = 'hidden';
    cityInputElement.className = '_input_element';
    cityInputElement.id = `city_${numberOfCityInputElement}`;
    cityInputElement.name = inputName;
    cityInputElement.value = selectedCity;

    const cityOptionsLabel = document.createElement('span');
    cityOptionsLabel.className = '_label';
    cityOptionsLabel.textContent = 'City';

    const cityOptionsPlaceholderContainer = document.createElement('div');
    cityOptionsPlaceholderContainer.className = '_options_placeholder_container';

    const cityOptionsPlaceholder = document.createElement('span');
    cityOptionsPlaceholder.className = '_options_placeholder';
    cityOptionsPlaceholder.innerHTML = capitalizeWords(selectedCity);

    const cityOptions = document.createElement('div');
    cityOptions.className = '_options';

    for (const city of Cities) {
        const cityOption = document.createElement('div');
        cityOption.className = '_city';
        cityOption.textContent = city;
        if (city === capitalizeWords(selectedCity)) cityOption.classList.add('_selected');

        const datasets = {};
        if (dataSets.includes('name')) datasets.name = city;

        Object.entries(datasets).forEach(([key, value]) => {
            cityOption.dataset[key] = value;
        });

        cityOptions.appendChild(cityOption);
    }

    cityOptionsPlaceholderContainer.append(cityOptionsPlaceholder, cityOptions);
    cityContainer.append(cityOptionsLabel, cityOptionsPlaceholderContainer, cityInputElement);

    return cityContainer.outerHTML;
};

/**
 * Fetches data from a specified URL with given options.
 *
 * @param {string} url - The API endpoint URL.
 * @param {Object} [data={}] - Fetch options (e.g., method, headers, body, query).
 * @param {number} [timeoutMs=15000] - Request timeout in milliseconds.
 * @returns {Promise<Object>} A promise that resolves to the JSON response data.
 * @throws {Error} Throws an error if the fetch request fails or times out.
 */
async function lcsFetchCountrySelectionData(url, data = {}, timeoutMs = 15000) {
    try {
      // Extract and apply query parameters if available
      if (data.query && typeof data.query === 'object') {
        const urlObj = new URL(url);
        for (const [key, value] of Object.entries(data.query)) {
          urlObj.searchParams.append(key, value);
        }
        url = urlObj.toString(); // Update url with query params
      }
  
      // Remove `query` from data before passing to fetch
      const { query, ...fetchOptions } = data;
  
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              'Service timeout! Request taking too long. Please try again later or change service provider'
            )
          );
        }, timeoutMs);
      });
  
      // Perform fetch and race it against the timeout
      const response = await Promise.race([
        fetch(url, fetchOptions),
        timeoutPromise,
      ]);
  
      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }
  
      // Parse and return JSON data
      return await response.json();
    } catch (error) {
      // Handle all error cases
      throw new Error(error.message);
    }
}  

/**
 * Generates a custom```javascript
 * custom dropdown UI for selecting countries, states, and cities using data from a specified service provider.
 *
 * This function creates a customizable dropdown interface using `<div>` elements (not `<select>`) for selecting countries,
 * states, and cities. It fetches data from an external API (default: CountriesNow), filters it based on provided options,
 * and returns the generated HTML elements for further use. It supports features like flags and dynamic updates on country change.
 *
 * Features:
 * - Fetches country, state, and city data from the specified service provider (CountriesNow).
 * - Uses custom `<div>`-based dropdowns instead of `<select>` for styling flexibility.
 * - Supports customizable options (e.g., country, state, city, calling code, currency code).
 * - Optionally displays country flags.
 * - Supports dynamic updates (states and cities update based on country selection if `setOnCountryChange` is true).
 * - Allows pre-selection of country, state, and city.
 * - Provides data attributes for custom datasets on options.
 *
 * Process Flow:
 * 1. Fetches and validates all countries from the API.
 * 2. Filters countries based on the provided `countries` array (if any).
 * 3. Generates a custom dropdown UI with the specified options (country, state, city, etc.).
 * 4. If `setOnCountryChange` is true, prepares states and cities for dynamic updates (client-side handling required).
 * 5. Applies flags and datasets as configured.
 * 6. Returns the generated HTML container element.
 *
 * Requirements:
 * - An active internet connection for API calls.
 * - The browser must support `fetch` and DOM manipulation.
 * - The CSS file (`countrySelection.css`) must define styles for classes like `lcsCountrySelection`, `_dropdown_wrapper`, etc.
 * - Client-side event listeners are needed for dynamic updates if `setOnCountryChange` is true.
 *
 * Usage Example:
 * ```javascript
 * const dropdown = await lcsTools.generateCountrySelection({
 *   countries: ['Nigeria', 'Ghana'],
 *   options: ['country', 'state'],
 *   showFlag: true,
 *   setOnCountryChange: true,
 *   selectedCountry: 'Nigeria'
 * });
 * document.body.insertAdjacentHTML('beforeend', dropdown);
 * ```
 *
 * @param {Object} [data] - Configuration object for the country selection UI.
 * @param {Object} [data.serviceProvider] - API service provider details.
 * @param {string} [data.serviceProvider.provider='countriesNow'] - The API provider (currently only 'countriesNow' is supported).
 * @param {string|null} [data.serviceProvider.apiKey=null] - API key (not required for CountriesNow).
 * @param {string[]} [data.countries=[]] - Array of country names to filter the dropdown (empty means all countries).
 * @param {string[]} [data.states=[]] - Array of state names to filter (optional, used with `setOnCountryChange`).
 * @param {string[]} [data.cities=[]] - Array of city names to filter (optional, used with `setOnCountryChange`).
 * @param {string[]} [data.options=['country', 'state', 'city']] - Options to display ('country', 'state', 'city', 'currency_code', 'calling_code').
 * @param {Object} [data.dataSet={}] - Custom data attributes for options (e.g., { country: ['name', 'calling_code'] }).
 * @param {boolean} [data.showFlag=true] - Whether to display country flags.
 * @param {boolean} [data.setOnCountryChange=true] - If true, states and cities are prepared for dynamic updates; if false, all options are generated at once.
 * @param {string|null} [data.selectedCountry='Nigeria'] - Pre-selected country (defaults to first available if invalid).
 * @param {string|null} [data.selectedState='Enugu'] - Pre-selected state (optional).
 * @param {string|null} [data.selectedCity='Awgu'] - Pre-selected city (optional).
 * @returns {Promise<string>} A promise that resolves to the generated HTML string for the country selection container.    
 * @throws {Error} Throws an error if API fetch fails, data is invalid, or unsupported options are provided.
 */
export async function generateCountrySelection(data = {}) {
    // Default args
    const defaultData = {
        serviceProvider: {
            provider: 'countriesNow',
            apiKey: null
        },
        countries: [],
        states: [],
        cities: [],
        options: ['country', 'state', 'city'],
        dataSet: {},
        showFlag: true,
        setOnCountryChange: true,
        selectedCountry: 'Nigeria',
        selectedState: 'Enugu',
        selectedCity: 'Awgu'
    }

    // Merge provided data with defaultData, making sure the provided overwrites the default
    const mergedData = { ...defaultData, ...data };
    data = mergedData;

    const sPData = data.serviceProvider;

    const validOptions = ['country', 'state', 'city', 'currency_code', 'calling_code'];

    // Validate options
    if (!data.options.every(opt => validOptions.includes(opt))) {
        throw new Error(`Invalid options provided. Supported options: ${validOptions.join(', ')}`);
    }

    // Fetch all countries using the helper function
    let neededCountries = [];
    try {
        neededCountries = await getAllCountries(sPData, data.countries);
    } catch (error) {
        throw new Error(error);
    }
    // If all countries is empty, throw error
    if (neededCountries.length === 0) {
        throw new Error('No countries retrieved from the API');
    }
    // Set selected country
    let selectedCountry = filterArraySimilarItems(neededCountries, data.selectedCountry, true, true);
    if (Array.isArray(selectedCountry)) selectedCountry = selectedCountry[0];

    // Fetch States
    let neededStates = [];
    try {
        neededStates = await getAllStates(sPData, selectedCountry, data.states);
    } catch (error) {
        throw new Error(`Could not retrieve states for country: ${selectedCountry}; Server response: ${error} `);
    }
    // Set selected state
    let selectedState = filterArraySimilarItems(neededStates, data.selectedState, true, true);
    if (Array.isArray(selectedState)) selectedState = selectedState[0];

    // Fetch all cities
    let neededCities = [];
    try {
        neededCities = await getAllCities(sPData, selectedCountry, selectedState, data.cities);
    } catch (error) {
        throw new Error(`Could not retrieve cities for state: ${selectedState} in country: ${selectedCountry}. Server response: ${error}`);
    }
    // Set selected city
    let selectedCity = filterArraySimilarItems(neededCities, data.selectedCity, true, true);
    if (Array.isArray(selectedCity)) selectedCity = selectedCity[0];

    // Create the main container
    const lcsCountrySelection = document.createElement('div');
    lcsCountrySelection.className = 'lcsCountrySelection';
    lcsCountrySelection.style.position = 'relative';

    window.lcsCountrySelectionData = {};
    const trackingKey = generateCodes();

    lcsCountrySelection.dataset.dtk = trackingKey;

    window.lcsCountrySelectionData[trackingKey] = data;

    // Create dropdown wrapper
    const lcsCountrySelectionWrapper = document.createElement('div');
    lcsCountrySelectionWrapper.className = '_dropdown_wrapper';

    if (data.options.includes('country')) {
        const generatedCountryOptions = await createCountryOptions(sPData, neededCountries, selectedCountry, data.showFlag, data.dataSet.country);
        lcsCountrySelectionWrapper.insertAdjacentHTML('beforeend', generatedCountryOptions);
    }

    if (data.options.includes('state')) {
        const generatedStateOptions = await createStateOptions(neededStates, selectedState, selectedCountry, data.dataSet.state);
        lcsCountrySelectionWrapper.insertAdjacentHTML('beforeend', generatedStateOptions);
    }

    if (!data.setOnCountryChange) {
        if (data.options.includes('city')) {
            const generatedCityOptions = await createCityOptions(neededCities, selectedCity, data.dataSet.city);
            lcsCountrySelectionWrapper.insertAdjacentHTML('beforeend', generatedCityOptions);
        }
    }

    lcsCountrySelection.appendChild(lcsCountrySelectionWrapper);

    if (data.container && (data.container instanceof HTMLElement)) {
        data.container.insertAdjacentHTML("beforeend", lcsCountrySelection.outerHTML);
    }
    
    return lcsCountrySelection.outerHTML;
}

/**
 * Event listeners
 */
document.addEventListener('click', async (event) => {
    const clickTarget = event.target;

    // Return and abort if user is not interracting with the lcsCountrySelection
    if (!clickTarget.closest('.lcsCountrySelection')) return;

    const thisCountrySelection = clickTarget.closest('.lcsCountrySelection');
    const thisCountrySelectionDTK = thisCountrySelection.dataset.dtk;
    const thisCountrySelectionData = window.lcsCountrySelectionData[thisCountrySelectionDTK];

    const closeOptionsDropdown = (specificOptions = 'all') => {
        const optionClassMap = {
            'all': '._options',
            'country': '._country_container ._options',
            'state': '._state_container ._options',
            'city': '._city_container ._options'
        };
        // Ensure specificOptions is an array for consistent processing
        if (!Array.isArray(specificOptions)) {
            specificOptions = [specificOptions];
        }
        specificOptions.forEach(optionType => {
            const targetClass = optionClassMap[optionType];
            if (targetClass) {
                const dropdowns = thisCountrySelection.querySelectorAll(targetClass);
                dropdowns.forEach(dropdown => {
                    dropdown.style.display = 'none';
                });
            }
        });
    };

    // User wants to display the country dropdown
    if (
        clickTarget.closest('._country_container') 
        && clickTarget.closest('._options_placeholder_container') 
        && !clickTarget.closest('._options')
    ) {
        // First close some dropdown
        closeOptionsDropdown(['state', 'city']);

        const countryOptionsPlaceholder = clickTarget.closest('._options_placeholder_container');
        const countryOptionsContainer = countryOptionsPlaceholder.querySelector('._options');
        const thisOptionsDisplayValue = window.getComputedStyle(countryOptionsContainer).display === 'none'
        ? 'block' : 'none';
        Object.assign(countryOptionsContainer.style, {
            display: thisOptionsDisplayValue
        });    
    }

    // User wants to display the state dropdown
    if (
        clickTarget.closest('._state_container') 
        && clickTarget.closest('._options_placeholder_container') 
        && !clickTarget.closest('._options')
    ) {
        // First close some dropdown
        closeOptionsDropdown(['country', 'city']);

        const stateOptionsPlaceholder = clickTarget.closest('._options_placeholder_container');
        const stateOptionsContainer = stateOptionsPlaceholder.querySelector('._options');
        const thisOptionsDisplayValue = window.getComputedStyle(stateOptionsContainer).display === 'none'
        ? 'block' : 'none';
        Object.assign(stateOptionsContainer.style, {
            display: thisOptionsDisplayValue
        });
    }

    // User wants to display the city dropdown
    if (
        clickTarget.closest('._city_container') 
        && clickTarget.closest('._options_placeholder_container') 
        && !clickTarget.closest('._options')
    ) {
        // First close some dropdown
        closeOptionsDropdown(['state', 'country']);

        const cityOptionsPlaceholder = clickTarget.closest('._options_placeholder_container');
        const cityOptionsContainer = cityOptionsPlaceholder.querySelector('._options');
        const thisOptionsDisplayValue = window.getComputedStyle(cityOptionsContainer).display === 'none'
        ? 'block' : 'none';
        Object.assign(cityOptionsContainer.style, {
            display: thisOptionsDisplayValue
        });
    }

    /**
     * Helper function for selecting country and loading states
     */
    const applySelectedCountryValueAndLoadStates = async() => {
        const thisCountrySelectionContainer = clickTarget.closest('._country_container');
        const selectedCountryElement = clickTarget.closest('._country');
        const countryName = selectedCountryElement.dataset.country_name;

        const thisCountrySelectionInput = thisCountrySelectionContainer.querySelector('._input_element');
        thisCountrySelectionInput.value = countryName;

        const thisCountrySelectionPlaceholder = thisCountrySelectionContainer.querySelector('._options_placeholder');
        thisCountrySelectionPlaceholder.textContent = countryName;

        // Re-assign the _selected class
        thisCountrySelectionContainer.querySelectorAll('._options ._selected')
        .forEach(sltd => {
            if (sltd.classList.contains('_selected')) sltd.classList.remove('_selected');
        });
        selectedCountryElement.classList.add('_selected');

        if (clickTarget.closest('._options')) clickTarget.closest('._options').style.display = 'none';

        // ...lets fetch the states of the country only if allowed by the options
        let thisCountryQueriedStates = [];
        if (thisCountrySelectionData.options.includes('state')) {
            thisCountryQueriedStates = await getAllStates(thisCountrySelectionData.serviceProvider, countryName, thisCountrySelectionData.states);
            const thisCountrySelectionExistingStateContainer = thisCountrySelection.querySelector('._state_container');
            const thisCountrySelectionNewStateContainer = await createStateOptions(thisCountryQueriedStates, thisCountrySelectionData.selectedState, countryName, thisCountrySelectionData.dataSet.state);
            if (thisCountrySelectionExistingStateContainer) {
                thisCountrySelectionExistingStateContainer.insertAdjacentHTML('beforebegin', thisCountrySelectionNewStateContainer);
                thisCountrySelectionExistingStateContainer.remove();
            } else {
                thisCountrySelectionContainer.insertAdjacentHTML('afterend', thisCountrySelectionNewStateContainer);
            }
        }

        // Return belonging country and state for use in refreshing cities
        if (countryName && thisCountryQueriedStates.length > 0) {
            return {
                belongingCountry: countryName,
                belongingState: thisCountryQueriedStates[0]
            };
        } else {
            return false;
        }
    }

    /**
     * Helper function for selecting state and loading cities
     */
    const applySelectedStateValueAndLoadCities = async() => {
        const thisStateSelectionContainer = clickTarget.closest('._state_container');
        const selectedStateElement = clickTarget.closest('._state');
        const selectedState = selectedStateElement.dataset.name;
        const selectedStateBelongingCountry = selectedStateElement.dataset.country_name;

        const thisStateSelectionInput = thisStateSelectionContainer.querySelector('._input_element');
        thisStateSelectionInput.value = selectedState;

        const thisStateSelectionPlaceholder = thisStateSelectionContainer.querySelector('._options_placeholder');
        thisStateSelectionPlaceholder.textContent = selectedState;

        // Re-assign the _selected class
        thisStateSelectionContainer.querySelectorAll('._options ._selected')
        .forEach(sltd => {
            if (sltd.classList.contains('_selected')) sltd.classList.remove('_selected');
        });
        selectedStateElement.classList.add('_selected');

        if (clickTarget.closest('._options')) clickTarget.closest('._options').style.display = 'none';

        // ...lets fetch the cities of the state only if allowed by the options
        if (thisCountrySelectionData.options.includes('city')) {
            const thisStateQueriedCities = await getAllCities(thisCountrySelectionData.serviceProvider, selectedStateBelongingCountry, selectedState, thisCountrySelectionData.cities);
            const thisStateSelectionExistingCityContainer = thisCountrySelection.querySelector('._city_container');
            const thisStateSelectionNewCityContainer = await createCityOptions(thisStateQueriedCities, thisCountrySelectionData.selectedCity, thisCountrySelectionData.dataSet.city);
            if (thisStateSelectionExistingCityContainer) {
                thisStateSelectionExistingCityContainer.insertAdjacentHTML('beforebegin', thisStateSelectionNewCityContainer);
                thisStateSelectionExistingCityContainer.remove();
            } else {
                thisStateSelectionContainer.insertAdjacentHTML('afterend', thisStateSelectionNewCityContainer);
            }
        }
    }

    /**
     * Helper function to selecting city
     */
    const applySelectedCityValue = () => {
        const thisCitySelectionContainer = clickTarget.closest('._city_container');
        const selectedCityElement = clickTarget.closest('._city');
        const selectedCity = selectedCityElement.dataset.name;

        const thisCitySelectionInput = thisCitySelectionContainer.querySelector('._input_element');
        thisCitySelectionInput.value = selectedCity;

        const thisCitySelectionPlaceholder = thisCitySelectionContainer.querySelector('._options_placeholder');
        thisCitySelectionPlaceholder.textContent = selectedCity;

        // Re-assign the _selected class
        thisCitySelectionContainer.querySelectorAll('._options ._selected')
        .forEach(sltd => {
            if (sltd.classList.contains('_selected')) sltd.classList.remove('_selected');
        });
        selectedCityElement.classList.add('_selected');

        if (clickTarget.closest('._options')) clickTarget.closest('._options').style.display = 'none';
    }

    /**
     * Helper function to load cities
     */
    const refreshCities = async(belongingCountry, belongingState) => {
        if (belongingCountry && belongingState) {
            const thisStateSelectionContainer = thisCountrySelection.querySelector('._state_container');
            const thisStateSelectionExistingCityContainer = thisCountrySelection.querySelector('._city_container');
            if (thisStateSelectionContainer && thisStateSelectionExistingCityContainer) {
                const thisStateQueriedCities = await getAllCities(thisCountrySelectionData.serviceProvider, belongingCountry, belongingState, thisCountrySelectionData.cities);
                const thisStateSelectionNewCityContainer = await createCityOptions(thisStateQueriedCities, thisCountrySelectionData.selectedCity, thisCountrySelectionData.dataSet.city);
                if (thisStateSelectionExistingCityContainer) {
                    thisStateSelectionExistingCityContainer.insertAdjacentHTML('beforebegin', thisStateSelectionNewCityContainer);
                    thisStateSelectionExistingCityContainer.remove();
                } else {
                    thisStateSelectionContainer.insertAdjacentHTML('afterend', thisStateSelectionNewCityContainer);
                }
            }
        }
    }

    // User selects a country...
    if (
        clickTarget.closest('._country_container') 
        && clickTarget.closest('._country') 
    ) {
        lcsShowSpinnerOverlay(thisCountrySelection);
        const concludedData = await applySelectedCountryValueAndLoadStates();
        if (concludedData !== false) await refreshCities(concludedData.belongingCountry, concludedData.belongingState);
        lcsHideSpinnerOverlay(thisCountrySelection);
    }

    // User selects a state...
    if (
        clickTarget.closest('._state_container') 
        && clickTarget.closest('._state') 
    ) {
        lcsShowSpinnerOverlay(thisCountrySelection);
        await applySelectedStateValueAndLoadCities();
        lcsHideSpinnerOverlay(thisCountrySelection);
    }

    // User selects a city...
    if (
        clickTarget.closest('._city_container') 
        && clickTarget.closest('._city') 
    ) {
        lcsShowSpinnerOverlay(thisCountrySelection);
        applySelectedCityValue();
        lcsHideSpinnerOverlay(thisCountrySelection);
    }

    // User wants to close the dropdown by clicking anywhere else on the document or the placeholder container but not inside the options
    if (
        !clickTarget.closest('._options') &&
        !clickTarget.closest('._options_placeholder_container')
    ) {
        closeOptionsDropdown();
    }
    
});

export const lcsCountrySelection = true;