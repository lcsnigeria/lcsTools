/**
 * Executes a function multiple times with a delay before the first execution
 * and a fixed interval (in milliseconds) between subsequent executions.
 *
 * This is useful for scheduled or repeated tasks like polling APIs, 
 * triggering UI effects, or running simulations in timed loops.
 *
 * @function executeFunction
 * 
 * @param {Function} func                    The function to be executed. Must be a valid JavaScript function.
 * @param {number}   [startExecution=0]      Time in seconds to wait before the first execution.
 *                                           If 0 or less, the function is executed immediately.
 * @param {number}   [howManyExecution=1]    Total number of times to execute the function.
 *                                           Must be a positive integer.
 * @param {number}   [executionInterval=1000] Interval **in milliseconds** between each execution after the first.
 *                                           Only relevant if `howManyExecution > 1`.
 * @param {...*}     args                    Any arguments to pass to the function when it is called.
 *                                           You can pass multiple values.
 *
 * @throws {TypeError} If the first argument is not a function.
 *
 * @example
 * // Example 1: Execute a function immediately, once
 * executeFunction(console.log, 0, 1, 1000, 'Hello, World!');
 *
 * @example
 * // Example 2: Execute a function 5 times, starting after 2 seconds, every 3000 ms (3 seconds)
 * executeFunction(
 *   (msg, id) => console.log(`Run ${id}: ${msg}`),
 *   2,        // delay before first run (2 seconds)
 *   5,        // run 5 times
 *   3000,     // 3 seconds between runs (in ms)
 *   'Scheduled execution', // argument 1
 *   101                     // argument 2
 * );
 */
export function executeFunction(
  func,
  startExecution = 0,
  howManyExecution = 1,
  executionInterval = 1000,
  ...args
) {
  if (typeof func !== 'function') {
    throw new TypeError('First argument must be a function');
  }
  if (howManyExecution <= 0) {
    return; // Nothing to execute
  }

  let count = 0;
  const startMs = startExecution * 1000;

  const scheduleInterval = () => {
    const id = setInterval(() => {
      func(...args);
      count++;
      if (count >= howManyExecution) {
        clearInterval(id);
      }
    }, executionInterval);
  };

  const runOnceThenMaybeInterval = () => {
    func(...args);
    count++;
    if (count < howManyExecution) {
      scheduleInterval();
    }
  };

  if (startMs > 0) {
    setTimeout(runOnceThenMaybeInterval, startMs);
  } else {
    runOnceThenMaybeInterval();
  }
}