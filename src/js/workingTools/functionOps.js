/**
 * Executes a function multiple times with a delay before the first execution
 * and a fixed interval (in milliseconds) between subsequent executions.
 *
 * This is useful for scheduled or repeated tasks like polling APIs, 
 * triggering UI effects, or running simulations in timed loops.
 *
 * @function executeFunction
 * 
 * @param {Function|string} func                    The function to be executed, or its name as a string
 *                                                   (resolved from the global/window scope).
 * @param {number}   [startExecution=0]             Time in seconds to wait before the first execution.
 *                                                   If 0 or less, the function is executed immediately.
 * @param {number}   [howManyExecution=1]            Total number of times to execute the function.
 *                                                   Must be a positive integer.
 * @param {number}   [executionInterval=1000]        Interval **in milliseconds** between each execution after the first.
 *                                                   Only relevant if `howManyExecution > 1`.
 * @param {...*}     args                            Any arguments to pass to the function when it is called.
 *
 * @throws {TypeError} If the first argument is not a function or a valid function name string.
 *
 * @example
 * // Example 1: Pass a function reference directly
 * executeFunction(console.log, 0, 1, 1000, 'Hello, World!');
 *
 * @example
 * // Example 2: Pass a function name as a string (must exist in global scope)
 * function greet(name) { console.log(`Hello, ${name}!`); }
 * executeFunction('greet', 0, 1, 1000, 'Alice');
 *
 * @example
 * // Example 3: Execute 5 times, starting after 2 seconds, every 3000ms
 * executeFunction(
 *   (msg, id) => console.log(`Run ${id}: ${msg}`),
 *   2,
 *   5,
 *   3000,
 *   'Scheduled execution',
 *   101
 * );
 */
export function executeFunction(
  func,
  startExecution = 0,
  howManyExecution = 1,
  executionInterval = 1000,
  ...args
) {
  // Resolve string to a function via global scope
  if (typeof func === 'string') {
    const globalScope = typeof window !== 'undefined' ? window : globalThis;
    const resolved = globalScope[func];
    if (typeof resolved !== 'function') {
      throw new TypeError(`[executeFunction] No function found in global scope with name: "${func}"`);
    }
    func = resolved;
  }

  if (typeof func !== 'function') {
    throw new TypeError('[executeFunction] First argument must be a function or a function name string');
  }

  if (howManyExecution <= 0) {
    return;
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

/**
 * Checks whether a function with the given name exists in the global scope.
 *
 * Resolves against `window` in browser environments and `globalThis` in
 * Node.js or other modern runtimes.
 *
 * @function isFunctionExists
 *
 * @param {string} name  The name of the function to look up in the global scope.
 *
 * @returns {boolean} `true` if a function with that name exists globally, `false` otherwise.
 *
 * @throws {TypeError} If the argument is not a string.
 *
 * @example
 * // Example 1: Check for a globally defined function
 * function greet(name) { console.log(`Hello, ${name}!`); }
 * isFunctionExists('greet'); // true
 *
 * @example
 * // Example 2: Check for a built-in global
 * isFunctionExists('parseInt');  // true
 * isFunctionExists('fetch');     // true (in supported environments)
 *
 * @example
 * // Example 3: Non-existent or non-function global
 * isFunctionExists('doesNotExist'); // false
 * isFunctionExists('Math');         // false — Math is an object, not a function
 *
 * @example
 * // Example 4: Guard before calling executeFunction with a string
 * if (isFunctionExists('myCallback')) {
 *   executeFunction('myCallback', 2, 3, 1000, 'arg1');
 * } else {
 *   console.warn('myCallback is not defined globally.');
 * }
 */
export function isFunctionExists(name) {
  if (typeof name !== 'string') {
    throw new TypeError('[isFunctionExists] Argument must be a string');
  }

  const globalScope = typeof window !== 'undefined' ? window : globalThis;
  return typeof globalScope[name] === 'function';
}