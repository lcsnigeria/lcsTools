import './locationTools.js';
import { lcsGetCurrentLocation } from './locationTools.js';
import './formTools/OTPField.js';
import './formTools/radioOptionSelection.js';
import './formTools/showHidePassword.js';

// Exporting for global access via window.lcsTools
module.exports = {
    lcsGetCurrentLocation
};