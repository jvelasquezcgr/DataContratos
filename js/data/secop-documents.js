// js/data/secop-documents.js - Lógica de documentos SECOP
import { fetchDocuments } from './secop-api.js';
import { getDB } from '../storage/db.js';

export async function getDocumentsByContract(contractId) {
  const docs = await fetchDocuments(contractId);
  
  // Guardar en IndexedDB (opcional)
  try {
    const db = getDB();
    const tx = db.transaction('documents', 'readwrite');
    const store = tx.objectStore('documents');
    
    for (const doc of docs) {
      await store.put(doc);
    }
    
    await new Promise(resolve => tx.oncomplete = resolve);
  } catch (err) {
    console.warn('[secop-documents] No se pudo guardar en DB:', err);
  }
  
  return docs;
}

export async function getDocumentById(id) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('documents', 'readonly');
    const store = tx.objectStore('documents');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
