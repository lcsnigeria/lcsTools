/**
 * Import necessary css files
 */
import '../../css/themesVars/primaryTheme.css'; // CSS Themes


import '../../css/uiAndEM/horizontalScrolling.css';
import '../../css/uiAndEM/displaySettings.css';
import '../../css/uiAndEM/overlayUtils.css';


import '../../css/fileOperations/fileSelection.css';
import '../../css/fileOperations/csv.css';
import '../../css/fileOperations/textDoc.css';


import '../../css/alertsAndLogs/alerts.css';


import '../../css/formOperations/forms.css';
import '../../css/formOperations/countrySelection.css';
import '../../css/formOperations/dropdownOptionSelection.css';
import '../../css/formOperations/pillOptionSelection.css';
import '../../css/formOperations/externalFormLibs.css';


import '../../css/animations/loader.css';

/**
 * Utility to get CSS variable values from :root
 * @param {string} name - The CSS variable name (e.g. '--primaryColor')
 * @returns {string} The computed value of the CSS variable, or an empty string if not found
 */
const getRootVar = (name) => {
    if (typeof window === 'undefined' || !document.documentElement) return '';
    const val = getComputedStyle(document.documentElement).getPropertyValue(name);
    return val ? val.trim() : '';
};

/** Object holding CSS variable values
 */
export const cssVars = {
    bgColor: getRootVar('--bgColor'),
    textColor: getRootVar('--textColor'),
    primaryColor: getRootVar('--primaryColor'),
    primaryColorFade: getRootVar('--primaryColorFade'),
    whiteColor: getRootVar('--whiteColor'),
    blackColor: getRootVar('--blackColor'),
    dimmedBlackColor: getRootVar('--dimmedBlackColor'),
    darkOverlayColor: getRootVar('--darkOverlayColor'),
    lightGreyColor: getRootVar('--lightGreyColor'),
    dimmedLightGreyColor: getRootVar('--dimmedLightGreyColor'),
    formBorderColor: getRootVar('--formBorderColor'),
    formSubmitBG: getRootVar('--formSubmitBG'),
    formSubmitText: getRootVar('--formSubmitText'),
    formInputColor: getRootVar('--formInputColor'),
    formInputBG: getRootVar('--formInputBG'),
    formInputBorder: getRootVar('--formInputBorder'),
    formInputErrorBorder: getRootVar('--formInputErrorBorder'),
    formInputOutline: getRootVar('--formInputOutline'),
    formInputErrorOutline: getRootVar('--formInputErrorOutline'),
    formLabelColor: getRootVar('--formLabelColor'),
    formDescColor: getRootVar('--formDescColor'),
    formLinkColor: getRootVar('--formLinkColor'),
    radioOptionBorder: getRootVar('--radioOptionBorder'),
    radioOptionSelectedBorder: getRootVar('--radioOptionSelectedBorder'),
    radioOptionBG: getRootVar('--radioOptionBG'),
    primaryButtonTextColor: getRootVar('--primaryButtonTextColor'),
    info: getRootVar('--info'),
    infoText: getRootVar('--infoText'),
    warn: getRootVar('--warn'),
    warnText: getRootVar('--warnText'),
    error: getRootVar('--error'),
    errorText: getRootVar('--errorText'),
    success: getRootVar('--success'),
    successText: getRootVar('--successText'),
    errorTextColor: getRootVar('--errorTextColor'),
    loaderColor: getRootVar('--loaderColor'),
    loaderColorFade: getRootVar('--loaderColorFade'),
};

// convenience named export
export const primaryColor = cssVars.primaryColor;
export const backgroundColor = cssVars.bgColor;
export const textColor = cssVars.textColor;
export const errorTextColor = cssVars.errorTextColor;
export const formInputBorderColor = cssVars.formInputBorder;
export const primaryColorFade = cssVars.primaryColorFade;
export const whiteColor = cssVars.whiteColor;
export const blackColor = cssVars.blackColor;
export const dimmedBlackColor = cssVars.dimmedBlackColor;
export const darkOverlayColor = cssVars.darkOverlayColor;
export const lightGreyColor = cssVars.lightGreyColor;
export const dimmedLightGreyColor = cssVars.dimmedLightGreyColor;
export const formBorderColor = cssVars.formBorderColor;
export const formSubmitBG = cssVars.formSubmitBG;
export const formSubmitText = cssVars.formSubmitText;
export const formInputColor = cssVars.formInputColor;
export const formInputBG = cssVars.formInputBG;
export const formInputErrorBorder = cssVars.formInputErrorBorder;
export const formInputOutline = cssVars.formInputOutline;
export const formInputErrorOutline = cssVars.formInputErrorOutline;
export const formLabelColor = cssVars.formLabelColor;
export const formDescColor = cssVars.formDescColor;
export const formLinkColor = cssVars.formLinkColor;
export const radioOptionBorder = cssVars.radioOptionBorder;
export const radioOptionSelectedBorder = cssVars.radioOptionSelectedBorder;
export const radioOptionBG = cssVars.radioOptionBG;
export const primaryButtonTextColor = cssVars.primaryButtonTextColor;
export const info = cssVars.info;
export const infoText = cssVars.infoText;
export const warn = cssVars.warn;
export const warnText = cssVars.warnText;
export const error = cssVars.error;
export const errorText = cssVars.errorText;
export const success = cssVars.success;
export const successText = cssVars.successText;
export const loaderColor = cssVars.loaderColor;
export const loaderColorFade = cssVars.loaderColorFade;

/**
 * Refresh CSS variable values from :root
 */
export const refreshCssVars = () => {
    Object.keys(cssVars).forEach((key) => {
        const cssName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        cssVars[key] = getRootVar(cssName);
    });
    // keep primaryColor in sync
    exports.primaryColor = cssVars.primaryColor;
};

export const cssLoaded = true;