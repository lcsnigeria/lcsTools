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
      lcsDBCache[dbName] = db;
      resolve(db);
    };

    request.onerror = function () {
      reject(`Failed to open database: ${dbName}`);
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
 */
export async function storeLocalDatabaseData(key, value, dbName = 'lcsLocalDatabase') {
  const db = await initializeLocalDatabase(dbName);

  return new Promise((resolve, reject) => {
    const tx = db.transaction('store', 'readwrite');
    const store = tx.objectStore('store');

    const getRequest = store.get(key);
    getRequest.onsuccess = () => {
      if (getRequest.result !== undefined) {
        reject(`Key "${key}" already exists.`);
      } else {
        const addRequest = store.add(value, key);
        addRequest.onsuccess = () => resolve(true);
        addRequest.onerror = () => reject(`Failed to store key: ${key}`);
      }
    };
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
 */
export async function getLocalDatabaseData(key, dbName = 'lcsLocalDatabase') {
  const db = await initializeLocalDatabase(dbName);

  return new Promise((resolve, reject) => {
    const tx = db.transaction('store', 'readonly');
    const store = tx.objectStore('store');

    const getRequest = store.get(key);
    getRequest.onsuccess = () => resolve(getRequest.result);
    getRequest.onerror = () => reject(`Failed to get key: ${key}`);
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
 */
export async function updateLocalDatabaseData(key, value, dbName = 'lcsLocalDatabase') {
  const db = await initializeLocalDatabase(dbName);

  return new Promise((resolve, reject) => {
    const tx = db.transaction('store', 'readwrite');
    const store = tx.objectStore('store');
    const putRequest = store.put(value, key);
    putRequest.onsuccess = () => resolve(true);
    putRequest.onerror = () => reject(`Failed to update key: ${key}`);
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
 */
export async function deleteLocalDatabaseData(key, dbName = 'lcsLocalDatabase') {
  const db = await initializeLocalDatabase(dbName);

  return new Promise((resolve, reject) => {
    const tx = db.transaction('store', 'readwrite');
    const store = tx.objectStore('store');
    const deleteRequest = store.delete(key);
    deleteRequest.onsuccess = () => resolve(true);
    deleteRequest.onerror = () => reject(`Failed to delete key: ${key}`);
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
 */
export async function clearLocalDatabase(dbName = 'lcsLocalDatabase', alsoDeleteDbName = false) {
  if (alsoDeleteDbName) {
    if (lcsDBCache[dbName]) {
      lcsDBCache[dbName].close();
      delete lcsDBCache[dbName];
    }
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      deleteRequest.onsuccess = () => resolve(true);
      deleteRequest.onerror = () => reject(`Failed to delete database: ${dbName}`);
    });
  } else {
    const db = await initializeLocalDatabase(dbName);

    return new Promise((resolve, reject) => {
      const tx = db.transaction('store', 'readwrite');
      const store = tx.objectStore('store');
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve(true);
      clearRequest.onerror = () => reject(`Failed to clear store in: ${dbName}`);
    });
  }
}

export const lcsLocalDatabase = true;