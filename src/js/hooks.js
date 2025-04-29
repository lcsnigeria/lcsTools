/**
 * lcsHooks provides an action hook system.
 * It allows registering, triggering, checking, and removing callbacks for named hooks,
 * with optional execution priorities to control order.
 *
 * This system is useful for creating extensible and modular JavaScript applications.
 *
 * @namespace lcsHooks
 *
 * @example
 * // Import the hooks instance
 * import { hooks } from './js/hooks.js';
 *
 * // Define a callback function
 * function myCallback(data) {
 *   console.log('Hook triggered with data:', data);
 * }
 *
 * // Add the callback to a hook named 'myHook' with default priority
 * hooks.addAction('myHook', myCallback);
 *
 * // Trigger the 'myHook' hook, passing data to the callbacks
 * hooks.doAction('myHook', { key: 'value' });
 * // Output: Hook triggered with data: { key: 'value' }
 *
 * // Check if the callback is registered to 'myHook'
 * const isRegistered = hooks.hasAction('myHook', myCallback);
 * console.log(isRegistered); // Output: true
 *
 * // Remove the callback from 'myHook'
 * hooks.removeAction('myHook', myCallback);
 *
 * // Verify the callback has been removed
 * const isStillRegistered = hooks.hasAction('myHook', myCallback);
 * console.log(isStillRegistered); // Output: false
 */
class lcsHooks {
    constructor() {
      /**
       * Internal map of hooks to arrays of callback objects.
       * @private
       * @type {Map<string, Array<{cb: Function, priority: number}>>}
       */
      this._hooks = new Map();
    }
  
    /**
     * Registers a callback to execute when a given hook is triggered.
     *
     * @param {string} hook - The name of the hook.
     * @param {Function} cb - The callback function to register.
     * @param {number} [priority=10] - Execution priority (lower numbers run earlier).
     * @throws {TypeError} If cb is not a function.
     *
     * @example
     * import { hooks } from 'your-lib/hooks.js';
     * hooks.addAction('init', () => console.log('init fired'), 5);
     */
    addAction(hook, cb, priority = 10) {
      if (typeof cb !== 'function') {
        throw new TypeError('Callback must be a function');
      }
      const list = this._hooks.get(hook) || [];
      list.push({ cb, priority });
      // Sort callbacks by ascending priority
      list.sort((a, b) => a.priority - b.priority);
      this._hooks.set(hook, list);
    }
  
    /**
     * Executes all callbacks attached to a specific hook, in order of priority.
     *
     * @param {string} hook - The name of the hook to trigger.
     * @param {...any} args - Arguments to pass to each callback.
     *
     * @example
     * hooks.doAction('init', window, document);
     */
    doAction(hook, ...args) {
      const list = this._hooks.get(hook) || [];
      for (const { cb } of list) {
        try {
          cb(...args);
        } catch (err) {
          console.error(`Error in hook "${hook}":`, err);
        }
      }
    }
  
    /**
     * Determines if a given callback is registered on a hook.
     *
     * @param {string} hook - The hook name to check.
     * @param {Function} cb - The callback to look for.
     * @returns {boolean} True if the callback is registered, false otherwise.
     *
     * @example
     * const myListener = () => {};
     * hooks.addAction('save', myListener);
     * console.log(hooks.hasAction('save', myListener)); // true
     */
    hasAction(hook, cb) {
      const list = this._hooks.get(hook);
      if (!list) return false;
      return list.some(item => item.cb === cb);
    }
  
    /**
     * Removes a specific callback from a hook. If no callbacks remain, the hook is deleted.
     *
     * @param {string} hook - The name of the hook.
     * @param {Function} cb - The callback function to remove.
     *
     * @example
     * hooks.removeAction('save', myListener);
     */
    removeAction(hook, cb) {
      const list = this._hooks.get(hook);
      if (!list) return;
      const filtered = list.filter(item => item.cb !== cb);
      if (filtered.length) {
        this._hooks.set(hook, filtered);
      } else {
        this._hooks.delete(hook);
      }
    }
}
  
/**
 * A singleton instance of lcsHooks for easy use throughout the application.
 *
 * @module lcsHooksInstance
 */
export const hooks = new lcsHooks();
export default lcsHooks;