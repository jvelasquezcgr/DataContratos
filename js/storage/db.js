// js/storage/db.js - IndexedDB
const DB_NAME = 'analista-contratos';
const DB_VERSION = 1;

let db = null;

export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      // Crear stores si no existen
      if (!database.objectStoreNames.contains('contracts')) {
        const store = database.createObjectStore('contracts', { keyPath: 'id' });
        store.createIndex('entityId', 'entityId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
      
      if (!database.objectStoreNames.contains('documents')) {
        const store = database.createObjectStore('documents', { keyPath: 'id' });
        store.createIndex('contractId', 'contractId', { unique: false });
      }
    };
  });
}

export function getDB() {
  if (!db) {
    throw new Error('DB no inicializada. Llamar a initDB() primero.');
  }
  return db;
}
