/**
 * Format a phone number string into a readable international format.
 *
 * @param {string} value - Raw phone number string (digits and symbols allowed).
 * @param {string} [pattern='+$1 ($2) $3-$4'] - Optional output pattern for complete numbers.
 * @returns {string} Formatted phone number string.
 *
 * @example
 * // --- Default formatting ---
 * formatPhoneNumber('2348031234567');
 * // Returns: "+234 (803) 123-4567"
 *
 * @example
 * // --- Custom pattern ---
 * formatPhoneNumber('2348031234567', '+$1-$2-$3-$4');
 * // Returns: "+234-803-123-4567"
 *
 * @example
 * // --- Incomplete number ---
 * formatPhoneNumber('+2348');
 * // Returns: "+2348"   (keeps single '+', no double)
 */
export function formatPhoneNumber(value, pattern = '+$1 ($2) $3-$4') {
    if (!value) return '';

    // Preserve if starts with '+' and extract digits for formatting
    const hasPlus = value.trim().startsWith('+');
    let digits = value.replace(/\D/g, '');

    // Only format if there are enough digits
    if (digits.length >= 10) {
        return digits.replace(/(\d{1,3})(\d{3})(\d{3})(\d{0,4})/, pattern).trim();
    }

    // Fallback for incomplete inputs — add '+' only if not already present
    return (hasPlus ? '+' : '+') + digits.replace(/^\+/, '');
}