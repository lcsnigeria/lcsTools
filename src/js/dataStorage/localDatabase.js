/**
 * @typedef {IDBDatabase} IDBDatabase
 */

/**
 * @typedef {Object} LCSError
 * @property {string} message - The error message.
 */

/**
 * A cache to store initialized IndexedDB database instances.
 * @type {Object<string, IDBDatabase>}
 */
const lcsDBCache = {};

/**
 * Initializes and returns an IndexedDB database. If the database with the given name
 * already exists in the cache, it returns the cached instance. Otherwise, it opens
 * a new connection to the database and creates the 'store' object store if it doesn't exist.
 *
 * @async
 * @param {string} [dbName='lcsLocalDatabase'] - The name of the IndexedDB database.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the IDBDatabase instance.
 * @throws {LCSError} If the database fails to open.
 *
 * @example
 * (async function() {
 *   try {
 *     const db = await initializeLocalDatabase('myDB');
 *     console.log('Database initialized:', db.name);
 *   } catch (err) {
 *     console.error(err);
 *   }
 * })();
 */
export async function initializeLocalDatabase(dbName = 'lcsLocalDatabase') {
  if (lcsDBCache[dbName]) return lcsDBCache[dbName];

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = function (e) {
      /** @type {IDBDatabase} */
      const db = e.target.result;
      if (!db.objectStoreNames.contains('store')) {
        db.createObjectStore('store');
      }
    };

    request.onsuccess = function (e) {
      /** @type {IDBDatabase} */
      const db = e.target.result;
      // Close and remove cache if version changes elsewhere (upgrade/delete)
      db.onversionchange = () => {
        db.close();
        delete lcsDBCache[dbName];
        console.warn(`Database "${dbName}" closed due to version change elsewhere.`);
      };
      lcsDBCache[dbName] = db;
      resolve(db);
    };

    request.onerror = function () {
      reject({ message: `Failed to open database: ${dbName}` });
    };
  });
}

/**
 * Stores data in the 'store' object store of the specified IndexedDB database.
 * It checks if the key already exists before attempting to store the data.
 *
 * @async
 * @param {*} key - The key to store the data under.
 * @param {*} value - The data to be stored.
 * @param {string} [dbName='lcsLocalDatabase'] - The name of the IndexedDB database.
 * @returns {Promise<boolean>} A promise that resolves with true if the data is stored successfully.
 * @throws {LCSError} If the key already exists or if storing the data fails.
 *
 * @example
 * (async function() {
 *   try {
 *     const success = await storeLocalDatabaseData('user_1', { name: 'Alice' }, 'myDB');
 *     console.log('Stored:', success);
 *   } catch (err) {
 *     console.error(err.message);
 *   }
 * })();
 */
export async function storeLocalDatabaseData(key, value, dbName = 'lcsLocalDatabase') {
  const db = await initializeLocalDatabase(dbName);

  return new Promise((resolve, reject) => {
    const tx = db.transaction('store', 'readwrite');
    const store = tx.objectStore('store');

    tx.oncomplete = () => resolve(true);
    tx.onerror    = () => reject({ message: tx.error?.message || `Transaction failed for key: ${key}` });
    tx.onabort    = () => reject({ message: tx.error?.message || `Transaction aborted for key: ${key}` });

    const getRequest = store.get(key);
    getRequest.onsuccess = (e) => {
      if (e.target.result !== undefined) {
        tx.abort(); // triggers onabort
      } else {
        store.add(value, key);
      }
    };
    getRequest.onerror = () => tx.abort();
  });
}

/**
 * Retrieves data from the 'store' object store of the specified IndexedDB database.
 *
 * @async
 * @param {*} key - The key of the data to retrieve.
 * @param {string} [dbName='lcsLocalDatabase'] - The name of the IndexedDB database.
 * @returns {Promise<*>} A promise that resolves with the retrieved data, or undefined if the key is not found.
 * @throws {LCSError} If retrieving the data fails.
 *
 * @example
 * (async function() {
 *   try {
 *     const data = await getLocalDatabaseData('user_1', 'myDB');
 *     console.log('Retrieved:', data);
 *   } catch (err) {
 *     console.error(err.message);
 *   }
 * })();
 */
export async function getLocalDatabaseData(key, dbName = 'lcsLocalDatabase') {
  const db = await initializeLocalDatabase(dbName);

  return new Promise((resolve, reject) => {
    const tx = db.transaction('store', 'readonly');
    const store = tx.objectStore('store');
    const getRequest = store.get(key);

    getRequest.onsuccess = () => resolve(getRequest.result);
    getRequest.onerror  = () => reject({ message: `Failed to get key: ${key}` });
  });
}

/**
 * Updates existing data in the 'store' object store of the specified IndexedDB database.
 *
 * @async
 * @param {*} key - The key of the data to update.
 * @param {*} value - The new value for the data.
 * @param {string} [dbName='lcsLocalDatabase'] - The name of the IndexedDB database.
 * @returns {Promise<boolean>} A promise that resolves with true if the data is updated successfully.
 * @throws {LCSError} If updating the data fails.
 *
 * @example
 * (async function() {
 *   try {
 *     const updated = await updateLocalDatabaseData('user_1', { name: 'Bob' }, 'myDB');
 *     console.log('Updated:', updated);
 *   } catch (err) {
 *     console.error(err.message);
 *   }
 * })();
 */
export async function updateLocalDatabaseData(key, value, dbName = 'lcsLocalDatabase') {
  const db = await initializeLocalDatabase(dbName);

  return new Promise((resolve, reject) => {
    const tx = db.transaction('store', 'readwrite');
    const store = tx.objectStore('store');

    tx.oncomplete = () => resolve(true);
    tx.onerror    = () => reject({ message: tx.error?.message || `Transaction failed to update key: ${key}` });
    tx.onabort    = () => reject({ message: tx.error?.message || `Transaction aborted for key: ${key}` });

    store.put(value, key);
  });
}

/**
 * Deletes data from the 'store' object store of the specified IndexedDB database.
 *
 * @async
 * @param {*} key - The key of the data to delete.
 * @param {string} [dbName='lcsLocalDatabase'] - The name of the IndexedDB database.
 * @returns {Promise<boolean>} A promise that resolves with true if the data is deleted successfully.
 * @throws {LCSError} If deleting the data fails.
 *
 * @example
 * (async function() {
 *   try {
 *     const deleted = await deleteLocalDatabaseData('user_1', 'myDB');
 *     console.log('Deleted:', deleted);
 *   } catch (err) {
 *     console.error(err.message);
 *   }
 * })();
 */
export async function deleteLocalDatabaseData(key, dbName = 'lcsLocalDatabase') {
  const db = await initializeLocalDatabase(dbName);

  return new Promise((resolve, reject) => {
    const tx = db.transaction('store', 'readwrite');
    const store = tx.objectStore('store');

    tx.oncomplete = () => resolve(true);
    tx.onerror    = () => reject({ message: tx.error?.message || `Transaction failed to delete key: ${key}` });
    tx.onabort    = () => reject({ message: tx.error?.message || `Transaction aborted for key: ${key}` });

    store.delete(key);
  });
}

/**
 * Clears all data from the 'store' object store of the specified IndexedDB database.
 * Optionally, it can also delete the entire database.
 *
 * @async
 * @param {string} [dbName='lcsLocalDatabase'] - The name of the IndexedDB database.
 * @param {boolean} [alsoDeleteDbName=false] - If true, the entire database will be deleted.
 * @returns {Promise<boolean>} A promise that resolves with true if the operation is successful.
 * @throws {LCSError} If clearing the store or deleting the database fails.
 *
 * @example
 * // Clear just the object store:
 * await clearLocalDatabase('myDB');
 *
 * // Delete entire database:
 * await clearLocalDatabase('myDB', true);
 */
export async function clearLocalDatabase(dbName = 'lcsLocalDatabase', alsoDeleteDbName = false) {
  if (alsoDeleteDbName) {
    if (lcsDBCache[dbName]) {
      lcsDBCache[dbName].close();
    }
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(dbName);

      deleteRequest.onblocked = () => {
        console.warn(`Deletion of "${dbName}" is blocked by another open connection.`);
      };
      deleteRequest.onsuccess = () => {
        delete lcsDBCache[dbName];
        resolve(true);
      };
      deleteRequest.onerror = () => reject({ message: `Failed to delete database: ${dbName}` });
    });
  } else {
    const db = await initializeLocalDatabase(dbName);

    return new Promise((resolve, reject) => {
      const tx = db.transaction('store', 'readwrite');
      const store = tx.objectStore('store');

      tx.oncomplete = () => resolve(true);
      tx.onerror    = () => reject({ message: tx.error?.message || `Failed to clear store in: ${dbName}` });
      tx.onabort    = () => reject({ message: tx.error?.message || `Clearing aborted for: ${dbName}` });

      store.clear();
    });
  }
}

/**
 * Indicates that the lcs local database module is available.
 * @constant {boolean}
 */
export const lcsLocalDatabase = true;