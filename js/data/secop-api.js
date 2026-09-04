// js/data/secop-api.js - API SECOP (mock para desarrollo)
import CONFIG from './config.js';

// Datos mock para desarrollo
const MOCK_CONTRACTS = [
  { id: '1', entityId: 'ENT001', title: 'Contrato de Servicios 2024', status: 'active', value: 50000000 },
  { id: '2', entityId: 'ENT002', title: 'Suministro de Equipos', status: 'pending', value: 25000000 },
  { id: '3', entityId: 'ENT001', title: 'Consultoría Técnica', status: 'active', value: 15000000 },
];

export async function fetchContracts(entityId = null) {
  // Simular llamada API
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (entityId) {
    return MOCK_CONTRACTS.filter(c => c.entityId === entityId);
  }
  
  return MOCK_CONTRACTS;
}

export async function fetchContractById(id) {
  await new Promise(resolve => setTimeout(resolve, 200));
  return MOCK_CONTRACTS.find(c => c.id === id);
}

export async function fetchDocuments(contractId) {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [
    { id: 'DOC1', contractId, name: 'Documento 1.pdf', type: 'pdf' },
    { id: 'DOC2', contractId, name: 'Documento 2.xlsx', type: 'xlsx' },
  ];
}
