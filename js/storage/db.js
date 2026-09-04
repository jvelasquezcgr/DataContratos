const DB_NAME = 'analista-contratos';
const DB_VERSION = 1;

export const STORES = Object.freeze({
  contractCases: 'contractCases', documents: 'documents', documentBlobs: 'documentBlobs', pages: 'pages',
  clauses: 'clauses', obligations: 'obligations', facts: 'facts', evidenceLinks: 'evidenceLinks',
  alerts: 'alerts', findings: 'findings', searchIndexes: 'searchIndexes', userCorrections: 'userCorrections'
});

let connectionPromise;

function ensureStore(db, name, options = { keyPath: 'id' }) {
  return db.objectStoreNames.contains(name) ? null : db.createObjectStore(name, options);
}

export function openDatabase() {
  if (connectionPromise) return connectionPromise;
  connectionPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onblocked = () => console.warn('IndexedDB bloqueada por otra pestana.');
    request.onupgradeneeded = () => {
      const db = request.result;
      const cases = ensureStore(db, STORES.contractCases);
      if (cases) cases.createIndex('byContractKey', 'contractKey', { unique: true });
      const docs = ensureStore(db, STORES.documents);
      if (docs) { docs.createIndex('byCase', 'contractCaseId'); docs.createIndex('byCaseOrigin', ['contractCaseId', 'origin']); }
      ensureStore(db, STORES.documentBlobs);
      const pages = ensureStore(db, STORES.pages);
      if (pages) { pages.createIndex('byDocument', 'documentId'); pages.createIndex('byCase', 'contractCaseId'); }
      for (const name of [STORES.clauses, STORES.obligations, STORES.facts, STORES.evidenceLinks, STORES.alerts, STORES.findings]) {
        const store = ensureStore(db, name);
        if (store) store.createIndex('byCase', 'contractCaseId');
      }
      ensureStore(db, STORES.searchIndexes);
      ensureStore(db, STORES.userCorrections);
    };
    request.onsuccess = () => { const db = request.result; db.onversionchange = () => db.close(); resolve(db); };
  });
  return connectionPromise;
}

export async function withStore(storeName, mode, operation) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    let result;
    try { result = operation(tx.objectStore(storeName), tx); }
    catch (error) { tx.abort(); reject(error); return; }
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Transaccion cancelada'));
  });
}

export function req(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
