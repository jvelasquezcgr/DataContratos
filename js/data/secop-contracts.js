// js/data/secop-contracts.js - Lógica de contratos SECOP
import { fetchContracts, fetchContractById } from './secop-api.js';
import { getDB } from '../storage/db.js';

export async function getEntities() {
  // Obtener contratos desde API
  const contracts = await fetchContracts();
  
  // Guardar en IndexedDB (opcional)
  try {
    const db = getDB();
    const tx = db.transaction('contracts', 'readwrite');
    const store = tx.objectStore('contracts');
    
    for (const contract of contracts) {
      await store.put(contract);
    }
    
    await new Promise(resolve => tx.oncomplete = resolve);
  } catch (err) {
    console.warn('[secop-contracts] No se pudo guardar en DB:', err);
  }
  
  return contracts;
}

export async function getContractById(id) {
  return fetchContractById(id);
}

export async function searchContracts(query) {
  const all = await fetchContracts();
  const lowerQuery = query.toLowerCase();
  return all.filter(c => 
    c.title.toLowerCase().includes(lowerQuery) ||
    c.entityId.toLowerCase().includes(lowerQuery)
  );
}
