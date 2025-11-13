/**
 * Format a date/time input as a human-readable time string.
 *
 * Accepts either:
 * - a UNIX timestamp in seconds (number), or a numeric string of digits (treated as seconds),
 * - a datetime string (commonly MySQL "YYYY-MM-DD HH:MM:SS" — a single space is replaced with "T" and passed to the JS Date constructor).
 *
 * Returns an empty string for unsupported types or unparseable/invalid dates.
 *
 * Notes:
 * - Numeric inputs are treated as seconds since the UNIX epoch (NOT milliseconds).
 * - The datetime string is parsed by the JavaScript Date constructor after replacing the first space with 'T'.
 *   How the Date constructor interprets that string (local vs. UTC) depends on the runtime/environment and ECMAScript parsing rules.
 * - Minutes are always zero-padded to two digits.
 * - In 24-hour mode the hour is zero-padded to two digits (e.g. "09:05"); in 12-hour mode the hour is formatted as 1–12 (no leading zero) with "AM"/"PM".
 * - Midnight and noon behavior: 0 hours => "12:MM AM", 12 hours => "12:MM PM".
 *
 * @param {number|string} dateInput - UNIX timestamp in seconds (number) or a string. If string is all digits it is treated as a seconds timestamp;
 *                                    otherwise it is treated as a datetime string (e.g. "YYYY-MM-DD HH:MM:SS") and parsed by Date after replacing the space with 'T'.
 * @param {boolean} [use24Hour=false] - If true, return time in 24-hour "HH:mm" format; otherwise return 12-hour "h:mm AM/PM".
 * @returns {string} The formatted time, or an empty string for invalid/unsupported input.
 *
 * @example
 * // UNIX timestamp (seconds)
 * console.log(formatTime(1689414300));         // e.g. "1:45 PM"  (12-hour default; actual output may vary with local timezone)
 * console.log(formatTime(1689414300, true));   // e.g. "13:45"
 *
 * @example
 * // Numeric string timestamp (seconds)
 * console.log(formatTime('1689414300'));       // same as above
 *
 * @example
 * // MySQL datetime string (space replaced with 'T' before parsing)
 * console.log(formatTime('2023-07-15 09:05:00'));      // "9:05 AM"
 * console.log(formatTime('2023-07-15 21:05:00', true)); // "21:05"
 *
 * @example
 * // Invalid or unsupported inputs
 * console.log(formatTime('not-a-date'));        // ""
 * console.log(formatTime({}));                  // ""
 * console.log(formatTime(new Date()));          // ""  // Date objects are not accepted by this function
 *
 * @see Date — parsing of datetime strings depends on the JavaScript runtime's Date parsing behavior.
 */
export function formatTime(dateInput, use24Hour = false) {
    let date;

    if (typeof dateInput === 'number' || /^\d+$/.test(dateInput)) {
        // Treat as UNIX timestamp (seconds)
        date = new Date(Number(dateInput) * 1000);
    } else if (typeof dateInput === 'string') {
        // MySQL datetime string
        date = new Date(dateInput.replace(' ', 'T'));
    } else {
        return '';
    }

    if (isNaN(date)) return '';

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (use24Hour) {
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    } else {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    }
}