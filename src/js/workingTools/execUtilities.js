/**
 * Delays execution for a given number of seconds.
 *
 * @param {number} timeInSeconds - The amount of time to delay, in seconds.
 * @returns {Promise<void>} A Promise that resolves after the specified time.
 *
 * @example
 * // Delays for 2 seconds before continuing
 * async function example() {
 *     console.log("Start delay...");
 *     await delay(2);
 *     console.log("Finished delay.");
 * }
 * 
 * example();
 */
export function delay(timeInSeconds) {
    return new Promise(resolve => setTimeout(resolve, timeInSeconds * 1000));
}