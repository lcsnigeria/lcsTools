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

/**
 * Format a date into a human-readable date string.
 *
 * Supports:
 *  - UNIX timestamp (seconds or milliseconds)
 *  - MySQL DATETIME string ("YYYY-MM-DD HH:MM:SS")
 *  - ISO strings
 *
 * @param {string|number} dateInput
 *   e.g. 1763078400, 1763078400000, "2025-11-14 19:34:08", "2025-11-14T19:34:08Z"
 * @param {Object} configs
 * @param {boolean} [configs.explanatory=false]
 *   If true, return human-explanatory text ("1 day ago" / "Yesterday" / "Thursday").
 * @param {'informal'|'direct'} [configs.explanatoryStyle='informal']
 *   'informal' => relative phrases ("1 day ago", "in 2 days")
 *   'direct'   => named words ("Yesterday", "Thursday", "Tomorrow")
 * @param {boolean} [configs.shortMonth=false]
 *   If true, return "15 Nov 2025" instead of "15 November 2025"
 *
 * @returns {string} formatted date
 *
 * @example
 * formatDate(1763078400) // "14 November 2025"    (assuming today = 15 Nov 2025)
 * formatDate(1763078400, { explanatory: true, explanatoryStyle: 'direct' }) // "Yesterday"
 * formatDate(1762992000, { explanatory: true, explanatoryStyle: 'direct' }) // "Thursday"
 */
function formatDate(dateInput, configs = {}) {
  const {
    explanatory = false,
    explanatoryStyle = 'informal',
    shortMonth = false
  } = configs;

  // Parse input into a Date object
  let date;
  if (typeof dateInput === 'number' || /^\d+$/.test(String(dateInput))) {
    // numeric-ish input: determine seconds vs milliseconds
    const n = Number(dateInput);
    // if it's clearly milliseconds (> 1e12) treat as ms, else seconds
    date = (n > 1e12) ? new Date(n) : new Date(n * 1000);
  } else if (typeof dateInput === 'string') {
    // MySQL DATETIME (space) -> make it ISO-ish for Date parser
    // Try to be forgiving: replace first space with 'T'
    const isoLike = dateInput.indexOf(' ') !== -1 ? dateInput.replace(' ', 'T') : dateInput;
    date = new Date(isoLike);
  } else {
    return '';
  }

  if (isNaN(date.getTime())) return '';

  const msPerDay = 24 * 60 * 60 * 1000;
  const monthFull = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  // Create UTC midnight values for both target date and today using local Y/M/D
  const targetUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const now = new Date();
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  // daysFromToday: 0 => today, 1 => yesterday, 2 => 2 days ago, -1 => tomorrow
  const daysFromToday = Math.round((todayUTC - targetUTC) / msPerDay);

  // Formatter for fallback full date
  function fullDateString(d) {
    const day = d.getDate();
    const month = (shortMonth ? monthShort : monthFull)[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }

  if (explanatory) {
    // handle same day
    if (daysFromToday === 0) {
      return explanatoryStyle === 'direct' ? 'Today' : 'today';
    }

    // past dates
    if (daysFromToday > 0) {
      if (daysFromToday === 1) {
        return explanatoryStyle === 'direct' ? 'Yesterday' : '1 day ago';
      }
      if (daysFromToday < 7) {
        return explanatoryStyle === 'direct'
          ? weekdays[date.getDay()]                    // "Thursday"
          : `${daysFromToday} days ago`;              // "2 days ago"
      }
      // older than a week -> fallback to full date
      return fullDateString(date);
    }

    // future dates (daysFromToday < 0)
    const absDays = Math.abs(daysFromToday);
    if (absDays === 1) {
      return explanatoryStyle === 'direct' ? 'Tomorrow' : `in 1 day`;
    }
    if (absDays < 7) {
      return explanatoryStyle === 'direct'
        ? weekdays[date.getDay()]                    // e.g. "Monday"
        : `in ${absDays} days`;
    }
    // far future -> full date
    return fullDateString(date);
  }

  // Non-explanatory: simple full date
  return fullDateString(date);
}