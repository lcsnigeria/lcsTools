import './js/locationTools.js';
import { lcsGetCurrentLocation } from './js/locationTools.js';
import './js/formTools/OTPField.js';
import './js/formTools/radioOptionSelection.js';
import './js/formTools/showHidePassword.js';
import { lcsArrayHasSimilarItems, lcsCapitalizeWords, lcsFilterArraySimilarItems, lcsGenerateCodes } from './js/workingTools.js';
import { lcsClearLocalDatabase, lcsDeleteLocalDatabaseData, lcsGetLocalDatabaseData, lcsInitializeLocalDatabase, lcsStoreLocalDatabaseData, lcsUpdateLocalDatabaseData } from './js/dataStorage/localDatabase.js';
import { lcsGenerateCountrySelection, lcsGetAllCities, lcsGetAllCountries, lcsGetAllStates, lcsGetCountryCallingCode, lcsGetCountryCurrencyCode, lcsGetCountryISOCode, lcsGetCountryOfficialName } from './js/formTools/countrySelection.js';

// Exporting for global access via window.lcsTools
module.exports = {
    // LCS Working Tools
    lcsGenerateCodes, lcsFilterArraySimilarItems, lcsArrayHasSimilarItems,
    lcsCapitalizeWords,

    // LCS Local Database
    lcsInitializeLocalDatabase, lcsStoreLocalDatabaseData, lcsUpdateLocalDatabaseData,
    lcsDeleteLocalDatabaseData, lcsGetLocalDatabaseData, lcsClearLocalDatabase,

    // Countries & Locations
    lcsGetCurrentLocation, lcsGenerateCountrySelection, lcsGetAllCountries,
    lcsGetAllStates, lcsGetCountryOfficialName, lcsGetAllCities, lcsGetCountryISOCode,
    lcsGetCountryCallingCode, lcsGetCountryCurrencyCode
};